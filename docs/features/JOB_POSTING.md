# Feature: Job Posting (Client-Side)

## Overview
A streamlined, multi-step interface for clients to define their project requirements, budget, and milestones. This feature shifts the platform's focus from just "browsing talent" to "solving problems," utilizing a **Clean Utility / Minimal** aesthetic to ensure a frictionless data entry experience.

## Key Components & UI References

### 1. The Job Composer (`/post-project`)
- **Container:** Housed within a centralized `GlassCard` or a split-pane layout (SaaS Landing style) to separate the form from contextual help/preview.
- **Progress Tracking:**
  - A technical, dot-matrix or numbered column indicator (e.g., `01`, `02`, `03` in `font-display`) to show progress through the steps.
  - Smooth step transitions powered by `motion/react` (`AnimatePresence` with slide/fade effects).

### 2. Step Breakdown
- **Step 1: Basics**
  - **Inputs:** Large, borderless input fields for the Project Title with `focus:ring-primary/30`.
  - **Typography:** `Inter` for labels, `Space Grotesk` for the main input text to make it feel substantial.
  - **Selection:** Pill-shaped toggle buttons for Category and Budget Type (Fixed vs. Hourly).
- **Step 2: Technical Details**
  - **Rich Text:** A markdown-supported textarea for the description, styled with a monospace font (`JetBrains Mono`) to appeal to technical clients.
  - **Tags:** An interactive tag input system where required skills appear as `bg-surface-container-highest` pills with a smooth pop-in animation.
  - **Uploads:** A dashed-border dropzone (`border-white/20 hover:border-primary/50`) with a `lucide-react` `UploadCloud` icon for attachments.
- **Step 3: Automated Escrow Setup**
  - **Financial Data:** Milestone amounts and percentages displayed strictly in `JetBrains Mono` for precision.
  - **Validation:** Real-time visual feedback (e.g., a progress bar filling up to 100%) to ensure milestone percentages are accurate.
- **Step 4: Review & Publish**
  - **Summary:** A read-only, bento-grid summary of the project details.
  - **Action:** A prominent "Post & Lock" button featuring a `GradientText` label or a solid `bg-primary` fill with a `Lock` icon, initializing the smart escrow.

## Design Principles
- **Minimalism:** Use ample whitespace (`gap-8`, `p-12`) to reduce cognitive load during the posting process.
- **Precision:** Enforce `font-mono` for all financial figures, percentages, and technical tags.
- **Feedback:** Real-time validation with subtle color shifts (e.g., `text-destructive` for errors, `text-primary` for success) and toast notifications (`sonner`).

## Data Model (Firestore)
- **Collection:** `jobs`
- **Fields:** `title`, `description`, `budget`, `currency`, `category`, `status` (open/closed), `clientId`, `createdAt`.
- **Sub-collection:** `milestones` (linked to the job, containing `title`, `amount`, `percentage`, `status`).
