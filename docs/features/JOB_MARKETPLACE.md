# Feature: Job Marketplace (Freelancer-Side)

## Overview
A high-performance, searchable, and filterable job board where freelancers can discover projects that match their skills. This is the "heart" of the platform's freelancer-centric experience, designed with a **Technical Minimalist** aesthetic to feel like a high-stakes professional exchange rather than a generic job board.

## Key Components & UI References

### 1. Editorial Header & Network Status
- **Typography:** Massive, high-contrast typography (`font-headline`, e.g., Space Grotesk or Playfair Display) for the "Marketplace" title.
- **Graphic Components:** A live "Network Status" indicator with a pulsing primary-colored dot (`animate-pulse`) and monospace metadata (`JetBrains Mono`) to establish a "live-system" feel.
- **Metrics:** "Total Volume" display using bold headline fonts to build immediate credibility.

### 2. Compact Technical Filter Bar
- **Search & Discovery:**
  - Real-time text search integrated into a sleek, floating filter bar (`sticky top-4 z-40`).
  - Input fields use `bg-white/5` with `backdrop-blur-xl` for a glassmorphism effect.
  - Placeholder text like "Query database..." enhances the technical vibe.
- **Category Filtering:**
  - Pill-style buttons for categories (Frontend, Backend, Design, etc.) using `text-[10px] font-mono uppercase tracking-widest`.
  - Active states highlighted with `bg-primary/10 text-primary border-primary/30`.
- **Icons:** Integrated `lucide-react` icons (e.g., `Search`, `Filter`) for visual anchors.

### 3. Bento-Style Job Cards (`<JobCard />`)
- **Container:** Premium `GlassCard` components with `bg-surface-container-low/40`, rounded `2xl` borders, and subtle hover elevation (`-y-4`).
- **Visual Hierarchy:**
  - **Client Identity:** Full-color avatars alongside monospace client names and a "Verified" badge (`ShieldCheck` icon).
  - **Job Title:** Large, bold headline text that transitions to the primary color on hover.
  - **Description:** Clamped to 2-3 lines with `opacity-80` for clean readability.
- **Technical Metadata:**
  - **Tags:** Small, technical pills (`bg-white/5 border-white/5`) with a `+X` counter for overflow.
  - **Budget:** Prominent display separating the numerical value (`font-headline text-2xl`) from the currency (`font-mono text-[10px] text-primary`).
- **Micro-interactions:** A circular arrow button (`ArrowRight`) that rotates 45 degrees and fills with the primary color on hover, powered by `motion/react`.

## Design Principles
- **Density:** High information density without clutter, utilizing a spacious `gap-6` grid layout.
- **Motion:** Smooth layout animations (`AnimatePresence`, `layout` prop) when filtering or searching using Framer Motion.
- **Typography:** Strict pairing of `Inter` (sans-serif) for readability, `JetBrains Mono` for data/metadata, and `Space Grotesk` for display headers.
- **Responsiveness:** Single-column on mobile, scaling to a dense 3-column grid on ultra-wide screens (`max-w-[100rem]`).

## Data Model (Firestore)
- **Collection:** `jobs` (Read-only for freelancers, except for applying).
- **Queries:** Filtered by `status == 'open'` by default, with real-time listeners (`onSnapshot`) for instant updates.
