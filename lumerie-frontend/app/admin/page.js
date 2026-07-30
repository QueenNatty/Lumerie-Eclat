"use client";
import { formatNaira } from "@/lib/format";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard/stats/", { auth: true })
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-error">{error}</p>;
  if (!stats) return <p className="text-ink-muted">Loading…</p>;

  const cards = [
    { label: "Total Orders", value: stats.total_orders },
    { label: "Total Revenue", value: `${formatNaira(stats.total_revenue)}` },
    { label: "Active Products", value: stats.total_active_products },
    { label: "Low Stock Items", value: stats.low_stock_count },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Overview</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="bg-surface-1 border border-outline-soft rounded-lg p-5">
            <p className="label-caps text-ink-muted mb-2">{c.label}</p>
            <p className="font-display text-2xl text-gold">{c.value}</p>
          </div>
        ))}
      </div>

      <h2 className="font-display text-xl mb-4">Recent Orders</h2>
      <div className="bg-surface-1 border border-outline-soft rounded-lg divide-y divide-outline-soft">
        {stats.recent_orders.map((order) => (
          <div key={order.id} className="flex items-center justify-between p-4">
            <div>
              <p className="text-ink">{order.order_id}</p>
              <p className="text-ink-muted text-xs">{order.user?.username}</p>
            </div>
            <div className="flex items-center gap-4">
              <StatusBadge status={order.status} />
              <span className="text-ink">{formatNaira(order.total_amount)}</span>
            </div>
          </div>
        ))}
        {stats.recent_orders.length === 0 && <p className="p-4 text-ink-muted text-sm">No orders yet.</p>}
      </div>
    </div>
  );
}
