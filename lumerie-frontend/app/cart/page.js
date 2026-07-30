"use client";
import { formatNaira } from "@/lib/format";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function CartPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCart = async () => {
    setLoading(true);
    try {
      const data = await api.get("/cart/", { auth: true });
      setCart(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/login?next=/cart");
      return;
    }
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated]);

  const updateQty = async (itemId, quantity) => {
    try {
      const data = await api.patch(`/cart/items/${itemId}/`, { quantity }, { auth: true });
      setCart(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const data = await api.delete(`/cart/items/${itemId}/`, { auth: true });
      setCart(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const clearCart = async () => {
    try {
      await api.delete("/cart/clear/", { auth: true });
      loadCart();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p className="max-w-[1280px] mx-auto px-5 md:px-10 py-16 text-ink-muted">Loading your cart…</p>;

  const items = cart?.items || [];

  return (
    <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-14">
      <h1 className="font-display text-4xl mb-10">Your Cart</h1>
      {error && <p className="text-error mb-6">{error}</p>}

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-ink-muted mb-6">Your cart is empty.</p>
          <Link href="/shop" className="px-8 py-3 bg-gold text-bg label-caps rounded">
            Browse Collections
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 bg-surface-1 border border-outline-soft rounded-lg p-4"
              >
                <div className="w-20 h-20 bg-surface-2 rounded overflow-hidden flex-shrink-0">
                  {item.product_image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.product_image_url} alt={item.product_name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-display text-lg">{item.product_name}</p>
                  <p className="text-ink-muted text-sm">{formatNaira(item.product_price)} each</p>
                </div>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateQty(item.id, Math.max(1, Number(e.target.value)))}
                  className="w-16 bg-surface-2 border border-outline-soft rounded px-2 py-1 text-center text-ink focus:border-gold outline-none"
                />
                <p className="w-24 text-right text-ink">{formatNaira(item.subtotal)}</p>
                <button onClick={() => removeItem(item.id)} className="text-ink-muted hover:text-error text-sm">
                  Remove
                </button>
              </div>
            ))}
            <button onClick={clearCart} className="label-caps text-ink-muted hover:text-error mt-2">
              Clear Cart
            </button>
          </div>

          <div className="bg-surface-1 border border-outline-soft rounded-lg p-6 h-fit">
            <div className="flex justify-between mb-2 text-ink-muted">
              <span>Items</span>
              <span>{cart.total_items}</span>
            </div>
            <div className="flex justify-between mb-6 text-lg">
              <span className="text-ink">Total</span>
              <span className="text-ink">{formatNaira(cart.total_price)}</span>
            </div>
            <Link
              href="/checkout"
              className="block text-center w-full px-8 py-3 bg-gold text-bg label-caps rounded hover:opacity-90 transition-opacity"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
