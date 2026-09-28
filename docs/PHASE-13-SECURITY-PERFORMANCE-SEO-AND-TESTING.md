# Phase 13 — Security, Performance, SEO & Testing Specification

**Document Path:** `docs/PHASE-13-SECURITY-PERFORMANCE-SEO-AND-TESTING.md`  
**Status:** Approved Architecture & Implementation Plan  
**Author:** HAVEN Engineering Team  
**Version:** 1.0  
**Target Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Supabase (`@supabase/ssr`), Zod, Schema.org (JSON-LD)  
**Dependencies:** Phase 05 (Database Architecture), Phase 06.1 (Supabase Security & Storage), Phase 07 (Authentication & Profiles), Phase 08 (Properties Core), Phase 09 (User Dashboard), Phase 10 (Agent Portal), Phase 11 (Advanced Product Features)

---

## 1. Executive Summary & Quality Mandate

Phase 13 establishes production-grade hardening, security auditing, performance optimization, luxury-tier SEO, and end-to-end regression testing across the entire HAVEN platform. 

HAVEN caters to high-net-worth individuals, ultra-luxury brokerage firms, and premier advisors. The platform must guarantee:
1. **Ironclad Data Protection**: Zero row-level security leaks, strict authorization boundaries, sanitization of client inputs, and encrypted credentials.
2. **Sub-second Luxury Performance**: Fast visual rendering (LCP < 2.0s), zero layout shifts (CLS < 0.05), and instant interactions (INP < 150ms) across desktop and mobile.
3. **Institutional SEO Authority**: Rich OpenGraph social cards, automatic XML sitemap generation, search engine crawler directives, and Schema.org structured data (`RealEstateListing`, `SingleFamilyResidence`, `BreadcrumbList`).
4. **Exhaustive Testing Matrix**: Systematic verification of all critical transactional and discovery flows prior to production deployment (Phase 14).

---

## 2. Security Hardening & Full RLS Audit

### 2.1 Row-Level Security (RLS) Matrix
Conduct a complete inspection across every table in the `public` schema to verify that no tables are left open or improperly permissive:

| Table | Operations | Anon Access | Authenticated User | Advisor / Owner | Service Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `profiles` | SELECT / UPDATE | Public bios only | Read self, update self | Read self, update self | Full access |
| `agents` | SELECT / UPDATE | Verified agents | Read all verified | Update own agent profile | Full access |
| `properties` | SELECT | `status = 'published'` | `status = 'published'` | All properties owned by agent | Full access |
| `properties` | INSERT / UPDATE / DELETE | None | None | Owned properties only (`agent_id = auth.agent_id`) | Full access |
| `property_images`| SELECT / INSERT / DELETE | Public read | None | Upload/Delete for owned properties | Full access |
| `favorites` | ALL | None | Manage own (`user_id = auth.uid()`) | Manage own (`user_id = auth.uid()`) | Full access |
| `collections` | ALL | None | Manage own (`user_id = auth.uid()`) | Manage own (`user_id = auth.uid()`) | Full access |
| `inquiries` | INSERT / SELECT | Create inquiry | View own submitted | View received for owned listings | Full access |
| `property_views` | INSERT / SELECT | Insert view | Insert view | Select aggregated for owned listings | Full access |

### 2.2 Storage Security & Asset Isolation
* Audit Supabase Storage buckets: `properties` and `avatars`.
* Validate that `properties` image uploads are restricted to verified agents and file types (`image/jpeg`, `image/png`, `image/webp`, `image/avif`).
* Validate file size caps (max 10MB per property image, max 2MB per avatar).
* Enforce deterministic, unguessable file path hierarchies (`properties/{property_id}/{uuid}.webp`).

### 2.3 Input Validation & Defensive Boundaries
* Strict Zod parsing on all Server Actions and Route Handlers:
  - Property creation/edit schema (`PropertyFormSchema`).
  - Buyer inquiry schema (`InquiryFormSchema`).
  - Profile update schema (`ProfileUpdateSchema`).
  - Search filter query parameters (`SearchFilterSchema`).
* Strip and sanitize HTML / script injection vectors in user-submitted descriptions or notes.

### 2.4 Sensitive Data & Environment Review
* Ensure zero exposure of `SUPABASE_SERVICE_ROLE_KEY` in any client-bundled module.
* Verify that only `NEXT_PUBLIC_` prefixed keys are referenced in client components.
* Verify security headers in Next.js (`proxy.ts` / `next.config.ts`):
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## 3. Performance Optimization & Core Web Vitals

```text
┌─────────────────────────────────────────────────────────────┐
│ 1. Image Optimization Pipeline                              │
│    - Responsive srcSets with modern formats (AVIF/WebP)     │
│    - Priority loading for Above-the-Fold hero images        │
│    - Aspect-ratio reservation to eliminate CLS              │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Streaming & Suspense Boundaries                          │
│    - Skeleton loaders matching luxury cards                 │
│    - Granular Suspense around interactive filters & maps    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Bundle & Dynamic Imports                                 │
│    - Dynamic import for heavy MapLibre / Leaflet modules    │
│    - Tree-shaking verification of lucide-react & date-fns   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Cache & Revalidation Strategy                            │
│    - ISR / Stale-While-Revalidate for public listings       │
│    - Targeted revalidatePath on advisor CRUD mutations     │
└─────────────────────────────────────────────────────────────┘
```

### 3.1 Next.js Image Optimization
* Ensure every property card and hero banner reserves exact aspect ratios to eliminate Cumulative Layout Shift (CLS).
* Set `priority` and `fetchPriority="high"` specifically on the primary hero image of `/properties/[slug]` and the home landing banner.
* Ensure fallback placeholders and smooth transition fades for asynchronous image loads.

### 3.2 Dynamic Component Splitting
* Ensure client-heavy components like MapLibre GL (`PropertyMap.tsx` and `PropertyLocationMap.tsx`) are strictly dynamically loaded via `next/dynamic({ ssr: false })` to keep the initial server-rendered HTML payload small.

### 3.3 Target Core Web Vitals
* **LCP (Largest Contentful Paint)**: < 2.0s
* **CLS (Cumulative Layout Shift)**: < 0.05
* **INP (Interaction to Next Paint)**: < 150ms
* **FCP (First Contentful Paint)**: < 1.2s

---

## 4. Luxury SEO & Metadata Engine

### 4.1 Page-Level Dynamic Metadata
Implement dynamic `generateMetadata()` in Next.js App Router for all public routes:
* **Marketplace Discovery** (`/properties`): Title: *"Curated Luxury Residences & Estates | HAVEN"*
* **Property Detail** (`/properties/[slug]`):
  - Dynamic Title: *`"{title} — {neighborhood}, {city} | HAVEN"`*
  - Dynamic Description: Editorial summary with bedroom count, square footage, and key amenities.
  - Canonical URL: `https://haven.luxury/properties/{slug}`
* **Agent Profile** (`/agents/[slug]`):
  - Title: *`"{agent_name} — Private Client Advisor | HAVEN"`*
  - Description: Advisor bio, active portfolio count, and luxury markets served.

### 4.2 OpenGraph & Twitter Social Cards
* Rich social card generation for every property listing.
* `og:image`: High-resolution property cover image (`1200x630`).
* `og:type`: `website` / `article`.
* Twitter Card: `summary_large_image`.

### 4.3 XML Sitemap & Robots Directives
* **`src/app/sitemap.ts`**:
  - Dynamically fetches published property slugs and verified agent slugs from Supabase.
  - Sets appropriate `changeFrequency` (`daily` for `/properties`, `weekly` for individual listings).
* **`src/app/robots.ts`**:
  - Allows public crawling of `/`, `/properties`, `/agents`, `/about`, `/contact`.
  - Disallows crawler indexing of private paths: `/dashboard/*`, `/agent/*`, `/auth/*`, `/api/*`.

### 4.4 Schema.org JSON-LD Structured Data
Embed rich microdata scripts into the DOM:
* **`RealEstateListing` & `SingleFamilyResidence`**:
  ```json
  {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": "The Obsidian Villa",
    "description": "Contemporary 5-bedroom waterfront villa with infinity pool",
    "offers": {
      "@type": "Offer",
      "price": 14500000,
      "priceCurrency": "USD"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 25.1234,
      "longitude": 55.2345
    }
  }
  ```
* **`Organization`**: Branding, logo, social links, customer support contact.
* **`BreadcrumbList`**: Structured navigation hierarchy for search engine breadcrumb displays.

---

## 5. Comprehensive Quality & Testing Matrix

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                             CRITICAL TEST FLOWS                          │
├──────────────────────────┬───────────────────────────────────────────────┤
│ 1. Public Marketplace    │ Search, multi-facet filtering, bounds query,  │
│                          │ sorting, split map sync, pagination           │
├──────────────────────────┼───────────────────────────────────────────────┤
│ 2. Property Dossier      │ Gallery lightbox, specs, coordinates map,     │
│                          │ similar residences carousel, inquiry modal    │
├──────────────────────────┼───────────────────────────────────────────────┤
│ 3. Authentication & User │ Sign-up, login, password recovery, session    │
│                          │ persistence, role redirection (buyer vs agent)│
├──────────────────────────┼───────────────────────────────────────────────┤
│ 4. Personalization       │ Favorite toggle, collection management,       │
│                          │ recently viewed history, profile update       │
├──────────────────────────┼───────────────────────────────────────────────┤
│ 5. Advisor Portal        │ Property creation, image uploads, edit,       │
│                          │ publish/draft toggle, analytics & inquiries   │
├──────────────────────────┼───────────────────────────────────────────────┤
│ 6. Security & RLS Leaks  │ Direct unauthenticated access to /agent,      │
│                          │ modifying other agent's listings, raw queries │
├──────────────────────────┼───────────────────────────────────────────────┤
│ 7. Cross-device & UI     │ iPhone/iPad/Desktop layouts, navigation menu, │
│                          │ touch interactions, dark/gold luxury theme    │
└──────────────────────────┴───────────────────────────────────────────────┘
```

---

## 6. Implementation Roadmap

```text
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Security Audit & RLS Verification                   │
│  - Audit and test all Supabase RLS policies                 │
│  - Verify storage bucket access rules and image upload caps │
│  - Audit security headers & sensitive environment variables │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Input Validation & Error Hardening                  │
│  - Standardize Zod schemas across all server mutations      │
│  - Verify safe error handling with zero database leakages   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Performance & Core Web Vitals Audit                 │
│  - Image optimization review (aspect ratios, priority tags) │
│  - Suspense & skeleton loading states across slow networks  │
│  - Production bundle analysis and tree-shaking              │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 4: Comprehensive SEO & Structured Data Engine          │
│  - Implement dynamic generateMetadata for all public routes │
│  - Create sitemap.ts and robots.ts route handlers           │
│  - Add JSON-LD RealEstateListing and Breadcrumb schemas     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 5: End-to-End Critical Flow Testing Matrix             │
│  - Execute and record results for all 7 critical user flows │
│  - Verify unauthorized access blocks and role redirection   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 6: Final Type-Check & Production Build Sign-Off        │
│  - Zero TypeScript compiler warnings (npx tsc --noEmit)     │
│  - Clean Next.js production build (npm run build)           │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Verification & Sign-off Criteria

1. **Security**:
   - Zero RLS bypasses: Unauthenticated or non-owner requests to private agent/user data return empty arrays or permission errors.
   - Zero exposed service role secrets in client bundles or network responses.
   - All server mutations enforce strict Zod validation.

2. **Performance**:
   - Clean production build with zero hydration mismatch errors.
   - Core Web Vitals in green thresholds for desktop and mobile.
   - Heavy map libraries dynamically loaded on demand.

3. **SEO**:
   - Valid `/sitemap.xml` generated dynamically with all published properties.
   - Valid `/robots.txt` properly shielding private portals.
   - Google Rich Results Test passes for Schema.org `RealEstateListing` JSON-LD.

4. **Reliability**:
   - Every critical user flow passes manual and automated checks.
   - `npx tsc --noEmit` exits with code 0.
   - `npm run build` exits with code 0.
