/**
 * RiskExplanation.tsx
 *
 * Displays the AI-explained scam-risk assessment for a property.
 * The risk score is calculated deterministically by the backend.
 * Granite only explains the signals — never labels anyone as a scammer.
 */

import { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Shield, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { aiService, ScamRiskExplanation as ScamType } from '../../services/aiService';
import AIResponseDisclaimer from './AIResponseDisclaimer';
import AIThinkingSkeleton from './AIThinkingSkeleton';

interface Props {
  propertyId:    string;
  riskLevel:     'low' | 'review_recommended' | 'high';
}

const RISK_CONFIG = {
  low_risk: {
    icon:    ShieldCheck,
    label:   'Low Risk',
    colour:  'text-teal-700 bg-teal-50 border-teal-100',
    iconCls: 'text-teal-500',
  },
  review_recommended: {
    icon:    ShieldAlert,
    label:   'Review Recommended',
    colour:  'text-amber-700 bg-amber-50 border-amber-100',
    iconCls: 'text-amber-500',
  },
  high_caution: {
    icon:    Shield,
    label:   'High Caution',
    colour:  'text-red-700 bg-red-50 border-red-100',
    iconCls: 'text-red-500',
  },
};

export default function RiskExplanation({ propertyId, riskLevel }: Props) {
  const [explanation, setExplanation] = useState<ScamType | null>(null);
  const [isLoading,   setIsLoading]   = useState(false);
  const [expanded,    setExpanded]    = useState(false);

  useEffect(() => {
    if (riskLevel === 'low') return; // Only auto-load for elevated risk
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await aiService.getRiskExplanation(propertyId);
        if (!cancelled) setExplanation(data.explanation);
      } catch {
        // Silent — don't break property page
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [propertyId, riskLevel]);

  const status = explanation?.status ?? (
    riskLevel === 'high' ? 'high_caution' :
    riskLevel === 'review_recommended' ? 'review_recommended' : 'low_risk'
  );

  const config = RISK_CONFIG[status];
  const Icon   = config.icon;

  return (
    <div className={`p-4 rounded-xl border ${config.colour} mt-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${config.iconCls}`} />
          <span className="font-semibold text-sm">{config.label}</span>
          {explanation && (
            <span className="flex items-center gap-1 text-xs opacity-70">
              <Sparkles className="w-3 h-3" /> AI-explained
            </span>
          )}
        </div>
        {explanation && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="opacity-60 hover:opacity-100 p-1"
            aria-label="Toggle details"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {isLoading && <AIThinkingSkeleton label="NestAI is analysing risk signals…" lines={2} />}

      {explanation && (
        <>
          <p className="text-sm mt-2">{explanation.explanation}</p>

          {expanded && explanation.recommendedActions.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold opacity-70 uppercase tracking-wide mb-1.5">Recommended actions</p>
              <ul className="space-y-1">
                {explanation.recommendedActions.map((a, i) => (
                  <li key={i} className="text-xs flex items-start gap-1.5">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-current flex-shrink-0 opacity-60" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <AIResponseDisclaimer text={explanation.disclaimer} poweredBy />
        </>
      )}
    </div>
  );
}
