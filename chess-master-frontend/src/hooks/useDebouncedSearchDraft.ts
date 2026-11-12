import { useEffect, useRef, useState } from "react";

const DEFAULT_DELAY_MS = 300;

/**
 * Keeps a search box responsive while the URL (and anything that reads it)
 * updates after the user pauses. External URL changes, including Back, win.
 */
export function useDebouncedSearchDraft(
  urlValue: string,
  onCommit: (value: string) => void,
  delay = DEFAULT_DELAY_MS
) {
  const [draft, setDraft] = useState(urlValue);
  const urlValueRef = useRef(urlValue);
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  useEffect(() => {
    urlValueRef.current = urlValue;
    setDraft(urlValue);
  }, [urlValue]);

  useEffect(() => {
    if (draft === urlValue) return;
    const timer = window.setTimeout(() => {
      if (draft !== urlValueRef.current) onCommitRef.current(draft);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [draft, urlValue, delay]);

  return [draft, setDraft] as const;
}
