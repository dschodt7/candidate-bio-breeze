import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Pencil, Check } from "lucide-react";

export const LinkedInAnalysis = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [manualContent, setManualContent] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");

  const { data: analysis, refetch } = useQuery({
    queryKey: ['linkedInAnalysis', searchParams.get('candidate')],
    queryFn: async () => {
      const candidateId = searchParams.get('candidate');
      if (!candidateId) return null;

      const { data, error } = await supabase
        .from('executive_summaries')
        .select('linked_in_analysis')
        .eq('candidate_id', candidateId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data?.linked_in_analysis;
    },
    enabled: !!searchParams.get('candidate'),
  });

  const handleAnalyze = async () => {
    const candidateId = searchParams.get('candidate');
    if (!candidateId) {
      toast({
        title: "Error",
        description: "No candidate selected",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      console.log("Starting LinkedIn analysis for candidate:", candidateId);

      const { data, error } = await supabase.functions.invoke('analyze-linkedin', {
        body: { 
          candidateId,
          linkedinContent: showManualInput ? manualContent : undefined
        }
      });

      if (error) throw error;

      await refetch();
      console.log("Analysis completed:", data);
      toast({
        title: "Success",
        description: "LinkedIn analysis completed successfully",
      });
      setShowManualInput(false);
      setManualContent("");
    } catch (error) {
      console.error("Error analyzing LinkedIn:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze LinkedIn profile",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleEdit = (key: string, content: string) => {
    setEditingSection(key);
    setEditedContent(content);
  };

  const handleSave = async (key: string) => {
    const candidateId = searchParams.get('candidate');
    if (!candidateId || !analysis) return;

    try {
      const updatedAnalysis = {
        ...analysis,
        [key]: editedContent
      };

      const { error } = await supabase
        .from('executive_summaries')
        .update({ linked_in_analysis: updatedAnalysis })
        .eq('candidate_id', candidateId);

      if (error) throw error;

      await refetch();
      setEditingSection(null);
      toast({
        title: "Success",
        description: "Analysis content updated successfully",
      });
    } catch (error) {
      console.error("Error updating analysis:", error);
      toast({
        title: "Error",
        description: "Failed to update analysis content",
        variant: "destructive",
      });
    }
  };

  const sections = [
    { key: 'credibilityStatements', title: 'Credibility Statements' },
    { key: 'caseStudies', title: 'Case Studies' },
    { key: 'jobAssessment', title: 'Complete Assessment of Job' },
    { key: 'motivations', title: 'Motivations' },
    { key: 'businessProblems', title: 'Business Problems They Solve Better Than Most' },
    { key: 'interests', title: 'Interests' },
    { key: 'activitiesAndHobbies', title: 'Activities and Hobbies' },
    { key: 'foundationalUnderstanding', title: 'Foundational Understanding' },
  ];

  return (
    <div className="mt-4">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex gap-2">
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? "Analyzing LinkedIn..." : "Analyze LinkedIn"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowManualInput(!showManualInput)}
          >
            {showManualInput ? "Hide Manual Input" : "Manual Input"}
          </Button>
        </div>

        {showManualInput && (
          <Textarea
            value={manualContent}
            onChange={(e) => setManualContent(e.target.value)}
            placeholder="Paste LinkedIn profile content here..."
            className="min-h-[200px]"
          />
        )}
      </div>

      {analysis && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="linkedin">
            <AccordionTrigger className="text-sm font-medium">
              LinkedIn Analysis Results
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                {sections.map(({ key, title }) => (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
                      {editingSection !== key ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(key, analysis[key] || "")}
                          className="h-8 px-2"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSave(key)}
                          className="h-8"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {editingSection === key ? (
                      <Textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="min-h-[100px]"
                      />
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">
                        {analysis[key] || "No data available from LinkedIn for this section"}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
};