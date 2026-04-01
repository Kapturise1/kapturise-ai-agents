# Kapturise AI Agents — Deployment Guide
## Supabase + Vercel (Step-by-Step)

---

## STEP 1: Create Supabase Account & Project (3 minutes)

1. Go to **https://supabase.com**
2. Click **"Start your project"** → Sign up with GitHub (easiest)
3. Click **"New Project"**
4. Fill in:
   - **Name**: `kapturise-agents`
   - **Database Password**: Generate a strong one → **SAVE THIS PASSWORD**
   - **Region**: Choose **Central Europe (Frankfurt)** or closest to Dubai
5. Click **"Create new project"** → Wait 1-2 minutes for setup

## STEP 2: Create Database Tables (2 minutes)

1. In your Supabase project, click **"SQL Editor"** in left sidebar
2. Click **"New Query"**
3. Open the file `supabase-schema.sql` from this project
4. **Copy the ENTIRE contents** and paste into the SQL editor
5. Click **"Run"** (or Cmd+Enter)
6. You should see: "Success. No rows returned" — this means all 10 tables were created

**Verify:** Click "Table Editor" in sidebar — you should see: agents, leads, investors, pricing, campaigns, scripts, social_accounts, company_info, activity_logs, api_keys

## STEP 3: Get Your Supabase Keys (1 minute)

1. In Supabase, go to **Settings** (gear icon) → **API**
2. Copy these two values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGci...` (the long one under "Project API keys")
3. Save them — you'll need them in Step 5

## STEP 4: Get Your Anthropic API Key (2 minutes)

1. Go to **https://console.anthropic.com**
2. Sign up / Log in
3. Go to **"API Keys"** → **"Create Key"**
4. Copy the key (starts with `sk-ant-...`)
5. Add billing if needed (pay-per-use, ~$0.01-0.05 per agent task)

## STEP 5: Set Up the Project Locally (3 minutes)

```bash
# Extract the project
unzip kapturise-deploy.zip
cd kapturise-deploy

# Install dependencies
npm install

# Create your environment file
cp .env.example .env.local
```

Now edit `.env.local` with your actual keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...your-anon-key
NEXT_PUBLIC_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

## STEP 6: Test Locally (1 minute)

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

You should see the full Kapturise dashboard. Test:
- ✅ Dashboard loads with all stats
- ✅ Click any agent → their workspace loads
- ✅ Click a task button → Claude responds (if API key is set)
- ✅ Menu works on mobile (resize browser window)

## STEP 7: Push to GitHub (2 minutes)

```bash
# Initialize git repo
git init
git add .
git commit -m "Kapturise AI Agents v1.0"

# Create repo on GitHub (go to github.com/new)
# Then push:
git remote add origin https://github.com/YOUR-USERNAME/kapturise-agents.git
git branch -M main
git push -u origin main
```

## STEP 8: Deploy to Vercel (2 minutes)

1. Go to **https://vercel.com/new**
2. Click **"Import Git Repository"**
3. Select your `kapturise-agents` repo
4. **Before clicking Deploy**, click **"Environment Variables"**
5. Add these 3 variables:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...your-anon-key` |
| `NEXT_PUBLIC_ANTHROPIC_API_KEY` | `sk-ant-...your-key` |

6. Click **"Deploy"**
7. Wait ~60 seconds
8. Your app is live at **https://kapturise-agents.vercel.app** 🎉

## STEP 9: Custom Domain (Optional, 2 minutes)

1. In Vercel → your project → **Settings** → **Domains**
2. Add: `agents.kapturise.com` (or whatever you want)
3. Vercel will show you DNS records to add
4. Go to your domain registrar → Add the CNAME/A records
5. Wait 5-10 minutes for DNS propagation

---

## HOW IT WORKS

### Data Flow:
```
Browser (React App)
    ↕ window.storage API
Supabase Adapter (lib/supabase.js)
    ↕ Supabase JS Client
Supabase PostgreSQL Database
```

### Fallback:
If Supabase keys are NOT set, the app automatically falls back to **localStorage** (browser storage). This means:
- The app works immediately even without Supabase
- Data is stored per-browser (not shared between devices)
- Once you add Supabase keys, data persists in the cloud

### What's stored where:
| Data | Supabase Table | localStorage Key |
|------|---------------|-----------------|
| Agents | `agents` | `k8-ag` |
| Leads | `leads` | `k7-ld` |
| Investors | `investors` | `k8-inv` |
| Pricing | `pricing` | `k7-pr` |
| Campaigns | `campaigns` | `k7-cm` |
| Scripts | `scripts` | `k7-scripts` |
| Social Accounts | `social_accounts` | `k7-so` |
| Company Info | `company_info` | `k7-co` |
| API Keys | `api_keys` | `k7-ak` |

---

## ADDING MORE API KEYS (after deploy)

Go to your deployed app → **🔌 Integrations** page:

**Nano Banana (Image Generation):**
1. Go to https://aistudio.google.com/apikey
2. Create API key (free)
3. Paste in Integrations → Nano Banana field
4. Click Test

**Bland.ai (Phone Calls):**
1. Go to https://app.bland.ai
2. Sign up, get API key
3. Optionally buy a +971 phone number
4. Paste in Integrations → Bland.ai fields

---

## PROJECT STRUCTURE

```
kapturise-deploy/
├── app/
│   ├── layout.js              # Root layout, fonts, viewport
│   └── page.js                # Entry point, storage adapter
├── components/
│   └── KapturiseApp.jsx       # The entire app (200K)
├── lib/
│   └── supabase.js            # Supabase client + storage adapter
├── public/                    # Static assets
├── supabase-schema.sql        # Database schema (run in SQL Editor)
├── .env.example               # Environment variables template
├── .gitignore
├── next.config.js
├── package.json
├── vercel.json
└── README.md                  # This file
```

## TROUBLESHOOTING

**"Tasks show error after clicking"**
→ Check NEXT_PUBLIC_ANTHROPIC_API_KEY in Vercel → Settings → Environment Variables

**"Data not saving between sessions"**
→ Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set
→ Check Supabase → Table Editor → verify tables exist

**"Vercel build fails"**
→ Run `npm run build` locally first to catch errors
→ Check Vercel build logs for specific error

**"CORS error in console"**
→ Supabase anon key might be wrong. Re-copy from Supabase → Settings → API

**"Mobile menu not working"**
→ Clear browser cache. The responsive CSS needs the latest build.

---

## MONTHLY COSTS

| Service | Cost |
|---------|------|
| Supabase (Free tier) | **$0** (up to 500MB, 50K rows) |
| Vercel (Hobby) | **$0** (hobby) or $20/mo (pro) |
| Claude API | ~$20-100/mo (usage-based) |
| Gemini (optional) | **$0** (free tier) |
| Bland.ai (optional) | $0.09/min per call |
| **Total (minimum)** | **~$20/mo** (just Claude API) |
