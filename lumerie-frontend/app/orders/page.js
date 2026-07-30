"use client";
import { formatNaira } from "@/lib/format";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import StatusBadge from "@/components/StatusBadge";

const CANCELLABLE = ["pending", "confirmed"];

function OrdersPageInner() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const justPlaced = searchParams.get("placed");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await api.get("/orders/", { auth: true });
      setOrders(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/login?next=/orders");
      return;
    }
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated]);

  const cancelOrder = async (orderId) => {
    setCancellingId(orderId);
    try {
      await api.post(`/orders/${orderId}/cancel/`, {}, { auth: true });
      await loadOrders();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <p className="max-w-[1280px] mx-auto px-5 md:px-10 py-16 text-ink-muted">Loading your orders…</p>;

  return (
    <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-14">
      <h1 className="font-display text-4xl mb-2">My Orders</h1>
      {justPlaced && (
        <p className="text-emerald-500 text-sm mb-6">Order {justPlaced} placed successfully — thank you!</p>
      )}
      {error && <p className="text-error text-sm mb-6">{error}</p>}

      {orders.length === 0 ? (
        <p className="text-ink-muted mt-10">You haven&apos;t placed any orders yet.</p>
      ) : (
        <div className="space-y-6 mt-10">
          {orders.map((order) => (
            <div key={order.id} className="bg-surface-1 border border-outline-soft rounded-lg p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <p className="font-display text-lg">{order.order_id}</p>
                  <p className="text-ink-muted text-xs">{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={order.status} />
                  <span className="text-ink">{formatNaira(order.total_amount)}</span>
                </div>
              </div>

              <div className="divide-y divide-outline-soft border-t border-b border-outline-soft mb-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between py-2 text-sm text-ink-muted">
                    <span>
                      {item.quantity} × {item.product_name}
                    </span>
                    <span>{formatNaira(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              {CANCELLABLE.includes(order.status) && (
                <button
                  onClick={() => cancelOrder(order.order_id)}
                  disabled={cancellingId === order.order_id}
                  className="label-caps text-error hover:underline disabled:opacity-50"
                >
                  {cancellingId === order.order_id ? "Cancelling…" : "Cancel Order"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<p className="max-w-[1280px] mx-auto px-5 md:px-10 py-16 text-ink-muted">Loading…</p>}>
      <OrdersPageInner />
    </Suspense>
  );
}
