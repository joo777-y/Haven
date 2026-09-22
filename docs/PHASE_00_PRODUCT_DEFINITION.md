# Phase 0 — Product Definition

**Status:** Completed  
**Version:** 1.0  

---

## 1. Executive Summary & Vision

**HAVEN** is a full-stack real estate discovery and listing platform designed to deliver a modern, editorial aesthetic with seamless performance. The platform serves home seekers, buyers, renters, and licensed real estate agents.

---

## 2. Target User Personas & Workflows

### A. Visitor / Seeker (Public User)
- **Goal:** Explore luxury and curated real estate listings without requiring immediate login.
- **Workflow:** Discover → Search & Filter → View Specs & Gallery → Save / Bookmark → Submit Agent Inquiry.

### B. Registered User
- **Goal:** Organize saved listings and track inquiries.
- **Workflow:** Auth Login/Register → Create Custom Collections → View Saved Search Alerts → Manage Personal Profile & Settings.

### C. Real Estate Agent
- **Goal:** Publish, showcase, and manage property listings while collecting buyer leads.
- **Workflow:** Agent Onboarding → Create Listing (Multi-step upload) → Manage Property Status (`Draft`, `Published`, `Sold`) → Receive & Manage Inquiries.

### D. System Admin (Future Scope)
- **Goal:** Platform moderation, agent verification, and system analytics.

---

## 3. Product Principles

1. **Editorial & Luxury Aesthetic:** Deep contrast, elegant typography (Playfair Display + Plus Jakarta Sans), generous white space, and warm surface tones.
2. **UI-First & Mock Data Strategy:** Validate product experience and component hierarchy before database lock-in.
3. **Progressive Security:** Row Level Security (RLS) enforcement at the database layer rather than frontend-only checks.
4. **Feature-First Architecture:** Build code and folders only when their respective phase is active.

### Phase 0 is the product baseline.
Any new feature mentioned here that is not present in the approved MVP,
database schema, or implementation plan must not be implemented
without explicit product approval.