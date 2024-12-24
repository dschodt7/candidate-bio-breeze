import { ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { CandidateList } from "@/components/candidates/CandidateList";
import { useCandidates } from "@/hooks/useCandidates";

const CandidatesPanel = () => {
  const { handleCandidateClick } = useCandidates();
  
  const defaultCandidates = [
    { name: "Dustin Schodt" },
    { name: "Mo Money" }
  ];

  return (
    <>
      <ResizablePanel defaultSize={20} minSize={15} className="p-0">
        <div className="h-full p-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-4">Candidates</h2>
          <CandidateList 
            candidates={defaultCandidates}
            onCandidateClick={handleCandidateClick}
          />
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
    </>
  );
};

export default CandidatesPanel;