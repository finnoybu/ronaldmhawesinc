# Ronald M. Hawes Inc. — Website Redesign Mockup

A modern, multi-page redesign concept for [ronaldmhawesinc.com](https://ronaldmhawesinc.com),
a custom home builder and general contractor serving Loudoun County, Virginia.

Built as a static site for client review and as the basis for the production build.

## Pages

| File | Page |
|------|------|
| `index.html` | Home — hero, services overview, values, stats, about, testimonials, CTA |
| `services.html` | Services — detailed sections for all six service lines |
| `portfolio.html` | Portfolio — filterable project gallery |
| `contact.html` | Contact — consultation form, business info, financing |
| `styles.css` | Shared design system (warm custom-home aesthetic) |

## Design direction

Warm, premium custom-home look — charcoal and brass/amber palette, Playfair Display
serif headlines over Inter body text, large imagery. Fully responsive.

## Local preview

It's a plain static site — no build step. Open `index.html` in a browser, or serve the
folder:

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Notes

- Project photos are placeholders pulled from the existing site; final build will use
  professional finished-project photography.
- The "Design Mockup · For Client Review" tag in the corner is intentional and should be
  removed before production launch.

---

© 2026 Ronald M. Hawes Inc. Design by Ken Tannenbaum.
