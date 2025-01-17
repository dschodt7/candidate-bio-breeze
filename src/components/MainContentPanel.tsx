import { ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { FileUpload } from "@/components/file-upload/FileUpload";
import { LinkedInInput } from "@/components/LinkedInInput";
import { NotesInput } from "@/components/NotesInput";
import { ExecutiveSummaryForm } from "@/components/ExecutiveSummaryForm";
import { useCandidate } from "@/hooks/useCandidate";
import DisplayCards from "@/components/ui/display-cards";
import { User, FileText, Users, Package, Circle } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ButtonDemo } from "@/components/ui/ai-button";
import { ExecutiveSummaryDialog } from "@/components/executive-summary/ExecutiveSummaryDialog";
import { useToast } from "@/hooks/use-toast";

type ActiveSection = "linkedin" | "resume" | "screening" | null;

interface LinkedInAnalysisData {
  interests?: string;
  activities?: string;
  foundationalUnderstanding?: string;
}

const MainContentPanel = () => {
  const { candidate, getCandidateName } = useCandidate();
  const [activeSection, setActiveSection] = useState<ActiveSection>(null);
  const [isExecSummaryDialogOpen, setIsExecSummaryDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const { data: linkedInAnalysis } = useQuery({
    queryKey: ['linkedInAnalysis', candidate?.id],
    queryFn: async () => {
      if (!candidate?.id) return null;
      console.log("[MainContentPanel] Fetching LinkedIn analysis for candidate:", candidate.id);
      
      const { data, error } = await supabase
        .from('linkedin_sections')
        .select('analysis')
        .eq('candidate_id', candidate.id)
        .eq('section_type', 'about')
        .maybeSingle();

      if (error) {
        console.error("[MainContentPanel] Error fetching LinkedIn analysis:", error);
        return null;
      }

      console.log("[MainContentPanel] LinkedIn analysis data:", data);
      return data?.analysis as LinkedInAnalysisData | null;
    },
    enabled: !!candidate?.id,
  });

  const { data: screeningAnalysis } = useQuery({
    queryKey: ['screeningAnalysis', candidate?.id],
    queryFn: async () => {
      if (!candidate?.id) return null;
      console.log("[MainContentPanel] Fetching screening analysis for candidate:", candidate.id);
      
      const { data, error } = await supabase
        .from('screening_analyses')
        .select('*')
        .eq('candidate_id', candidate.id)
        .maybeSingle();

      if (error) {
        console.error("[MainContentPanel] Error fetching screening analysis:", error);
        return null;
      }

      console.log("[MainContentPanel] Screening analysis data:", data);
      return data;
    },
    enabled: !!candidate?.id,
  });

  const { data: execSummaryStatus } = useQuery({
    queryKey: ['execSummaryStatus', candidate?.id],
    queryFn: async () => {
      if (!candidate?.id) return null;
      console.log("[MainContentPanel] Fetching executive summary status for candidate:", candidate.id);
      
      const { data, error } = await supabase
        .from('executive_summaries')
        .select(`
          credibility_submitted,
          results_submitted,
          case_studies_submitted,
          business_problems_submitted,
          motivations_submitted
        `)
        .eq('candidate_id', candidate.id)
        .maybeSingle();

      if (error) {
        console.error("[MainContentPanel] Error fetching executive summary status:", error);
        return null;
      }

      console.log("[MainContentPanel] Raw executive summary status data:", data);
      return data;
    },
    enabled: !!candidate?.id,
  });

  const completedSections = execSummaryStatus ? 
    Object.entries(execSummaryStatus).reduce((count, [key, value]) => {
      console.log(`[MainContentPanel] Checking section ${key}: ${value}`);
      return count + (value ? 1 : 0);
    }, 0) : 0;

  console.log("[MainContentPanel] Final completed sections count:", completedSections);

  const calculateCompletedCriteria = () => {
    let count = 0;
    
    if (linkedInAnalysis) {
      if (linkedInAnalysis.interests && linkedInAnalysis.interests !== "No data available") count++;
      if (linkedInAnalysis.activities && linkedInAnalysis.activities !== "No data available") count++;
      if (linkedInAnalysis.foundationalUnderstanding && linkedInAnalysis.foundationalUnderstanding !== "No data available") count++;
    }

    if (screeningAnalysis) {
      if (screeningAnalysis.compensation_expectations && screeningAnalysis.compensation_expectations !== "No data available") count++;
      if (screeningAnalysis.work_arrangements && screeningAnalysis.work_arrangements !== "No data available") count++;
      if (screeningAnalysis.availability_timeline && screeningAnalysis.availability_timeline !== "No data available") count++;
      if (screeningAnalysis.current_challenges && screeningAnalysis.current_challenges !== "No data available") count++;
      if (screeningAnalysis.executive_summary_notes && screeningAnalysis.executive_summary_notes !== "No data available") count++;
    }

    console.log("[MainContentPanel] Completed criteria count:", count);
    return count;
  };

  const completedCriteria = calculateCompletedCriteria();

  const handleCardClick = (section: ActiveSection) => {
    setActiveSection(section === activeSection ? null : section);
  };

  const handleExecSummaryClick = () => {
    console.log("[MainContentPanel] Executive Summary button clicked");
    setIsExecSummaryDialogOpen(true);
  };

  const handleGenerateExecSummary = async (options: any) => {
    if (!candidate?.id) {
      toast({
        title: "Error",
        description: "No candidate selected",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("[MainContentPanel] Generating executive summary with options:", options);
      setIsGenerating(true);
      
      const { data, error } = await supabase.functions.invoke(
        'generate-executive-summary',
        {
          body: { 
            candidateId: candidate.id,
            format: options.format,
            tone: options.tone,
            components: options.components
          }
        }
      );

      if (error) throw error;

      console.log("[MainContentPanel] Summary generated successfully:", data);
      
      // Emit custom event with summary data
      const summaryEvent = new CustomEvent('execSummaryGenerated', { 
        detail: data
      });
      window.dispatchEvent(summaryEvent);

      setIsExecSummaryDialogOpen(false);
    } catch (error) {
      console.error("[MainContentPanel] Error generating summary:", error);
      toast({
        title: "Error",
        description: "Failed to generate executive summary",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const displayCards = [
    {
      icon: <User className="size-4 text-blue-300" />,
      title: "LinkedIn Profile",
      description: "Submit & Analyze",
      date: "1 of 3",
      iconClassName: "text-blue-500",
      titleClassName: "text-blue-500",
      className: `hover:bg-accent/50 cursor-pointer ${activeSection === 'linkedin' ? 'ring-2 ring-blue-500' : ''}`,
      onClick: () => handleCardClick('linkedin'),
      isComplete: !!linkedInAnalysis && Object.keys(linkedInAnalysis).length > 0,
    },
    {
      icon: <FileText className="size-4 text-blue-300" />,
      title: "Resume",
      description: "Upload your resume",
      date: "2 of 3",
      iconClassName: "text-blue-500",
      titleClassName: "text-blue-500",
      className: `hover:bg-accent/50 cursor-pointer ${activeSection === 'resume' ? 'ring-2 ring-blue-500' : ''}`,
      onClick: () => handleCardClick('resume'),
      isComplete: !!candidate?.resume_path,
    },
    {
      icon: <Users className="size-4 text-blue-300" />,
      title: "Discovery Screening",
      description: "Complete screening",
      date: "3 of 3",
      iconClassName: "text-blue-500",
      titleClassName: "text-blue-500",
      className: `hover:bg-accent/50 cursor-pointer ${activeSection === 'screening' ? 'ring-2 ring-blue-500' : ''}`,
      onClick: () => handleCardClick('screening'),
      isComplete: !!candidate?.screening_notes,
    },
  ];

  const isFullyComplete = completedSections === 5 && completedCriteria === 8;

  const execSections = [
    { name: "Assessment of Current Skills", submitted: execSummaryStatus?.credibility_submitted },
    { name: "Results and Achievements", submitted: execSummaryStatus?.results_submitted },
    { name: "Case Studies", submitted: execSummaryStatus?.case_studies_submitted },
    { name: "Business Problems", submitted: execSummaryStatus?.business_problems_submitted },
    { name: "Motivations", submitted: execSummaryStatus?.motivations_submitted },
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
              <div className="relative h-[400px] px-8 bg-background/80 backdrop-blur-sm">
                {/* Glow Effect */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute left-1/2 -translate-x-1/2 top-0 h-[400px] w-[90%] bg-[radial-gradient(ellipse_at_top,_#D3E4FD75_0%,_#D3E4FD35_35%,_transparent_50%)] animate-aurora" />
                </div>
                
                {/* Title - Adjusted padding from pt-12 to pt-6 */}
                <div className="relative z-10 mb-8 pt-6 text-center">
                  <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-b from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
                    Executive Pipeline
                  </h2>
                </div>

                {/* Content Grid */}
                {candidate && (
                  <div className="grid grid-cols-[300px_1fr_300px] gap-8 relative z-10">
                    {/* Left Column - Display Cards */}
                    <div className="flex flex-col items-center space-y-6">
                      <h3 className="text-lg font-semibold">AI Input Analysis</h3>
                      <div className="mt-2">
                        <DisplayCards cards={displayCards} />
                      </div>
                    </div>

                    {/* Center Column - Exec Components */}
                    <div className="flex flex-col items-center space-y-6">
                      <h3 className="text-lg font-semibold">AI Compiler</h3>
                      <DisplayCards cards={[{
                        icon: <Package className="size-4 text-indigo-300" />,
                        title: "Exec Components",
                        description: (
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">{completedSections}/5 AI Compile Complete</div>
                            <ul className="space-y-1.5 mt-3 text-sm">
                              {execSections.map((section, index) => (
                                <li key={index} className="flex items-center space-x-2">
                                  <Circle 
                                    className={`h-2 w-2 ${section.submitted ? 'fill-green-500 text-green-500' : 'text-gray-300'}`}
                                  />
                                  <span>
                                    {section.name}
                                  </span>
                                </li>
                              ))}
                            </ul>
                            <div className="text-sm text-muted-foreground">{completedCriteria}/8 More Criteria</div>
                          </div>
                        ),
                        date: "",
                        iconClassName: "text-indigo-500",
                        titleClassName: "text-indigo-500",
                        className: `hover:bg-accent/50 cursor-pointer transition-colors ${activeSection === null ? 'ring-2 ring-indigo-500' : ''}`,
                        onClick: () => handleCardClick(null),
                        isComplete: isFullyComplete,
                      }]} />
                    </div>

                    {/* Right Column - AI Agents */}
                    <div className="flex flex-col items-center space-y-6">
                      <h3 className="text-lg font-semibold">AI Agents</h3>
                      <div className="flex flex-col items-center gap-4">
                        <ButtonDemo 
                          label="Executive Summary" 
                          onClick={handleExecSummaryClick}
                        />
                        <ButtonDemo label="Ideal Company Profile" />
                        <ButtonDemo label="LinkedIn Optimizer" />
                        <ButtonDemo label="Resume Optimizer" />
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
            <div className="space-y-6 px-6 pt-2 pb-6">
              {renderActiveSection()}
              <ExecutiveSummaryForm />
            </div>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />

      <ExecutiveSummaryDialog
        open={isExecSummaryDialogOpen}
        onOpenChange={setIsExecSummaryDialogOpen}
        onGenerate={handleGenerateExecSummary}
        isGenerating={isGenerating}
      />
    </>
  );
};

export default MainContentPanel;
