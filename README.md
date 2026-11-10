# Pulse online

The interactive web edition of **Nedgroup Investments Pulse**, the quarterly market and unit trust review. This repository hosts the client preview on GitHub Pages.

## What's here

| File | Purpose |
|---|---|
| `index.html` | The page: layout, styles, animation logic and the quarterly content block |
| `runtime.js` | Small renderer that draws the page from the template in `index.html` |
| `assets/` | Cover image, logos, cartoon, pillar photos and remaining chart images |

## Updating each quarter

All quarterly figures and copy live in one place: the `content()` block near the top of the script in `index.html`. The layout never changes, so a new issue means replacing that block and swapping the cover and cartoon images in `assets/`.

The page is designed and maintained in the Pulse design canvas; this site is built from it.

## Viewing locally

Any static server works, for example:

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Note

This is a prototype for client review. It is not indexed by search engines (`noindex`).
