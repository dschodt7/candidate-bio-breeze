import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
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
import { Pencil, Check, CheckCircle } from "lucide-react";

interface LinkedInAnalysis {
  credibilityStatements: string;
  caseStudies: string;
  jobAssessment: string;
  motivations: string;
  businessProblems: string;
  interests: string;
  activitiesAndHobbies: string;
  foundationalUnderstanding: string;
}

export const LinkedInJobMatchingCriteria = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");

  const { data: analysis, refetch } = useQuery({
    queryKey: ['linkedInAnalysis', searchParams.get('candidate')],
    queryFn: async () => {
      const candidateId = searchParams.get('candidate');
      if (!candidateId) return null;

      console.log("Fetching LinkedIn analysis for candidate:", candidateId);
      const { data, error } = await supabase
        .from('executive_summaries')
        .select('linked_in_analysis')
        .eq('candidate_id', candidateId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      console.log("Fetched LinkedIn analysis:", data?.linked_in_analysis);
      return data?.linked_in_analysis as LinkedInAnalysis;
    },
    enabled: !!searchParams.get('candidate'),
  });

  const handleEdit = (key: keyof LinkedInAnalysis, content: string) => {
    setEditingSection(key);
    setEditedContent(content);
  };

  const handleSave = async (key: keyof LinkedInAnalysis) => {
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
      console.error("Error updating LinkedIn analysis:", error);
      toast({
        title: "Error",
        description: "Failed to update analysis content",
        variant: "destructive",
      });
    }
  };

  if (!analysis) return null;

  const sections = [
    { key: 'credibilityStatements', title: 'Credibility Statements' },
    { key: 'caseStudies', title: 'Case Studies' },
    { key: 'jobAssessment', title: 'Complete Assessment of Job' },
    { key: 'motivations', title: 'Motivations' },
    { key: 'businessProblems', title: 'Business Problems They Solve Better Than Most' },
    { key: 'interests', title: 'Interests' },
    { key: 'activitiesAndHobbies', title: 'Activities and Hobbies' },
    { key: 'foundationalUnderstanding', title: 'Foundational Understanding' },
  ] as const;

  const hasContent = Object.values(analysis).some(value => value && value !== "No additional insights from LinkedIn.");

  return (
    <div className="mt-4">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="analysis">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-2">
              {hasContent && <CheckCircle className="h-4 w-4 text-green-500" />}
              LinkedIn Job Matching Criteria
            </div>
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
                      {analysis[key] || "No additional insights from LinkedIn."}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};