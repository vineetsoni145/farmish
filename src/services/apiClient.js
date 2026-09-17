const API_BASE = process.env.REACT_APP_API_URL || "/api";

export async function request(path, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok)
      return { ok: false, error: data.error || "Request failed" };
    return { ok: true, data };
  } catch {
    return { ok: false, error: "Unable to connect to the Farmish API" };
  }
}

export function authHeaders() {
  const token = localStorage.getItem("farmish_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
