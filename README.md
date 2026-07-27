# CampusNest 🏠

> **Find your room. Find your roommate. Feel at home.**

CampusNest is a full-stack web application designed for college and university students searching for affordable housing, PG accommodation, hostels, and compatible roommates near their institution.

---

## 🎯 Problem Statement

Students moving to a new city face significant challenges:
- Finding affordable, genuine rooms near their college
- Identifying scam listings and advance-payment frauds
- Comparing properties and amenities efficiently
- Finding compatible roommates
- Understanding the safety and convenience of an area

CampusNest solves these with verified listings, smart filters, map-based discovery, roommate compatibility matching, and scam-risk indicators.

---

## ✨ Main Features

| Feature | Description |
|---------|-------------|
| 🔍 **Smart Search** | Filter by college, budget, type, amenities, distance |
| 🗺️ **Map View** | Leaflet + OpenStreetMap interactive property map |
| ✅ **Verified Listings** | Admin-verified badge system |
| ⚠️ **Scam Risk Detector** | Automated flags with Low/Review/High risk levels |
| 🤝 **Roommate Matching** | Weighted compatibility algorithm (0–100%) |
| 💡 **Smart Recommendations** | Personalized match scores with reasons |
| ❤️ **Favourites** | Save and compare properties |
| 📊 **Compare Tool** | Side-by-side comparison of up to 3 properties |
| 📬 **Enquiry System** | Direct student-to-owner messaging |
| 🌟 **Reviews & Ratings** | Multi-category rating system |
| 🛡️ **Admin Dashboard** | Verification, report management, user control |
| 📱 **Responsive Design** | Mobile-first, works on all screen sizes |

---

## 🛠️ Technology Stack

### Frontend
- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (styling)
- **React Router v6** (routing)
- **React Hook Form** + **Zod** (validation)
- **Leaflet** + **React Leaflet** (maps — OpenStreetMap, no API key needed)
- **Lucide React** (icons)
- **React Hot Toast** (notifications)
- **Axios** (HTTP client)

### Backend
- **Node.js** + **Express** + **TypeScript**
- **MongoDB** + **Mongoose** (database)
- **JWT** (authentication)
- **bcryptjs** (password hashing)
- **Zod** (server-side validation)
- **Helmet** + **CORS** + **Rate Limiting** (security)
- **Multer** (file upload ready)

### Testing
- **Vitest** (unit & integration tests)
- Server tests: algorithm correctness, validation logic
- Client tests: utility functions, form validation

---

## 🏗️ Architecture

```
campusnest/
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/       # Shared UI components
│   │   ├── pages/            # Route pages
│   │   ├── layouts/          # Layout wrappers
│   │   ├── context/          # React Context (Auth)
│   │   ├── services/         # API service layer
│   │   ├── types/            # TypeScript interfaces
│   │   └── test/             # Test files
│   └── package.json
├── server/                   # Express backend
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   ├── routes/           # Express routes
│   │   ├── models/           # Mongoose models
│   │   ├── middleware/        # Auth, error handling
│   │   ├── utils/            # Algorithms (compatibility, recommendation)
│   │   ├── config/           # Database config
│   │   ├── seed/             # Seed data script
│   │   └── tests/            # Server tests
│   └── package.json
├── .env.example
├── package.json
└── README.md
```

---

## 🚀 Installation

### Prerequisites
- **Node.js** v18+
- **MongoDB** (local or MongoDB Atlas)
- **npm** v8+

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/campusnest.git
cd campusnest
```

### 2. Install Dependencies

```bash
npm run install:all
```

This installs root, client, and server dependencies.

### 3. Configure Environment Variables

```bash
cp .env.example server/.env
```

Edit `server/.env` with your configuration:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/campusnest
JWT_SECRET=your-super-secret-key-minimum-32-chars
CLIENT_URL=http://localhost:5173
```

### 4. Start MongoDB

```bash
# Local MongoDB
mongod --dbpath /your/data/path

# Or use MongoDB Atlas connection string in MONGODB_URI
```

### 5. Seed the Database

```bash
npm run seed
```

This creates:
- 12 property listings near Guwahati colleges
- 6 students + 4 property owners + 2 admin accounts
- 8 roommate profiles
- 10 reviews
- 3 reported listings
- Demo accounts for hackathon judges

### 6. Start Development Servers

```bash
npm run dev
```

This starts:
- Backend API on `http://localhost:5000`
- Frontend on `http://localhost:5173`

---

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/campusnest` |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | — |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `CLIENT_URL` | Frontend URL (for CORS) | `http://localhost:5173` |

---

## 🎭 Demo Credentials

Use these accounts to test the application:

| Role | Email | Password |
|------|-------|----------|
| 🎓 Student | `student@campusnest.demo` | `Demo@123` |
| 🏠 Owner | `owner@campusnest.demo` | `Demo@123` |
| 🛡️ Admin | `admin@campusnest.demo` | `Demo@123` |

> ⚠️ Demo credentials are for hackathon demonstration only. Do not use in production.

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run server tests only
cd server && npm test

# Run client tests only
cd client && npm test
```

### Test Coverage
- ✅ Roommate compatibility algorithm (8 test cases)
- ✅ Property recommendation scoring (5 test cases)
- ✅ Scam risk detection (4 test cases)
- ✅ Expense calculator logic (3 test cases)
- ✅ Form validation logic (4 test cases)

---

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register      Register new user
POST   /api/auth/login         Login
GET    /api/auth/me            Get current user (auth required)
PUT    /api/auth/profile       Update profile (auth required)
```

### Properties
```
GET    /api/properties         List/search properties (with filters)
GET    /api/properties/saved   Get saved properties
GET    /api/properties/recommended  Get recommendations
GET    /api/properties/:id     Get property details
POST   /api/properties         Create listing (owner)
PUT    /api/properties/:id     Update listing (owner/admin)
DELETE /api/properties/:id     Delete listing (owner/admin)
POST   /api/properties/:id/favourite    Save/unsave
POST   /api/properties/:id/reviews     Submit review (student)
GET    /api/properties/:id/reviews     Get reviews
POST   /api/properties/:id/report      Report listing (auth)
```

### Roommates
```
GET    /api/roommates          Browse profiles
GET    /api/roommates/my-profile    Get own profile
GET    /api/roommates/matches  Get compatibility matches
POST   /api/roommates/profile  Create profile
PUT    /api/roommates/profile  Update profile
```

### Enquiries
```
POST   /api/enquiries          Send enquiry (student)
GET    /api/enquiries/student  Student's sent enquiries
GET    /api/enquiries/owner    Owner's received enquiries
PUT    /api/enquiries/:id/respond  Owner responds
```

### Admin
```
GET    /api/admin/dashboard    Stats overview
GET    /api/admin/verifications  Pending verifications
PUT    /api/admin/properties/:id/verify  Approve
PUT    /api/admin/properties/:id/reject  Reject
GET    /api/admin/reports      User reports
PUT    /api/admin/reports/:id  Update report status
GET    /api/admin/users        List users
PUT    /api/admin/users/:id/toggle  Toggle user status
```

---

## 🤝 Roommate Compatibility Algorithm

The algorithm calculates a score (0–100) using weighted factors:

| Factor | Weight | Notes |
|--------|--------|-------|
| Budget overlap | 20% | Proportional budget range overlap |
| Location preference | 15% | Exact locality match |
| Sleep schedule | 15% | Early bird / Night owl / Flexible |
| Cleanliness | 15% | 4-level scale with graceful degradation |
| Smoking & Drinking | 15% | Boolean match |
| Study habits & Noise | 10% | Flexible preference handling |
| Food preference | 5% | Veg/Non-veg/Any |
| Visitors & Pets | 5% | Frequency and boolean |

> **Disclaimer:** The score is a lifestyle indicator, not a guarantee of personal compatibility.

---

## 💡 Smart Recommendation System

Properties are scored based on:
- Budget fit (30 pts)
- Distance from college (20 pts)
- Verification status (15 pts)
- Rating (15 pts)
- Amenity match (10 pts)
- Property type match (5 pts)
- Availability (5 pts)

Reasons are shown: *"92% match because it is within your budget, 1.2 km from campus, verified, and includes Wi-Fi."*

---

## ⚠️ Scam Risk Detection

The system flags listings with:
- Rent significantly below area average
- Missing property address
- No photos uploaded
- Unusually high deposit
- Incomplete contact info
- Multiple user reports

Risk levels: **Low Risk** | **Review Recommended** | **High Risk**

> Disclaimer: Automated only — not a legal guarantee.

---

## 🔒 Security Notes

- Passwords are hashed with bcrypt (12 rounds)
- JWT tokens expire in 7 days
- Role-based access control on all protected routes
- Rate limiting on auth routes (20 requests/15 min)
- Input validation with Zod on all endpoints
- Helmet headers enabled
- CORS restricted to frontend origin
- No sensitive credentials in source code

---

## 🗺️ Maps

CampusNest uses **Leaflet + OpenStreetMap** — completely free, no API key required. This ensures the hackathon demo works without any external service setup.

---

## 🔮 Future Improvements

- Real-time chat between students and owners
- Aadhaar/document-based owner verification
- Mobile app (React Native)
- Cloudinary image uploads
- Email/SMS notification system
- AI-powered roommate compatibility (beyond rule-based)
- Google Maps integration (with API key)
- Property video tours
- Lease agreement template generator
- Community forum for students

---

## 📸 Screenshots

_See the live demo for a walkthrough of all features._

Key pages:
1. **Landing Page** — Hero, search, featured listings, testimonials
2. **Search Page** — Grid/map view with 15+ filters
3. **Property Detail** — Gallery, amenities, scam risk, reviews, enquiry
4. **Roommate Matching** — Questionnaire, compatibility scores
5. **Compare** — Side-by-side property comparison
6. **Student Dashboard** — Saved, enquiries, recommendations
7. **Owner Dashboard** — Listings, enquiry management
8. **Admin Dashboard** — Verifications, reports, user management

---

## 👥 Team

Built for hackathon demonstration — showcasing a complete student housing solution.

---

*© 2024 CampusNest — Find your room. Find your roommate. Feel at home.*
