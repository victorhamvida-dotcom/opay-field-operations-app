# Publish NOW — Hamvida Tech / OPay Field Operations App

You already have an older Vercel app:
`https://rushing-sycamore-fw0tbru.vercel.app/`

That URL does **not** auto-update unless we deploy into that same Vercel project with your login/token.

## Fastest path (same style as last time)

### 1) Claim the latest temporary deploy
Use the **Claim link** from the latest deploy message in chat.
Sign in with GitHub: `victorhamvida-dotcom`.

### 2) Rename project (so URL contains app name)
Vercel → Project → Settings → General → Project Name:

```text
opay-field-operations-app
```

Desired public URL:

```text
https://opay-field-operations-app.vercel.app
```

(If Vercel keeps a suffix, that is normal for some accounts.)

### 3) Put full source + docs on GitHub
Create empty repo:
https://github.com/new  
Name: `opay-field-operations-app` (Public)

Then on your computer in this project folder:

```bash
git remote remove origin 2>/dev/null
git remote add origin https://github.com/victorhamvida-dotcom/opay-field-operations-app.git
git branch -M main
git push -u origin main
```

Or with GitHub CLI:

```bash
gh repo create victorhamvida-dotcom/opay-field-operations-app --public --source=. --remote=origin --push
```

### 4) Connect Vercel ← GitHub (permanent auto updates)
1. Vercel → Add New Project  
2. Import `opay-field-operations-app`  
3. Build: `npm run build`  
4. Output: `dist`  
5. Deploy  

After that, every `git push` updates the live app automatically.

---

## What is already done in this codebase
- Hamvida Tech logo + “Made by Hamvida Tech” footer
- Full docs (`README.md`, `docs/*`)
- Staff/DH/Creator systems
- Multi-game studio + version rollback
- Career run + gender analytics + geography
- Production build in `dist/index.html`

## Creator login
Password: `77075107`

---

Made by **Hamvida Tech**
