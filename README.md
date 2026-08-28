# ReserveSmith

An Airbnb-style booking platform — guests can browse and book stays without creating an account, hosts manage listings/calendars/bookings from a dashboard, and payments run through Braintree with 3D Secure.

Live at [reservesmith.com](https://reservesmith.com).

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express, Prisma ORM + MySQL, JWT auth (httpOnly cookies) |
| Payments | Braintree (Drop-in UI, 3D Secure required) |
| Images | Local disk storage — resized to thumbnail/large and encoded as AVIF on upload (`sharp`), served directly by nginx |
| Email | Self-hosted Postfix + OpenDKIM (SPF/DKIM/DMARC configured), HTML templates via `nodemailer` |
| Frontend | React 18, Vite, React Router, TanStack Query, React Hook Form, Tailwind CSS, i18next |
| Infra | Docker Compose (MySQL + backend + nginx/frontend), Let's Encrypt via certbot |

## What's implemented

- Guest browsing and booking with no account required (auto-creates a lightweight guest user record from the contact details entered at checkout)
- Real-time availability calendar per listing, with double-booking prevention enforced atomically at booking creation (`prisma.$transaction`)
- Braintree payment flow with mandatory 3D Secure confirmation
- Automatic booking confirmation emails to both guest and host on successful payment
- Host dashboard: today/upcoming bookings, listing CRUD (including in-place photo add/remove), monthly calendar (manual block/unblock, per-day price overrides, min/max night rules)
- Two-way iCal sync — pulls bookings in from external calendars (Airbnb/VRBO `.ics` links) and exports this platform's own calendar as a link hosts can paste elsewhere
- Rate limiting on auth endpoints, per-request account-lock enforcement, SSRF guard on host-supplied iCal URLs, and other hardening from a full security pass (see commit history)

## Project structure

```
reservesmith/
├── backend/
│   ├── src/
│   │   ├── config/        # Prisma client, mailer, Braintree gateway
│   │   ├── controllers/   # one per resource (auth, listing, booking, payment, calendar, admin)
│   │   ├── routes/        # Express routers, one per resource
│   │   ├── middlewares/   # auth (JWT), role-based access, rate limiting, upload, error handling
│   │   ├── services/      # business logic — the actual behavior lives here, not in controllers
│   │   └── utils/         # jwt, response shaping, image processing, SSRF-safe URL checks
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── scripts/           # one-off maintenance scripts (e.g. the Cloudinary → local image migration)
└── frontend/
    ├── src/
    │   ├── pages/          # user, host, admin, auth, booking route pages
    │   ├── components/     # shared UI (icons, header/footer, listing cards, calendars, forms)
    │   ├── context/        # AuthContext
    │   ├── services/       # one API client module per resource
    │   └── locales/        # i18next translation files
    └── nginx.conf           # serves the built SPA, proxies /api, serves /uploads directly
```

## Local development

Requires Docker (for MySQL) and Node.js 20+.

```bash
# 1. Start MySQL
docker compose up -d mysql

# 2. Backend
cd backend
npm install
cp .env.example .env        # fill in DATABASE_URL, JWT_SECRET, Braintree sandbox keys, etc.
npx prisma migrate dev
npm run dev                 # http://localhost:5000

# 3. Frontend (separate terminal)
cd frontend
npm install
cp .env.example .env
npm run dev                 # http://localhost:5173
```

## Deploying

See [`DEPLOY.md`](DEPLOY.md) for the full production deployment guide (Docker Compose, nginx/TLS setup, environment variables, Postfix email setup, Braintree webhook registration).

## Further reading

- [`DEPLOY.md`](DEPLOY.md) — production deployment runbook
- [`DATABASE.md`](DATABASE.md) — schema overview
