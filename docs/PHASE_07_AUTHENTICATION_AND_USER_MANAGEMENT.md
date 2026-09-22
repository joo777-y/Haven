# Phase 7 — Authentication & Authorization Architecture Specification

**Status:** Approved Architecture (Ready for Implementation)  
**Author:** HAVEN Engineering Team  
**Version:** 1.0  
**Target Stack:** Next.js 16 (App Router), React 19, TypeScript, Supabase Auth (`@supabase/ssr`), Tailwind CSS v4  
**Dependencies:** Phase 5 (Database Schema), Phase 6 (Security & Storage Policies)

---

## 1. Executive Summary & Scope

Phase 7 establishes the complete authentication, session lifecycle, authorization guards, user profile management, and agent role detection for the HAVEN real estate platform.

### Primary Objectives
1. **Seamless Supabase SSR Auth Integration**: Configure modern `@supabase/ssr` client/server/middleware cookies to support server-side rendering, streaming, and Edge middleware token refresh.
2. **Deterministic Role Model**: Implement clean, zero-hardcoding role detection:
   - **Visitor** (Anonymous): Unauthenticated visitor with read-only access to published listings and public agent profiles.
   - **Registered User** (Seeker / Buyer): Authenticated user with private profile access, bookmarking (favorites), custom collections, and inquiry creation.
   - **Agent** (Seller / Lister): Authenticated user who possesses an associated record in `public.agents` (`profile_id = auth.uid()`), enabling listing creation, media management, and inquiry processing.
   - **Future Admin**: Reserved architectural extension point.
3. **Robust Route Protection & Redirection**: Enforce server-side route guards and Edge middleware for `/(dashboard)/*` and `/(agent)/*` routes.
4. **Editorial Luxury Auth UI**: Create refined authentication pages (`/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`) and an interactive `AuthModal` for contextual login triggers (e.g. saving properties, contacting agents).
5. **Profile & Avatar Management**: Wire up user profile updates and direct uploads to the Supabase Storage `avatars` bucket with strict path-based RLS enforcement.
6. **Self-Service Agent Onboarding**: Provide an intuitive onboarding flow for authenticated users to register as licensed agents without manual admin gating.

---

## 2. Authentication & Authorization Matrix

| User Persona | Auth State | Accessible Routes | Permitted Platform Actions | Route Guard Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **Visitor** | Unauthenticated (`anon`) | `/`, `/properties/*`, `/agents/*`, `/about`, `/contact`, `/auth/*` | Browse published properties, view public agent profiles, view search filters. | Redirected to `/auth/login?redirect=...` if accessing `/dashboard/*` or `/agent/*`. Triggering save/inquire opens `AuthModal`. |
| **Registered User** | Authenticated (`authenticated`), No `agents` row | Public routes + `/dashboard/*` | Save favorites, create collections, send inquiries to agents, manage personal profile & avatar, change password. | Full access to `/dashboard/*`. Access to `/agent/*` redirects to `/agent/register` (Agent Onboarding). |
| **Agent** | Authenticated (`authenticated`), Has `agents` row | Public routes + `/dashboard/*` + `/agent/*` | All User actions + Create/edit properties, upload property images, manage property features, receive and update status of property inquiries. | Full access to `/dashboard/*` and `/agent/*`. |
| **Guest on Auth Pages** | Authenticated (User or Agent) | Public routes + Private routes | Already authenticated. | Visiting `/auth/login` or `/auth/register` automatically redirects to `/dashboard` (or `/agent` for agents). |

---

## 3. Architecture & Client Strategy (`@supabase/ssr`)

HAVEN uses `@supabase/ssr` across three distinct execution environments:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           HAVEN Client Architecture                     │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│  Browser Client  │       │  Server Client   │       │    Middleware    │
│  (Client Comp.)  │       │ (Server Comp. /  │       │ (Edge Runtime /  │
│                  │       │  Server Actions) │       │ Token Refresh)   │
└──────────────────┘       └──────────────────┘       └──────────────────┘
  src/lib/supabase/          src/lib/supabase/           src/middleware.ts
     client.ts                  server.ts
```

### 3.1 Browser Client (`src/lib/supabase/client.ts`)
Used in Client Components (`'use client'`) for interactive auth operations, realtime subscriptions, and direct Supabase Storage uploads.

```typescript
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
```

### 3.2 Server Client (`src/lib/supabase/server.ts`)
Used in Server Components, Route Handlers, and Server Actions to read cookies and execute queries with the authenticated user's RLS context.

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );
}
```

### 3.3 Next.js Edge Middleware (`src/middleware.ts`)
Performs two vital operations on every non-static request:
1. **Session Cookie Refresh**: Refreshes Supabase Auth tokens before Server Components execute.
2. **Route Guarding & Redirection**: Protects private route trees without waiting for client-side JavaScript execution.

```
Request Pipeline:
Incoming Request ──► Middleware (Refresh Session & Check Route) 
                       │
                       ├─► Unauthenticated + /dashboard/* ──► Redirect to /auth/login?redirect=...
                       ├─► Unauthenticated + /agent/*     ──► Redirect to /auth/login?redirect=...
                       ├─► Authenticated   + /auth/*      ──► Redirect to /dashboard (or /agent)
                       └─► Valid ─────────────────────────► Forward to Route Handler / Page
```

---

## 4. Role Detection & Agent State Model

### 4.1 Zero-Hardcoding Role Philosophy
In HAVEN, user roles are not stored as static enum columns in `auth.users`. Instead, role capabilities are deterministically derived from relational state:
- A user is a **Registered User** if `auth.uid()` is valid and has a corresponding record in `public.profiles`.
- A user is an **Agent** if there is a record in `public.agents` where `profile_id = auth.uid()`.

### 4.2 Helper Query Function (`src/lib/auth/getRole.ts`)
```typescript
import { createClient } from "@/lib/supabase/server";

export interface UserRoleState {
  user: any | null;
  profile: any | null;
  agent: any | null;
  isAgent: boolean;
  isAdmin: boolean;
}

export async function getUserRoleState(): Promise<UserRoleState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null, agent: null, isAgent: false, isAdmin: false };
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Check agent status
  const { data: agent } = await supabase
    .from("agents")
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();

  return {
    user,
    profile,
    agent,
    isAgent: !!agent,
    isAdmin: false, // Architectural extension point
  };
}
```

---

## 5. Core Authentication & Account Flows

### 5.1 Registration Flow (`/auth/register`)
1. User enters: `Full Name`, `Email`, `Password`, `Confirm Password`.
2. Client validates inputs with Zod (`registerSchema`).
3. Calls `supabase.auth.signUp({ email, password, options: { data: { full_name } } })`.
4. PostgreSQL Trigger `on_auth_user_created` (from Migration `202609220001`) automatically inserts a row into `public.profiles`:
   ```sql
   INSERT INTO public.profiles (id, full_name, avatar_url)
   VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
   ```
5. If email confirmation is enabled: displays verification notice with instructions.
6. If email confirmation is disabled: automatically authenticates user and redirects to `/dashboard`.

---

### 5.2 Login Flow (`/auth/login`)
1. User enters: `Email`, `Password`.
2. Calls `supabase.auth.signInWithPassword({ email, password })`.
3. Checks if user is an agent:
   - If user has an `agents` record → Redirects to `/agent` (or `redirect` query parameter).
   - If user is a regular seeker → Redirects to `/dashboard` (or `redirect` query parameter).
4. Handles specific error codes: `invalid_credentials`, `email_not_confirmed`, `user_not_found`.

---

### 5.3 Password Reset & Recovery Flow
```
1. User visits /auth/forgot-password
   └─► Enters email ──► supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/callback?next=/auth/reset-password` })

2. User clicks email link
   └─► Lands on /auth/callback?code=...&next=/auth/reset-password
   └─► Route Handler exchanges code for session via supabase.auth.exchangeCodeForSession(code)
   └─► Redirects to /auth/reset-password with active session

3. User sets new password on /auth/reset-password
   └─► Calls supabase.auth.updateUser({ password: newPassword })
   └─► Password updated ──► Redirects to /dashboard with success toast
```

---

### 5.4 Sign Out Flow
1. User clicks "Sign Out" from User Menu or Sidebar.
2. Triggers `supabase.auth.signOut()`.
3. Client state resets and router redirects to `/`.

---

### 5.5 Self-Service Agent Onboarding (`/agent/register`)
1. An authenticated regular user navigates to `/agent/register` or clicks "Become an Agent" in the dashboard.
2. User submits professional details:
   - `company_name` (e.g., "Sotheby's International Realty")
   - `professional_title` (e.g., "Principal Architectural Advisor")
   - `bio` (e.g., "Specializing in luxury waterfront residences...")
   - `phone` (e.g., "+1 (555) 019-2834")
   - `email` (e.g., "advisor@haven.com")
   - `license_number` (e.g., "DRE #01928472")
3. Mutation:
   ```typescript
   const { data, error } = await supabase
     .from("agents")
     .insert({
       profile_id: user.id,
       company_name,
       professional_title,
       bio,
       phone,
       email,
       license_number,
     })
     .select()
     .single();
   ```
4. Enforces Phase 6 RLS check (`profile_id = auth.uid()`).
5. On success: Immediate access to `/agent` portal is granted.

---

## 6. Client State Management (`AuthProvider` & `useAuth`)

To provide instantaneous client-side UI feedback, prevent hydration layout flicker, and maintain responsive navigation bars, HAVEN implements an `AuthProvider` context.

### 6.1 State Interface (`src/types/auth.ts`)
```typescript
import type { User } from "@supabase/supabase-js";
import type { Tables } from "@/types/database";

export type Profile = Tables<"profiles">;
export type Agent = Tables<"agents">;

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  agent: Agent | null;
  isAgent: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
```

### 6.2 Auth Provider Implementation (`src/components/auth/AuthProvider.tsx`)
- Subscribes to `supabase.auth.onAuthStateChange` to capture login, logout, and token refresh events.
- Fetches and caches `profiles` and `agents` relational records on user authentication.
- Exposes `useAuth()` custom hook across the application.

---

## 7. Storage Integration: User & Agent Avatars

Phase 6 established the `avatars` bucket with user-isolated RLS policies:
- **Bucket**: `avatars` (Public bucket)
- **Path Format**: `${user.id}/${Date.now()}-${filename}`
- **RLS Check**: `(storage.foldername(name))[1] = auth.uid()::text`

### 7.1 Avatar Upload Utility (`src/lib/supabase/storage.ts`)
```typescript
export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const supabase = createClient();
  const fileExt = file.name.split(".").pop();
  const filePath = `${userId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  // Update profile with new avatar URL
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", userId);

  if (updateError) throw updateError;

  return publicUrl;
}
```

---

## 8. Directory & File Structure Plan

```text
haven/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── layout.tsx                     # Editorial luxury auth layout
│   │   │   ├── auth/
│   │   │   │   ├── login/page.tsx             # Login page
│   │   │   │   ├── register/page.tsx          # Registration page
│   │   │   │   ├── forgot-password/page.tsx   # Password recovery request
│   │   │   │   └── reset-password/page.tsx    # Password update form
│   │   │   └── agent/
│   │   │       └── register/page.tsx          # Self-service agent onboarding
│   │   ├── (dashboard)/
│   │   │   └── layout.tsx                     # Server-guarded user dashboard layout
│   │   ├── (agent)/
│   │   │   └── layout.tsx                     # Server-guarded agent portal layout
│   │   └── auth/
│   │       └── callback/
│   │           └── route.ts                   # Auth code exchange Route Handler
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   ├── AuthProvider.tsx               # Context provider & listener
│   │   │   ├── LoginForm.tsx                  # Interactive login form
│   │   │   ├── RegisterForm.tsx               # Interactive signup form
│   │   │   ├── ForgotPasswordForm.tsx         # Reset request form
│   │   │   ├── ResetPasswordForm.tsx          # New password form
│   │   │   ├── AgentRegisterForm.tsx          # Agent onboarding form
│   │   │   ├── AuthModal.tsx                  # Global contextual auth modal
│   │   │   └── UserMenu.tsx                   # Header user avatar & dropdown menu
│   │   └── layout/
│   │       ├── Header.tsx                     # Updated with UserMenu / Sign In trigger
│   │       └── MobileMenu.tsx                 # Updated with Auth triggers
│   │
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── getRole.ts                     # Server-side role detection
│   │   │   └── hooks.ts                       # useAuth() client hook
│   │   ├── supabase/
│   │   │   ├── client.ts                      # Browser Supabase client
│   │   │   ├── server.ts                      # Server Supabase client
│   │   │   └── storage.ts                     # Avatar & media upload helpers
│   │   └── validations/
│   │       └── auth.ts                        # Zod validation schemas
│   │
│   ├── types/
│   │   ├── auth.ts                            # Auth context & persona types
│   │   └── database.ts                        # Generated Supabase types
│   │
│   └── middleware.ts                          # Edge session refresh & route guard
```

---

## 9. Form Validation Schemas (`src/lib/validations/auth.ts`)

Using Zod for consistent validation across client and server:

```typescript
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const agentOnboardingSchema = z.object({
  companyName: z.string().min(2, "Company / Agency name is required"),
  professionalTitle: z.string().min(2, "Professional title is required (e.g. Senior Broker)"),
  bio: z.string().min(20, "Please provide a professional bio of at least 20 characters"),
  phone: z.string().min(7, "Valid phone number is required"),
  email: z.string().email("Valid professional email is required"),
  licenseNumber: z.string().min(3, "Real estate license number is required"),
});
```

---

## 10. Implementation Plan & Execution Sequence

```
Step 1: Edge Middleware & Next.js Auth Route Handler
  ├── Create src/middleware.ts (session cookie refresh + route guards)
  └── Create src/app/auth/callback/route.ts (auth code exchange)
         ↓
Step 2: Type Definitions & Validation Schemas
  ├── Create src/types/auth.ts
  └── Create src/lib/validations/auth.ts
         ↓
Step 3: Auth Provider & Custom Hook
  ├── Create src/components/auth/AuthProvider.tsx
  └── Create src/lib/auth/hooks.ts (useAuth export)
         ↓
Step 4: Auth UI Components & Forms
  ├── Build LoginForm.tsx
  ├── Build RegisterForm.tsx
  ├── Build ForgotPasswordForm.tsx
  ├── Build ResetPasswordForm.tsx
  ├── Build AgentRegisterForm.tsx
  ├── Build AuthModal.tsx (contextual modal)
  └── Build UserMenu.tsx (header dropdown)
         ↓
Step 5: Auth Pages Assembly
  ├── Assemble src/app/(auth)/layout.tsx
  ├── Assemble src/app/(auth)/auth/login/page.tsx
  ├── Assemble src/app/(auth)/auth/register/page.tsx
  ├── Assemble src/app/(auth)/auth/forgot-password/page.tsx
  ├── Assemble src/app/(auth)/auth/reset-password/page.tsx
  └── Assemble src/app/(auth)/agent/register/page.tsx
         ↓
Step 6: Header & Navigation Integration
  ├── Wire UserMenu into src/components/layout/Header.tsx
  ├── Wire Auth actions into src/components/layout/MobileMenu.tsx
  └── Connect contextual "Sign In" triggers in property/agent detail views
         ↓
Step 7: Route Guards & Layout Protections
  ├── Implement server session check in src/app/(dashboard)/layout.tsx
  └── Implement server agent-role check in src/app/(agent)/layout.tsx
         ↓
Step 8: Verification & Quality Assurance
  ├── Test signup, login, logout, password recovery flows
  ├── Test avatar upload to Supabase Storage
  ├── Test agent onboarding & portal route unlocking
  ├── Verify TypeScript (`npx tsc --noEmit`)
  └── Verify production build (`npm run build`)
```

---

## 11. Security Checklist

- [x] Passwords never handled in plaintext or exposed in client logs.
- [x] Session tokens stored in secure, `HttpOnly`, `SameSite=Lax` cookies.
- [x] Password recovery protected via cryptographically signed PKCE auth codes.
- [x] Route access guarded at both the Edge middleware layer and Server Component layout layer.
- [x] Direct database access and storage uploads protected by Phase 6 PostgreSQL RLS policies.
- [x] Agent permissions verified against true database records rather than untrusted client state.
