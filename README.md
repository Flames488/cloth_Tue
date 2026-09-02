# Tue Collection

A static marketing site for a streetwear clothing brand — home, shop & sizing, about, and contact pages.

## Structure

- `index.html` — homepage
- `services.html` — shop grid + size & price guide
- `about.html` — company story, dark hero treatment
- `contact.html` — contact form + info
- `styles.css` — shared design system (colors, buttons, cards, responsive breakpoints)

No build step or dependencies — open `index.html` directly in a browser, or serve the folder with any static file server.

## Before going live

Several placeholders still need real values — search each HTML file for bracketed text:

- `[YOUR PHONE NUMBER]`, `[YOUR BUSINESS HOURS]`, `[YOUR EMAIL]`, `[YOUR ADDRESS]`
- `[PRICE]` in the size & price guide
- `[X,XXX]+ clients` trust stat on the homepage
- `[YOUR DOMAIN]` — replace with your real domain everywhere it appears: the `<link rel="canonical">`, Open Graph/Twitter `og:url` and `og:image`/`twitter:image` tags, the JSON-LD structured data in each page's `<head>`, and in `robots.txt` / `sitemap.xml`

The contact form (`contact.html`) is markup only — it doesn't submit anywhere yet and needs a backend or form service wired up.

"FAQ" (site-wide) and "View Lookbook" (about.html) are placeholder links (`#`) since those pages/features haven't been built yet.

## SEO

Each page now has a unique title, meta description, keywords, canonical URL, Open Graph + Twitter Card tags, a theme color, an SVG favicon (`img/favicon.svg`), and JSON-LD structured data (`ClothingStore` on the homepage, `BreadcrumbList` on every page). A `robots.txt` and `sitemap.xml` are included at the root — update the `[YOUR DOMAIN]` placeholder in both once the site has a real domain, and resubmit the sitemap in Google Search Console after launch.
