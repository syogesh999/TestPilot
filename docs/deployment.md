# TestPilot — Production Deployment Guide

This document outlines the standard production deployment procedure for TestPilot.

---

## 🏗️ Production Architecture

```text
                               GitHub Repository
                             (syogesh999/TestPilot)
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
         Frontend Static Assets                  Backend Web Service
             (React 18 SPA)                        (Express.js Engine)
          Root Dir: `client`                       Root Dir: `server`
          Build: `npm run build`                   Build: `npm install`
          Publish: `dist`                          Start: `node src/server.js`
                    │                                     │
                    │                                     ├── MongoDB Atlas M0 / Production DB
                    │                                     │
                    └─────────── HTTPS REST ──────────────┴── Playwright APIRequestContext
```

---

## 🛠️ Step 1: Set Up MongoDB Production Database

1. Create a MongoDB database cluster (such as [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)).
2. Under **Database Access**, create a user (e.g. `testpilot_admin`) and generate a secure password.
3. Under **Network Access**, configure IP whitelist settings for your server instance.
4. Copy your connection string:
   ```env
   MONGODB_URI=mongodb+srv://testpilot_admin:<password>@cluster0.mongodb.net/testpilot?retryWrites=true&w=majority
   ```

---

## 🚀 Step 2: Deploying the Backend API Engine

- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `node src/server.js`
- **Health Check Path**: `/api/health`

### Environment Variables:
- `NODE_ENV` = `production`
- `PORT` = `5000` *(or assigned cloud port)*
- `JWT_SECRET` = `your_secure_32char_jwt_secret_key`
- `CLIENT_URL` = `https://your-frontend-domain.com`
- `MONGODB_URI` = `mongodb+srv://...`

---

## 🌐 Step 3: Deploying the Frontend Static Site

- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **SPA Rewrite Rule**: Source `/*` $\rightarrow$ Destination `/index.html`

### Environment Variables:
- `VITE_API_URL` = `https://your-backend-domain.com/api`

---

## 📊 Environment Variable Reference

| Variable | Scope | Required | Default / Description |
| :--- | :---: | :---: | :--- |
| `NODE_ENV` | Backend | **Yes** | `production` |
| `PORT` | Backend | **Yes** | Cloud server port |
| `MONGODB_URI` | Backend | Recommended | Production MongoDB connection string |
| `JWT_SECRET` | Backend | **Yes** | Secure 32+ char random string |
| `CLIENT_URL` | Backend | **Yes** | Production frontend URL |
| `VITE_API_URL` | Frontend | **Yes** | Production backend API endpoint URL |
| `OPENAI_API_KEY` | Backend | Optional | `sk-...` *(for Cloud GPT-4o AI report explanations)* |

---

## 🧪 Post-Deployment Verification

1. **Health Check**: Open `https://your-backend-domain.com/api/health` in your browser. Expected response:
   ```json
   {
     "success": true,
     "service": "testpilot-api",
     "status": "healthy"
   }
   ```
2. **Frontend UI**: Open `https://your-frontend-domain.com/`. Click **Launch instant Demo Workspace** to verify authentication, OpenAPI spec import, and automated Playwright execution.
