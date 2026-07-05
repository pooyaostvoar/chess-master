import { AppDataSource } from "../database/datasource";
import { BlogPost } from "../database/entity/blog-post";
import { sanitizeBlogHtml } from "../utils/sanitize-blog-html";

export type BlogPostDto = {
  id: number;
  title: string;
  slug: string;
  contentHtml: string;
  imageUrl: string | null;
};

export type BlogPostSummaryDto = {
  id: number;
  title: string;
  slug: string;
  createdAt: string;
  imageUrl: string | null;
};

export function formatBlogPost(post: BlogPost): BlogPostDto {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    contentHtml: sanitizeBlogHtml(post.contentHtml),
    imageUrl: post.imageUrl ?? null,
  };
}

export function formatBlogPostSummary(post: BlogPost): BlogPostSummaryDto {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    createdAt: post.createdAt.toISOString(),
    imageUrl: post.imageUrl ?? null,
  };
}

function normalizeSlug(value: string): string {
  return value.trim().slice(0, 200);
}

export async function ensureUniqueSlug(
  slug: string,
  excludeId?: number
): Promise<string> {
  const repo = AppDataSource.getRepository(BlogPost);
  let candidate = slug;
  let suffix = 2;

  while (true) {
    const existing = await repo.findOne({
      where: { slug: candidate },
    });
    if (!existing || (excludeId !== undefined && existing.id === excludeId)) {
      return candidate;
    }
    candidate = `${slug}${suffix}`;
    suffix += 1;
  }
}

export async function listBlogPosts(params: {
  page: number;
  pageSize: number;
  q?: string;
}) {
  const repo = AppDataSource.getRepository(BlogPost);
  const qb = repo.createQueryBuilder("post");

  if (params.q) {
    qb.andWhere("(post.title ILIKE :q OR post.slug ILIKE :q)", {
      q: `%${params.q}%`,
    });
  }

  qb.orderBy("post.createdAt", "DESC")
    .addOrderBy("post.id", "DESC")
    .skip((params.page - 1) * params.pageSize)
    .take(params.pageSize);

  const [items, total] = await qb.getManyAndCount();

  return {
    items: items.map(formatBlogPostSummary),
    total,
    page: params.page,
    pageSize: params.pageSize,
  };
}

export async function getLatestBlogPosts(limit = 3) {
  const repo = AppDataSource.getRepository(BlogPost);
  const safeLimit = Math.min(Math.max(limit, 1), 10);

  const items = await repo.find({
    order: { createdAt: "DESC", id: "DESC" },
    take: safeLimit,
  });

  return items.map(formatBlogPostSummary);
}

export async function getBlogPostById(id: number) {
  const repo = AppDataSource.getRepository(BlogPost);
  const post = await repo.findOne({ where: { id } });
  return post ? formatBlogPost(post) : null;
}

export async function getBlogPostBySlug(slug: string) {
  const repo = AppDataSource.getRepository(BlogPost);
  const post = await repo.findOne({ where: { slug: slug.trim() } });
  return post ? formatBlogPost(post) : null;
}

export async function createBlogPost(data: {
  title: string;
  slug?: string;
  contentHtml: string;
  imageUrl?: string | null;
}) {
  const repo = AppDataSource.getRepository(BlogPost);
  const baseSlug = normalizeSlug(data.slug || data.title);
  if (!baseSlug) {
    throw new Error("INVALID_SLUG");
  }

  const post = repo.create({
    title: data.title.trim(),
    slug: await ensureUniqueSlug(baseSlug),
    contentHtml: sanitizeBlogHtml(data.contentHtml),
    imageUrl: data.imageUrl ?? null,
  });

  const saved = await repo.save(post);
  return formatBlogPost(saved);
}

export async function updateBlogPost(
  id: number,
  data: Partial<{
    title: string;
    slug: string;
    contentHtml: string;
    imageUrl: string | null;
  }>
) {
  const repo = AppDataSource.getRepository(BlogPost);
  const post = await repo.findOne({ where: { id } });
  if (!post) return null;

  if (data.title !== undefined) post.title = data.title.trim();
  if (data.contentHtml !== undefined) {
    post.contentHtml = sanitizeBlogHtml(data.contentHtml);
  }
  if (data.slug !== undefined) {
    const baseSlug = normalizeSlug(data.slug);
    if (!baseSlug) {
      throw new Error("INVALID_SLUG");
    }
    post.slug = await ensureUniqueSlug(baseSlug, id);
  }
  if (data.imageUrl !== undefined) {
    post.imageUrl = data.imageUrl;
  }

  const saved = await repo.save(post);
  return formatBlogPost(saved);
}

export async function deleteBlogPost(id: number) {
  const repo = AppDataSource.getRepository(BlogPost);
  const result = await repo.delete({ id });
  return (result.affected ?? 0) > 0;
}
