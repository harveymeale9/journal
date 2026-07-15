/* ==========================================================
   JUMP — the page badge and its numpad
   The input is readonly and we type for it, so no native keyboard
   ever opens and the layout never shifts. Styling: css/ui.css.
   ========================================================== */

import { el, state, isMobile, reduced, savePos } from './book.js';
import { flutterTo } from './page-turn.js';

let jumpBox, numpad;

export function syncMobilePage(){
  const els = document.querySelectorAll('#scrollBook .page.m');
  let best = 0, bestDist = Infinity;
  els.forEach((node, i)=>{
    const d = Math.abs(node.getBoundingClientRect().top - 40);
    if (d < bestDist){ bestDist = d; best = i; }
  });
  el.jumpInput.value = best + 1;
  savePos(best);   /* remember the page you've scrolled to */
}

export function jumpTo(){
  let p = parseInt(el.jumpInput.value, 10);
  if (isNaN(p)) return;
  p = Math.min(Math.max(p, 1), state.pages.length);
  el.jumpInput.value = p;
  el.jumpInput.blur();
  if (isMobile()){
    const node = document.querySelectorAll('#scrollBook .page.m')[p-1];
    if (node) node.scrollIntoView({behavior: reduced ? 'auto' : 'smooth', block:'start'});
  } else {
    flutterTo(Math.floor((p-1)/2));
  }
}

function openPad(){
  el.jumpInput.value = '';
  jumpBox.classList.add('open');
}
function closePad(restore){
  jumpBox.classList.remove('open');
  if (restore){
    if (isMobile()) syncMobilePage();
    else el.jumpInput.value = state.spread*2 + 1;
  }
}
function doJump(){
  closePad(false);
  jumpTo();
}

export function initJump(){
  jumpBox = document.querySelector('.jump');
  numpad  = document.getElementById('numpad');

  el.jumpInput.max = state.pages.length;
  el.jumpTotal.textContent = 'of ' + state.pages.length;

  el.jumpInput.addEventListener('focus', openPad);
  el.jumpInput.addEventListener('click', openPad);

  numpad.addEventListener('click', e=>{
    const b = e.target.closest('button');
    if (!b) return;
    const k = b.dataset.k;
    if (k === 'del') el.jumpInput.value = el.jumpInput.value.slice(0, -1);
    else if (k === 'go') doJump();
    else if (el.jumpInput.value.length < 3) el.jumpInput.value += k;
  });

  /* physical keyboard still works on desktop (input is readonly, so we type for it) */
  el.jumpInput.addEventListener('keydown', e=>{
    if (e.key === 'Enter'){ e.preventDefault(); doJump(); }
    else if (e.key === 'Escape'){ closePad(true); el.jumpInput.blur(); }
    else if (e.key === 'Backspace'){ e.preventDefault(); el.jumpInput.value = el.jumpInput.value.slice(0, -1); }
    else if (/^[0-9]$/.test(e.key)){ e.preventDefault(); if (el.jumpInput.value.length < 3) el.jumpInput.value += e.key; }
  });

  /* tapping anywhere outside cancels and restores the current page number */
  document.addEventListener('pointerdown', e=>{
    if (jumpBox.classList.contains('open') && !jumpBox.contains(e.target)) closePad(true);
  });

  /* on mobile, the box tracks the page you've scrolled to (paused while the pad is open) */
  let scrollTick = false;
  window.addEventListener('scroll', ()=>{
    if (!isMobile() || scrollTick) return;
    scrollTick = true;
    requestAnimationFrame(()=>{
      scrollTick = false;
      if (jumpBox.classList.contains('open')) return;
      syncMobilePage();
    });
  }, {passive:true});
}
