# How to Deploy, Share with Your Boss, and Keep Editing

You built: **OPay CDL Policy & Merchant Loan Disbursement Simulator**  
Creator login: password only → `77075107` → signs in as **Hamzat Victor Chisom**

This project builds into **one single HTML file** (`dist/index.html`). That makes sharing extremely easy.

---

## Option A — Fastest for your boss (5 minutes, no coding)

### 1. Build the app
On your computer, in this project folder:

```bash
npm install
npm run build
```

This creates: `dist/index.html` (everything is already inside that one file).

### 2. Upload it (pick ONE)

| Method | Steps | Best for |
|--------|--------|----------|
| **Netlify Drop** | Go to [https://app.netlify.com/drop](https://app.netlify.com/drop) → drag the whole `dist` folder | Fast public link |
| **Vercel** | [https://vercel.com/new](https://vercel.com/new) → Import project or drag `dist` | Clean company-looking URL |
| **Cloudflare Pages** | [https://dash.cloudflare.com](https://dash.cloudflare.com) → Pages → Upload assets → upload `dist` | Free + fast |
| **Email / WhatsApp file** | Attach `dist/index.html` and tell boss: open in Chrome | Offline / no hosting |

### 3. Send your boss this message (copy/paste)

```
Sir/Ma,

Please review the OPay CDL Policy & Merchant Loan Disbursement Simulator:
👉 [PASTE YOUR LINK HERE]

How to open:
1. Click the link (Chrome or Edge recommended)
2. On the Access Portal choose:
   • Play as Guest  → try the full field simulator as a CDL
   • Creator        → only for me (Hamzat Victor Chisom)

What to test:
• Catch only green ✓ cards (right loan / POS approaches score points)
• Avoid red ✗ cards (wrong approaches = 0 pts + tier risk)
• Open "Deploy POS" to improve tier (POS Volume + Quality + Loans + Compliance)
• Try Merchant Scenarios + Policy Exam
• Leave feedback with the Feedback button (I will iterate from your notes)

Ranking rule: higher score wins; same score band → less time ranks higher.

Thank you.
— Hamzat Victor Chisom
```

---

## Option B — Keep editing after feedback (recommended workflow)

```
  YOU (Creator)                    BOSS
  ─────────────                    ────
  1. Edit code locally
  2. npm run build
  3. Re-upload dist/  ──────────►  Opens same link (or new link)
  4. Read Feedback Board
  5. Improve → rebuild → re-upload
```

### Local edit loop
```bash
npm run dev          # live preview while you edit (http://localhost:5173)
# ... make changes ...
npm run build        # produce fresh dist/index.html
# re-upload dist to Netlify/Vercel/Cloudflare
```

### Creator privileges after deploy
1. Open the live link  
2. Click **Creator**  
3. Enter password: `77075107`  
4. You are signed in as **Hamzat Victor Chisom**  
5. You get:
   - Full simulator
   - **Reset Pass** console (help locked CDL accounts)
   - **Feedback Board** (read boss / guest notes and mark them Done)
   - Exit / switch account anytime

Guests and your boss should use **Play as Guest** only.

---

## Option C — GitHub + auto-deploy (best long-term)

1. Create a GitHub repo and push this project.
2. Connect the repo to **Vercel** or **Netlify** (Import from GitHub).
3. Every time you `git push`, the site rebuilds automatically.
4. Boss always uses the **same permanent URL**.

```bash
git init
git add .
git commit -m "OPay CDL Policy Simulator v1"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/opay-cdl-simulator.git
git push -u origin main
```

Then in Vercel: **Add New Project → Import that repo → Deploy**.

---

## Security notes (important)

- Creator password is currently embedded for this internal training tool (`77075107`).
- For a public internet link, treat it as **internal-only**. Do not post on social media.
- If you need stronger security later, we can add a real backend login.
- Feedback is stored in the browser `localStorage` of whoever is using the device. For multi-device shared feedback, use the **Copy all feedback** button and paste into WhatsApp/Email, or we can later connect a simple form backend (Formspree / Google Sheet).

---

## Quick checklist before you send to boss

- [ ] `npm run build` succeeds with no errors  
- [ ] Open `dist/index.html` once yourself  
- [ ] Test **Creator** login with `77075107`  
- [ ] Test **Play as Guest**  
- [ ] Confirm OPay logo, timer, ✓/✗ cards, Deploy POS, Feedback button all work  
- [ ] Upload `dist` and copy the public URL  
- [ ] Send the boss message template above  

---

## After boss feedback

1. Open the app as **Creator**  
2. Open **Feedback** board → review notes  
3. Edit the relevant files under `src/`  
4. `npm run build`  
5. Re-upload `dist`  
6. Reply to boss: “Updated — please refresh the same link”

You stay in control. Boss only needs a browser.
