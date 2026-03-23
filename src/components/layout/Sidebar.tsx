import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  MessageSquare, 
  Settings, 
  HelpCircle, 
  LogOut,
  Plus,
  Rocket
} from 'lucide-react';
import { cn } from '@/src/utils';

export const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Briefcase, label: 'Jobs', path: '/marketplace' },
    { icon: Rocket, label: 'Showcase', path: '/showcase' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 fixed left-4 top-4 h-[calc(100vh-2rem)] bg-surface/40 backdrop-blur-2xl border border-white/10 rounded-2xl pt-8 pb-8 px-4 z-40 shadow-2xl shadow-black/20">
      <div className="mb-8 px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-surface rotate-12">
            <span className="text-xs font-black -rotate-12">D</span>
          </div>
          <span className="text-xl font-headline font-black tracking-tighter">
            De<span className="text-primary">Lance</span>
          </span>
        </div>

        <div className="flex items-center gap-3 mb-6 p-3 bg-white/5 rounded-xl border border-white/5">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Briefcase size={20} />
          </div>
          <div>
            <p className="font-label text-[10px] uppercase tracking-widest text-primary">Platform v1.0</p>
            <p className="text-xs font-bold">Verified Freelancer</p>
          </div>
        </div>
        
        <Link to="/post-project" className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2">
          <Plus size={16} />
          Post a Project
        </Link>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              location.pathname === item.path 
                ? "bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5" 
                : "text-on-surface-variant hover:text-on-surface hover:bg-white/5"
            )}
          >
            <item.icon size={18} />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/5 space-y-1">
        <Link to="/support" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-on-surface hover:bg-white/5 rounded-xl transition-all">
          <HelpCircle size={18} />
          <span className="text-sm">Support</span>
        </Link>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-error hover:bg-error/5 rounded-xl transition-all">
          <LogOut size={18} />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
