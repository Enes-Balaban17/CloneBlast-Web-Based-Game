import Phaser from 'phaser';

/**
 * PreloadScene — safe asset loading.
 *
 * All atlas / image / audio loads are guarded so missing files do not
 * crash the game. When real assets are placed in public/assets/ the
 * corresponding load calls below should be uncommented.
 *
 * ── Asset manifest (future) ───────────────────────────────────────────────
 *
 * PLAYER (public/assets/player/)
 *   player_sheet.png + player_sheet.json
 *   Frames: idle | deflect_up | deflect_down | force | hit | death
 *
 * BATTLE DROID (public/assets/enemies/battle_droid/)
 *   battle_droid_sheet.png + battle_droid_sheet.json
 *   Frames: idle | shoot | destroyed
 *
 * HEAVY DROID (public/assets/enemies/heavy_droid/)
 *   heavy_droid_sheet.png + heavy_droid_sheet.json
 *   Frames: idle | shoot | destroyed
 *
 * SHIELD DROID (public/assets/enemies/shield_droid/)
 *   shield_droid_sheet.png + shield_droid_sheet.json
 *   Frames: rolling | deploying | idle | shielded | hit | destroyed
 *
 * CYBORG BOSS (public/assets/enemies/cyborg_boss/)
 *   boss_sheet.png + boss_sheet.json
 *   Frames: idle | deflect | charge_prepare | charge_dash |
 *           saber_slash | back_jump_return | force_hit | stagger | defeated
 *
 * BACKGROUNDS (public/assets/backgrounds/)
 *   bg_campaign.png — 1920×1080 parallax background
 *   bg_infinite.png — alternate background
 *
 * UI (public/assets/ui/)
 *   logo.png | btn_normal.png | btn_hover.png | health_pip.png
 *
 * SFX (public/assets/sfx/)
 *   deflect_normal.wav | deflect_perfect.wav | blaster_fire.wav
 *   blaster_hit.wav | force_reflect.wav | force_choke.wav
 *   boss_slash.wav | boss_force_hit.wav | stage_clear.wav | game_over.wav
 *
 * MUSIC (public/assets/music/)
 *   theme_menu.ogg | theme_campaign.ogg | theme_boss.ogg
 *
 * ─────────────────────────────────────────────────────────────────────────
 */
export class PreloadScene extends Phaser.Scene {
  constructor() { super('PreloadScene'); }

  preload(): void {
    // ── Main menu logos (ACTIVE) ─────────────────────────────────────
    // Preferred: trimmed version (994×443 visible-content only, 12 px margin)
    // Fallback:  original full-canvas version (1536×1024, lots of transparent space)
    // MainMenuScene picks whichever is available via logoTextureValid().
    this.load.on('loaderror', (file: { key: string }) => {
      if (file.key === 'logo_trimmed' || file.key === 'logo_main') {
        console.warn(`[PreloadScene] ${file.key} not found — falling back to next option.`);
      } else if (file.key === 'player_idle') {
        console.warn('[PreloadScene] player_idle.png not found — using rectangle placeholder.');
      }
    });
    this.load.image('logo_trimmed', 'assets/ui/clone_blast_logo_trimmed.png');
    this.load.image('logo_main',    'assets/ui/clone_blast_logo.png');
    this.load.image('player_idle',  'assets/player/player_idle.png');

    // ── Other assets (uncomment when files are placed in public/assets/) ───────

    // this.load.atlas('player',       'assets/player/player_sheet.png',             'assets/player/player_sheet.json');
    // this.load.atlas('battle_droid', 'assets/enemies/battle_droid/battle_droid_sheet.png', 'assets/enemies/battle_droid/battle_droid_sheet.json');
    // this.load.atlas('heavy_droid',  'assets/enemies/heavy_droid/heavy_droid_sheet.png',   'assets/enemies/heavy_droid/heavy_droid_sheet.json');
    // this.load.atlas('shield_droid', 'assets/enemies/shield_droid/shield_droid_sheet.png', 'assets/enemies/shield_droid/shield_droid_sheet.json');
    // this.load.atlas('cyborg_boss',  'assets/enemies/cyborg_boss/boss_sheet.png',          'assets/enemies/cyborg_boss/boss_sheet.json');
    // this.load.image('bg_campaign',  'assets/backgrounds/bg_campaign.png');
    // this.load.image('bg_infinite',  'assets/backgrounds/bg_infinite.png');
    // this.load.audio('sfx_deflect_normal',  'assets/sfx/deflect_normal.wav');
    // this.load.audio('sfx_deflect_perfect', 'assets/sfx/deflect_perfect.wav');
    // this.load.audio('sfx_force_reflect',   'assets/sfx/force_reflect.wav');
    // this.load.audio('sfx_force_choke',     'assets/sfx/force_choke.wav');
    // this.load.audio('sfx_boss_slash',      'assets/sfx/boss_slash.wav');
    // this.load.audio('sfx_stage_clear',     'assets/sfx/stage_clear.wav');
    // this.load.audio('music_menu',          'assets/music/theme_menu.ogg');
    // this.load.audio('music_campaign',      'assets/music/theme_campaign.ogg');
    // this.load.audio('music_boss',          'assets/music/theme_boss.ogg');
  }

  create(): void {
    // All placeholder textures are generated in BootScene.
    // Only real asset swaps happen here.
    this.scene.start('MainMenuScene');
  }
}
