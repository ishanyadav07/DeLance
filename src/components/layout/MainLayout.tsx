import React from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const showSidebar = !isLanding;

  return (
    <div className="min-h-screen bg-surface text-on-surface selection:bg-primary/30 relative overflow-hidden">
      {/* Global Background Elements */}
      <div className="fixed inset-0 grid-bg pointer-events-none opacity-20"></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      <Navbar />
      <div className="flex relative z-10">
        {showSidebar && <Sidebar />}
        <main className={`flex-1 flex flex-col w-full min-w-0 overflow-x-hidden pb-12 md:pb-24 transition-all duration-500 ${showSidebar ? 'lg:ml-[18rem] pt-16' : 'pt-16'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};
