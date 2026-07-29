/**
 * NaturalLanguageSearch.tsx
 *
 * AI-powered search bar that converts natural-language queries into structured
 * filters and passes them to the existing property search service.
 */

import { useState, useRef, FormEvent } from 'react';
import { Search, X, Loader2, Sparkles, ChevronDown } from 'lucide-react';
import { aiService, AISearchFilters, ParseSearchResponse } from '../../services/aiService';
import toast from 'react-hot-toast';

interface Props {
  onFiltersExtracted: (filters: AISearchFilters, queryParams: Record<string, string>, interpretation: string) => void;
  onReset?:           () => void;
  placeholder?:       string;
}

const EXAMPLE_QUERIES = [
  'Verified PG under ₹7,000 near Cotton University with Wi-Fi and food',
  'Girls hostel within 2 km of Gauhati University with attached bathroom',
  'Affordable shared room near Assam Engineering College from August',
  'Quiet single room with power backup under ₹8,000',
];

export default function NaturalLanguageSearch({ onFiltersExtracted, onReset, placeholder }: Props) {
  const [query,          setQuery]          = useState('');
  const [isLoading,      setIsLoading]      = useState(false);
  const [activeFilters,  setActiveFilters]  = useState<AISearchFilters | null>(null);
  const [interpretation, setInterpretation] = useState('');
  const [showExamples,   setShowExamples]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsLoading(true);
    setShowExamples(false);

    try {
      const result: ParseSearchResponse = await aiService.parseSearch(query);
      setActiveFilters(result.filters);
      setInterpretation(result.interpretation);
      onFiltersExtracted(result.filters, result.queryParams, result.interpretation);
      if (!result.aiAssisted) {
        toast('Using standard search — AI could not parse the query.', { icon: 'ℹ️' });
      }
    } catch {
      toast.error('Search parsing failed. Trying standard search…');
      onFiltersExtracted({}, { search: query }, query);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setQuery('');
    setActiveFilters(null);
    setInterpretation('');
    onReset?.();
    inputRef.current?.focus();
  };

  const removeFilter = (key: keyof AISearchFilters) => {
    if (!activeFilters) return;
    const updated = { ...activeFilters };
    delete updated[key];
    setActiveFilters(Object.keys(updated).length > 0 ? updated : null);
    // Rebuild query params without this filter
    const queryParams: Record<string, string> = {};
    if (updated.maximumRent)       queryParams.maxRent       = String(updated.maximumRent);
    if (updated.college)           queryParams.college       = updated.college;
    if (updated.verifiedOnly)      queryParams.verifiedOnly  = 'true';
    if (updated.amenities?.length) updated.amenities.forEach((a) => (queryParams[a] = 'true'));
    onFiltersExtracted(updated, queryParams, interpretation);
  };

  const filterBadges = activeFilters
    ? Object.entries(activeFilters).filter(([, v]) =>
        v !== null && v !== undefined && v !== false &&
        !(Array.isArray(v) && v.length === 0) &&
        !['keywords', 'sortBy'].includes('') // keep all meaningful ones
      )
    : [];

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl shadow-sm px-4 py-3 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-primary-400 flex-shrink-0 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5 text-primary-400 flex-shrink-0" />
          )}

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowExamples(true)}
            onBlur={() => setTimeout(() => setShowExamples(false), 200)}
            placeholder={placeholder ?? 'Ask NestAI — "Verified PG under ₹7,000 near Cotton University with Wi-Fi"'}
            className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
            maxLength={500}
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-400"
              aria-label="Clear"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="btn-primary text-sm px-4 py-1.5 flex-shrink-0 disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Search</span>
          </button>
        </div>

        {/* Example queries dropdown */}
        {showExamples && !activeFilters && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-20 p-2">
            <p className="text-xs text-gray-400 px-2 py-1">Try these examples:</p>
            {EXAMPLE_QUERIES.map((q) => (
              <button
                key={q}
                type="button"
                onMouseDown={() => { setQuery(q); setShowExamples(false); }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary-400 inline mr-1.5" />
                {q}
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Active filter chips */}
      {interpretation && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-primary-600 font-medium bg-primary-50 px-3 py-1 rounded-full">
            {interpretation}
          </span>

          {activeFilters?.college && (
            <FilterChip label={`Near ${activeFilters.college}`} onRemove={() => removeFilter('college')} />
          )}
          {activeFilters?.maximumRent && (
            <FilterChip label={`Under ₹${activeFilters.maximumRent.toLocaleString('en-IN')}`} onRemove={() => removeFilter('maximumRent')} />
          )}
          {activeFilters?.genderPreference && (
            <FilterChip label={String(activeFilters.genderPreference)} onRemove={() => removeFilter('genderPreference')} />
          )}
          {activeFilters?.verifiedOnly && (
            <FilterChip label="Verified only" onRemove={() => removeFilter('verifiedOnly')} />
          )}
          {(activeFilters?.amenities ?? []).map((a) => (
            <FilterChip key={a} label={a} onRemove={() => {
              const updated = { ...activeFilters, amenities: (activeFilters?.amenities ?? []).filter((x) => x !== a) };
              setActiveFilters(updated);
            }} />
          ))}

          {filterBadges.length > 0 && (
            <button
              onClick={handleReset}
              className="text-xs text-red-500 hover:underline ml-1 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear all
            </button>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
        <Sparkles className="w-3 h-3 text-primary-300" />
        Powered by IBM Granite · AI-assisted search
      </p>
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
      {label}
      <button type="button" onClick={onRemove} className="hover:text-red-500">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
