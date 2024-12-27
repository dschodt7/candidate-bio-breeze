import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LinkedInUrlDisplayProps {
  url: string;
  onEdit: () => void;
  onReset: () => void;
}

export const LinkedInUrlDisplay = ({ url, onEdit, onReset }: LinkedInUrlDisplayProps) => {
  return (
    <div className="flex gap-4">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
      >
        {url}
        <ExternalLink className="h-4 w-4" />
      </a>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onEdit} className="gap-2">
          Edit
        </Button>
        <Button variant="outline" onClick={onReset} className="gap-2">
          Reset
        </Button>
      </div>
    </div>
  );
};