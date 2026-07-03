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
      } else if (file.key.startsWith('effect_') && file.key.endsWith('_raw')) {
        console.warn(`[PreloadScene] Raw effect asset ${file.key} missing. Demo effects will fallback gracefully.`);
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

    // ── Deflect up visual effect assets (green background chroma key) ──────────
    console.log('Loading Deflect Up effects...');
    console.log('Trying effect path: /assets/player/deflect_up/');
    
    // 1. Try Player deflect_up folder
    this.load.image('effect_slash_arc_up_raw_player',      'assets/player/deflect_up/blue_slash_arc_up.png');
    this.load.image('effect_deflect_spark_01_raw_player',   'assets/player/deflect_up/blue_red_deflect_spark_01.png');
    this.load.image('effect_deflect_spark_02_raw_player',   'assets/player/deflect_up/blue_red_deflect_spark_02.png');
    this.load.image('effect_deflect_spark_03_raw_player',   'assets/player/deflect_up/blue_red_deflect_spark_03.png');
    // Fallback: alt names in Player folder
    this.load.image('effect_deflect_spark_01_alt_player',   'assets/player/deflect_up/blue_deflect_spark_01.png');
    this.load.image('effect_deflect_spark_02_alt_player',   'assets/player/deflect_up/blue_deflect_spark_02.png');
    this.load.image('effect_deflect_spark_03_alt_player',   'assets/player/deflect_up/blue_deflect_spark_03.png');

    // 2. Try Effects folder
    this.load.image('effect_slash_arc_up_raw_effects',      'assets/effects/deflect_up/blue_slash_arc_up.png');
    this.load.image('effect_deflect_spark_01_raw_effects',  'assets/effects/deflect_up/blue_red_deflect_spark_01.png');
    this.load.image('effect_deflect_spark_02_raw_effects',  'assets/effects/deflect_up/blue_red_deflect_spark_02.png');
    this.load.image('effect_deflect_spark_03_raw_effects',  'assets/effects/deflect_up/blue_red_deflect_spark_03.png');
    // Fallback: alt names in Effects folder
    this.load.image('effect_deflect_spark_01_alt_effects',  'assets/effects/deflect_up/blue_deflect_spark_01.png');
    this.load.image('effect_deflect_spark_02_alt_effects',  'assets/effects/deflect_up/blue_deflect_spark_02.png');
    this.load.image('effect_deflect_spark_03_alt_effects',  'assets/effects/deflect_up/blue_deflect_spark_03.png');

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

    // 3. Process Visual Effect Frames (Green-to-Alpha)
    
    // Detect folder used
    let folderUsed = '';
    if (
      this.textures.exists('effect_slash_arc_up_raw_player') ||
      this.textures.exists('effect_deflect_spark_01_raw_player') ||
      this.textures.exists('effect_deflect_spark_01_alt_player')
    ) {
      folderUsed = '/assets/player/deflect_up/';
    } else if (
      this.textures.exists('effect_slash_arc_up_raw_effects') ||
      this.textures.exists('effect_deflect_spark_01_raw_effects') ||
      this.textures.exists('effect_deflect_spark_01_alt_effects')
    ) {
      folderUsed = '/assets/effects/deflect_up/';
    }

    if (folderUsed) {
      console.log(`[PreloadScene] Loaded effects from: ${folderUsed}`);
    } else {
      console.log('[PreloadScene] Trying effect path: /assets/player/deflect_up/');
    }

    // Resolve slash arc
    const slashArcPlayer = 'effect_slash_arc_up_raw_player';
    const slashArcEffects = 'effect_slash_arc_up_raw_effects';
    if (this.textures.exists(slashArcPlayer)) {
      this.applyChromaKeyFilter(slashArcPlayer, 'effect_slash_arc_up', 'green');
      console.log('Loaded blue_slash_arc_up.png');
    } else if (this.textures.exists(slashArcEffects)) {
      this.applyChromaKeyFilter(slashArcEffects, 'effect_slash_arc_up', 'green');
      console.log('Loaded blue_slash_arc_up.png');
    } else {
      console.warn('Missing slash arc effect');
    }

    // Resolve Sparks
    const sparks = ['01', '02', '03'];
    sparks.forEach(num => {
      const sparkP = `effect_deflect_spark_${num}_raw_player`;
      const sparkE = `effect_deflect_spark_${num}_raw_effects`;
      const sparkPAlt = `effect_deflect_spark_${num}_alt_player`;
      const sparkEAlt = `effect_deflect_spark_${num}_alt_effects`;
      const processedKey = `effect_deflect_spark_${num}`;

      let loaded = false;

      if (this.textures.exists(sparkP)) {
        this.applyChromaKeyFilter(sparkP, processedKey, 'green');
        loaded = true;
      } else if (this.textures.exists(sparkE)) {
        this.applyChromaKeyFilter(sparkE, processedKey, 'green');
        loaded = true;
      } else if (this.textures.exists(sparkPAlt)) {
        this.applyChromaKeyFilter(sparkPAlt, processedKey, 'green');
        loaded = true;
      } else if (this.textures.exists(sparkEAlt)) {
        this.applyChromaKeyFilter(sparkEAlt, processedKey, 'green');
        loaded = true;
      }

      if (loaded) {
        console.log(`Loaded blue_red_deflect_spark_${num}.png`);
        
        // Scan visible bounds to find the anchor
        const anchor = this.calculateVisibleBoundsCenter(processedKey);
        if (anchor) {
          this.registry.set(`spark_anchor_${num}`, anchor);
          console.log(`[PreloadScene] Stored spark_anchor_${num}: x=${anchor.x.toFixed(4)}, y=${anchor.y.toFixed(4)}`);
        }
      } else {
        console.warn(`Missing spark ${num} effect`);
      }
    });
  }

  private calculateVisibleBoundsCenter(textureKey: string): { x: number; y: number } | null {
    if (!this.textures.exists(textureKey)) return null;

    try {
      const texture = this.textures.get(textureKey);
      const canvas = texture.getSourceImage() as HTMLCanvasElement;
      if (!canvas || !canvas.getContext) return null;

      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const width = canvas.width;
      const height = canvas.height;
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      let minX = width;
      let maxX = 0;
      let minY = height;
      let maxY = 0;
      let found = false;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const alpha = data[idx + 3];
          if (alpha > 10) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
            found = true;
          }
        }
      }

      if (!found) {
        return { x: 0.5, y: 0.5 };
      }

      const visibleCenterX = (minX + maxX) / 2;
      const visibleCenterY = (minY + maxY) / 2;

      return {
        x: visibleCenterX / width,
        y: visibleCenterY / height
      };
    } catch (e) {
      console.error(`[PreloadScene] Failed to scan visible bounds for ${textureKey}`, e);
      return { x: 0.5, y: 0.5 };
    }
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
            // Threshold for pure/near-green chroma key pixels (#00FF00) - permissive threshold
            if (g >= 240 && r <= 30 && b <= 30) {
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
