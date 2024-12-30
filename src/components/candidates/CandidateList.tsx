import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface CandidateListProps {
  candidates: { name: string; linkedin_url: string | null }[];
  onCandidateClick: (candidate: { name: string; linkedin_url: string | null }) => void;
}

export const CandidateList = ({ candidates, onCandidateClick }: CandidateListProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCandidateName, setNewCandidateName] = useState("");

  const handleNewCandidate = () => {
    onCandidateClick({ name: newCandidateName, linkedin_url: null });
    setNewCandidateName("");
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-2">
      {candidates.map((candidate) => (
        <Button
          key={candidate.name}
          variant="ghost"
          className="w-full justify-start text-left"
          onClick={() => onCandidateClick(candidate)}
        >
          {candidate.name}
        </Button>
      ))}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
          >
            <UserPlus className="h-4 w-4" />
            New Candidate
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Candidate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Enter candidate name"
              value={newCandidateName}
              onChange={(e) => setNewCandidateName(e.target.value)}
            />
            <Button
              className="w-full"
              onClick={handleNewCandidate}
              disabled={!newCandidateName.trim()}
            >
              Add Candidate
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};