import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Upload, 
  Lock, 
  ShieldCheck, 
  Download,
  CheckCircle,
  FileText,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { cn } from '@/src/utils';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientText } from '../components/ui/GradientText';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useFirebase } from '../components/FirebaseProvider';

export const SubmitWork = () => {
  const { jobId, milestoneId } = useParams();
  const navigate = useNavigate();
  const { user } = useFirebase();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [milestone, setMilestone] = useState<any>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!jobId || !milestoneId) {
        setLoading(false);
        return;
      }

      try {
        const jobSnap = await getDoc(doc(db, 'jobs', jobId));
        if (jobSnap.exists()) {
          setProject(jobSnap.data());
        }

        const milestoneSnap = await getDoc(doc(db, `jobs/${jobId}/milestones`, milestoneId));
        if (milestoneSnap.exists()) {
          setMilestone(milestoneSnap.data());
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId, milestoneId]);

  const handleSubmit = async () => {
    if (!jobId || !milestoneId || !user) return;
    
    setIsSubmitting(true);
    try {
      // 1. Update milestone status
      await updateDoc(doc(db, `jobs/${jobId}/milestones`, milestoneId), {
        status: 'delivered',
        submissionNotes: notes,
        submittedAt: serverTimestamp()
      });

      // 2. Update job status to 'submitted'
      await updateDoc(doc(db, 'jobs', jobId), {
        status: 'submitted',
        lastSubmissionAt: serverTimestamp()
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting work:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!project || !milestone) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="text-3xl font-headline font-bold mb-4">Project or Milestone Not Found</h1>
        <p className="text-on-surface-variant mb-8">We couldn't find the details for this submission.</p>
        <Link to="/dashboard" className="px-8 py-4 bg-primary text-surface rounded-xl font-bold">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center space-y-6"
        >
          <div className="w-24 h-24 rounded-full bg-tertiary/20 flex items-center justify-center text-tertiary mb-4">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-4xl font-headline font-extrabold">Milestone Submitted!</h1>
          <p className="text-on-surface-variant text-lg max-w-md mx-auto">
            Your deliverables have been uploaded and a release request has been sent to the client.
          </p>
          <div className="flex gap-4 pt-8">
            <Link to="/dashboard" className="px-8 py-4 bg-surface-container-high rounded-xl font-bold text-sm hover:bg-surface-container-highest transition-all">
              Go to Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl 2xl:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link to={`/project/${jobId}`} className="mb-8 sm:mb-12 flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-medium group w-fit">
        <ArrowLeft size={16} />
        <span>Back to Project Details</span>
      </Link>

      <header className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="font-label text-primary font-bold tracking-widest text-xs uppercase mb-2 block">Active Project</span>
            <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter mb-4">{project.title}</h1>
            <div className="flex flex-wrap items-center gap-4">
              <span className="bg-tertiary/10 text-tertiary px-3 py-1 rounded-full text-xs font-label font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                Milestone: {milestone.title}
              </span>
              {milestone.dueDate && <span className="text-on-surface-variant text-sm border-l border-white/10 pl-4">Due {milestone.dueDate}</span>}
            </div>
          </div>
          <div className="text-left md:text-right mt-4 md:mt-0">
            <div className="text-on-surface-variant text-xs font-label uppercase tracking-widest mb-1">Automated Escrow Value</div>
            <div className="text-2xl font-label font-bold">{milestone.amount.toLocaleString()} {project.currency}</div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-10">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-linear-to-r from-primary/20 to-secondary/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
          <GlassCard className="relative rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[320px] cursor-pointer hover:bg-surface-container-high transition-all">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 text-primary">
              <Upload size={40} strokeWidth={1.5} />
            </div>
            <h3 className="font-headline text-xl font-bold mb-2">Upload your deliverables</h3>
            <p className="text-on-surface-variant max-w-sm mx-auto mb-8">
              Drag and drop your project files or click to browse. Supported formats: .zip, .pdf, .fig, .mp4
            </p>
            <div className="flex items-center gap-4">
              <div className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-label font-medium hover:bg-white/10 transition-colors">
                Select Files
              </div>
              <div className="text-on-surface-variant text-xs">Max 2GB per file</div>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-4">
          <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold px-2">Notes for the client</label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full min-h-[160px] bg-surface-container-highest border-none rounded-2xl p-6 font-body text-on-surface placeholder:text-on-surface-variant/40 focus:ring-1 focus:ring-primary/30 transition-all" 
            placeholder="Detail what was accomplished in this milestone, link to external staging environments, or provide necessary context for review..."
          />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-6 border-t border-white/5">
          <div className="flex items-start gap-4 max-w-md">
            <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center shrink-0 text-tertiary">
              <Lock size={20} />
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Automated Escrow Policy</p>
              <p className="text-xs text-on-surface-variant">
                Payment of <span className="text-on-surface font-label font-bold">{milestone.amount.toLocaleString()} {project.currency}</span> will be released from the automated escrow automatically upon client approval or after 7 days if no dispute is raised.
              </p>
            </div>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || !notes.trim()}
            className="w-full md:w-auto px-10 py-5 bg-linear-to-br from-primary to-primary-container text-surface font-headline font-extrabold text-lg rounded-xl shadow-2xl shadow-primary/20 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : 'Submit Milestone & Request Release'}
          </button>
        </div>
      </div>
    </div>
  );
};
