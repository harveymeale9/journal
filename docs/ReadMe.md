
All projects
Reality Manual
We're co-creating an interactive digital book (that is to be displayed on desktop, tablet, and mobile responsively). You're helping me with the book design, typesetting, images, animations etc.



How can I help you today?


Recents
Simplifying page numbering across devices
4 hours ago
SVG coin flip with blank sides
23 hours ago
ChatGPT image dimensions for book illustrations
yesterday
Mobile site margins and font size adjustment
yesterday
Responsive template styling for multi-device layouts
2 days ago
Continuing previous discussion
2 days ago
Instructions
How we work When I ask for a new page, I'll give you the text, any images, and notes on arrangement. You: Follow DESIGN-CONVENTIONS.md and copy shapes from page-template.html. Check the word budget first (§1 of the conventions). If it doesn't fit, say so and propose a split across two pages — never shrink type to compensate. Give me the finished pages/<slug>.html as a file I can download. Tell me the exact line to add to book.json and where it goes. Flag any image I need to drop into assets/images/. Slugs describe content, not position: entry-03-mirror-principle-opening, not page-30. Lowercase, hyphens, no numbers-as-position. Pages come in twos. On desktop, even indices sit left, odd sit right. Inserting one page flips every page after it to the opposite side — so nothing may depend on its neighbour. Tell me if a spread is meant to be read as a pair. Guardrails Don't restructure. The split into pages/css/js was deliberate and verified. Don't consolidate, don't add a build step, don't introduce dependencies. Don't regenerate index.html. It's a fixed shell. New pages never touch it. Don't edit css/ to suit one page. One-offs go in css/pages.css; a rule used twice gets promoted to components.css. Don't invent classes. If a page needs a form that doesn't exist, say so and we'll decide together — an unstyled class renders as naked text. Don't hand me the whole file when a line changed. Small diffs, small files: that's the entire point of the structure. Ask before assuming. If the arrangement is ambiguous, one question beats a page I have to send back. HOW TO ACCESS FILES/STYLESHEETS: visit https://realitymanual.com/css/NAMEOFSTYLESHEET.css here You have: https://realitymanual.com/css/animations.css https://realitymanual.com/css/base.css https://realitymanual.com/css/book.css https://realitymanual.com/css/components.css https://realitymanual.com/css/pages.css https://realitymanual.com/css/page-turn.css https://realitymanual.com/css/responsive.css https://realitymanual.com/css/tokens.css https://realitymanual.com/css/typography.css https://realitymanual.com/css/ui.css You may also access JS files here: https://realitymanual.com/js/book.js https://realitymanual.com/js/jump.js https://realitymanual.com/js/loader.js https://realitymanual.com/js/main.js https://realitymanual.com/js/page-turn.js

Files
1% of project capacity used

DESIGN-CONVENTIONS.md
369 lines

md



page-template.html
220 lines

html



PROJECT-CONTEXT.md
130 lines

md



README.md
207 lines

md


README.md


# The Reality Manual
 
A digital grimoire: a 3D page-turning book on desktop, a scrollable stack of
leaves on mobile. No build step, no dependencies, no framework — static files a
browser reads directly.
 
---
 
## The one idea
 
**`book.json` is the book.** Everything else is loose parts.
 
```json
{
  "order": [
    "frontispiece-first-sigil",
    "title-page",
    "contents",
    "entry-01-attention-opening"
  ],
  "drafts": []
}
```
 
That list, top to bottom, *is* the running order. Each entry is a filename in
`/pages`, minus the `.html`. Pages are named for **what they say**, never for
where they sit — so nothing is ever renumbered.
 
| You want to…            | You do…                                                        |
|-------------------------|----------------------------------------------------------------|
| Insert a page anywhere  | Drop its slug into `order` at that spot. Nothing else changes.  |
| Reorder                 | Move slugs around in `order`.                                   |
| Pull a page, keep the file | Move its slug from `order` into `drafts`.                    |
| Delete a page           | Remove the slug, delete the file.                               |
| Rename a page's subject | Rename the file *and* its slug in `order`.                      |
 
Page numbers, folio numerals (roman for front/back matter, arabic for the body),
the "of 29" total, and the reader's saved place all follow from `order`
automatically. **Never hand-type a page number anywhere.**
 
---
 
## Layout
 
```
index.html          ~4 KB shell: <head>, the book's DOM skeleton, nothing else
book.json           THE RUNNING ORDER — the only file that knows about sequence
 
pages/              one file per leaf, named for its content
  contents.html
  entry-02-wellbeing-heaven-on-earth.html
  ...                                        29 files, ~1 KB each
 
css/                loaded in this order by index.html
  tokens.css        palette, page size, timings — every other sheet reads these
  base.css          reset, the desk, ambient glow, site title, load-error notice
  book.css          the tome: covers, spine, gutter, gilded page block, parchment
  typography.css    what's printed on a page: heads, body, dropcaps, marginalia
  components.css    reusable page forms: laws, pull quotes, tables, lexicons
  animations.css    every @keyframes in the book, plus the classes that ride them
  page-turn.css     the flipping leaf and its shading
  ui.css            the jump-to-page badge and numpad
  pages.css         one-off rules for a single named page
  responsive.css    tablet tweaks, the mobile scroll mode, reduced motion — LAST
 
js/                 ES modules
  main.js           bootstrap: load, wire controls, open the book
  loader.js         reads book.json, fetches pages, resolves partials, numbers folios
  book.js           shared state, rendering, position memory
  page-turn.js      the single turn and the multi-page flutter
  jump.js           the numpad
 
assets/
  images/           raster plates (.webp/.png) — see assets/images/README.md
  svg/              shared vector partials (sigil.svg)
 
docs/
  DESIGN-CONVENTIONS.md   the house style: colour, type, spacing, what's forbidden
  page-template.html      annotated skeleton + every page form, ready to copy
 
tools/check.py      validates book.json against /pages before you push
```
 
## Writing new pages
 
Read `docs/DESIGN-CONVENTIONS.md` first, and copy from `docs/page-template.html`.
Those two files are the brief: hand them to anyone (or any model) writing a page,
along with the text and images, and the result should need no correction.
 
The single rule worth memorising: **pages clip, they don't scroll.** ~150 words on
a plain page, ~115 on an entry opening. Overflow is silently invisible.
 
---
 
## Running it
 
The pages are fetched at runtime, and browsers **block `fetch` over `file://`**.
Double-clicking `index.html` will show a "the book must be served" notice instead
of the book. That's expected. Serve it:
 
```bash
python3 -m http.server 8000
# then open http://localhost:8000
```
 
GitHub Pages serves over HTTP, so a deploy needs no special handling — push to
`main`, enable Pages on the repo root, done.
 
---
 
## Writing a page
 
A page file is a fragment, not a document — no `<html>`, no `<head>`. It must
have exactly one `.page-inner` wrapper:
 
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
 
The top comment is stripped before the page reaches the DOM — it's a note to
whoever opens the file.
 
`<span class="folio" data-num="arabic">` is a *placeholder*. Leave it empty;
`loader.js` fills in the numeral based on position. Use `data-num="roman"` for
front and back matter.
 
Then add `entry-03-mirror-principle-opening` to `order` in `book.json`, and run
`python3 tools/check.py`.
 
**Pages come in twos.** On desktop, even indices land on the left of a spread,
odd on the right. Inserting one page shifts every page after it to the opposite
side — which matters for anything designed as a facing pair.
 
### Partials
 
Markup shared by several pages lives in `assets/` and is pulled in with:
 
```html
{{> svg/sigil.svg }}
```
 
This *inlines* the file. That's deliberate for SVG: our stylesheet animates the
sigil's innards (`.sigil-rotate`, `.sigil-pulse`), and CSS can't reach inside an
`<img src="...svg">`. Use `<img>` for static raster plates, a partial for
anything the stylesheet needs to touch.
 
---
 
## Why it's split this way
 
The whole point is that **you only ever open a small file.** Fixing a typo in one
leaf means opening a 1 KB page, not scrolling a 90 KB monolith — and if you're
handing files to an AI to edit, you paste the one file that matters:
 
| Task                          | Files to touch                      |
|-------------------------------|-------------------------------------|
| Fix wording on a page         | that one `pages/*.html`             |
| Add / insert / reorder pages  | `book.json` (+ the new page file)   |
| Change the palette            | `css/tokens.css`                    |
| Adjust an animation           | `css/animations.css`                |
| Change how a turn feels       | `css/page-turn.css` + `js/page-turn.js` |
| Restyle body text or headings | `css/typography.css`                |
 
A note on the CSS split: it's by **concern, not by breakpoint**. A
desktop/tablet/mobile split sounds tidy but scatters each component's rules
across three files, so changing the book means opening all three. Here, the book
is in `book.css` — including its media queries. `responsive.css` is the exception
and earns it, because mobile isn't a resize: it abandons the 3D book entirely for
a scrollable stack.
 
---
 
## How this was migrated
 
Split out of a single 89 KB `index.html`, mechanically rather than by hand, and
verified: all 163 CSS rule blocks survive exactly once, and all 29 pages
round-trip byte-identically. Behaviour was checked in a real browser — turning,
the numpad, folio numbering, position memory, and the mobile scroll mode.
 
Four things changed on purpose:
 
1. **Pages became files.** They were template literals in a JS array. Their
   comment numbering had already drifted out of sync (`/* 14 */` was followed by
   `/* 7 */`), which is exactly the problem `book.json` removes.
2. **The slug replaced a content hash.** Reader position used to be keyed on an
   FNV-1a hash of a page's HTML, so that editing the book didn't lose someone's
   place. A stable filename does that job better — and survives editing the
   page's text, which the hash did not.
3. **The sigil became a partial.** It was a JS variable, widened on the
   frontispiece by string-replacing its `class` attribute. It's now
   `assets/svg/sigil.svg`, with the frontispiece's size set by
   `.frontispiece .plate` in `css/pages.css`. Renders identically.
4. **Image paths moved** to `assets/images/`.
Nothing visual changed.
 
