import Link from "next/link";
import { formatNaira } from "@/lib/format";

export default function ProductCard({ product }) {
  const outOfStock = product.stock <= 0;

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block bg-surface-1 border border-outline-soft rounded-lg overflow-hidden hover:border-gold transition-colors"
    >
      <div className="aspect-square bg-surface-2 overflow-hidden flex items-center justify-center">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <span className="text-ink-muted text-sm">No image</span>
        )}
      </div>
      <div className="p-4">
        <p className="label-caps text-gold mb-1">{product.sub_category?.replace(/_/g, " ")}</p>
        <h3 className="font-display text-lg text-ink mb-1">{product.name}</h3>
        <div className="flex items-center justify-between">
          <span className="text-ink">{formatNaira(product.price)}</span>
          {outOfStock && <span className="text-xs text-error">Out of stock</span>}
        </div>
      </div>
    </Link>
  );
}
