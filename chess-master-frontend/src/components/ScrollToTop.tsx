import { useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const STORAGE_KEY = "chess-master-scroll-positions";
const ALIGN_MS = 5000;

function hashId(hash: string): string {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!raw) return "";
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function loadPositions(): Map<string, number> {
  const positions = new Map<string, number>();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return positions;
    const parsed = JSON.parse(raw) as Record<string, number>;
    for (const [key, y] of Object.entries(parsed)) {
      if (typeof y === "number") positions.set(key, y);
    }
  } catch {
    // sessionStorage can be unavailable or hold invalid JSON
  }
  return positions;
}

function persistPositions(positions: Map<string, number>) {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(Object.fromEntries(positions))
    );
  } catch {
    // ignore quota and private-mode failures
  }
}

/**
 * New visits start at the top. Back and forward restore the scroll position
 * saved for that history entry. Hash targets are followed on the way in.
 */
export function ScrollToTop() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const positions = useRef(loadPositions());
  const activeKey = useRef<string | null>(null);

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    return () => {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "auto";
      }
    };
  }, []);

  useLayoutEffect(() => {
    const key = location.key;
    const stored = positions.current;
    const sameEntry = activeKey.current === key;
    activeKey.current = key;

    let userMoved = false;
    let expected = window.scrollY;
    let lock = 0;

    const remember = (y: number) => {
      stored.set(key, y);
    };

    const onScroll = () => {
      if (lock > 0) return;
      remember(window.scrollY);
      if (Math.abs(window.scrollY - expected) > 2) userMoved = true;
    };

    const scrollToY = (top: number) => {
      lock += 1;
      window.scrollTo(0, top);
      expected = window.scrollY;
      remember(expected);
      requestAnimationFrame(() => {
        lock = Math.max(0, lock - 1);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    const saved = stored.get(key);
    const id = hashId(location.hash);
    const shouldRestore =
      !sameEntry && navigationType === "POP" && saved !== undefined;

    let observer: ResizeObserver | undefined;
    let stop = 0;

    const watch = (apply: () => void) => {
      apply();
      observer = new ResizeObserver(apply);
      observer.observe(document.body);
      stop = window.setTimeout(() => observer?.disconnect(), ALIGN_MS);
    };

    if (shouldRestore) {
      watch(() => {
        if (userMoved || saved === undefined) return;
        if (Math.abs(window.scrollY - saved) <= 1) return;
        scrollToY(saved);
      });
    } else if (id) {
      watch(() => {
        if (userMoved) return;
        const el = document.getElementById(id);
        if (!el) return;
        const delta = el.getBoundingClientRect().top;
        if (Math.abs(delta) <= 1) return;
        scrollToY(window.scrollY + delta);
      });
    } else if (!sameEntry) {
      scrollToY(0);
    }

    const onPageHide = () => {
      remember(window.scrollY);
      persistPositions(stored);
    };
    window.addEventListener("pagehide", onPageHide);

    return () => {
      remember(window.scrollY);
      persistPositions(stored);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", onPageHide);
      observer?.disconnect();
      window.clearTimeout(stop);
    };
  }, [location.key, location.hash, navigationType]);

  return null;
}
