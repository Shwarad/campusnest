/**
 * AIComparisonPanel.tsx
 *
 * AI-powered property comparison panel.
 * "Compare with NestAI" button triggers the backend comparison.
 */

import { useState } from 'react';
import { Sparkles, Loader2, Trophy, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { aiService, AIComparisonResult, PropertyMetrics, ComparisonPreferences } from '../../services/aiService';
import AIResponseDisclaimer from './AIResponseDisclaimer';
import AIThinkingSkeleton from './AIThinkingSkeleton';
import toast from 'react-hot-toast';

interface Props {
  propertyIds:  string[];
  preferences?: ComparisonPreferences;
  propertyTitles?: Record<string, string>;
}

export default function AIComparisonPanel({ propertyIds, preferences, propertyTitles = {} }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [result,    setResult]    = useState<{ comparison: PropertyMetrics[]; aiExplanation: AIComparisonResult } | null>(null);
  const [expanded,  setExpanded]  = useState(false);
  const [error,     setError]     = useState('');

  const handleCompare = async () => {
    if (propertyIds.length < 2) {
      toast.error('Add at least 2 properties to compare.');
      return;
    }
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await aiService.compareProperties(propertyIds, preferences);
      setResult(data);
      setExpanded(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'AI comparison failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = (id: string) => propertyTitles[id] ?? id.slice(0, 12) + '…';
  const rec = result?.aiExplanation;
  const recTitle = rec ? getTitle(rec.recommendedPropertyId) : '';

  return (
    <div className="mt-4">
      {!result && !isLoading && (
        <button
          onClick={handleCompare}
          disabled={propertyIds.length < 2}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          Compare with NestAI
        </button>
      )}

      {isLoading && <AIThinkingSkeleton label="NestAI is comparing your properties…" lines={5} />}

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {result && rec && (
        <div className="bg-gradient-to-br from-primary-50 to-white border border-primary-100 rounded-2xl p-5 mt-2">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-500" />
              <span className="font-bold text-gray-900 text-sm">NestAI Comparison</span>
              <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">AI-assisted</span>
            </div>
            <button
              onClick={() => setExpanded((e) => !e)}
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label="Toggle"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Recommendation */}
          <div className="flex items-center gap-2 mb-3 p-3 bg-teal-50 border border-teal-100 rounded-xl">
            <Trophy className="w-5 h-5 text-teal-600 flex-shrink-0" />
            <div>
              <p className="text-xs text-teal-600 font-medium">Recommended</p>
              <p className="font-bold text-teal-900 text-sm">{recTitle}</p>
            </div>
          </div>

          <p className="text-sm text-gray-700 mb-3">{rec.summary}</p>

          {expanded && (
            <>
              {/* Reasons */}
              {rec.reasons.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Why it's recommended</p>
                  <ul className="space-y-1">
                    {rec.reasons.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Trade-offs */}
              {rec.tradeoffs.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Trade-offs by property</p>
                  <div className="space-y-3">
                    {rec.tradeoffs.map((t) => (
                      <div key={t.propertyId} className="bg-white border border-gray-100 rounded-xl p-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2 truncate">{getTitle(t.propertyId)}</p>
                        {t.advantages.length > 0 && (
                          <div className="mb-1">
                            {t.advantages.map((a, i) => (
                              <p key={i} className="text-xs text-teal-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> {a}
                              </p>
                            ))}
                          </div>
                        )}
                        {t.limitations.length > 0 && (
                          <div>
                            {t.limitations.map((l, i) => (
                              <p key={i} className="text-xs text-amber-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {l}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleCompare}
                className="text-xs text-primary-600 hover:underline mt-1 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> Re-run comparison
              </button>
            </>
          )}

          <AIResponseDisclaimer text={rec.disclaimer} />
        </div>
      )}
    </div>
  );
}
