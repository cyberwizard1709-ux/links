# Deployment Guide

## 1. Push to GitHub

### Step 1: Initialize Git (if not done)
```bash
git init
```

### Step 2: Add all files
```bash
git add .
```

### Step 3: Commit
```bash
git commit -m "Initial commit - Link Directory with blog"
```

### Step 4: Create GitHub Repo
Go to https://github.com/new and create a new repository

### Step 5: Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

---

## 2. Deploy on Vercel

### Step 1: Connect to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Select the repository

### Step 2: Configure Environment Variables
Add these environment variables in Vercel dashboard:

```
DATABASE_URL=libsql://esc-testtt.aws-us-east-1.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njk4ODYyMTYsImlkIjoiMTY5ODc1YzctYzhmMS00Mjc2LTg4MDktNGQwODUzYTBhZDA3IiwicmlkIjoiODBmMjY3ZTAtOWU0YS00NWFlLWFlMzctZjZiZWUwYmYzODg1In0.VxT3dxITZNYb6bXBNhuyDkc2NsJrhMkzcBqdQx8dN0KzEmwsR_iVhDGDKyUIcpYEahgSqgeSZTq57jqzaIz0Bg
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key-change-this-in-production
```

**Important:** Change `NEXTAUTH_SECRET` to a random string in production!

### Step 3: Deploy
Click "Deploy" and wait for build to complete.

---

## 3. Database Configuration

Your Turso database is already set up and will work with Vercel automatically since it's a remote database.

---

## 4. Post-Deploy Steps

1. Visit your deployed URL
2. Go to `/admin/login`
3. Login with: `fiverrpanel@gmail.com` / `a17092000`
4. Start adding your links!

---

## Notes

- **.env file is NOT committed** (it's in .gitignore)
- **Turso database** is remote and shared between local and production
- **Images** should be stored in `/public` folder or use external CDN
