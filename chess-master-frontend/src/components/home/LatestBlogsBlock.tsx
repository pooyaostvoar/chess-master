import React, { useEffect, useState } from "react";
import { getLatestBlogPosts, type BlogPostSummary } from "../../services/api/blog.api";
import { LatestBlogsSection } from "./LatestBlogsSection";

export const LatestBlogsBlock: React.FC<{ compact?: boolean }> = ({
  compact = false,
}) => {
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLatestBlogPosts(3)
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && posts.length === 0) return null;

  if (compact) {
    return <LatestBlogsSection posts={posts} loading={loading} compact />;
  }

  return (
    <section className="bg-[#FAF5EB] border-t border-[#1F1109]/[0.08]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
        <div className="mb-8">
          <div
            className="text-sm italic text-[#7A2E2E] tracking-[0.04em] mb-2"
            style={{ fontFamily: "Georgia, serif" }}
          >
            From the blog
          </div>
          <h2
            className="text-[24px] sm:text-[28px] font-medium text-[#1F1109] leading-[1.1] mb-1.5 tracking-[-0.01em]"
            style={{ fontFamily: "Georgia, 'Playfair Display', serif" }}
          >
            Latest articles
          </h2>
          <p className="text-sm text-[#6B5640] leading-relaxed max-w-[380px] m-0">
            Guides, tips, and insights to help you improve your chess.
          </p>
        </div>

        <LatestBlogsSection posts={posts} loading={loading} />
      </div>
    </section>
  );
};
