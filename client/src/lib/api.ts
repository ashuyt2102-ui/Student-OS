const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("atlas_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data.message || `Request failed with status ${res.status}`;
    const err: any = new Error(errorMsg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  get: <T = any>(url: string) => fetchApi<T>(url, { method: "GET" }),
  post: <T = any>(url: string, body?: any) =>
    fetchApi<T>(url, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T = any>(url: string, body?: any) =>
    fetchApi<T>(url, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  delete: <T = any>(url: string) => fetchApi<T>(url, { method: "DELETE" }),
};
