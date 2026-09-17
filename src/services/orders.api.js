import { authHeaders, request } from "./apiClient";

/** Mirrors POST /orders — client builds payload; server would persist */
export async function apiCreateOrder(payload) {
  return request("/orders", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

/** Mirrors GET /orders/:id */
export async function apiGetOrder(orderId) {
  return request(`/orders/${orderId}`, { headers: authHeaders() });
}
