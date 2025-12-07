const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3004";

export type Admin = {
  id: number;
  username: string;
  email: string;
  status: string;
};

type ApiOptions = RequestInit & { auth?: boolean };

export type AdminUser = {
  id: number;
  username: string;
  email: string;
  isMaster: boolean;
  title: string | null;
  rating: number | null;
  bio: string | null;
  chesscomUrl: string | null;
  lichessUrl: string | null;
  profilePicture: string | null;
  pricing: {
    price5min: number | null;
    price10min: number | null;
    price15min: number | null;
    price30min: number | null;
    price45min: number | null;
    price60min: number | null;
  } | null;
};

export type AdminUserListResponse = {
  items: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
};

export type AdminStats = {
  totalUsers: number;
  totalMasters: number;
  upcomingSlots: number;
  bookedSlots: number;
  totalGames: number;
  masters: { id: number; username: string; title: string | null; rating: number | null }[];
  asOf: string;
};

export type AdminActivity = {
  signups: { id: number; username: string; isMaster: boolean; createdAt: string | null }[];
  bookings: {
    id: number;
    startTime: string;
    endTime: string;
    status: string;
    master: { id: number; username: string } | null;
    reservedBy: { id: number; username: string } | null;
    createdAt: string;
  }[];
  cancellations: any[];
  games: { id: string; createdAt: string; finished: boolean }[];
};

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return (await res.json()) as T;
}

export const AdminApi = {
  me: () => request<Admin>("/admin/auth/me"),
  login: (username: string, password: string) =>
    request<{ status: string; admin: Admin }>("/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  logout: () =>
    request<{ message: string }>("/admin/auth/logout", {
      method: "POST",
    }),
  stats: () => request<AdminStats>("/admin/stats"),
  activity: () => request<AdminActivity>("/admin/activity"),
};

export const AdminUsersApi = {
  list: (params: { page: number; pageSize: number; q?: string; role?: "master" | "user" }) => {
    const search = new URLSearchParams();
    search.set("page", String(params.page));
    search.set("pageSize", String(params.pageSize));
    if (params.q) search.set("q", params.q);
    if (params.role) search.set("role", params.role);
    return request<AdminUserListResponse>(`/admin/users?${search.toString()}`);
  },
  get: (id: number) => request<AdminUser>(`/admin/users/${id}`),
  sessions: (id: number, params: { page: number; pageSize: number }) => {
    const search = new URLSearchParams();
    search.set("page", String(params.page));
    search.set("pageSize", String(params.pageSize));
    return request<{
      items: Array<{
        id: number;
        startTime: string;
        endTime: string;
        status: string;
        master: { id: number; username: string } | null;
        customer: { id: number; username: string } | null;
      }>;
      total: number;
      page: number;
      pageSize: number;
    }>(`/admin/users/${id}/sessions?${search.toString()}`);
  },
  update: (id: number, payload: Partial<AdminUser>) =>
    request<AdminUser>(`/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};
