const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

function getTokens() {
  if (typeof window === "undefined") return { access: null, refresh: null };
  return {
    access: localStorage.getItem("le_access"),
    refresh: localStorage.getItem("le_refresh"),
  };
}

export function setTokens({ access, refresh }) {
  if (typeof window === "undefined") return;
  if (access) localStorage.setItem("le_access", access);
  if (refresh) localStorage.setItem("le_refresh", refresh);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("le_access");
  localStorage.removeItem("le_refresh");
}

async function refreshAccessToken() {
  const { refresh } = getTokens();
  if (!refresh) return null;
  const res = await fetch(`${BASE_URL}/accounts/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) {
    clearTokens();
    return null;
  }
  const data = await res.json();
  setTokens({ access: data.access });
  return data.access;
}

/**
 * Core request helper. Every Lumerie Eclat endpoint returns
 * { success, message, data } (or { success:false, message, errors }) —
 * this unwraps that envelope and throws a normal Error with `.errors`
 * attached on failure, so callers can just `await apiFetch(...)` and
 * catch one error shape everywhere.
 */
export async function apiFetch(path, { method = "GET", body, auth = false, isForm = false } = {}) {
  const headers = {};
  if (!isForm) headers["Content-Type"] = "application/json";

  if (auth) {
    const { access } = getTokens();
    if (access) headers["Authorization"] = `Bearer ${access}`;
  }

  const doRequest = async () => {
    return fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
  };

  let res = await doRequest();

  // Access token expired mid-session — refresh once, then retry.
  if (res.status === 401 && auth) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      headers["Authorization"] = `Bearer ${newAccess}`;
      res = await doRequest();
    }
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    // no body (e.g. 204) — fine
  }

  if (!res.ok) {
    const message = json?.message || "Something went wrong";
    const err = new Error(message);
    err.errors = json?.errors || {};
    err.status = res.status;
    throw err;
  }

  return json?.data;
}

export const api = {
  get: (path, opts) => apiFetch(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => apiFetch(path, { ...opts, method: "POST", body }),
  patch: (path, body, opts) => apiFetch(path, { ...opts, method: "PATCH", body }),
  delete: (path, opts) => apiFetch(path, { ...opts, method: "DELETE" }),
};
