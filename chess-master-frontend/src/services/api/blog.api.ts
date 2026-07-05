import { apiClient } from "./client";

export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  contentHtml: string;
  imageUrl: string | null;
};

export type BlogPostSummary = {
  id: number;
  title: string;
  slug: string;
  createdAt: string;
  imageUrl: string | null;
};

export async function getLatestBlogPosts(
  limit = 3
): Promise<BlogPostSummary[]> {
  const res = await apiClient.get<{ items: BlogPostSummary[] }>(
    `/posts/latest?limit=${limit}`
  );
  return res.data.items;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost> {
  const res = await apiClient.get<BlogPost>(
    `/posts/slug/${encodeURIComponent(slug)}`
  );
  return res.data;
}

export type BlogPostListResponse = {
  items: BlogPostSummary[];
  total: number;
  page: number;
  pageSize: number;
};

export async function listBlogPosts(params: {
  page?: number;
  pageSize?: number;
  q?: string;
}): Promise<BlogPostListResponse> {
  const search = new URLSearchParams();
  search.set("page", String(params.page ?? 1));
  search.set("pageSize", String(params.pageSize ?? 12));
  if (params.q) search.set("q", params.q);

  const res = await apiClient.get<BlogPostListResponse>(
    `/posts?${search.toString()}`
  );
  return res.data;
}
