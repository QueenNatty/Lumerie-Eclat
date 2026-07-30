"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const onChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      await register(form);
      router.push("/");
    } catch (err) {
      setErrors(err.errors || { general: [err.message] });
    } finally {
      setSubmitting(false);
    }
  };

  const fieldError = (name) => errors[name]?.[0];

  return (
    <div className="max-w-md mx-auto px-5 py-20">
      <h1 className="font-display text-3xl mb-2 text-center">Join Lumerie Éclat</h1>
      <p className="text-ink-muted text-center mb-10">Create an account to shop and track your orders.</p>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-caps text-ink-muted block mb-2">First Name</label>
            <input
              value={form.first_name}
              onChange={onChange("first_name")}
              className="w-full bg-surface-1 border border-outline-soft rounded px-4 py-3 text-ink focus:border-gold outline-none"
            />
          </div>
          <div>
            <label className="label-caps text-ink-muted block mb-2">Last Name</label>
            <input
              value={form.last_name}
              onChange={onChange("last_name")}
              className="w-full bg-surface-1 border border-outline-soft rounded px-4 py-3 text-ink focus:border-gold outline-none"
            />
          </div>
        </div>
        <div>
          <label className="label-caps text-ink-muted block mb-2">Username</label>
          <input
            required
            value={form.username}
            onChange={onChange("username")}
            className="w-full bg-surface-1 border border-outline-soft rounded px-4 py-3 text-ink focus:border-gold outline-none"
          />
          {fieldError("username") && <p className="text-error text-xs mt-1">{fieldError("username")}</p>}
        </div>
        <div>
          <label className="label-caps text-ink-muted block mb-2">Email</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={onChange("email")}
            className="w-full bg-surface-1 border border-outline-soft rounded px-4 py-3 text-ink focus:border-gold outline-none"
          />
          {fieldError("email") && <p className="text-error text-xs mt-1">{fieldError("email")}</p>}
        </div>
        <div>
          <label className="label-caps text-ink-muted block mb-2">Password</label>
          <input
            required
            type="password"
            value={form.password}
            onChange={onChange("password")}
            className="w-full bg-surface-1 border border-outline-soft rounded px-4 py-3 text-ink focus:border-gold outline-none"
          />
          {fieldError("password") && <p className="text-error text-xs mt-1">{fieldError("password")}</p>}
        </div>
        <div>
          <label className="label-caps text-ink-muted block mb-2">Confirm Password</label>
          <input
            required
            type="password"
            value={form.password2}
            onChange={onChange("password2")}
            className="w-full bg-surface-1 border border-outline-soft rounded px-4 py-3 text-ink focus:border-gold outline-none"
          />
          {fieldError("password2") && <p className="text-error text-xs mt-1">{fieldError("password2")}</p>}
        </div>

        {fieldError("general") && <p className="text-error text-sm">{fieldError("general")}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full px-8 py-3 bg-gold text-bg label-caps rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {submitting ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <p className="text-center text-ink-muted text-sm mt-8">
        Already have an account?{" "}
        <Link href="/login" className="text-gold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
