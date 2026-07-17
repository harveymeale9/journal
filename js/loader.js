/* ==========================================================
   LOADER — turns book.json + /pages/*.html into the page list
   Fetches the running order, pulls each leaf in parallel, resolves
   {{> partial }} includes, then numbers the folios.
   ========================================================== */

const PARTIAL_RE = /\{\{>\s*([\w./-]+)\s*\}\}/g;
const partialCache = new Map();

/* Partials let several pages share one piece of markup (the sigil, say).
   They must be INLINED rather than <img src>'d: the sigil is animated by
   our own stylesheet, and CSS doesn't cross into an external SVG document. */
async function resolvePartials(html){
  const names = [...html.matchAll(PARTIAL_RE)].map(m => m[1]);
  await Promise.all([...new Set(names)].map(async name => {
    if (partialCache.has(name)) return;
    const res = await fetch(`assets/${name}`);
    if (!res.ok) throw new Error(`partial not found: assets/${name}`);
    partialCache.set(name, (await res.text()).trim());
  }));
  return html.replace(PARTIAL_RE, (_, name) => partialCache.get(name));
}

/* Folio numbers are computed from position, never hand-typed — printed
   directly as "N of total", which is also what the jump badge's numpad
   understands, so a tapped folio and the pad always agree on what "13"
   means. Reorder pages freely in book.json; the numbers fall back into
   line on the next load. */
function numberFolios(pages){
  const total = pages.length;
  pages.forEach((page, i) => {
    const n = i + 1;
    const label = `<span class="folio" data-page="${n}">${n} of ${total}</span>`;
    page.html = page.html
      .replace('<span class="folio" data-num="roman"></span>', label)
      .replace('<span class="folio" data-num="arabic"></span>', label);
  });
  return pages;
}

/* Strip the authoring comment at the top of each page file — it's a note to
   whoever opens the file, not something to ship into the DOM. */
const stripNote = (s) => s.replace(/^\s*<!--[\s\S]*?-->\s*/, '');

export async function loadBook(){
  const res = await fetch('book.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error('book.json could not be read');
  const book = await res.json();

  const order = book.order || [];
  if (!order.length) throw new Error('book.json lists no pages in "order"');

  /* pulled in parallel, but kept in the order book.json declares */
  const pages = await Promise.all(order.map(async slug => {
    const r = await fetch(`pages/${slug}.html`);
    if (!r.ok) throw new Error(`missing page: pages/${slug}.html`);
    const html = await resolvePartials(stripNote(await r.text()));
    return { slug, html };          // slug IS the page's identity, forever
  }));

  return { title: book.title, pages: numberFolios(pages) };
}
