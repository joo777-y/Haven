# Phase 12 — AI Search & Intelligence Specification

**Document Path:** `docs/PHASE-12-AI-SEARCH-AND-INTELLIGENCE.md`  
**Status:** Approved Architecture & Implementation Plan  
**Author:** HAVEN Engineering Team  
**Version:** 1.0  
**Target Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Supabase (`@supabase/ssr`), Gemini API (`@google/genai`) / Structured JSON Schema  
**Dependencies:** Phase 05 (Database Architecture), Phase 08 (Properties Core & PostgREST Filtering), Phase 09 (User Personalization & Favorites), Phase 11 (Advanced Discovery, Map & Location Intelligence)

---

## 1. Executive Summary & Philosophy

Phase 12 builds an AI intelligence layer over the HAVEN luxury marketplace. While conventional luxury real estate portals rely exclusively on rigid dropdown filters, HAVEN buyers frequently conceptualize their requirements in evocative, natural language (e.g., *"Modern 4-bedroom beachfront villa with infinity pool and panoramic sunset views under $5M"*).

### Core Architectural Principle
> **"AI should enhance the existing search system rather than replace it."**

The AI layer does not perform opaque vector hallucinations or bypass database security. Instead, it serves as an **intelligent intent translation and discovery acceleration engine**:
1. Translates freeform natural queries into **strongly typed, structured search parameters** that feed directly into HAVEN's proven `PropertySearchParams` and PostgREST query layer.
2. Extracts high-confidence filter tokens and semantic amenity desires.
3. Provides an editorial **HAVEN Concierge AI** for conversational discovery, neighborhood matching, and portfolio recommendations.
4. Seamlessly falls back to local semantic regex parsing if external AI inference is unavailable or rate-limited.

---

## 2. System Architecture & Flow

```text
                                  User Input
                   "4-bed modern villa in Dubai with pool under $8M"
                                      │
                                      ▼
                      ┌───────────────────────────────┐
                      │    AI Query Parser Engine     │
                      │   (/api/ai/parse-search-query)│
                      │  - Google GenAI SDK (Gemini)  │
                      │  - Strict JSON Schema Output  │
                      │  - Fallback Deterministic Rx  │
                      └───────────────┬───────────────┘
                                      │
                                      ▼
                      ┌───────────────────────────────┐
                      │  Structured Search Intent     │
                      │  - city: "Dubai"              │
                      │  - property_type: "villa"     │
                      │  - bedrooms_min: 4            │
                      │  - price_max: 8000000         │
                      │  - amenities: ["pool"]        │
                      │  - style_keywords: ["modern"] │
                      └───────────────┬───────────────┘
                                      │
                                      ▼
                      ┌───────────────────────────────┐
                      │ Existing PostgREST Search API │
                      │  (src/lib/properties/queries) │
                      └───────────────┬───────────────┘
                                      │
                                      ▼
                      ┌───────────────────────────────┐
                      │    Curated Luxury Listings    │
                      │   + Active Filter Badges      │
                      │   + AI Match Explanation      │
                      └───────────────────────────────┘
```

---

## 3. Core Objectives & Capabilities

### 1. Natural Language Query Parsing & Intent Extraction
* **Prompt Engineering with Structured Schema**:
  Utilizes `@google/genai` with `responseSchema` or strict JSON schema output to guarantee that returned filters map 1:1 to HAVEN's existing search parameters:
  - `query` / `keyword`
  - `city` / `country`
  - `property_type` (`villa`, `penthouse`, `apartment`, `townhouse`, `mansion`, etc.)
  - `price_min` / `price_max`
  - `bedrooms_min` / `bathrooms_min`
  - `features` / `amenities` (`pool`, `sea_view`, `garden`, `gym`, `garage`, `smart_home`, etc.)
  - `sort_by` (`price_asc`, `price_desc`, `newest`, `featured`)
* **Confidence & Fallback**:
  If an API key is unconfigured or a network timeout occurs, a resilient rule-based extractor extracts numbers, known cities, bedroom counts, and property types without failing.

### 2. Smart Search Bar with Active Intent Chips
* Modern luxury search bar on the homepage hero and `/properties`.
* Real-time extraction status with animated badge indicators.
* **Interactive Intent Chips**: Users see how their natural sentence was understood (e.g. `[Type: Villa ×]` `[Bedrooms: 4+ ×]` `[Max: $8,000,000 ×]`) and can remove or adjust any parameter with a single tap.

### 3. HAVEN AI Concierge (Conversational Assistant)
* Discreet luxury drawer/modal (`HavenConciergeDrawer.tsx`) accessible via a luxury floating action button or header icon.
* Context-aware conversational advisor:
  - Answers buyer questions about current inventory.
  - Explains architectural styles, price per square meter trends, and neighborhood characteristics.
  - Suggests specific matching listings with embedded interactive property cards.

### 4. Similar Property Intelligence & "Why This Matches"
* Extends the Phase 11 similar property heuristic with semantic match explanations:
  - *"Selected for matching your preference for waterfront contemporary villas with 4+ suites."*
  - Badging criteria that directly correspond to the buyer's query.

### 5. Personalized Discovery & Taste Profiling
* Analyzes the user's saved/favorited properties and recently viewed listings (from Phase 09 and Phase 11) to synthesize a client **"Architectural Taste Profile"** (e.g. *"Minimalist Mediterranean & Penthouse Living"*).
* Surfaces a *"Curated For You"* recommendation shelf on `/dashboard` and `/properties`.

---

## 4. API & Data Contracts

### 1. `/api/ai/parse-query` Route Handler
* **Method:** `POST`
* **Request Payload:**
```typescript
interface ParseSearchQueryRequest {
  query: string;
}
```
* **Response Contract:**
```typescript
interface ParseSearchQueryResponse {
  success: boolean;
  intent: {
    city?: string;
    country?: string;
    property_type?: string;
    price_min?: number;
    price_max?: number;
    bedrooms_min?: number;
    bathrooms_min?: number;
    amenities: string[];
    style_keywords: string[];
    sort_by?: 'price_asc' | 'price_desc' | 'newest' | 'featured';
  };
  explanation?: string; // e.g. "Showing modern villas in Dubai with 4+ bedrooms under $8,000,000"
  fallbackUsed?: boolean;
}
```

### 2. `/api/ai/concierge` Route Handler
* **Method:** `POST`
* **Request Payload:**
```typescript
interface ConciergeChatRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  context?: {
    currentPropertySlug?: string;
    activeFilters?: Record<string, unknown>;
  };
}
```
* **Response Contract:**
```typescript
interface ConciergeChatResponse {
  reply: string;
  suggestedProperties?: Array<{
    id: string;
    slug: string;
    title: string;
    price: number;
    city: string;
    cover_image_url: string;
  }>;
  suggestedQueries?: string[];
}
```

---

## 5. Major Implementation Steps

```text
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Natural Language Query Parser & Fallback Engine     │
│  - Configure Gemini API integration with structured schemas │
│  - Build deterministic regex fallback extractor             │
│  - Expose POST /api/ai/parse-query route handler            │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Smart Search Input & Active Intent Chips            │
│  - Build NaturalLanguageSearchBar component                 │
│  - Display extracted filter chips with dismiss actions      │
│  - Seamless URL searchParams sync with /properties          │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 3: HAVEN AI Concierge Drawer                           │
│  - Build HavenConciergeDrawer sliding panel UI              │
│  - Context-aware luxury estate advisory prompts             │
│  - Interactive property preview cards in chat stream        │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 4: Intelligent Property Match Explanations             │
│  - Compute query relevance factors on result sets           │
│  - "Why this matches" editorial micro-badges on cards       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 5: Personalized Taste Profile & Discovery Shelf        │
│  - Aggregator reading user favorites & view history         │
│  - Curated recommendation shelf on dashboard & search       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 6: Verification, Type-Safety & Build Audit             │
│  - Strict TypeScript check (npx tsc --noEmit)               │
│  - Production bundle compilation (npm run build)            │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Database / Supabase Requirements

* **Zero schema migration blockers**:
  Phase 12 utilizes the existing `properties`, `property_views`, `favorites`, and `profiles` tables.
* **Security & RLS**:
  All database queries driven by extracted parameters respect existing Row Level Security (RLS) policies (only `status = 'published'` listings displayed publicly).
* **Optional Future Optimization**:
  Should vector similarity search be desired in subsequent updates, `pgvector` can be enabled via standard Supabase migration. The initial Phase 12 architecture operates deterministically on top of the PostgREST query engine.

---

## 7. Verification & Sign-off Criteria

1. **Query Parsing Accuracy**:
   - Complex natural phrases (e.g. *"Villa in Marbella with pool under 3M"*) successfully parse into `city: Marbella`, `type: villa`, `amenities: [pool]`, `price_max: 3000000`.
   - Edge cases (no price, multiple amenities, ambiguous terms) resolve gracefully without runtime exceptions.
   - Deterministic fallback activates automatically when API keys are absent or network requests fail.

2. **UI & UX Precision**:
   - Active intent chips allow users to inspect and remove AI-applied filters individually.
   - Search bar maintains high responsiveness (< 400ms feedback).
   - AI Concierge drawer adheres strictly to HAVEN's editorial gold, dark obsidian, and warm cream design system.

3. **Code Quality**:
   - Full TypeScript safety with no `any` types in contracts.
   - 0 errors reported by `npx tsc --noEmit`.
   - Clean production compilation under `npm run build`.
