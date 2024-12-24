import { CheckSquare, Square, FileText, User, NotepadText, FileCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useCandidate } from "@/hooks/useCandidate";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const CandidateStatusChecklist = () => {
  const { candidate } = useCandidate();

  const { data: executiveSummary } = useQuery({
    queryKey: ['executiveSummary', candidate?.id],
    queryFn: async () => {
      if (!candidate?.id) return null;
      console.log("Fetching executive summary for candidate:", candidate.id);
      const { data, error } = await supabase
        .from('executive_summaries')
        .select('*')
        .eq('candidate_id', candidate.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching executive summary:", error);
        throw error;
      }

      console.log("Fetched executive summary:", data);
      return data;
    },
    enabled: !!candidate?.id,
  });

  const brassTaxCount = executiveSummary ? 
    Object.values(executiveSummary.brass_tax_criteria).filter(value => value).length : 0;
  const sensoryCount = executiveSummary ? 
    Object.values(executiveSummary.sensory_criteria).filter(value => value).length : 0;

  const BRASS_TAX_TOTAL = 7; // Total number of Brass Tax criteria
  const SENSORY_TOTAL = 5; // Total number of Sensory criteria

  const checklistItems = [
    {
      label: "Resume Submitted",
      isComplete: !!candidate?.resume_path,
      icon: FileText,
    },
    {
      label: "LinkedIn Profile Found",
      isComplete: !!candidate?.linkedin_url,
      icon: User,
    },
    {
      label: "Screening Notes",
      isComplete: !!candidate?.screening_notes,
      icon: NotepadText,
    },
    {
      label: "Executive Summary Complete",
      isComplete: brassTaxCount === BRASS_TAX_TOTAL && sensoryCount === SENSORY_TOTAL,
      icon: FileCheck,
      subItems: [
        {
          label: `Brass Tax Job Matching Criteria (${brassTaxCount}/${BRASS_TAX_TOTAL})`,
          isComplete: brassTaxCount === BRASS_TAX_TOTAL,
        },
        {
          label: `Sensory Job Matching Criteria (${sensoryCount}/${SENSORY_TOTAL})`,
          isComplete: sensoryCount === SENSORY_TOTAL,
        },
      ],
    },
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Candidate Status Checklist</h3>
      <div className="space-y-3">
        {checklistItems.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center space-x-3">
              {item.isComplete ? (
                <CheckSquare className="h-5 w-5 text-green-500" />
              ) : (
                <Square className="h-5 w-5 text-gray-300" />
              )}
              <item.icon className="h-4 w-4 text-gray-500" />
              <span className={item.isComplete ? "text-gray-900" : "text-gray-500"}>
                {item.label}
              </span>
            </div>
            {item.subItems && (
              <div className="ml-8 space-y-2">
                {item.subItems.map((subItem, subIndex) => (
                  <div key={subIndex} className="flex items-center space-x-3">
                    {subItem.isComplete ? (
                      <CheckSquare className="h-4 w-4 text-green-500" />
                    ) : (
                      <Square className="h-4 w-4 text-gray-300" />
                    )}
                    <span className={subItem.isComplete ? "text-gray-900" : "text-gray-500"}>
                      {subItem.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};