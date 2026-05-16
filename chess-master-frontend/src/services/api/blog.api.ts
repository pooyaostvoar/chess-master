import { apiClient } from "./client";

export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  contentHtml: string;
};

export async function getBlogPostBySlug(slug: string): Promise<BlogPost> {
  const res = await apiClient.get<BlogPost>(
    `/posts/slug/${encodeURIComponent(slug)}`
  );
  return res.data;
}
