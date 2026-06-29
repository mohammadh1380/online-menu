import axios, { AxiosInstance } from 'axios';

// Empty string = relative URLs (same origin). Works perfectly behind Nginx
// because /api/* and /media/* are proxied to backend on the same domain.
// For local dev without Docker, set NEXT_PUBLIC_API_URL=http://localhost:8001
export const API_URL: string =
  process.env.NEXT_PUBLIC_API_URL ?? '';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Branch {
  id: number;
  name: string;
  slug: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  order: number;
}

export interface CafeSettings {
  cafe_name: string;
  subtitle: string;
  instagram: string;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  photo: string | null;
  is_available: boolean;
  order: number;
  category_id: number;
  category: Category | null;
  branches: Branch[];
  created_at: string;
  updated_at: string;
}

// ── Public API ────────────────────────────────────────────────────────────────

export const api = axios.create({ baseURL: API_URL });

export const getBranches   = () => api.get<Branch[]>('/api/branches');
export const getCategories = () => api.get<Category[]>('/api/categories');
export const getSettings   = () => api.get<CafeSettings>('/api/settings');

export const getMenu = (branchId?: number, categoryId?: number) =>
  api.get<MenuItem[]>('/api/menu', {
    params: {
      ...(branchId   ? { branch_id:   branchId   } : {}),
      ...(categoryId ? { category_id: categoryId } : {}),
    },
  });

export const photoUrl = (filename: string | null): string | null =>
  filename ? `${API_URL}/media/${filename}` : null;

// ── Admin API (with JWT) ──────────────────────────────────────────────────────

function createAdminApi(): AxiosInstance {
  const instance = axios.create({ baseURL: API_URL });

  instance.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
      }
      return Promise.reject(err);
    }
  );

  return instance;
}

export const adminApi = createAdminApi();

// Auth
export const adminLogin = (username: string, password: string) =>
  api.post<{ access_token: string }>('/api/admin/login', { username, password });

// Menu CRUD
export const adminGetMenu     = () => adminApi.get<MenuItem[]>('/api/admin/menu');
export const adminCreateItem  = (form: FormData) => adminApi.post<MenuItem>('/api/admin/menu', form);
export const adminUpdateItem  = (id: number, form: FormData) => adminApi.put<MenuItem>(`/api/admin/menu/${id}`, form);
export const adminDeleteItem  = (id: number) => adminApi.delete(`/api/admin/menu/${id}`);

// Category CRUD
export const adminCreateCategory = (data: { name: string; slug: string; order: number }) =>
  adminApi.post<Category>('/api/admin/categories', data);
export const adminDeleteCategory = (id: number) =>
  adminApi.delete(`/api/admin/categories/${id}`);

// Settings
export const adminUpdateSettings = (data: Partial<CafeSettings>) =>
  adminApi.put<CafeSettings>('/api/admin/settings', data);
