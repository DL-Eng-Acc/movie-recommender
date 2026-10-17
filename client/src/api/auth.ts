import { apiFetch } from "./index";
import type { User } from "../types/user";

interface CurrentUserResponse {
  user: User | null;
}

export async function getCurrentUser(): Promise<User | null> {
  const response = await apiFetch<CurrentUserResponse>("/auth/me");

  return response.user;
}

export async function requestLogout(): Promise<void> {
  await apiFetch<void>("/auth/logout", {
    method: "POST",
  });
}