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

/* front/back matter is authored with data-num="roman", the body with
   "arabic" (see any page file) — lowercase to match the Manual's own set
   type rather than reading as a shout. Only the printed numeral changes;
   "of total" stays arabic since it names the book's one overall length,
   which has no roman equivalent, and data-page (below) stays arabic too
   since that's what the numpad and flutterTo() index by. */
function toRoman(n){
  const table = [[1000,'m'],[900,'cm'],[500,'d'],[400,'cd'],[100,'c'],[90,'xc'],
    [50,'l'],[40,'xl'],[10,'x'],[9,'ix'],[5,'v'],[4,'iv'],[1,'i']];
  let out = '';
  for (const [v, s] of table){ while (n >= v){ out += s; n -= v; } }
  return out;
}

/* Folio numbers are computed from position, never hand-typed — printed
   directly as "N of total", which is also what the jump badge's numpad
   understands, so a tapped folio and the pad always agree on what "13"
   means. Reorder pages freely in book.json; the numbers fall back into
   line on the next load. The numeral itself is wrapped in its own
   .folio-n span so typography.css can give just that digit the same
   dashed "ruled blank" treatment as the jump badge — the visual cue that
   it, specifically, is what you tap to edit. */
function numberFolios(pages){
  const total = pages.length;
  pages.forEach((page, i) => {
    const n = i + 1;
    const label = (numeral) =>
      `<span class="folio" data-page="${n}"><span class="folio-n">${numeral}</span> of ${total}</span>`;
    page.html = page.html
      .replace('<span class="folio" data-num="roman"></span>', label(toRoman(n)))
      .replace('<span class="folio" data-num="arabic"></span>', label(n));
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
