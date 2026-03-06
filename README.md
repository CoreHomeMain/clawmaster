# ClawMaster SaaS

The world's best platform for learning, configuring, and mastering **OpenClaw** — the self-hosted AI gateway platform.

ClawMaster provides comprehensive training, expert guidance, and powerful tools to help users deploy and manage OpenClaw across all platforms and channels.

## Features

- 📚 **Interactive Learning Modules** — Structured courses on installation, configuration, and advanced topics
- 🤖 **ClawBot AI Assistant** — Expert AI powered by OpenRouter, specialized in OpenClaw knowledge
- 💰 **Simple Lifetime License** — One-time $19 payment for permanent access
- 🏆 **Achievement System** — Unlock badges and track progress as you learn
- ⚙️ **Configuration Dashboard** — Manage channels (Telegram, Discord, etc.) and gateway settings
- 📊 **Progress Tracking** — Personalized dashboard with learning analytics
- 🔐 **Secure Authentication** — JWT-based auth powered by Supabase

## Tech Stack

- **Frontend**: Svelte 5 + TailwindCSS + TypeScript
- **Backend**: SvelteKit + Node.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: PayPal REST API
- **AI**: OpenRouter (Minimax model)
- **Hosting**: Vercel (Serverless)
- **CSS Framework**: TailwindCSS with custom components

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- A Supabase project (free tier works)
- PayPal developer account
- OpenRouter API key

### Local Development

1. **Clone and install:**
   ```bash
   git clone <repo-url>
   cd clawmaster
   npm install
   ```

2. **Create `.env.local` (copy from `.env.example`):**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your API keys and URLs.

3. **Start dev server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173`

4. **Run tests:**
   ```bash
   npm test
   npm run test:watch
   ```

5. **Type check:**
   ```bash
   npm run check
   npm run check:watch
   ```

## Project Structure

```
src/
├── routes/                 # SvelteKit routes and pages
│   ├── +page.svelte       # Homepage
│   ├── login/             # Authentication
│   ├── register/
│   ├── checkout/          # Payment page
│   ├── (protected)/       # Auth-required routes
│   │   ├── dashboard/     # User dashboard
│   │   ├── learn/         # Learning modules
│   │   ├── chat/          # ClawBot interface
│   │   ├── achievements/  # Achievements page
│   │   ├── config/        # Configuration
│   │   └── onboarding/    # First-time setup
│   └── api/               # API endpoints
│       ├── auth/          # Auth endpoints
│       ├── payments/      # PayPal integration
│       ├── ai/chat/       # ClawBot API
│       └── achievements/  # Achievements API
├── lib/
│   ├── components/        # Reusable Svelte components
│   ├── server/            # Server-only utilities
│   └── supabase.ts        # Supabase client
├── tests/                 # Unit and integration tests
└── app.d.ts              # Type definitions
```

## Building for Production

```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview

# Full deployment guide
cat DEPLOYMENT.md
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete production deployment instructions to Vercel.

Quick deploy checklist:
- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Build passes locally
- [ ] Tests pass
- [ ] `.env.example` updated with all required vars

Deploy with:
```bash
vercel --prod
```

## API Routes

### Authentication
- `POST /login` — Login with email/password
- `POST /register` — Register new account
- `POST /logout` — Logout

### Payments
- `POST /api/payments/create-order` — Create PayPal order
- `POST /api/payments/capture-order` — Capture order after payment
- `POST /api/payments/webhook` — PayPal webhook

### AI Chat
- `POST /api/ai/chat` — Stream ClawBot responses

### User Profile
- `GET /api/profile` — Get user profile
- `POST /api/profile` — Update profile
- `POST /api/profile/settings` — Update settings

### Achievements
- `GET /api/achievements` — List all achievements
- `GET /api/achievements/user` — Get user's unlocked achievements
- `POST /api/achievements/notify` — Achievement notification

## Environment Variables

See `.env.example` for all required variables:

```bash
# Supabase
PUBLIC_SUPABASE_URL=...
PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PUBLIC_PAYPAL_CLIENT_ID=...

# AI
OPENROUTER_API_KEY=...

# App
PUBLIC_APP_URL=https://clawmaster.io
NODE_ENV=production
```

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Run specific test
npm test src/tests/unit/auth.test.ts

# Coverage report
npm test -- --coverage
```

Tests cover:
- Authentication flow
- Module content loading
- Achievement logic
- Payment integration
- API endpoints

## Performance

- **Lighthouse**: 90+ score on desktop
- **Core Web Vitals**: Good (per Vercel Analytics)
- **Bundle size**: ~80KB gzip (optimized with SvelteKit)
- **First contentful paint**: <1.5s

## Contributing

This is a production SaaS application. For contributions:

1. Create feature branch: `git checkout -b feature/name`
2. Make changes and test: `npm test`
3. Build locally: `npm run build`
4. Submit PR with description

## License

Proprietary — ClawMaster SaaS

## Support

- 📧 Email support: support@clawmaster.io
- 🐛 Report bugs: GitHub Issues
- 📚 Documentation: /docs

---

Built with ❤️ for the OpenClaw community
