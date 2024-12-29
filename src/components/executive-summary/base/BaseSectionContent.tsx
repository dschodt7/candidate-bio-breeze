import { EditableTextarea } from "@/components/common/EditableTextarea";
import { TextareaActions } from "@/components/common/TextareaActions";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2 } from "lucide-react";

interface BaseSectionContentProps {
  value: string;
  isSubmitted: boolean;
  isEditing: boolean;
  isLoading?: boolean;
  isMerging?: boolean;
  showAICompile?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onEdit: () => void;
  onReset: () => void;
  onMerge?: () => void;
}

export const BaseSectionContent = ({
  value,
  isSubmitted,
  isEditing,
  isLoading = false,
  isMerging = false,
  showAICompile = false,
  onChange,
  onSubmit,
  onEdit,
  onReset,
  onMerge,
}: BaseSectionContentProps) => {
  console.log("BaseSectionContent rendering with:", { 
    value, 
    isSubmitted, 
    isEditing, 
    isLoading,
    isMerging,
    showAICompile 
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="w-full h-[200px]" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

  // The button should be enabled if:
  // 1. We're not currently merging AND
  // 2. Either:
  //    - The content isn't submitted yet, OR
  //    - We're in editing mode
  const isCompileDisabled = isMerging || (!isEditing && isSubmitted);

  return (
    <div className="space-y-4">
      {showAICompile && (
        <Button
          variant="outline"
          onClick={onMerge}
          disabled={isCompileDisabled}
          className="gap-2 w-full group relative"
        >
          {isMerging ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="h-4 w-4 transition-transform group-hover:rotate-12" />
          )}
          <span className={isMerging ? "" : "group-hover:scale-105 transition-transform"}>
            AI Compile
          </span>
        </Button>
      )}
      
      <EditableTextarea
        value={value}
        onChange={onChange}
        placeholder="Enter or compile content..."
        maxLength={2000}
        disabled={isSubmitted && !isEditing}
      />
      
      <TextareaActions
        isSubmitted={isSubmitted}
        isEditing={isEditing}
        hasContent={!!value.trim()}
        onSubmit={onSubmit}
        onEdit={onEdit}
        onReset={onReset}
      />
    </div>
  );
};