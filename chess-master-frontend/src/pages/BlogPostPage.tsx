import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getBlogPostBySlug, type BlogPost } from "../services/api/blog.api";
import {
  runBlogPostScripts,
  sanitizeBlogHtml,
} from "../utils/sanitizeBlogHtml";
import { usePageMeta } from "../lib/seo";
import { getMediaUrl } from "../services/config";

type PageStatus = "loading" | "ready" | "not-found" | "error";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [status, setStatus] = useState<PageStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setStatus("not-found");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    getBlogPostBySlug(slug)
      .then((data) => {
        setPost(data);
        setStatus("ready");
      })
      .catch((err: { response?: { status?: number } }) => {
        setPost(null);
        if (err.response?.status === 404) {
          setStatus("not-found");
          return;
        }
        setStatus("error");
        setErrorMessage("Could not load this post. Please try again later.");
      });
  }, [slug]);

  const contentRef = useRef<HTMLDivElement>(null);
  const scriptsInitializedFor = useRef<string | null>(null);
  const sanitizedHtml = useMemo(
    () => (post ? sanitizeBlogHtml(post.contentHtml) : ""),
    [post]
  );

  const pageTitle = post?.title
    ? post.title
    : status === "not-found"
      ? "Post not found"
      : "Article";
  const ogImage = post?.imageUrl ? getMediaUrl(post.imageUrl) : undefined;
  usePageMeta({
    title: pageTitle,
    description:
      status === "ready" && post
        ? `Read "${post.title}" on Chess With Masters — guides and insights from titled coaches.`
        : undefined,
    canonicalPath: slug ? `/posts/${slug}` : undefined,
    robots: status === "not-found" ? "noindex" : undefined,
    ogType: status === "ready" ? "article" : "website",
    ogImage: ogImage || undefined,
    ogImageAlt: post?.title,
  });

  useEffect(() => {
    const container = contentRef.current;
    if (!container || status !== "ready" || !sanitizedHtml) return;
    if (scriptsInitializedFor.current === sanitizedHtml) return;
    scriptsInitializedFor.current = sanitizedHtml;

    runBlogPostScripts(container);
  }, [sanitizedHtml, status]);

  if (status === "loading") {
    return (
      <div className="min-h-[60vh] bg-[#FAF5EB] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-[#1F1109]/20 border-t-[#B8893D] animate-spin" />
      </div>
    );
  }

  if (status === "not-found") {
    return (
      <div className="min-h-[60vh] bg-[#FAF5EB] text-[#1F1109] px-4 py-16 flex items-center justify-center">
        <div className="max-w-md text-center">
          <h1
            className="text-2xl sm:text-3xl font-medium tracking-tight"
            style={{ fontFamily: "Georgia, 'Playfair Display', serif" }}
          >
            Post not found
          </h1>
          <p className="mt-3 text-sm text-[#6B5640]">
            We could not find a post at this address.
          </p>
          <Link
            to="/home"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-[#B8893D] px-6 py-2.5 text-sm font-medium text-[#1F1109] transition hover:bg-[#A37728]"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  if (status === "error" || !post) {
    return (
      <div className="min-h-[60vh] bg-[#FAF5EB] text-[#1F1109] px-4 py-16 flex items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-medium text-[#1F1109]">
            Something went wrong
          </h1>
          <p className="mt-3 text-sm text-[#6B5640]">{errorMessage}</p>
          <Link
            to="/home"
            className="mt-6 inline-flex items-center justify-center rounded-full border border-[#1F1109]/15 bg-white px-6 py-2.5 text-sm font-medium text-[#1F1109] transition hover:bg-[#1F1109]/[0.04]"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={contentRef}
      className="blog-post-content text-[15px] text-[#3D2817] leading-relaxed"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    ></div>
  );
}
