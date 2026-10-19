# Architecture Overview

**OPay Field Operations App**  
**Made by Hamvida Tech**

---

## Stack

- React 19 + TypeScript  
- Vite 7 + `vite-plugin-singlefile` (one `dist/index.html`)  
- Tailwind CSS 4  
- Web Audio synthesized SFX/music (no media binaries required)  
- Browser storage for prototype data (`localStorage` / `sessionStorage` with fallbacks)

---

## Major modules

| Module | Responsibility |
|--------|----------------|
| `AuthModal` | Creator / Staff / DH / Guest entry, languages, registration |
| `staffRegistry` | Accounts, duplicate checks, hierarchy helpers, gender analytics |
| `nigeriaGeography` | 36 states + FCT, Lagos North/South, daily geo check |
| `CareerRunCanvas` | Animated money-lane runner + decision gates |
| `CharacterSelect` | Human male/female heroes |
| `DHAnalyticsDashboard` | Analytics, transfers, SM/RM map, gender |
| `CreatorStaffAdmin` | Manual staff ops |
| `PolicyGameStudio` | Game catalog, SOP recommendations, versions |
| `gameCatalog` | 7+ game types + Creator extensions |
| `gameVersioning` | Active config + rollback timeline |
| `browserCompat` | Safari/Android/desktop polyfills |
| `HamvidaBrand` | Company credit mark |

---

## Data keys (browser)

- `opay_staff_registry_v1`  
- `opay_game_type_catalog_v1`  
- `opay_game_active_config_v1`  
- `opay_game_versions_v1`  
- `opay_nigeria_geo_v2`  
- auth session keys / user prefs  

---

## Hierarchy model

```text
DH (no mandatory geo)
 └─ RM (multi region/state, may supervise RMs)
     └─ SM (state owner)
         └─ CDLM (state coverage under SM)
             └─ CDL (merchant face)
                 └─ Merchant
```

---

## Deploy artifact

`npm run build` → `dist/index.html` single file (JS/CSS inlined).  
Ideal for Vercel/Netlify/GitHub Pages quick hosting.

---

## Security posture (current)

Prototype-grade client storage. Suitable for demos/training pilots.  
Enterprise production requires backend services.

---

© Hamvida Tech
