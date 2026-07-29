/**
 * ReviewSummary.tsx
 *
 * AI-generated review summary panel for a property.
 * Shows overall sentiment, positive/negative themes and a concise summary.
 */

import { useState, useEffect } from 'react';
import { Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react';
import { aiService, ReviewSummary as ReviewSummaryType } from '../../services/aiService';
import AIThinkingSkeleton from './AIThinkingSkeleton';
import AIResponseDisclaimer from './AIResponseDisclaimer';

interface Props {
  propertyId:  string;
  reviewCount: number;
}

const SENTIMENT_CONFIG: Record<string, { label: string; colour: string }> = {
  positive:         { label: 'Very Positive',   colour: 'text-teal-600 bg-teal-50'   },
  mostly_positive:  { label: 'Mostly Positive',  colour: 'text-teal-600 bg-teal-50'   },
  mixed:            { label: 'Mixed',             colour: 'text-amber-600 bg-amber-50' },
  mostly_negative:  { label: 'Mostly Negative',  colour: 'text-red-600 bg-red-50'     },
  negative:         { label: 'Negative',          colour: 'text-red-700 bg-red-50'     },
};

export default function ReviewSummary({ propertyId, reviewCount }: Props) {
  const [summary,   setSummary]   = useState<ReviewSummaryType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message,   setMessage]   = useState('');

  useEffect(() => {
    if (reviewCount < 3) {
      setMessage('At least 3 reviews are needed to generate an AI summary.');
      return;
    }
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await aiService.getReviewSummary(propertyId);
        if (!cancelled) {
          setSummary(data.summary);
          if (!data.summary) setMessage(data.message ?? 'Not enough reviews for a summary.');
        }
      } catch {
        if (!cancelled) setMessage('AI review summary unavailable.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [propertyId, reviewCount]);

  if (reviewCount < 3 || message) {
    return (
      <div className="text-xs text-gray-400 italic py-2">
        {message || 'Not enough reviews for an AI summary.'}
      </div>
    );
  }

  const sentiment = summary ? SENTIMENT_CONFIG[summary.overallSentiment] : null;

  return (
    <div className="card p-5 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-primary-500" />
        <h3 className="font-bold text-gray-900">Review Summary</h3>
        <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full">AI-summarised</span>
      </div>

      {isLoading && <AIThinkingSkeleton label="NestAI is reading student reviews…" lines={3} />}

      {summary && sentiment && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sentiment.colour}`}>
              {sentiment.label}
            </span>
            <span className="text-xs text-gray-400">{summary.reviewCount} reviews analysed</span>
          </div>

          <p className="text-sm text-gray-700 mb-3">{summary.summary}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {summary.positiveThemes.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-teal-700 flex items-center gap-1 mb-1.5">
                  <ThumbsUp className="w-3.5 h-3.5" /> What students liked
                </p>
                <ul className="space-y-1">
                  {summary.positiveThemes.map((t, i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {summary.negativeThemes.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-amber-700 flex items-center gap-1 mb-1.5">
                  <ThumbsDown className="w-3.5 h-3.5" /> Points of concern
                </p>
                <ul className="space-y-1">
                  {summary.negativeThemes.map((t, i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <AIResponseDisclaimer text="AI summary based on published student reviews." />
        </>
      )}
    </div>
  );
}
