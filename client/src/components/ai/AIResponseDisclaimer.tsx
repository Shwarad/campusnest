/**
 * AIResponseDisclaimer.tsx
 * 
 * Standardised disclaimer footer for every AI-generated block.
 */

interface Props {
  text?: string;
  poweredBy?: boolean;
}

export default function AIResponseDisclaimer({
  text = 'AI-generated content based on CampusNest listing data.',
  poweredBy = true,
}: Props) {
  return (
    <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100 flex items-center gap-1 flex-wrap">
      {poweredBy && (
        <span className="font-medium text-gray-500 mr-1">Powered by IBM Granite ·</span>
      )}
      {text}
    </p>
  );
}
