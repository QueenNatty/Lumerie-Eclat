/**
 * All the "writeups" (copy) and placeholder images for the storefront
 * live here in one file, so they can be edited without touching page
 * logic. See CUSTOMIZATION.md's "Editing text and images" section.
 */

export const siteName = "LUMERIE ÉCLAT";

export const hero = {
  eyebrow: "Curated Selections",
  title: "Timeless Elegance,\nHandcrafted for You.",
  subtitle:
    "Discover a curated world of artisanal luxury, where every piece tells a story of craftsmanship and ethereal beauty.",
  primaryCta: { label: "Explore Collections", href: "/shop" },
  secondaryCta: { label: "Our Story", href: "/about" },
  // Paste any public image URL here to show a hero image/banner instead of the crown mark.
  image: "",
};

export const categories = [
  {
    label: "Jewelry",
    sub: "Exquisite Gems & Metals",
    href: "/shop?main_category=jewelry",
    image: "",
  },
  {
    label: "Crochet Vests",
    sub: "Artisanal Weaves",
    href: "/shop?main_category=crochet&sub_category=vests",
    image: "",
  },
  {
    label: "Beanies",
    sub: "Cashmere Comfort",
    href: "/shop?main_category=crochet&sub_category=beanies",
    image: "",
  },
  {
    label: "Watches",
    sub: "Precision & Grace",
    href: "/shop?main_category=jewelry&sub_category=watches",
    image: "",
  },
];

// Shown in the "Why Lumerie Éclat" strip on the homepage.
export const valueProps = [
  {
    title: "Handcrafted, Not Mass-Produced",
    body: "Every piece is made or finished by hand — small batches, close attention, no two exactly alike.",
  },
  {
    title: "Nationwide Delivery",
    body: "We ship to every state in Nigeria, with tracking on every order from checkout to your door.",
  },
  {
    title: "Secure Checkout",
    body: "Your account and orders are protected — we never store payment details on our servers.",
  },
  {
    title: "Easy Returns",
    body: "Not the right fit? Reach out within 7 days of delivery and we'll sort it out.",
  },
];

// Homepage "Our Story" teaser — full version lives on the /about page.
export const storyTeaser = {
  eyebrow: "Our Story",
  title: "Made with intention, worn with pride.",
  body: "Lumerie Éclat began as a small studio dedicated to one idea: that jewelry and crochet pieces should feel personal, not manufactured. Every collection is designed and finished by hand, drawing on traditional techniques and modern silhouettes.",
  cta: { label: "Read Our Full Story", href: "/about" },
  image: "",
};

export const aboutPage = {
  title: "Our Story",
  intro:
    "Lumerie Éclat is a Nigerian studio creating handcrafted jewelry and crochet pieces for people who want what they wear to mean something.",
  sections: [
    {
      heading: "Where We Started",
      body: "Lumerie Éclat began in a small studio with a simple belief — that beautifully made things shouldn't be out of reach. What started as one-off pieces made for friends grew into a full collection of jewelry and crochet work, each piece still made the same way: by hand, with care, in small batches.",
    },
    {
      heading: "How We Work",
      body: "Every jewelry piece is finished by hand, and every crochet item is made stitch by stitch — no mass production, no shortcuts. We work in small runs, which means stock is limited, but quality never is.",
    },
    {
      heading: "Our Promise",
      body: "We stand behind everything we make. If a piece isn't right, our returns policy has you covered, and our team is always reachable if you have questions before or after you order.",
    },
  ],
};

export const policiesPage = {
  title: "Policies",
  intro: "Everything you need to know about shopping with Lumerie Éclat.",
  sections: [
    {
      heading: "Shipping",
      body: "We deliver nationwide across Nigeria. Orders are typically processed within 1–2 business days, with delivery times varying by location. You'll receive updates as your order moves from Confirmed to Shipped to Delivered.",
    },
    {
      heading: "Returns & Exchanges",
      body: "If something isn't right, contact us within 7 days of delivery. Items must be unworn and in their original condition. Reach out through your account or our contact details below to start a return.",
    },
    {
      heading: "Order Cancellations",
      body: "You can cancel an order yourself from the 'My Orders' page as long as it's still Pending or Confirmed. Once an order has shipped, it can no longer be cancelled — please start a return instead.",
    },
    {
      heading: "Payment & Security",
      body: "We never store your payment details on our servers. Your account is protected, and only you can view or manage your own orders.",
    },
  ],
};

// Shown in a strip near the bottom of the homepage.
export const policyHighlights = [
  { label: "Nationwide Delivery", href: "/policies" },
  { label: "7-Day Returns", href: "/policies" },
  { label: "Secure Checkout", href: "/policies" },
];

export const footerBlurb =
  "Crafting ethereal beauty for the discerning eye. Each piece is a unique expression of art and luxury.";

export const contact = {
  email: "hello@lumerieeclat.com",
  phone: "+234 000 000 0000",
  instagram: "@lumerie.eclat",
};
