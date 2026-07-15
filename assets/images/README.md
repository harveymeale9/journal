# Images

Raster plates (`.webp` / `.png`) referenced by pages via:

```html
<img class="plate-img" style="width:64%" src="assets/images/your-plate.webp" alt="...">
```

`.plate-img` uses `mix-blend-mode: multiply`, which prints the artwork *into*
the parchment rather than pasting a white rectangle on top of it. Export plates
on a **white background** and let the blend mode do the work — a transparent PNG
also works, but white is smaller and blends identically here.

Prefer `.webp` for photographic or painted plates. Keep `.svg` in `assets/svg/`
instead when the art is line-based, and inline it as a partial if it animates.

## ⚠ Two files need restoring here

These were referenced from the old single-file build and aren't in this repo —
copy them from your old project folder into **this directory**:

| File                    | Used by                                         |
|-------------------------|-------------------------------------------------|
| `entry-02-plate-1.webp` | `pages/entry-02-wellbeing-opening.html`          |
| `c1.png`                | `pages/entry-02-wellbeing-the-tide-of-a-life-chart.html` |

Their paths were rewritten from bare `src="c1.png"` to `src="assets/images/c1.png"`
during the split, so dropping the files in here is all that's needed.

Run `python3 tools/check.py` to confirm nothing is still missing.
