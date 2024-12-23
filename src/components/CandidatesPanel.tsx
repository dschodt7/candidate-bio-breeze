import { ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

const CandidatesPanel = () => {
  return (
    <>
      <ResizablePanel defaultSize={20} minSize={15} className="p-0">
        <div className="h-full p-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-4">Candidates</h2>
          <div className="space-y-2">
            {/* Placeholder for candidate list */}
            <p className="text-sm text-gray-500">No candidates yet</p>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
    </>
  );
};

export default CandidatesPanel;