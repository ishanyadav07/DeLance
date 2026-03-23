import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { FirebaseProvider } from './components/FirebaseProvider';
import { Web3Provider } from './components/Web3Provider';
import { ErrorBoundary } from './components/ErrorBoundary';

const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Marketplace = lazy(() => import('./pages/Marketplace').then(m => ({ default: m.Marketplace })));
const ProjectDetails = lazy(() => import('./pages/ProjectDetails').then(m => ({ default: m.ProjectDetails })));
const PostProject = lazy(() => import('./pages/PostProject').then(m => ({ default: m.PostProject })));
const SubmitWork = lazy(() => import('./pages/SubmitWork').then(m => ({ default: m.SubmitWork })));
const EscrowDetails = lazy(() => import('./pages/EscrowDetails').then(m => ({ default: m.EscrowDetails })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const Showcase = lazy(() => import('./pages/Showcase').then(m => ({ default: m.Showcase })));

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center w-full">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <Web3Provider>
        <FirebaseProvider>
          <Router>
          <MainLayout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/project/:id" element={<ProjectDetails />} />
                <Route path="/post-project" element={<PostProject />} />
                <Route path="/submit-work" element={<SubmitWork />} />
                <Route path="/escrow/:id" element={<EscrowDetails />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/showcase" element={<Showcase />} />
                {/* Fallback routes for demo */}
                <Route path="/project-details" element={<ProjectDetails />} />
                <Route path="/escrow-details" element={<EscrowDetails />} />
              </Routes>
            </Suspense>
          </MainLayout>
        </Router>
      </FirebaseProvider>
    </Web3Provider>
  </ErrorBoundary>
  );
}
