import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Users, Shield, Star, ChevronRight,
  Home, Zap, CheckCircle, AlertTriangle, BookOpen, Heart, ArrowRight
} from 'lucide-react';

const COLLEGES = [
  'Gauhati University', 'Assam Engineering College', 'Cotton University',
  'Gauhati Commerce College', 'IIT Guwahati',
];

const FEATURED_PROPERTIES = [
  {
    id: '1', title: 'Spacious PG near Gauhati University', locality: 'Jalukbari',
    rent: 6500, type: 'pg', gender: 'boys', rating: 4.3,
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600',
    verified: true, distance: '0.4 km',
  },
  {
    id: '2', title: 'Girls Hostel with Mess near AEC', locality: 'Chandmari',
    rent: 8000, type: 'hostel', gender: 'girls', rating: 4.5,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600',
    verified: true, distance: '0.6 km',
  },
  {
    id: '4', title: 'Single AC Room near Zoo Road', locality: 'Zoo Road',
    rent: 9500, type: 'room', gender: 'coed', rating: 4.6,
    image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600',
    verified: true, distance: '2.1 km',
  },
  {
    id: '8', title: 'Premium Hostel near AEC', locality: 'Jalukbari',
    rent: 12000, type: 'hostel', gender: 'boys', rating: 4.7,
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600',
    verified: true, distance: '0.5 km',
  },
];

const TESTIMONIALS = [
  {
    name: 'Ankita Das', college: 'Assam Engineering College', role: 'CSE Student',
    text: 'Found my dream hostel within 2 days of joining CampusNest. The map view made it super easy to compare distances from AEC.',
    rating: 5,
  },
  {
    name: 'Rohan Borah', college: 'Cotton University', role: 'Arts Student',
    text: 'The roommate matching feature is brilliant! I found a compatible flatmate who shares my interests. We have been living together for 6 months.',
    rating: 5,
  },
  {
    name: 'Meenakshi Gogoi', college: 'Gauhati Commerce College', role: 'Commerce Student',
    text: 'The scam detection feature saved me from a dodgy listing. Very helpful for students new to the city.',
    rating: 4,
  },
];

const STATS = [
  { value: '500+', label: 'Verified Listings' },
  { value: '2,000+', label: 'Happy Students' },
  { value: '50+', label: 'Trusted Owners' },
  { value: '4.8★', label: 'Average Rating' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [maxRent, setMaxRent] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (maxRent) params.set('maxRent', maxRent);
    navigate(`/search?${params}`);
  };

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-teal-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-teal-300 rounded-full animate-pulse" />
              Student Housing Platform — Guwahati
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-5">
              Find Your Room.<br />
              Find Your Roommate.<br />
              <span className="text-teal-300">Feel at Home.</span>
            </h1>
            <p className="text-lg text-primary-100 mb-8 max-w-xl">
              Verified rooms, PGs, and hostels near top colleges in Guwahati. Smart filters, map view, and roommate matching — all in one place.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-2xl shadow-xl">
              <div className="flex items-center gap-2 flex-1 px-3">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="College, locality, or city..."
                  className="flex-1 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search by college or locality"
                />
              </div>
              <div className="flex items-center gap-2 px-3 border-t sm:border-t-0 sm:border-l border-gray-100">
                <span className="text-gray-400 text-sm font-medium">₹</span>
                <input
                  type="number"
                  placeholder="Max rent"
                  className="w-28 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none"
                  value={maxRent}
                  onChange={(e) => setMaxRent(e.target.value)}
                  aria-label="Maximum rent"
                />
              </div>
              <button type="submit" className="btn-primary py-2.5 px-5 rounded-xl text-sm whitespace-nowrap">
                <Search className="w-4 h-4" />
                Search Rooms
              </button>
            </form>

            {/* Quick CTA buttons */}
            <div className="flex flex-wrap gap-3 mt-5">
              <Link to="/search" className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 rounded-xl px-4 py-2 text-sm font-medium transition-colors">
                <Home className="w-4 h-4" /> Find a Room
              </Link>
              <Link to="/roommates" className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 rounded-xl px-4 py-2 text-sm font-medium transition-colors">
                <Users className="w-4 h-4" /> Find a Roommate
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-white border-b border-gray-100" aria-label="Platform statistics">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-primary-600">{s.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PROPERTIES ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Featured Properties</h2>
            <p className="text-gray-500 mt-1 text-sm">Verified listings near top colleges in Guwahati</p>
          </div>
          <Link to="/search" className="btn-secondary text-sm hidden sm:inline-flex">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURED_PROPERTIES.map((p) => (
            <Link
              key={p.id}
              to={`/property/${p.id}`}
              className="card hover:shadow-card-hover transition-shadow group overflow-hidden"
            >
              <div className="relative">
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-44 object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {p.verified && (
                  <div className="absolute top-2.5 left-2.5 badge badge-verified">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </div>
                )}
                <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-semibold text-gray-800 flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {p.rating}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">{p.title}</h3>
                <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  {p.locality} • {p.distance} from campus
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-primary-600 font-bold">₹{p.rent.toLocaleString('en-IN')}<span className="text-gray-400 font-normal text-xs">/mo</span></span>
                  <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 capitalize">{p.type}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center sm:hidden">
          <Link to="/search" className="btn-secondary text-sm">View All Properties <ChevronRight className="w-4 h-4" /></Link>
        </div>
      </section>

      {/* ── BENEFITS / HOW IT WORKS ── */}
      <section className="bg-gray-50 border-t border-gray-100" aria-labelledby="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 id="how-it-works" className="text-2xl font-bold text-gray-900">How CampusNest Works</h2>
            <p className="text-gray-500 mt-2 max-w-lg mx-auto text-sm">
              From searching to moving in — we make student housing simple, safe, and stress-free.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Search, step: '01', title: 'Search & Filter', desc: 'Find rooms by college, budget, amenities, distance, and more.' },
              { icon: MapPin, step: '02', title: 'Explore on Map', desc: 'View all listings on an interactive map with nearby facilities.' },
              { icon: Shield, step: '03', title: 'Verified & Safe', desc: 'Check verification status and our automated scam risk indicator.' },
              { icon: Heart, step: '04', title: 'Connect & Move In', desc: 'Send enquiries, find roommates, and move into your perfect room.' },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className="text-3xl font-bold text-gray-100 leading-none">{step}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROOMMATE MATCHING PROMO ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white max-w-lg">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Find Your Perfect Roommate</h2>
            <p className="text-teal-100 mb-5 text-sm leading-relaxed">
              Our compatibility algorithm matches you with like-minded students based on lifestyle, budget, study habits, and more. See a match score for each potential roommate.
            </p>
            <Link to="/roommates" className="inline-flex items-center gap-2 bg-white text-teal-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-teal-50 transition-colors text-sm">
              Find My Roommate <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex-shrink-0">
            <div className="flex -space-x-3">
              {[
                { initials: 'PB', bg: 'bg-primary-300' },
                { initials: 'RG', bg: 'bg-amber-300' },
                { initials: 'AD', bg: 'bg-pink-300' },
                { initials: 'MK', bg: 'bg-green-300' },
              ].map((u, i) => (
                <div key={i} className={`w-11 h-11 rounded-full ${u.bg} flex items-center justify-center text-white font-semibold text-sm border-2 border-teal-600`}>
                  {u.initials}
                </div>
              ))}
              <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-medium border-2 border-teal-600">
                500+
              </div>
            </div>
            <p className="text-teal-200 text-xs mt-2 text-center">Students looking for roommates</p>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-gray-50 border-t border-gray-100" aria-labelledby="testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="text-center mb-10">
            <h2 id="testimonials" className="text-2xl font-bold text-gray-900">What Students Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card p-6">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}, {t.college}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SAFETY TIPS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14" aria-labelledby="safety-tips">
        <div className="card border-amber-200 bg-amber-50/50 p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 id="safety-tips" className="text-lg font-bold text-gray-900 mb-2">Stay Safe — Rental Scam Tips</h2>
              <ul className="space-y-2 text-sm text-gray-700">
                {[
                  'Never pay advance rent or deposit before visiting the property in person.',
                  'Always verify the owner\'s identity before signing any agreement.',
                  'Be suspicious of rents that are significantly lower than similar listings.',
                  'Use CampusNest\'s scam risk indicator as an additional screening tool.',
                  'Report suspicious listings using the "Report" button on property pages.',
                  'Prefer listings that carry the Verified badge.',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="bg-primary-600 text-white" aria-label="Sign up call to action">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <BookOpen className="w-10 h-10 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Start Your Search Today</h2>
          <p className="text-primary-200 mb-6 max-w-md mx-auto text-sm">
            Join thousands of students who found their perfect room near campus.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors">
              Create Free Account
            </Link>
            <Link to="/search" className="inline-flex items-center justify-center gap-2 bg-primary-700 text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-800 transition-colors border border-primary-500">
              Browse Listings <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
