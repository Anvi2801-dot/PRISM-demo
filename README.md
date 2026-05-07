# Prism-Onboarder

A fullstack user onboarding platform built with React 19, TypeScript, and Node.js/Express. Features a public landing page, a guided onboarding flow for new users, and an admin dashboard for managing onboarding progress.

## ✨ Features

- **Landing Page** — Public-facing entry point for new users
- **Onboarding Flow** — Step-by-step guided onboarding experience (`/onboarding/:id`)
- **Admin Dashboard** — Monitor and manage user onboarding status
- **Authentication** — Session-based auth via Passport.js (local strategy)
- **Database** — PostgreSQL with Drizzle ORM and schema validation via Zod
- **Animations** — Smooth UI transitions with Framer Motion
- **Charts** — Data visualizations with Recharts

## 🛠️ Tech Stack

**Frontend**
- React 19 + TypeScript
- Vite (dev server & bundler)
- TailwindCSS v4 + shadcn/ui (Radix UI primitives)
- TanStack Query v5 (server state management)
- Wouter (client-side routing)
- React Hook Form + Zod (form validation)
- Framer Motion (animations)
- Recharts (data visualization)

**Backend**
- Node.js + Express
- Passport.js with local strategy (authentication)
- Express Session + MemoryStore / connect-pg-simple
- WebSocket support (`ws`)

**Database**
- PostgreSQL
- Drizzle ORM
- Drizzle Zod (schema → Zod validation bridge)

## 📁 Project Structure

```
Prism-Onboarder/
├── client/
│   ├── public/
│   │   ├── favicon.png
│   │   └── opengraph.jpg
│   └── src/
│       ├── components/        # Reusable UI components (shadcn/ui)
│       ├── hooks/             # Custom React hooks
│       ├── lib/               # queryClient and utilities
│       ├── pages/
│       │   ├── Landing.tsx        # Public landing page
│       │   ├── Onboarding.tsx     # Guided onboarding flow (/onboarding/:id)
│       │   ├── AdminDashboard.tsx # Admin panel
│       │   └── not-found.tsx      # 404 page
│       ├── App.tsx            # Root component with routing
│       ├── index.css
│       └── main.tsx
├── server/
│   ├── index.ts               # Server entry point
│   ├── routes.ts              # API route registration
│   ├── static.ts              # Static file serving
│   ├── storage.ts             # Data access layer (CRUD)
│   └── vite.ts                # Vite dev server integration
├── shared/
│   └── schema.ts              # Drizzle schema + Zod types (users table)
├── script/
│   └── build.ts               # Production build script
├── drizzle.config.ts
├── package.json
├── postcss.config.js
└── tsconfig.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js `^20.19.0` or `>=22.12.0`
- PostgreSQL database

### Installation

```bash
git clone https://github.com/Anvi2801-dot/PRISM-demo.git
cd PRISM-demo
npm install
```

### Environment Setup

Create a `.env` file in the root with your database connection:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/prism_onboarder
SESSION_SECRET=your-session-secret
```

### Database Setup

Push the schema to your database:

```bash
npm run db:push
```

### Development

```bash
npm run dev
```

The server starts on `http://localhost:5000` with Vite's dev server integrated for hot module replacement.

### Production Build

```bash
npm run build
npm start
```

## 📜 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server (Express + Vite HMR) |
| `npm run build` | Bundle client and server for production |
| `npm start` | Run production build |
| `npm run check` | TypeScript type checking |
| `npm run db:push` | Push Drizzle schema changes to the database |

## 🗺️ Routes

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/onboarding/:id` | User onboarding flow (step-by-step) |
| `/admin` | Admin dashboard |
