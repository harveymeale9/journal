
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


PROJECT-CONTEXT.md


# The Reality Manual — Project Context
 
**Read this first.** It's the orientation. The other two documents in this
project are the working brief:
 
| Document | What it's for |
|---|---|
| **PROJECT-CONTEXT.md** (this file) | what the project is, how the repo works, how we work |
| **DESIGN-CONVENTIONS.md** | the house style — colour, type, spacing, ornament, what's forbidden |
| **page-template.html** | annotated skeleton + every page form, ready to copy |
 
Repo: `https://github.com/<USERNAME>/<REPO>`
Live: `https://<USERNAME>.github.io/<REPO>/`
 
---
 
## What this is
 
*The Reality Manual* is a digital grimoire — a book about attention, emotional
well-being, and the architecture of experience, presented as an illuminated
manuscript. On desktop it's a 3D book you turn page by page; on a phone it's a
vertical scroll of single leaves. It grows entry by entry: the living edition.
 
It is a **static site**. No build step, no framework, no dependencies, no server
code. Plain HTML, CSS, and ES modules that a browser reads directly. Keep it that
way — proposals involving React, Tailwind, npm, or a bundler are wrong for this
project. It is deliberately something one person can open and understand.
 
The aesthetic is a candlelit desk at night: aged parchment, oxblood rubrication,
brass ornament. Nothing in it is pure black or pure white.
 
---
 
## How the repo works
 
```
index.html      4 KB shell — <head> and the book's DOM skeleton. Nothing else.
book.json       THE RUNNING ORDER. This list, top to bottom, IS the book.
pages/          one file per leaf, named for its content, ~1 KB each
css/            tokens, base, book, typography, components, animations,
                page-turn, ui, pages, responsive  (loaded in that order)
js/             main, loader, book, page-turn, jump  (ES modules)
assets/images/  raster plates (.webp/.png)
assets/svg/     shared vector partials, inlined via {{> svg/sigil.svg }}
docs/           the three documents above
tools/check.py  validates book.json against /pages
```
 
**Five things that explain almost everything:**
 
1. **`book.json` is the book.** Pages are named for *what they say*
   (`entry-02-wellbeing-heaven-on-earth.html`), never for where they sit.
   Order lives only in `book.json`. Inserting a page is one line there — no file
   is renamed, no other page is touched.
2. **Page numbers are derived, never typed.** Folios, the "of 29" total, and the
   reader's saved place all follow from `book.json`. A hard-typed number becomes
   a lie on the next insert. Refer to entries by *name*, always.
3. **Pages clip. They don't scroll.** `.page-inner` is `overflow:hidden`.
   Overflow is silently invisible — no warning, no truncation. This is the only
   way to really break the book. ~150 words on a plain page, ~115 on an entry
   opening. Count before writing.
4. **Type scales with the page, not the screen.** Everything is
   `calc(var(--page-w) * n)`. That's why there's *one* page fragment for all
   devices — no desktop/mobile variants exist, and none should be created.
5. **It must be served, not opened.** Pages are fetched at runtime, so `file://`
   shows an error notice by design. `python3 -m http.server 8000` locally;
   GitHub Pages in production.
---
 
## How we work
 
**When I ask for a new page**, I'll give you the text, any images, and notes on
arrangement. You:
 
1. Follow `DESIGN-CONVENTIONS.md` and copy shapes from `page-template.html`.
2. **Check the word budget first** (§1 of the conventions). If it doesn't fit,
   say so and propose a split across two pages — never shrink type to compensate.
3. Give me the finished `pages/<slug>.html` as a file I can download.
4. Tell me the exact line to add to `book.json` and where it goes.
5. Flag any image I need to drop into `assets/images/`.
**Slugs** describe content, not position: `entry-03-mirror-principle-opening`,
not `page-30`. Lowercase, hyphens, no numbers-as-position.
 
**Pages come in twos.** On desktop, even indices sit left, odd sit right.
Inserting one page flips every page after it to the opposite side — so nothing
may depend on its neighbour. Tell me if a spread is meant to be read as a pair.
 
---
 
## Guardrails
 
- **Don't restructure.** The split into pages/css/js was deliberate and verified.
  Don't consolidate, don't add a build step, don't introduce dependencies.
- **Don't regenerate `index.html`.** It's a fixed shell. New pages never touch it.
- **Don't edit `css/` to suit one page.** One-offs go in `css/pages.css`;
  a rule used twice gets promoted to `components.css`.
- **Don't invent classes.** If a page needs a form that doesn't exist, say so and
  we'll decide together — an unstyled class renders as naked text.
- **Don't hand me the whole file when a line changed.** Small diffs, small files:
  that's the entire point of the structure.
- **Ask before assuming.** If the arrangement is ambiguous, one question beats a
  page I have to send back.
---
 
## Style of collaboration
 
Be direct. If something I've asked for is a bad idea — it won't fit, it fights the
conventions, it hard-codes a number — say so plainly and propose the alternative.
I'd rather be corrected than handed something that breaks quietly three pages later.
 
Don't pad. Don't re-explain what I already know. If a page is done, hand it over
and tell me where it goes.
 
---
 
## Current state
 
*(Edit this as things change — it's the bit that goes stale.)*
 
- 29 pages live. Entries I and II written; III–VI sealed or forthcoming.
- The appendix ("Specimen Leaves") is a working catalogue of page forms.
- The sealed page's checkout button is still a placeholder `alert()`.
 
