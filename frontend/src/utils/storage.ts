const TOKEN_KEY = "myresearch_token";
const USER_KEY = "myresearch_user";

export type UserRole = "ADMIN" | "RESEARCHER" | "DONOR";

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export function saveToken(token: string, user?: StoredUser) {
  localStorage.setItem(TOKEN_KEY, token);
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

function decodeRoleFromToken(token: string | null): UserRole | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    const payload = JSON.parse(json) as { role?: UserRole };
    return payload.role ?? null;
  } catch {
    return null;
  }
}

export function getCurrentRole(): UserRole | null {
  const user = getStoredUser();
  if (user?.role) {
    return user.role;
  }
  return decodeRoleFromToken(getToken());
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated() {
  return !!getToken();
}
