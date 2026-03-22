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
import { acceptJobOnChain, submitWorkOnChain, approveWorkOnChain, getJobFromChain } from '../services/contractService';
import { ethers } from 'ethers';

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
  const [onChainJob, setOnChainJob] = useState<any>(null);
  const [contractLoading, setContractLoading] = useState(false);
  const [contractError, setContractError] = useState<string | null>(null);
  const [bids, setBids] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;

    const staticJobs = [
      { id: 's1', title: 'Smart Contract Audit', client: 'Aether Protocol', budget: '4.50', currency: 'ETH', category: 'Security Audit', tags: ['Solidity', 'Security', 'EVM'], status: 'Locked Escrow', desc: 'Comprehensive security audit for a new yield optimization protocol on Base.' },
      { id: 's2', title: 'dApp Frontend Architect', client: 'Nexus DAO', budget: '12,500', currency: 'USDC', category: 'Frontend', tags: ['React', 'Tailwind', 'Wagmi'], status: 'Locked Escrow', desc: 'Build a minimal, high-performance dashboard for a ZK-based identity protocol.' },
      { id: 's3', title: 'ZK-Rollup Researcher', client: 'Stark Labs', budget: '8.00', currency: 'ETH', category: 'ZK-Proofs', tags: ['Cryptography', 'Rust', 'L2'], status: 'Negotiable', desc: 'Research and optimize ZK-Rollup proof generation times.' },
    ];

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
          // Check static jobs fallback
          const staticJob = staticJobs.find(j => j.id === id) || (id === '1' ? staticJobs[0] : null);
          if (staticJob) {
            setProject(staticJob);
            setMilestones([
              { title: 'Initial Architecture Design', description: 'Detailed spec and flowcharts', amount: 30, status: 'pending' },
              { title: 'Core Implementation', description: 'Main logic and unit tests', amount: 50, status: 'pending' },
              { title: 'Final Review & Handover', description: 'Documentation and deployment', amount: 20, status: 'pending' }
            ]);
          } else {
            console.error("No such project!");
          }
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

    // Fetch on-chain data if applicable
    const fetchOnChainData = async () => {
      if (project?.isOnChain && project?.onChainJobId !== undefined) {
        try {
          setContractLoading(true);
          const chainJob = await getJobFromChain(project.onChainJobId);
          setOnChainJob(chainJob);
        } catch (err) {
          console.error("Error fetching on-chain job:", err);
        } finally {
          setContractLoading(false);
        }
      }
    };

    if (project?.isOnChain) {
      fetchOnChainData();
    }

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
    
    // Prevent bidding on static jobs (which don't exist in Firestore)
    if (id.startsWith('s') || id === '1') {
      console.error("Cannot bid on demo projects.");
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
        amount: Number(project.budget),
        proposal,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      /*
      const jobRef = doc(db, 'jobs', id);
      batch.update(jobRef, {
        bidCount: increment(1)
      });
      */

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

  const handleAcceptOnChain = async () => {
    if (!project?.onChainJobId) return;
    setContractLoading(true);
    setContractError(null);
    try {
      await acceptJobOnChain(project.onChainJobId);
      // Update Firestore status
      await updateDoc(doc(db, 'jobs', id!), {
        status: 'in-progress',
        freelancerId: user?.uid
      });
      // Refresh on-chain data
      const chainJob = await getJobFromChain(project.onChainJobId);
      setOnChainJob(chainJob);
    } catch (err: any) {
      setContractError(err.message || "Failed to accept job on-chain");
    } finally {
      setContractLoading(false);
    }
  };

  const handleSubmitWorkOnChain = async () => {
    if (!project?.onChainJobId) return;
    const workLink = prompt("Enter your work link (e.g. GitHub repo or hosted site):");
    if (!workLink) return;

    setContractLoading(true);
    setContractError(null);
    try {
      await submitWorkOnChain(project.onChainJobId, workLink);
      // Update Firestore
      await updateDoc(doc(db, 'jobs', id!), {
        status: 'submitted',
        workLink
      });
      // Refresh on-chain data
      const chainJob = await getJobFromChain(project.onChainJobId);
      setOnChainJob(chainJob);
    } catch (err: any) {
      setContractError(err.message || "Failed to submit work on-chain");
    } finally {
      setContractLoading(false);
    }
  };

  const handleApproveOnChain = async () => {
    if (!project?.onChainJobId) return;
    setContractLoading(true);
    setContractError(null);
    try {
      await approveWorkOnChain(project.onChainJobId);
      // Update Firestore
      await updateDoc(doc(db, 'jobs', id!), {
        status: 'completed'
      });
      // Refresh on-chain data
      const chainJob = await getJobFromChain(project.onChainJobId);
      setOnChainJob(chainJob);
    } catch (err: any) {
      setContractError(err.message || "Failed to approve work on-chain");
    } finally {
      setContractLoading(false);
    }
  };

  const handleAcceptPlatform = async () => {
    if (!id) return;
    setContractLoading(true);
    try {
      await updateDoc(doc(db, 'jobs', id), {
        status: 'in-progress',
        freelancerId: user?.uid,
        freelancerName: user?.displayName || 'Anonymous'
      });
      setProject((prev: any) => ({ ...prev, status: 'in-progress', freelancerId: user?.uid }));
    } catch (err) {
      console.error("Error accepting job:", err);
    } finally {
      setContractLoading(false);
    }
  };

  const handleSubmitWorkPlatform = async () => {
    if (!id) return;
    const workLink = prompt("Enter your work link (e.g. GitHub repo or hosted site):");
    if (!workLink) return;
    setContractLoading(true);
    try {
      await updateDoc(doc(db, 'jobs', id), {
        status: 'submitted',
        workLink
      });
      setProject((prev: any) => ({ ...prev, status: 'submitted', workLink }));
    } catch (err) {
      console.error("Error submitting work:", err);
    } finally {
      setContractLoading(false);
    }
  };

  const handleApprovePlatform = async () => {
    if (!id) return;
    setContractLoading(true);
    try {
      await updateDoc(doc(db, 'jobs', id), {
        status: 'completed'
      });
      setProject((prev: any) => ({ ...prev, status: 'completed' }));
    } catch (err) {
      console.error("Error approving work:", err);
    } finally {
      setContractLoading(false);
    }
  };

  const handleAdminStatusUpdate = async (newStatus: string) => {
    if (!id) return;
    setContractLoading(true);
    try {
      await updateDoc(doc(db, 'jobs', id), {
        status: newStatus
      });
      setProject((prev: any) => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error("Error updating status as admin:", err);
    } finally {
      setContractLoading(false);
    }
  };

  const handleAcceptBid = async (bid: any) => {
    if (!id || !project) return;
    setContractLoading(true);
    try {
      const batch = writeBatch(db);
      
      // 1. Update the job status and assigned freelancer
      const jobRef = doc(db, 'jobs', id);
      batch.update(jobRef, {
        status: 'in-progress',
        freelancerId: bid.freelancerId,
        freelancerName: bid.freelancerName
      });

      // 2. Update the bid status
      const bidRef = doc(db, `jobs/${id}/bids`, bid.id);
      batch.update(bidRef, {
        status: 'accepted'
      });

      // 3. Reject other bids (optional but good for UX)
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
        freelancerName: bid.freelancerName 
      }));
    } catch (err) {
      console.error("Error accepting bid:", err);
    } finally {
      setContractLoading(false);
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-10 sm:mb-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-wrap gap-3">
            <span className="bg-tertiary/10 text-tertiary px-3 py-1 rounded-full text-[10px] font-label font-bold uppercase tracking-tighter border border-tertiary/20">Verified Protocol</span>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-label font-bold uppercase tracking-tighter border border-primary/20">Smart Contract Escrow</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight leading-tight">
            {project.title}
          </h1>
          {project.isOnChain ? (
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Lock size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold">On-Chain Escrow Active</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Status: {
                    onChainJob ? [
                      'Open', 'In Progress', 'Submitted', 'Completed', 'Disputed'
                    ][onChainJob.status] : 'Loading...'
                  }</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                {/* Accept Job Button (Freelancer) */}
                {onChainJob?.status === 0 && user?.uid !== project.clientId && (
                  <button 
                    onClick={handleAcceptOnChain}
                    disabled={contractLoading}
                    className="px-4 py-2 bg-primary text-surface rounded-lg text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
                  >
                    {contractLoading ? 'Processing...' : 'Accept Job On-Chain'}
                  </button>
                )}

                {/* Submit Work Button (Freelancer) */}
                {onChainJob?.status === 1 && user?.uid === onChainJob.freelancer.toLowerCase() && (
                  <button 
                    onClick={handleSubmitWorkOnChain}
                    disabled={contractLoading}
                    className="px-4 py-2 bg-tertiary text-surface rounded-lg text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
                  >
                    {contractLoading ? 'Processing...' : 'Submit Work On-Chain'}
                  </button>
                )}

                {/* Approve Work Button (Client) */}
                {onChainJob?.status === 2 && user?.uid === project.clientId && (
                  <button 
                    onClick={handleApproveOnChain}
                    disabled={contractLoading}
                    className="px-4 py-2 bg-primary text-surface rounded-lg text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
                  >
                    {contractLoading ? 'Processing...' : 'Approve & Release Funds'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-surface-container-highest/30 border border-white/5 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-outline">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold">Platform Escrow Managed</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Status: {project.status}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                {/* Accept Job Button (Freelancer) */}
                {project.status === 'open' && user?.uid !== project.clientId && (
                  <button 
                    onClick={handleAcceptPlatform}
                    disabled={contractLoading}
                    className="px-4 py-2 bg-primary text-surface rounded-lg text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
                  >
                    {contractLoading ? 'Processing...' : 'Accept Project'}
                  </button>
                )}

                {/* Submit Work Button (Freelancer) */}
                {project.status === 'in-progress' && user?.uid === project.freelancerId && (
                  <button 
                    onClick={handleSubmitWorkPlatform}
                    disabled={contractLoading}
                    className="px-4 py-2 bg-tertiary text-surface rounded-lg text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
                  >
                    {contractLoading ? 'Processing...' : 'Submit Work'}
                  </button>
                )}

                {/* Approve Work Button (Client) */}
                {project.status === 'submitted' && user?.uid === project.clientId && (
                  <button 
                    onClick={handleApprovePlatform}
                    disabled={contractLoading}
                    className="px-4 py-2 bg-primary text-surface rounded-lg text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
                  >
                    {contractLoading ? 'Processing...' : 'Approve & Release'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Admin Controls */}
          {isAdmin && (
            <div className="p-4 bg-error/5 border border-error/20 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-error">
                <ShieldCheck size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Admin Control Panel</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {['open', 'in-progress', 'submitted', 'completed', 'disputed'].map(s => (
                  <button 
                    key={s}
                    onClick={() => handleAdminStatusUpdate(s)}
                    disabled={contractLoading}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all",
                      project.status === s ? "bg-error text-white" : "bg-error/10 text-error hover:bg-error/20"
                    )}
                  >
                    Set {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bids Section for Client */}
          {user?.uid === project.clientId && project.status === 'open' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold font-headline">Received Proposals ({bids.length})</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {bids.length > 0 ? bids.map((bid) => (
                  <GlassCard key={bid.id} className="p-6 border border-white/5 hover:border-primary/20 transition-all">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-outline">
                            <User size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-base">{bid.freelancerName}</p>
                            <p className="text-[10px] text-outline font-label uppercase tracking-widest">Freelancer ID: {bid.freelancerId.slice(0, 8)}...</p>
                          </div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl">
                          <p className="text-sm text-on-surface-variant leading-relaxed italic">"{bid.proposal}"</p>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-label uppercase tracking-widest text-outline">
                          <span>Applied: {bid.createdAt?.toDate ? bid.createdAt.toDate().toLocaleDateString() : 'Recently'}</span>
                          <span className="text-primary font-bold">Bid: {bid.amount} {project.currency}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-row md:flex-col gap-2 justify-end">
                        <button 
                          onClick={() => handleAcceptBid(bid)}
                          disabled={contractLoading}
                          className="px-6 py-3 bg-primary text-surface rounded-xl font-bold text-[10px] uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
                        >
                          {contractLoading ? 'Processing...' : 'Accept Proposal'}
                        </button>
                        <button className="px-6 py-3 bg-white/5 text-outline rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">
                          View Profile
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                )) : (
                  <div className="p-12 text-center bg-surface-container-low/30 rounded-2xl border border-dashed border-white/10">
                    <p className="text-on-surface-variant italic">No proposals received yet. Your project is live on the marketplace.</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {contractError && (
            <p className="text-[10px] text-error font-bold uppercase tracking-wider bg-error/10 p-2 rounded-lg">{contractError}</p>
          )}
            <div className="flex flex-wrap items-center gap-6 text-on-surface-variant text-sm">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-primary" />
                <span>Posted {postedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-primary" />
                <span>Client Rating: {client?.reputation || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-primary" />
                <span>Remote / Global</span>
              </div>
            </div>
        </div>

        <GlassCard className="p-6 sm:p-8 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div>
            <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-2">Project Budget</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold font-headline">{project.budget}</span>
              <span className="text-primary font-label font-bold text-xl uppercase">{project.currency}</span>
            </div>
            <p className="text-on-surface-variant font-label text-sm mt-1">≈ $32,450.00 USDC</p>
          </div>
          <div className="mt-6 pt-6 border-t border-white/5">
            <div className="flex items-center gap-2 text-tertiary">
              <Lock size={16} fill="currentColor" />
              <span className="text-xs font-label uppercase font-bold tracking-widest">Escrow Protected</span>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-10 sm:space-y-12">
          <section className="space-y-6">
            <h2 className="text-2xl font-bold font-headline">Scope of Work</h2>
            <div className="text-on-surface-variant leading-relaxed space-y-4 text-lg">
              <p>{project.desc}</p>
              <ul className="list-none space-y-3">
                <li className="flex gap-3"><span className="text-primary">•</span> Development of vault strategies for LSTs.</li>
                <li className="flex gap-3"><span className="text-primary">•</span> Implementing multi-sig controlled emergency shutdowns.</li>
                <li className="flex gap-3"><span className="text-primary">•</span> Integration with Chainlink Data Feeds and CCIP.</li>
                <li className="flex gap-3"><span className="text-primary">•</span> Full coverage unit testing (Hardhat/Foundry).</li>
              </ul>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold font-headline">Milestone Breakdown</h2>
            <div className="space-y-4">
              {milestones.length > 0 ? milestones.map((m, i) => (
                <GlassCard key={i} className={cn(
                  "p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-l-4",
                  m.status === 'funded' || m.status === 'delivered' ? "border-primary" : "border-outline-variant"
                )}>
                  <div>
                    <p className={cn("font-headline font-bold", m.status === 'pending' && "text-on-surface/60")}>{m.title}</p>
                    <p className="text-xs text-on-surface-variant font-label mt-1">{m.description || 'No deliverables specified'}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className={cn("font-headline font-bold", m.status === 'pending' && "text-on-surface/60")}>{m.amount}%</p>
                    <p className={cn("text-[10px] font-label uppercase font-bold", m.status === 'funded' ? "text-tertiary" : "text-on-surface-variant")}>{m.status}</p>
                  </div>
                </GlassCard>
              )) : (
                <p className="text-on-surface-variant italic text-sm">No milestones defined for this project.</p>
              )}
            </div>
          </section>

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
        </div>

        <div className="space-y-8">
          <GlassCard className="p-6 sm:p-8 rounded-2xl border border-white/5 space-y-6 sticky top-28">
            <h3 className="font-headline font-bold text-xl">Client Reputation</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container">
                <img src={client?.photoURL || `https://picsum.photos/seed/${project.client}/200/200`} alt="" loading="lazy" referrerPolicy="no-referrer" />
              </div>
              <div>
                <p className="font-bold font-headline">{client?.displayName || project.client}</p>
                <p className="text-xs text-on-surface-variant font-label">Member since {client?.createdAt?.toDate ? client.createdAt.toDate().getFullYear() : '2024'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container p-4 rounded-xl text-center">
                <p className="text-[10px] text-on-surface-variant font-label uppercase tracking-widest mb-1">Spent</p>
                <p className="font-bold font-headline text-lg">{(client?.completedProjects || 0) * 12}+ ETH</p>
              </div>
              <div className="bg-surface-container p-4 rounded-xl text-center">
                <p className="text-[10px] text-on-surface-variant font-label uppercase tracking-widest mb-1">Hires</p>
                <p className="font-bold font-headline text-lg">{client?.completedProjects || 0} Total</p>
              </div>
            </div>
            <div className="space-y-4 pt-4">
              <h4 className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Recent Activity</h4>
              {[
                { text: '"Top tier client, clear specs."', author: 'dev_architect.eth' },
                { text: '"Prompt payments via escrow."', author: 'solidity_master' },
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
