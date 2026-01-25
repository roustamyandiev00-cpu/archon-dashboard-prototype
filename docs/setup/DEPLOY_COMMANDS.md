# 🚀 Firebase Deploy Commands - Quick Reference

## ✅ Fixed: No More 403 Data Connect Errors!

---

## 🎯 Quick Deploy (Most Common)

```bash
# Build and deploy in one command
pnpm run build && firebase deploy --only hosting
```

---

## 📋 Step-by-Step Deploy

```bash
# 1. Build the app
pnpm run build

# 2. Verify build output
ls -la dist/client
# Should show: index.html, assets/, images/, etc.

# 3. Deploy to Firebase
firebase deploy --only hosting

# 4. Open deployed site
open https://archonpro.web.app
```

---

## 🛠️ Deploy Options

### Hosting Only (Fastest)
```bash
firebase deploy --only hosting
```

### Hosting + Firestore Rules
```bash
firebase deploy --only hosting,firestore
```

### Hosting + Storage Rules
```bash
firebase deploy --only hosting,storage
```

### Everything (Hosting + Rules)
```bash
firebase deploy --only hosting,firestore,storage
```

### Full Deploy (Not Recommended - includes unused services)
```bash
firebase deploy
```

---

## 🔍 Verification Commands

```bash
# Check which project is active
firebase use

# List hosting sites
firebase hosting:sites:list

# Get site details
firebase hosting:sites:get archonpro

# Check deployment history
firebase hosting:channel:list archonpro

# Test the deployed site
curl -I https://archonpro.web.app
```

---

## 🧪 Test Before Deploy

```bash
# Dry run (check config without deploying)
firebase deploy --only hosting --dry-run

# Test locally with emulators
firebase emulators:start

# Build and preview locally
pnpm run build
pnpm run preview
```

---

## 🚨 Troubleshooting

### Build Fails
```bash
# Clean and rebuild
rm -rf dist node_modules
pnpm install
pnpm run build
```

### Deploy Fails
```bash
# Check Firebase login
firebase login --reauth

# Check project
firebase use ai-agent-5fab0

# Clear cache and retry
rm -rf .firebase
firebase deploy --only hosting
```

### Wrong Site Deployed
```bash
# Verify firebase.json has correct site
cat firebase.json | grep '"site"'
# Should show: "site": "archonpro"

# Deploy to specific site
firebase deploy --only hosting:archonpro
```

---

## 📊 What Gets Deployed

**Included:**
- ✅ Static files from `dist/client/`
- ✅ SPA routing (all routes → index.html)
- ✅ Cache headers for assets
- ✅ SSL certificate (automatic)

**NOT Included:**
- ❌ Data Connect (removed - not used)
- ❌ Functions (no functions directory)
- ❌ API routes (handled by Vercel or Firestore)

---

## 🎯 Deployment Script

Use the automated script:

```bash
# Make executable (first time only)
chmod +x scripts/deploy-firebase.sh

# Run deployment script
./scripts/deploy-firebase.sh
```

The script does:
1. ✅ Checks Firebase CLI installed
2. ✅ Builds frontend with pnpm
3. ✅ Deploys to Firebase Hosting
4. ✅ Shows deployment URL

---

## 🌐 Deployment URLs

**Firebase Hosting:**
- Primary: https://archonpro.web.app
- Custom domain (after DNS setup): https://archonpro.com

**Vercel (if still active):**
- https://archonpro.vercel.app

---

## ⚡ Pro Tips

1. **Always build before deploy:**
   ```bash
   pnpm run build && firebase deploy --only hosting
   ```

2. **Use `--only hosting` for speed:**
   - Skips unused services
   - Faster deployment
   - Fewer errors

3. **Check dry-run first:**
   ```bash
   firebase deploy --only hosting --dry-run
   ```

4. **Monitor deployment:**
   ```bash
   firebase deploy --only hosting --debug
   ```

5. **Rollback if needed:**
   - Go to Firebase Console → Hosting → Release history
   - Click "Rollback" on previous version

---

## 📝 Summary

**Before Fix:**
```bash
$ firebase deploy
✗ dataconnect: 403 billing error
❌ Deploy failed
```

**After Fix:**
```bash
$ firebase deploy --only hosting
✓ hosting: deploy complete
✅ https://archonpro.web.app
```

**Deploy now:**
```bash
pnpm run build && firebase deploy --only hosting
```
