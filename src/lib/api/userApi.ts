import { apiClient } from "./apiClient";
import type { PaginatedResult } from "./apiClient";

export interface UserItem {
  id: string;
  email: string;
  fullName?: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN" | "user" | "admin";
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const userApi = {
  list: (q: { page?: number; limit?: number; search?: string } = {}) => {
    const params = new URLSearchParams();
    Object.entries(q).forEach(([k, v]) => v && params.append(k, String(v)));
    return apiClient.get<PaginatedResult<UserItem>>(`/users?${params.toString()}`);
  },
  me: () => apiClient.get<UserItem>("/users/me"),
  update: (id: string, data: Partial<UserItem>) => apiClient.put<UserItem>(`/users/${id}`, data),
  remove: (id: string) => apiClient.del<{ ok: boolean }>(`/users/${id}`),
};
