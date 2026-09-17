import { request } from "./apiClient";

/** Mirrors GET /products */
export async function fetchProducts(params) {
  const query = new URLSearchParams(params || {}).toString();
  return request(`/products${query ? `?${query}` : ""}`);
}

/** Mirrors GET /products/:id */
export async function fetchProductById(id) {
  return request(`/products/${id}`);
}
