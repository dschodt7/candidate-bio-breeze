import { MergeResult, SourceAnalysis as SourceAnalysisType } from "@/types/executive-summary";

interface SourceAnalysisProps {
  mergeResult: MergeResult | null;
}

const formatSourceAnalysis = (analysis: string | SourceAnalysisType): string => {
  if (typeof analysis === 'string') {
    return analysis || "No analysis available";
  }
  
  return Object.entries(analysis)
    .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
    .join('\n');
};

export const SourceAnalysis = ({ mergeResult }: SourceAnalysisProps) => {
  if (!mergeResult) return null;

  return (
    <div className="space-y-4">
      <div>
        <div className="mt-2 space-y-2 text-sm">
          <p><strong>Resume:</strong> {formatSourceAnalysis(mergeResult.sourceBreakdown.resume)}</p>
          <p><strong>LinkedIn:</strong> {formatSourceAnalysis(mergeResult.sourceBreakdown.linkedin)}</p>
        </div>
      </div>
    </div>
  );
};