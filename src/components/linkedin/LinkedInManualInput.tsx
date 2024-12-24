import { Textarea } from "@/components/ui/textarea";

interface LinkedInManualInputProps {
  content: string;
  onChange: (content: string) => void;
}

export const LinkedInManualInput = ({ content, onChange }: LinkedInManualInputProps) => {
  return (
    <Textarea
      value={content}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Paste LinkedIn profile content here..."
      className="min-h-[200px]"
    />
  );
};