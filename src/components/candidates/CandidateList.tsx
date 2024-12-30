import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface CandidateListProps {
  candidates: { name: string }[];
  onCandidateClick: (name: string) => void;
}

export const CandidateList = ({ candidates, onCandidateClick }: CandidateListProps) => {
  return (
    <div className="space-y-2">
      {candidates.map((candidate) => (
        <Button
          key={candidate.name}
          variant="ghost"
          className="w-full justify-start text-left"
          onClick={() => onCandidateClick(candidate.name)}
        >
          {candidate.name}
        </Button>
      ))}
      <Button
        variant="outline"
        className="w-full justify-start gap-2"
        onClick={() => onCandidateClick("New Candidate")}
      >
        <UserPlus className="h-4 w-4" />
        New Candidate
      </Button>
    </div>
  );
};