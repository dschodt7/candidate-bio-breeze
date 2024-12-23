import { ResizablePanel } from "@/components/ui/resizable";

const AIAssistantPanel = () => {
  return (
    <ResizablePanel defaultSize={25} minSize={20} className="p-0">
      <div className="h-full p-4 bg-gray-50">
        <h2 className="text-lg font-semibold mb-4">Personal AI Assistant</h2>
        <div className="space-y-2">
          {/* Placeholder for AI Assistant */}
          <p className="text-sm text-gray-500">AI Assistant coming soon...</p>
        </div>
      </div>
    </ResizablePanel>
  );
};

export default AIAssistantPanel;