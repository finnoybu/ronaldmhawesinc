# Ronald M. Hawes Inc. — Website Redesign Concepts

Modern redesign concepts for [ronaldmhawesinc.com](https://ronaldmhawesinc.com), a custom
home builder and general contractor serving Loudoun County, Virginia.

Each concept is a self-contained static site in its own folder. The root page is a landing
menu linking to every concept.

## Structure

```
/                  Landing page — concept selector (index.html)
/site1/            Concept 1 — "Heritage Craft" (warm custom-home aesthetic)
/site2/            Concept 2 — "Modern Luxury" (bright/airy; live estimator, lightbox, build timeline)
/site3/            Concept 3 — "Heritage Estate" (classic navy & cream; logo-forward, formal)
/assets/           Shared brand assets (logo.png)
/site3/            Concept 3 — (planned)
/site4/            Concept 4 — (planned)
```

Live concept URLs follow the pattern:

```
https://finnoybu.github.io/ronaldmhawesinc/site1/
https://finnoybu.github.io/ronaldmhawesinc/site2/
...
```

## Each concept folder

| File | Page |
|------|------|
| `index.html` | Home |
| `services.html` | Services |
| `portfolio.html` | Portfolio |
| `contact.html` | Contact |
| `styles.css` | That concept's design system |

All internal links are relative, so concept folders are fully portable.

## Local preview

No build step. Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8000   # then visit http://localhost:8000
```

## Adding a new concept

1. Copy an existing concept folder: `site1` → `site2`.
2. Restyle / rebuild within `site2/`.
3. Add a card linking to `site2/index.html` in the root `index.html`.
4. Commit and push — Pages picks it up automatically.

## Notes

- Project photos in Concept 1 are placeholders; the production build will use professional
  finished-project photography.
- The "Design Mockup · For Client Review" tag is intentional and is removed before launch.

---

© 2026 Ronald M. Hawes Inc. Design by Ken Tannenbaum.
