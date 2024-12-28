import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { SourceIndicators } from "../../common/SourceIndicators";

interface CredibilityHeaderProps {
  onMerge: () => void;
  isMerging: boolean;
  hasResume: boolean;
  hasLinkedIn: boolean;
  hasScreening: boolean;
}

export const CredibilityHeader = ({
  onMerge,
  isMerging,
  hasResume,
  hasLinkedIn,
  hasScreening,
}: CredibilityHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <Button
        onClick={onMerge}
        variant="outline"
        className="gap-2"
        disabled={isMerging}
      >
        <Wand2 className="h-4 w-4" />
        {isMerging ? "AI Compiling..." : "AI Compile"}
      </Button>
      <SourceIndicators 
        hasResume={hasResume}
        hasLinkedIn={hasLinkedIn}
        hasScreening={hasScreening}
      />
    </div>
  );
};