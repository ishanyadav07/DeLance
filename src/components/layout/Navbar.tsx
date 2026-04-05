import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Menu, ChevronDown, User, Settings, LogOut, CheckCircle2, Clock, Shield, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/utils';
import { GlassCard } from '../ui/GlassCard';
import { GradientText } from '../ui/GradientText';
import { useFirebase } from '../FirebaseProvider';
import { useWeb3 } from '../Web3Provider';
import { signInWithGoogle, signOut } from '../../services/authService';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { user, loading, isAdmin } = useFirebase();
  const { account: walletAddress, balance, usdcBalance, connectWallet, loading: isConnectingWallet, isCorrectNetwork } = useWeb3();
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const showSidebar = location.pathname !== '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Login failed:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setShowProfileMenu(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const notifications = [
    { id: 1, title: 'Milestone Approved', desc: 'Acme Corp approved Milestone 1.', time: '2h ago', icon: CheckCircle2, color: 'text-tertiary' },
    { id: 2, title: 'New Proposal', desc: 'You received a new proposal for Security Audit.', time: '5h ago', icon: Clock, color: 'text-primary' },
    { id: 3, title: 'Escrow Released', desc: '$2,500 released to your account.', time: '1d ago', icon: Shield, color: 'text-secondary' },
  ];

  return (
    <nav className={cn(
      "fixed top-0 z-50 transition-all duration-500",
      showSidebar 
        ? "lg:left-[calc(16rem+1rem)] lg:w-[calc(100%-16rem-2rem)] lg:-translate-x-0 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)]" 
        : "left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)]",
      "w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)]",
      scrolled || !isLanding || isMobileMenuOpen
        ? "bg-surface/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/20 py-1" 
        : "bg-surface/10 backdrop-blur-md border border-white/5 rounded-2xl py-1"
    )}>
      <div className="px-4 sm:px-6 flex justify-between items-center h-[53px] w-full">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-primary rounded-xl rotate-12 group-hover:rotate-0 transition-transform duration-500 flex items-center justify-center overflow-hidden shadow-lg shadow-primary/20">
                <Shield size={20} className="text-surface -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
              </div>
              <div className="absolute -inset-1 bg-primary/20 blur-lg rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                <div className="w-4 h-4 border border-primary/40 rounded-sm rotate-45 flex items-center justify-center">
                  <span className="text-[6px] font-black text-primary/60 -rotate-45">D</span>
                </div>
              </div>
            </div>
            <span className="text-2xl font-headline font-black tracking-tighter">
              De<span className="text-primary">Lance</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/marketplace" className={cn(
              "text-sm font-medium transition-all hover:text-primary relative group py-1",
              location.pathname === '/marketplace' ? "text-primary" : "text-on-surface-variant"
            )}>
              Browse Jobs
              <span className={cn(
                "absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300",
                location.pathname === '/marketplace' ? "w-full" : "w-0 group-hover:w-full"
              )}></span>
            </Link>
            <Link to="/dashboard" className={cn(
              "text-sm font-medium transition-all hover:text-primary relative group py-1",
              location.pathname === '/dashboard' ? "text-primary" : "text-on-surface-variant"
            )}>
              Dashboard
              <span className={cn(
                "absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300",
                location.pathname === '/dashboard' ? "w-full" : "w-0 group-hover:w-full"
              )}></span>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Web3 Wallet Connect Button - Hover Expand */}
          <div className="hidden md:block">
            {!walletAddress ? (
              <button 
                onClick={connectWallet}
                disabled={isConnectingWallet}
                className="flex items-center gap-2 bg-primary text-surface px-4 py-2 rounded-xl font-label font-bold text-[10px] uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                <Wallet size={14} />
                {isConnectingWallet ? 'Connecting...' : 'Connect Wallet'}
              </button>
            ) : (
              <motion.div 
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-default",
                  isCorrectNetwork 
                    ? "bg-surface-container-high border-white/10" 
                    : "bg-error/10 border-error/20"
                )}
                whileHover="expanded"
                initial="collapsed"
              >
                {/* Network Status */}
                <div className="flex items-center gap-2 pr-2 border-r border-white/10">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    isCorrectNetwork ? "bg-success animate-pulse" : "bg-error"
                  )} />
                  <span className={cn(
                    "text-[9px] font-bold uppercase tracking-widest",
                    isCorrectNetwork ? "text-on-surface-variant" : "text-error"
                  )}>
                    {isCorrectNetwork ? 'Sepolia' : 'Wrong Network'}
                  </span>
                </div>

                {/* Balance & Address */}
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-bold text-primary">
                        {usdcBalance ? parseFloat(usdcBalance).toFixed(2) : '0.00'}
                      </span>
                      <span className="text-[9px] font-bold text-outline uppercase tracking-widest">USDC</span>
                    </div>
                    <motion.div 
                      variants={{
                        collapsed: { opacity: 0, height: 0, marginTop: 0 },
                        expanded: { opacity: 1, height: 'auto', marginTop: 2 }
                      }}
                      className="flex items-center gap-1.5 overflow-hidden"
                    >
                      <span className="text-[10px] font-mono text-on-surface-variant">
                        {balance ? parseFloat(balance).toFixed(4) : '0.0000'}
                      </span>
                      <span className="text-[8px] font-bold text-outline uppercase tracking-widest">ETH</span>
                    </motion.div>
                  </div>

                  <motion.div 
                    variants={{
                      collapsed: { width: 0, opacity: 0, marginLeft: 0 },
                      expanded: { width: 'auto', opacity: 1, marginLeft: 8 }
                    }}
                    className="overflow-hidden whitespace-nowrap border-l border-white/10 pl-3"
                  >
                    <span className="text-[10px] font-mono text-on-surface-variant bg-white/5 px-2 py-1 rounded-lg">
                      {formatAddress(walletAddress)}
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>

          {user ? (
            <>
              {/* Notification Center */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileMenu(false);
                  }}
                  className="p-2 text-on-surface-variant hover:bg-white/5 rounded-xl transition-all relative"
                >
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-surface"></span>
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-80 rounded-2xl shadow-2xl overflow-hidden"
                    >
                      <GlassCard className="p-0 sm:p-0 border border-white/5">
                        <div className="p-4 border-b border-white/5 flex justify-between items-center">
                          <h4 className="font-bold text-sm">Notifications</h4>
                          <button className="text-[10px] font-label text-primary uppercase tracking-widest hover:underline">Mark all as read</button>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto">
                          {notifications.map((n) => (
                            <div key={n.id} className="p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 cursor-pointer group">
                              <div className="flex gap-3">
                                <div className={cn("mt-1", n.color)}>
                                  <n.icon size={16} />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs font-bold group-hover:text-primary transition-colors">{n.title}</p>
                                  <p className="text-[11px] text-on-surface-variant leading-relaxed">{n.desc}</p>
                                  <p className="text-[9px] text-outline font-label uppercase tracking-widest">{n.time}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Link 
                          to="/settings" 
                          onClick={() => setShowNotifications(false)}
                          className="block p-4 text-center text-xs font-medium text-on-surface-variant hover:text-primary transition-colors bg-surface-container-high/30"
                        >
                          View all notifications
                        </Link>
                      </GlassCard>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile Menu */}
              <div className="hidden md:block relative">
                <button 
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 p-1 pr-3 rounded-2xl bg-surface-container-low border border-white/5 hover:bg-surface-container transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-tertiary p-0.5">
                    <div className="w-full h-full rounded-[10px] bg-surface flex items-center justify-center overflow-hidden">
                      <img src={user?.photoURL || "https://picsum.photos/seed/architect/100/100"} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  </div>
                  <ChevronDown size={14} className={cn("text-on-surface-variant transition-transform", showProfileMenu && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-56 rounded-2xl shadow-2xl overflow-hidden"
                    >
                      <GlassCard className="p-0 sm:p-0 border border-white/5">
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold">{user?.displayName || 'User'}</p>
                {isAdmin && (
                  <span className="px-1.5 py-0.5 rounded-md bg-error/10 text-error text-[8px] font-bold uppercase tracking-widest border border-error/20">Admin</span>
                )}
              </div>
              <p className="text-[10px] text-on-surface-variant truncate">{user?.email}</p>
            </div>
                        <div className="p-2">
                          <Link 
                            to="/profile" 
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-sm transition-colors"
                          >
                            <User size={16} className="text-on-surface-variant" />
                            <span>View Profile</span>
                          </Link>
                          <Link 
                            to="/settings" 
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-sm transition-colors"
                          >
                            <Settings size={16} className="text-on-surface-variant" />
                            <span>Settings</span>
                          </Link>
                          {isAdmin && (
                            <Link 
                              to="/marketplace" 
                              onClick={() => setShowProfileMenu(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-error/10 text-error text-sm transition-colors"
                            >
                              <Shield size={16} />
                              <span>Admin Panel</span>
                            </Link>
                          )}
                        </div>
                        <div className="p-2 border-t border-white/5 bg-surface-container-high/30">
                          <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-error/10 text-error text-sm transition-colors"
                          >
                            <LogOut size={16} />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </GlassCard>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <button 
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="hidden md:flex items-center gap-2 bg-primary text-surface px-5 py-2 rounded-xl font-label font-bold text-xs uppercase tracking-wider active:scale-95 transition-all disabled:opacity-50"
            >
              <User size={16} />
              {isLoggingIn ? 'Signing In...' : 'Sign In'}
            </button>
          )}

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-on-surface-variant hover:bg-white/5 rounded-xl transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 overflow-hidden"
          >
            <div className="p-6 space-y-4">
              <Link 
                to="/marketplace" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-lg font-bold hover:text-primary transition-colors"
              >
                Browse Jobs
              </Link>
              <Link 
                to="/dashboard" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-lg font-bold hover:text-primary transition-colors"
              >
                Dashboard
              </Link>

              {/* Mobile Wallet Button */}
              <div className="pt-4 border-t border-white/5">
                {!walletAddress ? (
                  <button 
                    onClick={() => {
                      connectWallet();
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={isConnectingWallet}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-surface py-4 rounded-xl font-bold transition-all disabled:opacity-50"
                  >
                    <Wallet size={20} />
                    {isConnectingWallet ? 'Connecting...' : 'Connect Wallet'}
                  </button>
                ) : (
                  <div className={cn(
                    "p-4 rounded-xl border space-y-4",
                    isCorrectNetwork ? "bg-surface-container-high border-white/10" : "bg-error/10 border-error/20"
                  )}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          isCorrectNetwork ? "bg-success animate-pulse" : "bg-error"
                        )} />
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-widest",
                          isCorrectNetwork ? "text-on-surface-variant" : "text-error"
                        )}>
                          {isCorrectNetwork ? 'Sepolia Network' : 'Wrong Network'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-outline">{formatAddress(walletAddress)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[9px] uppercase tracking-widest text-outline font-bold">USDC Balance</p>
                        <p className="text-xl font-headline font-black text-primary">
                          {usdcBalance ? parseFloat(usdcBalance).toFixed(2) : '0.00'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] uppercase tracking-widest text-outline font-bold">ETH Balance</p>
                        <p className="text-xl font-headline font-black text-on-surface">
                          {balance ? parseFloat(balance).toFixed(4) : '0.0000'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {user && (
                <>
                  <Link 
                    to="/post-project" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-lg font-bold hover:text-primary transition-colors"
                  >
                    Post a Project
                  </Link>
                  <Link 
                    to="/profile" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-lg font-bold hover:text-primary transition-colors"
                  >
                    Profile
                  </Link>
                  <Link 
                    to="/settings" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-lg font-bold hover:text-primary transition-colors"
                  >
                    Settings
                  </Link>
                </>
              )}
              {!user ? (
                <button 
                  onClick={() => {
                    handleLogin();
                    setIsMobileMenuOpen(false);
                  }}
                  disabled={isLoggingIn}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-surface py-4 rounded-xl font-bold disabled:opacity-50"
                >
                  <User size={20} />
                  {isLoggingIn ? 'Signing In...' : 'Sign In'}
                </button>
              ) : (
                <div className="pt-4 border-t border-white/5 space-y-4">
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-error/10 text-error py-4 rounded-xl font-bold hover:bg-error/20 transition-colors"
                  >
                    <LogOut size={20} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
