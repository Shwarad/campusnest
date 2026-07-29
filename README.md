<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=CampusNest&fontSize=70&fontColor=fff&animation=fadeIn&fontAlignY=38&desc=Find%20your%20room.%20Find%20your%20roommate.%20Feel%20at%20home.&descAlignY=58&descSize=18" width="100%"/>

<br/>

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![IBM Granite](https://img.shields.io/badge/IBM_Granite-AI-0f62fe?style=for-the-badge&logo=ibm&logoColor=white)](https://www.ibm.com/watsonx)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

<br/>

> **🎓 The all-in-one student housing platform for college students in Guwahati, Assam.**  
> Search verified rooms, find compatible roommates, avoid rental scams — powered by IBM Granite AI.

<br/>

[🌐 Live Demo](#) · [📖 Docs](#-installation) · [🐛 Issues](https://github.com/Shwarad/campusnest/issues) · [🔮 Roadmap](#-future-roadmap)

<br/>

</div>

---

## 🎯 What is CampusNest?

Every year, thousands of students arrive in a new city to start college — and immediately face the same nightmare: **finding a place to live**.

They scroll through hundreds of fake listings, get asked for advance payments before even seeing a room, have no way to compare properties, and know nobody to room with.

**CampusNest fixes this.**

It is a full-stack web application built specifically for college students searching for:

- 🏠 Affordable **rooms, PGs, hostels, and shared flats** near their college
- 🤝 **Compatible roommates** matched by lifestyle and preferences
- ✅ **Verified, genuine listings** with scam-risk indicators
- 🗺️ **Map-based discovery** with nearby facilities
- 📊 **Side-by-side property comparison** with smart recommendations
- 🤖 **NestAI** — IBM Granite-powered housing assistant

> Built for Guwahati, Assam context with real locality data.

---

## 😣 The Problem We Solve

| Pain Point | CampusNest Solution |
|---|---|
| Fake listings and scam advances | Automated scam-risk detector (Low / Review / High) + AI explanation |
| No way to verify a landlord | Admin verification badge system |
| Hard to compare multiple properties | Side-by-side comparison + **AI comparison with NestAI** |
| Finding a roommate is hit-or-miss | 8-factor weighted compatibility algorithm + AI explanation |
| Don't know the area at all | Nearby facilities on every property page |
| No idea if rent is fair | Average rent benchmarks for the area |
| Landlord ghosts after enquiry | Internal enquiry system with status tracking |
| Hard to search naturally | **NestAI natural-language search** |

---

## ✨ Features at a Glance

<table>
<tr>
<td width="50%">

**🔍 Discovery**
- Smart search with 15+ filters
- **NestAI natural-language search** ("Verified PG under ₹7,000 near Cotton University")
- Grid and map view (Leaflet + OpenStreetMap)
- Sort by rent, rating, distance, popularity
- College-centric distance filtering

</td>
<td width="50%">

**🤖 NestAI (IBM Granite)**
- Natural-language property search
- AI property comparison with trade-offs
- NestAI Property Brief per listing
- Review summarisation with sentiment
- Roommate compatibility explanation
- Scam-risk explanation in plain English
- NestAI housing assistant chatbot

</td>
</tr>
<tr>
<td>

**🔐 Authentication (Multi-method)**
- Email + Password
- **Google Sign-in / Sign-up** (OAuth 2.0)
- **Phone + SMS OTP** (via Twilio)
- **Email + OTP** (passwordless, via SMTP)
- All methods produce the same JWT session
- Brute-force protection on OTP endpoints

</td>
<td>

**🤝 Roommate Matching**
- 8-factor lifestyle questionnaire
- 0–100% compatibility score
- **AI explanation** of strong matches and differences
- Browse and connect with profiles

</td>
</tr>
<tr>
<td>

**🛡️ Trust & Safety**
- Low / Review Recommended / High scam risk badge
- **AI-explained risk signals** (neutral language)
- Admin-verified property badge
- Multi-report flagging system
- Safety tips on every page

</td>
<td>

**💡 Smart Features**
- Personalised match percentage with reasons
- Side-by-side property comparison
- **"Compare with NestAI"** button
- Favourite / saved listings
- Monthly expense calculator

</td>
</tr>
</table>

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18 + TypeScript** | UI framework with type safety |
| **Vite 5** | Lightning-fast dev server and build tool |
| **Tailwind CSS 3** | Utility-first responsive styling |
| **React Router v6** | Client-side routing |
| **React Hook Form + Zod** | Form validation |
| **@react-oauth/google** | Google OAuth 2.0 sign-in button |
| **Leaflet + React Leaflet** | Interactive maps (OpenStreetMap — no API key) |
| **Lucide React** | Icon library |
| **React Hot Toast** | Toast notifications |
| **Axios** | HTTP client with JWT interceptors |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js 22 + Express** | REST API server |
| **TypeScript** | Type-safe server code |
| **Prisma 5** | ORM and schema management |
| **PostgreSQL / SQLite** | Production DB (Neon) / Local dev DB |
| **JWT + bcryptjs** | Auth and password hashing |
| **google-auth-library** | Server-side Google ID token verification |
| **Twilio** | SMS OTP delivery |
| **Nodemailer** | Email OTP delivery |
| **IBM watsonx.ai SDK** | IBM Granite AI integration |
| **node-cache** | In-process cache for AI responses |
| **Zod** | Server-side input validation |
| **Helmet + CORS + Rate Limiting** | Security middleware |

### Infrastructure
| Technology | Purpose |
|---|---|
| **Vercel** | Frontend hosting + serverless API functions |
| **Neon** | Free PostgreSQL database (production) |
| **SQLite** | Zero-config local development database |
| **IBM watsonx.ai** | IBM Granite LLM and embedding models |
| **Google Cloud Console** | OAuth 2.0 credentials |
| **Twilio** | SMS OTP (free trial available) |

### Testing
| Technology | Purpose |
|---|---|
| **Vitest** | Unit and integration test runner |
| **60 passing tests** | Compatibility, recommendations, scam detection, all AI services |

---

## 🏗️ Project Architecture

```
campusnest/
├── api/                        ← Vercel serverless entry point
│   └── index.ts
├── client/                     ← React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── PropertyCard.tsx
│   │   │   ├── PropertyMap.tsx
│   │   │   └── ai/             ← AI UI components
│   │   │       ├── NaturalLanguageSearch.tsx
│   │   │       ├── AIComparisonPanel.tsx
│   │   │       ├── PropertyBrief.tsx
│   │   │       ├── RoommateMatchExplanation.tsx
│   │   │       ├── ReviewSummary.tsx
│   │   │       ├── RiskExplanation.tsx
│   │   │       ├── NestAIChat.tsx
│   │   │       ├── AIResponseDisclaimer.tsx
│   │   │       └── AIThinkingSkeleton.tsx
│   │   ├── context/            ← AuthContext (JWT + Google + OTP)
│   │   ├── layouts/            ← MainLayout, DashboardLayout, AuthLayout
│   │   ├── pages/              ← 12 route pages
│   │   ├── services/
│   │   │   ├── api.ts          ← Axios base client
│   │   │   ├── propertyService.ts
│   │   │   ├── roommateService.ts
│   │   │   ├── enquiryService.ts
│   │   │   ├── adminService.ts
│   │   │   └── aiService.ts    ← All AI API calls
│   │   └── types/
├── server/                     ← Express + Prisma backend
│   ├── prisma/
│   │   └── schema.prisma       ← 8 models + googleId/OTP fields
│   ├── src/
│   │   ├── app.ts
│   │   ├── controllers/
│   │   │   └── authController.ts  ← Email+Pw, Google, Phone OTP, Email OTP
│   │   ├── routes/
│   │   │   └── auth.ts            ← 8 auth endpoints
│   │   ├── utils/
│   │   │   ├── otp.ts             ← OTP generation, Twilio, Nodemailer
│   │   │   ├── roommateCompatibility.ts
│   │   │   └── recommendation.ts
│   │   └── ai/                 ← AI services
│   │       ├── graniteClient.ts
│   │       ├── promptTemplates.ts
│   │       ├── responseSchemas.ts
│   │       ├── mockMode.ts
│   │       ├── naturalSearch.service.ts
│   │       ├── propertyComparison.service.ts
│   │       ├── listingSummary.service.ts
│   │       ├── roommateExplanation.service.ts
│   │       ├── reviewSummary.service.ts
│   │       ├── scamExplanation.service.ts
│   │       ├── rag.service.ts
│   │       ├── chat.service.ts
│   │       └── ai.routes.ts
├── vercel.json
├── .env.example                ← All env vars documented (root)
└── server/.env.example         ← Server-only vars with setup instructions
```

---

## 🔐 Authentication Methods

CampusNest supports four sign-in and sign-up methods. All produce the same JWT session and work on the same account.

### 1. Email + Password
Classic registration and login. Passwords are hashed with bcrypt (12 rounds).

### 2. Google Sign-In / Sign-Up
One-click login using your Google account. The backend verifies the ID token with Google's servers — the token never passes through the client unchecked.

- First sign-in with a Google account automatically creates a CampusNest account.
- Existing email/password accounts are linked to Google on first Google sign-in.

### 3. Phone + SMS OTP
Enter your phone number → receive a 6-digit OTP via SMS → verified in 10 minutes.

- OTP is hashed with bcrypt before storage — never stored in plain text.
- Rate-limited to 5 requests per 10 minutes per IP.
- In dev mode (no Twilio credentials), OTP is printed to the server console.

### 4. Email + OTP (Passwordless)
Enter your email → receive a 6-digit sign-in code → verified in 10 minutes.

- Only works for existing accounts.
- Safe against email-enumeration attacks (identical response regardless of email existence).
- In dev mode (no SMTP credentials), OTP is printed to the server console.

---

## 🚀 Installation & Running Locally

### Prerequisites

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **npm** v8+
- No database setup needed for local dev (SQLite is used automatically)

### 1 — Clone the repo

```bash
git clone https://github.com/Shwarad/campusnest.git
cd campusnest
```

### 2 — Install all dependencies

```bash
npm run install:all
```

### 3 — Configure environment

```bash
# Copy the example env file
cp server/.env.example server/.env
```

Minimum local dev `.env` (SQLite, no external services):

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=file:./campusnest.db
JWT_SECRET=campusnest-dev-secret-key-change-in-prod
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Optional — leave blank to use console-log OTP fallback in dev:
GOOGLE_CLIENT_ID=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

> **Note:** For local dev, change `server/prisma/schema.prisma` → `provider = "sqlite"` if it shows `postgresql`.

### 4 — Set up the database

```bash
cd server

# Regenerate Prisma client (required after any schema change)
npx prisma generate

# Create the SQLite database and all tables
npx prisma db push

# Seed with 12 properties + demo accounts
npm run seed
```

### 5 — Start the development servers

```bash
# From project root — starts both servers simultaneously
cd ..
npm run dev
```

| Service | URL |
|---|---|
| 🖥️ Frontend (React) | http://localhost:5173 |
| ⚡ Backend API | http://localhost:5000/api |
| ❤️ Health check | http://localhost:5000/api/health |
| 🤖 AI status | http://localhost:5000/api/ai/status |

---

## 🎭 Demo Accounts

Login at `http://localhost:5173/login` with these credentials:

| Role | Email | Password | Access |
|---|---|---|---|
| 🎓 **Student** | `student@campusnest.demo` | `Demo@123` | Search, save, enquire, roommate match |
| 🏠 **Owner** | `owner@campusnest.demo` | `Demo@123` | Manage listings, view enquiries |
| 🛡️ **Admin** | `admin@campusnest.demo` | `Demo@123` | Verifications, reports, all users |

> ⚠️ Demo credentials are for demonstration only. Do not use in production.

---

## 🌐 Deploying to Vercel

### Environment Variables for Vercel

Set these in **Vercel → Project → Settings → Environment Variables**:

#### Required

| Variable | Description |
|---|---|
| `DATABASE_URL` | `postgresql://user:pass@host/db?sslmode=require` from [neon.tech](https://neon.tech) |
| `JWT_SECRET` | 64-char random string: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |

#### Authentication

| Variable | Description |
|---|---|
| `GOOGLE_CLIENT_ID` | From [Google Cloud Console](https://console.cloud.google.com) → OAuth 2.0 Client ID |
| `TWILIO_ACCOUNT_SID` | From [Twilio Console](https://console.twilio.com) — SMS OTP |
| `TWILIO_AUTH_TOKEN` | From Twilio Console |
| `TWILIO_PHONE_NUMBER` | Your Twilio phone number (E.164 format, e.g. `+1xxxxxxxxxx`) |
| `SMTP_HOST` | SMTP server hostname (e.g. `smtp.gmail.com`) — email OTP |
| `SMTP_PORT` | SMTP port (587 for TLS, 465 for SSL) |
| `SMTP_USER` | SMTP username / email address |
| `SMTP_PASS` | SMTP password or App Password |
| `SMTP_FROM` | Sender name and email, e.g. `CampusNest <you@gmail.com>` |

#### IBM Granite AI (optional)

| Variable | Description |
|---|---|
| `IBM_WATSONX_API_KEY` | IBM Cloud IAM API key from [cloud.ibm.com](https://cloud.ibm.com) |
| `IBM_WATSONX_PROJECT_ID` | watsonx.ai project ID |
| `IBM_WATSONX_URL` | Regional endpoint, e.g. `https://us-south.ml.cloud.ibm.com` |
| `IBM_GRANITE_MODEL_ID` | Model ID, e.g. `ibm/granite-13b-chat-v2` |
| `IBM_GRANITE_EMBEDDING_MODEL_ID` | Embedding model ID, e.g. `ibm/slate-125m-english-rtrvr` |
| `IBM_WATSONX_API_VERSION` | API version date, e.g. `2024-05-31` |
| `AI_REQUEST_TIMEOUT_MS` | Request timeout in ms (default: `20000`) |
| `AI_FEATURES_ENABLED` | Set `false` to disable all AI features |
| `AI_MOCK_MODE` | Set `true` for offline demo without IBM credentials |

#### Frontend

| Variable | Description |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Same value as `GOOGLE_CLIENT_ID` — enables the Google Sign-In button |
| `VITE_API_URL` | Leave **blank** when frontend + backend share one Vercel project |

### Setting up Google OAuth

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project (or use an existing one)
3. **APIs & Services → Credentials → Create OAuth 2.0 Client ID**
4. Application type: **Web application**
5. **Authorised JavaScript origins:**
   - `http://localhost:5173` (development)
   - `https://your-app.vercel.app` (production)
6. Copy the **Client ID** (you do not need the Client Secret for this flow)
7. Set `GOOGLE_CLIENT_ID` (server) and `VITE_GOOGLE_CLIENT_ID` (client) to this value

### Setting up Twilio SMS OTP

1. Sign up at [twilio.com](https://twilio.com) — free trial includes credits
2. Get a phone number from the Twilio Console
3. Copy **Account SID** and **Auth Token** from the Console Dashboard
4. Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`

> **Dev tip:** If Twilio credentials are absent, the OTP is printed to the server console — no SMS is sent.

### Setting up Email OTP (SMTP)

Works with Gmail, Outlook, Resend, Mailgun, or any SMTP provider.

**Gmail example:**
1. Enable 2-Step Verification on your Google account
2. Go to [myaccount.google.com → Security → App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an App Password for "Mail"
4. Use `smtp.gmail.com`, port `587`, your Gmail address, and the App Password

**Resend (recommended for production):**
1. Sign up at [resend.com](https://resend.com)
2. Create an API key and SMTP credentials
3. Use `smtp.resend.com`, port `587`

> **Dev tip:** If SMTP credentials are absent, the OTP code is printed to the server console.

### Deploy steps

```bash
# 1. Push to GitHub
git push origin master

# 2. Go to vercel.com/new → import your repo
# 3. Add the environment variables listed above
# 4. Click Deploy

# 5. After first deploy — seed the production database:
DATABASE_URL="postgresql://..." npx prisma db push
DATABASE_URL="postgresql://..." npm run seed
```

---

## 🧪 Running Tests

```bash
# All tests (from repo root)
npm test

# Server tests only (60 tests across 3 suites)
cd server && npm test
```

### What's tested

| Suite | Tests | Covers |
|---|---|---|
| Roommate Compatibility | 9 | Budget overlap, sleep mismatch, lifestyle scoring, edge cases |
| Property Recommendation + Scam Detection | 9 | Budget fit, distance scoring, verification boost, scam flags |
| AI Services | 42 | Schema validation, NL filter extraction, prompt injection resistance, PII removal, scam neutrality, demo flow queries |

---

## 📡 API Reference

<details>
<summary><strong>Authentication</strong></summary>

```
POST  /api/auth/register            Register (email + password)
POST  /api/auth/login               Login (email + password) → JWT
POST  /api/auth/google              Google OAuth → JWT
POST  /api/auth/phone/send-otp      Send SMS OTP to phone number
POST  /api/auth/phone/verify-otp    Verify phone OTP → JWT
POST  /api/auth/email/send-otp      Send email OTP (passwordless)
POST  /api/auth/email/verify-otp    Verify email OTP → JWT
GET   /api/auth/me                  Get logged-in user (auth required)
PUT   /api/auth/profile             Update profile (auth required)
```
</details>

<details>
<summary><strong>Properties</strong></summary>

```
GET   /api/properties                     List/search (15+ filter params)
GET   /api/properties/saved               Saved properties (auth)
GET   /api/properties/recommended         Smart recommendations (auth)
GET   /api/properties/:id                 Property details + views++
POST  /api/properties                     Create listing (owner)
PUT   /api/properties/:id                 Update (owner/admin)
DELETE /api/properties/:id                Soft delete (owner/admin)
POST  /api/properties/:id/favourite       Toggle save (student)
GET   /api/properties/:id/reviews         All reviews
POST  /api/properties/:id/reviews         Submit review (student)
POST  /api/properties/:id/report          Report listing (auth)
```
</details>

<details>
<summary><strong>Roommates</strong></summary>

```
GET   /api/roommates                      Browse all profiles
GET   /api/roommates/my-profile           Own profile (auth)
GET   /api/roommates/matches              Sorted compatibility matches (auth)
POST  /api/roommates/profile              Create profile
PUT   /api/roommates/profile              Update profile
```
</details>

<details>
<summary><strong>Enquiries</strong></summary>

```
POST  /api/enquiries                      Send enquiry (student)
GET   /api/enquiries/student              Student's sent enquiries (auth)
GET   /api/enquiries/owner               Owner's received enquiries (auth)
PUT   /api/enquiries/:id/respond          Owner responds (auth)
```
</details>

<details>
<summary><strong>AI (NestAI — IBM Granite)</strong></summary>

```
GET   /api/ai/status                              AI subsystem health
POST  /api/ai/search/parse                        NL query → structured filters
POST  /api/ai/properties/compare                  AI property comparison (2–3 props)
GET   /api/ai/properties/:id/summary              NestAI Property Brief (cached)
GET   /api/ai/properties/:id/reviews/summary      AI review summary (min 3 reviews)
GET   /api/ai/properties/:id/risk-explanation     Scam-risk AI explanation
GET   /api/ai/roommates/:id/explanation           Compatibility explanation (auth)
POST  /api/ai/chat                                NestAI housing assistant
```
</details>

<details>
<summary><strong>Admin</strong></summary>

```
GET   /api/admin/dashboard               Stats: users, listings, reports
GET   /api/admin/verifications           Pending verifications
PUT   /api/admin/properties/:id/verify   Approve listing
PUT   /api/admin/properties/:id/reject   Reject listing
GET   /api/admin/reports                 All user reports
PUT   /api/admin/reports/:id             Update report status
GET   /api/admin/users                   User management
PUT   /api/admin/users/:id/toggle        Activate / deactivate user
```
</details>

---

## 🤝 Roommate Compatibility Algorithm

A transparent, rule-based weighted scoring system.

```
Total Score (0–100) =
  Budget overlap       × 20%
  Location match       × 15%
  Sleep schedule       × 15%
  Cleanliness          × 15%
  Smoking + Drinking   × 15%
  Study + Noise habits × 10%
  Food preference      × 5%
  Visitors + Pets      × 5%
```

After the score is calculated deterministically, NestAI (IBM Granite) explains it in plain English — it never modifies the score.

---

## 💡 Smart Recommendation Engine

| Factor | Max Points |
|---|---|
| Budget fit | 30 |
| Distance from college | 20 |
| Verification status | 15 |
| Average rating | 15 |
| Amenity match | 10 |
| Property type | 5 |
| Availability | 5 |

---

## ⚠️ Scam Risk Detector

| Signal | Risk Points |
|---|---|
| Rent > 50% below area average | +30 |
| Missing or incomplete address | +20 |
| No property photos | +15 |
| Unusually high deposit (>6× rent) | +15 |
| Missing contact info | +10 |
| Owner account < 30 days old | +10 |
| Unverified property | +5 |

**Result:** 🟢 Low Risk · 🟡 Review Recommended · 🔴 High Caution

NestAI explains detected signals in neutral language — it never calls anyone a scammer.

---

## 🔒 Security

- Passwords hashed with **bcrypt** (12 rounds)
- OTP codes hashed with **bcrypt** before storage
- **JWT** tokens, 7-day expiry
- **Google ID tokens verified server-side** with `google-auth-library`
- **Role-based access control** on all routes
- **Rate limiting**: 200 req/15 min general, 20 req/15 min auth, 5 OTP requests/10 min
- **Zod** validation on every API input
- **Helmet** security headers + **CORS** restricted to frontend origin
- OTP endpoints use constant-time comparison
- Email-enumeration protection on email OTP endpoint
- PII stripped before every IBM Granite API call
- Zero credentials committed to source code

---

## 🌱 Seed Data

| Data | Count |
|---|---|
| Property listings | 12 |
| Users | 11 |
| Roommate profiles | 8 |
| Reviews | 10 |
| Enquiries | 3 |
| Reported listings | 3 |

---

## 🔮 Future Roadmap

### Phase 1 — Trust & Verification
- [ ] Aadhaar-based owner verification (DigiLocker integration)
- [ ] Video property tours
- [ ] Lease agreement template generator
- [ ] WhatsApp OTP via Twilio (alternative to SMS)

### Phase 2 — Communication
- [ ] Real-time chat (Socket.io) between students and owners
- [ ] Push notifications (PWA)
- [ ] Email digest for new matching listings

### Phase 3 — AI & Intelligence
- [ ] pgvector production vector store for RAG
- [ ] Price prediction for a given locality
- [ ] Anomaly detection for scam listings
- [ ] Personalised property recommendations with embeddings

### Phase 4 — Scale
- [ ] React Native mobile app (iOS + Android)
- [ ] Cloudinary / AWS S3 for image uploads
- [ ] Multi-city expansion
- [ ] Owner analytics dashboard

---

## 🤝 Contributing

```bash
# Fork and clone
git clone https://github.com/Shwarad/campusnest.git

# Create a feature branch
git checkout -b feature/your-feature-name

# Make changes, then test
npm test

# Commit and push
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature-name

# Open a Pull Request on GitHub
```

---

## 📄 Licence

MIT © 2026 CampusNest — Built for students, by students.

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer&animation=fadeIn" width="100%"/>

**⭐ If CampusNest helps you, give it a star on GitHub!**

*Find your room. Find your roommate. Feel at home.*

</div>
