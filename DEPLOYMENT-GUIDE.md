# Kapturise AI Agents — Complete Deployment Guide
## Supabase + Vercel (Step by Step)

---

## STEP 1: Create Supabase Account & Project (3 minutes)

1. Go to **https://supabase.com**
2. Click **"Start your project"** → Sign up with GitHub (recommended)
3. Click **"New Project"**
4. Fill in:
   - **Name:** `kapturise-agents`
   - **Database Password:** (save this somewhere safe!)
   - **Region:** Choose the closest to Dubai → **Central EU (Frankfurt)** or **West EU (London)**
5. Click **"Create new project"**
6. Wait 1-2 minutes for it to set up

## STEP 2: Create the Database Tables (1 minute)

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Open the file `supabase-schema.sql` from this project
4. **Copy ALL the contents** and paste into the SQL editor
5. Click **"Run"** (the green play button)
6. You should see "Success. No rows returned" — that's correct
7. Click **"Table Editor"** in the sidebar — you should see 10 tables created

## STEP 3: Get Your Supabase Keys (30 seconds)

1. In Supabase dashboard, click **"Settings"** (gear icon) → **"API"**
2. Copy these two values:
   - **Project URL** — looks like `https://abcdefghij.supabase.co`
   - **anon public key** — long string starting with `eyJhbGci...`
3. Save both — you'll need them in Step 5

## STEP 4: Get Your Anthropic API Key (2 minutes)

1. Go to **https://console.anthropic.com**
2. Sign up or log in
3. Click **"API Keys"** in sidebar
4. Click **"Create Key"**
5. Copy the key (starts with `sk-ant-...`)
6. You need to add a payment method under Billing (pay-per-use, ~$0.01-0.05 per agent task)

## STEP 5: Set Up the Project Locally (2 minutes)

Open your terminal:

```bash
# 1. Go to the project folder
cd kapturise-deploy

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env.local
```

Now open `.env.local` in any text editor and fill in your keys:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

## STEP 6: Test Locally (1 minute)

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

You should see the Kapturise dashboard. Try:
- Click any agent → run a task → verify Claude AI responds
- Add a lead → refresh → verify it persists (Supabase is saving it)
- Check Supabase Table Editor → you should see data appearing

## STEP 7: Push to GitHub (1 minute)

```bash
# Initialize git
git init
git add .
git commit -m "Kapturise AI Agents v1"

# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR-USERNAME/kapturise-agents.git
git branch -M main
git push -u origin main
```

## STEP 8: Deploy to Vercel (2 minutes)

1. Go to **https://vercel.com** (you already have an account)
2. Click **"Add New..."** → **"Project"**
3. Click **"Import"** next to your `kapturise-agents` GitHub repo
4. Vercel auto-detects Next.js — leave defaults
5. **IMPORTANT:** Click **"Environment Variables"** and add these 3:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project-id.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbG...your-key` |
| `NEXT_PUBLIC_ANTHROPIC_API_KEY` | `sk-ant-...your-key` |

6. Click **"Deploy"**
7. Wait 1-2 minutes
8. Your app is live at `https://kapturise-agents.vercel.app` (or similar)

## STEP 9: Custom Domain (optional)

1. In Vercel → your project → **Settings** → **Domains**
2. Add `agents.kapturise.com`
3. Vercel gives you DNS records to add in your domain registrar
4. Add the CNAME record, wait 5 min, done

---

## HOW IT WORKS

```
┌─────────────────────┐
│   Your Browser      │
│  (kapturise.com)    │
└────────┬────────────┘
         │
    ┌────┴────┐
    │  Vercel │  ← Hosts the Next.js app
    │ (free)  │
    └────┬────┘
         │
    ┌────┴──────────┐
    │   Supabase    │  ← Stores all data (leads, agents, etc.)
    │  (PostgreSQL) │
    └────┬──────────┘
         │
    ┌────┴────────┐
    │  Claude API  │  ← Powers all agent AI tasks
    │ (Anthropic)  │
    └──────────────┘
```

**Data flow:**
- You click "Research 5 Prospects" → browser sends request to Claude API
- Claude responds → result shown + saved to Supabase
- You add a lead → saved to Supabase PostgreSQL
- Next time you open the app → loads from Supabase (persistent across devices)

---

## AFTER DEPLOYMENT

### Add Optional API Keys
Go to your live app → Integrations page (🔌) and add:
- **Gemini API key** → enables AI image generation (free from aistudio.google.com)
- **Bland.ai key** → enables real phone calls ($0.09/min from app.bland.ai)

### Multiple Users
Right now anyone with the URL can access the app. To add auth:
1. Supabase → Authentication → enable Email/Password
2. Add login page to the Next.js app
3. Update RLS policies to restrict by user

### Monthly Costs

| Service | Cost |
|---------|------|
| Supabase (database) | **Free** (up to 500MB, 50K rows) |
| Vercel (hosting) | **Free** (hobby plan) |
| Claude API | ~$5-50/month depending on usage |
| Gemini (images) | Free tier available |
| Bland.ai (calls) | $0.09/min, pay as you go |
| **Total** | **~$5-50/month** |

---

## TROUBLESHOOTING

**"Tasks loading but nothing happens"**
→ Check NEXT_PUBLIC_ANTHROPIC_API_KEY in Vercel → Settings → Environment Variables

**"Data not saving"**
→ Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
→ Go to Supabase → SQL Editor → run `SELECT * FROM agents;` to verify tables exist

**"Build fails on Vercel"**
→ Make sure all 3 env vars are set in Vercel
→ Check that package.json has `@supabase/supabase-js` in dependencies

**"White screen"**
→ Open browser console (F12) → check for errors
→ Usually a missing env variable

**"Can't access from another device"**
→ Data is in Supabase (cloud) so it works from anywhere
→ Make sure you're using the Vercel URL, not localhost

---

## PROJECT FILES

```
kapturise-deploy/
├── app/
│   ├── layout.js              # Root layout + fonts
│   └── page.js                # Entry — wires Supabase storage
├── components/
│   └── KapturiseApp.jsx       # The entire app (200K+)
├── lib/
│   └── supabase.js            # Supabase client + storage adapter
├── public/
├── supabase-schema.sql        # Database tables — run in Supabase
├── .env.example               # API key template
├── .gitignore
├── next.config.js
├── package.json
├── vercel.json
└── DEPLOYMENT-GUIDE.md        # This file
```
