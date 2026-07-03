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
 *  * ─────────────────────────────────────────────────────────────────────────
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
      } else if (file.key.startsWith('player_idle_') && file.key.endsWith('_raw')) {
        console.warn(`[PreloadScene] Raw frame ${file.key} missing. Will fallback to static player or rectangle.`);
      } else if (file.key.startsWith('player_deflect_up_') && file.key.endsWith('_raw')) {
        console.warn(`[PreloadScene] Raw deflect up frame ${file.key} missing.`);
      }
    });

    this.load.image('logo_trimmed', 'assets/ui/clone_blast_logo_trimmed.png');
    this.load.image('logo_main',    'assets/ui/clone_blast_logo.png');
    this.load.image('player_idle',  'assets/player/player_idle.png');

    // ── Raw player idle frames (white background to be removed at runtime) ────
    this.load.image('player_idle_01_raw', 'assets/player/idle/player_idle_01.png');
    this.load.image('player_idle_02_raw', 'assets/player/idle/player_idle_02.png');
    this.load.image('player_idle_03_raw', 'assets/player/idle/player_idle_03.png');
    this.load.image('player_idle_04_raw', 'assets/player/idle/player_idle_04.png');

    // ── Raw player upward deflect frames (green background to be removed at runtime) ────
    console.log('[PreloadScene] Loading player deflect up frames...');
    this.load.image('player_deflect_up_01_raw', 'assets/player/deflect_up/player_deflect_up_01.png');
    this.load.image('player_deflect_up_02_raw', 'assets/player/deflect_up/player_deflect_up_02.png');
    this.load.image('player_deflect_up_03_raw', 'assets/player/deflect_up/player_deflect_up_03.png');
    this.load.image('player_deflect_up_04_raw', 'assets/player/deflect_up/player_deflect_up_04.png');
    this.load.image('player_deflect_up_05_raw', 'assets/player/deflect_up/player_deflect_up_05.png');
    this.load.image('player_deflect_up_06_raw', 'assets/player/deflect_up/player_deflect_up_06.png');
    this.load.image('player_deflect_up_07_raw', 'assets/player/deflect_up/player_deflect_up_07.png');
    this.load.image('player_deflect_up_08_raw', 'assets/player/deflect_up/player_deflect_up_08.png');

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
    // this.load.audio('sfx_stage_clear',     'assets/stage_clear.wav');
    // this.load.audio('music_menu',          'assets/music/theme_menu.ogg');
    // this.load.audio('music_campaign',      'assets/music/theme_campaign.ogg');
    // this.load.audio('music_boss',          'assets/music/theme_boss.ogg');
  }

  create(): void {
    // Process the loaded raw frames to remove the background colors
    this.processRawFrames();

    // Create the animations if frames processed successfully
    this.buildAnimations();

    this.scene.start('MainMenuScene');
  }

  private processRawFrames(): void {
    // 1. Process Idle Frames (White-to-Alpha)
    const idleNums = ['01', '02', '03', '04'];
    idleNums.forEach(num => {
      const rawKey = `player_idle_${num}_raw`;
      const processedKey = `player_idle_${num}`;
      this.applyChromaKeyFilter(rawKey, processedKey, 'white');
    });

    // 2. Process Deflect Up Frames (Green-to-Alpha)
    const deflectUpNums = ['01', '02', '03', '04', '05', '06', '07', '08'];
    deflectUpNums.forEach(num => {
      const rawKey = `player_deflect_up_${num}_raw`;
      const processedKey = `player_deflect_up_${num}`;
      this.applyChromaKeyFilter(rawKey, processedKey, 'green');
    });
  }

  private applyChromaKeyFilter(rawKey: string, processedKey: string, filterMode: 'white' | 'green'): void {
    if (!this.textures.exists(rawKey)) return;

    try {
      const texture = this.textures.get(rawKey);
      const image = texture.getSourceImage() as HTMLImageElement | HTMLCanvasElement;
      
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(image, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          if (filterMode === 'white') {
            // Threshold for near-white pixels
            if (r >= 245 && g >= 245 && b >= 245) {
              data[i + 3] = 0; // Set alpha to 0
            }
          } else if (filterMode === 'green') {
            // Threshold for pure/near-green chroma key pixels (#00FF00)
            if (g >= 240 && r <= 20 && b <= 20) {
              data[i + 3] = 0; // Set alpha to 0
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        
        if (this.textures.exists(processedKey)) {
          this.textures.remove(processedKey);
        }
        
        this.textures.addCanvas(processedKey, canvas);
        if (filterMode === 'green') {
          console.log(`[PreloadScene] Processed green chroma key for ${processedKey}`);
        } else {
          console.log(`[PreloadScene] Processed white background transparency for ${processedKey}`);
        }
      }
    } catch (err) {
      console.warn(`[PreloadScene] Failed to process ${filterMode} chroma key for ${rawKey}:`, err);
    }
  }

  private buildAnimations(): void {
    // Build player idle animation
    const hasAllIdleFrames = 
      this.textures.exists('player_idle_01') &&
      this.textures.exists('player_idle_02') &&
      this.textures.exists('player_idle_03') &&
      this.textures.exists('player_idle_04');

    if (hasAllIdleFrames) {
      if (!this.anims.exists('player_idle_anim')) {
        this.anims.create({
          key: 'player_idle_anim',
          frames: [
            { key: 'player_idle_01', duration: 300 },
            { key: 'player_idle_02', duration: 220 },
            { key: 'player_idle_03', duration: 220 },
            { key: 'player_idle_04', duration: 260 },
            { key: 'player_idle_03', duration: 220 },
            { key: 'player_idle_02', duration: 220 }
          ],
          repeat: -1
        });
        console.log('[PreloadScene] Registered animation: player_idle_anim (ping-pong with durations)');
      }
    }

    // Register that deflect up animation is ready (checked by player constructor)
    const hasAllDeflectUpFrames = 
      this.textures.exists('player_deflect_up_01') &&
      this.textures.exists('player_deflect_up_02') &&
      this.textures.exists('player_deflect_up_03') &&
      this.textures.exists('player_deflect_up_04') &&
      this.textures.exists('player_deflect_up_05') &&
      this.textures.exists('player_deflect_up_06') &&
      this.textures.exists('player_deflect_up_07') &&
      this.textures.exists('player_deflect_up_08');

    if (hasAllDeflectUpFrames) {
      console.log('[PreloadScene] Player deflect up animation ready');
    }
  }
}
