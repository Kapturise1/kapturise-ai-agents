# Kapturise AI Agents — Complete Deployment Guide
## Supabase + Vercel (Step by Step)

---

## STEP 1: Create Supabase Account & Project (3 minutes)

1. Go to **https://supabase.com**
2. Click **"Start your project"** → Sign up with GitHub (easiest)
3. Click **"New Project"**
4. Fill in:
   - **Organization**: Select your org (or create one — free)
   - **Project name**: `kapturise-agents`
   - **Database password**: Choose a strong password → **SAVE THIS** (you'll need it)
   - **Region**: Choose closest to Dubai → `Middle East (Bahrain)`
5. Click **"Create new project"**
6. Wait ~2 minutes for the project to spin up

---

## STEP 2: Get Your Supabase Keys (1 minute)

1. In your Supabase project dashboard, go to **Settings** (gear icon, bottom left)
2. Click **"API"** in the left sidebar
3. You'll see two values — copy them both:
   - **Project URL**: `https://xxxxxxxxxxxx.supabase.co`
   - **anon (public) key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long string)
4. Save both somewhere — you'll paste them in Step 5

---

## STEP 3: Run the Database Schema (2 minutes)

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open the file `supabase-schema.sql` from this project (in a text editor)
4. **Copy the ENTIRE contents** and paste it into the SQL Editor
5. Click **"Run"** (or Cmd+Enter)
6. You should see: `Success. No rows returned` — that's correct
7. Go to **"Table Editor"** in the left sidebar — you should see these tables:
   - `app_storage`
   - `leads`
   - `investors`
   - `campaigns`
   - `activity_logs`

---

## STEP 4: Get Your Anthropic API Key (2 minutes)

1. Go to **https://console.anthropic.com**
2. Sign up or log in
3. Click **"API Keys"** in the left sidebar
4. Click **"Create Key"**
5. Copy the key (starts with `sk-ant-...`)
6. **Important**: You need to add a payment method (Settings → Billing) to activate API access. Each agent task costs ~$0.01-0.05.

---

## STEP 5: Set Up the Project Locally (3 minutes)

Open your terminal:

```bash
# 1. Navigate to the project folder (wherever you extracted the zip)
cd kapturise-deploy

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env.local
```

Now open `.env.local` in any text editor and fill in your keys:

```env
# Paste your Supabase values from Step 2
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...your-full-key

# Paste your Anthropic key from Step 4
NEXT_PUBLIC_ANTHROPIC_API_KEY=sk-ant-api03-...your-key

# These are optional — add later
# NEXT_PUBLIC_GEMINI_API_KEY=
# NEXT_PUBLIC_BLAND_API_KEY=
# NEXT_PUBLIC_BLAND_PHONE=
```

Save the file.

---

## STEP 6: Test Locally (1 minute)

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

You should see the full Kapturise dashboard. Try:
- Click an agent → run a task → verify Claude responds
- Add a lead → verify it saves (refresh the page — data should persist)
- Check Supabase Table Editor → `app_storage` table should have rows

If it works locally, you're ready to deploy.

---

## STEP 7: Push to GitHub (2 minutes)

You need a GitHub repo for Vercel deployment.

```bash
# Initialize git
git init
git add .
git commit -m "Kapturise AI Agents v1.0"

# Create a new repo on GitHub (https://github.com/new)
# Name it: kapturise-agents
# Keep it Private
# Don't add README (you already have one)

# Push (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/kapturise-agents.git
git branch -M main
git push -u origin main
```

---

## STEP 8: Deploy to Vercel (3 minutes)

1. Go to **https://vercel.com/new**
2. Click **"Import Git Repository"**
3. Select your `kapturise-agents` repo
4. Vercel auto-detects it's a Next.js project
5. Before clicking Deploy, click **"Environment Variables"** and add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxxxxxxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` |
| `NEXT_PUBLIC_ANTHROPIC_API_KEY` | `sk-ant-api03-...` |

6. Click **"Deploy"**
7. Wait 1-2 minutes for the build
8. Your app is live at `https://kapturise-agents.vercel.app` (or similar)

---

## STEP 9: Add Custom Domain (optional, 2 minutes)

1. In Vercel dashboard → your project → **Settings** → **Domains**
2. Add: `agents.kapturise.com` (or any domain you own)
3. Vercel will show DNS records to add at your domain registrar
4. Add the records, wait for propagation (~5 minutes)

---

## STEP 10: Add Optional API Keys (later)

After your app is live, go to the **Integrations** page (🔌) inside the app:

### Nano Banana (Image Generation)
1. Go to https://aistudio.google.com/apikey
2. Create an API key (free)
3. Add to Vercel: Settings → Environment Variables → `NEXT_PUBLIC_GEMINI_API_KEY`
4. Also paste it in the Integrations page inside the app

### Bland.ai (Phone Calls)
1. Go to https://app.bland.ai
2. Sign up, get API key ($0.09/min)
3. Add to Vercel: `NEXT_PUBLIC_BLAND_API_KEY` and `NEXT_PUBLIC_BLAND_PHONE`

After adding env vars in Vercel, click **Redeploy** for them to take effect.

---

## How It All Connects

```
┌──────────────────────────────────────────┐
│           Your Browser                    │
│    https://agents.kapturise.com           │
└──────────────┬───────────────────────────┘
               │
┌──────────────▼───────────────────────────┐
│           Vercel                          │
│    Hosts the Next.js app                  │
│    Serves the React frontend              │
└──────────────┬───────────────────────────┘
               │
       ┌───────┼───────────┐
       │       │           │
┌──────▼──┐ ┌──▼─────┐ ┌──▼──────┐
│Supabase │ │Claude  │ │Bland.ai │
│Database │ │API     │ │Gemini   │
│(data)   │ │(AI)    │ │(calls/  │
│         │ │        │ │images)  │
└─────────┘ └────────┘ └─────────┘
```

**Supabase** stores: agents, leads, investors, pricing, campaigns, scripts, company info, API keys — everything persists across sessions and devices.

**Claude API** powers: all agent tasks, prospecting, script generation, proposals, campaign content.

**Bland.ai** (optional): real AI phone calls from sales agents.

**Gemini** (optional): AI image generation for social media posts.

---

## Troubleshooting

**"Tasks loading but nothing happens"**
→ Check NEXT_PUBLIC_ANTHROPIC_API_KEY is set in Vercel env vars. Redeploy after adding.

**"Data not saving"**
→ Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. Go to Supabase → Table Editor → check if `app_storage` has rows.

**"Build fails on Vercel"**
→ Make sure all env vars are set BEFORE deploying. Check Vercel build logs for the specific error.

**"Cannot read properties of null"**
→ Supabase keys are missing or wrong. Double-check the URL and anon key.

**"CORS error"**
→ In Supabase → Settings → API → check that your Vercel domain is allowed.

---

## Monthly Cost

| Service | Cost |
|---------|------|
| Supabase | Free (up to 500MB, 50K rows) |
| Vercel | Free (hobby) / $20/mo (pro) |
| Claude API | ~$5-50/mo (usage-based) |
| Bland.ai | ~$0-100/mo (per call) |
| Gemini | Free tier available |
| **Total** | **$5-170/mo depending on usage** |

The free tiers of Supabase + Vercel are more than enough to start.

---

## What's Deployed

- 17 AI agents across 7 departments
- Full CRM with CSV import/export
- Investor pipeline (separate)
- Dynamic pricing calculator
- Cross-department campaigns
- Scripts & templates with assignment
- Social account management
- Company info page
- Integrations hub
- Mobile responsive
- Dark/light theme
- Persistent storage via Supabase
