<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=CampusNest&fontSize=70&fontColor=fff&animation=fadeIn&fontAlignY=38&desc=Find%20your%20room.%20Find%20your%20roommate.%20Feel%20at%20home.&descAlignY=58&descSize=18" width="100%"/>

<br/>

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

<br/>

> **🎓 The all-in-one student housing platform for college students in Guwahati, Assam.**  
> Search verified rooms, find compatible roommates, and avoid rental scams — all in one place.

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

> Built for hackathon demonstration — Guwahati, Assam context with real locality data.

---

## 😣 The Problem We Solve

| Pain Point | CampusNest Solution |
|---|---|
| Fake listings and scam advances | Automated scam-risk detector (Low / Review / High) |
| No way to verify a landlord | Admin verification badge system |
| Hard to compare multiple properties | Side-by-side comparison of up to 3 properties |
| Finding a roommate is hit-or-miss | 8-factor weighted compatibility algorithm |
| Don't know the area at all | Nearby facilities on every property page |
| No idea if rent is fair | Average rent benchmarks for the area |
| Landlord ghosts after enquiry | Internal enquiry system with status tracking |

---

## ✨ Features at a Glance

<table>
<tr>
<td width="50%">

**🔍 Discovery**
- Smart search with 15+ filters
- Grid and map view (Leaflet + OpenStreetMap)
- Sort by rent, rating, distance, popularity
- College-centric distance filtering

</td>
<td width="50%">

**🤝 Roommate Matching**
- 8-factor lifestyle questionnaire
- 0–100% compatibility score
- Explanation of strong matches
- Browse and connect with profiles

</td>
</tr>
<tr>
<td>

**🛡️ Trust & Safety**
- Low / Review Recommended / High scam risk badge
- Admin-verified property badge
- Multi-report flagging system
- Safety tips on every page

</td>
<td>

**💡 Smart Features**
- Personalised match percentage with reasons
- Side-by-side property comparison
- Favourite / saved listings
- Monthly expense calculator

</td>
</tr>
<tr>
<td>

**📬 Communication**
- Direct student-to-owner enquiry form
- Visit date and move-in date scheduling
- Owner response tracking
- Enquiry status (Pending / Seen / Responded)

</td>
<td>

**🌟 Reviews & Admin**
- 8-category rating system per property
- Average rating with breakdown
- Admin dashboard (verifications, reports, users)
- Platform statistics

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
| **Zod** | Server-side input validation |
| **Helmet + CORS + Rate Limiting** | Security middleware |
| **Morgan** | HTTP request logging |

### Infrastructure
| Technology | Purpose |
|---|---|
| **Vercel** | Frontend hosting + serverless API functions |
| **Neon** | Free PostgreSQL database (production) |
| **SQLite** | Zero-config local development database |

### Testing
| Technology | Purpose |
|---|---|
| **Vitest** | Unit and integration test runner |
| 18 passing tests | Compatibility algorithm, recommendation scoring, scam detection |

---

## 🏗️ Project Architecture

```
campusnest/
├── api/                        ← Vercel serverless entry point
│   └── index.ts
├── client/                     ← React + Vite frontend
│   ├── src/
│   │   ├── components/         ← PropertyCard, PropertyMap
│   │   ├── context/            ← AuthContext (JWT)
│   │   ├── layouts/            ← MainLayout, DashboardLayout, AuthLayout
│   │   ├── pages/              ← 12 route pages
│   │   │   ├── LandingPage.tsx
│   │   │   ├── SearchPage.tsx
│   │   │   ├── PropertyDetailPage.tsx
│   │   │   ├── RoommateMatchingPage.tsx
│   │   │   ├── ComparePropertiesPage.tsx
│   │   │   ├── StudentDashboardPage.tsx
│   │   │   ├── OwnerDashboardPage.tsx
│   │   │   ├── AdminDashboardPage.tsx
│   │   │   ├── AddPropertyPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── services/           ← API service layer (axios)
│   │   ├── types/              ← TypeScript interfaces
│   │   └── test/               ← Frontend tests
│   └── package.json
├── server/                     ← Express + Prisma backend
│   ├── prisma/
│   │   └── schema.prisma       ← 8 models: User, Property, Review, etc.
│   ├── src/
│   │   ├── app.ts              ← Express app (no listen — used by Vercel)
│   │   ├── index.ts            ← Local dev server (calls listen)
│   │   ├── config/             ← Prisma client singleton
│   │   ├── controllers/        ← auth, property, roommate, enquiry, admin
│   │   ├── middleware/         ← JWT auth, RBAC
│   │   ├── routes/             ← Express routers
│   │   ├── utils/
│   │   │   ├── roommateCompatibility.ts  ← 8-factor algorithm
│   │   │   └── recommendation.ts         ← Scoring + scam detection
│   │   ├── seed/               ← Demo data for Guwahati
│   │   └── tests/              ← 18 unit tests
│   └── package.json
├── vercel.json                 ← Vercel deployment config
├── .env.example                ← All env vars documented
└── README.md
```

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
cp .env.example server/.env
```

The default `server/.env` for local development:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=file:./campusnest.db
JWT_SECRET=campusnest-hackathon-secret-key-2024
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

> **Note:** For local dev, change `server/prisma/schema.prisma` → `provider = "sqlite"` if it shows `postgresql`.

### 4 — Set up the database

```bash
cd server

# Generate Prisma client
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

This project is Vercel-ready. Frontend and API share one deployment.

### What you need

1. **Neon PostgreSQL** (free) — [neon.tech](https://neon.tech)
2. **Vercel account** — [vercel.com](https://vercel.com)

### Environment Variables for Vercel

Set these in **Vercel → Project → Settings → Environment Variables**:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ **Required** | `postgresql://user:pass@host/db?sslmode=require` — from Neon |
| `JWT_SECRET` | ✅ **Required** | 64-char random string. Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_EXPIRES_IN` | Optional | Token lifetime — default `7d` |
| `NODE_ENV` | Optional | Set to `production` |
| `CLIENT_URL` | Optional | Your Vercel URL for CORS e.g. `https://campusnest.vercel.app` |
| `VITE_API_URL` | Optional | Leave **blank** when frontend+backend share one Vercel project |

### Deploy steps

```bash
# 1. Push to GitHub
git push origin main

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
# All tests
npm test

# Server tests only (18 tests across 2 suites)
cd server && npm test

# Client tests only
cd client && npm test
```

### What's tested

| Suite | Tests | Covers |
|---|---|---|
| Roommate Compatibility | 9 cases | Budget overlap, sleep mismatch, lifestyle scoring, edge cases |
| Property Recommendation + Scam Detection | 9 cases | Budget fit, distance scoring, verification boost, scam flags |

---

## 📡 API Reference

<details>
<summary><strong>Authentication</strong></summary>

```
POST  /api/auth/register      Register new user (student or owner)
POST  /api/auth/login         Login → returns JWT
GET   /api/auth/me            Get logged-in user (auth required)
PUT   /api/auth/profile       Update profile (auth required)
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

A transparent, rule-based weighted scoring system. No black-box ML — judges can verify the math.

```
Total Score (0–100) =
  Budget overlap       × 20%  (proportional range overlap)
  Location match       × 15%  (exact locality string match)
  Sleep schedule       × 15%  (early bird / night owl / flexible)
  Cleanliness          × 15%  (4-level scale with graceful degradation)
  Smoking + Drinking   × 15%  (boolean match, split equally)
  Study + Noise habits × 10%  (flexible preference handling)
  Food preference      × 5%   (veg / non-veg / any)
  Visitors + Pets      × 5%   (frequency + boolean)
```

**Output:** Score + per-category breakdown + "Your strongest matches are budget, location, cleanliness."

> Disclaimer: Score is a lifestyle indicator, not a guarantee of personal compatibility.

---

## 💡 Smart Recommendation Engine

Every property gets a match score against your stated preferences:

| Factor | Max Points |
|---|---|
| Budget fit | 30 |
| Distance from college | 20 |
| Verification status | 15 |
| Average rating | 15 |
| Amenity match | 10 |
| Property type | 5 |
| Availability | 5 |

**Displayed as:** *"92% match — within your budget, 1.2 km from campus, verified, Wi-Fi included."*

---

## ⚠️ Scam Risk Detector

Each listing is automatically scored for scam signals:

| Signal | Risk Points |
|---|---|
| Rent > 50% below area average | +30 |
| Missing or incomplete address | +20 |
| No property photos | +15 |
| Rent 30–50% below average | +15 |
| Unusually high deposit (>6× rent) | +15 |
| Missing contact info | +10 |
| Unverified property | +5 |
| Multiple user reports | escalates to High |

**Result:** 🟢 Low Risk · 🟡 Review Recommended · 🔴 High Risk

> Automated only — not a legal guarantee. Always visit before paying.

---

## 🔒 Security

- Passwords hashed with **bcrypt** (12 rounds)
- **JWT** tokens, 7-day expiry
- **Role-based access control** on all routes (student / owner / admin)
- **Rate limiting**: 200 req/15 min general, 20 req/15 min on auth
- **Zod** validation on every API input
- **Helmet** security headers
- **CORS** restricted to frontend origin
- Zero plain-text credentials in source code
- `.env` files excluded from Git and Vercel

---

## 🌱 Seed Data

The seed script creates realistic demo data for Guwahati, Assam:

| Data | Count |
|---|---|
| Property listings (PG, hostel, flat, room, shared) | 12 |
| Users (students + owners + admin) | 11 |
| Roommate profiles | 8 |
| Reviews | 10 |
| Enquiries | 3 |
| Reported listings | 3 |

Locations include: Jalukbari, Chandmari, Dispur, Zoo Road, Ganeshguri, Panbazar — all near real Guwahati colleges.

---

## 🔮 Future Roadmap

### Phase 1 — Trust & Verification
- [ ] Aadhaar-based owner verification (DigiLocker integration)
- [ ] Video property tours
- [ ] Lease agreement template generator
- [ ] WhatsApp notification for enquiry updates

### Phase 2 — Communication
- [ ] Real-time chat (Socket.io) between students and owners
- [ ] Push notifications (PWA)
- [ ] Email digest for new matching listings

### Phase 3 — Intelligence
- [ ] ML-powered roommate compatibility (beyond rule-based)
- [ ] Price prediction for a given locality
- [ ] AI-generated listing descriptions for owners
- [ ] Anomaly detection for scam listings

### Phase 4 — Scale
- [ ] React Native mobile app (iOS + Android)
- [ ] Cloudinary / AWS S3 for image uploads
- [ ] Multi-city expansion (beyond Guwahati)
- [ ] Owner analytics dashboard
- [ ] Student community forum

### Phase 5 — Ecosystem
- [ ] Integration with college portals
- [ ] PG/hostel booking and digital agreement
- [ ] Monthly expense splitting tool for roommates
- [ ] Credit scoring for tenants

---

## 📸 Pages Overview

| Page | Description |
|---|---|
| **Landing** | Hero section, search bar, featured listings, how it works, testimonials, safety tips |
| **Search** | Grid + map view, 15+ filters, sorting, pagination, skeleton loaders |
| **Property Detail** | Photo gallery, amenities, scam risk badge, nearby facilities, reviews, enquiry form |
| **Roommate Matching** | Multi-step questionnaire, compatibility scores, match explanations |
| **Compare** | Side-by-side table for up to 3 properties, best-value highlights |
| **Student Dashboard** | Saved properties, enquiries sent, roommate matches, recommendations |
| **Owner Dashboard** | Listings management, enquiries received, verification status |
| **Admin Dashboard** | Platform stats, pending verifications, reports, user management |

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

MIT © 2024 CampusNest — Built for students, by students.

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer&animation=fadeIn" width="100%"/>

**⭐ If CampusNest helps you, give it a star on GitHub!**

*Find your room. Find your roommate. Feel at home.*

</div>
