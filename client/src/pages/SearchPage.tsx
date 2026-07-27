import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search, Filter, Grid3X3, Map, SlidersHorizontal, X,
  CheckCircle, Wifi, Zap, Car, UtensilsCrossed, Dumbbell,
  Loader2, ArrowUpDown
} from 'lucide-react';
import { propertyService } from '../services/propertyService';
import { Property, PropertyFilters } from '../types';
import { useAuth } from '../context/AuthContext';
import PropertyCard from '../components/PropertyCard';
import PropertyMap from '../components/PropertyMap';
import toast from 'react-hot-toast';

const PROPERTY_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'room', label: 'Single Room' },
  { value: 'shared_room', label: 'Shared Room' },
  { value: 'pg', label: 'PG' },
  { value: 'hostel', label: 'Hostel' },
  { value: 'flat', label: 'Flat' },
];

const FURNISHING_OPTIONS = [
  { value: '', label: 'Any Furnishing' },
  { value: 'furnished', label: 'Furnished' },
  { value: 'semi-furnished', label: 'Semi-Furnished' },
  { value: 'unfurnished', label: 'Unfurnished' },
];

const GENDER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'boys', label: 'Boys' },
  { value: 'girls', label: 'Girls' },
  { value: 'coed', label: 'Co-ed' },
];

const SORT_OPTIONS = [
  { value: '', label: 'Most Recent' },
  { value: 'rent_asc', label: 'Lowest Rent' },
  { value: 'rent_desc', label: 'Highest Rent' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'distance', label: 'Nearest to College' },
  { value: 'popular', label: 'Most Popular' },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Filter state
  const [filters, setFilters] = useState<PropertyFilters>({
    search: searchParams.get('search') || '',
    maxRent: searchParams.get('maxRent') ? Number(searchParams.get('maxRent')) : undefined,
    minRent: undefined,
    propertyType: searchParams.get('propertyType') || '',
    furnishing: '',
    genderPreference: '',
    sortBy: '',
    verifiedOnly: false,
    wifi: false, ac: false, attachedBathroom: false, parking: false,
    laundry: false, food: false, powerBackup: false, petFriendly: false,
  });
  const [searchInput, setSearchInput] = useState(filters.search || '');

  const fetchProperties = useCallback(async (currentFilters: PropertyFilters, currentPage: number) => {
    setIsLoading(true);
    try {
      const result = await propertyService.getAll({ ...currentFilters, page: currentPage, limit: 12 });
      setProperties(result.properties);
      setTotal(result.pagination.total);
      setTotalPages(result.pagination.totalPages);
    } catch {
      toast.error('Failed to load properties');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties(filters, page);
  }, [filters, page, fetchProperties]);

  // Load saved properties for current user
  useEffect(() => {
    if (user?.savedProperties) {
      setSavedIds(new Set(user.savedProperties));
    }
  }, [user]);

  const handleFilterChange = (key: keyof PropertyFilters, value: unknown) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    setPage(1);
    setFilters((prev) => ({ ...prev, search: searchInput }));
  };

  const handleToggleSave = async (propertyId: string) => {
    if (!user) { toast.error('Please login to save properties'); return; }
    try {
      const result = await propertyService.toggleFavourite(propertyId);
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (result.isSaved) next.add(propertyId);
        else next.delete(propertyId);
        return next;
      });
      toast.success(result.isSaved ? 'Saved to favourites' : 'Removed from favourites');
    } catch {
      toast.error('Failed to update favourites');
    }
  };

  const handleAddToCompare = (property: Property) => {
    const stored = JSON.parse(localStorage.getItem('compareList') || '[]') as string[];
    if (stored.includes(property._id)) {
      toast('Already in compare list');
      return;
    }
    if (stored.length >= 3) {
      toast.error('Compare up to 3 properties at a time');
      return;
    }
    stored.push(property._id);
    localStorage.setItem('compareList', JSON.stringify(stored));
    toast.success('Added to compare list!');
  };

  const clearFilters = () => {
    setFilters({ search: '', sortBy: '' });
    setSearchInput('');
    setPage(1);
  };

  const activeFilterCount = [
    filters.maxRent, filters.minRent, filters.propertyType, filters.furnishing,
    filters.genderPreference, filters.wifi, filters.ac, filters.attachedBathroom,
    filters.parking, filters.laundry, filters.food, filters.verifiedOnly,
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by college, locality, or property name..."
            className="input pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            aria-label="Search properties"
          />
        </div>
        <button onClick={handleSearch} className="btn-primary text-sm px-5">
          <Search className="w-4 h-4" /> Search
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary text-sm px-4 relative ${showFilters ? 'bg-primary-50 border-primary-300 text-primary-700' : ''}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
        <div className="flex gap-1 border border-gray-200 rounded-xl p-1 bg-white">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
            aria-label="Grid view" aria-pressed={viewMode === 'grid'}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'map' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
            aria-label="Map view" aria-pressed={viewMode === 'map'}
          >
            <Map className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card p-5 mb-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filters
            </h2>
            <button onClick={clearFilters} className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> Clear all
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Rent Range */}
            <div>
              <label className="label">Min Rent (₹)</label>
              <input type="number" className="input" placeholder="e.g. 3000"
                value={filters.minRent || ''} onChange={(e) => handleFilterChange('minRent', e.target.value ? Number(e.target.value) : undefined)} />
            </div>
            <div>
              <label className="label">Max Rent (₹)</label>
              <input type="number" className="input" placeholder="e.g. 10000"
                value={filters.maxRent || ''} onChange={(e) => handleFilterChange('maxRent', e.target.value ? Number(e.target.value) : undefined)} />
            </div>

            {/* Property Type */}
            <div>
              <label className="label">Property Type</label>
              <select className="input" value={filters.propertyType || ''} onChange={(e) => handleFilterChange('propertyType', e.target.value)}>
                {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            {/* Furnishing */}
            <div>
              <label className="label">Furnishing</label>
              <select className="input" value={filters.furnishing || ''} onChange={(e) => handleFilterChange('furnishing', e.target.value)}>
                {FURNISHING_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>

            {/* Gender Preference */}
            <div>
              <label className="label">For</label>
              <select className="input" value={filters.genderPreference || ''} onChange={(e) => handleFilterChange('genderPreference', e.target.value)}>
                {GENDER_OPTIONS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>

            {/* Distance */}
            <div>
              <label className="label">Max Distance (km)</label>
              <input type="number" className="input" placeholder="e.g. 3"
                value={filters.maxDistance || ''} onChange={(e) => handleFilterChange('maxDistance', e.target.value ? Number(e.target.value) : undefined)} />
            </div>

            {/* Sort */}
            <div>
              <label className="label">Sort By</label>
              <select className="input" value={filters.sortBy || ''} onChange={(e) => handleFilterChange('sortBy', e.target.value)}>
                {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {/* Amenities Checkboxes */}
          <div className="mt-4">
            <label className="label">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'wifi', label: 'Wi-Fi', icon: Wifi },
                { key: 'ac', label: 'AC', icon: Zap },
                { key: 'parking', label: 'Parking', icon: Car },
                { key: 'food', label: 'Food', icon: UtensilsCrossed },
                { key: 'laundry', label: 'Laundry', icon: Dumbbell },
                { key: 'attachedBathroom', label: 'Attached Bathroom', icon: CheckCircle },
                { key: 'powerBackup', label: 'Power Backup', icon: Zap },
                { key: 'petFriendly', label: 'Pet-Friendly', icon: CheckCircle },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => handleFilterChange(key as keyof PropertyFilters, !filters[key as keyof PropertyFilters])}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    filters[key as keyof PropertyFilters]
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                  aria-pressed={!!filters[key as keyof PropertyFilters]}
                >
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
              <button
                onClick={() => handleFilterChange('verifiedOnly', !filters.verifiedOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  filters.verifiedOnly
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
                aria-pressed={!!filters.verifiedOnly}
              >
                <CheckCircle className="w-3.5 h-3.5" /> Verified Only
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {isLoading ? 'Searching...' : `${total} ${total === 1 ? 'property' : 'properties'} found`}
        </p>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-gray-400" />
          <select
            className="text-sm text-gray-700 border-0 focus:ring-0 bg-transparent font-medium"
            value={filters.sortBy || ''}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            aria-label="Sort properties"
          >
            {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'map' ? (
        <div className="h-[600px] rounded-2xl overflow-hidden border border-gray-200">
          <PropertyMap properties={properties} />
        </div>
      ) : (
        <>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card overflow-hidden">
                  <div className="skeleton h-48 rounded-t-2xl" />
                  <div className="p-4 space-y-2">
                    <div className="skeleton h-4 rounded w-3/4" />
                    <div className="skeleton h-3 rounded w-1/2" />
                    <div className="skeleton h-5 rounded w-1/3 mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-1">No properties found</h3>
              <p className="text-gray-400 text-sm">Try adjusting your filters or search query</p>
              <button onClick={clearFilters} className="btn-primary mt-4 text-sm">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {properties.map((p) => (
                <PropertyCard
                  key={p._id}
                  property={p}
                  isSaved={savedIds.has(p._id)}
                  onToggleSave={handleToggleSave}
                  onCompare={handleAddToCompare}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary text-sm py-2 px-4 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 px-3">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary text-sm py-2 px-4 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
