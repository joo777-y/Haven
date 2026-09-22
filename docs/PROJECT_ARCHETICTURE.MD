# HAVEN — Project Structure

haven/
│
├── .claude/
│   └── skills/
│       ├── supabase/
│       └── supabase-postgres-best-practices/
│
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── src/
│   │
│   ├── app/
│   │   │
│   │   ├── (public)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   │
│   │   │   ├── properties/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── agents/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── about/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   └── contact/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (auth)/
│   │   │   ├── layout.tsx
│   │   │   └── auth/
│   │   │       ├── login/
│   │   │       │   └── page.tsx
│   │   │       ├── register/
│   │   │       │   └── page.tsx
│   │   │       └── forgot-password/
│   │   │           └── page.tsx
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   └── dashboard/
│   │   │       ├── page.tsx
│   │   │       ├── saved/
│   │   │       │   └── page.tsx
│   │   │       ├── collections/
│   │   │       │   └── page.tsx
│   │   │       ├── profile/
│   │   │       │   └── page.tsx
│   │   │       └── settings/
│   │   │           └── page.tsx
│   │   │
│   │   ├── (agent)/
│   │   │   ├── layout.tsx
│   │   │   └── agent/
│   │   │       ├── page.tsx
│   │   │       ├── properties/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── new/
│   │   │       │   │   └── page.tsx
│   │   │       │   └── [id]/
│   │   │       │       └── edit/
│   │   │       │           └── page.tsx
│   │   │       ├── inquiries/
│   │   │       │   └── page.tsx
│   │   │       └── profile/
│   │   │           └── page.tsx
│   │   │
│   │   ├── api/
│   │   │   └── ...                 # Only when Route Handlers are needed
│   │   │
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── MobileMenu.tsx
│   │   │   └── Container.tsx
│   │   │
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── IconButton.tsx
│   │   │   └── SectionHeading.tsx
│   │   │
│   │   ├── home/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── HeroSearchBar.tsx
│   │   │   ├── StatsSection.tsx
│   │   │   ├── PropertySection.tsx
│   │   │   ├── LifestyleGrid.tsx
│   │   │   ├── AgentSection.tsx
│   │   │   └── CTASection.tsx
│   │   │
│   │   ├── properties/
│   │   │   ├── PropertyCard.tsx
│   │   │   ├── PropertyGrid.tsx
│   │   │   ├── PropertyGallery.tsx
│   │   │   ├── PropertyDetails.tsx
│   │   │   ├── PropertyFilters.tsx
│   │   │   ├── PropertySearch.tsx
│   │   │   └── PropertyMap.tsx
│   │   │
│   │   ├── agents/
│   │   │   ├── AgentCard.tsx
│   │   │   ├── AgentGrid.tsx
│   │   │   └── AgentProfile.tsx
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ForgotPasswordForm.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── DashboardSidebar.tsx
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── SavedProperties.tsx
│   │   │   ├── Collections.tsx
│   │   │   └── ProfileForm.tsx
│   │   │
│   │   └── agent/
│   │       ├── AgentSidebar.tsx
│   │       ├── AgentStats.tsx
│   │       ├── AgentPropertyTable.tsx
│   │       ├── PropertyForm.tsx
│   │       ├── ImageUploader.tsx
│   │       └── InquiryTable.tsx
│   │
│   ├── lib/
│   │   │
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts       # When auth session handling requires it
│   │   │
│   │   ├── utils/
│   │   │   ├── formatPrice.ts
│   │   │   ├── formatDate.ts
│   │   │   ├── slugify.ts
│   │   │   └── cn.ts
│   │   │
│   │   └── validations/
│   │       ├── auth.ts
│   │       ├── property.ts
│   │       └── profile.ts
│   │
│   ├── data/
│   │   ├── properties.ts            # Mock data during UI phase
│   │   ├── agents.ts
│   │   ├── categories.ts
│   │   └── home.ts
│   │
│   ├── types/
│   │   ├── property.ts
│   │   ├── agent.ts
│   │   ├── profile.ts
│   │   └── database.ts              # Generated Supabase types later
│   │
│   └── config/
│       ├── site.ts
│       └── navigation.ts
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_profiles.sql
│   │   ├── 002_agents.sql
│   │   ├── 003_properties.sql
│   │   ├── 004_property_images.sql
│   │   ├── 005_property_features.sql
│   │   ├── 006_favorites.sql
│   │   ├── 007_collections.sql
│   │   └── 008_inquiries.sql
│   │
│   ├── seed.sql
│   └── config.toml
│
├── .env.local
├── .gitignore
├── AGENTS.md
├── CLAUDE.md
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── package-lock.json
└── README.md
```

## Structure Principles

### 1. `app/`

مسؤول عن **الـ routes والـ pages والـ layouts** فقط.

```text
app/
→ أين المستخدم يذهب؟
→ ما الـ URL؟
→ ما الـ layout المستخدم؟
```

مش هنحط business logic كبير هنا.

---

### 2. `components/`

هنا الـ **UI الحقيقي**.

```text
components/
├── ui/           → components عامة
├── layout/       → Header / Footer
├── home/         → Homepage
├── properties/   → Property UI
├── agents/       → Agent UI
├── auth/         → Auth UI
├── dashboard/    → User dashboard
└── agent/        → Agent dashboard
```

---

### 3. `lib/`

هنا الحاجات اللي بتساعد التطبيق يشتغل:

```text
lib/
├── supabase/     → Supabase clients
├── utils/        → helpers
└── validations/ → validation logic
```

---

### 4. `data/`

دي مهمة جدًا في المرحلة الحالية.

هنستخدمها في البداية عشان نبني **UI حقيقي بـ Mock Data**:

```text
data/
├── properties.ts
├── agents.ts
├── categories.ts
└── home.ts
```

وبعدين لما ندخل Supabase، الـ UI نفسه يفضل موجود ونبدل مصدر البيانات فقط.

---

### 5. `types/`

هنا الـ TypeScript types:

```text
types/
├── property.ts
├── agent.ts
├── profile.ts
└── database.ts
```

`database.ts` هنخليه يتولد من Supabase لما نوصل لمرحلة الـ database integration.

---

### 6. `supabase/`

ده خاص بالـ database:

```text
supabase/
├── migrations/
├── seed.sql
└── config.toml
```

كل تغيير حقيقي في الـ database يبقى له migration واضح بدل ما نعدل حاجات عشوائيًا من Dashboard.

---

# Implementation Order

مش معنى إن الـ structure كله موجود إننا ننشئ كل الملفات دلوقتي.

هنبنيه تدريجيًا:

```text
PHASE 1
Foundation
    ↓
app/
lib/supabase/
globals.css
layout.tsx


PHASE 2
Design System
    ↓
components/layout/
components/ui/


PHASE 3
Homepage
    ↓
components/home/
data/home.ts
data/properties.ts
data/agents.ts


PHASE 4
Public Website
    ↓
properties/
agents/
about/
contact/


PHASE 5
Database
    ↓
supabase/migrations/
types/database.ts


PHASE 6
Authentication
    ↓
(auth)/
components/auth/


PHASE 7
User Experience
    ↓
(dashboard)/
components/dashboard/


PHASE 8
Agent Experience
    ↓
(agent)/
components/agent/


PHASE 9+
Advanced Features
    ↓
Maps
Search
Messaging
AI
Analytics
etc.
```

## Important Rule

**We do NOT create the entire structure upfront.**

The structure above is the **target architecture**.

We create folders/files only when their phase starts.

That keeps HAVEN understandable and prevents premature architecture.


