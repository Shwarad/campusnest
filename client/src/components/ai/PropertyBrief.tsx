/**
 * PropertyBrief.tsx
 *
 * "NestAI Property Brief" section displayed on the property detail page.
 * Fetches and displays the AI-generated listing summary.
 */

import { useState, useEffect } from 'react';
import { Sparkles, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { aiService, ListingSummary } from '../../services/aiService';
import AIThinkingSkeleton from './AIThinkingSkeleton';
import AIResponseDisclaimer from './AIResponseDisclaimer';

interface Props {
  propertyId: string;
}

export default function PropertyBrief({ propertyId }: Props) {
  const [summary,   setSummary]   = useState<ListingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState('');
  const [expanded,  setExpanded]  = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await aiService.getListingSummary(propertyId);
        if (!cancelled) setSummary(data.summary);
      } catch {
        if (!cancelled) setError('AI summary unavailable.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [propertyId]);

  if (error) return null; // Silent failure — don't break the property page

  return (
    <div className="card p-5 mt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-500" />
          <h3 className="font-bold text-gray-900">NestAI Property Brief</h3>
          <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full">AI-generated</span>
        </div>
        {summary && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Toggle brief"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {isLoading && <AIThinkingSkeleton label="Generating property brief…" lines={4} />}

      {summary && (
        <>
          <p className="text-sm text-gray-700 mb-3">
            <span className="font-medium text-gray-900">Best for: </span>
            {summary.bestFor}
          </p>

          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-xs text-primary-600 hover:underline flex items-center gap-1 mb-3"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? 'Show less' : 'Show full brief'}
          </button>

          {expanded && (
            <>
              {summary.advantages.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Advantages</p>
                  <ul className="space-y-1">
                    {summary.advantages.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.limitations.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Points to note</p>
                  <ul className="space-y-1">
                    {summary.limitations.map((l, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                        <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                        {l}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.questionsForOwner.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Questions to ask the owner</p>
                  <ul className="space-y-1">
                    {summary.questionsForOwner.map((q, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <HelpCircle className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          <AIResponseDisclaimer text="AI-generated summary based on information supplied by the property owner." />
        </>
      )}
    </div>
  );
}
