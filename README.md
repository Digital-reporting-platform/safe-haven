<div align="center">

# Safe Haven

**A survivor-centered digital platform for anonymous reporting, coordinated case management, and multilingual support.**

*Where privacy meets protection — built so every voice can be heard, in any language.*

<br />

[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Storage_&_DB-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./violence_backend/package.json)

[Features](#features) · [Architecture](#architecture) · [Quick Start](#quick-start) · [Documentation](#documentation) · [Deployment](#deployment)

</div>

---

## The Problem

Violence, abuse, and bullying remain severely underreported. Survivors often stay silent because of fear, stigma, language barriers, and systems that feel inaccessible or unsafe.

**Safe Haven** was built to change that equation — not by asking survivors to adapt to bureaucracy, but by designing technology that adapts to them.

---

## What Makes Safe Haven Different

| Principle | How We Deliver It |
|-----------|---------------------|
| **Privacy by default** | Anonymous reporting with tracking numbers — no account required |
| **Language inclusion** | Full interface and NLP classification in English, Amharic (አማርኛ), and Oromo (Afaan Oromoo) |
| **Intelligent routing** | Keyword-based ML classification across 13 incident categories with severity scoring |
| **Coordinated care** | Dedicated workflows for counselors, medical professionals, and legal advisors |
| **Accountability** | Role-based access, audit trails, and PostgreSQL Row-Level Security |
| **Community support** | Secure messaging, peer forums, missing persons registry, and a recovery resource hub |

---

## Features

### For Survivors

- Submit reports anonymously or with a verified account (OTP email verification)
- Track case status in real time using a unique tracking number
- Upload evidence securely via Supabase Storage
- Message assigned professionals through encrypted channels
- Access support resources, hotlines, and a recovery hub
- Participate in moderated community forums

### For Support Professionals

| Role | Capabilities |
|------|-------------|
| **Counselor** | Review reports, confirm or override ML classification, assign cases, manage workflow |
| **Medical Professional** | Patient profiles, medical case workflow, clinical documentation |
| **Legal Advisor** | Legal workflow, evidence management, court calendar, document templates |
| **Moderator** | Forum moderation, content review, community guidelines enforcement |
| **Admin** | User management, provider verification, system settings, security monitoring, analytics |

### Platform Capabilities

- **13 incident categories** — from physical violence and domestic abuse to cyberbullying and workplace harassment
- **Risk scoring** — duplicate detection, spam prevention, and flagged-report review
- **Missing persons registry** — public listings with sighting submissions
- **Job portal** — employment opportunities with saved jobs and applications
- **Analytics dashboard** — trend tracking and outcome reporting for administrators
- **System messaging** — targeted announcements by audience (survivors, counselors, professionals)

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     React Frontend (Vite)                        │
│  ┌────────────┐ ┌────────────┐ ┌──────────────┐ ┌─────────────┐ │
│  │  Public    │ │  Survivor  │ │ Professional │ │    Admin    │ │
│  │  Portal    │ │   Portal   │ │   Portals    │ │   Console   │ │
│  └─────┬──────┘ └─────┬──────┘ └──────┬───────┘ └──────┬──────┘ │
└────────┼──────────────┼───────────────┼─────────────────┼───────┘
         └──────────────┴───────────────┴─────────────────┘
                                    │
                         REST API  │  JWT + RBAC
                                    ▼
┌──────────────────────────────────────────────────────────────────┐
│                      NestJS Backend (API)                        │
│  ┌────────┐ ┌─────────┐ ┌───────┐ ┌──────────┐ ┌──────────────┐ │
│  │  Auth  │ │ Reports │ │ Cases │ │ Workflow │ │ Classification│ │
│  │ OTP/JWT│ │ + Upload│ │ Mgmt  │ │  Engine  │ │  (NLP/ML)    │ │
│  └────────┘ └─────────┘ └───────┘ └──────────┘ └──────────────┘ │
│  ┌────────┐ ┌─────────┐ ┌───────┐ ┌──────────┐ ┌──────────────┐ │
│  │Medical │ │  Legal  │ │Forum  │ │Messaging │ │Missing Persons│ │
│  │Workflow│ │ Workflow│ │Module │ │  Module  │ │  + Job Portal │ │
│  └────────┘ └─────────┘ └───────┘ └──────────┘ └──────────────┘ │
└──────────────────────────────┬───────────────────────────────────┘
                               │
                               ▼
              ┌────────────────────────────────┐
              │   PostgreSQL (Supabase)        │
              │   Prisma ORM · RLS Policies    │
              │   Supabase Storage (evidence)  │
              └────────────────────────────────┘
```

### Request Lifecycle

```
Report → Language Detection → ML Classification → Risk Score → Database
  → Email Notification → Counselor Review → Case Assignment → Resolution
```

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS 4, Radix UI, Framer Motion, i18next, React Hook Form, Axios |
| **Backend** | NestJS 10, Prisma, Passport JWT, Class-validator, Natural (NLP), Nodemailer, Helmet, Throttler |
| **Database** | PostgreSQL via Supabase with Row-Level Security |
| **Storage** | Supabase Storage for evidence and file uploads |
| **Auth** | JWT tokens + OTP email verification (Gmail SMTP) |
| **Testing** | Jest (backend), Playwright (frontend E2E + API tests) |
| **Deployment** | Vercel (frontend), Railway (backend) |

---

## Project Structure

```
Safe_Haven/
├── violence_frontend/          # React + Vite SPA
│   ├── src/
│   │   ├── pages/              # Role-based route pages
│   │   ├── components/         # Shared UI (Radix + Tailwind)
│   │   ├── services/           # API client layer
│   │   ├── routes/             # Route configs per role
│   │   ├── auth/               # Login, register, OTP flows
│   │   └── i18n/               # EN · AM · OM translations
│   └── env.sample              # Frontend env template
│
├── violence_backend/           # NestJS REST API
│   ├── src/modules/
│   │   ├── auth/               # Registration, OTP, JWT, RBAC
│   │   ├── reports/            # Incident reporting
│   │   ├── cases/              # Case assignment & comments
│   │   ├── classification/     # ML keyword classification
│   │   ├── workflow/           # Status workflow engine
│   │   ├── medical-workflow/   # Medical provider workflows
│   │   ├── legal-workflow/     # Legal provider workflows
│   │   ├── messaging/          # Secure messaging
│   │   ├── forum/              # Community forums
│   │   ├── missing-persons/    # Missing persons registry
│   │   ├── job-portal/         # Employment opportunities
│   │   └── analytics/          # Admin analytics
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── migrations/         # Version-controlled migrations
│   └── nixpacks.toml           # Railway build configuration
│
└── README.md
```

---

## Quick Start

### Prerequisites

- **Node.js** ≥ 18 (LTS recommended)
- **npm** ≥ 9
- **PostgreSQL** 14+ (local or [Supabase](https://supabase.com) project)
- **Gmail account** with App Password enabled (for OTP emails)

### 1. Clone and install

```bash
git clone https://github.com/your-username/Safe_Haven.git
cd Safe_Haven

# Backend
cd violence_backend && npm install

# Frontend
cd ../violence_frontend && npm install
```

### 2. Configure environment

**Backend** — create `violence_backend/.env`:

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_SECRET="your-secure-random-string"
JWT_EXPIRES_IN="7d"
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
PORT="3000"
```

**Frontend** — create `violence_frontend/.env`:

```env
VITE_API_URL="http://localhost:3000/api"
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

> See [`violence_frontend/env.sample`](./violence_frontend/env.sample) and [`violence_backend/DATABASE_SETUP.md`](./violence_backend/DATABASE_SETUP.md) for full configuration details.

### 3. Initialize the database

```bash
cd violence_backend
npm run db:setup        # generate client, run migrations, seed data
# or step by step:
npx prisma migrate dev
npx prisma generate
npm run seed
```

### 4. Run locally

```bash
# Terminal 1 — API (http://localhost:3000/api)
cd violence_backend && npm run start:dev

# Terminal 2 — Frontend (http://localhost:5173)
cd violence_frontend && npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:3000/api |
| Swagger Docs | http://localhost:3000/api/docs |

---

## User Roles

Safe Haven implements eight distinct roles with granular permissions:

| Role | Access Level |
|------|-------------|
| `GUEST` | Public pages, anonymous reporting |
| `SURVIVOR` | Report submission, case tracking, messaging, forums |
| `COUNSELOR` | Report review, case assignment, workflow management |
| `MEDICAL_PROFESSIONAL` | Medical cases, patient profiles, clinical workflow |
| `LEGAL_ADVISOR` | Legal cases, evidence, documents, court calendar |
| `MODERATOR` | Forum moderation, content review |
| `ADMIN` | Full system administration |
| `SYSTEM` | Internal automated processes |

---

## ML Classification

Reports are automatically analyzed using a **rule-based, multi-language keyword classifier** powered by the Natural NLP library.

```
Input:  "My boss hit me at work yesterday"
        ↓
Detect language → Extract keywords → Score 13 categories
        ↓
Output: WORKPLACE_ABUSE · MEDIUM severity · 67% confidence
        → Suggested case type: LEGAL_ASSISTANCE
```

**Incident categories:** Physical Violence · Sexual Assault · Emotional Abuse · Psychological Abuse · Neglect · Cyberbullying · Harassment · Discrimination · Workplace Abuse · Domestic Violence · Child Abuse · Elder Abuse · Other

**Severity levels:** LOW → MEDIUM → HIGH → CRITICAL

Reports with a risk score ≥ 50 are flagged for manual counselor review.

Full classification reference: [`violence_backend/ML_CLASSIFICATION.md`](./violence_backend/ML_CLASSIFICATION.md)

---

## Security

| Layer | Implementation |
|-------|-----------------|
| Authentication | JWT + OTP email verification, bcrypt password hashing |
| Authorization | Role-based access control across 8 roles |
| Database | PostgreSQL Row-Level Security (RLS) policies |
| Transport | HTTPS/TLS, Helmet security headers, CORS whitelist |
| Input | Class-validator (backend), Zod (frontend), Prisma parameterized queries |
| Rate limiting | NestJS Throttler (100 req/min default) |
| Privacy | Anonymous reporting, IP hashing, soft deletes with audit trail |

Security guide: [`violence_backend/RLS_SECURITY_GUIDE.md`](./violence_backend/RLS_SECURITY_GUIDE.md)

---

## API Overview

**Base URL:** `http://localhost:3000/api` (development)

Protected routes require a Bearer token:

```http
Authorization: Bearer <jwt-token>
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register survivor account |
| `POST` | `/auth/verify-email` | Verify OTP and receive JWT |
| `POST` | `/auth/login` | Authenticate user |
| `POST` | `/reports` | Submit incident report (anonymous or authenticated) |
| `GET` | `/reports/track/:trackingNumber` | Track report status |
| `POST` | `/cases/assign` | Assign case to professional (counselor) |
| `GET` | `/cases/my-cases` | List assigned cases (professional) |

Interactive documentation: **http://localhost:3000/api/docs** (Swagger/OpenAPI)

---

## Testing

```bash
# Backend — unit & integration
cd violence_backend
npm run test
npm run test:e2e
npm run test:cov

# Frontend — Playwright E2E
cd violence_frontend
npm run test:e2e              # all tests
npm run test:e2e:anonymous    # anonymous reporting flows
npm run test:e2e:survivor     # survivor portal
npm run test:e2e:admin        # admin console
npm run test:e2e:security     # security scenarios
npm run test:api              # backend API tests
```

---

## Deployment

### Frontend → Vercel

```bash
cd violence_frontend
npm run build
# Deploy via Vercel CLI or connect GitHub repo in Vercel dashboard
```

Set environment variables: `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

Guide: [`violence_frontend/VERCEL_DEPLOYMENT.md`](./violence_frontend/VERCEL_DEPLOYMENT.md)

### Backend → Railway

Railway uses [`violence_backend/nixpacks.toml`](./violence_backend/nixpacks.toml) for builds:

- Installs dependencies with `npm ci`
- Runs `prisma generate` and `nest build`
- Starts with `prisma migrate deploy && node dist/main`

Set all backend `.env` variables in the Railway dashboard, including `NODE_ENV=production` and your production `FRONTEND_URL`.

Guide: [`violence_backend/RAILWAY_DEPLOYMENT_FIX.md`](./violence_backend/RAILWAY_DEPLOYMENT_FIX.md)

### Database → Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy connection strings to `DATABASE_URL`
3. Apply RLS policies — see [`violence_backend/SUPABASE_SETUP.md`](./violence_backend/SUPABASE_SETUP.md)
4. Create a storage bucket for evidence uploads

---

## Documentation

| Document | Description |
|----------|-------------|
| [`violence_backend/DOCUMENTATION_INDEX.md`](./violence_backend/DOCUMENTATION_INDEX.md) | Full backend documentation index |
| [`violence_backend/QUICK_START.md`](./violence_backend/QUICK_START.md) | Backend setup walkthrough |
| [`violence_backend/ML_CLASSIFICATION.md`](./violence_backend/ML_CLASSIFICATION.md) | Classification engine details |
| [`violence_backend/SCHEMA_REFERENCE.md`](./violence_backend/SCHEMA_REFERENCE.md) | Database schema reference |
| [`violence_backend/RLS_SECURITY_GUIDE.md`](./violence_backend/RLS_SECURITY_GUIDE.md) | Row-Level Security policies |
| [`violence_frontend/ENV_SECURITY_GUIDE.md`](./violence_frontend/ENV_SECURITY_GUIDE.md) | Environment variable security |

---

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Run linting: `npm run lint` in both frontend and backend
4. Write or update tests for new functionality
5. Commit using [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, etc.)
6. Open a Pull Request with a clear description

---

## License

This project is licensed under the **MIT License** — see [`violence_backend/package.json`](./violence_backend/package.json).

---

## Important Notice

Safe Haven is a support platform — **not an emergency service**. If you or someone you know is in immediate danger:

| Region | Contact |
|--------|---------|
| **Ethiopia** | Emergency: **991** · Gender-based violence hotline: **8198** |
| **United States** | Emergency: **911** · National DV Hotline: **1-800-799-7233** |
| **International** | Contact your local emergency services immediately |

---

<div align="center">

**Safe Haven** — *Empowering survivors. One report at a time.*

Built with care for communities that deserve safe, accessible support.

</div>
