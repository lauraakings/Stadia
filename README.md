# STADIA° WHERE — static brand website

A complete, responsive, non-commerce website built from the supplied STADIA° identity and T-shirt artwork.

## What is included

- `index.html` — the complete one-page brand website
- `styles.css` — responsive layout, typography, animation and mobile navigation
- `script.js` — restrained reveal motion, navigation state and accessible mobile menu
- `404.html` — branded error page
- `assets/` — optimised WebP images, JPEG fallbacks, favicon and social-sharing image
- `site.webmanifest`, `robots.txt`, `sitemap.xml` — basic launch and search-engine files

There is no shop, payment system, tracking script, cookie, external font or third-party JavaScript dependency.

## Uploading the site

Upload the **contents** of this folder to the public/root folder supplied by the hosting company. The home page must remain named `index.html`.

The site can be hosted on a normal cPanel/FTP account or a static host such as Netlify, Cloudflare Pages or GitHub Pages. No build command is required.

## Items to check before launch

1. The site currently uses `https://stadiawhere.com/` as its canonical address. Change it in `index.html`, `robots.txt` and `sitemap.xml` if the final domain differs.
2. The contact link is `hello@stadiawhere.com`. Replace that address in `index.html` if a different inbox will be used.
3. The legal footer states that STADIA° is independent and not affiliated with football clubs, leagues or governing bodies.
4. Image files are already compressed and delivered responsively; keep the filenames unchanged unless the matching HTML/CSS references are updated.

## Editing the words

All visible wording is contained in `index.html`. Search for the heading or sentence to replace it. The page structure and styling do not require a content-management system.
