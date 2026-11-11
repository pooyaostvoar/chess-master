import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { QueryParser } from "../lib/urlQuery";

type SetQueryOptions = {
  history?: "push" | "replace";
};

/**
 * Reads and writes a fixed set of query keys. Pass a module-level parser map.
 * Defaults are left out of the URL. Page changes should use `{ history: "push" }`
 * so Back returns to the previous page; filters use replace.
 */
export function useUrlQuery<T extends Record<string, unknown>>(
  parsers: { [K in keyof T]: QueryParser<T[K]> }
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryString = searchParams.toString();

  const values = useMemo(() => {
    const current = new URLSearchParams(queryString);
    const parsed = {} as T;
    (Object.keys(parsers) as Array<keyof T>).forEach((key) => {
      parsed[key] = parsers[key].parse(current.get(String(key))) as T[keyof T];
    });
    return parsed;
  }, [parsers, queryString]);

  useEffect(() => {
    const current = new URLSearchParams(queryString);
    const next = new URLSearchParams(current);
    let changed = false;
    (Object.keys(parsers) as Array<keyof T>).forEach((key) => {
      const raw = current.get(String(key));
      const serialized = parsers[key].serialize(parsers[key].parse(raw));
      if (serialized == null) {
        if (raw != null) {
          next.delete(String(key));
          changed = true;
        }
      } else if (raw !== serialized) {
        next.set(String(key), serialized);
        changed = true;
      }
    });
    if (changed) setSearchParams(next, { replace: true });
  }, [parsers, queryString, setSearchParams]);

  const setQuery = useCallback(
    (partial: Partial<T>, options?: SetQueryOptions) => {
      const history = options?.history ?? "replace";
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          (Object.keys(partial) as Array<keyof T>).forEach((key) => {
            const value = partial[key];
            const parser = parsers[key];
            if (value === undefined || !parser) return;
            const serialized = parser.serialize(value as T[keyof T]);
            if (serialized == null) next.delete(String(key));
            else next.set(String(key), serialized);
          });
          return next;
        },
        { replace: history !== "push" }
      );
    },
    [parsers, setSearchParams]
  );

  return [values, setQuery] as const;
}
