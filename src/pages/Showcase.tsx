import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { collectionGroup, getDocs, query, orderBy } from 'firebase/firestore';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  User as UserIcon,
  Code2,
  Palette,
  Terminal,
  Layout,
  Database,
  Shield,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientText } from '../components/ui/GradientText';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  { id: 'all', name: 'All Work', icon: Layout },
  { id: 'web', name: 'Web Dev', icon: Code2 },
  { id: 'design', name: 'Design', icon: Palette },
  { id: 'backend', name: 'Backend', icon: Database },
  { id: 'security', name: 'Security', icon: Shield },
  { id: 'other', name: 'Other', icon: Terminal },
];

export const Showcase = () => {
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const fetchAllPortfolio = async () => {
      try {
        const q = query(collectionGroup(db, 'portfolio'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // The parent document ID is the userId
          userId: doc.ref.parent.parent?.id
        }));
        setPortfolioItems(items);
      } catch (error) {
        console.error("Error fetching portfolio marketplace:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPortfolio();
  }, []);

  const filteredItems = portfolioItems.filter(item => {
    const matchesSearch = 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = activeCategory === 'all' || 
      item.tags?.some((tag: string) => tag.toLowerCase().includes(activeCategory.toLowerCase())) ||
      item.title?.toLowerCase().includes(activeCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-label uppercase tracking-widest mb-6"
        >
          Freelancer Marketplace
        </motion.div>
        <h1 className="text-5xl md:text-6xl font-headline font-extrabold tracking-tight mb-6 uppercase">
          Discover <GradientText>Top Talent</GradientText>
        </h1>
        <p className="text-on-surface-variant text-lg max-w-2xl mx-auto leading-relaxed">
          Explore the best work from our global community of freelancers. Search by skill, domain, or project type to find your next collaborator.
        </p>
      </header>

      {/* Search and Filters */}
      <div className="mb-12 space-y-8">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
          <input 
            type="text"
            placeholder="Search projects, skills, or freelancers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-lg focus:ring-2 focus:ring-primary/30 transition-all outline-none"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all",
                activeCategory === cat.id 
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20" 
                  : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
              )}
            >
              <cat.icon size={16} />
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="animate-spin text-primary" size={48} />
          <p className="text-on-surface-variant font-mono text-sm uppercase tracking-widest">Loading Marketplace...</p>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -8 }}
              className="h-full"
            >
              <GlassCard className="h-full flex flex-col rounded-3xl border border-white/5 hover:border-primary/30 transition-all overflow-hidden group">
                {item.imageUrl ? (
                  <div className="aspect-video w-full overflow-hidden relative">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                      <Link 
                        to={`/profile/${item.userId}`}
                        className="w-full py-3 bg-white text-black rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                      >
                        View Full Case Study
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-surface-container flex items-center justify-center">
                    <Code2 size={48} className="text-primary/20" />
                  </div>
                )}
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-surface-container overflow-hidden border border-white/10">
                      {item.userPhoto ? (
                        <img src={item.userPhoto} alt={item.userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                          <UserIcon size={14} />
                        </div>
                      )}
                    </div>
                    <Link to={`/profile/${item.userId}`} className="text-xs font-bold hover:text-primary transition-colors">
                      {item.userName || 'Anonymous Freelancer'}
                    </Link>
                  </div>

                  <h3 className="text-xl font-headline font-bold mb-3 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  
                  <p className="text-sm text-on-surface-variant line-clamp-3 mb-6 leading-relaxed flex-1">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {item.tags?.slice(0, 3).map((tag: string, i: number) => (
                      <span key={i} className="text-[10px] font-label uppercase tracking-widest px-2.5 py-1 bg-surface-container rounded-lg text-outline">
                        {tag}
                      </span>
                    ))}
                    {item.tags?.length > 3 && (
                      <span className="text-[10px] font-label uppercase tracking-widest px-2.5 py-1 bg-surface-container rounded-lg text-outline">
                        +{item.tags.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="pt-6 border-top border-white/5 flex items-center justify-between">
                    {item.link ? (
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-primary flex items-center gap-1.5 hover:underline"
                      >
                        Live Preview
                        <ExternalLink size={12} />
                      </a>
                    ) : <div />}
                    
                    <Link 
                      to={`/profile/${item.userId}`}
                      className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-[10px] font-bold uppercase tracking-widest transition-colors"
                    >
                      Contact
                    </Link>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-surface-container/30 rounded-3xl border border-dashed border-white/10">
          <Search size={48} className="mx-auto text-on-surface-variant mb-4 opacity-20" />
          <h3 className="text-xl font-bold mb-2">No projects found</h3>
          <p className="text-on-surface-variant">Try adjusting your search or filters to find what you're looking for.</p>
        </div>
      )}

      {/* Call to Action */}
      <footer className="mt-24 p-12 rounded-[3rem] bg-gradient-to-br from-primary/20 via-surface to-surface border border-primary/20 text-center">
        <h2 className="text-3xl font-headline font-extrabold mb-4 uppercase tracking-tight">Are you a Freelancer?</h2>
        <p className="text-on-surface-variant mb-8 max-w-xl mx-auto">
          Showcase your best work to thousands of potential clients. Start building your professional portfolio today.
        </p>
        <Link 
          to="/profile"
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-on-primary rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
        >
          Upload Your Work
          <ArrowRight size={20} />
        </Link>
      </footer>
    </div>
  );
};

// Helper for class names
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
