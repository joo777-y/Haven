# Phase 2 — Design System & Application Structure

**Status:** Completed  
**Version:** 1.1  

---

## 1. Overview & Objectives

Phase 2 establishes the core visual foundations, design tokens, layout primitives, and base UI components according to [`PROJECT_ARCHETICTURE.MD`](file:///d:/Haven/docs/PROJECT_ARCHETICTURE.MD).

---

## 2. Design System Tokens (`src/app/globals.css`)

### Color Palette
- `primary`: `#1E2022` (Charcoal dark)
- `secondary`: `#C26D45` (Warm terracotta highlight)
- `tertiary`: `#5E6C5B` (Sage green accent)
- `background`: `#F7F6F2` (Cream canvas)
- `surface`: `#FFFFFF` (Pure white cards/containers)
- `divider`: `#E6E4DD` (Subtle warm border)
- `muted`: `#44474A` (Muted secondary text)

### Typography
- Display / Headlines: `Playfair Display` (`--font-display`)
- UI Body / Sans: `Plus Jakarta Sans` (`--font-sans`)

---

## 3. Layout Components (`src/components/layout/`)

- **`Container.tsx`**: Standardized max-width wrapper (`max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8`) for responsive container alignment across all pages.
- **`Header.tsx`**: Sticky top navigation bar with active route underlines, brand logo (`HAVEN ●`), and action drawers.
- **`Footer.tsx`**: Full footer layout featuring brand overview, navigation links, portfolio links, newsletter form, and copyright.
- **`MobileMenu.tsx`**: Responsive slide-out drawer menu for mobile viewports.

---

## 4. UI Primitives (`src/components/ui/`)

- **`Button.tsx`**: Reusable button supporting `primary`, `secondary`, `outline`, `ghost` variants and `sm`, `md`, `lg` sizes.
- **`Badge.tsx`**: Status & tag pills (`primary`, `secondary`, `tertiary`, `outline`, `surface`).
- **`Input.tsx`**: Standardized text, email, and search inputs with left/right icon support and error states.
- **`Select.tsx`**: Dropdown select input with custom chevron icon and focus rings.
- **`SectionHeading.tsx`**: Reusable section headers with subtitle, Playfair headline, and action button slots.
- **`IconButton.tsx`**: Circular icon buttons with hover and active states.
- **`Modal.tsx`**: Base dialog modal primitive with backdrop blur, escape listener, and size options.

---

## 5. Execution Progress

- [x] Create Design System documentation (`PHASE_02_DESIGN_SYSTEM_AND_STRUCTURE.md`)
- [x] Implement `Container.tsx` (`src/components/layout/Container.tsx`)
- [x] Implement `Header.tsx` (`src/components/layout/Header.tsx`)
- [x] Implement `Footer.tsx` (`src/components/layout/Footer.tsx`)
- [x] Implement `MobileMenu.tsx` (`src/components/layout/MobileMenu.tsx`)
- [x] Implement `Button.tsx` (`src/components/ui/Button.tsx`)
- [x] Implement `Badge.tsx` (`src/components/ui/Badge.tsx`)
- [x] Implement `Input.tsx` (`src/components/ui/Input.tsx`)
- [x] Implement `Select.tsx` (`src/components/ui/Select.tsx`)
- [x] Implement `SectionHeading.tsx` (`src/components/ui/SectionHeading.tsx`)
- [x] Implement `IconButton.tsx` (`src/components/ui/IconButton.tsx`)
- [x] Implement `Modal.tsx` (`src/components/ui/Modal.tsx`)
- [x] TypeScript compilation check (`npx tsc --noEmit` passed with 0 errors)
