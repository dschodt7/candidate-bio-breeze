import { Card } from "@/components/ui/card";
import { FileUploadZone } from "./FileUploadZone";
import { ResumeAnalysis } from "./ResumeAnalysis";
import { useCandidate } from "@/hooks/useCandidate";

export const FileUpload = () => {
  const { candidate } = useCandidate();

  return (
    <Card className="p-6 animate-fadeIn bg-white/50 backdrop-blur-sm shadow-lg border border-white/20">
      <FileUploadZone />
      {candidate?.resume_path && <ResumeAnalysis />}
    </Card>
  );
};