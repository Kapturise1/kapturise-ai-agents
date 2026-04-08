#!/bin/bash
cd "$(dirname "$0")"
echo "Pushing ALL Kapturise files to GitHub..."
echo ""

# Remove stale lock
rm -f .git/index.lock 2>/dev/null

# Ensure we're on main branch
git checkout -B main 2>/dev/null

# Stage ALL project files (not just two)
git add \
  .gitignore \
  package.json \
  next.config.js \
  vercel.json \
  app/layout.js \
  app/page.js \
  app/api/chat/route.js \
  components/KapturiseApp.jsx \
  components/LoginPage.jsx \
  lib/supabase.js \
  README.md

# Commit
git commit -m "fix: restore all project files — emoji charset, mobile CSS, auto-run engine, live activity feed"

# Push (force since we may have diverged)
git push origin main --force

echo ""
echo "Done! Vercel will auto-deploy in ~60 seconds."
echo ""
echo "Press any key to close..."
read -n 1
