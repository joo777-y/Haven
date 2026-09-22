# HAVEN — Project Master Implementation Plan

**Project:** HAVEN — Real Estate Discovery & Listing Platform

**Architecture Source:** Technical Architecture Document

**Status:** Approved Architecture → Phased Implementation

**Version:** 2.0

---

## Technical Overview & Stack Summary

HAVEN is a full-stack real estate discovery and listing platform focused on visual discovery, simple user experiences, scalable architecture, secure data access, and a premium editorial design system.

* **Frontend Framework:** Next.js 16 (App Router) + React 19 + TypeScript
* **Styling & Design System:** Tailwind CSS v4 + Custom Design Tokens + Lucide Icons
* **Backend Infrastructure:** Supabase (PostgreSQL, Supabase Auth, Storage, Row Level Security)
* **Deployment & Hosting:** Vercel + GitHub CI/CD
* **AI & Dev Tooling:** Anti Gravity IDE + Supabase MCP
* **Development Strategy:** UI-first with Mock Data → Real Data Integration

---

# Phased Implementation Roadmap

```text
Phase 0: Product Definition
        ↓
Phase 1: Project Foundation & Environment Setup
        ↓
Phase 2: Design System & Application Structure
        ↓
Phase 3: Core UI System
        ↓
Phase 4: Public Website & Mock Data
        ↓
Phase 5: Database Architecture & Schema
        ↓
Phase 6: Supabase Security & Storage
        ↓
Phase 7: Authentication & Authorization
        ↓
Phase 8: Connect Public Platform to Real Data
        ↓
Phase 9: User Dashboard & Personalization
        ↓
Phase 10: Agent Portal & Property Management
        ↓
Phase 11: Advanced Product Features
        ↓
Phase 12: AI Search & Intelligence
        ↓
Phase 13: Security, Performance, SEO & Testing
        ↓
Phase 14: Deployment & CI/CD
```

---

# Phase 0: Product Definition

## Goals

Define the product, users, workflows, MVP scope, and long-term direction before implementation.

## Key Tasks

* [x] Define HAVEN product vision
* [x] Define target users
* [x] Define Visitor experience
* [x] Define Registered User experience
* [x] Define Agent experience
* [x] Define future Admin role
* [x] Define core user flows
* [x] Define public routes
* [x] Define authentication routes
* [x] Define user dashboard routes
* [x] Define agent routes
* [x] Define MVP scope
* [x] Define future features
* [x] Define product principles
* [x] Define possible business models

### Core Product Flows

```text
Seeker
Discover → Search → View Property → Save → Contact Agent

Agent
Create → Publish → Manage → Receive Inquiry → Convert
```

---

# Phase 1: Project Foundation & Environment Setup

## Goals

Establish a clean, type-safe Next.js project and prepare the development environment without prematurely implementing business logic.

## Key Tasks

* [x] Next.js 16 App Router setup
* [x] React 19
* [x] TypeScript
* [x] Tailwind CSS v4
* [x] `src/` directory
* [x] Path alias `@/*`
* [x] Environment variables
* [x] Install `@supabase/supabase-js`
* [x] Install `@supabase/ssr`
* [x] Create browser Supabase client
* [x] Create server Supabase client
* [x] Verify Next.js → Supabase connection
* [x] Install Supabase Agent Skills
* [ ] Final Git/GitHub setup
* [ ] Basic README
* [ ] Establish development conventions

### Important

Supabase connection at this stage is only groundwork.

Database schema, authentication, RLS, and Storage will be implemented in later phases when the product UI and data requirements are sufficiently defined.

---

# Phase 2: Design System & Application Structure

## Goals

Establish HAVEN's visual language, typography, responsive foundations, route structure, and shared application layouts.

## Design System

### Key Tasks

* [x] Define color tokens
* [x] Define typography
* [x] Configure Playfair Display
* [x] Configure Plus Jakarta Sans
* [x] Define border radius
* [x] Define shadows
* [ ] Define spacing tokens
* [ ] Define container system
* [ ] Define grid system
* [ ] Define responsive breakpoints
* [ ] Define common transitions
* [ ] Define visual states

### Canonical Brand Tokens

```text
Primary:      #1E2022
Secondary:    #C26D45
Tertiary:     #5E6C5B
Canvas:       #F7F6F2
White:        #FFFFFF
Divider:      #E6E4DD
```

### Typography

```text
Display / Headlines → Playfair Display
UI / Body          → Plus Jakarta Sans
```

## Application Structure

### Public Routes

```text
/
├── properties
│   └── [slug]
├── agents
│   └── [slug]
├── about
└── contact
```

### Authentication Routes

```text
/auth
├── login
├── register
└── forgot-password
```

### User Routes

```text
/dashboard
├── saved
├── collections
├── profile
└── settings
```

### Agent Routes

```text
/agent
├── properties
│   ├── new
│   └── [id]/edit
├── inquiries
└── profile
```

### Key Tasks

* [x] Public route structure
* [x] Public route group
* [x] Initial public layout
* [ ] Authentication route structure
* [ ] Dashboard route structure
* [ ] Agent route structure
* [ ] Dashboard layout
* [ ] Agent layout
* [ ] Final responsive application structure

---

# Phase 3: Core UI System

## Goals

Build a small, reusable component system based on actual HAVEN product requirements.

The project will not create a large abstract component library prematurely. Components will be introduced when they solve a real UI requirement.

## Layout Components

* [ ] Header
* [ ] Footer
* [ ] Container
* [ ] Section wrapper

## UI Components

* [ ] Button
* [ ] Badge
* [ ] Input
* [ ] Select
* [ ] Search Input
* [ ] Chip
* [ ] Icon Button

## Real Estate Components

* [ ] PropertyCard
* [ ] AgentCard
* [ ] PropertyGallery
* [ ] PropertySpecs
* [ ] SearchConsole
* [ ] FilterPanel

## Feedback Components

Implemented only when required:

* [ ] Modal
* [ ] Drawer
* [ ] Toast
* [ ] Skeleton
* [ ] Empty State
* [ ] Error State

---

# Phase 4: Public Website & Mock Data

## Goals

Build HAVEN as a real, navigable product using mock data before connecting the UI to the production database.

This phase validates the product experience, visual design, responsive behavior, and component architecture before backend integration.

---

## Homepage `/`

### Sections

```text
Header
   ↓
Hero
   ↓
Search Console
   ↓
Stats
   ↓
Featured Properties
   ↓
Explore by Architecture & Lifestyle
   ↓
Featured Agents
   ↓
CTA
   ↓
Footer
```

### Key Tasks

* [ ] Build Hero Section
* [ ] Add Hero imagery
* [ ] Build Hero Search Console
* [ ] Build Stats Section
* [ ] Build Featured Properties Section
* [ ] Build Property Cards
* [ ] Build Lifestyle / Architecture Section
* [ ] Build Agent Section
* [ ] Build Agent Cards
* [ ] Build CTA Section
* [ ] Build Footer
* [ ] Responsive homepage
* [ ] Mobile experience
* [ ] Visual polish

---

## Properties Catalog `/properties`

### Key Tasks

* [ ] Property grid
* [ ] Mock property data
* [ ] Search UI
* [ ] Filter UI
* [ ] Property type filter
* [ ] Price filter
* [ ] Bedroom filter
* [ ] Bathroom filter
* [ ] Amenities filter
* [ ] Sorting UI
* [ ] Grid/List toggle
* [ ] Pagination UI
* [ ] Empty state
* [ ] Mobile filter experience
* [ ] Responsive layout

All data remains mocked during this phase.

---

## Property Details `/properties/[slug]`

### Key Tasks

* [ ] Property gallery
* [ ] Image navigation
* [ ] Property title
* [ ] Price
* [ ] Property specifications
* [ ] Description
* [ ] Features
* [ ] Location section
* [ ] Agent information
* [ ] Contact CTA
* [ ] Save button UI
* [ ] Similar properties UI
* [ ] Responsive layout

---

## Agents Directory `/agents`

### Key Tasks

* [ ] Agent listing
* [ ] Mock agent data
* [ ] Agent cards
* [ ] Search UI
* [ ] Responsive layout

---

## Agent Profile `/agents/[slug]`

### Key Tasks

* [ ] Agent profile header
* [ ] Agent information
* [ ] Bio
* [ ] Contact information
* [ ] Active listings
* [ ] Property cards
* [ ] Responsive layout

---

## Information Pages

### `/about`

* [ ] About page structure
* [ ] Brand story
* [ ] Visual sections

### `/contact`

* [ ] Contact page
* [ ] Contact form UI
* [ ] Contact information
* [ ] Responsive layout

---

# Phase 5: Database Architecture & Schema

## Goals

Translate the validated product requirements and UI data requirements into a clean relational PostgreSQL schema.

Database design must follow actual product requirements rather than adding fields simply because they appear visually useful.

## Core Tables

### `profiles`

User profile information linked to Supabase Auth.

```text
id
full_name
avatar_url
phone
bio
created_at
updated_at
```

### `agents`

Agent-specific professional information.

```text
id
profile_id
company_name
professional_title
bio
phone
email
license_number
created_at
updated_at
```

### `properties`

Core real estate listings.

```text
id
agent_id
title
slug
description
price
listing_type
property_type
bedrooms
bathrooms
area
parking_spaces
year_built
country
city
neighborhood
address
latitude
longitude
status
created_at
updated_at
```

### `property_images`

```text
id
property_id
image_url
sort_order
is_cover
created_at
```

### `property_features`

```text
id
property_id
feature
created_at
```

### `favorites`

```text
id
user_id
property_id
created_at
```

Unique constraint:

```text
(user_id, property_id)
```

### `collections`

```text
id
user_id
name
created_at
updated_at
```

### `collection_properties`

```text
collection_id
property_id
created_at
```

### `inquiries`

```text
id
user_id
agent_id
property_id
message
status
created_at
updated_at
```

### Key Tasks

* [ ] Final schema review
* [ ] Define relationships
* [ ] Define constraints
* [ ] Define indexes
* [ ] Define status strategy
* [ ] Create migrations
* [ ] Create database triggers where required
* [ ] Seed development data
* [ ] Verify schema using Supabase MCP where useful

---

# Phase 6: Supabase Security & Storage

## Goals

Implement secure access to database records and uploaded media.

## Row Level Security

### Public

* [ ] Read published properties
* [ ] Read public property images
* [ ] Read property features
* [ ] Read public agent information

### Registered Users

* [ ] Read/update own profile
* [ ] Manage own favorites
* [ ] Manage own collections
* [ ] Manage own collection properties
* [ ] Create/read own inquiries

### Agents

* [ ] Manage own properties
* [ ] Manage own property images
* [ ] Manage own property features
* [ ] Read/manage relevant inquiries

## Storage

### Buckets

```text
property-images
avatars
```

### Key Tasks

* [ ] Create Storage buckets
* [ ] Configure public read policies where appropriate
* [ ] Configure authenticated upload policies
* [ ] Configure agent property-image permissions
* [ ] Test unauthorized access
* [ ] Test unauthorized mutations
* [ ] Review RLS policies

### Supabase MCP

MCP can be used here for:

```text
Schema inspection
↓
Migration assistance
↓
RLS inspection
↓
Query debugging
↓
Type generation
```

---

# Phase 7: Authentication & Authorization

## Goals

Implement secure authentication, sessions, profiles, and role-based access.

## Authentication

### Key Tasks

* [x] Login (`/auth/login`, `LoginForm`, `signInAction`)
* [x] Registration (`/auth/register`, `RegisterForm`, `signUpAction`)
* [x] Logout (`signOutAction`, `useAuth.signOut`)
* [x] Session persistence (`@supabase/ssr` cookies, `middleware.ts`)
* [x] Password reset (`/auth/forgot-password`, `/auth/reset-password`, `/auth/callback`)
* [x] Profile creation trigger (PostgreSQL trigger + `profiles` sync)
* [x] Profile update (`/dashboard/profile`, `ProfileForm`, `updateProfileAction`, `uploadAvatar`)
* [x] Auth error handling (Zod validation schemas, inline & toast alerts)
* [x] Loading states (Submitting spinners, disabled states, Suspense fallbacks)

## Authorization

Core user types:

```text
Visitor
Registered User
Agent
Future Admin
```

### Key Tasks

* [x] Define role strategy (Deterministic database state: `profiles` + `agents.profile_id = auth.uid()`)
* [x] Implement protected routes (Edge middleware + Server Component layout guards)
* [x] Protect `/dashboard/*` (Redirects guests to `/auth/login?redirect=...`)
* [x] Protect `/agent/*` (Redirects non-agents to `/agent/register` onboarding)
* [x] Verify agent authorization (`getUserRoleState()`, Server Actions verification)
* [x] Verify user ownership (RLS + Server verification)
* [x] Test unauthorized access (Guarded middleware + build validation)

---

# Phase 8: Connect Public Platform to Real Data

## Goals

Replace mock data with Supabase data without rewriting the established UI architecture.

```text
Mock Data
   ↓
Supabase Data
```

## Properties

* [ ] Fetch published properties
* [ ] Property details
* [ ] Search
* [ ] Filters
* [ ] Sorting
* [ ] Pagination
* [ ] Property images
* [ ] Property features

## Agents

* [ ] Agent listing
* [ ] Agent details
* [ ] Agent properties

## User Actions

* [ ] Save property
* [ ] Remove save
* [ ] Collections
* [ ] Contact agent
* [ ] Create inquiry

## Important

Existing UI components should remain stable.

The main change should be the data source, not a complete rewrite of the UI.

---

# Phase 9: User Dashboard & Personalization

## Goals

Give registered users a personal workspace for saved properties, collections, profiles, and inquiries.

## Dashboard `/dashboard`

* [ ] Dashboard overview
* [ ] Recent activity
* [ ] Saved property summary
* [ ] Inquiry summary
* [ ] Responsive dashboard layout

## Saved `/dashboard/saved`

* [ ] Saved listings
* [ ] Remove saved property
* [ ] Open property details
* [ ] Empty state

## Collections `/dashboard/collections`

* [ ] Create collection
* [ ] Rename collection
* [ ] Delete collection
* [ ] Add property
* [ ] Remove property
* [ ] Collection details

## Profile `/dashboard/profile`

* [ ] Profile information
* [ ] Avatar
* [ ] Phone
* [ ] Bio
* [ ] Profile update

## Settings `/dashboard/settings`

* [ ] Account settings
* [ ] Preferences
* [ ] Future notification settings

---

# Phase 10: Agent Portal & Property Management

## Goals

Give agents a complete workspace for creating, publishing, managing, and monitoring their property listings and inquiries.

## Agent Overview `/agent`

* [ ] Dashboard layout
* [ ] Active listings
* [ ] Listing statistics
* [ ] Inquiry summary
* [ ] Recent activity

## Property Manager `/agent/properties`

* [ ] Property list
* [ ] Search
* [ ] Status filters
* [ ] Edit property
* [ ] Delete property
* [ ] Publish
* [ ] Unpublish
* [ ] Archive

## Create Property

### `/agent/properties/new`

Property creation flow:

```text
Basic Information
        ↓
Location
        ↓
Specifications & Features
        ↓
Images
        ↓
Review
        ↓
Publish
```

### Key Tasks

* [ ] Property form
* [ ] Validation
* [ ] Location fields
* [ ] Property specifications
* [ ] Amenities
* [ ] Image upload
* [ ] Image preview
* [ ] Cover image
* [ ] Image ordering
* [ ] Draft saving
* [ ] Review step
* [ ] Publish

## Edit Property

### `/agent/properties/[id]/edit`

* [ ] Load existing property
* [ ] Edit information
* [ ] Edit images
* [ ] Update features
* [ ] Save changes
* [ ] Publish/unpublish
* [ ] Archive

## Inquiry Portal `/agent/inquiries`

* [ ] Inquiry list
* [ ] Filter by status
* [ ] View inquiry
* [ ] Contact information
* [ ] Mark contacted
* [ ] Close inquiry

---

# Phase 11: Advanced Product Features

## Goals

Improve discovery, navigation, and marketplace intelligence after the core platform is stable.

## Maps

* [ ] Select map provider
* [ ] Property location display
* [ ] Property markers
* [ ] Map/List split view
* [ ] Location-based search

## Discovery

* [ ] Similar properties
* [ ] Recently viewed properties
* [ ] Improved sorting
* [ ] Search history
* [ ] Better recommendations

## Analytics

* [ ] Property views
* [ ] Property saves
* [ ] Inquiry metrics
* [ ] Agent activity
* [ ] Listing performance

These features are not required for the initial MVP.

---

# Phase 12: AI Search & Intelligence

## Goals

Add AI capabilities on top of an already stable property search and discovery system.

## Smart Search

Example:

```text
"3 bedroom modern villa near the beach under $3M with a pool"
```

Expected flow:

```text
Natural Language Query
        ↓
AI Intent / Filter Extraction
        ↓
Structured Search Parameters
        ↓
Existing Property Search
        ↓
Filtered Results
```

## Key Tasks

* [ ] Natural-language query parsing
* [ ] Search intent extraction
* [ ] Property recommendations
* [ ] Similar property intelligence
* [ ] AI assistant
* [ ] Personalized discovery

### Important

AI should enhance the existing search system rather than replace it.

---

# Phase 13: Security, Performance, SEO & Testing

## Goals

Prepare HAVEN for production-level quality.

## Security

* [ ] Full RLS audit
* [ ] Authorization audit
* [ ] Storage policy audit
* [ ] Input validation
* [ ] Error handling
* [ ] Sensitive data review
* [ ] Unauthorized-access testing
* [ ] Agent ownership testing

## Performance

* [ ] `next/image`
* [ ] Image optimization
* [ ] Loading states
* [ ] Appropriate caching
* [ ] Bundle review
* [ ] Core Web Vitals
* [ ] Responsive performance

## SEO

* [ ] Page metadata
* [ ] Dynamic property metadata
* [ ] Agent metadata
* [ ] OpenGraph
* [ ] Sitemap
* [ ] Robots
* [ ] Structured data where useful

## Testing

### Critical Flows

* [ ] Public browsing
* [ ] Property search
* [ ] Property details
* [ ] Authentication
* [ ] Favorites
* [ ] Collections
* [ ] Inquiries
* [ ] Agent CRUD
* [ ] Image uploads
* [ ] RLS/security
* [ ] Responsive behavior

---

# Phase 14: Deployment & CI/CD

## Goals

Deploy HAVEN to production with a reliable Git-based workflow.

## GitHub

```text
Local Development
       ↓
Git
       ↓
GitHub
```

### Key Tasks

* [ ] Final repository setup
* [ ] Branch strategy
* [ ] `.gitignore`
* [ ] Commit conventions
* [ ] Pull request workflow
* [ ] CI checks

## Vercel

```text
GitHub
   ↓
Vercel
   ↓
Production
```

### Key Tasks

* [ ] Create Vercel project
* [ ] Connect GitHub repository
* [ ] Configure production environment variables
* [ ] Configure Supabase production settings
* [ ] Verify production build
* [ ] Preview deployments
* [ ] Production deployment
* [ ] Verify production functionality
* [ ] Establish deployment workflow

---

# Current Status & Next Execution Steps

## Current Status

```text
Phase 0 — Product Definition
██████████  Done

Phase 1 — Foundation
██████████  Done

Phase 2 — Design System & Structure
██████░░░░  In Progress

Phase 3 — Core UI
░░░░░░░░░░  Next

Phase 4 — Public Website
░░░░░░░░░░

Phase 5 — Database
░░░░░░░░░░

Phase 6 — Security & Storage
░░░░░░░░░░

Phase 7 — Authentication
░░░░░░░░░░

Phase 8 — Real Data
░░░░░░░░░░

Phase 9 — User Experience
░░░░░░░░░░

Phase 10 — Agent Experience
░░░░░░░░░░

Phase 11 — Advanced Features
░░░░░░░░░░

Phase 12 — AI
░░░░░░░░░░

Phase 13 — Quality
░░░░░░░░░░

Phase 14 — Deployment
░░░░░░░░░░
```

## Completed So Far

* [x] Product & Business Documentation
* [x] Technical Architecture
* [x] Database Design specification
* [x] Next.js project setup
* [x] TypeScript
* [x] Tailwind CSS v4
* [x] Supabase project
* [x] Supabase client/server setup
* [x] Supabase connection verification
* [x] Playfair Display
* [x] Plus Jakarta Sans
* [x] HAVEN design tokens
* [x] Public route structure
* [x] Initial public layout
* [x] Initial Header structure

## Current Milestone

**Phase 2 — Design System & Application Structure**

## Next Immediate Actions

```text
1. Finish Header
       ↓
2. Build Footer
       ↓
3. Build Container / Section primitives
       ↓
4. Build Button
       ↓
5. Build Badge / basic UI
       ↓
6. Build Hero Section
       ↓
7. Build Hero Search Console
       ↓
8. Build Homepage sections
       ↓
9. Complete Public Website with Mock Data
```

## Development Rule

HAVEN will be implemented **feature-first and just-in-time**.

We will not build infrastructure simply because it exists in the technology stack.

Examples:

```text
Need authentication?
        → Learn / implement Supabase Auth

Need protected data?
        → Implement RLS

Need image uploads?
        → Implement Storage

Need database queries?
        → Implement the required schema

Need AI development assistance?
        → Use Supabase MCP where it provides real value
```

The goal is to build HAVEN as a real product while learning the underlying technologies through actual implementation rather than studying each technology in isolation.
