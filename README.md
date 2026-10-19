# OPay Field Operations App

**Made by [Hamvida Tech](https://github.com/victorhamvida-dotcom)**  
Creator: **Hamzat Victor Chisom**

Internal field-training platform for OPay Channel Development operations:

- CDL policy & tiering (4 tiers / 12 sub-levels)
- Merchant loan disbursement tactics
- POS deployment quality simulation
- Staff registration + duplicate control
- DH regional analytics, transfers, gender insights
- Multi-game catalog with policy→game recommendations
- Version history / rollback time machine

---

## Live demo

After deploy, production URL should resemble:

```text
https://opay-field-operations-app.vercel.app
```

Or your claimed Vercel production domain under `victorhamvida-dotcom`.

---

## Quick start (local)

```bash
npm install
npm run dev
```

Build production single-file bundle:

```bash
npm run build
```

Output: `dist/index.html` (fully inlined CSS/JS via `vite-plugin-singlefile`).

Preview build:

```bash
npm run preview
```

---

## Access roles

| Role | How to enter | Powers |
|------|----------------|--------|
| **Creator** | Password only: `77075107` | Full admin, staff registry, password reset, Game Studio, versions |
| **Staff** | Login ID + password (register with role fields) | Field simulator / training |
| **DH** | Login ID + name + password (no Region/State required) | Analytics, transfers, gender, Game Studio suggestions |
| **Guest** | One tap | Try simulator without staff account |

> Creator password is for internal demo/admin only. Rotate before wide production release.

---

## Staff registration rules

### Normal staff (CDL / CDLM / SM)
Requires:
1. Login ID / Staff ID  
2. Login Name  
3. Gender (Male/Female)  
4. Region  
5. State (full 36 + FCT picker)

### RM
- Login ID + Name + Gender  
- Multi Region / multi State assignments  
- Optional supervised RM IDs  

### DH
- Login ID + Name + Gender only  
- **No Region/State required**

### Duplicate protection
- Exact match → blocked  
- Login ID conflict / partial strong match → verification required  
- Same name alone → allowed  
- No silent overwrite of existing Region/State  

Creator can manually create verified exceptions (never overwrites existing Login ID).

---

## Geography

- Official **36 states + FCT** list for pickers  
- Lagos operational split: **Lagos North** & **Lagos South**  
- Daily geography update check (merges new states if remote config appears; never deletes)  

---

## Hierarchy

```text
DH → RM → SM → CDLM → CDL → Merchant
```

DH tools:
- Regional performance analytics  
- Staff Region/State transfer (audited)  
- SM/RM map by state  
- Gender workforce analytics  
- Game Studio (SOP → recommended game type)

---

## Game platform (7+ types)

1. Career Money Run  
2. Policy Quiz Arena  
3. Merchant Case Desk  
4. POS Tier Climber  
5. Compliance Gauntlet  
6. Loan Disbursement Sprint  
7. Warning & Exit Simulator  

Creator can add more game types.  
DH pastes SOP/policy → app ranks best existing game types → Start / Upgrade.  
Version history stores date/time/year and supports rollback.

---

## Career Run gameplay

- Human male/female character select  
- 3-lane money run (temple-run style)  
- Right answers / clean tactics → wealth up  
- Wrong answers / traps → wealth down  
- Failure fates: sacked · merge with big CDL · join BD team · sell & resign  

Controls:
- Desktop: `←` `→` or `A` `D` lanes · `Space` jump  
- Mobile: tap left/right thirds · center/swipe up jump  

---

## Deploy

### Vercel (recommended)

```bash
npm run build
cd dist
npx vercel --prod
```

Project name to use:

```text
opay-field-operations-app
```

Desired domain:

```text
https://opay-field-operations-app.vercel.app
```

### GitHub Pages

1. Push this repo to `victorhamvida-dotcom/opay-field-operations-app`
2. Settings → Pages → Deploy from branch `gh-pages` **or** use `dist` via GitHub Action
3. Because build is single-file, you can also copy `dist/index.html` to `docs/index.html` and set Pages source to `/docs`

### Netlify Drop

Upload the `dist` folder to [https://app.netlify.com/drop](https://app.netlify.com/drop).

---

## Project structure

```text
src/
  App.tsx
  components/          # UI, auth, game, DH, Creator tools
  types/               # staff registry, geography, game catalog/versioning
  i18n/                # multi-language login packs
  utils/               # sound + browser compatibility
public/brand/          # optional external brand assets
dist/index.html        # production single-file build
```

---

## Documentation index

- [DEPLOY_AND_SHARE.md](./DEPLOY_AND_SHARE.md) — share with boss / field teams  
- [docs/USER_GUIDE.md](./docs/USER_GUIDE.md) — how each role uses the app  
- [docs/CREATOR_ADMIN.md](./docs/CREATOR_ADMIN.md) — Creator controls  
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — technical overview  

---

## Security notes

- Demo auth/storage is browser `localStorage` (suitable for training prototype)
- For enterprise production: move staff registry, passwords, and versioning to a real backend + hashed credentials
- Do not publish Creator password publicly

---

## License / ownership

© Hamvida Tech · Built for OPay field operations training use.  
GitHub: [victorhamvida-dotcom](https://github.com/victorhamvida-dotcom)
