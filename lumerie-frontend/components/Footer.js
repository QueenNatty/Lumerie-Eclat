import CrownMark from "./CrownMark";
import { footerBlurb, siteName } from "@/lib/site-content";

export default function Footer() {
  return (
    <footer className="border-t border-outline-soft mt-20">
      <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <CrownMark className="w-6 h-4 text-gold" />
            <span className="font-display tracking-[0.15em] text-ink">{siteName}</span>
          </div>
          <p className="text-ink-muted text-sm max-w-xs">{footerBlurb}</p>
        </div>
        <div>
          <p className="label-caps text-ink-muted mb-3">Shopping</p>
          <ul className="space-y-2 text-sm text-ink-muted">
            <li>
              <a href="/shop?main_category=jewelry" className="hover:text-gold">
                Jewelry
              </a>
            </li>
            <li>
              <a href="/shop?main_category=crochet" className="hover:text-gold">
                Crochet
              </a>
            </li>
            <li>
              <a href="/shop" className="hover:text-gold">
                All Collections
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="label-caps text-ink-muted mb-3">Company</p>
          <ul className="space-y-2 text-sm text-ink-muted">
            <li>
              <a href="/about" className="hover:text-gold">
                Our Story
              </a>
            </li>
            <li>
              <a href="/policies" className="hover:text-gold">
                Shipping &amp; Returns
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="label-caps text-ink-muted mb-3">Account</p>
          <ul className="space-y-2 text-sm text-ink-muted">
            <li>
              <a href="/orders" className="hover:text-gold">
                My Orders
              </a>
            </li>
            <li>
              <a href="/login" className="hover:text-gold">
                Sign In
              </a>
            </li>
            <li>
              <a href="/login?next=/admin" className="hover:text-gold">
                Admin Sign In
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-outline-soft py-6 text-center text-xs text-ink-muted tracking-widest2">
        © {new Date().getFullYear()} {siteName}. ALL RIGHTS RESERVED.
      </div>
    </footer>
  );
}
