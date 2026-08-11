# GitHub Actions CI/CD Deployment Guide (100% Free Tier)

TestPilot includes a complete **GitHub Actions CI/CD Pipeline** (`.github/workflows/ci.yml`) optimized for GitHub's free tier (2,000 free runner minutes/month for public repositories).

---

## 🏗️ Pipeline Overview

When you push code to `main` or `develop`, or open a Pull Request, GitHub Actions automatically executes:

```text
Push to main / develop / PR
           │
           ▼
┌───────────────────────────────────────┐
│ Job 1: 🧪 Lint & Unit Tests           │
│ - Node.js 20 on ubuntu-latest          │
│ - npm cache & workspace install       │
│ - Jest Unit Tests (OpenAPI/Scorer)    │
│ - Vite Client Build Validation        │
└──────────────────┬────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────┐
│ Job 2: 🚀 Integration & Health Check  │
│ - Boots Target Sample API (Port 4000) │
│ - Boots TestPilot Server (Port 5000)  │
│ - Verifies /api/health response        │
└──────────────────┬────────────────────┘
```

---

## 🛠️ Step-by-Step GitHub Setup

### 1. Push Your Code & Workflow to GitHub
Ensure you push your current `develop` and `main` branches to GitHub:

```bash
# Push develop branch
git add .
git commit -m "ci: add GitHub Actions workflow for automated testing"
git push -u origin develop

# Push main branch
git checkout main
git merge develop
git push -u origin main
git checkout develop
```

### 2. Verify Actions Status on GitHub
1. Open your repository: `https://github.com/syogesh999/TestPilot`
2. Click the **Actions** tab at the top.
3. You will see **"TestPilot CI/CD Pipeline"** running with live logs for Unit Tests, Vite Client Build, and Server Health Verification.

### 3. Add Build Status Badge to GitHub README
Your `README.md` contains the status badge syntax:

```markdown
![TestPilot CI/CD](https://github.com/syogesh999/TestPilot/actions/workflows/ci.yml/badge.svg)
```
