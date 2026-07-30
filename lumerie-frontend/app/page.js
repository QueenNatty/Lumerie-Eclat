"use client";

import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import CrownMark from "@/components/CrownMark";
import { hero, categories, valueProps, storyTeaser, policyHighlights } from "@/lib/site-content";

async function getFeaturedProducts() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";
  try {
    const res = await fetch(`${base}/products/?ordering=-created_at&page_size=4`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.results || [];
  } catch {
    return [];
  }
}

export default async function LandingPage() {
  const products = await getFeaturedProducts();

  return (
    <div>
      {/* Hero */}
      <section className="max-w-[1280px] mx-auto px-5 md:px-10 pt-20 pb-24 text-center flex flex-col items-center">
        {hero.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hero.image} alt="" className="w-full max-w-3xl rounded-lg mb-10 object-cover aspect-video" />
        ) : (
          <CrownMark className="w-16 h-11 text-gold mb-6" />
        )}
        <p className="label-caps text-gold mb-4">{hero.eyebrow}</p>
        <h1 className="font-display text-4xl md:text-6xl leading-tight max-w-3xl whitespace-pre-line">
          {hero.title}
        </h1>
        <p className="mt-6 text-ink-muted max-w-xl text-lg">{hero.subtitle}</p>
        <div className="mt-10 flex gap-4">
          <Link href={hero.primaryCta.href} className="px-8 py-3 bg-gold text-bg label-caps rounded hover:opacity-90 transition-opacity">
            {hero.primaryCta.label}
          </Link>
          <Link
            href={hero.secondaryCta.href}
            className="px-8 py-3 border border-outline-soft text-ink label-caps rounded hover:border-gold hover:text-gold transition-colors"
          >
            {hero.secondaryCta.label}
          </Link>
        </div>
      </section>

      {/* Policy highlights strip */}
      <section className="border-y border-outline-soft bg-surface-1">
        <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-4 flex flex-wrap justify-center gap-x-10 gap-y-2">
          {policyHighlights.map((p) => (
            <Link key={p.label} href={p.href} className="label-caps text-ink-muted hover:text-gold transition-colors">
              {p.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Shop by category */}
      <section className="max-w-[1280px] mx-auto px-5 md:px-10 py-24">
        <p className="label-caps text-gold mb-2">Shop by Category</p>
        <h2 className="font-display text-3xl mb-10">Curated Selections</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {categories.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="group relative bg-surface-2 border border-outline-soft rounded-lg overflow-hidden aspect-[3/4] flex flex-col justify-end hover:border-gold transition-colors"
            >
              {c.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                />
              )}
              <div className="relative p-6">
                <h3 className="font-display text-xl text-ink group-hover:text-gold transition-colors">{c.label}</h3>
                <p className="text-ink-muted text-sm mt-1">{c.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Signature pieces */}
      {products.length > 0 && (
        <section className="max-w-[1280px] mx-auto px-5 md:px-10 pb-24">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="label-caps text-gold mb-2">The Edit</p>
              <h2 className="font-display text-3xl">Signature Pieces</h2>
            </div>
            <Link href="/shop" className="label-caps text-ink hover:text-gold transition-colors">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Our Story teaser */}
      <section className="bg-surface-1 border-y border-outline-soft">
        <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-24 grid md:grid-cols-2 gap-14 items-center">
          <div className="aspect-square bg-surface-2 rounded-lg overflow-hidden flex items-center justify-center order-2 md:order-1">
            {storyTeaser.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={storyTeaser.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <CrownMark className="w-16 h-11 text-gold" />
            )}
          </div>
          <div className="order-1 md:order-2">
            <p className="label-caps text-gold mb-3">{storyTeaser.eyebrow}</p>
            <h2 className="font-display text-3xl mb-5">{storyTeaser.title}</h2>
            <p className="text-ink-muted leading-relaxed mb-8">{storyTeaser.body}</p>
            <Link href={storyTeaser.cta.href} className="label-caps text-gold hover:underline">
              {storyTeaser.cta.label} →
            </Link>
          </div>
        </div>
      </section>

      {/* Why Lumerie Éclat */}
      <section className="max-w-[1280px] mx-auto px-5 md:px-10 py-24">
        <p className="label-caps text-gold mb-2 text-center">Why Lumerie Éclat</p>
        <h2 className="font-display text-3xl mb-14 text-center">The Details That Matter</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {valueProps.map((v) => (
            <div key={v.title} className="text-center">
              <CrownMark className="w-8 h-5 text-gold mx-auto mb-4" />
              <h3 className="font-display text-lg mb-2">{v.title}</h3>
              <p className="text-ink-muted text-sm leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-t border-outline-soft">
        <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-20 text-center">
          <CrownMark className="w-10 h-7 text-gold mx-auto mb-5" />
          <h2 className="font-display text-2xl mb-3">Join the Inner Circle</h2>
          <p className="text-ink-muted mb-8 max-w-md mx-auto">
            Be first to know about new arrivals and limited pieces.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              required
              placeholder="Your email address"
              className="flex-1 bg-surface-1 border border-outline-soft rounded px-4 py-3 text-ink placeholder:text-ink-muted focus:border-gold outline-none"
            />
            <button type="submit" className="px-8 py-3 bg-gold text-bg label-caps rounded hover:opacity-90 transition-opacity">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
