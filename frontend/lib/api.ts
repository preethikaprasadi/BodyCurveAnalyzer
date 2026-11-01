import {
  MeasurementInput,
  AnalyzeResponse,
  RecommendationsData,
  MeasurementRecord,
  ProgressData,
  UserProfile,
  AuthResponse,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

const TOKEN_KEY = "bodycurve_auth_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearStoredToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
}

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  const token = getStoredToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Perform body shape analysis and fetch recommendations.
 */
export async function analyzeBody(data: MeasurementInput): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) {
    const errorMsg = json.error || "Analysis request failed";
    const details = json.details ? ` (${json.details.join(", ")})` : "";
    throw new Error(`${errorMsg}${details}`);
  }

  return json as AnalyzeResponse;
}

/**
 * Query tailored recommendations for a body shape and user profile.
 */
export async function getRecommendations(
  bodyShape: string,
  goal: string = "maintain",
  activityLevel: string = "beginner"
): Promise<RecommendationsData> {
  const query = new URLSearchParams({
    bodyShape,
    goal,
    activityLevel,
  });

  const res = await fetch(`${API_BASE_URL}/api/recommendations?${query.toString()}`);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || "Failed to fetch recommendations");
  }
  return json.data as RecommendationsData;
}

/**
 * Save a measurement entry to SQLite persistence.
 */
export async function saveMeasurement(data: any): Promise<MeasurementRecord> {
  const res = await fetch(`${API_BASE_URL}/api/measurements`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || "Failed to save measurement");
  }
  return json.data as MeasurementRecord;
}

/**
 * Retrieve measurement history.
 */
export async function fetchMeasurements(
  userId?: string,
  limit: number = 50
): Promise<MeasurementRecord[]> {
  const params: Record<string, string> = { limit: limit.toString() };
  if (userId) params.userId = userId;

  const query = new URLSearchParams(params);
  const res = await fetch(`${API_BASE_URL}/api/measurements?${query.toString()}`);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || "Failed to fetch measurement history");
  }
  return json.data as MeasurementRecord[];
}

/**
 * Delete a measurement entry.
 */
export async function deleteMeasurement(id: number): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/api/measurements/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || "Failed to delete measurement");
  }
  return true;
}

/**
 * Retrieve chronological progress data for charts.
 */
export async function fetchProgress(userId?: string): Promise<ProgressData> {
  const params: Record<string, string> = {};
  if (userId) params.userId = userId;

  const query = new URLSearchParams(params);
  const res = await fetch(`${API_BASE_URL}/api/progress?${query.toString()}`);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || "Failed to fetch progress timeline");
  }
  return json.data as ProgressData;
}

/**
 * User Authentication: Register
 */
export async function registerUser(payload: any): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) {
    const errorMsg = json.error || "Registration failed";
    const details = json.details ? ` (${json.details.join(", ")})` : "";
    throw new Error(`${errorMsg}${details}`);
  }
  if (json.token) setStoredToken(json.token);
  return json as AuthResponse;
}

/**
 * User Authentication: Login
 */
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || "Invalid email or password");
  }
  if (json.token) setStoredToken(json.token);
  return json as AuthResponse;
}

/**
 * User Authentication: Fetch Current User Profile
 */
export async function fetchCurrentUser(): Promise<UserProfile | null> {
  const token = getStoredToken();
  if (!token) return null;

  const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    clearStoredToken();
    return null;
  }
  const json = await res.json();
  return json.user as UserProfile;
}

/**
 * User Authentication: Update Profile
 */
export async function updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
  const token = getStoredToken();
  if (!token) throw new Error("Authentication required");

  const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || "Failed to update profile");
  }
  return json.user as UserProfile;
}
