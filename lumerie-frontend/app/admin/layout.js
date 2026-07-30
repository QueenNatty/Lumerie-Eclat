"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminGuard from "@/components/AdminGuard";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  return (
    <AdminGuard>
      <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-10 grid md:grid-cols-[200px_1fr] gap-10">
        <aside>
          <p className="label-caps text-gold mb-4">Admin</p>
          <nav className="flex md:flex-col gap-2">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded text-sm ${
                    active ? "bg-surface-2 text-gold" : "text-ink-muted hover:text-gold"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div>{children}</div>
      </div>
    </AdminGuard>
  );
}
