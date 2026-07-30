"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function LoginPageInner() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await login(form.username, form.password);
      router.push(next);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-5 py-20">
      <h1 className="font-display text-3xl mb-2 text-center">
        {next === "/admin" ? "Admin Sign In" : "Welcome Back"}
      </h1>
      <p className="text-ink-muted text-center mb-10">
        {next === "/admin"
          ? "Sign in with your staff account to access the dashboard."
          : "Sign in to your Lumerie Éclat account."}
      </p>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="label-caps text-ink-muted block mb-2">Username or Email</label>
          <input
            required
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full bg-surface-1 border border-outline-soft rounded px-4 py-3 text-ink focus:border-gold outline-none"
          />
        </div>
        <div>
          <label className="label-caps text-ink-muted block mb-2">Password</label>
          <input
            required
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full bg-surface-1 border border-outline-soft rounded px-4 py-3 text-ink focus:border-gold outline-none"
          />
        </div>
        {error && <p className="text-error text-sm">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full px-8 py-3 bg-gold text-bg label-caps rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {submitting ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <p className="text-center text-ink-muted text-sm mt-8">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-gold hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="max-w-[1280px] mx-auto px-5 md:px-10 py-16 text-ink-muted">Loading…</p>}>
      <LoginPageInner />
    </Suspense>
  );
}
