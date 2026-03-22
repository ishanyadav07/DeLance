import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  ArrowLeft, 
  Lock, 
  ShieldCheck, 
  ChevronRight, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Plus, 
  Trash2, 
  Coins, 
  Layers, 
  Target,
  Info
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/src/utils';

import { GlassCard } from '../components/ui/GlassCard';

type Step = 'basics' | 'details' | 'milestones' | 'review';

interface Milestone {
  id: string;
  title: string;
  amount: number;
  description: string;
}

export const PostProject = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('basics');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Smart Contracts');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('ETH');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: '1', title: 'Initial Draft & Architecture', amount: 30, description: 'Delivery of technical specifications and initial smart contract structure.' }
  ]);

  const steps: { id: Step; label: string; icon: any }[] = [
    { id: 'basics', label: 'Basics', icon: Layers },
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'milestones', label: 'Escrow', icon: Target },
    { id: 'review', label: 'Review', icon: ShieldCheck },
  ];

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      if (!tags.includes(currentTag.trim())) {
        setTags([...tags, currentTag.trim()]);
      }
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const addMilestone = () => {
    const newId = (milestones.length + 1).toString();
    setMilestones([...milestones, { id: newId, title: '', amount: 0, description: '' }]);
  };

  const removeMilestone = (id: string) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter(m => m.id !== id));
    }
  };

  const updateMilestone = (id: string, field: keyof Milestone, value: string | number) => {
    setMilestones(milestones.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const nextStep = () => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  };

  const prevStep = () => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center space-y-6 md:space-y-8"
        >
          <div className="relative">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-tertiary/20 flex items-center justify-center text-tertiary mb-4 relative z-10">
              <CheckCircle2 size={40} className="md:w-12 md:h-12" />
            </div>
            <div className="absolute inset-0 bg-tertiary/20 blur-2xl rounded-full scale-150 opacity-50"></div>
          </div>
          
          <div className="space-y-3 md:space-y-4">
            <h1 className="text-3xl md:text-4xl font-headline font-extrabold tracking-tight">Project Deployed</h1>
            <p className="text-on-surface-variant text-base md:text-lg max-w-md mx-auto leading-relaxed">
              Your project is now live on the protocol. <span className="text-primary font-bold">{budget} {currency}</span> has been locked in the escrow vault.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-6 md:pt-8 w-full sm:w-auto">
            <Link to="/dashboard" className="w-full sm:w-auto px-8 py-3.5 bg-surface-container-high rounded-xl font-bold text-sm hover:bg-surface-container-highest transition-all border border-white/5">
              Dashboard
            </Link>
            <Link to="/marketplace" className="w-full sm:w-auto px-8 py-3.5 bg-primary text-surface rounded-xl font-bold text-sm hover:brightness-110 transition-all shadow-xl shadow-primary/20">
              Marketplace
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-8 md:mb-10">
        <div className="space-y-1">
          <Link to="/dashboard" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group w-fit mb-2">
            <ArrowLeft size={12} />
            <span className="font-label text-[9px] uppercase tracking-widest font-bold">Cancel Posting</span>
          </Link>
          <h1 className="font-headline text-2xl md:text-3xl font-extrabold tracking-tight">Post Project</h1>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-1 bg-surface-container-low p-1.5 rounded-xl border border-white/5 overflow-x-auto no-scrollbar">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = steps.findIndex(s => s.id === currentStep) > idx;

            return (
              <React.Fragment key={step.id}>
                <button 
                  onClick={() => {
                    if (steps.findIndex(s => s.id === currentStep) > idx) {
                      setCurrentStep(step.id);
                    }
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all shrink-0",
                    isActive ? "bg-primary text-surface shadow-md shadow-primary/20" : 
                    isCompleted ? "text-tertiary bg-tertiary/10" : "text-outline hover:bg-white/5"
                  )}
                >
                  <Icon size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{step.label}</span>
                </button>
                {idx < steps.length - 1 && (
                  <div className="w-2 h-[1px] bg-white/10 shrink-0"></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
        {/* Main Form Area */}
        <div className="lg:col-span-8">
          <GlassCard className="p-0 overflow-hidden border border-white/5 shadow-xl">
            <form onSubmit={handleSubmit}>
              <div className="p-6 md:p-8">
                <AnimatePresence mode="wait">
                  {currentStep === 'basics' && (
                    <motion.div
                      key="basics"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <label className="font-label text-[10px] uppercase tracking-widest text-primary font-bold">Project Title</label>
                          <input 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full bg-surface-container-highest border border-white/5 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-primary/30 text-lg font-medium placeholder:text-outline/50 transition-all" 
                            placeholder="e.g. Smart Contract Audit for Yield Protocol" 
                            type="text" 
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="font-label text-[10px] uppercase tracking-widest text-primary font-bold">Category</label>
                            <div className="relative">
                              <select 
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-surface-container-highest border border-white/5 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer font-medium text-sm"
                              >
                                <option>Smart Contracts</option>
                                <option>Frontend / dApp</option>
                                <option>ZK-Proofs</option>
                                <option>Security Audit</option>
                                <option>Architecture</option>
                              </select>
                              <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none text-outline" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="font-label text-[10px] uppercase tracking-widest text-primary font-bold">Budget</label>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <input 
                                  value={budget}
                                  onChange={(e) => setBudget(e.target.value)}
                                  required 
                                  className="w-full bg-surface-container-highest border border-white/5 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-primary/30 font-mono text-base" 
                                  placeholder="0.00" 
                                  type="number" 
                                />
                              </div>
                              <select 
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="bg-surface-container-highest border border-white/5 rounded-xl px-4 font-bold text-primary focus:ring-2 focus:ring-primary/30 text-sm"
                              >
                                <option>ETH</option>
                                <option>USDC</option>
                                <option>SOL</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 'details' && (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <label className="font-label text-[10px] uppercase tracking-widest text-primary font-bold">Description</label>
                          <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            className="w-full bg-surface-container-highest border border-white/5 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-primary/30 min-h-[200px] leading-relaxed resize-none text-sm" 
                            placeholder="Describe the technical scope, specific requirements, and expected deliverables..."
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="font-label text-[10px] uppercase tracking-widest text-primary font-bold">Required Skills</label>
                          <div className="space-y-3">
                            <div className="relative">
                              <input 
                                value={currentTag}
                                onChange={(e) => setCurrentTag(e.target.value)}
                                onKeyDown={handleAddTag}
                                className="w-full bg-surface-container-highest border border-white/5 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-primary/30 text-sm" 
                                placeholder="Type a skill and press Enter..." 
                                type="text" 
                              />
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {tags.map(tag => (
                                <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-primary">
                                  {tag}
                                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-error transition-colors">
                                    <Plus size={12} className="rotate-45" />
                                  </button>
                                </span>
                              ))}
                              {tags.length === 0 && (
                                <p className="text-[10px] text-outline italic">No skills added yet.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 'milestones' && (
                    <motion.div
                      key="milestones"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h3 className="font-headline text-lg font-bold">Escrow Milestones</h3>
                          <p className="text-[10px] text-outline uppercase tracking-wider">Divide your project into phases.</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={addMilestone}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-[10px] font-bold hover:bg-primary/20 transition-all"
                        >
                          <Plus size={12} /> Add Milestone
                        </button>
                      </div>

                      <div className="space-y-3">
                        {milestones.map((m, idx) => (
                          <div key={m.id} className="group relative bg-surface-container-highest/30 border border-white/5 rounded-xl p-4 md:p-5 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                  <div className="md:col-span-9 space-y-1.5">
                                    <label className="font-label text-[9px] uppercase tracking-widest text-outline">Milestone Title</label>
                                    <input 
                                      value={m.title}
                                      onChange={(e) => updateMilestone(m.id, 'title', e.target.value)}
                                      placeholder="e.g. Smart Contract Audit Report"
                                      className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-base"
                                    />
                                  </div>
                                  <div className="md:col-span-3 space-y-1.5">
                                    <label className="font-label text-[9px] uppercase tracking-widest text-outline">Payout %</label>
                                    <div className="flex items-center gap-1.5">
                                      <input 
                                        type="number"
                                        value={m.amount}
                                        onChange={(e) => updateMilestone(m.id, 'amount', parseInt(e.target.value) || 0)}
                                        className="w-full bg-transparent border-none p-0 focus:ring-0 font-mono text-base text-primary font-bold"
                                      />
                                      <span className="text-outline text-xs">%</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="font-label text-[9px] uppercase tracking-widest text-outline">Deliverables</label>
                                  <textarea 
                                    value={m.description}
                                    onChange={(e) => updateMilestone(m.id, 'description', e.target.value)}
                                    placeholder="What exactly will be delivered?"
                                    className="w-full bg-transparent border-none p-0 focus:ring-0 text-xs leading-relaxed resize-none h-10"
                                  />
                                </div>
                              </div>
                              {milestones.length > 1 && (
                                <button 
                                  type="button" 
                                  onClick={() => removeMilestone(m.id)}
                                  className="p-1.5 text-outline hover:text-error transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-3 bg-tertiary/5 border border-tertiary/10 rounded-xl flex items-start gap-3">
                        <Info size={16} className="text-tertiary shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-tertiary">Escrow Logic</p>
                          <p className="text-[10px] text-on-surface-variant leading-relaxed">
                            Total payout must equal 100%. Current total: <span className={cn("font-bold", milestones.reduce((acc, m) => acc + m.amount, 0) === 100 ? "text-tertiary" : "text-error")}>
                              {milestones.reduce((acc, m) => acc + m.amount, 0)}%
                            </span>
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 'review' && (
                    <motion.div
                      key="review"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="space-y-5">
                        <div className="bg-surface-container-highest/20 border border-white/5 rounded-xl p-5 md:p-6 space-y-6">
                          <div className="space-y-2">
                            <h2 className="text-xl md:text-2xl font-headline font-extrabold">{title || 'Untitled Project'}</h2>
                            <div className="flex flex-wrap gap-1.5">
                              <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-[9px] font-bold uppercase tracking-widest">{category}</span>
                              <span className="px-2.5 py-0.5 bg-white/5 text-outline rounded-full text-[9px] font-bold uppercase tracking-widest">{budget} {currency}</span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-label text-[10px] uppercase tracking-widest text-primary font-bold">Project Summary</h4>
                            <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed line-clamp-4">
                              {description || 'No description provided.'}
                            </p>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-label text-[10px] uppercase tracking-widest text-primary font-bold">Escrow Breakdown</h4>
                            <div className="space-y-2">
                              {milestones.map((m, i) => (
                                <div key={m.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                  <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-[10px] font-bold text-outline">{i + 1}</span>
                                    <span className="font-bold text-xs">{m.title || 'Untitled Milestone'}</span>
                                  </div>
                                  <span className="font-mono text-xs text-primary font-bold">{m.amount}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="p-3 md:p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-center gap-4">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Lock size={20} />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-xs md:text-sm font-bold">Protocol Security</p>
                            <p className="text-[9px] md:text-[10px] text-on-surface-variant leading-relaxed">
                              By proceeding, you agree to lock <span className="text-primary font-bold">{budget} {currency}</span> into the DeLance Escrow Contract.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation Footer */}
              <div className="p-5 md:p-6 bg-surface-container-low/30 border-t border-white/5 flex items-center justify-between">
                <button 
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 'basics'}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-outline hover:text-on-surface disabled:opacity-0 transition-all"
                >
                  <ArrowLeft size={14} /> Previous
                </button>

                {currentStep === 'review' ? (
                  <button 
                    type="submit"
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-surface rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
                  >
                    <Lock size={16} /> Deploy & Lock
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold text-sm active:scale-95 transition-all"
                  >
                    Next Step <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </form>
          </GlassCard>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-5">
          <GlassCard className="p-6 md:p-7 space-y-5 border border-white/5 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary">
              <ShieldCheck size={20} />
            </div>
            <div className="space-y-3">
              <h3 className="font-headline text-lg font-bold">Trustless Escrow</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                DeLance uses an immutable smart contract vault to secure project funds. 
              </p>
              <ul className="space-y-2">
                {[
                  'Funds locked upon posting',
                  'Milestone-based releases',
                  'Dispute resolution protocol',
                  'Zero intermediary fees'
                ].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-[10px] text-outline">
                    <div className="w-1 h-1 rounded-full bg-tertiary"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </GlassCard>

          <div className="p-6 bg-surface-container-highest/20 rounded-2xl border border-white/5 space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Coins size={16} />
              <span className="font-bold text-xs">Gas Optimization</span>
            </div>
            <p className="text-[10px] text-on-surface-variant leading-relaxed">
              Our protocol is optimized for low-cost deployments on L2 networks. Estimated gas: <span className="text-primary font-mono font-bold">~0.0004 ETH</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

