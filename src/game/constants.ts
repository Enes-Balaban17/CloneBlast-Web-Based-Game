// ─── Resolution ────────────────────────────────────────────────────────────
export const GAME_WIDTH  = 1920;
export const GAME_HEIGHT = 1080;

// ─── Layout ─────────────────────────────────────────────────────────────────
export const UPPER_LANE_Y  = 380;
export const LOWER_LANE_Y  = 650;
export const GROUND_Y      = 760;
export const PLAYER_X      = 210;
export const PLAYER_Y      = 515; // vertical midpoint between lanes
export const ENEMY_AREA_X  = 1560;

// ─── Player Stats ───────────────────────────────────────────────────────────
export const MAX_HP      = 10;
export const MAX_STAMINA = 100;
export const MAX_FORCE   = 100;

// ─── Stamina ─────────────────────────────────────────────────────────────────
export const DEFLECT_STAMINA_COST    = 14;  // per deflect attempt
export const EMPTY_DEFLECT_PENALTY   = 10;  // when no blaster is in range
export const WRONG_LANE_PENALTY      = 14;  // wrong lane pressed
export const STAMINA_REGEN_RATE      = 18;  // points per second

// ─── Force ───────────────────────────────────────────────────────────────────
export const FORCE_REFLECT_COST        = 25;
export const FORCE_CHOKE_COST          = 100;
export const FORCE_CHOKE_CHARGE_MS     = 2500;
export const FORCE_PER_NORMAL_DEFLECT  = 8;
export const FORCE_PER_PERFECT_DEFLECT = 20;

// ─── Deflect Timing Windows (pixels from PLAYER_X) ──────────────────────────
export const DEFLECT_WINDOW_NORMAL  = 140;  // blaster x ∈ [PLAYER_X, PLAYER_X + 140]
export const DEFLECT_WINDOW_PERFECT =  60;  // inner 60 px = perfect

// ─── Scoring ─────────────────────────────────────────────────────────────────
export const SCORE_NORMAL_DEFLECT  =  100;
export const SCORE_PERFECT_DEFLECT =  250;
export const SCORE_FORCE_REFLECT   =  500;
export const SCORE_FORCE_CHOKE     =  750;
export const SCORE_STAGE_CLEAR     = 1000;

// ─── Combo Multiplier Tiers ──────────────────────────────────────────────────
// Ordered highest → lowest so the first match wins.
export const COMBO_TIERS = [
  { minCombo: 30, multiplier: 5.0 },
  { minCombo: 20, multiplier: 3.0 },
  { minCombo: 10, multiplier: 2.0 },
  { minCombo:  5, multiplier: 1.5 },
  { minCombo:  0, multiplier: 1.0 },
] as const;

// ─── Blaster ──────────────────────────────────────────────────────────────────
export const BLASTER_SPEED          = 420;  // px / second
export const BLASTER_SPAWN_INTERVAL = 2000; // ms (base; overridden per stage/difficulty)

// ─── Placeholder Colors ───────────────────────────────────────────────────────
export const COL_BG               = 0x0d0d1a;
export const COL_GROUND           = 0x1a1a3a;
export const COL_PLAYER           = 0x00ccff;
export const COL_BATTLE_DROID     = 0xff6600;
export const COL_HEAVY_DROID      = 0xcc3300;
export const COL_SHIELD_DROID     = 0x3366ff;
export const COL_CYBORG_BOSS      = 0x990099;
export const COL_BLASTER          = 0xff2222;
export const COL_BLASTER_REFLECT  = 0x00ff99;
export const COL_ZONE_NORMAL      = 0xffff00;
export const COL_ZONE_PERFECT     = 0x00ff88;

// ─── Name Entry ───────────────────────────────────────────────────────────────
export const VALID_CONSONANTS = new Set('BCDFGHJKLMNPRSTVYZ');
export const NAME_MIN_LENGTH  = 3;   // minimum accepted name length
export const NAME_LENGTH      = 5;   // maximum accepted name length
export const MAX_HIGH_SCORES  = 3;
export const HS_STORAGE_KEY   = 'deflect_wars_highscores';

// ─── Enemy Kill Scores ────────────────────────────────────────────────────────
export const SCORE_KILL_BATTLE_DROID = 300;
export const SCORE_KILL_HEAVY_DROID  = 600;
export const SCORE_KILL_SHIELD_DROID = 500;
export const SCORE_KILL_BOSS         = 5000;

// ─── Enemy Stats ──────────────────────────────────────────────────────────────
export const BATTLE_DROID_HP         = 2;
export const BATTLE_DROID_SHOOT_MS   = 2200;  // ms between shots
export const HEAVY_DROID_HP          = 5;
export const HEAVY_DROID_SHOOT_MS    = 3500;
export const SHIELD_DROID_HP         = 3;
export const SHIELD_DROID_SHOOT_MS   = 2800;
export const SHIELD_DEPLOY_MS        = 1200;  // ms to deploy after entering

// ─── Boss Constants ───────────────────────────────────────────────────────────
export const BOSS_HP                = 6;    // force hits to defeat
export const BOSS_HOME_X            = 1620; // resting x position
export const BOSS_Y                 = 515;  // vertical centre (same as player mid)
export const BOSS_CHARGE_PREPARE_MS = 900;  // windup before dash
export const BOSS_CHARGE_SPEED      = 1400; // px / second during dash
export const BOSS_SLASH_X           = 420;  // x at which saber slash triggers
export const BOSS_SLASH_MS          = 600;  // duration of slash window
export const BOSS_RETURN_SPEED      = 700;  // px / second returning
export const BOSS_STAGGER_MS        = 1200; // stagger duration after force hit
export const BOSS_IDLE_INTERVAL_MS  = 3500; // ms between charge cycles
export const BOSS_FORCE_DAMAGE      = 2;    // HP lost per Force Choke hit

// ─── Enemy layout ─────────────────────────────────────────────────────────────
/** X positions where enemies are placed (spread across right half). */
export const ENEMY_SPAWN_XS = [1580, 1680, 1760, 1840];
export const ENEMY_ENTER_SPEED = 220; // px / second sliding in
