# HAVEN

## Database Design & Schema Specification

**Project:** HAVEN — Real Estate Discovery & Listing Platform
**Status:** Pre-Development
**Version:** 1.0
**Database:** PostgreSQL via Supabase

---

# 1. Database Overview

HAVEN will use PostgreSQL through Supabase as its primary database.

The database is designed around the following core concepts:

* Users
* Agents
* Properties
* Property Media
* Property Features
* Favorites
* Collections
* Inquiries

The database should prioritize:

* Data integrity
* Clear relationships
* Secure access
* Scalability
* Simple querying
* Proper ownership rules

---

# 2. Core Tables

The initial database will contain the following tables:

```text
profiles
agents
properties
property_images
property_features
favorites
collections
collection_properties
inquiries
```

---

# 3. Database Relationship Overview

```text
auth.users
    │
    ↓
profiles
    │
    ├───────────────┐
    │               │
    ↓               ↓
  agents         favorites
    │               │
    ↓               ↓
properties      properties
    │
    ├──────────────┬──────────────┐
    ↓              ↓              ↓
property_images  property_features  inquiries
                                     │
                                     │
                                  profiles
```

Collections:

```text
profiles
    │
    ↓
collections
    │
    ↓
collection_properties
    │
    ↓
properties
```

---

# 4. Table: profiles

## Purpose

Stores application-level information about authenticated users.

Authentication itself is handled by Supabase Auth.

The `profiles` table stores additional user information.

## Columns

| Column     | Type        | Required | Description                |
| ---------- | ----------- | -------: | -------------------------- |
| id         | uuid        |      Yes | Same ID as `auth.users.id` |
| full_name  | text        |      Yes | User's full name           |
| avatar_url | text        |       No | Profile avatar             |
| phone      | text        |       No | Phone number               |
| bio        | text        |       No | User biography             |
| created_at | timestamptz |      Yes | Creation timestamp         |
| updated_at | timestamptz |      Yes | Last update timestamp      |

## Primary Key

```text
id
```

## Relationship

```text
auth.users.id → profiles.id
```

Each authenticated user should have one profile.

---

# 5. Table: agents

## Purpose

Stores additional information for users who act as real estate agents.

An agent is associated with one application profile.

## Columns

| Column             | Type        | Required | Description             |
| ------------------ | ----------- | -------: | ----------------------- |
| id                 | uuid        |      Yes | Agent ID                |
| profile_id         | uuid        |      Yes | Related user profile    |
| company_name       | text        |       No | Agency/company name     |
| professional_title | text        |       No | Agent title             |
| bio                | text        |       No | Professional biography  |
| phone              | text        |       No | Professional phone      |
| email              | text        |       No | Professional email      |
| license_number     | text        |       No | Optional license number |
| created_at         | timestamptz |      Yes | Creation timestamp      |
| updated_at         | timestamptz |      Yes | Last update timestamp   |

## Primary Key

```text
id
```

## Foreign Key

```text
profile_id → profiles.id
```

## Relationship

```text
profiles 1 ─── 0..1 agents
```

A user may or may not be an agent.

---

# 6. Table: properties

## Purpose

Stores the main information about real estate properties.

This is the central table of the platform.

## Columns

| Column         | Type        | Required | Description                         |
| -------------- | ----------- | -------: | ----------------------------------- |
| id             | uuid        |      Yes | Property ID                         |
| agent_id       | uuid        |      Yes | Owner/agent responsible for listing |
| title          | text        |      Yes | Property title                      |
| slug           | text        |      Yes | SEO-friendly URL identifier         |
| description    | text        |      Yes | Property description                |
| price          | numeric     |      Yes | Property price                      |
| listing_type   | text        |      Yes | Sale or rent                        |
| property_type  | text        |      Yes | Apartment, villa, etc.              |
| bedrooms       | integer     |       No | Number of bedrooms                  |
| bathrooms      | integer     |       No | Number of bathrooms                 |
| area           | numeric     |       No | Property area                       |
| parking_spaces | integer     |       No | Number of parking spaces            |
| year_built     | integer     |       No | Construction year                   |
| country        | text        |      Yes | Country                             |
| city           | text        |      Yes | City                                |
| neighborhood   | text        |       No | Area/neighborhood                   |
| address        | text        |       No | Property address                    |
| latitude       | numeric     |       No | Latitude                            |
| longitude      | numeric     |       No | Longitude                           |
| status         | text        |      Yes | Draft, published, archived          |
| created_at     | timestamptz |      Yes | Creation timestamp                  |
| updated_at     | timestamptz |      Yes | Last update timestamp               |

## Primary Key

```text
id
```

## Foreign Key

```text
agent_id → agents.id
```

## Suggested Listing Types

```text
sale
rent
```

## Suggested Property Types

```text
apartment
villa
studio
chalet
townhouse
penthouse
```

The system should allow additional property types later.

## Suggested Statuses

```text
draft
published
archived
```

Only `published` properties should appear in public property discovery.

---

# 7. Table: property_images

## Purpose

Stores images belonging to properties.

Images themselves will be stored in Supabase Storage.

This table stores metadata and references to those images.

## Columns

| Column      | Type        | Required | Description                      |
| ----------- | ----------- | -------: | -------------------------------- |
| id          | uuid        |      Yes | Image ID                         |
| property_id | uuid        |      Yes | Related property                 |
| image_url   | text        |      Yes | Storage/public image URL         |
| sort_order  | integer     |      Yes | Display order                    |
| is_cover    | boolean     |      Yes | Whether image is the cover image |
| created_at  | timestamptz |      Yes | Creation timestamp               |

## Primary Key

```text
id
```

## Foreign Key

```text
property_id → properties.id
```

## Relationship

```text
property 1 ─── many property_images
```

A property can have multiple images.

---

# 8. Table: property_features

## Purpose

Stores features and amenities associated with properties.

Examples:

```text
Swimming Pool
Garage
Garden
Security
Smart Home
Central AC
Elevator
Gym
```

## Columns

| Column      | Type        | Required | Description        |
| ----------- | ----------- | -------: | ------------------ |
| id          | uuid        |      Yes | Feature record ID  |
| property_id | uuid        |      Yes | Related property   |
| feature     | text        |      Yes | Feature name       |
| created_at  | timestamptz |      Yes | Creation timestamp |

## Primary Key

```text
id
```

## Foreign Key

```text
property_id → properties.id
```

## Relationship

```text
property 1 ─── many property_features
```

---

# 9. Table: favorites

## Purpose

Stores properties saved by users.

## Columns

| Column      | Type        | Required | Description                 |
| ----------- | ----------- | -------: | --------------------------- |
| id          | uuid        |      Yes | Favorite ID                 |
| user_id     | uuid        |      Yes | User who saved the property |
| property_id | uuid        |      Yes | Saved property              |
| created_at  | timestamptz |      Yes | Creation timestamp          |

## Primary Key

```text
id
```

## Foreign Keys

```text
user_id → profiles.id
property_id → properties.id
```

## Important Constraint

A user should not be able to favorite the same property twice.

Therefore:

```text
UNIQUE(user_id, property_id)
```

---

# 10. Table: collections

## Purpose

Allows users to organize saved properties into custom groups.

Examples:

```text
Dream Home
Investment Opportunities
New Cairo
Weekend Homes
Properties to Visit
```

## Columns

| Column     | Type        | Required | Description           |
| ---------- | ----------- | -------: | --------------------- |
| id         | uuid        |      Yes | Collection ID         |
| user_id    | uuid        |      Yes | Collection owner      |
| name       | text        |      Yes | Collection name       |
| created_at | timestamptz |      Yes | Creation timestamp    |
| updated_at | timestamptz |      Yes | Last update timestamp |

## Primary Key

```text
id
```

## Foreign Key

```text
user_id → profiles.id
```

## Relationship

```text
profile 1 ─── many collections
```

---

# 11. Table: collection_properties

## Purpose

Connects collections with properties.

This is a many-to-many relationship.

A collection can contain many properties.

A property can belong to many collections.

## Columns

| Column        | Type        | Required | Description        |
| ------------- | ----------- | -------: | ------------------ |
| collection_id | uuid        |      Yes | Related collection |
| property_id   | uuid        |      Yes | Related property   |
| created_at    | timestamptz |      Yes | Creation timestamp |

## Composite Primary Key

```text
(collection_id, property_id)
```

## Foreign Keys

```text
collection_id → collections.id
property_id → properties.id
```

---

# 12. Table: inquiries

## Purpose

Stores messages sent by users to agents regarding properties.

## Columns

| Column      | Type        | Required | Description             |
| ----------- | ----------- | -------: | ----------------------- |
| id          | uuid        |      Yes | Inquiry ID              |
| user_id     | uuid        |      Yes | User sending inquiry    |
| agent_id    | uuid        |      Yes | Agent receiving inquiry |
| property_id | uuid        |      Yes | Related property        |
| message     | text        |      Yes | Inquiry message         |
| status      | text        |      Yes | Inquiry status          |
| created_at  | timestamptz |      Yes | Creation timestamp      |
| updated_at  | timestamptz |      Yes | Last update timestamp   |

## Primary Key

```text
id
```

## Foreign Keys

```text
user_id → profiles.id
agent_id → agents.id
property_id → properties.id
```

## Suggested Statuses

```text
new
contacted
closed
```

---

# 13. Complete Relationship Map

```text
auth.users
     │
     │ 1:1
     ↓
 profiles
     │
     ├───────────────┐
     │               │
     │ 0:1           │ 1:N
     ↓               ↓
  agents         favorites
     │               │
     │ 1:N           │ N:1
     ↓               │
 properties ◄────────┘
     │
     ├───────────────┐
     │               │
     │ 1:N           │ 1:N
     ↓               ↓
property_images  property_features
     │
     │
     └────────────────────────┐
                              ↓
                           inquiries
                              ↑
                              │
                           profiles


profiles
   │
   │ 1:N
   ↓
collections
   │
   │ N:N
   ↓
collection_properties
   │
   ↓
properties
```

---

# 14. Ownership Model

The ownership chain is:

```text
auth.users
     ↓
profiles
     ↓
agents
     ↓
properties
```

Therefore:

```text
Authenticated User
        ↓
      Profile
        ↓
      Agent
        ↓
     Property
```

This allows RLS to determine whether an agent owns a property.

---

# 15. Public Data Rules

Public visitors should be able to access:

### Published Properties

```text
properties.status = 'published'
```

### Public Property Images

Images associated with published properties should be accessible according to Storage policy.

### Agent Public Profiles

Public agent information can be displayed.

Private user information should not be exposed.

---

# 16. User Data Rules

A registered user should be able to:

### Favorites

Create, read, and delete only their own favorites.

### Collections

Create, read, update, and delete only their own collections.

### Collection Properties

Manage only collection items belonging to their own collections.

### Profile

Read and update their own profile.

---

# 17. Agent Data Rules

An agent should be able to:

### Properties

* Create their own properties
* Read their own properties
* Update their own properties
* Delete their own properties
* Publish their own properties
* Archive their own properties

### Images

Manage images belonging to their own properties.

### Inquiries

Read inquiries related to their properties.

Update inquiry status for inquiries they receive.

---

# 18. Inquiry Access Rules

Users should be able to:

* Create inquiries
* Read their own inquiries

Agents should be able to:

* Read inquiries for their properties
* Update inquiry status

Users should not be able to access another user's inquiries.

Agents should not be able to access inquiries belonging to unrelated agents.

---

# 19. Important Constraints

The database should enforce data integrity.

Examples:

### Favorites

```text
UNIQUE(user_id, property_id)
```

### Collection Properties

```text
PRIMARY KEY(collection_id, property_id)
```

### Property Slug

Property slugs should be unique.

```text
UNIQUE(slug)
```

### Required Relationships

Properties must belong to an existing agent.

Favorites must reference existing users and properties.

Collections must belong to an existing user.

---

# 20. Suggested Indexes

Indexes should be added where they support common queries.

Potential indexes:

```text
properties.slug
properties.status
properties.listing_type
properties.property_type
properties.city
properties.price
properties.agent_id

property_images.property_id

property_features.property_id

favorites.user_id
favorites.property_id

collections.user_id

collection_properties.collection_id
collection_properties.property_id

inquiries.user_id
inquiries.agent_id
inquiries.property_id
inquiries.status
```

Indexes should be reviewed as the application grows rather than adding unnecessary indexes everywhere.

---

# 21. Property Search Considerations

The property database should support common discovery queries.

Examples:

```text
Find published properties
Find properties by city
Find properties by property type
Find properties for sale
Find properties for rent
Find properties within a price range
Find properties by number of bedrooms
Find properties by area
```

More advanced search can be introduced later.

---

# 22. Location Data

For the initial version, properties will store:

```text
country
city
neighborhood
address
latitude
longitude
```

This allows future map functionality.

Potential future improvements:

* PostGIS
* Geographic radius search
* Polygon/area search
* Nearby properties
* Advanced map filtering

These are not required for the initial database version.

---

# 23. Storage Structure

Supabase Storage will initially contain:

```text
property-images
avatars
```

Suggested logical organization:

```text
property-images/
    {property_id}/
        image-1
        image-2
        image-3

avatars/
    {user_id}/
        avatar
```

The database stores references to the files.

Storage policies must follow the same ownership rules as the database.

---

# 24. Soft Delete Strategy

The initial version will use property status instead of immediately deleting every property record.

Example:

```text
draft
published
archived
```

An archived property should no longer appear in public discovery.

Hard deletion should be handled carefully because other records may reference the property.

---

# 25. Timestamps

All major tables should use:

```text
created_at
updated_at
```

Timestamps should be stored using:

```text
timestamptz
```

The database should manage timestamps consistently.

---

# 26. Database Security Principle

The frontend should never be treated as the primary security layer.

For example, hiding an "Edit" button is not enough.

The system must enforce:

```text
Frontend
   ↓
UX restriction

RLS
   ↓
Actual security
```

Even if a user manually sends a database request, RLS must prevent unauthorized access.

---

# 27. Initial Database Scope

The first database version should contain only what is required for the MVP.

### Required

```text
profiles
agents
properties
property_images
property_features
favorites
collections
collection_properties
inquiries
```

### Not required yet

```text
notifications
messages
appointments
reviews
payments
subscriptions
analytics
saved_searches
recommendations
ai_conversations
```

These can be introduced later when the related product features are implemented.

---

# 28. Database Implementation Order

The actual database should be created in this order:

```text
1. profiles
        ↓
2. agents
        ↓
3. properties
        ↓
4. property_images
        ↓
5. property_features
        ↓
6. favorites
        ↓
7. collections
        ↓
8. collection_properties
        ↓
9. inquiries
        ↓
10. Indexes
        ↓
11. RLS Policies
        ↓
12. Storage Buckets
        ↓
13. Storage Policies
```

---

# 29. Database Validation Checklist

Before moving to application development, verify:

* [ ] All tables exist
* [ ] Primary keys are correct
* [ ] Foreign keys are correct
* [ ] Relationships work correctly
* [ ] Required fields are enforced
* [ ] Unique constraints work
* [ ] Property slugs are unique
* [ ] Favorites cannot be duplicated
* [ ] Collection properties cannot be duplicated
* [ ] Indexes exist where required
* [ ] RLS is enabled
* [ ] RLS policies are tested
* [ ] Storage buckets exist
* [ ] Storage policies are tested
* [ ] Public property access works
* [ ] User ownership rules work
* [ ] Agent ownership rules work

---

# 30. Current Project Status

Completed:

```text
Business Documentation
        ✓

Technical Architecture
        ✓

Database Design
        ✓
```

Next:

```text
Supabase Project Setup
        ↓
Database Implementation
        ↓
RLS & Storage Security
        ↓
Next.js Project Setup
        ↓
Authentication
```

---

# 31. Important Development Rule

The database should not be modified randomly during development.

Before changing the schema:

```text
Requirement
    ↓
Determine database impact
    ↓
Update schema design
    ↓
Create migration
    ↓
Apply migration
    ↓
Test
```

All important database changes should be tracked through migrations/version control.

---

# 32. Final Database Architecture

```text
                         SUPABASE
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
         AUTH          POSTGRESQL          STORAGE
          │                 │                 │
          ↓                 ↓                 ↓
      auth.users        profiles          avatars
                           │
                           ↓
                         agents
                           │
                           ↓
                       properties
                      /     │      \
                     /      │       \
                    ↓       ↓        ↓
                 images  features  inquiries

profiles
   │
   ├── favorites ───────────→ properties
   │
   └── collections
           │
           ↓
   collection_properties
           │
           ↓
       properties
```

This is the initial database architecture for HAVEN and should be treated as the reference design before implementation.
