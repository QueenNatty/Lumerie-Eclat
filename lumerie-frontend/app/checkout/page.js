"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function CheckoutPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/login?next=/checkout");
  }, [authLoading, isAuthenticated, router]);

  const placeOrder = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const order = await api.post("/orders/checkout/", { shipping_address: address }, { auth: true });
      router.push(`/orders?placed=${order.order_id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-5 md:px-10 py-14">
      <h1 className="font-display text-4xl mb-10">Checkout</h1>
      <form onSubmit={placeOrder} className="space-y-6">
        <div>
          <label className="label-caps text-ink-muted block mb-2">Shipping Address (optional)</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={4}
            className="w-full bg-surface-1 border border-outline-soft rounded px-4 py-3 text-ink focus:border-gold outline-none"
            placeholder="Street, city, state, postal code"
          />
        </div>

        {error && <p className="text-error text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full px-8 py-3 bg-gold text-bg label-caps rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {submitting ? "Placing Order…" : "Place Order"}
        </button>
        <p className="text-ink-muted text-xs text-center">
          Payment is handled outside this demo — placing an order confirms it immediately.
        </p>
      </form>
    </div>
  );
}
