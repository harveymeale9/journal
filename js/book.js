/* ==========================================================
   BOOK — shared state, the DOM slots, rendering, position memory
   The page-turn and jump modules both read and drive this.
   ========================================================== */

export const el = {};
export function cacheDom(){
  ['pageL','pageR','leaf','leafFront','leafBack','shade','stackL','stackR',
   'book','jumpInput','jumpTotal','scrollBook'].forEach(id => {
    el[id] = document.getElementById(id);
  });
}

/* One mutable object rather than a pile of exported `let`s: an imported
   binding can't be reassigned from another module, but its fields can. */
export const state = {
  pages: [],          // [{ slug, html }]
  spread: 0,          // spread n shows pages [2n, 2n+1]
  turning: false,
  turnTimeout: null,  // the pending setTimeout for the in-flight turn
  inFlightNext: null, // the spread that turn is heading to
  maxSpread: 0,
};

export const isMobile = () =>
  window.matchMedia('(orientation: portrait) and (max-width: 940px), (max-width: 720px)').matches;
export const reduced =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- remember-my-place, keyed by SLUG ----------------------------------
   The filename is the page's permanent identity, so a reader's place
   survives any amount of reordering in book.json. If the page they were on
   is renamed or removed, we simply don't find it and open at the start. */
const LS_POS = 'reality-manual:last-page';

export function savePos(pageIndex){
  try{
    const p = state.pages[pageIndex];
    if (p) localStorage.setItem(LS_POS, p.slug);
  }catch(e){}   /* private mode / sandboxed preview: just don't remember */
}

export function savedPageIndex(){
  try{
    const slug = localStorage.getItem(LS_POS);
    return slug ? state.pages.findIndex(p => p.slug === slug) : -1;
  }catch(e){ return -1; }
}

/* the tome's thickness: shifts subtly toward the left as you read.
   Fills sit in fixed-width slots, so the pages themselves never move. */
export function updateStacks(frac){
  const max = isMobile() ? 15 : 30;
  const min = isMobile() ? 9  : 20;
  el.stackL.style.width = Math.round(min + frac * (max - min)) + 'px';
  el.stackR.style.width = Math.round(max - frac * (max - min)) + 'px';
}

/* pages are authored with their own .page-inner wrapper (which may carry
   layout classes like title-page or sealed); inject content AND classes */
export function fillSlot(id, page){
  const node = el[id] || document.getElementById(id);
  const tmp = document.createElement('div');
  tmp.innerHTML = (page && page.html) || '';
  const w = tmp.firstElementChild;
  node.className = w ? w.className : 'page-inner';
  node.innerHTML = w ? w.innerHTML : '';
}

export function render(){
  if (isMobile()) return; /* portrait mode is the pre-built scroll stack */
  fillSlot('pageL', state.pages[state.spread*2]);
  fillSlot('pageR', state.pages[state.spread*2+1]);
  updateStacks(state.maxSpread > 0 ? state.spread / state.maxSpread : 0);
  if (document.activeElement !== el.jumpInput) el.jumpInput.value = state.spread*2 + 1;
  savePos(state.spread*2);   /* remember the (left) page of this spread */
}

/* build the scrollable page stack once; CSS decides when it's shown */
export function buildScrollBook(){
  el.scrollBook.innerHTML = state.pages.map(p =>
    `<div class="page m" data-slug="${p.slug}"><div class="parchment"></div>${p.html}</div>`
  ).join('');
}
