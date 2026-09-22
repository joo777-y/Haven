# Phase 6 — Supabase Security & Storage Architecture Specification

**Status:** Completed (Migration & Types Generated Locally)  
**Author:** HAVEN Engineering Team  
**Version:** 1.3 (Implemented Locally)  
**Target Schema:** HAVEN Schema v1.0 (9 Core Tables)

---

## 1. Executive Summary & Objectives

Phase 6 defines the authorization model, Row Level Security (RLS) policies, database security views/functions, and Supabase Storage security architecture for the HAVEN platform.

### Core Security Guarantees
1. **Zero Uncontrolled Anon Access**: Public access is strictly confined to published real estate listings, active property media, and approved public agent profiles.
2. **Profile & Contact Privacy**: Anonymous and regular users cannot browse private user profiles, phone numbers, bios, or agent license numbers.
3. **Strict Identity & Ownership Verification**: RLS enforces cryptographic identity (`auth.uid()`) across all relational hierarchies without trusting client-provided foreign keys.
4. **Relational Integrity on Mutations**:
   - Inquiries verify that the referenced property is `published` and that `agent_id` matches the true property owner.
   - Favorites and Collections verify that the saved property is `published`.
5. **Deep Cascaded Verification**: Child tables (`property_images`, `property_features`, `collection_properties`, `inquiries`) verify authorization through their true root entity rather than intermediate client-supplied foreign keys.
6. **Encapsulated Inquiry Status Updates**: Direct table-level `UPDATE` on `inquiries` is completely disabled. Status modifications are encapsulated in a secure PostgreSQL RPC function (`update_inquiry_status`).
7. **Storage Authorization via Entity Paths**: Storage buckets enforce path-based authorization mirroring database-level entity ownership.

---

## 2. Final RLS Access Matrix

| Table | Operation | Public / Anonymous (`anon`) | Authenticated Regular User | Authenticated Agent | Ownership & Access Predicate |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`profiles`** | **SELECT** | **Denied** | **Own Profile Only** | **Own Profile Only** | `id = auth.uid()`. Public profile data is accessed exclusively via public agent interface. |
| | **INSERT** | **Denied** | **Self Only** | **Self Only** | Handled automatically by `auth.users` signup trigger, or fallback `id = auth.uid()`. |
| | **UPDATE** | **Denied** | **Self Only** | **Self Only** | `id = auth.uid()`. Users/agents can only edit their own profile. |
| | **DELETE** | **Denied** | **Denied** | **Denied** | Account deletion governed by auth management or soft-delete. |
| **`agents`** | **SELECT** | **Denied (Raw Table)** | **Denied (Raw Table)** | **Full Self (`profile_id = auth.uid()`)** | Raw `agents` table is restricted. Public only accesses safe public fields via `agents_public` view. |
| | **INSERT** | **Denied** | **Self-Service Registration** | **Self-Service Registration** | `profile_id = auth.uid()`. Any authenticated user can register as an agent. |
| | **UPDATE** | **Denied** | **Denied** | **Self Only** | `profile_id = auth.uid()`. Agents can only update their own agent record. |
| | **DELETE** | **Denied** | **Denied** | **Denied** | Restricted to prevent orphaned properties and inquiry history. |
| **`properties`** | **SELECT** | **Published Only** | **Published Only** | **Published + Own Properties** | Public/Users: `status = 'published'`.<br>Agents: `status = 'published' OR agent_id IN (SELECT id FROM agents WHERE profile_id = auth.uid())`. |
| | **INSERT** | **Denied** | **Denied** | **Own Properties** | `agent_id IN (SELECT id FROM agents WHERE profile_id = auth.uid())`. |
| | **UPDATE** | **Denied** | **Denied** | **Own Properties** | `agent_id IN (SELECT id FROM agents WHERE profile_id = auth.uid())`. |
| | **DELETE** | **Denied** | **Denied** | **Own Properties** | `agent_id IN (SELECT id FROM agents WHERE profile_id = auth.uid())`. |
| **`property_images`** | **SELECT** | **Published Properties** | **Published Properties** | **Published + Own Property Images** | Public/Users: Parent property `status = 'published'`.<br>Agents: Parent property `status = 'published'` OR agent owns parent property. |
| | **INSERT** | **Denied** | **Denied** | **Own Properties** | Parent property owned by agent: `property_id IN (SELECT p.id FROM properties p JOIN agents a ON p.agent_id = a.id WHERE a.profile_id = auth.uid())`. |
| | **UPDATE** | **Denied** | **Denied** | **Own Properties** | Parent property owned by agent. |
| | **DELETE** | **Denied** | **Denied** | **Own Properties** | Parent property owned by agent. |
| **`property_features`** | **SELECT** | **Published Properties** | **Published Properties** | **Published + Own Property Features** | Public/Users: Parent property `status = 'published'`.<br>Agents: Parent property `status = 'published'` OR agent owns parent property. |
| | **INSERT** | **Denied** | **Denied** | **Own Properties** | Parent property owned by agent: `property_id IN (SELECT p.id FROM properties p JOIN agents a ON p.agent_id = a.id WHERE a.profile_id = auth.uid())`. |
| | **UPDATE** | **Denied** | **Denied** | **Own Properties** | Parent property owned by agent. |
| | **DELETE** | **Denied** | **Denied** | **Own Properties** | Parent property owned by agent. |
| **`favorites`** | **SELECT** | **Denied** | **Own Favorites** | **Own Favorites** | `user_id = auth.uid()`. |
| | **INSERT** | **Denied** | **Own Favorites (Published Only)** | **Own Favorites (Published Only)** | `user_id = auth.uid() AND property_id IN (SELECT id FROM properties WHERE status = 'published')`. |
| | **UPDATE** | **Denied** | **Denied** | **Denied** | Binary bookmark (Insert/Delete only). |
| | **DELETE** | **Denied** | **Own Favorites** | **Own Favorites** | `user_id = auth.uid()`. |
| **`collections`** | **SELECT** | **Denied** | **Own Collections** | **Own Collections** | `user_id = auth.uid()`. |
| | **INSERT** | **Denied** | **Own Collections** | **Own Collections** | `user_id = auth.uid()`. |
| | **UPDATE** | **Denied** | **Own Collections** | **Own Collections** | `user_id = auth.uid()`. |
| | **DELETE** | **Denied** | **Own Collections** | **Own Collections** | `user_id = auth.uid()`. |
| **`collection_properties`** | **SELECT** | **Denied** | **Own Collection Items** | **Own Collection Items** | `collection_id IN (SELECT id FROM collections WHERE user_id = auth.uid())`. |
| | **INSERT** | **Denied** | **Own Collection Items (Published Only)** | **Own Collection Items (Published Only)** | `collection_id IN (SELECT id FROM collections WHERE user_id = auth.uid()) AND property_id IN (SELECT id FROM properties WHERE status = 'published')`. |
| | **UPDATE** | **Denied** | **Denied** | **Denied** | Composite PK (Insert/Delete only). |
| | **DELETE** | **Denied** | **Own Collection Items** | **Own Collection Items** | `collection_id IN (SELECT id FROM collections WHERE user_id = auth.uid())`. |
| **`inquiries`** | **SELECT** | **Denied** | **Own Inquiries (Sender)** | **Assigned Inquiries (Receiver)** | User: `user_id = auth.uid()`.<br>Agent: `property_id IN (SELECT p.id FROM properties p JOIN agents a ON p.agent_id = a.id WHERE a.profile_id = auth.uid())`. |
| | **INSERT** | **Denied** | **Own Inquiries (Strict Validation)** | **Denied (No Agent Buyer in MVP)** | Regular users only (`user_id = auth.uid() AND status = 'new' AND property_id IN (SELECT id FROM properties WHERE status = 'published' AND agent_id = inquiries.agent_id)`). |
| | **UPDATE** | **Denied** | **Denied** | **Denied (Direct Table Update)** | **Direct UPDATE denied for all**. Status updates must execute through the dedicated `update_inquiry_status()` RPC. |
| | **DELETE** | **Denied** | **Denied** | **Denied** | Preserved for auditing and lead history. |

---

## 3. Profiles Privacy & Public Agent Interface Architecture

### 3.1 Profiles Table Privacy Model
- **Privacy Policy**: Direct `SELECT` on `public.profiles` is restricted strictly to `id = auth.uid()`.
- **Protection**: Anonymous visitors and general users cannot query arbitrary profile records, protecting private `phone`, `bio`, and account metadata.

---

### 3.2 Public Agent Interface (`public.agents_public` View)

#### Architectural Challenge
Because `profiles` RLS restricts direct row selection to `auth.uid()`, a standard public view with `security_invoker = true` querying `profiles` would yield `NULL` or empty rows for unauthenticated visitors.

#### Approved Solution
Create `public.agents_public` as a PostgreSQL View owned by the database schema owner (or using a `SECURITY DEFINER` underlying projection) that explicitly selects only safe, public columns:

```sql
CREATE OR REPLACE VIEW public.agents_public AS
SELECT 
    a.id,
    a.profile_id,
    p.full_name,
    p.avatar_url,
    a.company_name,
    a.professional_title,
    a.bio,
    a.created_at
FROM public.agents a
JOIN public.profiles p ON a.profile_id = p.id;

GRANT SELECT ON public.agents_public TO anon, authenticated;
```

#### Privacy Guarantees
- **Exposed Columns (Public Safe)**: `id`, `profile_id`, `full_name`, `avatar_url`, `company_name`, `professional_title`, `bio`, `created_at`.
- **Protected Columns (Hidden from Public)**: `agents.email`, `agents.phone`, `agents.license_number`, `profiles.phone`, `profiles.bio` (user-level bio).

---

## 4. Ownership Verification & Relational Integrity Predicates

### 4.1 Agent Self-Service Onboarding
- **Decision Applied**: Self-service onboarding enabled. Any authenticated user can register their own agent profile.
- **INSERT Predicate (`WITH CHECK`)**:
  ```sql
  profile_id = auth.uid()
  ```

---

### 4.2 Property Ownership Verification
- **Predicate**:
  ```sql
  properties.agent_id IN (
      SELECT a.id FROM public.agents a
      WHERE a.profile_id = auth.uid()
  )
  ```

---

### 4.3 Property Sub-Resource Verification (`property_images`, `property_features`)
- **Predicate**:
  ```sql
  property_id IN (
      SELECT p.id FROM public.properties p
      JOIN public.agents a ON p.agent_id = a.id
      WHERE a.profile_id = auth.uid()
  )
  ```
- **Security Rationale**: Ensures an agent cannot insert, update, or delete media or features on listings owned by another agent.

---

### 4.4 Inquiry Integrity & Anti-Spoofing Rule
- **Decision Applied**:
  1. Regular users only can create inquiries (agents cannot create inquiries as buyers in MVP).
  2. The inquiry must strictly bind to a `published` property and the genuine owning `agent_id`.
- **INSERT Predicate (`WITH CHECK`)**:
  ```sql
  user_id = auth.uid()
  AND status = 'new'
  AND property_id IN (
      SELECT p.id FROM public.properties p
      WHERE p.status = 'published'
        AND p.agent_id = inquiries.agent_id
  )
  AND NOT EXISTS (
      SELECT 1 FROM public.agents a
      WHERE a.profile_id = auth.uid()
  )
  ```

---

### 4.5 Favorites & Collection Properties Integrity
- **Favorites INSERT Predicate (`WITH CHECK`)**:
  ```sql
  user_id = auth.uid() 
  AND property_id IN (SELECT id FROM public.properties WHERE status = 'published')
  ```
- **Collection Properties INSERT Predicate (`WITH CHECK`)**:
  ```sql
  collection_id IN (SELECT id FROM public.collections WHERE user_id = auth.uid())
  AND property_id IN (SELECT id FROM public.properties WHERE status = 'published')
  ```

---

## 5. Inquiry Status Update via RPC Function

### 5.1 Architecture & Motivation
To enforce status-only mutation without risking modifications to `user_id`, `property_id`, `agent_id`, or `message`:
- Direct `UPDATE` on `public.inquiries` is **DENIED** for all roles in RLS.
- Status changes must execute through the dedicated database function `update_inquiry_status()`.

### 5.2 RPC Specification (Design Only)

```sql
CREATE OR REPLACE FUNCTION public.update_inquiry_status(
    p_inquiry_id UUID,
    p_status TEXT
)
RETURNS public.inquiries
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_inquiry public.inquiries;
    v_property_agent_profile_id UUID;
BEGIN
    -- 1. Validate status input
    IF p_status NOT IN ('contacted', 'closed') THEN
        RAISE EXCEPTION 'Invalid status transition: %', p_status;
    END IF;

    -- 2. Verify agent ownership through property relationship
    SELECT a.profile_id INTO v_property_agent_profile_id
    FROM public.inquiries i
    JOIN public.properties p ON i.property_id = p.id
    JOIN public.agents a ON p.agent_id = a.id
    WHERE i.id = p_inquiry_id;

    IF v_property_agent_profile_id IS NULL OR v_property_agent_profile_id <> auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized: You can only update inquiries for properties you own.';
    END IF;

    -- 3. Perform status update only
    UPDATE public.inquiries
    SET status = p_status,
        updated_at = now()
    WHERE id = p_inquiry_id
    RETURNING * INTO v_inquiry;

    RETURN v_inquiry;
END;
$$;
```

---

## 6. Supabase Storage Architecture & Security

### 6.1 Bucket Configuration

| Bucket Name | Public Access | Max File Size | Allowed MIME Types | Folder Path Convention |
| :--- | :--- | :--- | :--- | :--- |
| **`property-images`** | `true` (Public Read) | 10 MB | `image/jpeg`, `image/png`, `image/webp`, `image/avif` | `{property_id}/{image_uuid}.{ext}` |
| **`avatars`** | `true` (Public Read) | 5 MB | `image/jpeg`, `image/png`, `image/webp` | `{user_id}/{avatar_uuid}.{ext}` |

---

### 6.2 Storage Policy: `property-images`

* **Read (SELECT)**:
  - Allowed for `anon` and `authenticated`.
* **Upload (INSERT)**:
  - Caller must be an authenticated agent owning the property folder:
    ```sql
    (storage.foldername(name))[1]::uuid IN (
        SELECT p.id FROM public.properties p
        JOIN public.agents a ON p.agent_id = a.id
        WHERE a.profile_id = auth.uid()
    )
    ```
* **Update / Delete (UPDATE / DELETE)**:
  - Allowed only if caller owns the property referenced by `(storage.foldername(name))[1]::uuid`.

---

### 6.3 Storage Policy: `avatars`

* **Read (SELECT)**:
  - Allowed for `anon` and `authenticated`.
* **Upload / Update / Delete (INSERT / UPDATE / DELETE)**:
  - The first path segment must match the authenticated caller's user ID:
    ```sql
    (storage.foldername(name))[1]::uuid = auth.uid()
    ```

---

## 7. Status & Readiness for Implementation

All previous ambiguities have been resolved:
- [x] Agent onboarding model finalized (Self-service).
- [x] Public agent interface design finalized (`agents_public` view with privacy boundaries).
- [x] Inquiry status update mechanism finalized (`update_inquiry_status()` RPC).
- [x] Agent as buyer policy finalized (Excluded in MVP).
- [x] Inquiry relational integrity check finalized (anti-spoofing `WITH CHECK`).
- [x] Favorites / Collections published validation finalized.
- [x] Storage path authorization finalized.

**Phase 6 is fully designed and ready for SQL implementation upon approval.**
