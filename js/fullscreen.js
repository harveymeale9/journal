/* ==========================================================
   FULLSCREEN — desktop/tablet toggle beside the title
   Requests real browser fullscreen AND drives body.fs-mode, which is what
   actually hides the title and shoves the book to the right for the
   candle's sake (see base.css / tokens.css). A single 'fullscreenchange'
   listener is the one source of truth for that class, rather than setting
   it directly in the click handler — fullscreen can also be left via
   Escape or the OS/browser's own chrome, and the book must fall back into
   its normal layout exactly the same way regardless of how it was left.
   ========================================================== */

function fsElement(){
  return document.fullscreenElement || document.webkitFullscreenElement || null;
}
function requestFs(el){
  const fn = el.requestFullscreen || el.webkitRequestFullscreen;
  return fn ? fn.call(el) : Promise.reject(new Error('Fullscreen API unavailable'));
}
function exitFs(){
  const fn = document.exitFullscreen || document.webkitExitFullscreen;
  return fn ? fn.call(document) : Promise.reject(new Error('Fullscreen API unavailable'));
}

export function initFullscreen(){
  const btn = document.getElementById('fsToggle');
  if (!btn) return;

  /* iOS Safari has no Fullscreen API for ordinary elements (video only) —
     rather than leave a button that does nothing when tapped, drop it. */
  const supported = !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);
  if (!supported){
    btn.remove();
    return;
  }

  const sync = () => {
    const on = !!fsElement();
    document.body.classList.toggle('fs-mode', on);
    btn.textContent = on ? 'Exit Fullscreen' : 'Fullscreen';
    btn.setAttribute('aria-pressed', String(on));
  };

  btn.addEventListener('click', () => {
    if (fsElement()) exitFs().catch(()=>{});
    else requestFs(document.documentElement).catch(()=>{});
  });

  document.addEventListener('fullscreenchange', sync);
  document.addEventListener('webkitfullscreenchange', sync);
}
