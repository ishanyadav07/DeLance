import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Bell, 
  Shield, 
  Wallet, 
  Settings as SettingsIcon, 
  Eye, 
  EyeOff, 
  ChevronRight,
  Lock,
  Globe,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/src/utils';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientText } from '../components/ui/GradientText';

export const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Globe },
  ];

  return (
    <div className="max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <header className="mb-8 sm:mb-12 space-y-2">
        <h1 className="text-3xl font-headline font-extrabold tracking-tight">Settings</h1>
        <p className="text-on-surface-variant text-sm font-label">Manage your platform identity and preferences</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group whitespace-nowrap shrink-0 lg:shrink lg:w-full",
                activeTab === tab.id 
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              )}
            >
              <tab.icon size={18} className={cn(
                "transition-colors",
                activeTab === tab.id ? "text-primary" : "text-on-surface-variant group-hover:text-on-surface"
              )} />
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div layoutId="active-tab" className="hidden lg:block ml-auto w-1 h-4 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-10">
          {activeTab === 'profile' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              <section className="space-y-6">
                <h3 className="font-headline font-bold text-xl">Public Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant font-bold">Display Name</label>
                    <input 
                      type="text" 
                      defaultValue="Alex Rivers"
                      className="w-full bg-surface-container border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant font-bold">Email (Private)</label>
                    <input 
                      type="email" 
                      defaultValue="alex@rivers.com"
                      className="w-full bg-surface-container border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant font-bold">Bio</label>
                    <textarea 
                      rows={4}
                      defaultValue="Full-stack Developer specializing in scalable backend architectures and security."
                      className="w-full bg-surface-container border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <h3 className="font-headline font-bold text-xl">Social Identity</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Globe size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold">ENS Domain</p>
                        <p className="text-xs text-on-surface-variant">alexrivers.com</p>
                      </div>
                    </div>
                    <button className="text-xs font-medium text-primary hover:underline">Change</button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                        <Zap size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold">World ID</p>
                        <p className="text-xs text-on-surface-variant">Verified Human</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-tertiary text-xs font-bold">
                      <CheckCircle2 size={14} />
                      <span>Verified</span>
                    </div>
                  </div>
                </div>
              </section>

              <div className="pt-6 flex justify-end gap-4">
                <button className="px-6 py-2 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors">Cancel</button>
                <button className="px-6 py-2 bg-primary text-surface rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors">Save Changes</button>
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              <section className="space-y-6">
                <h3 className="font-headline font-bold text-xl">Security Processes</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-6 bg-surface-container-low rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <Shield size={24} className="text-tertiary" />
                      <div>
                        <p className="text-sm font-bold">Two-Factor Authentication</p>
                        <p className="text-xs text-on-surface-variant">Add an extra layer of security to your account.</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-tertiary/10 text-tertiary rounded-lg text-xs font-bold border border-tertiary/20">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <h3 className="font-headline font-bold text-xl">Notification Preferences</h3>
              <div className="space-y-6">
                {[
                  { title: 'Milestone Updates', desc: 'Get notified when a milestone is submitted or approved.' },
                  { title: 'Escrow Releases', desc: 'Alerts for when funds are released from the escrow.' },
                  { title: 'New Messages', desc: 'Direct messages from clients or freelancers.' },
                  { title: 'Platform Updates', desc: 'Updates on DeLance platform changes.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
                    <div className="space-y-1">
                      <p className="text-sm font-bold">{item.title}</p>
                      <p className="text-xs text-on-surface-variant">{item.desc}</p>
                    </div>
                    <div className="w-12 h-6 bg-primary/20 rounded-full p-1 cursor-pointer flex items-center">
                      <div className="w-4 h-4 bg-primary rounded-full ml-auto"></div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
