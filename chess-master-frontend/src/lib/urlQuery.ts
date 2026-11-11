export type QueryParser<T> = {
  parse(value: string | null): T;
  /** Return null to omit the key. Defaults are omitted so URLs stay short. */
  serialize(value: T): string | null;
};

export function stringParam(fallback = ""): QueryParser<string> {
  return {
    parse: (value) => value ?? fallback,
    serialize: (value) => (value === fallback ? null : value),
  };
}

export function pageParam(): QueryParser<number> {
  return {
    parse(value) {
      if (!value || !/^[1-9]\d*$/.test(value)) return 1;
      const parsed = Number(value);
      return Number.isSafeInteger(parsed) ? parsed : 1;
    },
    serialize: (value) => (value === 1 ? null : String(value)),
  };
}

export function pageSizeParam(
  allowed: readonly number[],
  fallback: number
): QueryParser<number> {
  const allowedSet = new Set(allowed);
  return {
    parse(value) {
      if (!value || !/^[1-9]\d*$/.test(value)) return fallback;
      const parsed = Number(value);
      return allowedSet.has(parsed) ? parsed : fallback;
    },
    serialize: (value) => (value === fallback ? null : String(value)),
  };
}

export function literalParam<T extends string>(
  values: readonly T[],
  fallback: T
): QueryParser<T> {
  const allowed = new Set<string>(values);
  return {
    parse: (value) =>
      value && allowed.has(value) ? (value as T) : fallback,
    serialize: (value) => (value === fallback ? null : value),
  };
}

export type QueryValues<M extends Record<string, QueryParser<any>>> = {
  [K in keyof M]: M[K] extends QueryParser<infer V> ? V : never;
};

export function serializeQuery<M extends Record<string, QueryParser<any>>>(
  parsers: M,
  pathname: string,
  values: Partial<QueryValues<M>>
): string {
  const params = new URLSearchParams();
  (Object.keys(values) as Array<keyof M>).forEach((key) => {
    const value = values[key];
    const parser = parsers[key];
    if (value === undefined || !parser) return;
    const serialized = parser.serialize(value as never);
    if (serialized != null) params.set(String(key), serialized);
  });
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export const MASTER_SORTS = ["rating", "price-low", "price-high"] as const;
export const MASTER_PAGE_SIZE = 9;

export const mastersQueryParsers = {
  page: pageParam(),
  pageSize: pageSizeParam([MASTER_PAGE_SIZE], MASTER_PAGE_SIZE),
  q: stringParam(),
  language: stringParam(),
  title: stringParam(),
  rating: stringParam(),
  sort: literalParam(MASTER_SORTS, "rating"),
};

export function serializeMastersQuery(
  pathname: string,
  values: Partial<QueryValues<typeof mastersQueryParsers>>
): string {
  return serializeQuery(mastersQueryParsers, pathname, values);
}

export const BLOG_PAGE_SIZES = [12, 24, 48] as const;
export const BLOG_PAGE_SIZE = 12;

export const blogQueryParsers = {
  page: pageParam(),
  pageSize: pageSizeParam(BLOG_PAGE_SIZES, BLOG_PAGE_SIZE),
  q: stringParam(),
};

export const homeQueryParsers = {
  q: stringParam(),
  language: stringParam(),
};

export const archiveQueryParsers = {
  q: stringParam(),
};
