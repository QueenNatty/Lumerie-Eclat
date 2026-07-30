"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";

const CATEGORY_LABELS = {
  jewelry: "Jewelry",
  crochet: "Crochet",
};

function ShopPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const mainCategory = searchParams.get("main_category") || "";
  const subCategory = searchParams.get("sub_category") || "";
  const search = searchParams.get("search") || "";

  useEffect(() => {
    api.get("/products/categories/").then(setCategories).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (mainCategory) params.set("main_category", mainCategory);
    if (subCategory) params.set("sub_category", subCategory);
    if (search) params.set("search", search);
    params.set("page_size", "24");

    try {
      const data = await api.get(`/products/?${params.toString()}`);
      setProducts(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [mainCategory, subCategory, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key === "main_category") params.delete("sub_category");
    router.push(`/shop?${params.toString()}`);
  };

  const subOptions = mainCategory ? categories[mainCategory] || {} : {};

  return (
    <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-14">
      <p className="label-caps text-gold mb-2">Our Collections</p>
      <h1 className="font-display text-4xl mb-10">
        {mainCategory ? CATEGORY_LABELS[mainCategory] : "All Pieces"}
      </h1>

      <div className="flex flex-wrap gap-3 mb-10">
        <input
          defaultValue={search}
          onKeyDown={(e) => e.key === "Enter" && updateParam("search", e.currentTarget.value)}
          placeholder="Search pieces…"
          className="bg-surface-1 border border-outline-soft rounded px-4 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-gold outline-none w-56"
        />
        <select
          value={mainCategory}
          onChange={(e) => updateParam("main_category", e.target.value)}
          className="bg-surface-1 border border-outline-soft rounded px-4 py-2 text-sm text-ink focus:border-gold outline-none"
        >
          <option value="">All Categories</option>
          {Object.keys(categories).map((key) => (
            <option key={key} value={key}>
              {CATEGORY_LABELS[key] || key}
            </option>
          ))}
        </select>
        {mainCategory && (
          <select
            value={subCategory}
            onChange={(e) => updateParam("sub_category", e.target.value)}
            className="bg-surface-1 border border-outline-soft rounded px-4 py-2 text-sm text-ink focus:border-gold outline-none"
          >
            <option value="">All Sub-categories</option>
            {Object.entries(subOptions).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading && <p className="text-ink-muted">Loading pieces…</p>}
      {error && <p className="text-error">{error}</p>}
      {!loading && !error && products.length === 0 && (
        <p className="text-ink-muted">No pieces match those filters yet.</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<p className="max-w-[1280px] mx-auto px-5 md:px-10 py-16 text-ink-muted">Loading…</p>}>
      <ShopPageInner />
    </Suspense>
  );
}
