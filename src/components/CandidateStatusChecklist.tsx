import { CheckSquare, Square, FileText, User, NotepadText, FileCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useCandidate } from "@/hooks/useCandidate";

export const CandidateStatusChecklist = () => {
  const { candidate } = useCandidate();

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
      // This will need to be updated when we implement the executive summary completion check
      isComplete: false,
      icon: FileCheck,
    },
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Candidate Status Checklist</h3>
      <div className="space-y-3">
        {checklistItems.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
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
        ))}
      </div>
    </Card>
  );
};