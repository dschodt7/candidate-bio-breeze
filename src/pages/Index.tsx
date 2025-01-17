import Header from "@/components/Header";
import CandidatesPanel from "@/components/CandidatesPanel";
import MainContentPanel from "@/components/MainContentPanel";
import AIAssistantPanel from "@/components/AIAssistantPanel";

const Index = () => {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-hidden">
        <div className="flex h-full">
          <CandidatesPanel />
          <MainContentPanel />
          <AIAssistantPanel />
        </div>
      </main>
    </div>
  );
};

export default Index;