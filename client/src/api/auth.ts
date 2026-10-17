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

interface LoginInput {
  identifier: string;
  password: string;
}

interface LoginResponse {
  user: User;
}

export async function requestLogin(input: LoginInput): Promise<User> {
  const response = await apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return response.user;
}