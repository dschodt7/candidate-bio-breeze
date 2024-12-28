interface SourceAnalysis {
  strength?: string;
  uniqueContributions?: string;
  patterns?: string;
  specificity?: string;
}

interface MergeResult {
  mergedStatements: string[];
  sourceBreakdown: {
    resume: string | SourceAnalysis;
    linkedin: string | SourceAnalysis;
  };
}

interface SourceAnalysisProps {
  mergeResult: MergeResult | null;
}

const formatSourceAnalysis = (analysis: string | SourceAnalysis): string => {
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