import Header from "@/components/Header";
import CandidatesPanel from "@/components/CandidatesPanel";
import MainContentPanel from "@/components/MainContentPanel";
import AIAssistantPanel from "@/components/AIAssistantPanel";
import { ResizablePanelGroup } from "@/components/ui/resizable";

const Index = () => {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      <Header />
      <main className="flex-1 overflow-hidden">
        <div className="flex h-full">
          <CandidatesPanel />
          <ResizablePanelGroup direction="horizontal">
            <MainContentPanel />
            <AIAssistantPanel />
          </ResizablePanelGroup>
        </div>
      </main>
    </div>
  );
};

export default Index;