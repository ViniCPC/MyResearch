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

export interface LoginResponse {
  accessToken: string;
}

export async function registerResearcher(data: RegisterData) {
  const response = await api.post("/auth/register-researcher", data);
  return response.data;
}

export async function login(data: LoginData) {
  const response = await api.post<LoginResponse>("/auth/login", data);
  return response.data;
}