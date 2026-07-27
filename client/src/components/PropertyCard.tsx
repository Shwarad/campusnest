import { Link } from 'react-router-dom';
import { MapPin, Star, CheckCircle, Heart, GitCompareArrows, AlertTriangle, Wifi, Zap, UtensilsCrossed, Car } from 'lucide-react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  onCompare?: (property: Property) => void;
  compact?: boolean;
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  room: 'Room', pg: 'PG', hostel: 'Hostel', flat: 'Flat', shared_room: 'Shared',
};

const GENDER_COLORS: Record<string, string> = {
  boys: 'bg-blue-50 text-blue-600', girls: 'bg-pink-50 text-pink-600', coed: 'bg-purple-50 text-purple-600',
};

export default function PropertyCard({ property, isSaved, onToggleSave, onCompare, compact = false }: PropertyCardProps) {
  const image = property.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600';

  const riskBadge = {
    low: null,
    review_recommended: <span className="badge badge-review-risk absolute top-2.5 right-2.5 text-xs"><AlertTriangle className="w-3 h-3" />Review Risk</span>,
    high: <span className="badge badge-high-risk absolute top-2.5 right-2.5 text-xs"><AlertTriangle className="w-3 h-3" />High Risk</span>,
  };

  return (
    <div className="card hover:shadow-card-hover transition-shadow group">
      {/* Image */}
      <div className="relative overflow-hidden rounded-t-2xl">
        <Link to={`/property/${property._id}`}>
          <img
            src={image}
            alt={property.title}
            className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>

        {/* Verification Badge */}
        {property.verificationStatus === 'verified' && (
          <div className="absolute top-2.5 left-2.5 badge badge-verified text-xs">
            <CheckCircle className="w-3 h-3" /> Verified
          </div>
        )}
        {riskBadge[property.scamRiskLevel]}

        {/* Save button */}
        {onToggleSave && (
          <button
            onClick={() => onToggleSave(property._id)}
            className="absolute bottom-2.5 right-2.5 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
            aria-label={isSaved ? 'Remove from favourites' : 'Save property'}
            aria-pressed={isSaved}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-400 text-red-400' : 'text-gray-400'}`} />
          </button>
        )}

        {/* Match percentage */}
        {property.matchPercentage !== undefined && (
          <div className="absolute top-2.5 right-2.5 bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {property.matchPercentage}% match
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <Link to={`/property/${property._id}`} className="block hover:text-primary-600">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">{property.title}</h3>
        </Link>

        <div className="flex items-center gap-1 text-gray-500 text-xs mb-2.5">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{property.address.locality}</span>
          <span className="mx-1">·</span>
          <span>{property.distanceFromCollege} km</span>
        </div>

        {/* Amenity Icons */}
        {!compact && (
          <div className="flex gap-2 mb-2.5">
            {property.amenities.wifi && <Wifi className="w-3.5 h-3.5 text-primary-400" title="Wi-Fi" />}
            {property.amenities.ac && <Zap className="w-3.5 h-3.5 text-blue-400" title="AC" />}
            {property.amenities.food && <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" title="Food" />}
            {property.amenities.parking && <Car className="w-3.5 h-3.5 text-gray-400" title="Parking" />}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <span className="text-primary-600 font-bold text-sm">₹{property.rent.toLocaleString('en-IN')}</span>
            <span className="text-gray-400 text-xs">/mo</span>
          </div>
          <div className="flex items-center gap-2">
            {property.avgRating > 0 && (
              <div className="flex items-center gap-0.5 text-xs text-gray-500">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                {property.avgRating}
              </div>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${GENDER_COLORS[property.genderPreference]}`}>
              {property.genderPreference}
            </span>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">
              {PROPERTY_TYPE_LABELS[property.propertyType] || property.propertyType}
            </span>
          </div>
        </div>

        {/* Match reasons */}
        {property.matchReasons && property.matchReasons.length > 0 && (
          <p className="text-xs text-teal-600 mt-2 line-clamp-1">
            ✓ {property.matchReasons[0]}
          </p>
        )}

        {/* Compare button */}
        {onCompare && !compact && (
          <button
            onClick={() => onCompare(property)}
            className="mt-3 w-full btn-secondary text-xs py-1.5"
          >
            <GitCompareArrows className="w-3.5 h-3.5" /> Add to Compare
          </button>
        )}
      </div>
    </div>
  );
}
