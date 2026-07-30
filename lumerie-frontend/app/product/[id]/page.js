"use client";
import { formatNaira } from "@/lib/format";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState({ loading: true, error: "", message: "" });

  useEffect(() => {
    api
      .get(`/products/${id}/`)
      .then((data) => setProduct(data))
      .catch((err) => setStatus((s) => ({ ...s, error: err.message })))
      .finally(() => setStatus((s) => ({ ...s, loading: false })));
  }, [id]);

  const addToCart = async () => {
    if (!isAuthenticated) {
      router.push(`/login?next=/product/${id}`);
      return;
    }
    setStatus({ loading: false, error: "", message: "" });
    try {
      await api.post("/cart/items/", { product_id: Number(id), quantity }, { auth: true });
      setStatus({ loading: false, error: "", message: "Added to your cart." });
    } catch (err) {
      setStatus({ loading: false, error: err.message, message: "" });
    }
  };

  if (status.loading) return <p className="max-w-[1280px] mx-auto px-5 md:px-10 py-16 text-ink-muted">Loading…</p>;
  if (!product) return <p className="max-w-[1280px] mx-auto px-5 md:px-10 py-16 text-error">Piece not found.</p>;

  const outOfStock = product.stock <= 0;

  return (
    <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-14 grid md:grid-cols-2 gap-14">
      <div className="aspect-square bg-surface-2 rounded-lg overflow-hidden flex items-center justify-center">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-ink-muted">No image</span>
        )}
      </div>

      <div>
        <p className="label-caps text-gold mb-2">{product.sub_category?.replace(/_/g, " ")}</p>
        <h1 className="font-display text-4xl mb-4">{product.name}</h1>
        <p className="text-2xl text-ink mb-6">{formatNaira(product.price)}</p>
        <p className="text-ink-muted leading-relaxed mb-6">{product.description || "No description provided."}</p>

        {product.material && (
          <p className="text-sm text-ink-muted mb-1">
            <span className="text-ink">Material:</span> {product.material}
          </p>
        )}
        {product.colors_available?.length > 0 && (
          <p className="text-sm text-ink-muted mb-6">
            <span className="text-ink">Colors:</span> {product.colors_available.join(", ")}
          </p>
        )}

        <p className={`text-sm mb-6 ${outOfStock ? "text-error" : "text-ink-muted"}`}>
          {outOfStock ? "Out of stock" : `${product.stock} in stock`}
        </p>

        {!outOfStock && (
          <div className="flex items-center gap-4 mb-6">
            <label className="label-caps text-ink-muted">Qty</label>
            <input
              type="number"
              min={1}
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value))))}
              className="w-20 bg-surface-1 border border-outline-soft rounded px-3 py-2 text-ink focus:border-gold outline-none"
            />
          </div>
        )}

        <button
          onClick={addToCart}
          disabled={outOfStock}
          className="px-8 py-3 bg-gold text-bg label-caps rounded hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {outOfStock ? "Unavailable" : "Add to Cart"}
        </button>

        {status.message && <p className="text-emerald-500 text-sm mt-4">{status.message}</p>}
        {status.error && <p className="text-error text-sm mt-4">{status.error}</p>}
      </div>
    </div>
  );
}
