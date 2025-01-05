import { ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { CandidateList } from "@/components/candidates/CandidateList";
import { useCandidates } from "@/hooks/useCandidates";

const CandidatesPanel = () => {
  const { handleCandidateClick, candidates, deleteCandidate, isDeleting } = useCandidates();
  
  return (
    <>
      <ResizablePanel defaultSize={20} minSize={15} className="p-0">
        <div className="h-full p-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-4">Candidates</h2>
          <CandidateList 
            candidates={candidates}
            onCandidateClick={handleCandidateClick}
            onDeleteCandidate={deleteCandidate}
            isDeleting={isDeleting}
          />
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
    </>
  );
};

export default CandidatesPanel;