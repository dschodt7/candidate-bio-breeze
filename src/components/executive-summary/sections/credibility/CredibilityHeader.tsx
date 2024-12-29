import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { SourceIndicators } from "../../common/SourceIndicators";

interface CredibilityHeaderProps {
  hasResume: boolean;
  hasLinkedIn: boolean;
  hasScreening: boolean;
  onMerge?: () => Promise<void>;
  isMerging?: boolean;
}

export const CredibilityHeader = ({
  hasResume,
  hasLinkedIn,
  hasScreening,
  onMerge,
  isMerging = false,
}: CredibilityHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <Button
        variant="outline"
        onClick={onMerge}
        disabled={isMerging || !hasResume}
        className="gap-2"
      >
        {isMerging && <Loader2 className="h-4 w-4 animate-spin" />}
        AI Compile
      </Button>
      <SourceIndicators 
        hasResume={hasResume}
        hasLinkedIn={hasLinkedIn}
        hasScreening={hasScreening}
      />
    </div>
  );
};