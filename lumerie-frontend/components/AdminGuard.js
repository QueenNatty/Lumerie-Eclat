"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AdminGuard({ children }) {
  const { isAdmin, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.push("/login?next=/admin");
    } else if (!isAdmin) {
      router.push("/");
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  if (loading || !isAdmin) {
    return <p className="max-w-[1280px] mx-auto px-5 md:px-10 py-16 text-ink-muted">Checking access…</p>;
  }

  return children;
}
