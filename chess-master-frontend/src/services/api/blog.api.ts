import { apiClient } from "./client";

export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  contentHtml: string;
};

export type BlogPostSummary = {
  id: number;
  title: string;
  slug: string;
  createdAt: string;
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
