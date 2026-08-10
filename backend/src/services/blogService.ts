import { api } from "./api";

// ─────────────────────────────────────────────────────────────────────────────
// Types (mirroring Blog.to_dict() / to_summary_dict() in models/blog.py)
// ─────────────────────────────────────────────────────────────────────────────

export type BlogStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface Blog {
  id: number;
  title: string;
  slug: string;
  short_description: string | null;
  content: string;
  cover_image: string | null;
  cloudinary_public_id: string | null;
  category: string | null;
  tags: string[];
  author_id: number;
  author_name: string;
  author_role: string;
  status: BlogStatus;
  featured: boolean;
  views: number;
  meta_title: string | null;
  meta_description: string | null;
  reading_time: string | null;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// List endpoints return summaries — everything from Blog except `content`
// (the backend strips it out via to_summary_dict() to keep list payloads small).
export type BlogSummary = Omit<Blog, "content">;

export interface BlogListResponse {
  items: BlogSummary[];
  page: number;
  pages: number;
  total: number;
}

export interface CreateBlogPayload {
  title: string;
  content: string;
  short_description?: string;
  cover_image?: string;
  cloudinary_public_id?: string;
  category?: string;
  tags?: string[];
  featured?: boolean;
  status?: BlogStatus; // defaults to DRAFT if omitted
  meta_title?: string;
  meta_description?: string;
}

// Same fields, all optional — PUT only touches whatever keys you send.
export type UpdateBlogPayload = Partial<CreateBlogPayload>;

export interface BlogListParams {
  page?: number;
  limit?: number;
  search?: string; // matches title, category, tags, author_name
  category?: string;
  featured?: boolean;
}

export interface AdminBlogListParams extends BlogListParams {
  status?: BlogStatus;
  author?: number; // author_id
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOG SERVICE
// All endpoints match routes in backend/routes/blog_routes.py
// ─────────────────────────────────────────────────────────────────────────────

/** POST /blogs  (ADMIN | SHOP_MANAGER | SALES_AGENT) */
export const createBlog = async (payload: CreateBlogPayload): Promise<Blog> => {
  const res = await api.post("/blogs", payload);
  return res.data.blog;
};

/**
 * PUT /blogs/:id
 * Admin/Shop Manager can edit any post; a Sales Agent only their own
 * (backend returns 403 otherwise).
 */
export const updateBlog = async (
  blogId: number,
  payload: UpdateBlogPayload
): Promise<Blog> => {
  const res = await api.put(`/blogs/${blogId}`, payload);
  return res.data.blog;
};

/**
 * DELETE /blogs/:id
 * Same ownership rule as updateBlog.
 */
export const deleteBlog = async (blogId: number): Promise<void> => {
  await api.delete(`/blogs/${blogId}`);
};

/**
 * GET /blogs/admin  (ADMIN | SHOP_MANAGER | SALES_AGENT)
 * A Sales Agent sees every published post plus only their own
 * drafts/archived posts; Admin/Shop Manager see everything.
 */
export const getAdminBlogs = async (
  params: AdminBlogListParams = {}
): Promise<BlogListResponse> => {
  const res = await api.get("/blogs/admin", { params });
  return res.data;
};

/** GET /blogs/admin/:id — full editable record for one post */
export const getAdminBlogById = async (blogId: number): Promise<Blog> => {
  const res = await api.get(`/blogs/admin/${blogId}`);
  return res.data.blog;
};

/** GET /blogs — public listing, PUBLISHED posts only, newest first */
export const getPublishedBlogs = async (
  params: BlogListParams = {}
): Promise<BlogListResponse> => {
  const res = await api.get("/blogs", { params });
  return res.data;
};

/**
 * GET /blogs/:slug — public detail view.
 * Increments the view counter server-side, except for staff previews
 * (Admin/Shop Manager/Sales Agent viewing while logged in).
 */
export const getBlogBySlug = async (slug: string): Promise<Blog> => {
  const res = await api.get(`/blogs/${slug}`);
  return res.data.blog;
};

/** PATCH /blogs/:id/publish */
export const publishBlog = async (blogId: number): Promise<Blog> => {
  const res = await api.patch(`/blogs/${blogId}/publish`);
  return res.data.blog;
};

/** PATCH /blogs/:id/archive */
export const archiveBlog = async (blogId: number): Promise<Blog> => {
  const res = await api.patch(`/blogs/${blogId}/archive`);
  return res.data.blog;
};

/** PATCH /blogs/:id/draft */
export const draftBlog = async (blogId: number): Promise<Blog> => {
  const res = await api.patch(`/blogs/${blogId}/draft`);
  return res.data.blog;
};


export const uploadBlogImage = async (file: File) => {

    const formData = new FormData();

    formData.append("image", file);

    const res = await api.post(
        "/blogs/upload-image",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );

    return res.data;
};