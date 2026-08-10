import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Cake, ChevronDown, Clock, Calendar, Eye, User, ArrowRight,
  X, ArrowLeft, Mail, RefreshCw, Cookie, Tag as TagIcon,
} from 'lucide-react';
import { getPublishedBlogs, getBlogBySlug, BlogSummary, Blog } from '../../services/blogService';
import './Userblog.css';

const CATEGORIES = ['All', 'Recipes', 'Baking Tips', 'Bakery News', 'Seasonal', 'Nutrition'];

/* ─────────────────────────── Skeleton Card ─────────────────────────── */
const SkeletonCard: React.FC = () => (
  <div className="ub-card ub-skeleton-card">
    <div className="ub-shimmer ub-skeleton-img" />
    <div className="ub-card-body">
      <div className="ub-shimmer ub-skeleton-line" style={{ width: '40%', height: 20 }} />
      <div className="ub-shimmer ub-skeleton-line" style={{ width: '90%', height: 22, marginTop: 12 }} />
      <div className="ub-shimmer ub-skeleton-line" style={{ width: '70%', height: 16, marginTop: 10 }} />
      <div className="ub-shimmer ub-skeleton-line" style={{ width: '50%', height: 14, marginTop: 18 }} />
    </div>
  </div>
);

/* ─────────────────────────── Blog Card ─────────────────────────── */
interface BlogCardProps {
  blog: BlogSummary;
  onOpen: (slug: string) => void;
  index: number;
}

const formatDate = (date: string | null) =>
  date ? new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

const BlogCard: React.FC<BlogCardProps> = ({ blog, onOpen, index }) => (
  <motion.article
    className="ub-card"
    initial={{ opacity: 0, y: 26 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.45, delay: (index % 6) * 0.06 }}
    whileHover={{ y: -8 }}
    onClick={() => onOpen(blog.slug)}
  >
    <div className="ub-card-img-wrap">
      <img
        src={blog.cover_image || '/assets/blog-placeholder.jpg'}
        alt={blog.title}
        loading="lazy"
        className="ub-card-img"
      />
      <div className="ub-card-img-overlay" />
      {blog.category && <span className="ub-badge">{blog.category}</span>}
    </div>
    <div className="ub-card-body">
      <h3 className="ub-card-title">{blog.title}</h3>
      {blog.short_description && <p className="ub-card-desc">{blog.short_description}</p>}
      <div className="ub-card-meta">
        <span><User size={13} /> {blog.author_name}</span>
        {blog.reading_time && <span><Clock size={13} /> {blog.reading_time}</span>}
      </div>
      <div className="ub-card-meta ub-card-meta-secondary">
        <span><Calendar size={12} /> {formatDate(blog.published_at)}</span>
        <span><Eye size={12} /> {blog.views}</span>
      </div>
      <button className="ub-read-more">
        Read More <ArrowRight size={14} />
      </button>
    </div>
  </motion.article>
);

/* ─────────────────────────── Main Component ─────────────────────────── */
const UserBlog: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('All');

  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [activeBlog, setActiveBlog] = useState<Blog | null>(null);
  const [readerLoading, setReaderLoading] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const readerRef = useRef<HTMLDivElement>(null);

  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  /* Debounce search input */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await getPublishedBlogs({
        search: debouncedSearch || undefined,
        category: category !== 'All' ? category : undefined,
        limit: 60,
      });
      setBlogs(res.items || []);
    } catch (err) {
      console.error('Failed to fetch blogs', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, category]);

  const featuredBlog = useMemo(() => blogs.find((b) => b.featured) || null, [blogs]);
  const gridBlogs = useMemo(
    () => blogs.filter((b) => !featuredBlog || b.id !== featuredBlog.id),
    [blogs, featuredBlog]
  );

  const relatedBlogs = useMemo(() => {
    if (!activeBlog) return [];
    return blogs
      .filter((b) => b.id !== activeBlog.id && b.category === activeBlog.category)
      .slice(0, 3);
  }, [activeBlog, blogs]);

  /* ── Reader open/close ── */
  const openBlog = async (slug: string) => {
    setActiveSlug(slug);
    setReaderLoading(true);
    setActiveBlog(null);
    document.body.style.overflow = 'hidden';
    try {
      const blog = await getBlogBySlug(slug);
      setActiveBlog(blog);
    } catch (err) {
      console.error('Failed to load blog', err);
    } finally {
      setReaderLoading(false);
    }
  };

  const closeReader = () => {
    setActiveSlug(null);
    setActiveBlog(null);
    document.body.style.overflow = '';
  };

  const handleReaderScroll = () => {
    const el = readerRef.current;
    if (!el) return;
    const scrolled = el.scrollTop;
    const max = el.scrollHeight - el.clientHeight;
    setReadProgress(max > 0 ? Math.min(100, (scrolled / max) * 100) : 0);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribeEmail.trim()) return;
    setSubscribed(true);
    setSubscribeEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <div className="ub-page">
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="ub-hero">
        <div className="ub-hero-overlay" />
        <motion.div
          className="ub-hero-float ub-float-1"
          animate={{ y: [0, -18, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Cake size={40} />
        </motion.div>
        <motion.div
          className="ub-hero-float ub-float-2"
          animate={{ y: [0, 16, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          <Cookie size={34} />
        </motion.div>

        <motion.div
          className="ub-hero-content"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="ub-hero-kicker">The Cake N Take Journal</span>
          <h1 className="ub-hero-title">Cake N Take Blog</h1>
          <p className="ub-hero-subtitle">
            Discover baking tips, delicious recipes, cake inspirations, and the latest stories from Cake N Take.
          </p>
        </motion.div>

        <motion.div
          className="ub-scroll-indicator"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        >
          <ChevronDown size={22} />
        </motion.div>
      </section>

      <div className="ub-container">
        {/* ═══════════════ SEARCH + FILTERS ═══════════════ */}
        <div className="ub-controls">
          <div className="ub-search-pill">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by title, category or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="ub-search-clear" onClick={() => setSearch('')}>
                <X size={15} />
              </button>
            )}
          </div>

          <div className="ub-chip-row">
            {CATEGORIES.map((cat) => (
              <motion.button
                key={cat}
                className={`ub-chip ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </div>

        {/* ═══════════════ CONTENT ═══════════════ */}
        {loading ? (
          <div className="ub-grid">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="ub-error-card">
            <div className="ub-error-icon"><RefreshCw size={28} /></div>
            <h3>Something went wrong</h3>
            <p>We couldn't load the blog posts right now. Please try again.</p>
            <button className="ub-retry-btn" onClick={fetchBlogs}>
              <RefreshCw size={15} /> Retry
            </button>
          </div>
        ) : blogs.length === 0 ? (
          <div className="ub-empty-state">
            <motion.div
              animate={{ rotate: [0, -6, 6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <Cake size={56} />
            </motion.div>
            <h3>No blogs found.</h3>
            <p>Try a different search term or category.</p>
          </div>
        ) : (
          <>
            {/* Featured */}
            {featuredBlog && (
              <motion.article
                className="ub-featured-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                whileHover={{ y: -6 }}
                onClick={() => openBlog(featuredBlog.slug)}
              >
                <div className="ub-featured-img-wrap">
                  <img
                    src={featuredBlog.cover_image || '/assets/blog-placeholder.jpg'}
                    alt={featuredBlog.title}
                    className="ub-featured-img"
                  />
                  <div className="ub-featured-overlay" />
                  <span className="ub-featured-badge">✨ Featured</span>
                  {featuredBlog.category && <span className="ub-badge ub-featured-category">{featuredBlog.category}</span>}
                </div>
                <div className="ub-featured-body">
                  <h2 className="ub-featured-title">{featuredBlog.title}</h2>
                  {featuredBlog.short_description && (
                    <p className="ub-featured-desc">{featuredBlog.short_description}</p>
                  )}
                  <div className="ub-card-meta">
                    <span><User size={14} /> {featuredBlog.author_name}</span>
                    {featuredBlog.reading_time && <span><Clock size={14} /> {featuredBlog.reading_time}</span>}
                    <span><Calendar size={14} /> {formatDate(featuredBlog.published_at)}</span>
                  </div>
                  <button className="ub-read-more ub-featured-btn">
                    Read More <ArrowRight size={15} />
                  </button>
                </div>
              </motion.article>
            )}

            {/* Grid */}
            <div className="ub-grid">
              {gridBlogs.map((blog, idx) => (
                <BlogCard key={blog.id} blog={blog} onOpen={openBlog} index={idx} />
              ))}
            </div>
          </>
        )}

        {/* ═══════════════ NEWSLETTER ═══════════════ */}
        <motion.section
          className="ub-newsletter"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Mail size={30} className="ub-newsletter-icon" />
          <h2>Never Miss a Sweet Story</h2>
          <p>Stay updated with new recipes, cake ideas, and bakery news.</p>
          <form className="ub-newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Enter your email address"
              value={subscribeEmail}
              onChange={(e) => setSubscribeEmail(e.target.value)}
              required
            />
            <motion.button type="submit" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              {subscribed ? 'Subscribed! 🎉' : 'Subscribe'}
            </motion.button>
          </form>
        </motion.section>
      </div>

      {/* ═══════════════ BLOG READER ═══════════════ */}
      <AnimatePresence>
        {activeSlug && (
          <motion.div
            className="ub-reader-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeReader}
          >
            <motion.div
              className="ub-reader-progress"
              style={{ scaleX: readProgress / 100 }}
            />
            <motion.div
              className="ub-reader"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.35 }}
              onClick={(e) => e.stopPropagation()}
              ref={readerRef}
              onScroll={handleReaderScroll}
            >
              <button className="ub-reader-close" onClick={closeReader}>
                <ArrowLeft size={16} /> Back to Blog
              </button>

              {readerLoading || !activeBlog ? (
                <div className="ub-reader-loading">
                  <div className="ub-shimmer ub-skeleton-line" style={{ width: '100%', height: 340, borderRadius: 24 }} />
                  <div className="ub-shimmer ub-skeleton-line" style={{ width: '60%', height: 32, marginTop: 24 }} />
                  <div className="ub-shimmer ub-skeleton-line" style={{ width: '90%', height: 16, marginTop: 16 }} />
                  <div className="ub-shimmer ub-skeleton-line" style={{ width: '80%', height: 16, marginTop: 10 }} />
                </div>
              ) : (
                <>
                  <div className="ub-reader-banner">
                    <img src={activeBlog.cover_image || '/assets/blog-placeholder.jpg'} alt={activeBlog.title} />
                    <div className="ub-reader-banner-overlay" />
                    {activeBlog.category && <span className="ub-badge ub-reader-category">{activeBlog.category}</span>}
                  </div>

                  <div className="ub-reader-content">
                    <h1 className="ub-reader-title">{activeBlog.title}</h1>

                    <div className="ub-reader-meta">
                      <div className="ub-reader-author">
                        <div className="ub-avatar">{activeBlog.author_name?.charAt(0).toUpperCase()}</div>
                        <div>
                          <p className="ub-author-name">{activeBlog.author_name}</p>
                          <p className="ub-author-role">{activeBlog.author_role}</p>
                        </div>
                      </div>
                      <div className="ub-reader-meta-stats">
                        <span><Calendar size={14} /> {formatDate(activeBlog.published_at)}</span>
                        {activeBlog.reading_time && <span><Clock size={14} /> {activeBlog.reading_time}</span>}
                        <span><Eye size={14} /> {activeBlog.views} views</span>
                      </div>
                    </div>

                    <div
                      className="ub-reader-body"
                      dangerouslySetInnerHTML={{ __html: activeBlog.content }}
                    />

                    {activeBlog.tags && activeBlog.tags.length > 0 && (
                      <div className="ub-reader-tags">
                        {activeBlog.tags.map((tag) => (
                          <span key={tag} className="ub-tag-chip"><TagIcon size={11} /> {tag}</span>
                        ))}
                      </div>
                    )}

                    {relatedBlogs.length > 0 && (
                      <div className="ub-related-section">
                        <h3>You May Also Like</h3>
                        <div className="ub-related-grid">
                          {relatedBlogs.map((blog, idx) => (
                            <BlogCard key={blog.id} blog={blog} onOpen={openBlog} index={idx} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserBlog;