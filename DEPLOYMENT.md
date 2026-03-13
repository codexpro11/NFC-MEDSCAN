# 🚀 NFC MedScan — Deployment Guide (Render + Vercel)

Deploy your full-stack NFC MedScan project using **Render** (backend) + **Vercel** (frontends).

---

## Architecture Overview

```
Render                         Vercel (Project 1)         Vercel (Project 2)
─────────────────              ──────────────────         ──────────────────
Spring Boot Backend      ←──  Patient Portal             Hospital Portal
https://nfc-medscan            FRONTEND/frontend/         FRONTEND/hospital-portal/
  .onrender.com
```

---

## Step 1: Deploy Backend on Render

### 1a. Push code to GitHub
Make sure your project is pushed to GitHub.

### 1b. Create Render Web Service
1. Go to [dashboard.render.com](https://dashboard.render.com) → **New** → **Web Service**
2. Connect your GitHub repo
3. Set **Root Directory** → `BACKEND-END`
4. Render auto-detects the `Dockerfile` and builds it

### 1c. Add PostgreSQL database
1. In your Render dashboard → **New** → **PostgreSQL**
2. Copy the **Internal Database URL** for use in env vars

### 1d. Set Environment Variables on Render

Go to your backend service → **Environment** tab → Add:

| Variable | Value |
|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `SPRING_DATASOURCE_URL` | Internal DB URL from Render PostgreSQL |
| `SPRING_DATASOURCE_USERNAME` | (from Render PostgreSQL) |
| `SPRING_DATASOURCE_PASSWORD` | (from Render PostgreSQL) |
| `JWT_SECRET` | Run: `openssl rand -hex 64` and paste result |
| `GOOGLE_CLIENT_ID` | `63948650748-1olrtlc2d8q20q4j021oat40lu6tvin6.apps.googleusercontent.com` |
| `CORS_ALLOWED_ORIGINS` | `https://nfc-medscan-eight.vercel.app,https://nfc-hospital-portal.vercel.app` |

> ⚠️ Fill in CORS_ALLOWED_ORIGINS AFTER you deploy both Vercel apps (Step 3 & 4).

### 1e. Get your backend URL
After deploy, Render gives you: `https://nfc-medscan.onrender.com`
Test: `https://nfc-medscan.onrender.com/actuator/health`

---

## Step 2: Verify Frontend .env Files

Both frontend `.env.production` files point to Render:

```
# FRONTEND/frontend/.env.production
VITE_API_URL=https://nfc-medscan.onrender.com/api
VITE_GOOGLE_CLIENT_ID=63948650748-1olrtlc2d8q20q4j021oat40lu6tvin6.apps.googleusercontent.com

# FRONTEND/hospital-portal/.env.production
VITE_API_URL=https://nfc-medscan.onrender.com/api
VITE_GOOGLE_CLIENT_ID=63948650748-1olrtlc2d8q20q4j021oat40lu6tvin6.apps.googleusercontent.com
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
| `VITE_API_URL` | `https://nfc-medscan.onrender.com/api` |
| `VITE_GOOGLE_CLIENT_ID` | `63948650748-1olrtlc2d8q20q4j021oat40lu6tvin6.apps.googleusercontent.com` |

5. Deploy → URL: `https://nfc-medscan-eight.vercel.app`

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
| `VITE_API_URL` | `https://nfc-medscan.onrender.com/api` |
| `VITE_GOOGLE_CLIENT_ID` | `63948650748-1olrtlc2d8q20q4j021oat40lu6tvin6.apps.googleusercontent.com` |

4. Deploy → URL: `https://nfc-hospital-portal.vercel.app`

---

## Step 5: Update CORS on Render ⚠️ CRITICAL

After both Vercel deploys, go back to **Render** → your backend service → **Environment**:

Update `CORS_ALLOWED_ORIGINS`:
```
CORS_ALLOWED_ORIGINS=https://nfc-medscan-eight.vercel.app,https://nfc-hospital-portal.vercel.app
```

Render will auto-redeploy. This allows the browser to call your backend without CORS errors.

---

## Step 6: Test End-to-End

1. **Patient Portal** → Register → Login → Fill medical profile → Link NFC card
2. **Hospital Portal** → Staff login → Scan NFC ID → View patient → AI suggestions
3. **Health Check** → `https://nfc-medscan.onrender.com/actuator/health`

---

## Your Live URLs

| Service | URL |
|---|---|
| Backend API | `https://nfc-medscan.onrender.com` |
| Health Check | `https://nfc-medscan.onrender.com/actuator/health` |
| Patient Portal | `https://nfc-medscan-eight.vercel.app` |
| Hospital Portal | `https://nfc-hospital-portal.vercel.app` |

---

## Troubleshooting

| Issue | Fix |
|---|---|
| CORS error in browser | Update `CORS_ALLOWED_ORIGINS` on Render — must match Vercel URLs exactly, no trailing slash |
| Blank page on Vercel | Check `VITE_API_URL` is set in Vercel env vars → Redeploy |
| 404 on page refresh | `vercel.json` with rewrites is already in both frontend folders ✅ |
| DB connection refused | Check Render PostgreSQL Internal URL in `SPRING_DATASOURCE_URL` |
| Login fails / 403 | Ensure `JWT_SECRET` is set on Render (min 64 chars) |
| Google login fails | Ensure `GOOGLE_CLIENT_ID` matches in Render + Vercel env vars |
| Render cold start slow | Free tier spins down after inactivity — first request takes ~30s |
