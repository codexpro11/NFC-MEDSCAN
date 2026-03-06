# 🚀 NFC MedScan — Deployment Guide (Railway + Vercel)

Deploy your full-stack NFC MedScan project using **Railway** (backend) + **Vercel** (frontends).

---

## Architecture Overview

```
Railway                        Vercel (Project 1)         Vercel (Project 2)
─────────────────              ──────────────────         ──────────────────
Spring Boot Backend      ←──  Patient Portal             Hospital Portal
https://nfc-medscan-           FRONTEND/frontend/         FRONTEND/hospital-portal/
production.up.railway.app
```

---

## Step 1: Deploy Backend on Railway

### 1a. Push code to GitHub
Make sure your project is pushed to GitHub.

### 1b. Create Railway service
1. Go to [railway.app](https://railway.app) → **New Project**
2. **Deploy from GitHub repo** → Select your repo
3. Set **Root Directory** → `BACKEND-END`
4. Railway auto-detects the `Dockerfile` and builds it

### 1c. Add MySQL database
1. In your Railway project → **+ New** → **Database** → **MySQL**
2. Railway auto-injects `MYSQL_URL`, copy the connection details

### 1d. Set Environment Variables on Railway

Go to your backend service → **Variables** tab → Add:

| Variable | Value |
|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://YOUR_RAILWAY_MYSQL_HOST:PORT/railway?createDatabaseIfNotExist=true` |
| `SPRING_DATASOURCE_USERNAME` | `root` (from Railway MySQL) |
| `SPRING_DATASOURCE_PASSWORD` | (from Railway MySQL) |
| `JWT_SECRET` | Run: `openssl rand -hex 64` and paste result |
| `GOOGLE_CLIENT_ID` | `1043021546443-8885535838085495587.apps.googleusercontent.com` |
| `CORS_ALLOWED_ORIGINS` | `https://YOUR-PATIENT-PORTAL.vercel.app,https://YOUR-HOSPITAL-PORTAL.vercel.app` |

> ⚠️ Fill in CORS_ALLOWED_ORIGINS AFTER you deploy both Vercel apps (Step 3 & 4).

### 1e. Get your backend URL
After deploy, Railway gives you: `https://nfc-medscan-production.up.railway.app`
Test: `https://nfc-medscan-production.up.railway.app/swagger-ui.html`

---

## Step 2: Verify Frontend .env Files

Both frontend `.env.production` files are already configured to point to Railway:

```
# FRONTEND/frontend/.env.production
VITE_API_URL=https://nfc-medscan-production.up.railway.app/api
VITE_GOOGLE_CLIENT_ID=1043021546443-8885535838085495587.apps.googleusercontent.com

# FRONTEND/hospital-portal/.env.production
VITE_API_URL=https://nfc-medscan-production.up.railway.app/api
VITE_GOOGLE_CLIENT_ID=1043021546443-8885535838085495587.apps.googleusercontent.com
```

> ✅ These are already set correctly — no changes needed.

---

## Step 3: Deploy Patient Portal on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Configure:
   - **Root Directory**: `FRONTEND/frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variables** in Vercel dashboard:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://nfc-medscan-production.up.railway.app/api` |
| `VITE_GOOGLE_CLIENT_ID` | `1043021546443-8885535838085495587.apps.googleusercontent.com` |

5. Deploy → Note your URL: `https://YOUR-PATIENT-PORTAL.vercel.app`

---

## Step 4: Deploy Hospital Portal on Vercel

1. **New Project** on Vercel → Import the **same** GitHub repo
2. Configure:
   - **Root Directory**: `FRONTEND/hospital-portal`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add **Environment Variables**:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://nfc-medscan-production.up.railway.app/api` |
| `VITE_GOOGLE_CLIENT_ID` | `1043021546443-8885535838085495587.apps.googleusercontent.com` |

4. Deploy → Note your URL: `https://YOUR-HOSPITAL-PORTAL.vercel.app`

---

## Step 5: Update CORS on Railway ⚠️ CRITICAL

After both Vercel deploys, go back to **Railway** → your backend service → **Variables**:

Update `CORS_ALLOWED_ORIGINS`:
```
CORS_ALLOWED_ORIGINS=https://YOUR-PATIENT-PORTAL.vercel.app,https://YOUR-HOSPITAL-PORTAL.vercel.app
```

Railway will auto-redeploy. This allows the browser to call your backend without CORS errors.

---

## Step 6: Test End-to-End

1. **Patient Portal** → Register → Login → Fill medical profile → Link NFC card
2. **Hospital Portal** → Staff login → Scan NFC ID → View patient → AI suggestions
3. **Swagger UI** → `https://nfc-medscan-production.up.railway.app/swagger-ui.html`

---

## Your Live URLs

| Service | URL |
|---|---|
| Backend API | `https://nfc-medscan-production.up.railway.app` |
| Swagger UI | `https://nfc-medscan-production.up.railway.app/swagger-ui.html` |
| Patient Portal | `https://YOUR-PATIENT-PORTAL.vercel.app` |
| Hospital Portal | `https://YOUR-HOSPITAL-PORTAL.vercel.app` |

---

## Troubleshooting

| Issue | Fix |
|---|---|
| CORS error in browser | Update `CORS_ALLOWED_ORIGINS` on Railway — must match Vercel URLs exactly, no trailing slash |
| Blank page on Vercel | Check `VITE_API_URL` is set in Vercel env vars → Redeploy |
| 404 on page refresh | `vercel.json` with rewrites is already in both frontend folders ✅ |
| DB connection refused | Check Railway MySQL host/port in `SPRING_DATASOURCE_URL` |
| Login fails / 403 | Ensure `JWT_SECRET` is set on Railway (min 64 chars) |
| Google login fails | Ensure `GOOGLE_CLIENT_ID` matches in Railway + Vercel env vars |
