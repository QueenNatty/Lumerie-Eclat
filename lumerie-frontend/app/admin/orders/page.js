"use client";
import { formatNaira } from "@/lib/format";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page_size: "50" });
    if (statusFilter) params.set("status", statusFilter);
    try {
      const data = await api.get(`/dashboard/orders/?${params.toString()}`, { auth: true });
      setOrders(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const updateStatus = async (orderId, status) => {
    setBusyId(orderId);
    try {
      await api.patch(`/dashboard/orders/${orderId}/status/`, { status }, { auth: true });
      await loadOrders();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const forceCancel = async (orderId) => {
    setBusyId(orderId);
    try {
      await api.post(`/dashboard/orders/${orderId}/cancel/`, {}, { auth: true });
      await loadOrders();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Orders</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-surface-1 border border-outline-soft rounded px-4 py-2 text-sm text-ink focus:border-gold outline-none"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-error mb-4">{error}</p>}
      {loading ? (
        <p className="text-ink-muted">Loading…</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-surface-1 border border-outline-soft rounded-lg p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <p className="font-display">{order.order_id}</p>
                  <p className="text-ink-muted text-xs">
                    {order.user?.username} · {order.user?.email}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <span className="text-ink">{formatNaira(order.total_amount)}</span>
                </div>
              </div>

              <div className="text-sm text-ink-muted mb-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between py-1">
                    <span>
                      {item.quantity} × {item.product_name}
                    </span>
                    <span>{formatNaira(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <select
                  defaultValue=""
                  disabled={busyId === order.order_id || order.status === "cancelled"}
                  onChange={(e) => {
                    if (e.target.value) updateStatus(order.order_id, e.target.value);
                    e.target.value = "";
                  }}
                  className="bg-surface-2 border border-outline-soft rounded px-3 py-1.5 text-sm text-ink focus:border-gold outline-none disabled:opacity-40"
                >
                  <option value="">Update status…</option>
                  {STATUSES.filter((s) => s !== order.status).map((s) => (
                    <option key={s} value={s}>
                      Mark as {s}
                    </option>
                  ))}
                </select>
                {order.status !== "cancelled" && (
                  <button
                    onClick={() => forceCancel(order.order_id)}
                    disabled={busyId === order.order_id}
                    className="label-caps text-error hover:underline disabled:opacity-40"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
          {orders.length === 0 && <p className="text-ink-muted">No orders match this filter.</p>}
        </div>
      )}
    </div>
  );
}
