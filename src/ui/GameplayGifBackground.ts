/**
 * GameplayGifBackground
 * ──────────────────────
 * Renders an animated GIF as a full-viewport HTML layer positioned
 * BEHIND the Phaser canvas for gameplay scenes (CampaignScene & InfiniteScene).
 *
 * This system operates independently of the main menu GIF background to prevent
 * resource conflicts and ensure proper cleanup when transitioning between scenes.
 */

const ELEMENT_ID = 'gameplay-gif-bg';
const GIF_PATH   = '/assets/backgrounds/gameplay_geonosis_loop.gif';

function getOrCreate(): HTMLElement {
  let el = document.getElementById(ELEMENT_ID);

  if (!el) {
    el = document.createElement('div');
    el.id = ELEMENT_ID;

    Object.assign(el.style, {
      position:        'fixed',
      inset:           '0',
      width:           '100%',
      height:          '100%',
      backgroundImage: `url("${GIF_PATH}")`,
      backgroundSize:  'cover',
      backgroundPosition: 'center',
      backgroundRepeat:   'no-repeat',
      imageRendering:  'pixelated',
      zIndex:          '0',            // sits behind Phaser canvas
      pointerEvents:   'none',         // never intercepts clicks/keyboard input
      display:         'none',         // hidden by default
    });

    // Subtle dark overlay to ensure readability of UI/blasters
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position:  'absolute',
      inset:     '0',
      background: 'rgba(0, 0, 0, 0.3)',
      pointerEvents: 'none',
    });
    el.appendChild(overlay);

    document.body.insertBefore(el, document.body.firstChild);
  }

  return el;
}

/** Show the gameplay GIF background. Safe to call multiple times. */
export function showGameplayGifBackground(): void {
  try {
    getOrCreate().style.display = 'block';
  } catch (err) {
    console.warn('[GameplayGifBackground] Could not show background:', err);
  }
}

/** Hide the gameplay GIF background. Safe to call multiple times. */
export function hideGameplayGifBackground(): void {
  try {
    const el = document.getElementById(ELEMENT_ID);
    if (el) el.style.display = 'none';
  } catch (err) {
    console.warn('[GameplayGifBackground] Could not hide background:', err);
  }
}
