"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import CrownMark from "./CrownMark";
import ThemeToggle from "./ThemeToggle";
import { siteName } from "@/lib/site-content";

export default function Navbar() {
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-bg/90 backdrop-blur border-b border-outline-soft">
      <div className="max-w-[1280px] mx-auto px-5 md:px-10 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 text-ink">
          <CrownMark className="w-7 h-5 text-gold" />
          <span className="font-display text-lg tracking-[0.15em]">{siteName}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 label-caps text-ink-muted">
          <Link href="/shop" className="hover:text-gold transition-colors">
            Collections
          </Link>
          <Link href="/shop?main_category=jewelry" className="hover:text-gold transition-colors">
            Jewelry
          </Link>
          <Link href="/shop?main_category=crochet" className="hover:text-gold transition-colors">
            Crochet
          </Link>
          {isAdmin && (
            <Link href="/admin" className="hover:text-gold transition-colors">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/cart" aria-label="Cart" className="text-ink hover:text-gold transition-colors text-lg">
            🛍
          </Link>
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="w-9 h-9 rounded-full bg-surface-2 border border-outline-soft text-sm flex items-center justify-center hover:border-gold"
              >
                {user?.username?.[0]?.toUpperCase() || "?"}
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-surface-1 border border-outline-soft rounded shadow-lg py-2 text-sm">
                  <Link href="/orders" className="block px-4 py-2 hover:text-gold" onClick={() => setMenuOpen(false)}>
                    My Orders
                  </Link>
                  <Link href="/account" className="block px-4 py-2 hover:text-gold" onClick={() => setMenuOpen(false)}>
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 hover:text-gold"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="label-caps text-ink hover:text-gold transition-colors">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
