import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Star, CheckCircle, AlertTriangle, Shield,
  Wifi, Zap, Car, UtensilsCrossed,
  Phone, Mail, Heart, GitCompareArrows, Flag,
  ChevronLeft, ChevronRight, Clock, User, Home, X, Loader2,
  BedDouble, Calendar, GlassWater, Dumbbell, Dog
} from 'lucide-react';
import { propertyService } from '../services/propertyService';
import { enquiryService } from '../services/enquiryService';
import { Property, Review, User as UserType } from '../types';
import { useAuth } from '../context/AuthContext';
import PropertyBrief from '../components/ai/PropertyBrief';
import ReviewSummaryAI from '../components/ai/ReviewSummary';
import RiskExplanation from '../components/ai/RiskExplanation';
import toast from 'react-hot-toast';

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  wifi: <Wifi className="w-4 h-4" />,
  ac: <Zap className="w-4 h-4" />,
  attachedBathroom: <Home className="w-4 h-4" />,
  parking: <Car className="w-4 h-4" />,
  laundry: <GlassWater className="w-4 h-4" />,
  powerBackup: <Zap className="w-4 h-4" />,
  petFriendly: <Dog className="w-4 h-4" />,
  food: <UtensilsCrossed className="w-4 h-4" />,
  gym: <Dumbbell className="w-4 h-4" />,
  tv: <Home className="w-4 h-4" />,
  refrigerator: <Home className="w-4 h-4" />,
  waterFilter: <GlassWater className="w-4 h-4" />,
};

const AMENITY_LABELS: Record<string, string> = {
  wifi: 'Wi-Fi', ac: 'Air Conditioning', attachedBathroom: 'Attached Bathroom',
  parking: 'Parking', laundry: 'Laundry', powerBackup: 'Power Backup',
  petFriendly: 'Pet Friendly', food: 'Food Included', gym: 'Gym',
  tv: 'TV', refrigerator: 'Refrigerator', waterFilter: 'Water Filter',
};

const FACILITY_ICONS: Record<string, string> = {
  grocery: '🛒', pharmacy: '💊', hospital: '🏥', bus_stop: '🚌',
  metro_station: '🚇', restaurant: '🍽️', cafe: '☕', gym: '🏋️',
  library: '📚', atm: '🏧',
};

function StarRating({ rating, onChange, readonly }: { rating: number; onChange?: (v: number) => void; readonly?: boolean }) {
  return (
    <div className="flex gap-0.5" aria-label={`Rating: ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => !readonly && onChange?.(v)}
          disabled={readonly}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          aria-label={readonly ? undefined : `Rate ${v}`}
        >
          <Star className={`w-4 h-4 ${v <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  );
}

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [property, setProperty] = useState<Property | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Enquiry form state
  const [enquiryData, setEnquiryData] = useState({
    studentName: user?.name || '',
    contactNumber: user?.phone || '',
    preferredVisitDate: '',
    moveInDate: '',
    message: '',
  });

  // Review form state
  const [reviewData, setReviewData] = useState({
    comment: '',
    ratings: { roomQuality: 4, locality: 4, water: 4, electricity: 4, internet: 4, ownerBehaviour: 4, safety: 4, valueForMoney: 4 },
  });

  // Report form state
  const [reportData, setReportData] = useState({ reason: 'fake_listing', description: '' });

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const result = await propertyService.getById(id);
        setProperty(result.property);
        setReviews(result.reviews);
        setIsSaved(result.isSaved);
      } catch {
        toast.error('Property not found');
        navigate('/search');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const handleToggleSave = async () => {
    if (!user) { toast.error('Please login to save properties'); return; }
    try {
      const result = await propertyService.toggleFavourite(id!);
      setIsSaved(result.isSaved);
      toast.success(result.isSaved ? 'Saved to favourites!' : 'Removed from favourites');
    } catch { toast.error('Failed to update'); }
  };

  const handleAddToCompare = () => {
    const stored = JSON.parse(localStorage.getItem('compareList') || '[]') as string[];
    if (stored.includes(id!)) { toast('Already in compare list'); return; }
    if (stored.length >= 3) { toast.error('Max 3 properties in compare'); return; }
    stored.push(id!);
    localStorage.setItem('compareList', JSON.stringify(stored));
    toast.success('Added to compare list!');
  };

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to send enquiry'); return; }
    setIsSubmitting(true);
    try {
      await enquiryService.send({ propertyId: id!, ...enquiryData });
      toast.success('Enquiry sent successfully!');
      setShowEnquiry(false);
    } catch { toast.error('Failed to send enquiry'); }
    finally { setIsSubmitting(false); }
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to leave a review'); return; }
    setIsSubmitting(true);
    try {
      const newReview = await propertyService.submitReview(id!, reviewData);
      setReviews((prev) => [newReview, ...prev]);
      toast.success('Review submitted!');
      setShowReview(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally { setIsSubmitting(false); }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to report'); return; }
    setIsSubmitting(true);
    try {
      await propertyService.report(id!, reportData);
      toast.success('Report submitted. Thank you for keeping CampusNest safe.');
      setShowReport(false);
    } catch { toast.error('Failed to submit report'); }
    finally { setIsSubmitting(false); }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-96">
      <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
    </div>
  );

  if (!property) return null;

  const owner = typeof property.owner === 'object' ? property.owner as UserType : null;
  const images = property.images.length > 0 ? property.images : [
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'
  ];

  const activeAmenities = Object.entries(property.amenities)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const riskColors = {
    low: 'text-green-600 bg-green-50 border-green-200',
    review_recommended: 'text-amber-600 bg-amber-50 border-amber-200',
    high: 'text-red-600 bg-red-50 border-red-200',
  };

  const riskLabels = {
    low: 'Low Risk',
    review_recommended: 'Review Recommended',
    high: 'High Risk — Proceed with Caution',
  };

  const verBadge = {
    verified: { class: 'badge-verified', label: '✓ Verified Property', desc: 'This property has been verified by CampusNest.' },
    pending: { class: 'badge-pending', label: '⏳ Verification Pending', desc: 'Verification is in progress.' },
    unverified: { class: 'badge-unverified', label: 'Unverified', desc: 'This property has not been verified.' },
    rejected: { class: 'badge-unverified', label: 'Verification Rejected', desc: 'This listing failed verification.' },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-sm text-gray-500">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <span>/</span>
        <Link to="/search" className="hover:text-primary-600">Search</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-xs">{property.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-video">
            <img
              src={images[activeImage]}
              alt={`${property.title} — image ${activeImage + 1}`}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage((i) => Math.max(0, i - 1))}
                  disabled={activeImage === 0}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow disabled:opacity-40"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveImage((i) => Math.min(images.length - 1, i + 1))}
                  disabled={activeImage === images.length - 1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow disabled:opacity-40"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button key={i} onClick={() => setActiveImage(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeImage ? 'bg-white w-4' : 'bg-white/60'}`}
                      aria-label={`Go to image ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Title & Basic Info */}
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
                <div className="flex items-center gap-2 text-gray-500 text-sm mt-1.5">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  {property.address.street}, {property.address.locality}, {property.address.city}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className={`badge ${verBadge[property.verificationStatus].class}`}>
                  {verBadge[property.verificationStatus].label}
                </span>
                {property.avgRating > 0 && (
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-sm font-medium">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {property.avgRating} ({property.reviewCount} reviews)
                  </div>
                )}
              </div>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Monthly Rent', value: `₹${property.rent.toLocaleString('en-IN')}`, icon: '₹' },
                { label: 'Deposit', value: `₹${property.deposit.toLocaleString('en-IN')}`, icon: '🔒' },
                { label: 'Distance', value: `${property.distanceFromCollege} km from campus`, icon: '🎓' },
                { label: 'Available Beds', value: `${property.availableBeds} bed(s)`, icon: '🛏️' },
              ].map((s) => (
                <div key={s.label} className="card p-3 text-center">
                  <p className="text-lg">{s.icon}</p>
                  <p className="font-bold text-gray-900 text-sm">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Risk Explanation */}
          <RiskExplanation propertyId={property._id} riskLevel={property.scamRiskLevel} />

          {/* Scam Risk Banner (existing flags, shown below AI explanation) */}
          {property.scamRiskLevel !== 'low' && property.scamRiskFlags.length > 0 && (
            <div className={`border rounded-xl p-4 ${riskColors[property.scamRiskLevel]}`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">{riskLabels[property.scamRiskLevel]}</p>
                  <ul className="mt-1.5 space-y-0.5 text-xs">
                    {property.scamRiskFlags.map((f, i) => <li key={i}>• {f}</li>)}
                  </ul>
                  <p className="text-xs mt-2 opacity-75">⚠️ This is an automated risk indicator, not a guarantee.</p>
                </div>
              </div>
            </div>
          )}

          {/* Safety Notice */}
          <div className="card border-amber-200 bg-amber-50/60 p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-800 font-medium">
                🔒 Safety Reminder: Never send advance payments before visiting the property in person. Always verify the owner's identity.
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-3">About this property</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{property.description}</p>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <BedDouble className="w-4 h-4 text-gray-400" />
                <span className="capitalize">{property.propertyType.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <User className="w-4 h-4 text-gray-400" />
                <span className="capitalize">{property.genderPreference}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Home className="w-4 h-4 text-gray-400" />
                <span className="capitalize">{property.furnishing.replace('-', ' ')}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-4 h-4 text-gray-400" />
                Available from {new Date(property.availableFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {activeAmenities.map((key) => (
                <div key={key} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />
                  {AMENITY_LABELS[key] || key}
                </div>
              ))}
              {activeAmenities.length === 0 && (
                <p className="text-sm text-gray-400 col-span-3">No amenities listed</p>
              )}
            </div>
          </div>

          {/* NestAI Property Brief */}
          <PropertyBrief propertyId={property._id} />

          {/* House Rules */}
          {property.houseRules.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-3">House Rules</h2>
              <ul className="space-y-1.5">
                {property.houseRules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-primary-400 mt-0.5">•</span> {rule}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Nearby Facilities */}
          {property.nearbyFacilities.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Nearby Facilities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {property.nearbyFacilities.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-base">{FACILITY_ICONS[f.type] || '📍'}</span>
                    <span className="font-medium">{f.name}</span>
                    <span className="text-gray-400 text-xs ml-auto">{f.distance}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">
                Student Reviews
                {property.reviewCount > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">({property.reviewCount} reviews • {property.avgRating}★ avg)</span>
                )}
              </h2>
              {user?.role === 'student' && (
                <button onClick={() => setShowReview(true)} className="btn-secondary text-xs py-1.5 px-3">
                  Write a Review
                </button>
              )}
            </div>

            {reviews.length === 0 ? (
              <p className="text-sm text-gray-400">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => {
                  const student = typeof r.student === 'object' ? r.student as UserType : null;
                  return (
                    <div key={r._id} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-sm">
                          {student?.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900">{student?.name || 'Student'}</p>
                          <p className="text-xs text-gray-400">{student?.college || ''} • {new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div className="ml-auto">
                          <StarRating rating={r.overallRating} readonly />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{r.comment}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* AI Review Summary */}
          <ReviewSummaryAI propertyId={property._id} reviewCount={property.reviewCount} />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Rent Summary Card */}
          <div className="card p-5 sticky top-20">
            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">₹{property.rent.toLocaleString('en-IN')}</span>
                <span className="text-gray-400 text-sm">/month</span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">₹{property.deposit.toLocaleString('en-IN')} security deposit</p>
            </div>

            <div className="space-y-2.5 mb-5">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                {property.address.locality}, {property.address.city}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                {property.isAvailable ? (
                  <span className="text-teal-600 font-medium">Available Now</span>
                ) : (
                  <span className="text-red-500">Currently Occupied</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setShowEnquiry(true)}
                className="btn-primary w-full"
                disabled={!property.isAvailable}
              >
                <Phone className="w-4 h-4" />
                {property.isAvailable ? 'Contact Owner' : 'Not Available'}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleToggleSave}
                  className={`btn-secondary text-sm py-2 ${isSaved ? 'text-red-500 border-red-200 bg-red-50' : ''}`}
                >
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-400 text-red-500' : ''}`} />
                  {isSaved ? 'Saved' : 'Save'}
                </button>
                <button onClick={handleAddToCompare} className="btn-secondary text-sm py-2">
                  <GitCompareArrows className="w-4 h-4" /> Compare
                </button>
              </div>

              <button onClick={() => setShowReport(true)} className="w-full flex items-center justify-center gap-1.5 text-xs text-red-400 hover:text-red-600 mt-1 py-1">
                <Flag className="w-3.5 h-3.5" /> Report this listing
              </button>
            </div>
          </div>

          {/* Owner Info */}
          {owner && (
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Property Owner</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{owner.name}</p>
                  <p className="text-xs text-gray-400">{owner.identityStatus === 'verified' ? '✓ Identity verified' : 'Identity not verified'}</p>
                </div>
              </div>
              <div className="mt-3 space-y-1.5 text-xs text-gray-500">
                <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {property.contactPhone}</div>
                <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {property.contactEmail}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enquiry Modal */}
      {showEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Send Enquiry">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Send Enquiry</h2>
              <button onClick={() => setShowEnquiry(false)} className="p-1.5 rounded-lg hover:bg-gray-100" aria-label="Close"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleEnquiry} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Your Name</label>
                  <input className="input" value={enquiryData.studentName} onChange={(e) => setEnquiryData((d) => ({ ...d, studentName: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Contact Number</label>
                  <input className="input" type="tel" value={enquiryData.contactNumber} onChange={(e) => setEnquiryData((d) => ({ ...d, contactNumber: e.target.value }))} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Preferred Visit Date</label>
                  <input className="input" type="date" value={enquiryData.preferredVisitDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setEnquiryData((d) => ({ ...d, preferredVisitDate: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Move-In Date</label>
                  <input className="input" type="date" value={enquiryData.moveInDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setEnquiryData((d) => ({ ...d, moveInDate: e.target.value }))} required />
                </div>
              </div>
              <div>
                <label className="label">Message to Owner</label>
                <textarea className="input min-h-[100px] resize-none" value={enquiryData.message} onChange={(e) => setEnquiryData((d) => ({ ...d, message: e.target.value }))} placeholder="Introduce yourself, ask questions..." required minLength={10} />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowEnquiry(false)} className="btn-secondary text-sm">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary text-sm">
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Enquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Write Review">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Write a Review</h2>
              <button onClick={() => setShowReview(false)} className="p-1.5 rounded-lg hover:bg-gray-100" aria-label="Close"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleReview} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(reviewData.ratings).map(([key, val]) => {
                  const labels: Record<string, string> = {
                    roomQuality: 'Room Quality', locality: 'Locality', water: 'Water Supply',
                    electricity: 'Electricity', internet: 'Internet', ownerBehaviour: 'Owner',
                    safety: 'Safety', valueForMoney: 'Value',
                  };
                  return (
                    <div key={key}>
                      <label className="label text-xs">{labels[key]}</label>
                      <StarRating rating={val} onChange={(v) => setReviewData((d) => ({ ...d, ratings: { ...d.ratings, [key]: v } }))} />
                    </div>
                  );
                })}
              </div>
              <div>
                <label className="label">Your Review</label>
                <textarea className="input min-h-[100px] resize-none" value={reviewData.comment} onChange={(e) => setReviewData((d) => ({ ...d, comment: e.target.value }))} placeholder="Share your experience..." required minLength={10} />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowReview(false)} className="btn-secondary text-sm">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary text-sm">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Report Listing">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Report Listing</h2>
              <button onClick={() => setShowReport(false)} className="p-1.5 rounded-lg hover:bg-gray-100" aria-label="Close"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleReport} className="space-y-4">
              <div>
                <label className="label">Reason</label>
                <select className="input" value={reportData.reason} onChange={(e) => setReportData((d) => ({ ...d, reason: e.target.value }))}>
                  {[
                    { value: 'fake_listing', label: 'Fake Listing' },
                    { value: 'advance_payment', label: 'Asking for Advance Payment' },
                    { value: 'wrong_info', label: 'Wrong / Misleading Information' },
                    { value: 'duplicate', label: 'Duplicate Listing' },
                    { value: 'scam', label: 'Scam' },
                    { value: 'inappropriate', label: 'Inappropriate Content' },
                    { value: 'other', label: 'Other' },
                  ].map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Details</label>
                <textarea className="input min-h-[100px] resize-none" value={reportData.description} onChange={(e) => setReportData((d) => ({ ...d, description: e.target.value }))} placeholder="Describe the issue in detail..." required minLength={10} />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowReport(false)} className="btn-secondary text-sm">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-red-600 text-white btn-primary bg-red-600 hover:bg-red-700 text-sm">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
