import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GitCompareArrows, Trash2, CheckCircle2, X, MapPin, Building
} from 'lucide-react';
import { propertyService } from '../services/propertyService';
import { Property } from '../types';

type ColumnKey = keyof Pick<Property, 'rent' | 'deposit' | 'distanceFromCollege' | 'avgRating' | 'furnishing' | 'genderPreference' | 'propertyType' | 'verificationStatus' | 'availableBeds'>;

const COMPARE_KEYS: { key: string; label: string; format?: (v: unknown) => string; best?: 'min' | 'max' }[] = [
  { key: 'rent', label: 'Monthly Rent', format: (v) => `₹${Number(v).toLocaleString('en-IN')}`, best: 'min' },
  { key: 'deposit', label: 'Security Deposit', format: (v) => `₹${Number(v).toLocaleString('en-IN')}`, best: 'min' },
  { key: 'distanceFromCollege', label: 'Distance from College', format: (v) => `${v} km`, best: 'min' },
  { key: 'avgRating', label: 'Rating', format: (v) => `${v}★ (${v > 0 ? 'rated' : 'no reviews'})`, best: 'max' },
  { key: 'propertyType', label: 'Property Type', format: (v) => String(v).replace('_', ' ') },
  { key: 'furnishing', label: 'Furnishing', format: (v) => String(v).replace('-', ' ') },
  { key: 'genderPreference', label: 'For', format: (v) => String(v) },
  { key: 'availableBeds', label: 'Available Beds', format: (v) => String(v), best: 'max' },
  { key: 'verificationStatus', label: 'Verification', format: (v) => String(v) },
];

function AmenityRow({ properties }: { properties: Property[] }) {
  const amenities = ['wifi', 'ac', 'attachedBathroom', 'parking', 'laundry', 'food', 'powerBackup', 'petFriendly'] as const;
  const labels: Record<string, string> = {
    wifi: 'Wi-Fi', ac: 'AC', attachedBathroom: 'Attached Bathroom', parking: 'Parking',
    laundry: 'Laundry', food: 'Food', powerBackup: 'Power Backup', petFriendly: 'Pet Friendly',
  };
  return (
    <>
      {amenities.map((a) => (
        <tr key={a} className="border-t border-gray-100">
          <td className="py-2.5 pr-4 text-sm text-gray-600 font-medium whitespace-nowrap">{labels[a]}</td>
          {properties.map((p) => (
            <td key={p._id} className="py-2.5 px-3 text-center text-sm">
              {p.amenities[a] ? (
                <CheckCircle2 className="w-4 h-4 text-teal-500 mx-auto" />
              ) : (
                <X className="w-4 h-4 text-gray-300 mx-auto" />
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function ComparePropertiesPage() {
  const [compareIds, setCompareIds] = useState<string[]>(() =>
    JSON.parse(localStorage.getItem('compareList') || '[]')
  );
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCompare = async () => {
      if (compareIds.length === 0) { setProperties([]); return; }
      setIsLoading(true);
      try {
        const results = await Promise.all(compareIds.map((id) => propertyService.getById(id)));
        setProperties(results.map((r) => r.property));
      } catch { }
      finally { setIsLoading(false); }
    };
    fetchCompare();
  }, [compareIds]);

  const removeFromCompare = (id: string) => {
    const updated = compareIds.filter((cid) => cid !== id);
    setCompareIds(updated);
    localStorage.setItem('compareList', JSON.stringify(updated));
  };

  const clearAll = () => {
    setCompareIds([]);
    setProperties([]);
    localStorage.removeItem('compareList');
  };

  const getBestIndex = (key: string, best: 'min' | 'max'): number => {
    const values = properties.map((p) => Number((p as Record<string, unknown>)[key]));
    if (values.every((v) => isNaN(v))) return -1;
    const target = best === 'min' ? Math.min(...values.filter((v) => !isNaN(v))) : Math.max(...values.filter((v) => !isNaN(v)));
    return values.findIndex((v) => v === target);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GitCompareArrows className="w-6 h-6 text-primary-500" />
            Compare Properties
          </h1>
          <p className="text-gray-500 text-sm mt-1">Compare up to 3 properties side by side</p>
        </div>
        {properties.length > 0 && (
          <button onClick={clearAll} className="btn-secondary text-sm text-red-500 border-red-200 hover:bg-red-50">
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        )}
      </div>

      {compareIds.length === 0 ? (
        <div className="card p-12 text-center">
          <GitCompareArrows className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-600 mb-2">No properties to compare</h2>
          <p className="text-gray-400 text-sm mb-5">Add properties to compare by clicking the "Compare" button on any listing</p>
          <Link to="/search" className="btn-primary">Browse Properties</Link>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="text-left pr-4 py-3 text-gray-500 font-medium text-sm w-36">Feature</th>
                {properties.map((p) => (
                  <th key={p._id} className="px-3 py-3 min-w-[200px]">
                    <div className="relative">
                      <button
                        onClick={() => removeFromCompare(p._id)}
                        className="absolute -top-1 right-0 p-1 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 text-gray-400"
                        aria-label="Remove from compare"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <Link to={`/property/${p._id}`} className="block hover:opacity-80">
                        <img
                          src={p.images[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400'}
                          alt={p.title}
                          className="w-full h-28 object-cover rounded-xl mb-2"
                        />
                        <p className="font-semibold text-gray-900 text-left text-sm line-clamp-2">{p.title}</p>
                        <p className="text-xs text-gray-400 text-left mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{p.address.locality}
                        </p>
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_KEYS.map(({ key, label, format, best }) => {
                const bestIdx = best ? getBestIndex(key, best) : -1;
                return (
                  <tr key={key} className="border-t border-gray-100">
                    <td className="py-2.5 pr-4 text-sm text-gray-600 font-medium whitespace-nowrap">{label}</td>
                    {properties.map((p, idx) => {
                      const rawVal = (p as Record<string, unknown>)[key];
                      const displayVal = format ? format(rawVal) : String(rawVal);
                      const isBest = bestIdx === idx;
                      return (
                        <td key={p._id} className={`py-2.5 px-3 text-sm text-center ${isBest ? 'text-teal-700 font-semibold bg-teal-50/50' : 'text-gray-700'}`}>
                          {isBest && <span className="text-xs text-teal-500 mr-1">✓</span>}
                          {displayVal}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              <tr className="border-t border-gray-200">
                <td colSpan={4} className="py-1.5 text-xs text-gray-400 font-medium uppercase tracking-wide">Amenities</td>
              </tr>
              <AmenityRow properties={properties} />
              <tr className="border-t border-gray-200">
                <td className="py-3" />
                {properties.map((p) => (
                  <td key={p._id} className="py-3 px-3 text-center">
                    <Link to={`/property/${p._id}`} className="btn-primary text-xs py-2 px-4 block">View Details</Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-gray-400 mt-3 text-center">
            ✓ Highlighted cells indicate the best value for that category.
          </p>
        </div>
      )}

      {compareIds.length < 3 && (
        <div className="mt-6 card p-4 border-dashed border-2 border-gray-200 text-center">
          <Link to="/search" className="text-sm text-primary-600 hover:underline font-medium flex items-center justify-center gap-2">
            <Building className="w-4 h-4" /> Add more properties to compare (max 3)
          </Link>
        </div>
      )}
    </div>
  );
}
