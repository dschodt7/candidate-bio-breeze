import { FileText, User, NotepadText, FileCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useCandidate } from "@/hooks/useCandidate";
import { useExecutiveSummary } from "@/hooks/useExecutiveSummary";
import { ChecklistItem } from "./checklist/ChecklistItem";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const CandidateStatusChecklist = () => {
  const { candidate } = useCandidate();
  const { executiveSummary } = useExecutiveSummary(candidate?.id);

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

  const checklistItems = [
    {
      label: "LinkedIn Profile Analyzed",
      isComplete: !!linkedInAnalysis && Object.keys(linkedInAnalysis).length > 0,
      icon: User,
    },
    {
      label: "Resume Analyzed",
      isComplete: !!candidate?.resume_path,
      icon: FileText,
    },
    {
      label: "Screening Notes",
      isComplete: !!candidate?.screening_notes,
      icon: NotepadText,
    },
    {
      label: "Executive Summary Complete",
      isComplete: !!executiveSummary?.credibility_submitted,
      icon: FileCheck,
      subItems: [
        {
          label: "Credibility Statements",
          isComplete: !!executiveSummary?.credibility_submitted,
        }
      ],
    },
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Candidate Status Checklist</h3>
      <div className="space-y-3">
        {checklistItems.map((item, index) => (
          <ChecklistItem
            key={index}
            label={item.label}
            isComplete={item.isComplete}
            icon={item.icon}
            subItems={item.subItems}
          />
        ))}
      </div>
    </Card>
  );
};