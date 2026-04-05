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
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { cn } from '@/src/utils';
import { doc, getDoc, collection, onSnapshot, query, addDoc, serverTimestamp, updateDoc, orderBy, writeBatch, increment, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useFirebase } from '../components/FirebaseProvider';
import { handleFirestoreError, OperationType } from '../utils/firebaseErrors';
import { Web3ErrorDisplay } from '../utils/web3Errors';
import { acceptJob as acceptContractJob, approveWork as approveContractWork, refund as refundContract } from '../services/contractService';
import { recordTransaction, TransactionType, TransactionStatus } from '../services/transactionService';

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
  const [isComparing, setIsComparing] = useState(false);
  const [selectedBids, setSelectedBids] = useState<string[]>([]);
  const [freelancerData, setFreelancerData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!id) return;

    const projectRef = doc(db, 'jobs', id);
    const unsubscribeProject = onSnapshot(projectRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProject({ ...data, id: docSnap.id });

        // Fetch client info (only once or if clientId changes)
        if (!client || client.uid !== data.clientId) {
          const clientRef = doc(db, 'users', data.clientId);
          const clientSnap = await getDoc(clientRef);
          if (clientSnap.exists()) {
            setClient(clientSnap.data());
          }
        }
      } else {
        console.error("No such project!");
        navigate('/marketplace');
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching project:", error);
      setLoading(false);
    });

    return () => unsubscribeProject();
  }, [id, navigate]);

  useEffect(() => {
    if (!id || !user || !project) return;

    // Real-time milestones
    const milestonesQuery = query(collection(db, `jobs/${id}/milestones`));
    const unsubscribeMilestones = onSnapshot(milestonesQuery, (snapshot) => {
      const milestonesData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setMilestones(milestonesData);
    });

    // Real-time bids: Client/Admin see all, Freelancers see only their own
    if (!user) return;

    let bidsQuery;
    if (user.uid === project.clientId || isAdmin) {
      bidsQuery = query(collection(db, `jobs/${id}/bids`), orderBy('createdAt', 'desc'));
    } else {
      bidsQuery = query(collection(db, `jobs/${id}/bids`), where('freelancerId', '==', user.uid));
    }

    const unsubscribeBids = onSnapshot(bidsQuery, (snapshot) => {
      const bidsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setBids(bidsData);

      // Fetch freelancer data for comparison
      if (user?.uid === project.clientId || isAdmin) {
        bidsData.forEach(async (bid) => {
          if (!freelancerData[bid.freelancerId]) {
            const freelancerRef = doc(db, 'users', bid.freelancerId);
            const freelancerSnap = await getDoc(freelancerRef);
            if (freelancerSnap.exists()) {
              setFreelancerData(prev => ({
                ...prev,
                [bid.freelancerId]: freelancerSnap.data()
              }));
            }
          }
        });
      }
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
    if (!id || !user || !project.contractJobId) return;
    try {
      setIsSubmitting(true);
      
      // 1. Call Smart Contract
      await acceptContractJob(project.contractJobId);

      // 2. Update Firestore
      try {
        const batch = writeBatch(db);
        
        // Update job status and assigned freelancer
        const jobRef = doc(db, 'jobs', id);
        batch.update(jobRef, {
          status: 'in-progress',
          freelancerId: user.uid,
          freelancerName: user.displayName || 'Anonymous'
        });

        // Update all milestones to 'funded'
        milestones.forEach(m => {
          const milestoneRef = doc(db, `jobs/${id}/milestones`, m.id);
          batch.update(milestoneRef, { status: 'funded' });
        });

        await batch.commit();
      } catch (dbErr) {
        handleFirestoreError(dbErr, OperationType.WRITE, `jobs/${id}`);
      }
      setProject((prev: any) => ({ ...prev, status: 'in-progress', freelancerId: user.uid, freelancerName: user.displayName || 'Anonymous' }));
    } catch (err: any) {
      console.error("Error accepting job:", err);
      // If it's a blockchain error, pass the whole object to Web3ErrorDisplay
      if (err.code || err.data || err.message?.includes('user rejected') || err.message?.includes('insufficient funds')) {
        setError(err);
      } else {
        setError(err.message || 'Failed to accept job. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };




  const handleApproveMilestone = async (milestoneId: string) => {
    if (!id || !user || !project.contractJobId) return;
    try {
      // 1. Call Smart Contract
      // NOTE: In our current simple contract, approveWork releases ALL funds.
      // In a real app with milestones, the contract would handle individual releases.
      // For this demo, we'll call approveWork on the contract.
      await approveContractWork(project.contractJobId);

      // 2. Update Firestore
      try {
        const milestoneRef = doc(db, `jobs/${id}/milestones`, milestoneId);
        await updateDoc(milestoneRef, { status: 'approved' });
        
        // Check if all milestones are approved
        const allApproved = milestones.every(m => m.id === milestoneId ? true : m.status === 'approved');
        if (allApproved) {
          await updateDoc(doc(db, 'jobs', id), { status: 'completed' });
        }

        // 3. Record Transaction in Firestore
        const milestone = milestones.find(m => m.id === milestoneId);
        await recordTransaction({
          jobId: id,
          milestoneId: milestoneId,
          fromId: 'escrow',
          toId: project.freelancerId,
          amount: milestone?.amount || 0,
          currency: project.currency || 'USDC',
          status: TransactionStatus.COMPLETED,
          type: TransactionType.PAYOUT
        });
      } catch (dbErr) {
        handleFirestoreError(dbErr, OperationType.UPDATE, `jobs/${id}`);
      }
    } catch (err: any) {
      console.error("Error approving milestone:", err);
      // If it's a blockchain error, pass the whole object to Web3ErrorDisplay
      if (err.code || err.data || err.message?.includes('user rejected') || err.message?.includes('insufficient funds')) {
        setError(err);
      } else {
        setError(err.message || 'Failed to approve milestone. Please try again.');
      }
    }
  };

  const handleRefund = async () => {
    if (!id || !user || !project.contractJobId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await refundContract(project.contractJobId);
      // Firestore will be updated by the BlockchainListener
    } catch (err: any) {
      console.error('Error refunding project:', err);
      // If it's a blockchain error, pass the whole object to Web3ErrorDisplay
      if (err.code || err.data || err.message?.includes('user rejected') || err.message?.includes('insufficient funds')) {
        setError(err);
      } else {
        setError(err.message || 'Failed to refund project.');
      }
    } finally {
      setIsSubmitting(false);
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

  const toggleBidSelection = (bidId: string) => {
    setSelectedBids(prev => 
      prev.includes(bidId) 
        ? prev.filter(id => id !== bidId) 
        : prev.length < 3 ? [...prev, bidId] : prev
    );
  };

  const comparisonBids = bids.filter(b => selectedBids.includes(b.id));

  return (
    <div className="max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link to="/marketplace" className="mb-6 sm:mb-8 flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group w-fit">
        <ArrowLeft size={16} />
        <span className="font-label text-xs uppercase tracking-widest">Back to Browse</span>
      </Link>

      {error && (
        <div className="mb-8">
          {typeof error === 'string' ? (
            <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm font-medium flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          ) : (
            <Web3ErrorDisplay error={error} />
          )}
        </div>
      )}

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
            {project.status === 'open' && user?.uid === project.clientId && (
              <button 
                onClick={handleRefund}
                disabled={isSubmitting}
                className="w-full py-4 bg-error/10 text-error border border-error/20 font-mono text-[11px] font-black uppercase tracking-[0.2em] hover:bg-error/20 active:scale-[0.98] transition-all"
              >
                {isSubmitting ? 'Processing...' : 'Refund & Cancel'}
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

          {user?.uid === project.clientId && bids.length > 0 && (
            <section className="space-y-8 pt-12 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-3xl font-headline font-black uppercase tracking-tight">Proposals ({bids.length})</h2>
                  <p className="text-xs text-on-surface-variant font-medium">Review and compare freelancer bids for this project.</p>
                </div>
                {bids.length >= 2 && (
                  <button 
                    onClick={() => {
                      setIsComparing(!isComparing);
                      if (isComparing) setSelectedBids([]);
                    }}
                    className={cn(
                      "px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                      isComparing 
                        ? "bg-error/10 text-error border border-error/20" 
                        : "bg-primary text-surface shadow-lg shadow-primary/20"
                    )}
                  >
                    {isComparing ? (
                      <>
                        <X size={14} />
                        Cancel Comparison
                      </>
                    ) : (
                      <>
                        <Star size={14} />
                        Compare Bids
                      </>
                    )}
                  </button>
                )}
              </div>

              {isComparing && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <Star size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Select up to 3 bids to compare</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
                        {selectedBids.length} of 3 selected
                      </p>
                    </div>
                  </div>
                  {selectedBids.length >= 2 && (
                    <button 
                      onClick={() => {
                        const element = document.getElementById('comparison-view');
                        element?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-6 py-2 bg-primary text-surface rounded-xl text-xs font-bold animate-pulse"
                    >
                      View Comparison
                    </button>
                  )}
                </motion.div>
              )}

              <div className="space-y-4">
                {bids.map((bid) => (
                  <div 
                    key={bid.id} 
                    className={cn(
                      "group relative bg-surface-container-low/30 border rounded-2xl p-6 transition-all hover:bg-surface-container-low/50",
                      selectedBids.includes(bid.id) ? "border-primary ring-1 ring-primary/30" : "border-white/10"
                    )}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                      <div className="flex gap-4 flex-1">
                        {isComparing && (
                          <div className="pt-1">
                            <button 
                              onClick={() => toggleBidSelection(bid.id)}
                              className={cn(
                                "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                selectedBids.includes(bid.id) 
                                  ? "bg-primary border-primary text-surface" 
                                  : "border-white/20 hover:border-primary/50"
                              )}
                            >
                              {selectedBids.includes(bid.id) && <CheckCircle2 size={14} />}
                            </button>
                          </div>
                        )}
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-container shrink-0">
                          <img src={bid.freelancerPhotoURL || `https://picsum.photos/seed/${bid.freelancerId}/200/200`} alt="" loading="lazy" referrerPolicy="no-referrer" />
                        </div>
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-headline font-bold text-lg">{bid.freelancerName}</h3>
                            <div className="flex items-center gap-1 text-warning">
                              <Star size={12} fill="currentColor" />
                              <span className="text-xs font-bold">{freelancerData[bid.freelancerId]?.rating || '5.0'}</span>
                            </div>
                            <span className={cn(
                              "font-mono text-[8px] uppercase tracking-widest px-2 py-0.5 rounded border",
                              bid.status === 'pending' ? "border-white/10 text-outline" :
                              bid.status === 'accepted' ? "border-success/50 text-success bg-success/5" :
                              "border-error/50 text-error bg-error/5"
                            )}>
                              {bid.status}
                            </span>
                          </div>
                          <p className="text-sm text-on-surface-variant line-clamp-2 leading-relaxed">
                            {bid.proposal}
                          </p>
                          <div className="flex items-center gap-4 pt-2">
                            <div className="flex items-center gap-1 text-on-surface-variant">
                              <CheckCircle2 size={12} className="text-success" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">
                                {freelancerData[bid.freelancerId]?.completedProjects || 0} Jobs Done
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-on-surface-variant">
                              <Calendar size={12} />
                              <span className="text-[10px] font-bold uppercase tracking-widest">
                                {bid.createdAt?.toDate ? bid.createdAt.toDate().toLocaleDateString() : 'Recently'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-4 w-full md:w-auto">
                        <div className="text-right">
                          <p className="font-mono text-2xl font-black tracking-tighter">
                            {bid.amount.toLocaleString()} <span className="text-[10px] text-primary">{project.currency}</span>
                          </p>
                          <p className="text-[10px] text-outline font-bold uppercase tracking-widest">Total Bid</p>
                        </div>
                        {project.status === 'open' && (
                          <button 
                            onClick={() => handleAcceptBid(bid)}
                            disabled={isSubmitting}
                            className="w-full md:w-auto px-8 py-3 bg-primary text-surface font-mono text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
                          >
                            {isSubmitting ? 'Processing...' : 'Accept Bid'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comparison View */}
              {selectedBids.length >= 2 && (
                <div id="comparison-view" className="pt-12 space-y-8">
                  <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                      <Star size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-headline font-black uppercase tracking-tight">Side-by-Side Comparison</h3>
                      <p className="text-xs text-on-surface-variant">Comparing {comparisonBids.length} selected proposals.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {comparisonBids.map((bid) => {
                      const freelancer = freelancerData[bid.freelancerId];
                      return (
                        <GlassCard key={bid.id} className="p-6 rounded-2xl border-white/10 space-y-6 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl" />
                          
                          <div className="flex flex-col items-center text-center space-y-3">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-surface-container ring-4 ring-white/5">
                              <img src={bid.freelancerPhotoURL || `https://picsum.photos/seed/${bid.freelancerId}/200/200`} alt="" />
                            </div>
                            <div>
                              <h4 className="font-headline font-bold text-lg">{bid.freelancerName}</h4>
                              <p className="text-[10px] text-primary font-bold uppercase tracking-widest">
                                {freelancer?.title || 'Freelancer'}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-6 pt-4 border-t border-white/5">
                            <div className="space-y-1">
                              <p className="text-[9px] text-outline font-bold uppercase tracking-widest">Bid Amount</p>
                              <p className="text-2xl font-black font-headline tracking-tighter">
                                {bid.amount.toLocaleString()} <span className="text-xs text-primary">{project.currency}</span>
                              </p>
                            </div>

                            <div className="space-y-1">
                              <p className="text-[9px] text-outline font-bold uppercase tracking-widest">Reputation</p>
                              <div className="flex items-center gap-2">
                                <div className="flex text-warning">
                                  {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} size={12} fill={i <= Math.round(parseFloat(freelancer?.rating || '5')) ? "currentColor" : "none"} />
                                  ))}
                                </div>
                                <span className="text-xs font-bold">{freelancer?.rating || '5.0'}</span>
                              </div>
                              <p className="text-[10px] text-on-surface-variant font-medium">
                                {freelancer?.completedProjects || 0} projects completed
                              </p>
                            </div>

                            <div className="space-y-1">
                              <p className="text-[9px] text-outline font-bold uppercase tracking-widest">Proposal Depth</p>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-secondary" 
                                    style={{ width: `${Math.min(100, bid.proposal.length / 5)}%` }}
                                  />
                                </div>
                                <span className="text-[10px] font-mono font-bold">{bid.proposal.split(' ').length} words</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="text-[9px] text-outline font-bold uppercase tracking-widest">Key Proposal Excerpt</p>
                              <p className="text-xs text-on-surface-variant italic leading-relaxed line-clamp-4">
                                "{bid.proposal}"
                              </p>
                            </div>
                          </div>

                          <button 
                            onClick={() => handleAcceptBid(bid)}
                            disabled={isSubmitting}
                            className="w-full py-3 bg-primary text-surface rounded-xl font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all"
                          >
                            Hire {bid.freelancerName.split(' ')[0]}
                          </button>
                        </GlassCard>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          )}

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
                    <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-xs font-bold mb-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={14} />
                        <span>{error}</span>
                      </div>
                      {error.includes('Insufficient funds') && (
                        <div className="ml-6 flex flex-wrap gap-2">
                          <a 
                            href="https://sepolia-faucet.pk910.de/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-bold flex items-center gap-1"
                          >
                            Faucet <ExternalLink size={10} />
                          </a>
                        </div>
                      )}
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
