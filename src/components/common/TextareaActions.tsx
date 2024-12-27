import { Button } from "@/components/ui/button";
import { Check, Pencil, RotateCw } from "lucide-react";

interface TextareaActionsProps {
  isSubmitted: boolean;
  isEditing: boolean;
  hasContent: boolean;
  onSubmit: () => void;
  onEdit: () => void;
  onReset: () => void;
}

export const TextareaActions = ({
  isSubmitted,
  isEditing,
  hasContent,
  onSubmit,
  onEdit,
  onReset,
}: TextareaActionsProps) => {
  return (
    <div className="flex gap-2">
      {isSubmitted && !isEditing ? (
        <Button
          variant="outline"
          onClick={onEdit}
          className="gap-2"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
      ) : (
        <Button
          onClick={onSubmit}
          disabled={!hasContent}
          className="gap-2"
        >
          {isSubmitted && <Check className="h-4 w-4 text-green-500" />}
          {isSubmitted ? "Submitted" : "Submit"}
        </Button>
      )}
      {(isSubmitted || hasContent) && (
        <Button
          variant="outline"
          onClick={onReset}
          className="gap-2"
        >
          <RotateCw className="h-4 w-4" />
          Reset
        </Button>
      )}
    </div>
  );
};