import { FileText, User, NotepadText, FileCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useCandidate } from "@/hooks/useCandidate";
import { useExecutiveSummary } from "@/hooks/useExecutiveSummary";
import { ChecklistItem } from "./checklist/ChecklistItem";

export const CandidateStatusChecklist = () => {
  const { candidate } = useCandidate();
  const { executiveSummary } = useExecutiveSummary(candidate?.id);

  const checklistItems = [
    {
      label: "LinkedIn Profile Analyzed",
      isComplete: !!candidate?.linkedin_url,
      icon: User,
    },
    {
      label: "Resume Submitted",
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