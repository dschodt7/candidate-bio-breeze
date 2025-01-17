import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { CandidateList } from "@/components/candidates/CandidateList";
import { useCandidates } from "@/hooks/useCandidates";
import { cn } from "@/lib/utils";

const CandidatesPanel = () => {
  const { handleCandidateClick, candidates, deleteCandidate, isDeleting } = useCandidates();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  return (
    <>
      <ResizablePanel 
        defaultSize={12} 
        minSize={4} 
        maxSize={20}
        collapsible={true}
        defaultCollapsed={isCollapsed}
        onCollapse={(collapsed) => setIsCollapsed(collapsed)}
        className="p-0"
      >
        <div className="h-full p-4 bg-gray-50 relative">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute right-[-20px] top-4 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent transition-colors"
          >
            <ChevronLeft className={cn(
              "h-4 w-4 transition-transform duration-200",
              isCollapsed && "rotate-180"
            )} />
          </button>
          
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