import { api } from "./api";

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  institution: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export type UserRole = "ADMIN" | "RESEARCHER" | "DONOR";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  accessToken: string;
  user?: AuthUser;
}

export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
}

export async function registerUser(data: RegisterUserData) {
  const response = await api.post("/auth/register", data);
  return response.data;
}

export async function registerResearcher(data: RegisterData) {
  const response = await api.post("/auth/researcher/register", data);
  return response.data;
}

export async function login(data: LoginData) {
  const response = await api.post<{ access_token: string; user?: AuthUser }>("/auth/login", data);
  return {
    accessToken: response.data.access_token,
    user: response.data.user,
  };
}
