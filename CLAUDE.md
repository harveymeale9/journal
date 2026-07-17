# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**The Reality Manual** — a digital grimoire: a 3D page-turning book on desktop, a scrollable stack of leaves on mobile. Static files only — no build step, no dependencies, no framework, no `package.json`. `book.json` is the book; everything else is loose parts.

---

## Reality Manual writing style

Full rules live in `docs/DESIGN-CONVENTIONS.md` — read it before writing or editing any page content, alongside `docs/page-template.html`. It's deliberately dense and is meant to be pasted in full alongside a writing request. Highlights:

- **Voice and mood**: a candlelit desk at night, a medieval manuscript rubricated by hand. Warm, low-key, aged prose. Nothing pure black or pure white, literally or tonally.
- **Word budgets are load-bearing, not stylistic.** A page is a fixed box that clips — it does not scroll. Text past the bottom edge is silently invisible. Aim for **~150 words** on a plain body page, **~115 words** on an entry opening, and budget ~10% under so nothing breaks when web fonts load slightly wider than fallback. Count words before writing, not after.
- **Three type faces, one job each**: IM Fell English SC (small caps) for structure — running heads, entry numbers/titles, dropcaps, law names; IM Fell English for continuous prose (`.body-text`); Cormorant Garamond italic for the aside — marginalia, captions, folios, pull quotes.
- **Colour carries meaning, not decoration.** `--rubric` (oxblood) marks *structure* — entry numbers, dropcaps, cross-references, the seal. `--brass` (gold) marks *ornament only* — rules, flourishes, numerals. Never swap them, never write a raw hex value into a page.
- **Ornaments are punctuation, not decoration**: `❦` ends a page/thought, `✦ ✦ ✦` breaks a section, `✦` is a lighter beat. At most one per page.
- **No footnotes.** Use `.marginal` (the manuscript gloss) instead — one per page, under ~25 words, placed after the `.body-text` it comments on.
- **Never refer to a page number in prose, a folio, or a cross-reference.** Numbers are derived from `book.json`'s order and become a lie the moment a page is inserted. Refer to entries by name.
- **Never invent a class or restyle an existing one for one page** — use `css/pages.css` for one-off page rules instead.

---

## Chapter / page editing conventions

**`book.json`'s `order` array is the single source of truth for the book's sequence.** Each slug in it is a filename in `/pages` minus `.html`. Pages are named for *what they say*, never for where they sit, so nothing is ever renumbered when the book is reordered.

| You want to… | You do… |
|---|---|
| Insert a page anywhere | Drop its slug into `order` at that spot. Nothing else changes. |
| Reorder | Move slugs around in `order`. |
| Pull a page but keep the file | Move its slug from `order` into `drafts`. |
| Delete a page | Remove the slug from `order`/`drafts`, delete the file. |
| Rename a page's subject | Rename the file *and* its slug in `order`. |

Page numbers, folio numerals (roman for front/back matter, arabic for the body), the "N of total" count, and the reader's saved reading position are all derived from `order` at load time — never hand-typed.

**Pages come in facing pairs on desktop** (even index = left page, odd index = right page). Inserting one page shifts every later page to the opposite side of the spread — never design a page assuming a specific neighbour, and never build content that depends on being seen alongside the page before/after it.

After editing `book.json` or any page file, validate before committing:

```bash
python3 tools/check.py
```

This catches: a slug in `order`/`drafts` with no matching file, a page file nobody lists (invisible), a slug listed twice, a slug in both `order` and `drafts`, a missing image or partial reference, leftover `${...}` template syntax, and a missing `.page-inner` wrapper. There is no other automated check in this repo — this script is it.

---

## Deployment workflow

No build step. Deployment is GitHub Pages via `.github/workflows/static.yml`, triggered on push to `main`, which uploads the repo root as-is. Because GitHub Pages serves over real HTTP, the site works there with zero special handling.

**Local development** requires an actual HTTP server, because pages are fetched at runtime with `fetch()` and browsers block `fetch` over `file://`. Double-clicking `index.html` shows a "the book must be served" notice instead of the book — that's expected, not a bug.

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Before pushing: run `python3 tools/check.py` to catch broken references, then verify in an actual browser — page turning, the jump-to-page numpad, folio numbering, and (at a narrow viewport) the mobile scroll mode, since none of that is covered by an automated test.

---

## HTML structure

`index.html` is a ~4 KB shell — `<head>`, the book's DOM skeleton, nothing else. It knows nothing about page content or order.

Each file in `/pages` is an HTML **fragment**, not a document:

```html
<!-- entry-03-mirror-principle-opening
     Entry III, opening: the mirror as instrument -->
<div class="page-inner" style="position:static">
  <p class="running-head">The Reality Manual</p>
  <p class="entry-no">Entry the Third</p>
  <h2 class="entry-title">The Mirror<br>Principle</h2>
  <p class="ornament">✦ ✦ ✦</p>
  <div class="body-text">
    <p class="dropcap">Every judgment describes the judge before the judged…</p>
  </div>
  <span class="folio" data-num="arabic"></span>
</div>
```

Rules that make this load correctly:
- **No `<html>`, `<head>`, or `<body>` tags** — it's inlined into the running book, not rendered standalone.
- **Exactly one `.page-inner` wrapper per file**, with `style="position:static"`.
- **Exactly one `<span class="folio" data-num="arabic"></span>` (or `data-num="roman"`)**, empty, as the last element. `loader.js` fills in the actual numeral based on the page's position in `order` — never type a numeral by hand.
- **The leading HTML comment is a note to editors, not markup** — `loader.js` strips it before the fragment reaches the DOM.
- **Shared markup** (e.g. the sigil) lives under `assets/` and is pulled in with `{{> svg/sigil.svg }}`, which `loader.js` inlines literally into the page HTML. Use a partial (not `<img>`) for anything the stylesheet needs to animate — CSS can't reach inside an externally-referenced `<img src="....svg">`. Use plain `<img>` for static raster plates.

CSS loads in a fixed order from `index.html`, split by *concern* rather than by breakpoint: `tokens.css` → `base.css` → `book.css` → `typography.css` → `components.css` → `animations.css` → `page-turn.css` → `ui.css` → `pages.css` → `responsive.css` (always last, since mobile replaces the 3D book with a scrollable stack rather than resizing it).

---

## Preserving book functionality

The load pipeline (`js/loader.js` → `js/book.js` → `js/main.js`) depends on strict conventions holding across every page file. Breaking any of these produces a blank page or a silent layout failure rather than a loud error:

1. **Never hand-type a page number, hex colour, or font-family/size in `px`/`rem`/`em` on a page.** Numbers come from `book.json`'s order; colours and sizes come from tokens and classes in `css/tokens.css` / `css/typography.css`. Hard-typed values silently drift out of sync on the next reorder or font change.
2. **Never let a page overrun.** `.page-inner` is `overflow:hidden` — content past the bottom edge is not scrolled or warned about, it's simply invisible. This is the one way to actually break the book, and it fails silently, so word budgets (see writing style above) must be respected.
3. **Never invent a class**, and never restyle an existing one to suit a single page — an unstyled class renders as naked text; one-off rules belong in `css/pages.css`.
4. **Keep exactly one `.page-inner`, one empty `.folio`, one dropcap per entry, one ornament per page, one marginal per page, one pull quote per page.** The renderer and stylesheet assume these cardinalities.
5. **Animate SVG only, never text or layout**, and keep motion slow/ambient/looping — nothing reacts to scroll, hover, or click. `prefers-reduced-motion` disables all SVG animation and the page-turn itself, so a plate must still read correctly as a fully static image.
6. **Reader position is keyed by page slug**, not content hash — so editing a page's text is safe, but renaming a slug without updating `book.json` (or vice versa) will silently reset or break position memory.
7. **Run `python3 tools/check.py` after any change to `book.json` or `/pages`** before pushing — it's the only safety net for the invariants above (missing files, missing partials, missing `.page-inner`, duplicate/orphaned slugs, stray template syntax).

---

## Project Awareness

Always attempt to understand the repository before making changes.

When modifying a feature:
- identify all related files
- update all affected files
- preserve existing architecture
- avoid introducing unnecessary complexity

Do not make isolated changes that break repository consistency.

---

## General Principle

When in doubt:

1. Follow the manuscript.
2. Follow existing project patterns.
3. Follow the editing guidelines.
4. Preserve consistency.
5. Ask before making major manuscript changes.

Deployment is GitHub Pages on push to `main` (see Deployment workflow above) — ask before proceeding with major or destructive changes; otherwise, for routine work, assume deployment is the desired end state and no extra confirmation is needed to push.
