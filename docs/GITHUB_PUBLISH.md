# Publish to GitHub (`victorhamvida-dotcom`)

This environment cannot push to your private GitHub credentials automatically.
Follow these steps on your machine (or GitHub web UI) to put the full project on your account.

---

## Option A — GitHub CLI (recommended)

```bash
# in project root
npm install
npm run build

git init
git branch -m main
git add .
git commit -m "OPay Field Operations App by Hamvida Tech"

# create repo under your account
gh repo create victorhamvida-dotcom/opay-field-operations-app --public --source=. --remote=origin --push
```

---

## Option B — Manual

1. Open https://github.com/new  
2. Repository name: `opay-field-operations-app`  
3. Public  
4. Create repository  
5. Locally:

```bash
git remote add origin https://github.com/victorhamvida-dotcom/opay-field-operations-app.git
git push -u origin main
```

---

## Enable GitHub Pages (optional)

Because the build is a single file:

```bash
mkdir -p docs-site
cp dist/index.html docs-site/index.html
git add docs-site
git commit -m "Add GitHub Pages site bundle"
git push
```

Then:
- Repo → **Settings → Pages**
- Source: Deploy from branch `main` / folder `/docs-site`  
  (or use `/docs` if you prefer that folder name)

Site URL example:

```text
https://victorhamvida-dotcom.github.io/opay-field-operations-app/
```

---

## Vercel from GitHub (best permanent demo)

1. https://vercel.com/new  
2. Import `opay-field-operations-app`  
3. Framework: Vite  
4. Build command: `npm run build`  
5. Output directory: `dist`  
6. Project name: `opay-field-operations-app`  

Production domain:

```text
https://opay-field-operations-app.vercel.app
```

---

## Repo checklist before sharing

- [x] Hamvida Tech branding in footer/login  
- [x] README + docs  
- [x] `.gitignore` excludes `node_modules`  
- [x] Single-file production build works  
- [x] Creator / DH / Staff / Guest flows documented  

---

Made by **Hamvida Tech** · https://github.com/victorhamvida-dotcom
