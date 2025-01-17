import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { CandidateList } from "@/components/candidates/CandidateList";
import { useCandidates } from "@/hooks/useCandidates";
import { cn } from "@/lib/utils";

const CandidatesPanel = () => {
  const { handleCandidateClick, candidates, deleteCandidate, isDeleting } = useCandidates();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  return (
    <div className="relative">
      <Collapsible 
        open={!isCollapsed}
        onOpenChange={(open) => setIsCollapsed(!open)}
      >
        <div className="relative">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute right-[10px] z-10 top-4 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent transition-colors"
          >
            <ChevronLeft className={cn(
              "h-4 w-4 transition-transform duration-200",
              isCollapsed && "rotate-180"
            )} />
          </button>
          
          <CollapsibleContent 
            className={cn(
              "min-h-screen bg-gray-50 transition-all duration-300",
              isCollapsed ? "w-20" : "w-[250px] p-4"
            )}
          >
            <h2 className={cn(
              "text-lg font-semibold mb-4 transition-opacity duration-200",
              isCollapsed && "opacity-0"
            )}>
              Candidates
            </h2>
            <div className={cn(
              "transition-opacity duration-200",
              isCollapsed && "opacity-0"
            )}>
              <CandidateList 
                candidates={candidates}
                onCandidateClick={handleCandidateClick}
                onDeleteCandidate={deleteCandidate}
                isDeleting={isDeleting}
              />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
};

export default CandidatesPanel;