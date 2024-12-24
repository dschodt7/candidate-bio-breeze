import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";

export const ResumeAnalysis = () => {
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get('candidate');
  const { toast } = useToast();
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");

  const { data: executiveSummary, refetch } = useQuery({
    queryKey: ['executiveSummary', candidateId],
    queryFn: async () => {
      if (!candidateId) return null;
      console.log("Fetching executive summary for resume analysis:", candidateId);
      const { data, error } = await supabase
        .from('executive_summaries')
        .select('brass_tax_criteria')
        .eq('candidate_id', candidateId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching executive summary:", error);
        throw error;
      }

      console.log("Fetched executive summary:", data);
      return data?.brass_tax_criteria;
    },
    enabled: !!candidateId,
  });

  const handleEdit = (key: string, content: string) => {
    setEditingSection(key);
    setEditedContent(content);
  };

  const handleSave = async (key: string) => {
    if (!candidateId || !executiveSummary) return;

    try {
      const updatedCriteria = {
        ...executiveSummary,
        [key]: editedContent
      };

      const { error } = await supabase
        .from('executive_summaries')
        .update({ brass_tax_criteria: updatedCriteria })
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

  if (!executiveSummary) return null;

  const sections = [
    { title: "Credibility Statements", key: "credibilityStatements" },
    { title: "Case Studies", key: "caseStudies" },
    { title: "Complete Assessment of Job", key: "jobAssessment" },
    { title: "Motivations", key: "motivations" },
    { title: "Business Problems They Solve Better Than Most", key: "businessProblems" },
    { title: "Additional Observations", key: "additionalObservations" },
  ];

  const hasContent = Object.values(executiveSummary).some(value => value);

  return (
    <div className="mt-4">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="analysis">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-2">
              {hasContent && <CheckCircle className="h-4 w-4 text-green-500" />}
              Resume Job Matching Criteria
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              {sections.map(({ title, key }) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
                    {editingSection !== key ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(key, executiveSummary[key] || "")}
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
                        Save
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
                      {executiveSummary[key] || "No data found"}
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