import { Button } from "@/components/ui/button";

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
    </div>
  );
};