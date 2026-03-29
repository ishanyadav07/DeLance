import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User as UserIcon, 
  MapPin, 
  Link as LinkIcon, 
  Twitter, 
  Github, 
  ShieldCheck, 
  Star, 
  Clock, 
  CheckCircle2,
  ExternalLink,
  Code2,
  Terminal,
  Cpu,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
  Save
} from 'lucide-react';
import { cn } from '@/src/utils';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientText } from '../components/ui/GradientText';
import { useFirebase } from '../components/FirebaseProvider';
import { db } from '../firebase';
import { doc, getDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, setDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../services/authService';

export const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useFirebase();
  const [profileData, setProfileData] = useState<any>(null);
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingPortfolio, setIsAddingPortfolio] = useState(false);
  const [editingPortfolioItem, setEditingPortfolioItem] = useState<any>(null);
  
  const isOwnProfile = !id || (user && id === user.uid);
  const targetUid = id || user?.uid;

  // Form states
  const [editBio, setEditBio] = useState('');
  const [editSkills, setEditSkills] = useState('');
  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    description: '',
    link: '',
    imageUrl: '',
    tags: ''
  });

  const fetchPortfolio = async (uid: string) => {
    try {
      const q = query(collection(db, 'users', uid, 'portfolio'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPortfolioItems(items);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!targetUid) {
        if (!authLoading) setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'users', targetUid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData(data);
          setEditBio(data.bio || '');
          setEditSkills(data.skills?.join(', ') || '');
        }
        await fetchPortfolio(targetUid);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${targetUid}`);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchProfile();
    }
  }, [targetUid, authLoading]);

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const skillsArray = editSkills.split(',').map(s => s.trim()).filter(s => s !== '');
      await updateDoc(userRef, {
        bio: editBio,
        skills: skillsArray,
        updatedAt: serverTimestamp()
      });
      setProfileData({ ...profileData, bio: editBio, skills: skillsArray });
      setIsEditingProfile(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleSavePortfolio = async () => {
    if (!user) return;
    try {
      const tagsArray = portfolioForm.tags.split(',').map(t => t.trim()).filter(t => t !== '');
      const portfolioData: any = {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhoto: user.photoURL || '',
        title: portfolioForm.title,
        description: portfolioForm.description,
        link: portfolioForm.link,
        imageUrl: portfolioForm.imageUrl,
        tags: tagsArray,
        updatedAt: serverTimestamp()
      };

      if (editingPortfolioItem) {
        const itemRef = doc(db, 'users', user.uid, 'portfolio', editingPortfolioItem.id);
        await updateDoc(itemRef, portfolioData);
      } else {
        const portfolioRef = collection(db, 'users', user.uid, 'portfolio');
        const newItemRef = doc(portfolioRef);
        await setDoc(newItemRef, {
          ...portfolioData,
          id: newItemRef.id,
          createdAt: serverTimestamp()
        });
      }

      await fetchPortfolio(user.uid);
      setIsAddingPortfolio(false);
      setEditingPortfolioItem(null);
      setPortfolioForm({ title: '', description: '', link: '', imageUrl: '', tags: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/portfolio`);
    }
  };

  const handleDeletePortfolio = async (itemId: string) => {
    if (!user || !window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const itemRef = doc(db, 'users', user.uid, 'portfolio', itemId);
      await deleteDoc(itemRef);
      await fetchPortfolio(user.uid);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/portfolio/${itemId}`);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!targetUid && !authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-headline font-bold mb-4">Profile Not Found</h2>
        <p className="text-on-surface-variant mb-8">Please sign in to view your profile or provide a valid user ID.</p>
      </div>
    );
  }

  const freelancer = {
    name: profileData?.displayName || 'Anonymous Freelancer',
    handle: targetUid?.slice(0, 6) + '...' + targetUid?.slice(-4),
    bio: profileData?.bio || 'No bio provided yet. Platform freelancer in the making.',
    location: profileData?.location || 'Global Platform',
    website: profileData?.website || 'delance.platform',
    joined: profileData?.createdAt?.toDate().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) || 'Recently',
    photoURL: profileData?.photoURL || "https://picsum.photos/seed/freelancer/200/200",
    stats: [
      { label: 'Success Rate', value: profileData?.successRate || '100%', icon: CheckCircle2 },
      { label: 'Avg. Rating', value: profileData?.rating || '5.0/5', icon: Star },
      { label: 'Jobs Completed', value: profileData?.completedProjects || '0', icon: ShieldCheck },
      { label: 'Reputation', value: profileData?.reputation || '0', icon: Cpu },
    ],
    skills: profileData?.skills || ['Newcomer'],
    portfolio: portfolioItems
  };

  return (
    <div className="max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
        {/* Left Column: Profile Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="space-y-6">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary to-tertiary p-1">
              <div className="w-full h-full rounded-[22px] bg-surface flex items-center justify-center overflow-hidden">
                <img 
                  src={freelancer.photoURL} 
                  alt="Profile" 
                  loading="lazy"
                  className="w-full h-full object-cover opacity-80"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-headline font-extrabold">{freelancer.name}</h1>
                {isOwnProfile && (
                  <button 
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-primary"
                  >
                    {isEditingProfile ? <X size={16} /> : <Pencil size={16} />}
                  </button>
                )}
              </div>
              <p className="text-sm font-mono text-primary">{freelancer.handle}</p>
            </div>

            {isEditingProfile ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Bio</label>
                  <textarea 
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full bg-surface-container border border-white/5 rounded-xl p-3 text-sm focus:ring-1 focus:ring-primary/30 min-h-[100px]"
                    placeholder="Tell clients about yourself..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Skills (comma separated)</label>
                  <input 
                    type="text"
                    value={editSkills}
                    onChange={(e) => setEditSkills(e.target.value)}
                    className="w-full bg-surface-container border border-white/5 rounded-xl p-3 text-sm focus:ring-1 focus:ring-primary/30"
                    placeholder="React, Node.js, UI Design..."
                  />
                </div>
                <button 
                  onClick={handleSaveProfile}
                  className="w-full py-3 bg-primary text-on-primary rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Save Profile
                </button>
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {freelancer.bio}
              </p>
            )}
            <div className="space-y-3 text-sm text-on-surface-variant">
              <div className="flex items-center gap-2">
                <MapPin size={14} />
                <span>{freelancer.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <LinkIcon size={14} />
                <span className="text-on-surface">{freelancer.website}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} />
                <span>Joined {freelancer.joined}</span>
              </div>
            </div>
            <div className="flex gap-4 pt-2">
              <button className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors">
                <Twitter size={18} />
              </button>
              <button className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors">
                <Github size={18} />
              </button>
            </div>

            {!isOwnProfile && (
              <button 
                onClick={() => navigate('/marketplace')}
                className="w-full py-3 bg-primary text-on-primary rounded-xl text-sm font-bold flex items-center justify-center gap-2 mt-4"
              >
                Hire Me
              </button>
            )}
          </div>

          <div className="pt-8 border-t border-white/5 space-y-4">
            <h3 className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold">Verification</h3>
            <div className="p-4 bg-tertiary/5 rounded-xl border border-tertiary/20 flex items-center gap-3">
              <ShieldCheck className="text-tertiary" size={20} />
              <div className="text-xs">
                <p className="font-bold text-tertiary">Verified Freelancer</p>
                <p className="text-on-surface-variant">Identity verified by platform</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Stats and Content */}
        <div className="lg:col-span-3 space-y-12">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {freelancer.stats.map((stat, i) => (
              <GlassCard key={i} className="p-6 rounded-2xl border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <stat.icon size={14} />
                  <span className="text-[10px] font-label uppercase tracking-widest">{stat.label}</span>
                </div>
                <p className="text-2xl font-headline font-bold">{stat.value}</p>
              </GlassCard>
            ))}
          </div>

          {/* Skills */}
          <div className="space-y-6">
            <h3 className="font-headline font-bold text-xl flex items-center gap-2">
              <Terminal size={20} className="text-primary" />
              Technical Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {freelancer.skills.map((skill, i) => (
                <span key={i} className="px-4 py-2 bg-surface-container rounded-full text-xs font-medium border border-white/5">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Portfolio */}
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <h3 className="font-headline font-bold text-xl flex items-center gap-2">
                <Code2 size={20} className="text-secondary" />
                Recent Projects
              </h3>
              {isOwnProfile && (
                <button 
                  onClick={() => setIsAddingPortfolio(true)}
                  className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-primary/20 transition-colors"
                >
                  <Plus size={14} />
                  Add Project
                </button>
              )}
            </div>

            {isAddingPortfolio && (
              <GlassCard className="p-6 rounded-2xl border border-primary/20 bg-primary/5">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-bold">{editingPortfolioItem ? 'Edit Project' : 'Add New Project'}</h4>
                  <button onClick={() => { setIsAddingPortfolio(false); setEditingPortfolioItem(null); }} className="text-on-surface-variant hover:text-on-surface">
                    <X size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Project Title</label>
                      <input 
                        type="text"
                        value={portfolioForm.title}
                        onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                        className="w-full bg-surface-container border border-white/5 rounded-xl p-3 text-sm focus:ring-1 focus:ring-primary/30"
                        placeholder="e.g. DeFi Dashboard"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Live Link (Optional)</label>
                      <input 
                        type="text"
                        value={portfolioForm.link}
                        onChange={(e) => setPortfolioForm({ ...portfolioForm, link: e.target.value })}
                        className="w-full bg-surface-container border border-white/5 rounded-xl p-3 text-sm focus:ring-1 focus:ring-primary/30"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Image URL (Optional)</label>
                      <input 
                        type="text"
                        value={portfolioForm.imageUrl}
                        onChange={(e) => setPortfolioForm({ ...portfolioForm, imageUrl: e.target.value })}
                        className="w-full bg-surface-container border border-white/5 rounded-xl p-3 text-sm focus:ring-1 focus:ring-primary/30"
                        placeholder="https://images..."
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Description</label>
                      <textarea 
                        value={portfolioForm.description}
                        onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
                        className="w-full bg-surface-container border border-white/5 rounded-xl p-3 text-sm focus:ring-1 focus:ring-primary/30 min-h-[100px]"
                        placeholder="What did you build?"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Tags (comma separated)</label>
                      <input 
                        type="text"
                        value={portfolioForm.tags}
                        onChange={(e) => setPortfolioForm({ ...portfolioForm, tags: e.target.value })}
                        className="w-full bg-surface-container border border-white/5 rounded-xl p-3 text-sm focus:ring-1 focus:ring-primary/30"
                        placeholder="React, Solidity, Figma..."
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button 
                    onClick={() => { setIsAddingPortfolio(false); setEditingPortfolioItem(null); }}
                    className="px-6 py-2 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSavePortfolio}
                    className="px-6 py-2 bg-primary text-on-primary rounded-xl text-sm font-bold"
                  >
                    {editingPortfolioItem ? 'Update Project' : 'Publish Project'}
                  </button>
                </div>
              </GlassCard>
            )}

            {freelancer.portfolio.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {freelancer.portfolio.map((item: any, i: number) => (
                  <motion.div 
                    key={item.id}
                    whileHover={{ y: -4 }}
                    className="h-full relative group"
                  >
                    {isOwnProfile && (
                      <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setEditingPortfolioItem(item);
                            setPortfolioForm({
                              title: item.title,
                              description: item.description,
                              link: item.link || '',
                              imageUrl: item.imageUrl || '',
                              tags: item.tags?.join(', ') || ''
                            });
                            setIsAddingPortfolio(true);
                          }}
                          className="p-2 bg-surface-container-high rounded-lg text-primary hover:bg-primary hover:text-on-primary transition-all"
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeletePortfolio(item.id)}
                          className="p-2 bg-surface-container-high rounded-lg text-error hover:bg-error hover:text-on-error transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                    <GlassCard className="p-6 rounded-2xl border border-white/5 hover:border-primary/20 transition-all group cursor-pointer h-full">
                      {item.imageUrl && (
                        <div className="aspect-video w-full rounded-xl overflow-hidden mb-4 bg-surface-container">
                          <img 
                            src={item.imageUrl} 
                            alt={item.title} 
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold group-hover:text-primary transition-colors">{item.title}</h4>
                        {item.link && (
                          <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-on-surface-variant hover:text-primary transition-colors">
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.tags?.map((tag: string, j: number) => (
                          <span key={j} className="text-[10px] font-label uppercase tracking-widest px-2 py-1 bg-surface-container rounded text-outline">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-12 border border-dashed border-white/10 rounded-2xl text-center">
                <p className="text-on-surface-variant">No projects showcased yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
