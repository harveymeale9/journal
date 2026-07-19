#!/usr/bin/env python3
"""Check the book is consistent before you push.

    python3 tools/check.py

Catches the mistakes that are otherwise a blank page and a console error:
a slug in book.json with no file, a page file nobody lists, a missing image,
a partial that doesn't resolve, a duplicate slug. Checks BOTH book.json (the
public book, served at /) and dev/book.json (the working copy, served at
/dev — see its own _comment) against the same shared /pages directory.
"""
import json, os, re, sys

ROOT  = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = os.path.join(ROOT, "pages")

problems, notes = [], []
all_listed = set()   # union across every book checked, for the "invisible" pass

# ---- one book.json (or dev/book.json) --------------------------------------
def check_book(rel_path):
    path = os.path.join(ROOT, rel_path)
    if not os.path.exists(path):
        return None
    try:
        book = json.load(open(path, encoding="utf-8"))
    except Exception as e:
        problems.append(f"{rel_path} is not valid JSON: {e}")
        return None

    order  = book.get("order", [])
    drafts = book.get("drafts", [])
    all_listed.update(order)
    all_listed.update(drafts)

    if not order:
        problems.append(f'{rel_path} has an empty "order" — that book has no pages')

    dupes = {s for s in order if order.count(s) > 1}
    for s in dupes:
        problems.append(f'"{s}" is listed more than once in {rel_path}\'s order')

    overlap = set(order) & set(drafts)
    for s in overlap:
        problems.append(f'"{s}" is in both order and drafts in {rel_path} — pick one')

    for slug in order + drafts:
        if not os.path.exists(os.path.join(PAGES, slug + ".html")):
            problems.append(f'{rel_path} lists "{slug}" but pages/{slug}.html does not exist')

    return order, drafts

public_result = check_book("book.json")
dev_result    = check_book("dev/book.json")

if public_result is None:
    print("✗ book.json is missing or unreadable — the public book has no pages")
    sys.exit(1)

# ---- every file is listed somewhere (in EITHER book) ------------------------
on_disk = {f[:-5] for f in os.listdir(PAGES) if f.endswith(".html")}
for slug in sorted(on_disk - all_listed):
    notes.append(f'pages/{slug}.html exists but no book.json lists it (invisible)')

# ---- assets referenced by pages actually exist -----------------------------
for slug in sorted(on_disk):
    html = open(os.path.join(PAGES, slug + ".html"), encoding="utf-8").read()

    for src in re.findall(r'src="([^"]+)"', html):
        if src.startswith(("http://", "https://", "data:")):
            continue
        if not os.path.exists(os.path.join(ROOT, src.lstrip("/"))):
            problems.append(f'{slug}.html points at "{src}" which is missing')

    for part in re.findall(r'\{\{>\s*([\w./-]+)\s*\}\}', html):
        if not os.path.exists(os.path.join(ROOT, "assets", part)):
            problems.append(f'{slug}.html includes partial "{part}" which is missing')

    if "${" in html:
        problems.append(f'{slug}.html still contains ${{...}} template syntax')

    if not html.lstrip().startswith("<!--") and '<div class="page-inner' not in html:
        problems.append(f'{slug}.html has no .page-inner wrapper — it will render blank')

# ---- report ----------------------------------------------------------------
pub_order, pub_drafts = public_result
line = f"public: {len(pub_order)} pages, {len(pub_drafts)} draft(s)"
if dev_result is not None:
    dev_order, dev_drafts = dev_result
    line += f"  |  dev: {len(dev_order)} pages, {len(dev_drafts)} draft(s)"
else:
    line += "  |  dev/book.json not present"
print(f"{line}  |  {len(on_disk)} file(s) in /pages\n")

for n in notes:
    print(f"  note  {n}")
for p in problems:
    print(f"  ✗     {p}")

if not problems:
    print("  ✓     the book is consistent" + ("" if not notes else " (see notes above)"))
sys.exit(1 if problems else 0)
