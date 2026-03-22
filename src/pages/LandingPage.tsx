import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Shield, Zap, Globe, Lock, Key, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/src/utils';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientText } from '../components/ui/GradientText';
import { useFirebase } from '../components/FirebaseProvider';
import { signInWithGoogle } from '../services/authService';

export const LandingPage = () => {
  const { user, loading } = useFirebase();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = async () => {
    if (user) {
      navigate('/dashboard');
      return;
    }
    
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked') {
        alert('Please allow popups for this site to sign in with Google.');
      } else if (error.code !== 'auth/cancelled-popup-request') {
        console.error('Login failed:', error);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-start px-4 sm:px-6 md:px-12 lg:px-24 py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full"></div>
        </div>
        
        <div className="relative z-10 max-w-6xl text-left">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-4 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="font-label text-primary tracking-[0.2em] uppercase text-[10px] font-bold">Protocol v1.0 Live</span>
            </div>
            
            <div className="space-y-4">
              <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-[0.9] uppercase">
                The Sovereign <br /> 
                <span className="text-gradient-primary">Architect's</span> <br /> 
                Marketplace
              </h1>
              <div className="h-1 w-24 bg-primary/30 rounded-full"></div>
            </div>

            <p className="text-on-surface-variant text-base md:text-lg max-w-2xl leading-relaxed font-medium opacity-80">
              Eliminate intermediaries with a trustless protocol designed for high-end digital engineering and sovereign creative talent.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-start gap-6 pt-4">
              <Link to="/marketplace" className="w-full sm:w-auto px-12 py-6 bg-primary text-surface rounded-2xl font-label font-bold uppercase tracking-widest text-sm hover:scale-[1.05] active:scale-95 transition-all shadow-2xl shadow-primary/40 flex items-center justify-center gap-3">
                Browse Jobs <ArrowRight size={18} />
              </Link>
              <button 
                onClick={handleGetStarted}
                disabled={loading || isLoggingIn}
                className="w-full sm:w-auto px-12 py-6 glass-card text-white rounded-2xl font-label font-bold uppercase tracking-widest text-sm hover:bg-white/10 transition-all active:scale-95 border border-white/10 flex items-center justify-center disabled:opacity-50"
              >
                {user ? 'Go to Dashboard' : (loading || isLoggingIn ? (isLoggingIn ? 'Signing in...' : 'Connecting...') : 'Get Started')}
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="pt-16 flex flex-wrap gap-x-12 gap-y-6 grayscale pointer-events-none"
          >
            <div className="flex items-center justify-start gap-2 font-label text-xs tracking-widest uppercase">
              <Shield size={14} /> Verified
            </div>
            <div className="flex items-center justify-start gap-2 font-label text-xs tracking-widest uppercase">
              <Lock size={14} /> Escrowed
            </div>
            <div className="flex items-center justify-start gap-2 font-label text-xs tracking-widest uppercase">
              <Zap size={14} /> Instant
            </div>
            <div className="flex items-center justify-start gap-2 font-label text-xs tracking-widest uppercase">
              <Globe size={14} /> Global
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl 2xl:max-w-[96rem] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
          <GlassCard className="md:col-span-8 p-6 sm:p-10 md:p-12 flex flex-col justify-between min-h-[400px]">
            <div className="space-y-6">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Shield size={32} />
              </div>
              <h3 className="font-headline text-4xl font-bold tracking-tight">Escrow Protocol</h3>
              <p className="text-on-surface-variant text-lg leading-relaxed max-w-md">
                Smart contracts hold funds securely until milestones are met. No more chasing payments or worrying about scope creep.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <span className="font-label text-xs text-primary bg-primary/10 px-3 py-1 rounded-full uppercase font-bold tracking-widest">v1.0 Ready</span>
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container overflow-hidden">
                    <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" loading="lazy" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          <div className="md:col-span-4 bg-surface-container-low border border-white/5 p-10 rounded-2xl flex flex-col items-start">
            <div className="w-12 h-12 bg-tertiary/10 rounded-xl flex items-center justify-center mb-8 text-tertiary">
              <Zap size={24} />
            </div>
            <h3 className="font-headline text-2xl font-bold mb-4">Low Fees</h3>
            <p className="text-on-surface-variant text-base leading-relaxed">
              Industry-low 1% protocol fee. We prioritize the architect over the middleman.
            </p>
          </div>

          <div className="md:col-span-4 bg-surface-container-low border border-white/5 p-10 rounded-2xl flex flex-col items-start">
            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-8 text-secondary">
              <Globe size={24} />
            </div>
            <h3 className="font-headline text-2xl font-bold mb-4">Global Talent</h3>
            <p className="text-on-surface-variant text-base leading-relaxed">
              Permissionless access to top-tier architects from every corner of the globe.
            </p>
          </div>

          <GlassCard className="md:col-span-8 p-6 sm:p-10 md:p-12 flex flex-col md:flex-row items-center gap-12">
            <div className="space-y-4 flex-1">
              <h3 className="font-headline text-3xl font-bold leading-tight">Identity of the Sovereign</h3>
              <p className="text-on-surface-variant text-base leading-relaxed">
                Own your reputation. On-chain credentials and soulbound tokens prove your mastery without centralized silos.
              </p>
              <button className="inline-flex items-center gap-2 text-primary font-label text-sm uppercase font-bold tracking-widest hover:gap-4 transition-all">
                Learn About Rep-v1 <ArrowRight size={16} />
              </button>
            </div>
            <div className="w-full md:w-48 aspect-square rounded-2xl bg-linear-to-tr from-surface-container-highest to-primary/10 flex items-center justify-center border border-white/5">
              <Zap size={64} className="text-primary/40" />
            </div>
          </GlassCard>
        </div>
      </section>

      {/* How it works */}
      <section className="py-32 bg-surface-container-low/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="space-y-4">
              <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter">Trust Through Code</h2>
              <p className="text-on-surface-variant text-lg">The architecture of a secure collaboration.</p>
            </div>
            <div className="font-label text-white/10 text-7xl font-bold select-none leading-none">01-03</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
            <div className="hidden md:block absolute top-[40px] left-0 w-full h-[1px] bg-linear-to-r from-transparent via-outline-variant/30 to-transparent"></div>
            
            {[
              { step: 'Step One', title: 'Post Project', desc: 'Define your scope, milestones, and budget. Deposit funds into the smart contract escrow.', icon: Shield, color: 'text-primary' },
              { step: 'Step Two', title: 'Lock & Work', desc: 'Funds are cryptographically locked. The architect begins work with payment guaranteed by code.', icon: Key, color: 'text-secondary' },
              { step: 'Step Three', title: 'Release', desc: 'Upon milestone approval, funds are instantly released to the architect\'s wallet. Verified.', icon: CheckCircle, color: 'text-tertiary' },
            ].map((item, i) => (
              <div key={i} className="relative z-10 space-y-8">
                <div className="w-20 h-20 rounded-full bg-surface-container-highest flex items-center justify-center border-4 border-surface shadow-xl">
                  <item.icon size={32} className={item.color} />
                </div>
                <div className="space-y-4">
                  <div className={cn("font-label text-xs font-bold uppercase tracking-[0.2em]", item.color)}>{item.step}</div>
                  <h4 className="font-headline text-2xl font-bold">{item.title}</h4>
                  <p className="text-on-surface-variant leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <GlassCard className="max-w-7xl mx-auto p-8 sm:p-16 md:p-24 relative overflow-hidden text-center">
          <div className="absolute inset-0 z-0 bg-linear-to-br from-primary/5 via-transparent to-secondary/5"></div>
          <div className="relative z-10 space-y-10">
            <h2 className="font-headline text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter max-w-3xl mx-auto">
              Ready to build the future?
            </h2>
            <p className="text-on-surface-variant text-xl max-w-xl mx-auto">
              Join the next generation of architects and creators on the most secure Web3 marketplace.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={handleGetStarted}
                disabled={loading || isLoggingIn}
                className="w-full sm:w-auto px-12 py-6 bg-white text-surface rounded-xl font-label font-bold uppercase tracking-widest text-sm hover:scale-105 transition-all disabled:opacity-50"
              >
                {user ? 'Go to Dashboard' : (loading || isLoggingIn ? (isLoggingIn ? 'Signing in...' : 'Connecting...') : 'Get Started Now')}
              </button>
              <button className="w-full sm:w-auto px-12 py-6 glass-card text-white rounded-xl font-label font-bold uppercase tracking-widest text-sm hover:bg-white/5 transition-all">
                Read the Docs
              </button>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 px-6 bg-surface border-t border-white/5 text-xs text-on-surface-variant">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="font-headline font-bold text-white text-lg">DeLance</span>
            <p>© 2024 DeLance Protocol. Built for the Sovereign Architect.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Documentation</a>
            <a href="#" className="hover:text-primary transition-colors">GitHub</a>
            <a href="#" className="hover:text-primary transition-colors">Discord</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
