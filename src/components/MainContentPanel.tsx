import { useState } from "react";
import { ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { FileUpload } from "@/components/file-upload/FileUpload";
import { LinkedInInput } from "@/components/LinkedInInput";
import { NotesInput } from "@/components/NotesInput";
import { ExecutiveSummaryForm } from "@/components/ExecutiveSummaryForm";
import { CandidateStatusChecklist } from "@/components/CandidateStatusChecklist";
import { useCandidate } from "@/hooks/useCandidate";
import DisplayCards from "@/components/ui/display-cards";
import { User, FileText, Users, FileCheck } from "lucide-react";

const MainContentPanel = () => {
  const { candidate, getCandidateName } = useCandidate();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const cards = [
    {
      icon: <User className="size-4 text-blue-300" />,
      title: "LinkedIn Profile",
      description: candidate?.linkedin_url ? "Profile Connected" : "Add LinkedIn Profile",
      iconClassName: "text-blue-500",
      titleClassName: "text-blue-500",
      className: "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
      onClick: () => setActiveSection(activeSection === "linkedin" ? null : "linkedin")
    },
    {
      icon: <FileText className="size-4 text-purple-300" />,
      title: "Resume",
      description: candidate?.resume_path ? "Resume Uploaded" : "Upload Resume",
      iconClassName: "text-purple-500",
      titleClassName: "text-purple-500",
      className: "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
      onClick: () => setActiveSection(activeSection === "resume" ? null : "resume")
    },
    {
      icon: <Users className="size-4 text-green-300" />,
      title: "Leader Discovery Screening",
      description: candidate?.screening_notes ? "Screening Complete" : "Start Screening",
      iconClassName: "text-green-500",
      titleClassName: "text-green-500",
      className: "[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
      onClick: () => setActiveSection(activeSection === "screening" ? null : "screening")
    },
    {
      icon: <FileCheck className="size-4 text-amber-300" />,
      title: "Executive Summary",
      description: "View Summary Components",
      iconClassName: "text-amber-500",
      titleClassName: "text-amber-500",
      className: "[grid-area:stack] translate-x-32 translate-y-30 hover:translate-y-20",
      onClick: () => setActiveSection(activeSection === "summary" ? null : "summary")
    }
  ];

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
              <div className="space-y-12">
                <CandidateStatusChecklist />
                
                <div className="py-8">
                  <DisplayCards cards={cards} />
                </div>

                {activeSection === "linkedin" && <LinkedInInput />}
                {activeSection === "resume" && <FileUpload />}
                {activeSection === "screening" && <NotesInput />}
                {activeSection === "summary" && <ExecutiveSummaryForm />}
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