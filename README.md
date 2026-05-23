# MarketPlaceX 🛒

A complete, modern, production-ready marketplace platform built with Next.js 15 + NestJS + PostgreSQL.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS, Framer Motion, Radix UI |
| State | Zustand + React Query |
| Backend | NestJS 10, TypeScript |
| Database | PostgreSQL 16 + Prisma ORM |
| Cache | Redis 7 |
| Real-time | Socket.IO |
| Auth | JWT, Google/Facebook/GitHub OAuth, SMS OTP |
| Payments | Stripe, MercadoPago, PayPal |
| Email | Resend |
| SMS | Twilio |
| Storage | Cloudinary / Local |
| Infra | Docker, Docker Compose, NGINX |

## Quick Start

### 1. Clone and configure

```bash
cp .env.example .env
# Fill in your API keys in .env
```

### 2. Start with Docker (recommended)

```bash
docker-compose up -d
```

### 3. Run migrations and seed

```bash
docker exec mpx_backend npx prisma migrate deploy
docker exec mpx_backend npx ts-node prisma/seed.ts
```

### 4. Open

- Frontend: http://localhost:3000
- API Docs: http://localhost:3001/api/docs
- Prisma Studio: `npm run db:studio` in backend

## Local Development

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Default Credentials

After seeding:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@marketplacex.com | Admin123! |
| Seller | seller@demo.com | Seller123! |

## Project Structure

```
marketplacex/
├── backend/                  # NestJS API
│   ├── src/
│   │   ├── auth/            # Auth, JWT, OAuth strategies
│   │   ├── users/           # User profiles, follows
│   │   ├── products/        # Listings, images, variants
│   │   ├── categories/      # Product categories
│   │   ├── orders/          # Order management
│   │   ├── payments/        # Stripe, PayPal, MP
│   │   ├── messages/        # Real-time chat (Socket.IO)
│   │   ├── notifications/   # Push notifications
│   │   ├── reviews/         # Ratings & reviews
│   │   ├── favorites/       # User favorites
│   │   ├── reports/         # Content moderation
│   │   ├── followers/       # User follows
│   │   ├── search/          # Full-text search
│   │   ├── uploads/         # File upload (Cloudinary/Local)
│   │   └── admin/           # Admin panel API
│   └── prisma/
│       ├── schema.prisma    # Full DB schema
│       └── seed.ts          # DB seeder
│
├── frontend/                 # Next.js 15
│   └── src/
│       ├── app/
│       │   ├── (shop)/      # Public pages
│       │   ├── (auth)/      # Auth pages
│       │   └── (account)/   # Protected pages
│       ├── components/
│       │   ├── layout/      # Navbar, Footer
│       │   ├── home/        # Hero, Categories, Featured
│       │   ├── product/     # ProductCard, Gallery, Info
│       │   ├── cart/        # CartDrawer
│       │   └── chat/        # Messaging UI
│       ├── store/           # Zustand stores (cart, auth)
│       └── lib/             # API client, utils
│
└── docker/
    ├── nginx/               # NGINX config
    └── postgres/            # DB init scripts
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/register | Register user |
| POST | /api/v1/auth/login | Login |
| POST | /api/v1/auth/refresh | Refresh token |
| GET  | /api/v1/products | List products |
| POST | /api/v1/products | Create listing |
| GET  | /api/v1/products/:slug | Product detail |
| POST | /api/v1/payments/stripe/checkout | Stripe checkout |
| POST | /api/v1/payments/stripe/webhook | Stripe webhook |
| GET  | /api/v1/messages/conversations | List chats |
| GET  | /api/v1/admin/dashboard | Admin stats |

Full API docs available at `/api/docs` (Swagger).

## Features

- ✅ Multi-provider auth (Google, Facebook, GitHub, Email, Phone OTP)
- ✅ Product listings with images, variants, stock
- ✅ Real-time chat (Socket.IO)
- ✅ Stripe checkout (secure server-side price validation)
- ✅ MercadoPago + PayPal integration
- ✅ Cart with Zustand persistence
- ✅ Dark mode
- ✅ Responsive / Mobile-first
- ✅ Admin dashboard
- ✅ Favorites, Reviews, Reports, Follows
- ✅ Full-text search with filters
- ✅ Email notifications (Resend)
- ✅ SMS OTP (Twilio)
- ✅ Docker production-ready
- ✅ Swagger API docs
- ✅ Skeleton loading states
- ✅ SEO (metadata, OG, sitemap-ready)
- ✅ JWT + Refresh token rotation
- ✅ Rate limiting + CSRF protection
- ✅ Prisma migrations + seeder

## Security Notes

- Prices are always validated server-side (never trust client)
- Stripe webhooks verified with signature
- JWT refresh token rotation on each use
- Rate limiting on auth and API endpoints
- `httpOnly` / `Secure` cookie flags
- Helmet + CORS configured
