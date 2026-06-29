# ⚔️ CloneBlast — Browser-Based 2D Pixel Art Action Game

A fast-paced, side-view **deflect combat game** built with **TypeScript**, **Phaser 3**, and **Vite**.

> **Status:** 🚧 In active development — planning phase complete, implementation starting.

---

## 🎮 Game Summary

You control a saber-wielding warrior standing on the left side of the screen. Waves of enemy droids on the right fire blaster bolts at you across two lanes — **upper** and **lower**. Your only weapon is your reflexes: deflect every bolt at the right moment, build your combo, and use your Force abilities to turn the tide.

One wrong move breaks your combo. One missed bolt costs you HP. Stay sharp — the boss is waiting at Stage 7.

---

## 🕹️ Controls

| Key | Action |
|-----|--------|
| `W` / `↑` | Deflect **upper** lane bolt |
| `S` / `↓` | Deflect **lower** lane bolt |
| `D` | **Force Reflect** — costs 25 Force, sends a bolt back at enemies |
| `Space` (hold) | **Force Choke** — requires 100 Force, hold 2–3s then release to slam all enemies |

---

## 👾 Enemies

| Enemy | Description |
|-------|-------------|
| `battle_droid` | Standard grunt, fires single bolts |
| `heavy_droid` | Bulkier, fires fast burst shots from wrist blasters |
| `shield_droid` | Rolls into position, deploys a blue energy shield that blocks reflected bolts |
| `cyborg_boss` | 4-armed boss with 4 sabers — immune to blasters, only harmed by Force Choke |

---

## 🗂️ Game Modes

### Campaign Mode
- **7 stages** with escalating difficulty
- Stage 7 is a boss fight
- Clear a stage to heal **+2 HP** (max 10)

### Infinite Mode
- Endless waves
- Difficulty scales over time
- Compete for the **top 3 high score** stored locally

---

## 🏆 High Score System

- Top 3 scores saved in **localStorage** (no backend needed)
- If you break the top 3, enter a **5-letter name** using only consonants: `B C D F G H J K L M N P R S T V Y Z`
- Valid names: `BRKST`, `KRTLN`, `MRSVN`

---

## 🧱 Tech Stack

| Layer | Tech |
|-------|------|
| Language | TypeScript 5.x (strict) |
| Game Framework | Phaser 3 |
| Build Tool | Vite 5.x |
| Storage | localStorage (no backend) |
| Resolution | 1920 × 1080, 16:9 fixed |

---

## 📁 Project Structure

```
CloneBlast/
├── docs/
│   ├── GAME_SPEC.md      ← Full design specification
│   ├── TECH_PLAN.md      ← Architecture & module layout
│   ├── TASKS.md          ← Incremental build task list
│   └── ASSET_GUIDE.md    ← Sprite/audio asset guide
├── src/
│   ├── main.ts           ← Phaser bootstrap
│   ├── config.ts         ← Global constants
│   ├── scenes/           ← All Phaser scenes
│   ├── entities/         ← Player & enemy classes
│   ├── systems/          ← Combat, score, force, wave, difficulty
│   ├── data/             ← Stage definitions & high score helpers
│   └── ui/               ← HUD & name entry components
├── public/
├── index.html
├── vite.config.ts
└── tsconfig.json
```

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/Enes-Balaban17/CloneBlast-Web-Based-Game.git
cd CloneBlast-Web-Based-Game

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

> Open [http://localhost:5173](http://localhost:5173) after running `npm run dev`.

---

## 📋 Development Roadmap

The project is built in **small, safe increments**. See [`docs/TASKS.md`](docs/TASKS.md) for the full task list.

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Planning docs | ✅ Done |
| 1 | Vite + TS + Phaser scaffold | ⬜ Next |
| 2 | Boot scene & placeholder textures | ⬜ |
| 3 | Main menu + high scores | ⬜ |
| 4 | Game scene shell + HUD | ⬜ |
| 5 | Input & deflect stubs | ⬜ |
| 6 | Blaster system & combat | ⬜ |
| 7 | Score & combo system | ⬜ |
| 8 | Enemy spawning & waves | ⬜ |
| 9 | Force abilities | ⬜ |
| 10 | All enemy types | ⬜ |
| 11 | Boss fight | ⬜ |
| 12 | Scene transitions & game flow | ⬜ |
| 13 | Infinite mode scaling | ⬜ |
| 14 | Polish & QA | ⬜ |
| 15 | Production build & deploy | ⬜ |

---

## 📄 Documentation

| Document | Purpose |
|----------|---------|
| [`docs/GAME_SPEC.md`](docs/GAME_SPEC.md) | Full game design — mechanics, enemies, combat rules, scoring, UI flow |
| [`docs/TECH_PLAN.md`](docs/TECH_PLAN.md) | Technical architecture, Phaser config, module structure, data types |
| [`docs/TASKS.md`](docs/TASKS.md) | Granular 50+ task list across 15 development phases |
| [`docs/ASSET_GUIDE.md`](docs/ASSET_GUIDE.md) | Sprite sheet specs, placeholder table, audio asset list |

---

## ⚖️ License

This project is licensed under the **MIT License** — see [`LICENSE`](LICENSE) for details.
