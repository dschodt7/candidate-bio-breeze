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
    <div className="mt-6 space-y-4 text-sm text-muted-foreground border rounded-lg p-4 bg-muted/50">
      <h4 className="font-medium text-foreground">Source Analysis</h4>
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="font-medium">Resume Analysis:</p>
          <p className="whitespace-pre-line">{formatSourceAnalysis(mergeResult.sourceBreakdown.resume)}</p>
        </div>
        <div className="space-y-2">
          <p className="font-medium">LinkedIn Analysis:</p>
          <p className="whitespace-pre-line">{formatSourceAnalysis(mergeResult.sourceBreakdown.linkedin)}</p>
        </div>
      </div>
    </div>
  );
};