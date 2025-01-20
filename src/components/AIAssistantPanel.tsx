import { ResizablePanel } from "@/components/ui/resizable";
import { AIChat } from "@/components/chat/AIChat";

const AIAssistantPanel = () => {
  return (
    <ResizablePanel defaultSize={25} className="bg-white/50 backdrop-blur-sm border-l border-white/20">
      <div className="h-full p-4">
        <AIChat />
      </div>
    </ResizablePanel>
  );
};

export default AIAssistantPanel;