export interface UserProfile {
  email: string;
  name: string;
  picture: string;
  token: string;
}

const STORAGE_KEY = "ng_auth_user";

export function getUser(): UserProfile | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as UserProfile) : null;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function setUser(user: UserProfile): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearUser(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}

export function logout(): void {
  clearUser();
  window.location.assign("/login");
}

export function authenticateWithGoogle(idToken: string): UserProfile {
  const parts = idToken.split(".");
  if (parts.length !== 3) throw new Error("Google returned an invalid credential.");

  let payload: {
    email?: string;
    name?: string;
    picture?: string;
    aud?: string;
    iss?: string;
    exp?: number;
  };

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const decoded = decodeURIComponent(
      atob(base64)
        .split("")
        .map((character) => `%${`00${character.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(""),
    );
    payload = JSON.parse(decoded) as typeof payload;
  } catch {
    throw new Error("Google returned an unreadable credential.");
  }

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (clientId && payload.aud !== clientId) throw new Error("Google credential is for a different application.");
  if (payload.iss && !["accounts.google.com", "https://accounts.google.com"].includes(payload.iss)) {
    throw new Error("Google credential issuer is invalid.");
  }
  if (payload.exp && payload.exp * 1000 < Date.now()) throw new Error("Google credential has expired.");
  if (!payload.email) throw new Error("Google did not return an email address.");

  const user: UserProfile = {
    email: payload.email,
    name: payload.name || payload.email,
    picture: payload.picture || "",
    token: idToken,
  };
  setUser(user);
  return user;
}

export async function authenticatedFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const user = getUser();
  const headers = new Headers(init.headers);

  if (user?.token) headers.set("Authorization", `Bearer ${user.token}`);

  const response = await fetch(input, { ...init, headers });
  if (response.status === 401) {
    clearUser();
    window.location.assign("/login");
  }

  return response;
}