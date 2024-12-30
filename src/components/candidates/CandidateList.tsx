import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface CandidateListProps {
  candidates: { name: string | null; linkedin_url: string | null }[];
  onCandidateClick: (candidate: { name: string | null; linkedin_url: string | null }) => void;
}

export const CandidateList = ({ candidates, onCandidateClick }: CandidateListProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCandidateName, setNewCandidateName] = useState("");

  const handleNewCandidate = () => {
    onCandidateClick({ name: newCandidateName, linkedin_url: null });
    setNewCandidateName("");
    setIsDialogOpen(false);
  };

  const getCandidateDisplayName = (candidate: { name: string | null; linkedin_url: string | null }) => {
    if (candidate.name) return candidate.name;
    if (candidate.linkedin_url) {
      const urlParts = candidate.linkedin_url.split('/').pop()?.split('-');
      if (!urlParts) return "Unknown Candidate";
      return urlParts
        .slice(0, 2)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    return "Unknown Candidate";
  };

  return (
    <div className="space-y-2">
      {candidates.map((candidate) => (
        <Button
          key={candidate.name || candidate.linkedin_url}
          variant="ghost"
          className="w-full justify-start text-left"
          onClick={() => onCandidateClick(candidate)}
        >
          {getCandidateDisplayName(candidate)}
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