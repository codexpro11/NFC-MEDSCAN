# 🚀 NFC MedScan — Free Cloud Deployment Guide

Deploy your full-stack NFC MedScan project for **free** using Vercel (frontends) + Render (backend) + Aiven (MySQL).

---

## Prerequisites

- **GitHub account** with your code pushed to a repo
- Free accounts on: [Vercel](https://vercel.com), [Render](https://render.com), [Aiven](https://aiven.io)

---

## Step 1: Set Up Cloud MySQL (Aiven)

1. Sign up at [aiven.io](https://aiven.io)
2. Create a **MySQL** service (free plan)
3. Note down your connection details:
   - **Host**: `mysql-xxxx.aiven.io`
   - **Port**: `12345`
   - **Database**: `defaultdb` (or create `nfc_health_db`)
   - **User**: `avnadmin`
   - **Password**: `(provided by Aiven)`
   - **SSL**: Required (Aiven enforces SSL by default)

> **Alternative:** [Railway](https://railway.app) gives $5/month free credit with a MySQL plugin.

---

## Step 2: Deploy Backend on Render

1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Root Directory**: `BACKEND-END`
   - **Runtime**: `Docker`
   - **Instance Type**: `Free`
4. Add **Environment Variables**:

| Variable | Value |
|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://YOUR_AIVEN_HOST:PORT/nfc_health_db?useSSL=true&requireSSL=true` |
| `SPRING_DATASOURCE_USERNAME` | `avnadmin` |
| `SPRING_DATASOURCE_PASSWORD` | `(your Aiven password)` |
| `JWT_SECRET` | `(generate with: openssl rand -hex 64)` |
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `CORS_ALLOWED_ORIGINS` | `https://your-patient-portal.vercel.app,https://your-hospital-portal.vercel.app` |

5. Deploy → wait for build (~5 min)
6. Note your backend URL: `https://nfc-medscan-xxx.onrender.com`
7. Test: visit `https://nfc-medscan-xxx.onrender.com/swagger-ui.html`

> ⚠️ **Render free tier** spins down after 15 min of inactivity. First request after idle takes ~30s.

---

## Step 3: Deploy Patient Portal on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Configure:
   - **Root Directory**: `FRONTEND/frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variable**:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://nfc-medscan-xxx.onrender.com/api` |

5. Deploy → your Patient Portal is live! 🎉

---

## Step 4: Deploy Hospital Portal on Vercel

1. **New Project** on Vercel → Import the **same** GitHub repo
2. Configure:
   - **Root Directory**: `FRONTEND/hospital-portal`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add **Environment Variable**:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://nfc-medscan-xxx.onrender.com/api` |

4. Deploy → your Hospital Portal is live! 🎉

---

## Step 5: Update Backend CORS

After both Vercel deployments, go back to **Render** and update:

```
CORS_ALLOWED_ORIGINS=https://patient-portal-xxx.vercel.app,https://hospital-portal-xxx.vercel.app
```

Render will auto-redeploy.

---

## Step 6: Test End-to-End

1. Open **Patient Portal** → Register → Login → Fill medical profile → Link NFC card
2. Open **Hospital Portal** → Staff login → Scan NFC ID → View patient → AI suggestions
3. Check **Swagger UI** at `https://your-backend.onrender.com/swagger-ui.html`

---

## Your Live URLs

| Service | URL |
|---|---|
| Patient Portal | `https://your-patient-portal.vercel.app` |
| Hospital Portal | `https://your-hospital-portal.vercel.app` |
| Backend API | `https://your-backend.onrender.com` |
| Swagger UI | `https://your-backend.onrender.com/swagger-ui.html` |

> Share these links with your team — anyone can access them from anywhere! 🌍

---

## Troubleshooting

| Issue | Fix |
|---|---|
| CORS errors in browser | Check `CORS_ALLOWED_ORIGINS` on Render matches your Vercel URLs exactly (no trailing slash) |
| Backend takes 30s to respond | Render free tier cold start — wait for it to wake up |
| Database connection refused | Check Aiven host/port/SSL settings in `SPRING_DATASOURCE_URL` |
| Frontend shows blank page | Check `VITE_API_URL` is set correctly in Vercel env vars, redeploy |
| Login fails | Ensure `JWT_SECRET` is set on Render (min 64 chars) |
