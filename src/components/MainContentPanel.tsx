import { ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { FileUpload } from "@/components/file-upload/FileUpload";
import { LinkedInInput } from "@/components/LinkedInInput";
import { NotesInput } from "@/components/NotesInput";
import { ExecutiveSummaryForm } from "@/components/ExecutiveSummaryForm";
import { useCandidate } from "@/hooks/useCandidate";
import DisplayCards from "@/components/ui/display-cards";
import { User, FileText, Users, ArrowRight, Package } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type ActiveSection = "linkedin" | "resume" | "screening" | null;

const MainContentPanel = () => {
  const { candidate, getCandidateName } = useCandidate();
  const [activeSection, setActiveSection] = useState<ActiveSection>(null);

  // Query to check if LinkedIn analysis exists
  const { data: linkedInAnalysis } = useQuery({
    queryKey: ['linkedInAnalysis', candidate?.id],
    queryFn: async () => {
      if (!candidate?.id) return null;
      console.log("Fetching LinkedIn analysis for candidate:", candidate.id);
      
      const { data, error } = await supabase
        .from('linkedin_sections')
        .select('analysis')
        .eq('candidate_id', candidate.id)
        .eq('section_type', 'about')
        .maybeSingle();

      if (error) {
        console.error("Error fetching LinkedIn analysis:", error);
        return null;
      }

      console.log("LinkedIn analysis data:", data);
      return data?.analysis;
    },
    enabled: !!candidate?.id,
  });

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
      className: `[grid-area:stack] hover:-translate-y-10 cursor-pointer ${activeSection === 'linkedin' ? 'ring-2 ring-blue-500' : ''}`,
      onClick: () => handleCardClick('linkedin'),
      isComplete: !!linkedInAnalysis && Object.keys(linkedInAnalysis).length > 0,
    },
    {
      icon: <FileText className="size-4 text-indigo-300" />,
      title: "Resume",
      description: "Upload your resume",
      date: "Step 2",
      iconClassName: "text-indigo-500",
      titleClassName: "text-indigo-500",
      className: `[grid-area:stack] translate-x-16 translate-y-10 hover:translate-y-0 cursor-pointer ${activeSection === 'resume' ? 'ring-2 ring-indigo-500' : ''}`,
      onClick: () => handleCardClick('resume'),
      isComplete: !!candidate?.resume_path,
    },
    {
      icon: <Users className="size-4 text-green-300" />,
      title: "Discovery Screening",
      description: "Complete screening",
      date: "Step 3",
      iconClassName: "text-green-500",
      titleClassName: "text-green-500",
      className: `[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10 cursor-pointer ${activeSection === 'screening' ? 'ring-2 ring-green-500' : ''}`,
      onClick: () => handleCardClick('screening'),
      isComplete: !!candidate?.screening_notes,
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
        <div className="h-full overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Hero Section with Glow */}
            <div className="relative">
              {/* Extended Hero Section Container */}
              <div className="relative px-8 py-12 bg-background/80 backdrop-blur-sm">
                {/* Glow Effect */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute left-1/2 top-1/2 h-[500px] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,_hsla(210,100%,50%,0.15)_10%,_transparent_70%)] animate-aurora" />
                </div>
                
                {/* Title */}
                <div className="relative z-10 mb-8 text-center">
                  <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-b from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
                    Executive Pipeline
                  </h2>
                </div>

                {/* Content Grid */}
                {candidate && (
                  <div className="grid grid-cols-[300px_1fr_300px] gap-8 relative z-10">
                    {/* Left Column - Display Cards */}
                    <div className="space-y-8">
                      <h3 className="text-lg font-semibold text-center">AI Input Analyzer</h3>
                      <div className="mt-4 relative">
                        <DisplayCards cards={displayCards} />
                        <div className="absolute -right-8 top-1/2 -translate-y-1/2">
                          <ArrowRight className="w-6 h-6 text-muted-foreground/30" />
                        </div>
                      </div>
                    </div>

                    {/* Center Column - Exec Components */}
                    <div className="space-y-6 relative">
                      <h3 className="text-lg font-semibold text-center">AI Compiler</h3>
                      <DisplayCards cards={[{
                        icon: <Package className="size-4 text-purple-300" />,
                        title: "Exec Components",
                        description: "5/5 AI Compile Complete",
                        date: "8/8 More Criteria",
                        iconClassName: "text-purple-500",
                        titleClassName: "text-purple-500",
                        className: "[grid-area:stack] translate-x-4 translate-y-6 hover:-translate-y-2 cursor-pointer transition-transform duration-700",
                      }]} />
                      <div className="absolute -right-8 top-1/2 -translate-y-1/2">
                        <ArrowRight className="w-6 h-6 text-muted-foreground/30" />
                      </div>
                    </div>

                    {/* Right Column - AI Agents */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-center">AI Agents</h3>
                      <div className="space-y-3">
                        <button className="w-full px-4 py-2 text-sm border rounded-lg hover:bg-accent">
                          Executive Summary
                        </button>
                        <button className="w-full px-4 py-2 text-sm border rounded-lg hover:bg-accent">
                          Ideal Company Profile
                        </button>
                        <button className="w-full px-4 py-2 text-sm border rounded-lg hover:bg-accent">
                          Gap Analysis
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Subtle Border */}
                <div className="absolute bottom-0 left-1/2 w-[90%] h-px -translate-x-1/2 bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />
              </div>

              {!candidate && (
                <p className="text-lg text-muted-foreground animate-fadeIn">
                  Select a candidate from the left panel to view and edit their information
                </p>
              )}
            </div>

            {/* Active Section Content */}
            <div className="space-y-6 p-6">
              {renderActiveSection()}
              <ExecutiveSummaryForm />
            </div>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
    </>
  );
};

export default MainContentPanel;