import { ResizablePanelGroup } from "@/components/ui/resizable";
import Header from "@/components/Header";
import CandidatesPanel from "@/components/CandidatesPanel";
import MainContentPanel from "@/components/MainContentPanel";
import AIAssistantPanel from "@/components/AIAssistantPanel";

const Index = () => {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-hidden">
        <ResizablePanelGroup 
          direction="horizontal" 
          className="h-full"
        >
          <CandidatesPanel />
          <MainContentPanel />
          <AIAssistantPanel />
        </ResizablePanelGroup>
      </main>
    </div>
  );
};

export default Index;