/**
 * MenuGifBackground
 * ─────────────────
 * Renders an animated GIF as a full-viewport HTML layer positioned
 * BEHIND the Phaser canvas. This avoids the "GIF shows only first frame"
 * limitation that occurs when loading animated GIFs through Phaser's
 * texture pipeline.
 *
 * The element is created once and reused on subsequent calls to
 * showMenuGifBackground(), so restarting MainMenuScene never duplicates it.
 *
 * pointer-events: none  → the layer never intercepts Phaser mouse input.
 * z-index: 0            → sits under the Phaser canvas (z-index: 1).
 */

const ELEMENT_ID   = 'menu-gif-bg';
const GIF_PATH     = '/assets/backgrounds/main_menu_loop.gif';

/** Lazily create (or reuse) the HTML background element. */
function getOrCreate(): HTMLElement {
  let el = document.getElementById(ELEMENT_ID);

  if (!el) {
    el = document.createElement('div');
    el.id = ELEMENT_ID;

    Object.assign(el.style, {
      position:        'fixed',
      inset:           '0',          // top:0 right:0 bottom:0 left:0
      width:           '100%',
      height:          '100%',
      backgroundImage: `url("${GIF_PATH}")`,
      backgroundSize:  'cover',
      backgroundPosition: 'center',
      backgroundRepeat:   'no-repeat',
      imageRendering:  'pixelated',
      zIndex:          '0',          // behind Phaser canvas (z-index:1)
      pointerEvents:   'none',       // never blocks Phaser clicks
      display:         'none',       // hidden by default
    });

    // Subtle dark overlay so menu text stays readable over bright GIF frames.
    // Uses a CSS pseudo-element via a child div (simpler than injecting a
    // stylesheet at runtime).
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position:  'absolute',
      inset:     '0',
      background: 'rgba(0,0,0,0.45)',
      pointerEvents: 'none',
    });
    el.appendChild(overlay);

    // Insert before <body>'s first child so it is beneath everything else.
    document.body.insertBefore(el, document.body.firstChild);
  }

  return el;
}

/**
 * Show the animated GIF background.
 * Safe to call multiple times — idempotent.
 */
export function showMenuGifBackground(): void {
  try {
    getOrCreate().style.display = 'block';
  } catch (err) {
    // Graceful fallback: if DOM manipulation fails for any reason,
    // the menu still works with the Phaser solid-color background.
    console.warn('[MenuGifBackground] Could not show GIF layer:', err);
  }
}

/**
 * Hide the animated GIF background.
 * Safe to call when it was never shown — idempotent.
 */
export function hideMenuGifBackground(): void {
  try {
    const el = document.getElementById(ELEMENT_ID);
    if (el) el.style.display = 'none';
  } catch (err) {
    console.warn('[MenuGifBackground] Could not hide GIF layer:', err);
  }
}
