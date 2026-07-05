import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { listBlogPosts } from "../services/api/blog.api";
import { LatestBlogsSection } from "../components/home/LatestBlogsSection";

const PER_PAGE = 12;

const BlogPostsPage: React.FC = () => {
  const [searchPhrase, setSearchPhrase] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Awaited<
    ReturnType<typeof listBlogPosts>
  > | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(searchPhrase.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchPhrase]);

  useEffect(() => {
    setLoading(true);
    listBlogPosts({
      page,
      pageSize: PER_PAGE,
      q: debouncedQuery || undefined,
    })
      .then(setPosts)
      .catch(() => setPosts({ items: [], total: 0, page: 1, pageSize: PER_PAGE }))
      .finally(() => setLoading(false));
  }, [page, debouncedQuery]);

  const totalPages = posts
    ? Math.max(1, Math.ceil(posts.total / PER_PAGE))
    : 1;

  return (
    <div className="bg-[#FAF5EB] min-h-screen">
      <div className="bg-[#F4ECDD] border-b border-[#1F1109]/[0.08]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 sm:py-10">
          <div
            className="text-sm italic text-[#7A2E2E] tracking-[0.04em] mb-2"
            style={{ fontFamily: "Georgia, serif" }}
          >
            From the blog
          </div>
          <h1
            className="text-2xl sm:text-3xl font-medium text-[#1F1109] leading-[1.1] tracking-[-0.01em]"
            style={{ fontFamily: "Georgia, 'Playfair Display', serif" }}
          >
            All articles
          </h1>
          <p className="text-base text-[#5C4631] mt-1.5">
            Guides, tips, and insights to help you improve your chess
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[13px] h-[13px] text-[#8B6F4E]"
              strokeWidth={2}
            />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchPhrase}
              onChange={(e) => setSearchPhrase(e.target.value)}
              className="w-full bg-white border border-[#1F1109]/[0.14] rounded-lg pl-9 pr-3.5 py-2.5 text-xs text-[#1F1109] outline-none focus:border-[#B8893D] transition-colors placeholder:text-[#8B6F4E]/60"
            />
          </div>
        </div>

        {!loading && posts?.items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-[#6B5640]">
              {debouncedQuery
                ? "No articles match your search."
                : "No articles published yet."}
            </p>
          </div>
        ) : (
          <LatestBlogsSection posts={posts?.items ?? []} loading={loading} />
        )}

        {!loading && posts && posts.total > PER_PAGE && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="text-sm text-[#B8893D] font-medium hover:underline disabled:opacity-40 disabled:no-underline"
            >
              ← Previous
            </button>
            <span className="text-sm text-[#6B5640]">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="text-sm text-[#B8893D] font-medium hover:underline disabled:opacity-40 disabled:no-underline"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPostsPage;
