#!/bin/bash
cd "$(dirname "$0")"
rm -f .git/index.lock 2>/dev/null
git add components/KapturiseApp.jsx app/layout.js
git commit -m "fix: emoji charset, mobile CSS, auto-run engine, live activity feed"
git push origin main
echo "Done! Vercel will auto-deploy."
