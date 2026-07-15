#!/usr/bin/env python3
"""Check the book is consistent before you push.

    python3 tools/check.py

Catches the mistakes that are otherwise a blank page and a console error:
a slug in book.json with no file, a page file nobody lists, a missing image,
a partial that doesn't resolve, a duplicate slug.
"""
import json, os, re, sys

ROOT  = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = os.path.join(ROOT, "pages")

problems, notes = [], []

# ---- book.json -------------------------------------------------------------
try:
    book = json.load(open(os.path.join(ROOT, "book.json"), encoding="utf-8"))
except Exception as e:
    print(f"✗ book.json is not valid JSON: {e}")
    sys.exit(1)

order  = book.get("order", [])
drafts = book.get("drafts", [])

if not order:
    problems.append('book.json has an empty "order" — the book has no pages')

dupes = {s for s in order if order.count(s) > 1}
for s in dupes:
    problems.append(f'"{s}" is listed more than once in order')

overlap = set(order) & set(drafts)
for s in overlap:
    problems.append(f'"{s}" is in both order and drafts — pick one')

# ---- every listed slug has a file ------------------------------------------
for slug in order + drafts:
    if not os.path.exists(os.path.join(PAGES, slug + ".html")):
        problems.append(f'book.json lists "{slug}" but pages/{slug}.html does not exist')

# ---- every file is listed somewhere ----------------------------------------
on_disk = {f[:-5] for f in os.listdir(PAGES) if f.endswith(".html")}
for slug in sorted(on_disk - set(order) - set(drafts)):
    notes.append(f'pages/{slug}.html exists but book.json never lists it (invisible)')

# ---- assets referenced by pages actually exist -----------------------------
for slug in sorted(on_disk):
    html = open(os.path.join(PAGES, slug + ".html"), encoding="utf-8").read()

    for src in re.findall(r'src="([^"]+)"', html):
        if src.startswith(("http://", "https://", "data:")):
            continue
        if not os.path.exists(os.path.join(ROOT, src)):
            problems.append(f'{slug}.html points at "{src}" which is missing')

    for part in re.findall(r'\{\{>\s*([\w./-]+)\s*\}\}', html):
        if not os.path.exists(os.path.join(ROOT, "assets", part)):
            problems.append(f'{slug}.html includes partial "{part}" which is missing')

    if "${" in html:
        problems.append(f'{slug}.html still contains ${{...}} template syntax')

    if not html.lstrip().startswith("<!--") and '<div class="page-inner' not in html:
        problems.append(f'{slug}.html has no .page-inner wrapper — it will render blank')

# ---- report ----------------------------------------------------------------
print(f"{len(order)} pages in the running order, {len(drafts)} draft(s), "
      f"{len(on_disk)} file(s) in /pages\n")

for n in notes:
    print(f"  note  {n}")
for p in problems:
    print(f"  ✗     {p}")

if not problems:
    print("  ✓     the book is consistent" + ("" if not notes else " (see notes above)"))
sys.exit(1 if problems else 0)
