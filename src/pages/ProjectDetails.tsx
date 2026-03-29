import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Calendar, 
  ShieldCheck, 
  MapPin, 
  Star, 
  Bookmark,
  ChevronRight,
  User,
  Lock,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { cn } from '@/src/utils';
import { doc, getDoc, collection, onSnapshot, query, addDoc, serverTimestamp, updateDoc, orderBy, writeBatch, increment, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useFirebase } from '../components/FirebaseProvider';
import { handleFirestoreError, OperationType } from '../utils/firebaseErrors';

import { GlassCard } from '../components/ui/GlassCard';
import { GradientText } from '../components/ui/GradientText';

export const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useFirebase();
  const [project, setProject] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bidSuccess, setBidSuccess] = useState(false);
  const [bids, setBids] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProject = async () => {
      try {
        const docRef = doc(db, 'jobs', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProject({ ...data, id: docSnap.id });

          // Fetch client info
          const clientRef = doc(db, 'users', data.clientId);
          const clientSnap = await getDoc(clientRef);
          if (clientSnap.exists()) {
            setClient(clientSnap.data());
          }
        } else {
          console.error("No such project!");
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  useEffect(() => {
    if (!id || !user || !project) return;

    // Real-time milestones
    const milestonesQuery = query(collection(db, `jobs/${id}/milestones`));
    const unsubscribeMilestones = onSnapshot(milestonesQuery, (snapshot) => {
      const milestonesData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setMilestones(milestonesData);
    });

    // Real-time bids: Client/Admin see all, Freelancers see only their own
    let bidsQuery;
    if (user.uid === project.clientId || isAdmin) {
      bidsQuery = query(collection(db, `jobs/${id}/bids`), orderBy('createdAt', 'desc'));
    } else {
      bidsQuery = query(collection(db, `jobs/${id}/bids`), where('freelancerId', '==', user.uid));
    }

    const unsubscribeBids = onSnapshot(bidsQuery, (snapshot) => {
      const bidsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setBids(bidsData);
    }, (error) => {
      console.error("Error fetching bids:", error);
    });

    return () => {
      unsubscribeMilestones();
      unsubscribeBids();
    };
  }, [id, user, project, isAdmin]);

  const handleApply = async () => {
    if (!user || !id || !proposal.trim()) return;
    
    const bidAmount = parseFloat(amount);
    if (isNaN(bidAmount) || bidAmount <= 0) {
      setError('Please enter a valid bid amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      const batch = writeBatch(db);
      
      const bidRef = doc(collection(db, `jobs/${id}/bids`));
      
      batch.set(bidRef, {
        id: bidRef.id,
        jobId: id,
        freelancerId: user.uid,
        freelancerName: user.displayName || 'Anonymous',
        freelancerPhotoURL: user.photoURL || '',
        amount: bidAmount,
        proposal,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      const jobRef = doc(db, 'jobs', id);
      batch.update(jobRef, {
        bidCount: (project.bidCount || 0) + 1
      });

      try {
        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `jobs/${id}/bids`);
      }

      setBidSuccess(true);
      setProposal('');
    } catch (error: any) {
      console.error("Error submitting bid:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptPlatform = async () => {
    if (!id || !user) return;
    try {
      setIsSubmitting(true);
      const batch = writeBatch(db);
      
      // 1. Update job status and assigned freelancer
      const jobRef = doc(db, 'jobs', id);
      batch.update(jobRef, {
        status: 'in-progress',
        freelancerId: user.uid,
        freelancerName: user.displayName || 'Anonymous'
      });

      // 2. Update all milestones to 'funded'
      milestones.forEach(m => {
        const milestoneRef = doc(db, `jobs/${id}/milestones`, m.id);
        batch.update(milestoneRef, { status: 'funded' });
      });

      await batch.commit();
      setProject((prev: any) => ({ ...prev, status: 'in-progress', freelancerId: user.uid, freelancerName: user.displayName || 'Anonymous' }));
    } catch (err) {
      console.error("Error accepting job:", err);
    } finally {
      setIsSubmitting(false);
    }
  };




  const handleApproveMilestone = async (milestoneId: string) => {
    if (!id || !user) return;
    try {
      const milestoneRef = doc(db, `jobs/${id}/milestones`, milestoneId);
      await updateDoc(milestoneRef, { status: 'approved' });
      
      // Check if all milestones are approved
      const allApproved = milestones.every(m => m.id === milestoneId ? true : m.status === 'approved');
      if (allApproved) {
        await updateDoc(doc(db, 'jobs', id), { status: 'completed' });
      }
    } catch (err) {
      console.error("Error approving milestone:", err);
    }
  };

  const handleAdminStatusUpdate = async (newStatus: string) => {
    if (!id) return;
    try {
      await updateDoc(doc(db, 'jobs', id), {
        status: newStatus
      });
      setProject((prev: any) => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error("Error updating status as admin:", err);
    }
  };

  const handleAcceptBid = async (bid: any) => {
    if (!id || !project) return;
    try {
      setIsSubmitting(true);
      const batch = writeBatch(db);
      
      // 1. Update the job status and assigned freelancer
      const jobRef = doc(db, 'jobs', id);
      batch.update(jobRef, {
        status: 'in-progress',
        freelancerId: bid.freelancerId,
        freelancerName: bid.freelancerName || 'Anonymous',
        freelancerPhotoURL: bid.freelancerPhotoURL || ''
      });

      // 2. Update all milestones to 'funded'
      milestones.forEach(m => {
        const milestoneRef = doc(db, `jobs/${id}/milestones`, m.id);
        batch.update(milestoneRef, { status: 'funded' });
      });

      // 3. Update the bid status
      const bidRef = doc(db, `jobs/${id}/bids`, bid.id);
      batch.update(bidRef, {
        status: 'accepted'
      });

      // 4. Reject other bids (optional but good for UX)
      bids.forEach(b => {
        if (b.id !== bid.id && b.status === 'pending') {
          const otherBidRef = doc(db, `jobs/${id}/bids`, b.id);
          batch.update(otherBidRef, { status: 'rejected' });
        }
      });

      await batch.commit();
      setProject((prev: any) => ({ 
        ...prev, 
        status: 'in-progress', 
        freelancerId: bid.freelancerId,
        freelancerName: bid.freelancerName || 'Anonymous'
      }));
    } catch (err) {
      console.error("Error accepting bid:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-on-surface-variant font-medium">Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-headline font-bold mb-4">Project Not Found</h2>
        <p className="text-on-surface-variant mb-8">The project you are looking for does not exist or has been removed.</p>
        <Link to="/marketplace" className="px-8 py-4 bg-primary text-surface rounded-xl font-bold">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const postedDate = project.createdAt?.toDate ? project.createdAt.toDate().toLocaleDateString() : 'Recently';

  return (
    <div className="max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link to="/marketplace" className="mb-6 sm:mb-8 flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group w-fit">
        <ArrowLeft size={16} />
        <span className="font-label text-xs uppercase tracking-widest">Back to Browse</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 border border-white/10 rounded-2xl overflow-hidden mb-12">
        <div className="lg:col-span-2 p-8 sm:p-12 space-y-8 border-b lg:border-b-0 lg:border-r border-white/10">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="font-mono text-[9px] uppercase tracking-widest px-2 py-1 bg-tertiary/10 text-tertiary border border-tertiary/20 rounded">Verified Client</span>
              <span className="font-mono text-[9px] uppercase tracking-widest px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded">Automated Escrow</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-black tracking-tight leading-[0.9] uppercase">
              {project.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-8 pt-4 border-t border-white/5">
            <div className="space-y-1">
              <p className="font-mono text-[10px] uppercase tracking-widest text-outline">Posted</p>
              <p className="text-sm font-bold">{postedDate}</p>
            </div>
            <div className="space-y-1">
              <p className="font-mono text-[10px] uppercase tracking-widest text-outline">Category</p>
              <p className="text-sm font-bold uppercase tracking-wider text-primary">{project.category}</p>
            </div>
            <div className="space-y-1">
              <p className="font-mono text-[10px] uppercase tracking-widest text-outline">Location</p>
              <p className="text-sm font-bold">Remote / Global</p>
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-12 bg-surface-container-low/30 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="space-y-1">
              <p className="font-mono text-[10px] uppercase tracking-widest text-outline">Project Budget</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black font-headline tracking-tighter">{project.budget.toLocaleString()}</span>
                <span className="text-primary font-mono font-bold text-xl">{project.currency}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-tertiary">
                <Lock size={14} />
                <span className="font-mono text-[9px] uppercase tracking-widest font-bold">Escrow Protected</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-tertiary w-full opacity-50"></div>
              </div>
            </div>
          </div>

          <div className="pt-8">
            {project.status === 'open' && user?.uid !== project.clientId && (
              <button 
                onClick={handleAcceptPlatform}
                className="w-full py-4 bg-primary text-surface font-mono text-[11px] font-black uppercase tracking-[0.2em] hover:brightness-110 active:scale-[0.98] transition-all shadow-2xl shadow-primary/20"
              >
                Accept Project
              </button>
            )}
            {project.status !== 'open' && (
              <div className="w-full py-4 border border-white/10 text-center font-mono text-[11px] font-bold uppercase tracking-widest text-outline">
                Status: {project.status}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-10 sm:space-y-12">
          <section className="space-y-6">
            <h2 className="text-2xl font-bold font-headline">Scope of Work</h2>
            <div className="text-on-surface-variant leading-relaxed space-y-4 text-lg">
              <p>{project.description || project.desc}</p>
              {!project.description && (
                <ul className="list-none space-y-3">
                  <li className="flex gap-3"><span className="text-primary">•</span> Development of secure storage strategies.</li>
                  <li className="flex gap-3"><span className="text-primary">•</span> Implementing admin controlled emergency shutdowns.</li>
                  <li className="flex gap-3"><span className="text-primary">•</span> Integration with external data providers.</li>
                  <li className="flex gap-3"><span className="text-primary">•</span> Full coverage unit testing (Standard Frameworks).</li>
                </ul>
              )}
            </div>
          </section>

          <section className="space-y-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-3xl font-headline font-black uppercase tracking-tight">Milestones</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-tertiary">Escrow Active</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {milestones.length > 0 ? milestones.map((m, i) => (
                <div key={i} className="group relative bg-surface-container-low/30 border border-white/10 rounded-xl p-6 transition-all hover:bg-surface-container-low/50">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-outline">0{i + 1}</span>
                        <h3 className="font-headline font-bold text-lg uppercase tracking-tight">{m.title}</h3>
                        <span className={cn(
                          "font-mono text-[8px] uppercase tracking-widest px-2 py-0.5 rounded border",
                          m.status === 'pending' ? "border-white/10 text-outline" :
                          m.status === 'funded' ? "border-primary/50 text-primary bg-primary/5" :
                          m.status === 'delivered' ? "border-tertiary/50 text-tertiary bg-tertiary/5" :
                          m.status === 'approved' ? "border-success/50 text-success bg-success/5" :
                          "border-error/50 text-error bg-error/5"
                        )}>
                          {m.status}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant leading-relaxed max-w-2xl">{m.description || 'No deliverables specified'}</p>
                    </div>
                    
                    <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-left md:text-right">
                        <p className="font-mono text-xl font-bold tracking-tighter">
                          {m.amount.toLocaleString()} <span className="text-[10px] text-primary">{project.currency}</span>
                        </p>
                        <p className="font-mono text-[9px] text-outline uppercase tracking-widest">
                          {m.percentage || Math.round((m.amount / project.budget) * 100)}% Allocation
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        {/* Freelancer: Deliver */}
                        {m.status === 'funded' && user?.uid === project.freelancerId && (
                          <Link 
                            to={`/submit-work/${id}/${m.id}`}
                            className="px-6 py-2 bg-tertiary text-surface font-mono text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all"
                          >
                            Deliver
                          </Link>
                        )}
                        
                        {/* Client: Approve */}
                        {m.status === 'delivered' && user?.uid === project.clientId && (
                          <button 
                            onClick={() => handleApproveMilestone(m.id)}
                            className="px-6 py-2 bg-primary text-surface font-mono text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl">
                  <p className="font-mono text-xs text-outline uppercase tracking-widest">No milestones defined</p>
                </div>
              )}
            </div>
          </section>

          {project.status === 'open' && (
            <GlassCard className="p-6 sm:p-8 rounded-2xl space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold font-headline">Apply for this Project</h2>
                <div className="flex gap-1 text-primary">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill={i <= (client?.reputation || 0) ? "currentColor" : "none"} className={i <= (client?.reputation || 0) ? "" : "text-on-surface-variant"} />)}
                </div>
              </div>
              
              {bidSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-tertiary/10 border border-tertiary/20 p-6 rounded-xl text-center space-y-3"
                >
                  <div className="w-12 h-12 bg-tertiary/20 rounded-full flex items-center justify-center mx-auto text-tertiary">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="font-bold">Application Submitted!</h3>
                  <p className="text-sm text-on-surface-variant">Your proposal has been sent to the client. You'll be notified if they accept your bid.</p>
                  <button 
                    onClick={() => setBidSuccess(false)}
                    className="text-primary text-xs font-bold uppercase tracking-widest hover:underline"
                  >
                    Submit another proposal
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {error && (
                    <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-xs font-bold mb-4">
                      {error}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold">Bid Amount ({project.currency})</label>
                      <input 
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary/30 text-sm placeholder:text-on-surface-variant/50"
                        placeholder="Enter your bid..."
                      />
                    </div>
                  </div>
                  <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold">Your Proposal & Approach</label>
                  <textarea 
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                    className="w-full bg-surface-container-highest border-none rounded-xl p-6 focus:ring-1 focus:ring-primary/30 text-sm placeholder:text-on-surface-variant/50 min-h-[160px]" 
                    placeholder="Describe your technical architecture approach and relevant experience..."
                  />
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={handleApply}
                      disabled={isSubmitting || !user || !proposal.trim()}
                      className="flex-1 bg-linear-to-r from-primary to-primary-container text-surface font-label font-bold uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-primary/10 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Submit Application'}
                    </button>
                    <button className="p-4 bg-surface-container-highest rounded-xl text-on-surface-variant hover:text-white transition-colors">
                      <Bookmark size={20} />
                    </button>
                  </div>
                  {!user && <p className="text-[10px] text-error text-center font-bold uppercase tracking-wider">Please sign in to apply</p>}
                </div>
              )}
            </GlassCard>
          )}
        </div>

        <div className="space-y-8">
          <GlassCard className="p-6 sm:p-8 rounded-2xl border border-white/5 space-y-6 sticky top-28">
            <h3 className="font-headline font-bold text-xl">Client Reputation</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container">
                <img src={client?.photoURL || project.clientPhotoURL || `https://picsum.photos/seed/${project.client}/200/200`} alt="" loading="lazy" referrerPolicy="no-referrer" />
              </div>
              <div>
                <p className="font-bold font-headline">{client?.displayName || project.client}</p>
                <p className="text-xs text-on-surface-variant font-label">Member since {client?.createdAt?.toDate ? client.createdAt.toDate().getFullYear() : '2024'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container p-4 rounded-xl text-center">
                <p className="text-[10px] text-on-surface-variant font-label uppercase tracking-widest mb-1">Spent</p>
                <p className="font-bold font-headline text-lg">${(client?.completedProjects || 0) * 1200}+</p>
              </div>
              <div className="bg-surface-container p-4 rounded-xl text-center">
                <p className="text-[10px] text-on-surface-variant font-label uppercase tracking-widest mb-1">Hires</p>
                <p className="font-bold font-headline text-lg">{client?.completedProjects || 0} Total</p>
              </div>
            </div>
            <div className="space-y-4 pt-4">
              <h4 className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Recent Activity</h4>
              {[
                { text: '"Top tier client, clear specs."', author: 'dev_freelancer' },
                { text: '"Prompt payments via escrow."', author: 'backend_master' },
              ].map((review, i) => (
                <div key={i} className="text-sm space-y-1">
                  <p className="font-medium">{review.text}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-on-surface-variant">{review.author}</p>
                    <div className="flex text-tertiary">
                      {[1, 2, 3, 4, 5].map(i => <Star key={i} size={8} fill="currentColor" />)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full text-center py-3 text-[10px] font-label uppercase tracking-widest text-primary border border-primary/20 rounded-xl hover:bg-primary/5 transition-colors">
              View All Client Projects
            </button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
