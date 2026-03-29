# Feature: Bidding & Proposal System

## Overview
A secure, real-time communication and bidding layer that connects clients and freelancers. This feature handles the "negotiation" phase of the project lifecycle, designed with a **Technical Dashboard** aesthetic to facilitate quick, data-driven decision making.

## Key Components & UI References

### 1. The Proposal Engine (`/project/:id`)
- **Freelancer View (The Pitch):**
  - **Container:** A sleek, sticky sidebar or a dedicated `GlassCard` section labeled "Apply for this Project".
  - **Inputs:** 
    - Bid Amount: A massive, light-weight display input (`font-headline text-4xl font-light`) for the numerical value, paired with a monospace currency label.
    - Proposal: A markdown-enabled textarea (`font-sans`) with subtle focus rings (`focus:ring-primary/30`).
  - **Action:** A "Submit Application" button with a loading spinner (`Loader2` from `lucide-react`) and real-time success feedback.

- **Client View (The Dashboard):**
  - **Layout:** A split-pane or bento-grid layout comparing the original project brief with incoming proposals.
  - **Proposal Cards:** 
    - Compact, data-dense rows or cards.
    - Freelancer avatars, monospace bid amounts, and truncated proposal text.
    - "Verified" badges (`ShieldCheck`) for trusted freelancers.
  - **Comparison:** Side-by-side comparison UI utilizing `gap-px` grid borders to separate data points cleanly.
  - **Action:** A definitive "Accept Proposal" button that triggers a confirmation modal (styled with `backdrop-blur-md` and `bg-surface-container/90`).

### 2. The Hiring Flow & Escrow Initialization
- **State Transition:** Smooth, animated transition (`motion/react`) changing the job status badge from `Open` (e.g., green/primary) to `In Progress` (e.g., amber/secondary).
- **System Feedback:** A terminal-like success log or toast notification (`sonner`) confirming the assignment and the initialization of the automated escrow.

## Design Principles
- **Clarity & Trust:** Clear visual distinction between "Client" and "Freelancer" views. Heavy use of system fonts (`Inter`) for readability and monospace (`JetBrains Mono`) for financial figures to build confidence.
- **Real-time Dynamics:** Use of Firestore `onSnapshot` to instantly inject new bids into the UI, accompanied by a subtle highlight animation (`animate-pulse` or Framer Motion `layout` animations) to draw attention to new data.
- **Data Density:** The client dashboard prioritizes scannability, using visible grid structures and muted secondary text (`text-on-surface-variant`) to reduce noise.

## Data Model (Firestore)
- **Sub-collection:** `jobs/{jobId}/bids`
- **Fields:** `id`, `jobId`, `freelancerId`, `freelancerName`, `amount`, `proposal`, `status` (pending/accepted/rejected), `createdAt`.
- **Security:** Strict Firestore rules ensuring freelancers can only read their own bids, while clients can read all bids for their projects.
