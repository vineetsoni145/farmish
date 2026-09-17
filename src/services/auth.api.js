import { request } from "./apiClient";
import { mockDelay } from "./mockDelay";

const ADMIN_USERS = [
  "admin@farmish.demo",
  "owner@farmish.demo",
  "stock@farmish.demo",
  "dev@farmish.demo",
];

function isAdminEmail(email) {
  return ADMIN_USERS.includes(String(email || "").toLowerCase());
}

/** Mirrors POST /auth/login */
export async function apiLogin({ contact, password }) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ contact, password }),
  });
}

/** Mirrors POST /auth/register */
export async function apiRegister({ name, email, password, phone }) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, phone }),
  });
}

/** Mirrors POST /auth/otp — prototype stub */
export async function apiRequestOtp(contact) {
  await mockDelay(300);
  if (!contact) {
    return { ok: false, error: "Invalid contact" };
  }
  const value = String(contact).trim();
  if (value.includes("@")) {
    if (!isAdminEmail(value)) {
      return {
        ok: false,
        error: "Admin access is restricted to registered team members.",
      };
    }
    return {
      ok: true,
      data: {
        message:
          "OTP sent to your admin email. Use any code to complete this demo login.",
      },
    };
  }
  if (value.length < 6) {
    return { ok: false, error: "Invalid contact" };
  }
  return {
    ok: true,
    data: { message: "OTP sent (demo: any code works)" },
  };
}

export async function apiVerifyOtp({ contact, code }) {
  await mockDelay(300);
  if (!contact || !code || String(code).trim().length < 3) {
    return { ok: false, error: "Enter the OTP to continue" };
  }
  return {
    ok: true,
    data: { message: "OTP verified" },
  };
}
