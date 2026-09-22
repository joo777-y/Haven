# Phase 6.1 — Supabase Security & Storage Manual Verification Plan

**Document:** `docs/PHASE_0061_SECURITY_VERIFICATION.md`
**Purpose:** Comprehensive manual testing and verification suite for Phase 6 RLS policies, views, RPC functions, and storage security.
**Target Migration:** `supabase/migrations/202609220002_create_security_and_storage.sql`
**Author:** HAVEN Engineering Team
**Execution Environment:** Supabase Dashboard SQL Editor & Storage Explorer
**Status:** Ready for Manual Execution (Do NOT execute automatically)

---

## 1. Test Setup & Architecture Context

### 1.1 Authentication Simulation Context

> [!NOTE]
> **Simulated Personas vs. Live Auth Accounts**
>
> The SQL test cases in this document simulate authenticated users by setting PostgreSQL transaction-local JWT claims (`request.jwt.claim.sub`) and database roles (`authenticated` or `anon`).
>
> These tests validate PostgreSQL RLS policies, views, and functions directly in the database engine. Live end-to-end authentication lifecycles (Supabase Auth tokens, session cookies, OAuth, and signup triggers) are tested in Phase 7.

> **Persona Separation Guarantee**
>
> * **User A** (`11111111-1111-1111-1111-111111111111`) and **User B** (`22222222-2222-2222-2222-222222222222`) remain strictly regular buyers throughout the entire test suite.
> * **Agent Alpha** (`aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`) and **Agent Beta** (`bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb`) serve as pre-existing listing agents.
> * **Agent Gamma** (`cccccccc-cccc-cccc-cccc-cccccccccccc`) is a dedicated test-only persona created specifically to test self-service agent onboarding without altering User A's or User B's buyer status.

### 1.2 Transaction Isolation Rule

> [!IMPORTANT]
> Every test that uses `SET LOCAL ROLE` or `SET LOCAL "request.jwt.claim.sub"` must run inside its own transaction.
>
> Use:
>
> ```sql
> BEGIN;
>
> SET LOCAL ROLE ...;
> SET LOCAL "request.jwt.claim.sub" = '...';
>
> -- test query
>
> ROLLBACK;
> ```
>
> This ensures that simulated authentication context and test mutations do not leak between test cases.
>
> For expected-denial tests, an RLS/permission error may abort the transaction. In that case, the failed test transaction is considered complete and should not be reused.

### 1.3 Test Fixture Initialization

> [!TIP]
> **Fixture Re-run Rule**
>
> The initialization script assumes a clean test state.
>
> If fixtures have already been created or a previous test run partially completed, execute the cleanup procedure in Section 4.1 before running initialization again.
>
> The `ON CONFLICT DO NOTHING` clauses do not reset mutated fixture state.

Execute the following setup script once in the Supabase SQL Editor using Admin / Service Role privileges.

```sql
BEGIN;

-- 1. Create Profiles

INSERT INTO public.profiles
    (id, full_name, avatar_url, phone, bio)
VALUES
    (
        '11111111-1111-1111-1111-111111111111',
        'Alice Buyer',
        'https://example.com/alice.jpg',
        '+1111111111',
        'Looking for apartments'
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'Bob Buyer',
        'https://example.com/bob.jpg',
        '+2222222222',
        'Looking for villas'
    ),
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'Agent Alpha',
        'https://example.com/alpha.jpg',
        '+3333333333',
        'Top luxury broker'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'Agent Beta',
        'https://example.com/beta.jpg',
        '+4444444444',
        'Commercial specialist'
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'Agent Gamma',
        'https://example.com/gamma.jpg',
        '+5555555555',
        'Test-only self-service agent'
    )
ON CONFLICT (id) DO NOTHING;


-- 2. Create Agents
-- Agent Gamma is intentionally NOT created here.
-- Test 3.2 creates Gamma through the self-service flow.

INSERT INTO public.agents
    (id, profile_id, company_name, professional_title, bio, phone, email, license_number)
VALUES
    (
        'a1111111-1111-1111-1111-111111111111',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'Alpha Real Estate',
        'Senior Broker',
        '10 years experience',
        '+3333333333',
        'alpha@haven.test',
        'LIC-ALPHA-999'
    ),
    (
        'b2222222-2222-2222-2222-222222222222',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'Beta Properties',
        'Managing Director',
        'Commercial & Residential',
        '+4444444444',
        'beta@haven.test',
        'LIC-BETA-888'
    )
ON CONFLICT (id) DO NOTHING;


-- 3. Create Properties
--
-- Agent Alpha owns:
-- d111... published
-- d222... draft
-- d444... archived
--
-- Agent Beta owns:
-- d333... published
-- d555... draft

INSERT INTO public.properties
    (
        id,
        agent_id,
        title,
        slug,
        description,
        price,
        listing_type,
        property_type,
        bedrooms,
        bathrooms,
        area,
        country,
        city,
        status
    )
VALUES
    (
        'd1111111-1111-1111-1111-111111111111',
        'a1111111-1111-1111-1111-111111111111',
        'Alpha Luxury Villa',
        'alpha-luxury-villa',
        'Stunning sea view',
        1200000,
        'sale',
        'villa',
        4,
        3,
        350,
        'Egypt',
        'El Gouna',
        'published'
    ),
    (
        'd2222222-2222-2222-2222-222222222222',
        'a1111111-1111-1111-1111-111111111111',
        'Alpha Draft Penthouse',
        'alpha-draft-penthouse',
        'Draft listing',
        850000,
        'sale',
        'penthouse',
        3,
        2,
        220,
        'Egypt',
        'Cairo',
        'draft'
    ),
    (
        'd3333333-3333-3333-3333-333333333333',
        'b2222222-2222-2222-2222-222222222222',
        'Beta Modern Studio',
        'beta-modern-studio',
        'Downtown cozy studio',
        300000,
        'sale',
        'studio',
        1,
        1,
        65,
        'Egypt',
        'Alexandria',
        'published'
    ),
    (
        'd4444444-4444-4444-4444-444444444444',
        'a1111111-1111-1111-1111-111111111111',
        'Alpha Archived Chalet',
        'alpha-archived-chalet',
        'Archived chalet',
        450000,
        'sale',
        'chalet',
        2,
        1,
        95,
        'Egypt',
        'North Coast',
        'archived'
    ),
    (
        'd5555555-5555-5555-5555-555555555555',
        'b2222222-2222-2222-2222-222222222222',
        'Beta Draft Townhouse',
        'beta-draft-townhouse',
        'Draft townhouse',
        600000,
        'sale',
        'townhouse',
        3,
        3,
        180,
        'Egypt',
        'Cairo',
        'draft'
    )
ON CONFLICT (id) DO NOTHING;


-- 4. Create Property Media & Features

INSERT INTO public.property_images
    (id, property_id, image_url, sort_order, is_cover)
VALUES
    (
        'e1111111-1111-1111-1111-111111111111',
        'd1111111-1111-1111-1111-111111111111',
        'https://example.com/p1_cover.jpg',
        0,
        true
    ),
    (
        'e2222222-2222-2222-2222-222222222222',
        'd2222222-2222-2222-2222-222222222222',
        'https://example.com/p2_draft.jpg',
        0,
        true
    ),
    (
        'e3333333-3333-3333-3333-333333333333',
        'd3333333-3333-3333-3333-333333333333',
        'https://example.com/p3_cover.jpg',
        0,
        true
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.property_features
    (id, property_id, feature)
VALUES
    (
        'f1111111-1111-1111-1111-111111111111',
        'd1111111-1111-1111-1111-111111111111',
        'Private Pool'
    ),
    (
        'f2222222-2222-2222-2222-222222222222',
        'd2222222-2222-2222-2222-222222222222',
        'Private Jacuzzi'
    ),
    (
        'f3333333-3333-3333-3333-333333333333',
        'd3333333-3333-3333-3333-333333333333',
        'City Skyline View'
    )
ON CONFLICT (id) DO NOTHING;


-- 5. Independent Inquiry Fixtures

INSERT INTO public.inquiries
    (id, user_id, agent_id, property_id, message, status)
VALUES
    (
        'c1111111-1111-1111-1111-111111111111',
        '11111111-1111-1111-1111-111111111111',
        'a1111111-1111-1111-1111-111111111111',
        'd1111111-1111-1111-1111-111111111111',
        'Inquiry for valid flow testing',
        'new'
    ),
    (
        'c4444444-4444-4444-4444-444444444444',
        '11111111-1111-1111-1111-111111111111',
        'a1111111-1111-1111-1111-111111111111',
        'd1111111-1111-1111-1111-111111111111',
        'Inquiry for skip test',
        'new'
    ),
    (
        'c5555555-5555-5555-5555-555555555555',
        '11111111-1111-1111-1111-111111111111',
        'a1111111-1111-1111-1111-111111111111',
        'd1111111-1111-1111-1111-111111111111',
        'Inquiry already closed',
        'closed'
    )
ON CONFLICT (id) DO NOTHING;

COMMIT;
```

---

# 2. Part I — Database Table Row Level Security (RLS) Tests

## Test Group 1 — Global RLS Enablement

### Test 1.1 — Verify RLS is active across all 9 tables

**Actor:** Admin / Service Role

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
      'profiles',
      'agents',
      'properties',
      'property_images',
      'property_features',
      'favorites',
      'collections',
      'collection_properties',
      'inquiries'
  );
```

**Expected:** `ALLOW` — All 9 tables return `rowsecurity = true`.

---

# Test Group 2 — `profiles` Privacy & Isolation

## Test 2.1 — Anonymous visitor queries profiles

```sql
BEGIN;

SET LOCAL ROLE anon;

SELECT * FROM public.profiles;

ROLLBACK;
```

**Expected:** `ALLOW` with **0 rows returned**.

## Test 2.2 — User A reads own profile

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    '11111111-1111-1111-1111-111111111111';

SELECT id, full_name, phone
FROM public.profiles;

ROLLBACK;
```

**Expected:** Exactly 1 row — Alice Buyer.

## Test 2.3 — User A attempts to read User B

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    '11111111-1111-1111-1111-111111111111';

SELECT id, full_name
FROM public.profiles
WHERE id = '22222222-2222-2222-2222-222222222222';

ROLLBACK;
```

**Expected:** 0 rows.

## Test 2.4 — User A attempts to update User B

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    '11111111-1111-1111-1111-111111111111';

UPDATE public.profiles
SET full_name = 'Hacked Bob'
WHERE id = '22222222-2222-2222-2222-222222222222';

ROLLBACK;
```

**Expected:** 0 rows updated / RLS denial.

---

# Test Group 3 — `agents` Privacy & Self-Service

## Test 3.1 — Anonymous visitor queries raw `agents`

```sql
BEGIN;

SET LOCAL ROLE anon;

SELECT * FROM public.agents;

ROLLBACK;
```

**Expected:** 0 rows.

## Test 3.2 — Agent Gamma creates own agent profile

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    'cccccccc-cccc-cccc-cccc-cccccccccccc';

INSERT INTO public.agents
    (profile_id, company_name, professional_title, bio)
VALUES
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'Gamma Realty',
        'Test Broker',
        'Self-service agent test'
    );

ROLLBACK;
```

**Expected:** Allow — 1 row inserted.

> If the purpose of this test is to persist Gamma for later tests, use `COMMIT` instead and ensure cleanup removes Gamma afterward. Otherwise `ROLLBACK` is preferred for isolation.

## Test 3.3 — User B creates agent for User A

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    '22222222-2222-2222-2222-222222222222';

INSERT INTO public.agents
    (profile_id, company_name)
VALUES
    (
        '11111111-1111-1111-1111-111111111111',
        'Spoofed Agency'
    );

ROLLBACK;
```

**Expected:** Denied by `WITH CHECK (profile_id = auth.uid())`.

## Test 3.4 — Agent Alpha modifies Agent Beta

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

UPDATE public.agents
SET company_name = 'Alpha Takeover'
WHERE id = 'b2222222-2222-2222-2222-222222222222';

ROLLBACK;
```

**Expected:** 0 rows updated.

---

# Test Group 4 — `agents_public` Controlled Public Exposure

## Test 4.1 — Anonymous visitor queries `agents_public`

```sql
BEGIN;

SET LOCAL ROLE anon;

SELECT *
FROM public.agents_public;

ROLLBACK;
```

**Expected:** Public agent rows with only:

* `id`
* `profile_id`
* `full_name`
* `avatar_url`
* `company_name`
* `professional_title`
* `bio`
* `created_at`

## Test 4.2 — Private columns are not exposed

```sql
BEGIN;

SET LOCAL ROLE anon;

SELECT phone, email, license_number
FROM public.agents_public;

ROLLBACK;
```

**Expected:** SQL error because these columns do not exist on the view.

---

# Test Group 5 — `properties` Visibility & Ownership

## Test 5.1 — Anonymous visitor sees published properties only

```sql
BEGIN;

SET LOCAL ROLE anon;

SELECT id, title, status
FROM public.properties;

ROLLBACK;
```

**Expected:** Only:

* `d111...` published
* `d333...` published

Draft and archived properties must be hidden.

## Test 5.2 — Agent Alpha sees own listings + other published

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

SELECT id, title, status
FROM public.properties;

ROLLBACK;
```

**Expected:**

* Prop 1 — own published
* Prop 2 — own draft
* Prop 4 — own archived
* Prop 3 — Beta published

## Test 5.3 — Alpha cannot see Beta's draft

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

SELECT id, title, status
FROM public.properties
WHERE id = 'd5555555-5555-5555-5555-555555555555';

ROLLBACK;
```

**Expected:** 0 rows.

## Test 5.4 — Alpha cannot update Beta property

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

UPDATE public.properties
SET price = 99999
WHERE id = 'd3333333-3333-3333-3333-333333333333';

ROLLBACK;
```

**Expected:** 0 rows updated.

## Test 5.5 — Alpha cannot delete Beta property

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

DELETE FROM public.properties
WHERE id = 'd3333333-3333-3333-3333-333333333333';

ROLLBACK;
```

**Expected:** 0 rows deleted.

---

# Test Group 6 — Property Children Ownership

## Test 6.1 — Anonymous visitor queries property images

```sql
BEGIN;

SET LOCAL ROLE anon;

SELECT id, property_id, image_url
FROM public.property_images;

ROLLBACK;
```

**Expected:** Images belonging to published properties only.

## Test 6.2 — Beta inserts image into Alpha property

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

INSERT INTO public.property_images
    (property_id, image_url)
VALUES
    (
        'd1111111-1111-1111-1111-111111111111',
        'https://example.com/hijacked.jpg'
    );

ROLLBACK;
```

**Expected:** RLS `WITH CHECK` denial.

## Test 6.3a — Beta updates Alpha image

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

UPDATE public.property_images
SET is_cover = false
WHERE id = 'e1111111-1111-1111-1111-111111111111';

ROLLBACK;
```

**Expected:** 0 rows updated.

## Test 6.3b — Beta deletes Alpha image

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

DELETE FROM public.property_images
WHERE id = 'e1111111-1111-1111-1111-111111111111';

ROLLBACK;
```

**Expected:** 0 rows deleted.

## Test 6.4a — Beta updates Alpha feature

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

UPDATE public.property_features
SET feature = 'Compromised'
WHERE id = 'f1111111-1111-1111-1111-111111111111';

ROLLBACK;
```

**Expected:** 0 rows updated.

## Test 6.4b — Beta deletes Alpha feature

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

DELETE FROM public.property_features
WHERE id = 'f1111111-1111-1111-1111-111111111111';

ROLLBACK;
```

**Expected:** 0 rows deleted.

---

# Test Group 7 — Favorites

## Test 7.1 — User A favorites published property

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    '11111111-1111-1111-1111-111111111111';

INSERT INTO public.favorites
    (id, user_id, property_id)
VALUES
    (
        'a7111111-1111-1111-1111-111111111111',
        '11111111-1111-1111-1111-111111111111',
        'd1111111-1111-1111-1111-111111111111'
    );

ROLLBACK;
```

**Expected:** Allow.

## Test 7.2 — User A favorites draft property

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    '11111111-1111-1111-1111-111111111111';

INSERT INTO public.favorites
    (user_id, property_id)
VALUES
    (
        '11111111-1111-1111-1111-111111111111',
        'd2222222-2222-2222-2222-222222222222'
    );

ROLLBACK;
```

**Expected:** Denied by published-property requirement.

## Test 7.3 — User B deletes User A favorite

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    '22222222-2222-2222-2222-222222222222';

DELETE FROM public.favorites
WHERE id = 'a7111111-1111-1111-1111-111111111111';

ROLLBACK;
```

**Expected:** 0 rows deleted.

---

# Test Group 8 — Collections

## Test 8.1 — User A creates collection and adds published property

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    '11111111-1111-1111-1111-111111111111';

INSERT INTO public.collections
    (id, user_id, name)
VALUES
    (
        'c8111111-1111-1111-1111-111111111111',
        '11111111-1111-1111-1111-111111111111',
        'El Gouna Villas'
    );

INSERT INTO public.collection_properties
    (collection_id, property_id)
VALUES
    (
        'c8111111-1111-1111-1111-111111111111',
        'd1111111-1111-1111-1111-111111111111'
    );

ROLLBACK;
```

**Expected:** Both operations allowed.

## Test 8.2 — User B reads User A collection

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    '22222222-2222-2222-2222-222222222222';

SELECT *
FROM public.collections
WHERE id = 'c8111111-1111-1111-1111-111111111111';

ROLLBACK;
```

**Expected:** 0 rows.

## Test 8.3a — User B inserts into User A collection

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    '22222222-2222-2222-2222-222222222222';

INSERT INTO public.collection_properties
    (collection_id, property_id)
VALUES
    (
        'c8111111-1111-1111-1111-111111111111',
        'd3333333-3333-3333-3333-333333333333'
    );

ROLLBACK;
```

**Expected:** RLS `WITH CHECK` denial.

## Test 8.3b — User B deletes from User A collection

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    '22222222-2222-2222-2222-222222222222';

DELETE FROM public.collection_properties
WHERE collection_id = 'c8111111-1111-1111-1111-111111111111';

ROLLBACK;
```

**Expected:** 0 rows deleted.

## Test 8.4 — User A adds draft property to own collection

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    '11111111-1111-1111-1111-111111111111';

INSERT INTO public.collection_properties
    (collection_id, property_id)
VALUES
    (
        'c8111111-1111-1111-1111-111111111111',
        'd2222222-2222-2222-2222-222222222222'
    );

ROLLBACK;
```

**Expected:** Denied because property is not published.

---

# Test Group 9 — Inquiries

## Test 9.1 — User A submits valid inquiry

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    '11111111-1111-1111-1111-111111111111';

INSERT INTO public.inquiries
    (id, user_id, agent_id, property_id, message, status)
VALUES
    (
        '91111111-1111-1111-1111-111111111111',
        '11111111-1111-1111-1111-111111111111',
        'a1111111-1111-1111-1111-111111111111',
        'd1111111-1111-1111-1111-111111111111',
        'Is the price negotiable?',
        'new'
    );

ROLLBACK;
```

**Expected:** Allow.

## Test 9.2 — Anti-spoofing: mismatched agent

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    '11111111-1111-1111-1111-111111111111';

INSERT INTO public.inquiries
    (id, user_id, agent_id, property_id, message, status)
VALUES
    (
        '92222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111',
        'b2222222-2222-2222-2222-222222222222',
        'd1111111-1111-1111-1111-111111111111',
        'Spoofed inquiry',
        'new'
    );

ROLLBACK;
```

**Expected:** Denied.

## Test 9.3 — Agent cannot act as buyer

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

INSERT INTO public.inquiries
    (id, user_id, agent_id, property_id, message, status)
VALUES
    (
        '93333333-3333-3333-3333-333333333333',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'b2222222-2222-2222-2222-222222222222',
        'd3333333-3333-3333-3333-333333333333',
        'Agent as buyer test',
        'new'
    );

ROLLBACK;
```

**Expected:** Denied.

## Test 9.4 — Inquiry visibility

Run independently as:

### User A

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    '11111111-1111-1111-1111-111111111111';

SELECT *
FROM public.inquiries;

ROLLBACK;
```

**Expected:** User A can see their inquiry.

### Agent Alpha

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

SELECT *
FROM public.inquiries;

ROLLBACK;
```

**Expected:** Alpha can see inquiries belonging to Alpha's properties.

### Agent Beta

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

SELECT *
FROM public.inquiries;

ROLLBACK;
```

**Expected:** Alpha's inquiry is not visible.

## Test 9.5 — Direct inquiry UPDATE denied

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

UPDATE public.inquiries
SET status = 'contacted'
WHERE id = 'c1111111-1111-1111-1111-111111111111';

ROLLBACK;
```

**Expected:** Denied / 0 rows updated.

## Test 9.6 — Direct inquiry DELETE denied

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    '11111111-1111-1111-1111-111111111111';

DELETE FROM public.inquiries
WHERE id = 'c1111111-1111-1111-1111-111111111111';

ROLLBACK;
```

**Expected:** Denied / 0 rows deleted.

---

# Test Group 10 — `update_inquiry_status()` RPC

> **Important:** Tests 10.1 and 10.2 intentionally mutate the dedicated `c111...` fixture. Do not rerun them without resetting fixtures first.

## Test 10.1 — `new → contacted`

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

SELECT id, status, updated_at
FROM public.update_inquiry_status(
    'c1111111-1111-1111-1111-111111111111',
    'contacted'
);

COMMIT;
```

**Expected:** Allow — status becomes `contacted`.

## Test 10.2 — `contacted → closed`

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

SELECT id, status, updated_at
FROM public.update_inquiry_status(
    'c1111111-1111-1111-1111-111111111111',
    'closed'
);

COMMIT;
```

**Expected:** Allow — status becomes `closed`.

## Test 10.3 — Reject `new → closed`

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

SELECT *
FROM public.update_inquiry_status(
    'c4444444-4444-4444-4444-444444444444',
    'closed'
);

ROLLBACK;
```

**Expected:** Exception rejecting the invalid transition.

## Test 10.4 — Reject transition from `closed`

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

SELECT *
FROM public.update_inquiry_status(
    'c5555555-5555-5555-5555-555555555555',
    'contacted'
);

ROLLBACK;
```

**Expected:** Exception rejecting transition from terminal state.

## Test 10.5 — Beta cannot update Alpha inquiry

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

SELECT *
FROM public.update_inquiry_status(
    'c1111111-1111-1111-1111-111111111111',
    'contacted'
);

ROLLBACK;
```

**Expected:** Unauthorized exception.

## Test 10.6 — Anonymous cannot call RPC

```sql
BEGIN;

SET LOCAL ROLE anon;

SELECT *
FROM public.update_inquiry_status(
    'c1111111-1111-1111-1111-111111111111',
    'contacted'
);

ROLLBACK;
```

**Expected:** Permission denied.

---

# 3. Part II — Supabase Storage Tests

## Test Group 11 — Storage Policy & Database-Level Tests

### Test 11.1 — Verify bucket configuration

```sql
SELECT
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE id IN ('property-images', 'avatars');
```

**Expected:**

`property-images`:

* `public = true`
* `file_size_limit = 10485760`
* MIME types include JPEG, PNG, WebP, AVIF

`avatars`:

* `public = true`
* `file_size_limit = 5242880`
* MIME types include JPEG, PNG, WebP

## Test 11.2 — Alpha uploads to own property

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

INSERT INTO storage.objects
    (bucket_id, name, owner)
VALUES
    (
        'property-images',
        'd1111111-1111-1111-1111-111111111111/photo1.webp',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
    );

ROLLBACK;
```

**Expected:** Allow.

## Test 11.3 — Beta uploads to Alpha property

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

INSERT INTO storage.objects
    (bucket_id, name, owner)
VALUES
    (
        'property-images',
        'd1111111-1111-1111-1111-111111111111/hijack.webp',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
    );

ROLLBACK;
```

**Expected:** Storage policy denial.

## Test 11.4 — Storage path hijacking on UPDATE

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

UPDATE storage.objects
SET name = 'd3333333-3333-3333-3333-333333333333/moved_photo.webp'
WHERE bucket_id = 'property-images'
  AND name = 'd1111111-1111-1111-1111-111111111111/photo1.webp';

ROLLBACK;
```

**Expected:** Storage policy denial because Alpha does not own Beta's property.

## Test 11.5 — User A uploads avatar to own folder

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    '11111111-1111-1111-1111-111111111111';

INSERT INTO storage.objects
    (bucket_id, name, owner)
VALUES
    (
        'avatars',
        '11111111-1111-1111-1111-111111111111/avatar.png',
        '11111111-1111-1111-1111-111111111111'
    );

ROLLBACK;
```

**Expected:** Allow.

## Test 11.6 — User B uploads into User A avatar folder

```sql
BEGIN;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" =
    '22222222-2222-2222-2222-222222222222';

INSERT INTO storage.objects
    (bucket_id, name, owner)
VALUES
    (
        'avatars',
        '11111111-1111-1111-1111-111111111111/avatar.png',
        '22222222-2222-2222-2222-222222222222'
    );

ROLLBACK;
```

**Expected:** Storage policy denial.

---

# 3.2 Future Storage API / Client E2E Verification

These tests belong to Phase 7 / integration scope.

1. **Agent Property Image Upload**

   * Alpha uploads to own property folder.
   * Expected: HTTP 200 / success.

2. **Agent Property Image Cross-Upload**

   * Alpha uploads to Beta property folder.
   * Expected: HTTP 403 / unauthorized.

3. **User Avatar Upload**

   * User A uploads to own avatar folder.
   * Expected: HTTP 200 / success.

4. **User Avatar Cross-Upload**

   * User A attempts upload to User B folder.
   * Expected: HTTP 403 / unauthorized.

5. **Public Media URL**

   * Anonymous client accesses public property image.
   * Expected: HTTP 200.

6. **Cross-Owner Rename / Move**

   * Alpha attempts to move an image from Alpha property to Beta property.
   * Expected: HTTP 403.

---

# 4. Test Cleanup Procedures

## 4.1 Database Cleanup

> [!CAUTION]
> Execute cleanup using Admin / Service Role privileges.
>
> Do not weaken production DELETE policies for cleanup purposes.

```sql
BEGIN;

DELETE FROM public.inquiries
WHERE id IN (
    'c1111111-1111-1111-1111-111111111111',
    'c4444444-4444-4444-4444-444444444444',
    'c5555555-5555-5555-5555-555555555555',
    '91111111-1111-1111-1111-111111111111',
    '92222222-2222-2222-2222-222222222222',
    '93333333-3333-3333-3333-333333333333'
);

DELETE FROM public.collection_properties
WHERE collection_id = 'c8111111-1111-1111-1111-111111111111';

DELETE FROM public.collections
WHERE id = 'c8111111-1111-1111-1111-111111111111';

DELETE FROM public.favorites
WHERE id = 'a7111111-1111-1111-1111-111111111111';

DELETE FROM public.property_features
WHERE id IN (
    'f1111111-1111-1111-1111-111111111111',
    'f2222222-2222-2222-2222-222222222222',
    'f3333333-3333-3333-3333-333333333333'
);

DELETE FROM public.property_images
WHERE id IN (
    'e1111111-1111-1111-1111-111111111111',
    'e2222222-2222-2222-2222-222222222222',
    'e3333333-3333-3333-3333-333333333333'
);

DELETE FROM public.properties
WHERE id IN (
    'd1111111-1111-1111-1111-111111111111',
    'd2222222-2222-2222-2222-222222222222',
    'd3333333-3333-3333-3333-333333333333',
    'd4444444-4444-4444-4444-444444444444',
    'd5555555-5555-5555-5555-555555555555'
);

DELETE FROM public.agents
WHERE id IN (
    'a1111111-1111-1111-1111-111111111111',
    'b2222222-2222-2222-2222-222222222222'
)
OR profile_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

DELETE FROM public.profiles
WHERE id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'cccccccc-cccc-cccc-cccc-cccccccccccc'
);

COMMIT;
```

## 4.2 Storage Objects Cleanup

In Supabase Dashboard:

**Storage → `property-images`**

Delete:

```text
d1111111-1111-1111-1111-111111111111/
```

**Storage → `avatars`**

Delete:

```text
11111111-1111-1111-1111-111111111111/
```

---

# 5. Final Security Verification Checklist

| Test | Requirement              | Expected Result                   | Status                |
| ---- | ------------------------ | --------------------------------- | --------------------- |
| 1.1  | Global RLS               | All 9 tables enabled              | `[ ] PASS / [ ] FAIL` |
| 2.1  | Profile Privacy          | Anonymous sees 0 rows             | `[ ] PASS / [ ] FAIL` |
| 2.2  | Profile Read             | User sees own profile             | `[ ] PASS / [ ] FAIL` |
| 2.3  | Profile Isolation        | User A cannot see B               | `[ ] PASS / [ ] FAIL` |
| 2.4  | Profile Update Isolation | A cannot update B                 | `[ ] PASS / [ ] FAIL` |
| 3.1  | Raw Agents Privacy       | Anonymous sees 0 rows             | `[ ] PASS / [ ] FAIL` |
| 3.2  | Agent Self-Service       | Gamma creates own agent           | `[ ] PASS / [ ] FAIL` |
| 3.3  | Agent Anti-Spoofing      | B cannot create for A             | `[ ] PASS / [ ] FAIL` |
| 3.4  | Agent Isolation          | Alpha cannot modify Beta          | `[ ] PASS / [ ] FAIL` |
| 4.1  | Public Agent View        | Safe public data readable         | `[ ] PASS / [ ] FAIL` |
| 4.2  | Private Columns          | Private columns unavailable       | `[ ] PASS / [ ] FAIL` |
| 5.1  | Public Properties        | Only published visible            | `[ ] PASS / [ ] FAIL` |
| 5.2  | Agent Properties         | Own private + all published       | `[ ] PASS / [ ] FAIL` |
| 5.3  | Draft Isolation          | Alpha cannot see Beta draft       | `[ ] PASS / [ ] FAIL` |
| 5.4  | Property Update          | Alpha cannot update Beta          | `[ ] PASS / [ ] FAIL` |
| 5.5  | Property Delete          | Alpha cannot delete Beta          | `[ ] PASS / [ ] FAIL` |
| 6.1  | Image Visibility         | Published property images visible | `[ ] PASS / [ ] FAIL` |
| 6.2  | Image Insert             | Cross-owner insert denied         | `[ ] PASS / [ ] FAIL` |
| 6.3a | Image Update             | Cross-owner update denied         | `[ ] PASS / [ ] FAIL` |
| 6.3b | Image Delete             | Cross-owner delete denied         | `[ ] PASS / [ ] FAIL` |
| 6.4a | Feature Update           | Cross-owner update denied         | `[ ] PASS / [ ] FAIL` |
| 6.4b | Feature Delete           | Cross-owner delete denied         | `[ ] PASS / [ ] FAIL` |
| 7.1  | Favorites                | Published favorite allowed        | `[ ] PASS / [ ] FAIL` |
| 7.2  | Favorite Draft           | Draft favorite denied             | `[ ] PASS / [ ] FAIL` |
| 7.3  | Favorite Isolation       | B cannot delete A favorite        | `[ ] PASS / [ ] FAIL` |
| 8.1  | Collections              | Owner can manage collection       | `[ ] PASS / [ ] FAIL` |
| 8.2  | Collection Isolation     | B cannot read A                   | `[ ] PASS / [ ] FAIL` |
| 8.3a | Collection Insert        | B cannot insert into A            | `[ ] PASS / [ ] FAIL` |
| 8.3b | Collection Delete        | B cannot delete from A            | `[ ] PASS / [ ] FAIL` |
| 8.4  | Collection Draft         | Draft property denied             | `[ ] PASS / [ ] FAIL` |
| 9.1  | Inquiry Creation         | Valid inquiry allowed             | `[ ] PASS / [ ] FAIL` |
| 9.2  | Inquiry Anti-Spoofing    | Mismatched agent denied           | `[ ] PASS / [ ] FAIL` |
| 9.3  | Agent-as-Buyer           | Agent inquiry denied              | `[ ] PASS / [ ] FAIL` |
| 9.4  | Inquiry Visibility       | Owner + assigned agent only       | `[ ] PASS / [ ] FAIL` |
| 9.5  | Direct UPDATE            | Direct table update denied        | `[ ] PASS / [ ] FAIL` |
| 9.6  | Direct DELETE            | Direct table delete denied        | `[ ] PASS / [ ] FAIL` |
| 10.1 | RPC `new → contacted`    | Allowed                           | `[ ] PASS / [ ] FAIL` |
| 10.2 | RPC `contacted → closed` | Allowed                           | `[ ] PASS / [ ] FAIL` |
| 10.3 | RPC Skip                 | `new → closed` denied             | `[ ] PASS / [ ] FAIL` |
| 10.4 | RPC Terminal             | `closed → contacted` denied       | `[ ] PASS / [ ] FAIL` |
| 10.5 | RPC Authorization        | Non-owner denied                  | `[ ] PASS / [ ] FAIL` |
| 10.6 | RPC Authentication       | Anonymous denied                  | `[ ] PASS / [ ] FAIL` |
| 11.1 | Storage Config           | Buckets/config verified           | `[ ] PASS / [ ] FAIL` |
| 11.2 | Property Upload          | Owner upload allowed              | `[ ] PASS / [ ] FAIL` |
| 11.3 | Property Hijack          | Cross-owner upload denied         | `[ ] PASS / [ ] FAIL` |
| 11.4 | Path Hijacking           | Cross-owner rename denied         | `[ ] PASS / [ ] FAIL` |
| 11.5 | Avatar Upload            | Owner upload allowed              | `[ ] PASS / [ ] FAIL` |
| 11.6 | Avatar Hijack            | Cross-owner upload denied         | `[ ] PASS / [ ] FAIL` |

---

## Phase 6.1 Completion Criteria

Phase 6.1 is considered complete when:

1. All fixture setup statements execute successfully.
2. All tests in Groups 1–11 have been manually executed.
3. Every expected `ALLOW` case succeeds.
4. Every expected `DENY` case is blocked by RLS, permissions, or the RPC authorization logic.
5. No unauthorized data is returned.
6. No cross-owner mutation succeeds.
7. Inquiry status transitions enforce:
   `new → contacted → closed`
8. Storage ownership rules prevent cross-owner upload and path hijacking.
9. Cleanup is completed.
10. The final checklist contains no unresolved failures.

**After Phase 6.1 passes, do not modify the Phase 6 security migration based on hypothetical concerns. Move to Phase 7 unless an actual verification test fails.**
