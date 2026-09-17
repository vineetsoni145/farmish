import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  apiLogin,
  apiRegister,
  apiRequestOtp,
  apiVerifyOtp,
} from "../services/auth.api";

const LS_CART = "farmish_cart";
const LS_CART_COUPON = "farmish_cart_coupon";
const LS_USER = "farmish_user";
const LS_TOKEN = "farmish_token";
const LS_ORDERS = "farmish_orders";
const LS_WISHLIST = "farmish_wishlist";
const LS_REVIEWS = "farmish_reviews";

const VALID_COUPONS = {
  FARM10: 0.1,
  GROW15: 0.15,
};

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const [cart, setCart] = useState(() => readJson(LS_CART, []));
  const [cartCoupon, setCartCoupon] = useState(() =>
    readJson(LS_CART_COUPON, null),
  );
  const [user, setUser] = useState(() => readJson(LS_USER, null));
  const [orders, setOrders] = useState(() => readJson(LS_ORDERS, []));
  const [wishlist, setWishlist] = useState(() => readJson(LS_WISHLIST, []));
  const [reviews, setReviews] = useState(() => readJson(LS_REVIEWS, {}));
  const [cartNotice, setCartNotice] = useState(null);

  useEffect(() => {
    localStorage.setItem(LS_CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (cartCoupon)
      localStorage.setItem(LS_CART_COUPON, JSON.stringify(cartCoupon));
    else localStorage.removeItem(LS_CART_COUPON);
  }, [cartCoupon]);

  useEffect(() => {
    if (user) localStorage.setItem(LS_USER, JSON.stringify(user));
    else localStorage.removeItem(LS_USER);
  }, [user]);

  useEffect(() => {
    localStorage.setItem(LS_ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(LS_WISHLIST, JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem(LS_REVIEWS, JSON.stringify(reviews));
  }, [reviews]);

  const cartCount = useMemo(
    () => cart.reduce((n, line) => n + line.qty, 0),
    [cart],
  );

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, line) => sum + line.priceRupees * line.qty, 0),
    [cart],
  );

  const dismissCartNotice = useCallback(() => setCartNotice(null), []);

  const addToCart = useCallback((product, qty = 1) => {
    if (!product?.id) return;
    setCart((prev) => {
      const i = prev.findIndex((l) => l.productId === product.id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + qty };
        return next;
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          priceRupees: product.priceRupees,
          unitLabel: product.unitLabel,
          priceDisplay: product.priceDisplay,
          img: product.img,
          qty,
        },
      ];
    });
    setCartNotice({ name: product.name, at: Date.now() });
  }, []);

  useEffect(() => {
    if (!cartNotice) return undefined;
    const t = setTimeout(() => setCartNotice(null), 2800);
    return () => clearTimeout(t);
  }, [cartNotice]);

  const setLineQty = useCallback((productId, qty) => {
    const q = Math.max(0, Math.min(99, Number(qty) || 0));
    setCart((prev) => {
      if (q === 0) return prev.filter((l) => l.productId !== productId);
      return prev.map((l) =>
        l.productId === productId ? { ...l, qty: q } : l,
      );
    });
  }, []);

  const removeLine = useCallback((productId) => {
    setCart((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const login = useCallback(async (contact, password) => {
    const res = await apiLogin({ contact, password });
    if (!res.ok) return { ok: false, error: res.error || "Login failed" };
    localStorage.setItem(LS_TOKEN, res.data.token);
    setUser(res.data.user);
    return { ok: true };
  }, []);

  const validateCredentials = useCallback(async (contact, password) => {
    const res = await apiLogin({ contact, password });
    if (!res.ok)
      return { ok: false, error: res.error || "Invalid credentials" };
    return { ok: true, user: res.data.user };
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      if (!prev) return prev;
      if (typeof updates === "function") {
        return { ...prev, ...updates(prev) };
      }
      return { ...prev, ...updates };
    });
  }, []);

  const saveAddress = useCallback((address) => {
    setUser((prev) => {
      if (!prev) return prev;
      const nextAddress = {
        id: address.id || `address-${Date.now()}`,
        name: address.name,
        phone: address.phone,
        line1: address.line1,
        city: address.city,
        pin: address.pin,
      };
      const savedAddresses = prev.savedAddresses || [];
      const existingIndex = savedAddresses.findIndex(
        (a) => a.id === nextAddress.id,
      );
      const nextSavedAddresses =
        existingIndex >= 0
          ? savedAddresses.map((a) =>
              a.id === nextAddress.id ? nextAddress : a,
            )
          : [...savedAddresses, nextAddress];
      return { ...prev, savedAddresses: nextSavedAddresses };
    });
  }, []);

  const removeAddress = useCallback((addressId) => {
    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        savedAddresses: (prev.savedAddresses || []).filter(
          (a) => a.id !== addressId,
        ),
      };
    });
  }, []);

  const savePaymentMethod = useCallback((method) => {
    setUser((prev) => {
      if (!prev) return prev;
      const nextMethod = {
        id: method.id || `payment-${Date.now()}`,
        type: method.type,
        label: method.label,
        details: method.details,
      };
      const savedPaymentMethods = prev.savedPaymentMethods || [];
      const existingIndex = savedPaymentMethods.findIndex(
        (m) => m.id === nextMethod.id,
      );
      const nextSavedPaymentMethods =
        existingIndex >= 0
          ? savedPaymentMethods.map((m) =>
              m.id === nextMethod.id ? nextMethod : m,
            )
          : [...savedPaymentMethods, nextMethod];
      return { ...prev, savedPaymentMethods: nextSavedPaymentMethods };
    });
  }, []);

  const removePaymentMethod = useCallback((paymentId) => {
    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        savedPaymentMethods: (prev.savedPaymentMethods || []).filter(
          (m) => m.id !== paymentId,
        ),
      };
    });
  }, []);

  const register = useCallback(async (payload) => {
    const res = await apiRegister(payload);
    if (!res.ok)
      return { ok: false, error: res.error || "Registration failed" };
    localStorage.setItem(LS_TOKEN, res.data.token);
    setUser(res.data.user);
    return { ok: true };
  }, []);

  const requestOtp = useCallback(async (contact) => {
    const res = await apiRequestOtp(contact);
    if (!res.ok) return { ok: false, error: res.error || "OTP request failed" };
    return { ok: true, data: res.data };
  }, []);

  const verifyOtp = useCallback(async (payload) => {
    const res = await apiVerifyOtp(payload);
    if (!res.ok)
      return { ok: false, error: res.error || "OTP verification failed" };
    return { ok: true, data: res.data };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(LS_TOKEN);
    setUser(null);
  }, []);
  const markAdminVerified = useCallback(() => {
    setUser((prev) => (prev ? { ...prev, adminVerified: true } : prev));
  }, []);

  const createOrder = useCallback(
    (draft) => {
      const orderId = `ORD-${Date.now()}`;
      const order = {
        id: orderId,
        status: "placed",
        createdAt: new Date().toISOString(),
        lines: draft.lines,
        address: draft.address,
        couponCode: draft.couponCode || null,
        discountRupees: draft.discountRupees || 0,
        subtotalRupees: draft.subtotalRupees,
        deliveryFeeRupees: draft.deliveryFeeRupees,
        totalRupees: draft.totalRupees,
        paymentStatus: "pending",
      };
      setOrders((prev) => [order, ...prev]);
      clearCart();
      return order;
    },
    [clearCart],
  );

  const addToWishlist = useCallback((product) => {
    if (!product?.id) return;
    setWishlist((prev) => {
      if (prev.find((p) => p.id === product.id)) return prev;
      return [product, ...prev];
    });
  }, []);

  const removeFromWishlist = useCallback((productId) => {
    setWishlist((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const applyCartCoupon = useCallback((code) => {
    const nextCode = code?.trim().toUpperCase();
    if (!nextCode) return { ok: false, error: "Enter a coupon code to apply." };
    const discount = VALID_COUPONS[nextCode];
    if (!discount)
      return {
        ok: false,
        error: "This code is not valid. Try FARM10 or GROW15.",
      };
    const nextCartCoupon = {
      code: nextCode,
      discount,
      appliedAt: new Date().toISOString(),
    };
    setCartCoupon(nextCartCoupon);
    return { ok: true, ...nextCartCoupon };
  }, []);

  const clearCartCoupon = useCallback(() => {
    setCartCoupon(null);
  }, []);

  const toggleWishlist = useCallback((product) => {
    if (!product?.id) return;
    setWishlist((prev) => {
      if (prev.find((p) => p.id === product.id))
        return prev.filter((p) => p.id !== product.id);
      return [product, ...prev];
    });
  }, []);

  const isInWishlist = useCallback(
    (productId) => {
      return wishlist.some((p) => p.id === productId);
    },
    [wishlist],
  );

  const addProductReview = useCallback((productId, review) => {
    if (!productId || !review || !review.rating) return;
    setReviews((prev) => {
      const next = { ...(prev || {}) };
      const current = next[productId] || [];
      next[productId] = [
        {
          id: `review-${productId}-${Date.now()}`,
          createdAt: new Date().toISOString(),
          name: review.name || "Anonymous",
          rating: Number(review.rating),
          message: review.message || "",
        },
        ...current,
      ];
      return next;
    });
  }, []);

  const getReviews = useCallback(
    (productId) => {
      return reviews[productId] || [];
    },
    [reviews],
  );

  const getReviewStats = useCallback(
    (productId) => {
      const items = reviews[productId] || [];
      if (!items.length) return { count: 0, score: 0 };
      const score =
        items.reduce((sum, item) => sum + Number(item.rating), 0) /
        items.length;
      return { count: items.length, score: Number(score.toFixed(1)) };
    },
    [reviews],
  );

  const updateOrderPayment = useCallback(
    (orderId, paymentStatus, paymentMethod, paymentMethodLabel) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                paymentStatus,
                paymentMethod: paymentMethod || o.paymentMethod,
                paymentMethodLabel:
                  paymentMethodLabel || o.paymentMethodLabel || null,
                status: paymentStatus === "captured" ? "confirmed" : o.status,
              }
            : o,
        ),
      );
    },
    [],
  );

  const getOrder = useCallback(
    (orderId) => orders.find((o) => o.id === orderId) ?? null,
    [orders],
  );

  const value = useMemo(
    () => ({
      cart,
      cartCount,
      cartSubtotal,
      wishlist,
      user,
      orders,
      addToCart,
      addToWishlist,
      removeFromWishlist,
      applyCartCoupon,
      clearCartCoupon,
      cartCoupon,
      toggleWishlist,
      isInWishlist,
      setLineQty,
      removeLine,
      clearCart,
      login,
      validateCredentials,
      updateUser,
      saveAddress,
      removeAddress,
      savePaymentMethod,
      removePaymentMethod,
      register,
      requestOtp,
      verifyOtp,
      markAdminVerified,
      logout,
      createOrder,
      updateOrderPayment,
      getOrder,
      addProductReview,
      getReviews,
      getReviewStats,
      cartNotice,
      dismissCartNotice,
    }),
    [
      cart,
      cartCount,
      cartSubtotal,
      wishlist,
      user,
      orders,
      reviews,
      cartNotice,
      dismissCartNotice,
      addToCart,
      setLineQty,
      removeLine,
      clearCart,
      login,
      validateCredentials,
      register,
      requestOtp,
      verifyOtp,
      markAdminVerified,
      logout,
      createOrder,
      updateOrderPayment,
      getOrder,
      addProductReview,
      getReviews,
      getReviewStats,
      savePaymentMethod,
      removePaymentMethod,
      updateUser,
      saveAddress,
      removeAddress,
    ],
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return ctx;
}
