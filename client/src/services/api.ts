const API_URL = import.meta.env.VITE_API_URL || "/api";

async function parseJsonBody(response: Response): Promise<any> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function apiRequest(endpoint: string, method = "GET", body?: any) {
  const token = localStorage.getItem("token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorData = await parseJsonBody(res);
    throw new Error(errorData?.error || "API request failed");
  }

  return parseJsonBody(res);
}
