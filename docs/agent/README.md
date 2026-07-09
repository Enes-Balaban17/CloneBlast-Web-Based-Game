# CLONE BLAST Agent Instructions

This folder contains implementation rules and coding-agent instructions for **CLONE BLAST**, a Phaser + TypeScript + Vite browser game.

These documents are meant to be used as the project reference before modifying gameplay, player animation, or Animation Test behavior.

## Read Order

1. `PROJECT_AGENT_RULES.md`
2. `PLAYER_ANIMATION_RULEBOOK.md`
3. `ANIMATION_TEST_SCENE.md`
4. `DEFLECT_UP_REFERENCE.md`
5. `DEFLECT_DOWN_REFERENCE.md`
6. `IMPLEMENTATION_CHECKLIST.md`

## Core Principle

Do not make animation changes by guessing. Preserve the existing working behavior, especially the completed Deflect Up implementation. Deflect Down must follow the same animation rulebook pattern:

- startup
- active/contact
- recovery
- chain-exit
- return-to-idle

## Current Status

- Deflect Up is the completed reference implementation.
- Deflect Down uses 8 frames and should behave like Deflect Up.
- Animation Test is the safe visual lab for action animation testing.
- Campaign and Infinite gameplay must not be changed unless the task explicitly asks for it.

## Asset Roots

```txt
public/assets/player/idle/
public/assets/player/deflect_up/
public/assets/player/deflect_down/
```

## Build Rule

After any implementation change, run:

```bash
npm run build
```

Report changed files, constants changed, and whether the build passed.
