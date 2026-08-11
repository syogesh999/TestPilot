# TestPilot — Production Deployment Guide

This document outlines the primary production deployment procedure for TestPilot using **Render** and **MongoDB Atlas**.

---

## 🏗️ Production Architecture

```text
                               GitHub Repository
                             (syogesh999/TestPilot)
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
         Frontend Static Site                    Backend Web Service
             (testpilot-web)                       (testpilot-api)
          Root Dir: `client`                       Root Dir: `server`
          Build: `npm run build`                   Build: `npm install`
          Publish: `dist`                          Start: `node src/server.js`
                    │                                     │
                    │                                     ├── MongoDB Atlas M0 Free
                    │                                     │
                    └─────────── HTTPS REST ──────────────┴── Playwright APIRequestContext
```

---

## 🛠️ Step 1: Set Up MongoDB Atlas (Database)

1. Sign up or log into [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 Shared Cluster**.
3. Under **Database Access**, create a user (e.g. `testpilot_admin`) and generate a secure password.
4. Under **Network Access**, add IP address `0.0.0.0/0` (Allow Access from Anywhere).
5. Click **Connect** $\rightarrow$ **Drivers** $\rightarrow$ copy your `MONGODB_URI`:
   ```env
   MONGODB_URI=mongodb+srv://testpilot_admin:<password>@cluster0.mongodb.net/testpilot?retryWrites=true&w=majority
   ```

---

## 🚀 Step 2: Deploying to Render (1-Click Blueprint)

1. Log into [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** $\rightarrow$ **Blueprints**.
3. Connect your GitHub repository: `https://github.com/syogesh999/TestPilot`.
4. Render will automatically detect `render.yaml` and provision both services:
   - `testpilot-api` (Backend Express Web Service)
   - `testpilot-web` (Frontend React Static Site)
5. In **`testpilot-api` Environment Variables**, add your `MONGODB_URI` connection string.

---

## 📊 Environment Variable Reference

| Variable | Scope | Required | Default / Description |
| :--- | :---: | :---: | :--- |
| `NODE_ENV` | Backend | **Yes** | `production` |
| `PORT` | Backend | **Yes** | Set automatically by Render (`10000`) |
| `MONGODB_URI` | Backend | Optional | MongoDB Atlas connection string |
| `JWT_SECRET` | Backend | **Yes** | Secure 32+ char random string |
| `CLIENT_URL` | Backend | **Yes** | `https://testpilot-web.onrender.com` *(or `*`)* |
| `VITE_API_URL` | Frontend | **Yes** | `https://testpilot-api.onrender.com/api` |
| `OPENAI_API_KEY` | Backend | Optional | `sk-...` *(for Cloud GPT-4o AI report explanations)* |

---

## 🧪 Post-Deployment Verification

1. **Health Check**: Open `https://testpilot-api.onrender.com/api/health` in your browser. Expected response:
   ```json
   {
     "success": true,
     "service": "testpilot-api",
     "status": "healthy"
   }
   ```
2. **Frontend UI**: Open `https://testpilot-web.onrender.com/`. Click **Launch instant Demo Workspace** to verify authentication, OpenAPI spec import, and automated Playwright execution.
