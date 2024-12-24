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

interface LinkedInAnalysis {
  professionalSummary: string;
  keySkills: string;
  industryExperience: string;
  leadershipStyle: string;
  achievementsAndImpact: string;
  culturalFit: string;
  careerTrajectory: string;
}

export const LinkedInJobMatchingCriteria = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");

  const { data: analysis, refetch } = useQuery({
    queryKey: ['linkedInAnalysis', searchParams.get('candidate')],
    queryFn: async () => {
      const candidateId = searchParams.get('candidate');
      if (!candidateId) return null;

      const { data: screenshots } = await supabase.storage
        .from('linkedin-screenshots')
        .list(candidateId);

      if (!screenshots?.length) {
        return null;
      }

      const screenshotUrls = screenshots.map(s => `${candidateId}/${s.name}`);

      const { data, error } = await supabase.functions.invoke('analyze-linkedin-screenshots', {
        body: { screenshotUrls }
      });

      if (error) throw error;
      return data;
    },
    enabled: !!searchParams.get('candidate'),
  });

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      await refetch();
      toast({
        title: "Success",
        description: "LinkedIn analysis completed successfully",
      });
    } catch (error) {
      console.error("Error analyzing LinkedIn screenshots:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze LinkedIn screenshots",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sections = [
    { key: 'professionalSummary', title: 'Professional Summary' },
    { key: 'keySkills', title: 'Key Skills' },
    { key: 'industryExperience', title: 'Industry Experience' },
    { key: 'leadershipStyle', title: 'Leadership Style' },
    { key: 'achievementsAndImpact', title: 'Achievements and Impact' },
    { key: 'culturalFit', title: 'Cultural Fit' },
    { key: 'careerTrajectory', title: 'Career Trajectory' },
  ];

  return (
    <div className="mt-4">
      <div className="flex gap-2 mb-4">
        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? "Analyzing LinkedIn..." : "Analyze LinkedIn Screenshots"}
        </Button>
      </div>

      {analysis && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="linkedin">
            <AccordionTrigger className="text-sm font-medium">
              LinkedIn Job Matching Analysis
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
                          onClick={() => {
                            setEditingSection(key);
                            setEditedContent(analysis[key as keyof LinkedInAnalysis] || "");
                          }}
                          className="h-8 px-2"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingSection(null)}
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
                        {analysis[key as keyof LinkedInAnalysis] || "No data available"}
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