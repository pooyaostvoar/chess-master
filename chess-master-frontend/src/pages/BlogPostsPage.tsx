import React, { useCallback, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { listBlogPosts } from "../services/api/blog.api";
import { LatestBlogsSection } from "../components/home/LatestBlogsSection";
import { Pagination } from "../components/Pagination";
import { trackEvent } from "../lib/analytics";
import { usePageMeta } from "../lib/seo";
import { useDebouncedSearchDraft } from "../hooks/useDebouncedSearchDraft";
import { useUrlQuery } from "../hooks/useUrlQuery";
import { BLOG_PAGE_SIZES, blogQueryParsers } from "../lib/urlQuery";

const BlogPostsPage: React.FC = () => {
  usePageMeta({
    title: "Chess articles and guides",
    description:
      "Guides, tips, and insights from titled masters to help you improve your chess.",
    canonicalPath: "/posts",
  });
  const [query, setQuery] = useUrlQuery(blogQueryParsers);
  const queryRef = useRef(query);
  queryRef.current = query;
  const commitSearch = useCallback((value: string) => {
    const q = value.trim();
    if (queryRef.current.q === q) return;
    void setQuery({ q, page: 1 });
  }, [setQuery]);
  const [searchDraft, setSearchDraft] = useDebouncedSearchDraft(
    query.q,
    commitSearch
  );
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Awaited<
    ReturnType<typeof listBlogPosts>
  > | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listBlogPosts({
      page: query.page,
      pageSize: query.pageSize,
      q: query.q || undefined,
    })
      .then((result) => {
        if (!cancelled) setPosts(result);
      })
      .catch(() => {
        if (!cancelled) {
          setPosts({
            items: [],
            total: 0,
            page: 1,
            pageSize: query.pageSize,
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query.page, query.pageSize, query.q]);

  useEffect(() => {
    if (loading || !posts) return;
    trackEvent("view_blog_list", {
      page: query.page,
      result_count: posts.total,
      search_term: query.q || undefined,
      page_path: "/posts",
    });
  }, [loading, posts, query.page, query.q]);

  const totalPages = posts
    ? Math.max(1, Math.ceil(posts.total / query.pageSize))
    : 1;

  useEffect(() => {
    if (loading || !posts || query.page <= totalPages) return;
    void setQuery({ page: totalPages }, { history: "replace" });
  }, [loading, posts, query.page, totalPages, setQuery]);

  const goToPage = (page: number) => {
    if (page === query.page && searchDraft.trim() === query.q) return;
    void setQuery({ page, q: searchDraft.trim() }, { history: "push" });
  };

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
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              className="w-full bg-white border border-[#1F1109]/[0.14] rounded-lg pl-9 pr-3.5 py-2.5 text-xs text-[#1F1109] outline-none focus:border-[#B8893D] transition-colors placeholder:text-[#8B6F4E]/60"
            />
          </div>
        </div>

        {!loading && posts?.items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-[#6B5640]">
              {query.q
                ? "No articles match your search."
                : "No articles published yet."}
            </p>
          </div>
        ) : (
          <LatestBlogsSection posts={posts?.items ?? []} loading={loading} />
        )}

        {!loading && posts && (
          <Pagination
            className="mt-10"
            page={query.page}
            pageSize={query.pageSize}
            totalItems={posts.total}
            pageSizeOptions={BLOG_PAGE_SIZES}
            onPageChange={goToPage}
            onPageSizeChange={(pageSize) =>
              void setQuery(
                { pageSize, page: 1, q: searchDraft.trim() },
                { history: "push" }
              )
            }
          />
        )}
      </div>
    </div>
  );
};

export default BlogPostsPage;
