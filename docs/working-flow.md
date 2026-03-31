# TrustLance: Codebase Working Flow

Welcome to the documentation for the **TrustLance** codebase! This document explains how the entire application works from top to bottom. It is designed to be easy to understand for beginners, while still providing the depth needed for advanced developers.

---

## 🏗️ 1. High-Level Overview

TrustLance is a modern freelancing platform that connects clients with freelancers. It features secure authentication, project management, and an escrow payment system (via Web3 Smart Contracts).

### **Tech Stack:**
* **Frontend:** React 19, Vite, Tailwind CSS, Framer Motion (for animations).
* **Backend/Server:** Node.js with Express (serves API and Vite dev server).
* **Database & Auth:** Firebase (Firestore & Google Authentication).
* **Smart Contracts:** Web3 integration for secure escrow payments.

---

## 📂 2. Folder Structure

Here is a quick look at where everything lives:

* `/server.ts` - The main entry point for the backend server.
* `/src/main.tsx` - The main entry point for the React frontend.
* `/src/App.tsx` - The root React component containing all the routes.
* `/src/pages/` - Contains all the individual screens (Dashboard, Marketplace, Profile, etc.).
* `/src/components/` - Reusable UI pieces (Buttons, Layouts, Loaders).
* `/src/services/` - Logic for talking to external services (like Firebase Auth).
* `/src/contracts/` - Web3 Smart Contract definitions (e.g., `TrustLance.json`).
* `/src/types/` - TypeScript definitions (Project, Milestone, User types).

---

## 🔄 3. Step-by-Step Working Flow

### **Step 1: Application Startup**
* When you run `npm run dev`, it executes `tsx server.ts`.
* The **Express Server** starts on port `3000`.
* The server sets up basic API routes (like `/api/health` and `/api/profiles/:uid`).
* It then attaches **Vite as a middleware**. This means Express handles backend API requests, and Vite handles serving the React frontend.

### **Step 2: Frontend Initialization**
* The browser loads `index.html`, which calls `src/main.tsx`.
* `main.tsx` renders the `<App />` component.
* Inside `App.tsx`, the app is wrapped in several important providers:
  * `<ErrorBoundary>`: Catches any UI crashes and shows a fallback screen.
  * `<FirebaseProvider>`: Initializes Firebase and listens for user login status.
  * `<Router>`: Manages navigation between different pages.

### **Step 3: Authentication Flow**
* A user clicks "Sign In" on the Landing Page.
* The app calls `signInWithGoogle()` from `src/services/authService.ts`.
* A Google popup appears. Once the user logs in, Firebase returns their user data.
* The app checks **Firestore** (the database) to see if a profile exists for this user.
  * **If new:** It creates a new user document with default roles (e.g., `freelancer`).
  * **If existing:** It updates their `updatedAt` timestamp.
* The user is then redirected to the `/dashboard`.

### **Step 4: Routing and Navigation**
* TrustLance uses **React Router** for navigation.
* Pages are loaded lazily using `React.lazy()` and `<Suspense>`. This means the code for a page is only downloaded when the user actually visits it, making the app load much faster.
* The `<MainLayout>` component wraps all pages, providing a consistent Navbar and Footer.

### **Step 5: Core Features & User Flows**

* **Browsing Jobs (Marketplace):**
  * The user visits `/marketplace`.
  * The frontend fetches a list of available projects (either from Firestore or the Express `/api/search/jobs` endpoint).
  * Projects are displayed as cards.

* **Posting a Project (Client Flow):**
  * A client visits `/post-project`.
  * They fill out a form with project details, budget, and milestones.
  * Upon submission, the data is saved to Firestore.

* **Submitting Work (Freelancer Flow):**
  * A freelancer visits `/submit-work/:jobId/:milestoneId`.
  * They upload their completed work or provide a link.
  * The milestone status updates to `reviewing`.

* **Escrow & Payments (Web3 Flow):**
  * When a project starts, funds are locked in a Smart Contract (`src/contracts/TrustLance.json`).
  * Users can view escrow details at `/escrow/:id`.
  * Once a milestone is approved, the smart contract releases the funds to the freelancer's wallet.

---

## 🧠 4. Concepts: Beginner to Advanced

If you are exploring the codebase, here is how you can level up your understanding:

### 🟢 **Beginner (UI & Layout)**
* **Tailwind CSS:** Look at any file in `src/pages/`. Notice how classes like `flex`, `items-center`, and `text-primary` are used to style elements without writing custom CSS files.
* **Components:** Look at `src/components/layout/MainLayout.tsx` to see how React components wrap around page content using `children`.

### 🟡 **Intermediate (Data & State)**
* **Firebase Auth:** Read `src/services/authService.ts`. Understand how `signInWithPopup` works and how errors are handled using the custom `handleFirestoreError` function.
* **Express API:** Look at `server.ts`. See how `app.get('/api/profiles/:uid', ...)` creates a backend endpoint that the frontend can fetch data from.

### 🔴 **Advanced (Performance & Web3)**
* **Lazy Loading:** Look at `src/App.tsx`. Notice `const Dashboard = lazy(() => import(...))`. This is an advanced React pattern for code-splitting.
* **Smart Contracts:** Explore `src/contracts/TrustLance.json`. This contains the ABI (Application Binary Interface) that allows the React frontend to talk to the blockchain for secure escrow payments.
* **Error Boundaries:** Look at `src/components/ErrorBoundary.tsx` (used in `App.tsx`). This catches JavaScript errors anywhere in the child component tree, logs those errors, and displays a fallback UI instead of crashing the whole app.

---

## 🔗 5. How the Codebase Connects (Step-by-Step Implementation Guide)

Understanding how the different pieces of the app talk to each other is crucial. Here is a step-by-step guide on how the connections are implemented:

### **Connection 1: Frontend (React) ↔️ Backend (Express)**
* **Step 1: The Backend Route:** In `server.ts`, the Express server defines API endpoints. For example, `app.get("/api/search/jobs", ...)` listens for requests.
* **Step 2: The Frontend Request:** Inside a React component (like `src/pages/Marketplace.tsx`), the `fetch()` API or `axios` is used to call `/api/search/jobs`.
* **Step 3: The Seamless Connection:** Because Vite is running as a middleware inside the Express server (`server.ts`), the frontend and backend share the exact same domain and port (`localhost:3000`). This completely eliminates CORS (Cross-Origin Resource Sharing) errors.

### **Connection 2: Frontend (React) ↔️ Database & Auth (Firebase)**
* **Step 1: Configuration:** The connection details are stored in `firebase-applet-config.json` and loaded into `src/firebase.ts`.
* **Step 2: Initialization:** `src/firebase.ts` initializes the Firebase app and exports the `db` (Firestore) and `auth` (Authentication) objects.
* **Step 3: Global State:** `src/components/FirebaseProvider.tsx` wraps the app. It listens to `onAuthStateChanged` and provides the current user's login status to all components via React Context.
* **Step 4: Executing Actions:** When a user performs an action (like logging in), a component calls a function from `src/services/authService.ts`. This service uses the exported `auth` and `db` objects to talk directly to Google's servers.

### **Connection 3: Component ↔️ Component (React Architecture)**
* **Step 1: Routing:** `src/App.tsx` acts as the traffic controller. It looks at the URL and decides which page component from `src/pages/` to render.
* **Step 2: Layouts:** The page is wrapped in `<MainLayout>`, which provides the Navbar and Footer. The `children` prop is used to inject the specific page content into the middle of the layout.
* **Step 3: Props & State:** A page component (like `Dashboard.tsx`) fetches data and stores it in local state using `useState`. It then passes this data down to smaller, reusable components (like a `ProjectCard` in `src/components/`) using **props**.

### **Connection 4: Frontend (React) ↔️ Blockchain (Smart Contracts)**
* **Step 1: The ABI:** The Smart Contract's ABI (Application Binary Interface) is stored as a JSON file in `src/contracts/TrustLance.json`. This tells the frontend what functions the smart contract has.
* **Step 2: The Web3 Provider:** Pages that need to interact with money (like `EscrowDetails.tsx`) use a Web3 library (like `ethers.js`) to connect to the user's browser wallet (e.g., MetaMask).
* **Step 3: The Transaction:** The frontend uses the ABI and the wallet connection to read data from the blockchain or send transactions to release funds.

---

## 🚀 Summary
TrustLance is a full-stack application. **Express** serves the API and the frontend. **React** builds the user interface. **Firebase** handles users and database storage. **Web3 Smart Contracts** handle the money. 

By following the flow from `server.ts` -> `main.tsx` -> `App.tsx` -> `Pages`, you can easily trace how any feature in the app works!
