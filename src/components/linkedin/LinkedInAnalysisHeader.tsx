import { Button } from "@/components/ui/button";

interface LinkedInAnalysisHeaderProps {
  isAnalyzing: boolean;
  onAnalyze: () => void;
  showManualInput: boolean;
  onToggleManualInput: () => void;
}

export const LinkedInAnalysisHeader = ({
  isAnalyzing,
  onAnalyze,
  showManualInput,
  onToggleManualInput,
}: LinkedInAnalysisHeaderProps) => {
  return (
    <div className="flex gap-2">
      <Button
        onClick={onAnalyze}
        disabled={isAnalyzing}
      >
        {isAnalyzing ? "Analyzing LinkedIn..." : "Analyze LinkedIn"}
      </Button>
      <Button
        variant="outline"
        onClick={onToggleManualInput}
      >
        {showManualInput ? "Hide Manual Input" : "Manual Input"}
      </Button>
    </div>
  );
};