# Phase 5 — Database Architecture & Schema

**Status:** Completed (Migration & Types Generated Locally)  
**Version:** 1.2  
**Source of Truth:** [`DATABASE_SCHEMA_AND_DESIGN.md`](file:///d:/Haven/docs/DATABASE_SCHEMA_AND_DESIGN.md)  

---

## 1. Overview & Objectives

Phase 5 establishes the PostgreSQL database schema for the HAVEN platform using a version-controlled Supabase migration and TypeScript type definitions in `src/types/database.ts`.

In accordance with strict scope boundaries:
- **Migration & Local Validation Only**: Generated deterministic SQL migrations without attempting remote execution.
- **Preserved Existing Infrastructure**: `public.profiles`, the `auth.users → profiles` relationship, and the existing profile trigger/function are preserved and referenced via foreign keys.
- **Non-Destructive Deletions**: Sensitive parent entities (`agents`, `properties`) utilize `ON DELETE RESTRICT` to protect against accidental cascade data loss, while dependent child rows utilize `ON DELETE CASCADE`.
- **Automated Timestamps**: Reusable `public.handle_updated_at()` trigger function automatically maintains `updated_at` on row modifications.
- **Optimized Non-Redundant Indexing**: Removed duplicate indexes already covered by unique constraints or composite indexes.

---

## 2. Migration Details

- **Migration File**: [`supabase/migrations/202609220001_create_haven_schema.sql`](file:///d:/Haven/haven/supabase/migrations/202609220001_create_haven_schema.sql)
- **TypeScript Types**: [`src/types/database.ts`](file:///d:/Haven/haven/src/types/database.ts) *(Manually constructed to strictly match the approved schema specification)*

---

## 3. Foreign Key Deletion Strategy

| Relationship | Behavior | Rationale |
| :--- | :--- | :--- |
| `agents → properties` | `ON DELETE RESTRICT` | Prevents deleting an agent from destroying their listings; aligns with soft-delete (`archived`) strategy. |
| `agents → inquiries` | `ON DELETE RESTRICT` | Preserves buyer leads and inquiry history even if agent profile status changes. |
| `profiles → agents` | `ON DELETE RESTRICT` | Prevents deleting an active user profile if tied to active agent listings without reassigning first. |
| `properties → property_images` | `ON DELETE CASCADE` | Images have no standalone meaning without the parent listing. |
| `properties → property_features` | `ON DELETE CASCADE` | Features have no standalone meaning without the parent listing. |
| `properties → favorites` | `ON DELETE CASCADE` | Favorites clean up automatically if a property is hard-deleted. |
| `properties → collection_properties`| `ON DELETE CASCADE` | Junction table entries clean up automatically if a property is hard-deleted. |
| `collections → collection_properties`| `ON DELETE CASCADE` | Junction table entries clean up automatically when a collection is deleted. |
| `profiles → favorites` | `ON DELETE CASCADE` | User bookmarks clean up when user profile is deleted. |
| `profiles → collections` | `ON DELETE CASCADE` | User collections clean up when user profile is deleted. |
| `profiles → inquiries` | `ON DELETE CASCADE` | User submitted inquiries clean up when user profile is deleted. |
| `properties → inquiries` | `ON DELETE CASCADE` | Inquiries clean up if property is hard-deleted. |

---

## 4. Implemented Database Schema

### Existing Objects (Referenced, Not Recreated)
- **`public.profiles`**: `id` (PK, matches `auth.users.id`), `full_name`, `avatar_url`, `phone`, `bio`, `created_at`, `updated_at`.

### New Tables Created in Migration
1. **`agents`**:
   - `id`: UUID (PK, `gen_random_uuid()`)
   - `profile_id`: UUID (FK `public.profiles(id)` ON DELETE RESTRICT, UNIQUE)
   - `company_name`, `professional_title`, `bio`, `phone`, `email`, `license_number`: TEXT
   - `created_at`, `updated_at`: TIMESTAMPTZ

2. **`properties`**:
   - `id`: UUID (PK, `gen_random_uuid()`)
   - `agent_id`: UUID (FK `public.agents(id)` ON DELETE RESTRICT)
   - `title`, `description`, `country`, `city`: TEXT (NOT NULL)
   - `slug`: TEXT (NOT NULL, UNIQUE)
   - `price`: NUMERIC (NOT NULL, CHECK `price >= 0`)
   - `listing_type`: TEXT (NOT NULL, CHECK `listing_type IN ('sale', 'rent')`)
   - `property_type`: TEXT (NOT NULL, CHECK `property_type IN ('apartment', 'villa', 'studio', 'chalet', 'townhouse', 'penthouse')`)
   - `bedrooms`, `bathrooms`, `parking_spaces`: INTEGER (CHECK `>= 0`)
   - `area`: NUMERIC (CHECK `area >= 0`)
   - `year_built`: INTEGER (CHECK `year_built >= 1800`)
   - `neighborhood`, `address`: TEXT
   - `latitude`, `longitude`: NUMERIC
   - `status`: TEXT (NOT NULL, DEFAULT `'draft'`, CHECK `status IN ('draft', 'published', 'archived')`)
   - `created_at`, `updated_at`: TIMESTAMPTZ

3. **`property_images`**:
   - `id`: UUID (PK, `gen_random_uuid()`)
   - `property_id`: UUID (FK `public.properties(id)` ON DELETE CASCADE)
   - `image_url`: TEXT (NOT NULL)
   - `sort_order`: INTEGER (NOT NULL, DEFAULT `0`)
   - `is_cover`: BOOLEAN (NOT NULL, DEFAULT `false`)
   - `created_at`: TIMESTAMPTZ

4. **`property_features`**:
   - `id`: UUID (PK, `gen_random_uuid()`)
   - `property_id`: UUID (FK `public.properties(id)` ON DELETE CASCADE)
   - `feature`: TEXT (NOT NULL)
   - `created_at`: TIMESTAMPTZ

5. **`favorites`**:
   - `id`: UUID (PK, `gen_random_uuid()`)
   - `user_id`: UUID (FK `public.profiles(id)` ON DELETE CASCADE)
   - `property_id`: UUID (FK `public.properties(id)` ON DELETE CASCADE)
   - `created_at`: TIMESTAMPTZ
   - **Constraint**: `UNIQUE (user_id, property_id)`

6. **`collections`**:
   - `id`: UUID (PK, `gen_random_uuid()`)
   - `user_id`: UUID (FK `public.profiles(id)` ON DELETE CASCADE)
   - `name`: TEXT (NOT NULL)
   - `created_at`, `updated_at`: TIMESTAMPTZ

7. **`collection_properties`**:
   - `collection_id`: UUID (FK `public.collections(id)` ON DELETE CASCADE)
   - `property_id`: UUID (FK `public.properties(id)` ON DELETE CASCADE)
   - `created_at`: TIMESTAMPTZ
   - **Primary Key**: Composite `(collection_id, property_id)`

8. **`inquiries`**:
   - `id`: UUID (PK, `gen_random_uuid()`)
   - `user_id`: UUID (FK `public.profiles(id)` ON DELETE CASCADE)
   - `agent_id`: UUID (FK `public.agents(id)` ON DELETE RESTRICT)
   - `property_id`: UUID (FK `public.properties(id)` ON DELETE CASCADE)
   - `message`: TEXT (NOT NULL)
   - `status`: TEXT (NOT NULL, DEFAULT `'new'`, CHECK `status IN ('new', 'contacted', 'closed')`)
   - `created_at`, `updated_at`: TIMESTAMPTZ

---

## 5. Optimized Non-Redundant Indexes

- `idx_properties_agent_id` on `properties(agent_id)`
- `idx_properties_status` on `properties(status)`
- `idx_properties_listing_type` on `properties(listing_type)`
- `idx_properties_property_type` on `properties(property_type)`
- `idx_properties_city` on `properties(city)`
- `idx_properties_price` on `properties(price)`
- `idx_property_images_property_sort` on `property_images(property_id, sort_order)` *(covers both property lookup & sort)*
- `idx_property_features_property_id` on `property_features(property_id)`
- `idx_favorites_property_id` on `favorites(property_id)` *(reverse lookup; user_id is covered by unique constraint)*
- `idx_collections_user_id` on `collections(user_id)`
- `idx_collection_properties_property_id` on `collection_properties(property_id)` *(reverse lookup; collection_id covered by composite PK)*
- `idx_inquiries_user_id` on `inquiries(user_id)`
- `idx_inquiries_agent_id` on `inquiries(agent_id)`
- `idx_inquiries_property_id` on `inquiries(property_id)`
- `idx_inquiries_status` on `inquiries(status)`

---

## 6. Local Validation Checklist

- [x] Generated `202609220001_create_haven_schema.sql` migration file with `handle_updated_at()` trigger function and triggers
- [x] Generated `src/types/database.ts` TypeScript definitions
- [x] Verified non-destructive `ON DELETE RESTRICT` on `agents → properties` and `agents → inquiries`
- [x] Verified non-redundant indexes (removed duplicate single-column indexes on unique/PK columns)
- [x] Ran `npx tsc --noEmit` -> **Passed with 0 errors**
- [x] Ran `npm run build` -> **Passed with 0 errors**
