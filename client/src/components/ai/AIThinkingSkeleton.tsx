/**
 * AIThinkingSkeleton.tsx — loading skeleton for AI responses
 */

interface Props {
  lines?: number;
  label?: string;
}

export default function AIThinkingSkeleton({ lines = 4, label = 'NestAI is thinking…' }: Props) {
  return (
    <div className="animate-pulse space-y-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 bg-primary-200 rounded-full" />
        <div className="h-3 bg-primary-100 rounded w-32" />
      </div>
      <p className="text-xs text-gray-400 mb-2">{label}</p>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-gray-200 rounded"
          style={{ width: `${[90, 75, 85, 60][i % 4]}%` }}
        />
      ))}
    </div>
  );
}
