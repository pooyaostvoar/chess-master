import { useEffect } from "react";
import { SITE_URL, absoluteUrl } from "../services/config";

export const SITE_NAME = "Chess With Masters";
export const DEFAULT_DESCRIPTION =
  "Chess With Masters connects players with verified titled coaches for live sessions, lessons, and games.";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/logo512.png`;

type RobotsOption = "index" | "noindex" | boolean;

export type PageMeta = {
  title: string;
  description?: string;
  canonicalPath?: string;
  robots?: RobotsOption;
  ogType?: "website" | "article" | "profile";
  ogImage?: string | null;
  ogImageAlt?: string;
};

const upsertMeta = (
  key: "name" | "property",
  value: string,
  content: string
): (() => void) => {
  const selector = `meta[${key}="${value}"]`;
  const existing = document.head.querySelector<HTMLMetaElement>(selector);
  if (existing) {
    const previous = existing.getAttribute("content") ?? "";
    existing.setAttribute("content", content);
    return () => existing.setAttribute("content", previous);
  }
  const el = document.createElement("meta");
  el.setAttribute(key, value);
  el.setAttribute("content", content);
  el.dataset.seoManaged = "true";
  document.head.appendChild(el);
  return () => {
    if (el.parentNode) el.parentNode.removeChild(el);
  };
};

const upsertLink = (rel: string, href: string): (() => void) => {
  const selector = `link[rel="${rel}"]`;
  const existing = document.head.querySelector<HTMLLinkElement>(selector);
  if (existing) {
    const previous = existing.getAttribute("href") ?? "";
    existing.setAttribute("href", href);
    return () => existing.setAttribute("href", previous);
  }
  const el = document.createElement("link");
  el.setAttribute("rel", rel);
  el.setAttribute("href", href);
  el.dataset.seoManaged = "true";
  document.head.appendChild(el);
  return () => {
    if (el.parentNode) el.parentNode.removeChild(el);
  };
};

const resolveRobots = (robots: RobotsOption | undefined): string => {
  if (robots === "noindex" || robots === false) return "noindex, nofollow";
  return "index, follow";
};

export const usePageMeta = (meta: PageMeta): void => {
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    canonicalPath,
    robots,
    ogType = "website",
    ogImage,
    ogImageAlt,
  } = meta;

  useEffect(() => {
    const cleanups: Array<() => void> = [];

    const previousTitle = document.title;
    const fullTitle =
      title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
    document.title = fullTitle;
    cleanups.push(() => {
      document.title = previousTitle;
    });

    const canonicalHref =
      canonicalPath !== undefined ? absoluteUrl(canonicalPath) : undefined;

    cleanups.push(upsertMeta("name", "description", description));
    cleanups.push(upsertMeta("name", "robots", resolveRobots(robots)));

    cleanups.push(upsertMeta("property", "og:site_name", SITE_NAME));
    cleanups.push(upsertMeta("property", "og:title", fullTitle));
    cleanups.push(upsertMeta("property", "og:description", description));
    cleanups.push(upsertMeta("property", "og:type", ogType));
    if (canonicalHref) {
      cleanups.push(upsertMeta("property", "og:url", canonicalHref));
    }

    const resolvedImage = ogImage === null ? undefined : ogImage ?? DEFAULT_OG_IMAGE;
    if (resolvedImage) {
      cleanups.push(upsertMeta("property", "og:image", resolvedImage));
      if (ogImageAlt) {
        cleanups.push(upsertMeta("property", "og:image:alt", ogImageAlt));
      }
    }

    cleanups.push(upsertMeta("name", "twitter:card", "summary_large_image"));
    cleanups.push(upsertMeta("name", "twitter:title", fullTitle));
    cleanups.push(upsertMeta("name", "twitter:description", description));
    if (resolvedImage) {
      cleanups.push(upsertMeta("name", "twitter:image", resolvedImage));
    }

    if (canonicalHref) {
      cleanups.push(upsertLink("canonical", canonicalHref));
    }

    return () => {
      for (let i = cleanups.length - 1; i >= 0; i -= 1) cleanups[i]();
    };
  }, [
    title,
    description,
    canonicalPath,
    robots,
    ogType,
    ogImage,
    ogImageAlt,
  ]);
};
