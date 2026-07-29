/**
 * RoommateMatchExplanation.tsx
 *
 * Displays the NestAI roommate compatibility explanation for a specific match.
 * The compatibility score is calculated deterministically on the backend.
 */

import { useState } from 'react';
import { Sparkles, Loader2, CheckCircle2, AlertCircle, MessageCircle } from 'lucide-react';
import { aiService, RoommateExplanation } from '../../services/aiService';
import AIResponseDisclaimer from './AIResponseDisclaimer';
import AIThinkingSkeleton from './AIThinkingSkeleton';
import toast from 'react-hot-toast';

interface Props {
  roommateProfileId: string;
  roommateeName:     string;
  compatibilityScore: number;
}

export default function RoommateMatchExplanation({ roommateProfileId, roommateeName, compatibilityScore }: Props) {
  const [explanation, setExplanation] = useState<RoommateExplanation | null>(null);
  const [isLoading,   setIsLoading]   = useState(false);
  const [expanded,    setExpanded]    = useState(false);

  const handleExplain = async () => {
    if (explanation) { setExpanded((e) => !e); return; }
    setIsLoading(true);
    try {
      const data = await aiService.getRoommateExplanation(roommateProfileId);
      setExplanation(data.explanation);
      setExpanded(true);
    } catch {
      toast.error('Could not load explanation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleExplain}
        disabled={isLoading}
        className="flex items-center gap-1.5 text-xs text-primary-600 hover:underline font-medium"
      >
        {isLoading
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : <Sparkles className="w-3.5 h-3.5" />
        }
        {explanation ? (expanded ? 'Hide explanation' : 'Show explanation') : 'Explain compatibility'}
      </button>

      {isLoading && <AIThinkingSkeleton label={`NestAI is analysing your compatibility with ${roommateeName}…`} lines={3} />}

      {explanation && expanded && (
        <div className="mt-3 bg-primary-50 border border-primary-100 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span className="text-xs font-semibold text-primary-700">NestAI · AI-assisted analysis</span>
          </div>

          <p className="text-sm text-gray-800">{explanation.summary}</p>

          {explanation.strongMatches.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Strong matches</p>
              <div className="flex flex-wrap gap-1.5">
                {explanation.strongMatches.map((m) => (
                  <span key={m} className="flex items-center gap-1 text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full border border-teal-100">
                    <CheckCircle2 className="w-3 h-3" /> {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {explanation.differences.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Differences to discuss</p>
              <ul className="space-y-1">
                {explanation.differences.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-amber-700">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {explanation.discussionSuggestions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Suggestions for your first chat</p>
              <ul className="space-y-1">
                {explanation.discussionSuggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                    <MessageCircle className="w-3.5 h-3.5 text-primary-400 flex-shrink-0 mt-0.5" /> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${compatibilityScore >= 75 ? 'bg-teal-500' : compatibilityScore >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                style={{ width: `${compatibilityScore}%` }}
              />
            </div>
            <span className="text-xs font-bold text-gray-700">{compatibilityScore}%</span>
          </div>

          <AIResponseDisclaimer text={explanation.disclaimer} poweredBy />
        </div>
      )}
    </div>
  );
}
