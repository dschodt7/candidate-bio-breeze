import { FileText, User, NotepadText, FileCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useCandidate } from "@/hooks/useCandidate";
import { useExecutiveSummary } from "@/hooks/useExecutiveSummary";
import { ChecklistItem } from "./checklist/ChecklistItem";

const BRASS_TAX_TOTAL = 7;
const SENSORY_TOTAL = 5;

export const CandidateStatusChecklist = () => {
  const { candidate } = useCandidate();
  const { brassTaxCount, sensoryCount } = useExecutiveSummary(candidate?.id);

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