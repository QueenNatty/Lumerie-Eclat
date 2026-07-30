# Customizing Lumerie Éclat Yourself

A guide to the changes you'll want to make most often — no need to touch
component logic for any of these.

## 1. Adding your own product images

Product images are just URLs (`image_url` on each product) — there's no
file upload built in. To use your own photos:

1. Upload the image somewhere public that gives you a direct link —
   easiest free options: [imgur.com](https://imgur.com) (right-click the
   uploaded image → "Copy image address"), Cloudinary, or a folder in
   your own Google Drive set to "Anyone with the link" (use a direct-view
   link, not the share page).
2. Go to `/admin/products` in the site, click **Edit** (or **+ New
   Product**), and paste the URL into the **Image URL** field.
3. Save — the image appears immediately on the shop grid and product page.

## 2. Changing the homepage text and images ("writeups")

Open **`lib/site-content.js`**. Everything on the homepage that isn't a
live product comes from this one file:

```js
export const hero = {
  eyebrow: "Curated Selections",       // small label above the headline
  title: "Timeless Elegance,\nHandcrafted for You.",  // \n = line break
  subtitle: "Discover a curated world...",             // paragraph under it
  primaryCta: { label: "Explore Collections", href: "/shop" },
  secondaryCta: { label: "Our Story", href: "/shop" },
  image: "",   // paste a URL here to replace the crown icon with a photo
};

export const categories = [
  { label: "Jewelry", sub: "Exquisite Gems & Metals", href: "/shop?main_category=jewelry", image: "" },
  // ...
];

export const footerBlurb = "Crafting ethereal beauty for the discerning eye...";
export const siteName = "LUMERIE ÉCLAT";
```

Edit any of the text in quotes, or paste an image URL into any `image:
""` field (same "upload somewhere public, paste the link" approach as
above) — save the file and refresh the page.

## 3. Currency

Prices display in Nigerian Naira via `lib/format.js`'s `formatNaira()`
function, used everywhere a price is shown. To change currency later,
that's the only file you'd need to touch:

```js
new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", ... })
```

Product prices are still stored as plain numbers in the database — only
the *display* is Naira-formatted, so no backend change was needed for this.

## 4. Colors (light/dark theme)

All colors are CSS variables in **`app/globals.css`**:

```css
:root { /* light mode */
  --bg: #fcf9f8;
  --gold: #ad8b1f;
  /* ... */
}
.dark { /* dark mode */
  --bg: #131314;
  --gold: #e9c349;
  /* ... */
}
```

Change a hex value there and it updates everywhere that color is used —
no need to hunt through component files.

## 5. Other page text (Shop, Cart, Login, etc.)

Copy on pages other than the homepage lives directly in that page's file
under `app/`, e.g. `app/shop/page.js`, `app/login/page.js`. Look for the
plain text between `<tags>` (like `<h1 className="...">Your Cart</h1>`)
and edit it directly — the surrounding code doesn't need to change.

## 6. After making changes

```bash
npm run dev     # see changes live while editing
npm run build   # check everything still builds before deploying
```
