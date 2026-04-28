# Voix — Testimonial Collection Platform

> Turn customers into your best salespeople.

**Stack:** Next.js 14 · TypeScript · Supabase · Lemon Squeezy · Resend · Tailwind CSS · shadcn/ui  
**Market:** United States (Lemon Squeezy as Merchant of Record — handles sales tax)

---

## Architecture

```
voix/
├── app/
│   ├── (marketing)/          # Public landing page
│   ├── (dashboard)/          # Authenticated product — layout with sidebar
│   │   ├── page.tsx           # Dashboard home (metrics + table)
│   │   ├── testimonials/      # Full testimonial management
│   │   ├── widgets/           # Widget builder + embed code
│   │   ├── campaigns/         # Email campaigns
│   │   └── settings/          # Account + billing
│   ├── auth/                  # Sign in / Sign up
│   ├── collect/[token]/       # Public collect form (no auth)
│   └── api/
│       ├── testimonials/      # CRUD + plan limit enforcement
│       ├── widgets/           # CRUD + embed script generator
│       ├── campaigns/         # CRUD + email dispatch via Resend
│       ├── collect/[token]/   # Public submission endpoint
│       ├── lemon-squeezy/     # Checkout + webhook handler
│       └── auth/[...nextauth] # Auth.js handlers
├── components/
│   ├── dashboard/             # Sidebar, Topbar, MetricsGrid, TestimonialTable
│   ├── collect/               # Multi-step public form
│   └── widgets/               # Embed script generator
├── lib/
│   ├── supabase.ts            # Typed Supabase clients (anon + service role)
│   ├── auth.ts                # Auth.js v5 config
│   └── lemon-squeezy.ts       # LS client + webhook verification
├── types/
│   └── index.ts               # Full TypeScript type definitions
└── supabase/
    └── migrations/
        └── 001_initial.sql    # Complete schema + RLS + triggers + seed
```

---

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/yourname/voix.git
cd voix
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Fill in all values (Supabase, Google OAuth, Lemon Squeezy, Resend)
```

### 3. Set up Supabase

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
supabase db push
```

Or manually run `supabase/migrations/001_initial.sql` in the Supabase SQL editor.

### 4. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI
4. Copy `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env.local`

### 5. Configure Lemon Squeezy

1. Create a store at [lemonsqueezy.com](https://lemonsqueezy.com)
2. Create 3 products: Starter ($19), Growth ($39), Scale ($59)
3. Copy variant IDs to `LS_VARIANT_*` env vars
4. Create a webhook pointing to `https://yourdomain.com/api/lemon-squeezy/webhook`
5. Select events: `order_created`, `subscription_*`
6. Copy the signing secret to `LEMON_SQUEEZY_WEBHOOK_SECRET`

### 6. Configure Resend

1. Create an account at [resend.com](https://resend.com)
2. Verify your domain
3. Copy your API key to `RESEND_API_KEY`

### 7. Run

```bash
npm run dev
# → http://localhost:3000
```

---

## Database Schema

| Table          | Purpose                                        |
|----------------|------------------------------------------------|
| `plans`        | Starter / Growth / Scale (seeded)             |
| `profiles`     | Extends auth.users — company info, plan status |
| `testimonials` | Text + video testimonials from customers       |
| `widgets`      | Embeddable widget configs                     |
| `campaigns`    | Email collection campaigns                    |
| `invites`      | Unique tokens for the public collect page     |
| `activities`   | Audit log for the dashboard feed              |

All tables have **Row Level Security** — users can only access their own data.

---

## Key Features

### Public Embed Script
Each widget generates a self-contained JS snippet:
```html
<div id="voix-widget-WIDGET_ID"></div>
<script src="https://voix.app/api/widgets/WIDGET_ID/embed" async></script>
```
The script uses **Shadow DOM** for CSS isolation — zero conflicts with the client's site styles.

### Plan Limits
Enforced server-side on every API write:
- `max_testimonials`: soft limit checked before insert
- `max_videos_monthly`: tracked via testimonial source
- `max_widgets`: checked before widget creation

### Trial Logic
New users get a 14-day Growth trial (set in the Supabase trigger).  
After expiry, a banner in the sidebar prompts upgrade. No hard blocking — graceful degradation.

---

## Deployment (Vercel)

```bash
vercel deploy

# Set env vars in Vercel dashboard
# Add your production domain to:
# - Google OAuth redirect URIs
# - Lemon Squeezy webhook URL
# - Supabase allowed origins
```

---

## Pricing

| Plan    | Monthly | Testimonials | Videos/mo | Widgets |
|---------|---------|--------------|-----------|---------|
| Starter | $19     | 50           | 5         | 1       |
| Growth  | $39     | Unlimited    | 30        | ∞       |
| Scale   | $59     | Unlimited    | Unlimited | ∞       |

14-day free trial on Growth plan. No credit card required.

---

## Roadmap

- [ ] Auth page (login/signup UI)
- [ ] Onboarding flow
- [ ] Google My Business import
- [ ] G2 import
- [ ] Widget preview builder (visual editor)
- [ ] Zapier integration
- [ ] Public API (Scale plan)
- [ ] Plausible analytics integration
- [ ] Mobile responsive dashboard
