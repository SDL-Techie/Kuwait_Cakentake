import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  FormEvent,
  ChangeEvent,
  DragEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  Sparkles,
  LayoutGrid,
  Wand2,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  Send,
  Archive,
  FileEdit,
  Star,
  X,
  Upload,
  Image as ImageIcon,
  Bold,
  Italic,
  Underline,
  Heading2,
  Quote,
  List,
  ListOrdered,
  Link2,
  Code2,
  Undo2,
  Redo2,
  Copy,
  ClipboardPaste,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Croissant,
  Clock,
} from "lucide-react";
import {
  getAdminBlogs,
  getAdminBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  publishBlog,
  archiveBlog,
  draftBlog,
  uploadBlogImage,  
  Blog,
  BlogSummary,
  BlogStatus,
  CreateBlogPayload,
} from "../../services/blogService";
import "./BlogManagement.css";

// ─────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const formatDate = (value: string | null) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const wordsAndReadTime = (html: string) => {
  const text = stripHtml(html);
  const words = text ? text.split(" ").filter(Boolean).length : 0;
  const minutes = Math.max(1, Math.round(words / 200));
  return { words, minutes };
};

/** Pulls a human-readable message out of an axios error. Backend validation
 * failures come back as { error: "Validation failed", details: string[] } —
 * surface those specifics instead of a generic "something went wrong". */
const getErrorMessage = (err: unknown, fallback: string): string => {
  const anyErr = err as any;
  const data = anyErr?.response?.data;
  if (data?.details && Array.isArray(data.details) && data.details.length) {
    return data.details.join(" ");
  }
  if (typeof data?.error === "string") return data.error;
  return fallback;
};

const emptyPayload = (): CreateBlogPayload & { id?: number } => ({
  title: "",
  content: "",
  short_description: "",
  cover_image: "",
  cloudinary_public_id: "", 
  category: "",
  tags: [],
  featured: false,
  status: "DRAFT",
  meta_title: "",
  meta_description: "",
});

type ToastKind = "success" | "error";
interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

type TabKey = "all" | "create" | "ai";

const CATEGORY_OPTIONS = [
  "Recipes",
  "Baking Tips",
  "Bakery News",
  "Behind the Scenes",
  "Seasonal",
  "Nutrition",
];

// ─────────────────────────────────────────────────────────────────────────
// Small presentational pieces
// ─────────────────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: BlogStatus }> = ({ status }) => {
  const map: Record<BlogStatus, string> = {
    DRAFT: "draft",
    PUBLISHED: "published",
    ARCHIVED: "archived",
  };
  const label: Record<BlogStatus, string> = {
    DRAFT: "Draft",
    PUBLISHED: "Published",
    ARCHIVED: "Archived",
  };
  return <span className={`bm-badge ${map[status]}`}>{label[status]}</span>;
};

const IconButtonWithTooltip: React.FC<{
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
}> = ({ label, onClick, children, danger }) => (
  <span className="bm-tooltip-wrap">
    <button
      type="button"
      className="bm-icon-btn"
      style={danger ? { color: "var(--bm-red)" } : undefined}
      onClick={onClick}
      aria-label={label}
    >
      {children}
    </button>
    <span className="bm-tooltip">{label}</span>
  </span>
);

const RippleButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }
> = ({ children, className, onClick, ...rest }) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement("span");
    const size = Math.max(rect.width, rect.height);
    ripple.className = "bm-ripple";
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
    onClick?.(e);
  };
  return (
    <button className={className} onClick={handleClick} {...rest}>
      {children}
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// Rich text editor (lightweight contentEditable toolbar)
// ─────────────────────────────────────────────────────────────────────────

const RichTextEditor: React.FC<{
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder }) => {
  const ref = useRef<HTMLDivElement>(null);
  const lastValue = useRef(value);

  useEffect(() => {
    if (ref.current && value !== lastValue.current && document.activeElement !== ref.current) {
      ref.current.innerHTML = value;
      lastValue.current = value;
    }
  }, [value]);

  const exec = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    if (ref.current) {
      lastValue.current = ref.current.innerHTML;
      onChange(ref.current.innerHTML);
      ref.current.focus();
    }
  };

  const handleInput = () => {
    if (ref.current) {
      lastValue.current = ref.current.innerHTML;
      onChange(ref.current.innerHTML);
    }
  };

  const insertLink = () => {
    const url = window.prompt("Link URL");
    if (url) exec("createLink", url);
  };

  const insertImage = () => {
    const url = window.prompt("Image URL");
    if (url) exec("insertImage", url);
  };

  const tools: { icon: React.ReactNode; label: string; action: () => void }[] = [
    { icon: <Bold size={15} />, label: "Bold", action: () => exec("bold") },
    { icon: <Italic size={15} />, label: "Italic", action: () => exec("italic") },
    { icon: <Underline size={15} />, label: "Underline", action: () => exec("underline") },
    { icon: <Heading2 size={15} />, label: "Heading", action: () => exec("formatBlock", "h2") },
    { icon: <Quote size={15} />, label: "Quote", action: () => exec("formatBlock", "blockquote") },
    { icon: <List size={15} />, label: "Bullet list", action: () => exec("insertUnorderedList") },
    { icon: <ListOrdered size={15} />, label: "Numbered list", action: () => exec("insertOrderedList") },
    { icon: <Link2 size={15} />, label: "Link", action: insertLink },
    { icon: <ImageIcon size={15} />, label: "Image", action: insertImage },
    { icon: <Code2 size={15} />, label: "Code", action: () => exec("formatBlock", "pre") },
    { icon: <Undo2 size={15} />, label: "Undo", action: () => exec("undo") },
    { icon: <Redo2 size={15} />, label: "Redo", action: () => exec("redo") },
  ];

  const { words, minutes } = wordsAndReadTime(value);

  return (
    <div>
      <div className="bm-editor-toolbar">
        {tools.map((t, i) => (
          <React.Fragment key={t.label}>
            {(i === 3 || i === 7 || i === 9) && <div className="bm-editor-divider" />}
            <button
              type="button"
              className="bm-editor-btn"
              title={t.label}
              aria-label={t.label}
              onMouseDown={(e) => e.preventDefault()}
              onClick={t.action}
            >
              {t.icon}
            </button>
          </React.Fragment>
        ))}
      </div>
      <div
        ref={ref}
        className="bm-editor-body"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={handleInput}
      />
      <div className="bm-editor-meta">
        <span>{words} words</span>
        <span>{minutes} min read</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────

const BlogManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  // list state
  const [blogs, setBlogs] = useState<BlogSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<"" | BlogStatus>("");
  const [featured, setFeatured] = useState<"" | "true" | "false">("");

  // modals
  const [viewBlog, setViewBlog] = useState<Blog | null>(null);
  const [editBlog, setEditBlog] = useState<Blog | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlogSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  // create form
  const [form, setForm] = useState(emptyPayload());
  const [tagDraft, setTagDraft] = useState("");
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [dragging, setDragging] = useState(false);

  // AI tab
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiTone, setAiTone] = useState("Friendly");
  const [aiLength, setAiLength] = useState("Medium");

  // toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const pushToast = useCallback((kind: ToastKind, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  // ── data fetching ────────────────────────────────────────────────────

  const fetchBlogs = useCallback(
    async (opts?: { silentSpinner?: boolean }) => {
      if (opts?.silentSpinner) setRefreshing(true);
      else setLoading(true);
      try {
        const res = await getAdminBlogs({
          page,
          limit: 8,
          search: search || undefined,
          category: category || undefined,
          status: status || undefined,
          featured: featured === "" ? undefined : featured === "true",
        });
        setBlogs(res.items);
        setPages(res.pages || 1);
        setTotal(res.total || 0);
      } catch (err) {
        pushToast("error", getErrorMessage(err, "Couldn't load blogs. Try again."));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, search, category, status, featured, pushToast]
  );

  useEffect(() => {
    const t = setTimeout(() => fetchBlogs(), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, category, status, featured]);

  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, status, featured]);

  // ── create form handlers ─────────────────────────────────────────────

  const updateForm = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const addTag = () => {
    const value = tagDraft.trim();
    if (value && !form.tags?.includes(value)) {
      updateForm("tags", [...(form.tags || []), value]);
    }
    setTagDraft("");
  };

  const removeTag = (tag: string) =>
    updateForm("tags", (form.tags || []).filter((t) => t !== tag));

  // const handleCoverFile = (file: File) => {
  //   const reader = new FileReader();
  //   reader.onload = () => updateForm("cover_image", reader.result as string);
  //   reader.readAsDataURL(file);
  // };


  const handleCoverFile = async (file: File) => {
  try {
    const image = await uploadBlogImage(file);

    updateForm("cover_image", image.url);
    updateForm("cloudinary_public_id", image.public_id);

    pushToast("success", "Image uploaded successfully.");
  } catch (err) {
    pushToast("error", "Image upload failed.");
  }
};

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleCoverFile(file);
  };

  const resetForm = () => {
    setForm(emptyPayload());
    setTagDraft("");
  };

  const submitForm = async (status: BlogStatus) => {
    if (!form.title.trim()) {
      pushToast("error", "Give the post a title before saving.");
      return;
    }
    setSaving(status === "DRAFT" ? "draft" : "publish");
    try {
      await createBlog({ ...form, status });
      pushToast("success", status === "DRAFT" ? "Draft saved." : "Blog published.");
      resetForm();
      setActiveTab("all");
      fetchBlogs();
    } catch (err) {
      pushToast("error", getErrorMessage(err, "Couldn't save the post. Try again."));
    } finally {
      setSaving(null);
    }
  };

  // ── row actions ───────────────────────────────────────────────────────

  const openView = async (id: number) => {
    try {
      const blog = await getAdminBlogById(id);
      setViewBlog(blog);
    } catch {
      pushToast("error", "Couldn't open that post.");
    }
  };

  const openEdit = async (id: number) => {
    try {
      const blog = await getAdminBlogById(id);
      setEditBlog(blog);
    } catch {
      pushToast("error", "Couldn't open that post for editing.");
    }
  };

  const saveEdit = async () => {
    if (!editBlog) return;
    setSaving("publish");
    try {
      await updateBlog(editBlog.id, {
        title: editBlog.title,
        category: editBlog.category || undefined,
        tags: editBlog.tags,
        status: editBlog.status,
        featured: editBlog.featured,
        content: editBlog.content,
        cover_image: editBlog.cover_image || undefined,
        meta_title: editBlog.meta_title || undefined,
        meta_description: editBlog.meta_description || undefined,
      });
      pushToast("success", "Blog updated.");
      setEditBlog(null);
      fetchBlogs();
    } catch (err) {
      pushToast("error", getErrorMessage(err, "Couldn't update the post."));
    } finally {
      setSaving(null);
    }
  };

  const runStatusAction = async (
    action: (id: number) => Promise<Blog>,
    id: number,
    successMsg: string
  ) => {
    try {
      await action(id);
      pushToast("success", successMsg);
      fetchBlogs({ silentSpinner: true });
    } catch (err) {
      pushToast("error", getErrorMessage(err, "That action didn't go through."));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBlog(deleteTarget.id);
      pushToast("success", "Blog deleted.");
      setDeleteTarget(null);
      fetchBlogs({ silentSpinner: true });
    } catch (err) {
      pushToast("error", getErrorMessage(err, "Couldn't delete that post."));
    } finally {
      setDeleting(false);
    }
  };

  // ── derived ───────────────────────────────────────────────────────────

  const slugPreview = useMemo(() => slugify(form.title || ""), [form.title]);
  const { words: previewWords, minutes: previewMinutes } = useMemo(
    () => wordsAndReadTime(form.content || ""),
    [form.content]
  );

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: "All Blogs", icon: <LayoutGrid size={15} /> },
    { key: "create", label: "Create Blog", icon: <Plus size={15} /> },
    { key: "ai", label: "AI Assistant", icon: <Sparkles size={15} /> },
  ];

  return (
    <div className="blog-mgmt">
      {/* Header */}
      <div className="bm-header">
        <div>
          <h1 className="bm-header-title">Blog Management</h1>
          <p className="bm-header-subtitle">Create, edit and manage bakery blog posts.</p>
        </div>
        <RippleButton className="bm-create-btn" onClick={() => setActiveTab("create")}>
          <Plus size={16} /> Create Blog
        </RippleButton>
      </div>

      {/* Tabs */}
      <div className="bm-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`bm-tab ${activeTab === t.key ? "active" : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            {activeTab === t.key && (
              <motion.span
                layoutId="bm-tab-indicator"
                className="bm-tab-indicator"
                style={{ left: 0, right: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 7 }}>
              {t.icon}
              {t.label}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "all" && (
          <motion.div
            key="all"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            {/* Filter bar */}
            <div className="bm-filterbar bm-panel">
              <div className="bm-search">
                <Search size={15} />
                <input
                  type="search"
                  placeholder="Search by title, category or author"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className="bm-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All categories</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                className="bm-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="">All statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
              <select
                className="bm-select"
                value={featured}
                onChange={(e) => setFeatured(e.target.value as any)}
              >
                <option value="">All posts</option>
                <option value="true">Featured</option>
                <option value="false">Not featured</option>
              </select>
              <IconButtonWithTooltip
                label="Refresh"
                onClick={() => fetchBlogs({ silentSpinner: true })}
              >
                <span className={refreshing ? "bm-icon-btn spinning" : ""}>
                  <RefreshCw size={15} />
                </span>
              </IconButtonWithTooltip>
            </div>

            {/* Table */}
            <div className="bm-panel bm-table-wrap">
              {loading ? (
                <div>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div className="bm-skeleton-row" key={i}>
                      <div className="bm-skel thumb" />
                      <div className="bm-skel" />
                      <div className="bm-skel" />
                      <div className="bm-skel" />
                      <div className="bm-skel" />
                      <div className="bm-skel" />
                      <div className="bm-skel" />
                      <div className="bm-skel" />
                      <div className="bm-skel" />
                    </div>
                  ))}
                </div>
              ) : blogs.length === 0 ? (
                <div className="bm-empty">
                  <Croissant size={56} strokeWidth={1.2} />
                  <h3>No blogs found</h3>
                  <p>Try adjusting your filters, or create a new post to get started.</p>
                </div>
              ) : (
                <table className="bm-table">
                  <thead>
                    <tr>
                      <th>Cover</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Author</th>
                      <th>Status</th>
                      <th>Views</th>
                      {/* <th>Featured</th> */}
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blogs.map((b) => (
                      <tr key={b.id}>
                        <td>
                          {b.cover_image ? (
                            <img className="bm-cover-thumb" src={b.cover_image} alt="" />
                          ) : (
                            <div className="bm-cover-thumb" />
                          )}
                        </td>
                        <td>
                          <div className="bm-title-cell">
                            <div>
                              <div className="bm-title-text">{b.title}</div>
                              <div className="bm-title-sub">/{b.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td>{b.category || "—"}</td>
                        <td>{b.author_name}</td>
                        <td>
                          <StatusBadge status={b.status} />
                        </td>
                        <td>{b.views.toLocaleString()}</td>
                        {/* <td>
                          {b.featured && (
                            <span className="bm-featured-star">
                              <Star size={15} fill="currentColor" />
                            </span>
                          )}
                        </td> */}
                        <td>{formatDate(b.created_at)}</td>
                        <td>
                          <div className="bm-actions">
                            <IconButtonWithTooltip label="View" onClick={() => openView(b.id)}>
                              <Eye size={15} />
                            </IconButtonWithTooltip>
                            <IconButtonWithTooltip label="Edit" onClick={() => openEdit(b.id)}>
                              <Pencil size={15} />
                            </IconButtonWithTooltip>
                            {b.status !== "PUBLISHED" && (
                              <IconButtonWithTooltip
                                label="Publish"
                                onClick={() =>
                                  runStatusAction(publishBlog, b.id, "Blog published.")
                                }
                              >
                                <Send size={15} />
                              </IconButtonWithTooltip>
                            )}
                            {b.status !== "ARCHIVED" && (
                              <IconButtonWithTooltip
                                label="Archive"
                                onClick={() =>
                                  runStatusAction(archiveBlog, b.id, "Blog archived.")
                                }
                              >
                                <Archive size={15} />
                              </IconButtonWithTooltip>
                            )}
                            {b.status !== "DRAFT" && (
                              <IconButtonWithTooltip
                                label="Move to draft"
                                onClick={() =>
                                  runStatusAction(draftBlog, b.id, "Moved to draft.")
                                }
                              >
                                <FileEdit size={15} />
                              </IconButtonWithTooltip>
                            )}
                            <IconButtonWithTooltip
                              label="Delete"
                              danger
                              onClick={() => setDeleteTarget(b)}
                            >
                              <Trash2 size={15} />
                            </IconButtonWithTooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {!loading && blogs.length > 0 && (
              <div className="bm-pagination">
                <button
                  className="bm-page-btn"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: pages }).map((_, i) => (
                  <button
                    key={i}
                    className={`bm-page-btn ${page === i + 1 ? "active" : ""}`}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="bm-page-btn"
                  disabled={page >= pages}
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  aria-label="Next page"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "create" && (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="bm-create-grid"
          >
            <div className="bm-panel bm-form-card">
              {/* Basic info */}
              <div>
                <h3 className="bm-section-title">
                  <FileEdit size={17} /> Basic information
                </h3>
                <div className="bm-field" style={{ marginTop: 12 }}>
                  <label htmlFor="bm-title">Title</label>
                  <input
                    id="bm-title"
                    type="text"
                    value={form.title}
                    placeholder="Sourdough secrets from our head baker"
                    onChange={(e) => updateForm("title", e.target.value)}
                  />
                  <div className="bm-slug-preview">
                    /blog/<span>{slugPreview || "your-post-slug"}</span>
                  </div>
                </div>
                <div className="bm-field" style={{ marginTop: 14 }}>
                  <label htmlFor="bm-desc">Short description</label>
                  <textarea
                    id="bm-desc"
                    rows={2}
                    value={form.short_description}
                    placeholder="A quick one-liner shown on the blog list"
                    onChange={(e) => updateForm("short_description", e.target.value)}
                  />
                </div>
                <div className="bm-field-row" style={{ marginTop: 14 }}>
                  <div className="bm-field">
                    <label htmlFor="bm-category">Category</label>
                    <select
                      id="bm-category"
                      className="bm-select"
                      value={form.category}
                      onChange={(e) => updateForm("category", e.target.value)}
                    >
                      <option value="">Select a category</option>
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="bm-field">
                    <label>Status</label>
                    <select
                      className="bm-select"
                      value={form.status}
                      onChange={(e) => updateForm("status", e.target.value as BlogStatus)}
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                    </select>
                  </div>
                </div>
                <div className="bm-field" style={{ marginTop: 14 }}>
                  <label>Tags</label>
                  <div className="bm-tags-input">
                    {(form.tags || []).map((tag) => (
                      <span className="bm-tag-chip" key={tag}>
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    <input
                      value={tagDraft}
                      placeholder="Add a tag, press Enter"
                      onChange={(e) => setTagDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      onBlur={addTag}
                    />
                  </div>
                </div>
                <div className="bm-switch-row" style={{ marginTop: 16 }}>
                  <label htmlFor="bm-featured" style={{ fontSize: 13.5, fontWeight: 600 }}>
                    Feature this post
                  </label>
                  <button
                    id="bm-featured"
                    type="button"
                    className={`bm-switch ${form.featured ? "on" : ""}`}
                    onClick={() => updateForm("featured", !form.featured)}
                    aria-pressed={form.featured}
                  >
                    <motion.span
                      className="bm-switch-knob"
                      animate={{ x: form.featured ? 18 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              </div>

              {/* Cover image */}
              <div>
                <h3 className="bm-section-title">
                  <ImageIcon size={17} /> Cover image
                </h3>
                {form.cover_image ? (
                  <div className="bm-cover-preview" style={{ marginTop: 12 }}>
                    <img src={form.cover_image} alt="Cover preview" />
                    <button
                      type="button"
                      className="bm-cover-remove"
                      onClick={() => updateForm("cover_image", "")}
                      aria-label="Remove cover image"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <label
                    className={`bm-upload ${dragging ? "dragging" : ""}`}
                    style={{ marginTop: 12 }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                  >
                    <Upload size={26} />
                    <span className="bm-upload-text">
                      <b>Drag & drop</b> an image, or click to browse
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0];
                        if (file) handleCoverFile(file);
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Content editor */}
              <div>
                <h3 className="bm-section-title">
                  <Pencil size={17} /> Content
                </h3>
                <div style={{ marginTop: 12 }}>
                  <RichTextEditor
                    value={form.content}
                    onChange={(html) => updateForm("content", html)}
                    placeholder="Write the post..."
                  />
                </div>
              </div>

              {/* SEO */}
              <div>
                <h3 className="bm-section-title">
                  <Search size={17} /> SEO
                </h3>
                <div className="bm-field" style={{ marginTop: 12 }}>
                  <label>Meta title</label>
                  <input
                    type="text"
                    value={form.meta_title}
                    maxLength={70}
                    onChange={(e) => updateForm("meta_title", e.target.value)}
                  />
                  <div className={`bm-char-counter ${(form.meta_title?.length || 0) > 60 ? "warn" : ""}`}>
                    {form.meta_title?.length || 0}/70
                  </div>
                </div>
                <div className="bm-field">
                  <label>Meta description</label>
                  <textarea
                    rows={2}
                    value={form.meta_description}
                    maxLength={160}
                    onChange={(e) => updateForm("meta_description", e.target.value)}
                  />
                  <div className={`bm-char-counter ${(form.meta_description?.length || 0) > 150 ? "warn" : ""}`}>
                    {form.meta_description?.length || 0}/160
                  </div>
                </div>
              </div>

              <div className="bm-form-buttons">
                <button type="button" className="bm-btn ghost" onClick={resetForm}>
                  Reset
                </button>
                <button
                  type="button"
                  className="bm-btn secondary"
                  disabled={saving !== null}
                  onClick={() => submitForm("DRAFT")}
                >
                  {saving === "draft" && <span className="bm-spinner dark" />}
                  Save draft
                </button>
                <button
                  type="button"
                  className="bm-btn primary"
                  disabled={saving !== null}
                  onClick={() => submitForm("PUBLISHED")}
                >
                  {saving === "publish" && <span className="bm-spinner" />}
                  Publish blog
                </button>
              </div>
            </div>

            {/* Live preview — signature element */}
            <div className="bm-preview-sticky">
              <div className="bm-preview-card">
                <div className="bm-preview-label">
                  <Eye size={12} /> Live preview
                </div>
                {form.cover_image && <img className="bm-preview-cover" src={form.cover_image} alt="" />}
                <div className="bm-preview-body">
                  {form.category && <span className="bm-preview-category">{form.category}</span>}
                  <h4 className="bm-preview-title">{form.title || "Your post title appears here"}</h4>
                  <div className="bm-preview-reading">
                    <Clock size={11} style={{ verticalAlign: "-2px", marginRight: 4 }} />
                    {previewWords > 0 ? `${previewMinutes} min read` : "Reading time appears here"}
                  </div>
                  <div className="bm-preview-content">
                    {stripHtml(form.content) || form.short_description || "Start writing to see a preview of the post."}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "ai" && (
          <motion.div
            key="ai"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="bm-panel bm-ai-panel"
          >
            <div className="bm-ai-illustration">
              <Wand2 size={40} />
            </div>
            <h2>
              AI Blog Assistant <span className="bm-coming-soon">Coming soon</span>
            </h2>
            <p>Generate bakery blog ideas and content using AI.</p>
            <div className="bm-ai-form">
              <textarea
                placeholder="Describe your blog..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
              <div className="bm-ai-row">
                <div className="bm-field">
                  <label>Tone</label>
                  <select className="bm-select" value={aiTone} onChange={(e) => setAiTone(e.target.value)}>
                    <option>Professional</option>
                    <option>Friendly</option>
                    <option>Marketing</option>
                    <option>Educational</option>
                  </select>
                </div>
                <div className="bm-field">
                  <label>Length</label>
                  <select className="bm-select" value={aiLength} onChange={(e) => setAiLength(e.target.value)}>
                    <option>Short</option>
                    <option>Medium</option>
                    <option>Long</option>
                  </select>
                </div>
              </div>
              <button type="button" className="bm-btn primary bm-ai-generate" disabled>
                <Sparkles size={15} /> Generate
              </button>
            </div>

            <div className="bm-ai-output">
              <div className="bm-ai-output-header">
                <strong style={{ fontSize: 13 }}>Generated draft</strong>
                <div className="bm-ai-output-actions">
                  <button className="bm-icon-btn" disabled aria-label="Copy">
                    <Copy size={14} />
                  </button>
                  <button className="bm-icon-btn" disabled aria-label="Insert into editor">
                    <ClipboardPaste size={14} />
                  </button>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "var(--bm-text-faint)", margin: 0 }}>
                AI generation is on the way — this card will fill in with a draft you can copy or insert
                straight into the editor.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit modal */}
      <AnimatePresence>
        {editBlog && (
          <motion.div
            className="bm-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditBlog(null)}
          >
            <motion.div
              className="bm-modal wide"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bm-modal-header">
                <h2>Edit blog</h2>
                <button className="bm-modal-close" onClick={() => setEditBlog(null)} aria-label="Close">
                  <X size={16} />
                </button>
              </div>
              <div className="bm-modal-body">
                <div className="bm-field">
                  <label>Title</label>
                  <input
                    type="text"
                    value={editBlog.title}
                    onChange={(e) => setEditBlog({ ...editBlog, title: e.target.value })}
                  />
                </div>
                <div className="bm-field-row">
                  <div className="bm-field">
                    <label>Category</label>
                    <select
                      className="bm-select"
                      value={editBlog.category || ""}
                      onChange={(e) => setEditBlog({ ...editBlog, category: e.target.value })}
                    >
                      <option value="">Select a category</option>
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="bm-field">
                    <label>Status</label>
                    <select
                      className="bm-select"
                      value={editBlog.status}
                      onChange={(e) =>
                        setEditBlog({ ...editBlog, status: e.target.value as BlogStatus })
                      }
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                </div>
                <div className="bm-switch-row">
                  <label style={{ fontSize: 13.5, fontWeight: 600 }}>Featured</label>
                  <button
                    type="button"
                    className={`bm-switch ${editBlog.featured ? "on" : ""}`}
                    onClick={() => setEditBlog({ ...editBlog, featured: !editBlog.featured })}
                    aria-pressed={editBlog.featured}
                  >
                    <motion.span
                      className="bm-switch-knob"
                      animate={{ x: editBlog.featured ? 18 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
                <div className="bm-field">
                  <label>Content</label>
                  <RichTextEditor
                    value={editBlog.content}
                    onChange={(html) => setEditBlog({ ...editBlog, content: html })}
                  />
                </div>
                <div className="bm-field">
                  <label>Meta title</label>
                  <input
                    type="text"
                    value={editBlog.meta_title || ""}
                    onChange={(e) => setEditBlog({ ...editBlog, meta_title: e.target.value })}
                  />
                </div>
                <div className="bm-field">
                  <label>Meta description</label>
                  <textarea
                    rows={2}
                    value={editBlog.meta_description || ""}
                    onChange={(e) => setEditBlog({ ...editBlog, meta_description: e.target.value })}
                  />
                </div>
              </div>
              <div className="bm-modal-footer">
                <button className="bm-btn ghost" onClick={() => setEditBlog(null)}>
                  Cancel
                </button>
                <button className="bm-btn primary" disabled={saving !== null} onClick={saveEdit}>
                  {saving && <span className="bm-spinner" />}
                  Update blog
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View modal */}
      <AnimatePresence>
        {viewBlog && (
          <motion.div
            className="bm-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewBlog(null)}
          >
            <motion.div
              className="bm-modal wide"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bm-modal-header">
                <h2>{viewBlog.title}</h2>
                <button className="bm-modal-close" onClick={() => setViewBlog(null)} aria-label="Close">
                  <X size={16} />
                </button>
              </div>
              <div className="bm-modal-body">
                {viewBlog.cover_image && (
                  <img className="bm-view-cover" src={viewBlog.cover_image} alt="" />
                )}
                <div className="bm-view-meta">
                  <div className="bm-view-meta-item">
                    <span>Category</span>
                    <span>{viewBlog.category || "—"}</span>
                  </div>
                  <div className="bm-view-meta-item">
                    <span>Author</span>
                    <span>{viewBlog.author_name}</span>
                  </div>
                  <div className="bm-view-meta-item">
                    <span>Created</span>
                    <span>{formatDate(viewBlog.created_at)}</span>
                  </div>
                  <div className="bm-view-meta-item">
                    <span>Views</span>
                    <span>{viewBlog.views.toLocaleString()}</span>
                  </div>
                  <div className="bm-view-meta-item">
                    <span>Status</span>
                    <StatusBadge status={viewBlog.status} />
                  </div>
                  <div className="bm-view-meta-item">
                    <span>Featured</span>
                    <span>{viewBlog.featured ? "Yes" : "No"}</span>
                  </div>
                </div>
                <div
                  className="bm-view-content"
                  dangerouslySetInnerHTML={{ __html: viewBlog.content }}
                />
              </div>
              <div className="bm-modal-footer">
                <button className="bm-btn ghost" onClick={() => setViewBlog(null)}>
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            className="bm-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              className="bm-modal small"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bm-modal-body bm-delete-body">
                <div className="bm-delete-icon">
                  <AlertTriangle size={26} />
                </div>
                <h3>Delete blog?</h3>
                <p>
                  "{deleteTarget.title}" will be removed permanently. This action cannot be undone.
                </p>
              </div>
              <div className="bm-modal-footer">
                <button className="bm-btn ghost" onClick={() => setDeleteTarget(null)}>
                  Cancel
                </button>
                <button
                  className="bm-btn primary"
                  style={{ background: "var(--bm-red)" }}
                  disabled={deleting}
                  onClick={confirmDelete}
                >
                  {deleting && <span className="bm-spinner" />}
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toasts */}
      <div className="bm-toast-stack">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              className={`bm-toast ${t.kind}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
            >
              {t.kind === "success" ? (
                <CheckCircle2 size={18} />
              ) : (
                <XCircle size={18} />
              )}
              <span>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BlogManagement;