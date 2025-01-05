import { Button } from "@/components/ui/button";
import { UserPlus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface CandidateListProps {
  candidates: { id: string; name: string; linkedin_url: string | null }[];
  onCandidateClick: (candidate: { name: string; linkedin_url: string | null }) => void;
  onDeleteCandidate?: (id: string) => Promise<void>;
  isDeleting?: boolean;
}

export const CandidateList = ({ 
  candidates, 
  onCandidateClick, 
  onDeleteCandidate,
  isDeleting 
}: CandidateListProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCandidateName, setNewCandidateName] = useState("");
  const [candidateToDelete, setCandidateToDelete] = useState<string | null>(null);

  const handleNewCandidate = () => {
    onCandidateClick({ name: newCandidateName, linkedin_url: null });
    setNewCandidateName("");
    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (candidateToDelete && onDeleteCandidate) {
      await onDeleteCandidate(candidateToDelete);
      setCandidateToDelete(null);
    }
  };

  return (
    <div className="space-y-2">
      {candidates.map((candidate) => (
        <div key={candidate.id} className="group relative">
          <Button
            variant="ghost"
            className="w-full justify-start text-left pr-12"
            onClick={() => onCandidateClick(candidate)}
          >
            {candidate.name}
          </Button>
          {onDeleteCandidate && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCandidateToDelete(candidate.id);
                  }}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Candidate</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {candidate.name}? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setCandidateToDelete(null)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    className="bg-destructive hover:bg-destructive/90"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
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