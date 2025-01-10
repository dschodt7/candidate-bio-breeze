import { ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { FileUpload } from "@/components/file-upload/FileUpload";
import { LinkedInInput } from "@/components/LinkedInInput";
import { NotesInput } from "@/components/NotesInput";
import { ExecutiveSummaryForm } from "@/components/ExecutiveSummaryForm";
import { ProgressVisualization } from "@/components/progress/ProgressVisualization";
import { useCandidate } from "@/hooks/useCandidate";
import DisplayCards from "@/components/ui/display-cards";
import { User, FileText, Users } from "lucide-react";
import { useState } from "react";

type ActiveSection = "linkedin" | "resume" | "screening" | null;

const MainContentPanel = () => {
  const { candidate, getCandidateName } = useCandidate();
  const [activeSection, setActiveSection] = useState<ActiveSection>(null);

  const handleCardClick = (section: ActiveSection) => {
    setActiveSection(section === activeSection ? null : section);
  };

  const displayCards = [
    {
      icon: <User className="size-4 text-blue-300" />,
      title: "LinkedIn Profile",
      description: "Connect your profile",
      date: "Step 1",
      iconClassName: "text-blue-500",
      titleClassName: "text-blue-500",
      className: `[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0 cursor-pointer ${activeSection === 'linkedin' ? 'ring-2 ring-blue-500 grayscale-0' : ''}`,
      onClick: () => handleCardClick('linkedin'),
    },
    {
      icon: <FileText className="size-4 text-indigo-300" />,
      title: "Resume",
      description: "Upload your resume",
      date: "Step 2",
      iconClassName: "text-indigo-500",
      titleClassName: "text-indigo-500",
      className: `[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0 cursor-pointer ${activeSection === 'resume' ? 'ring-2 ring-indigo-500 grayscale-0' : ''}`,
      onClick: () => handleCardClick('resume'),
    },
    {
      icon: <Users className="size-4 text-green-300" />,
      title: "Leader Discovery Screening",
      description: "Complete screening",
      date: "Step 3",
      iconClassName: "text-green-500",
      titleClassName: "text-green-500",
      className: `[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10 cursor-pointer ${activeSection === 'screening' ? 'ring-2 ring-green-500' : ''}`,
      onClick: () => handleCardClick('screening'),
    },
  ];

  const renderActiveSection = () => {
    if (!activeSection) return null;

    switch (activeSection) {
      case 'linkedin':
        return <LinkedInInput />;
      case 'resume':
        return <FileUpload />;
      case 'screening':
        return <NotesInput />;
      default:
        return null;
    }
  };

  return (
    <>
      <ResizablePanel defaultSize={55} className="p-0">
        <div className="h-full p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">{getCandidateName()}</h2>
              {!candidate && (
                <p className="text-lg text-muted-foreground animate-fadeIn">
                  Select a candidate from the left panel to view and edit their information
                </p>
              )}
            </div>

            {candidate && (
              <div className="grid gap-6">
                <ProgressVisualization />
                <div className="py-4 mb-12">
                  <DisplayCards cards={displayCards} />
                </div>
                {renderActiveSection()}
                <ExecutiveSummaryForm />
              </div>
            )}
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
    </>
  );
};

export default MainContentPanel;