import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Check, RotateCw, Pencil } from "lucide-react";

interface LinkedInTextInputProps {
  onSubmit: (text: string) => void;
  initialContent: string | null;
  onContentSaved: () => void;
  onReset: () => void;
}

export const LinkedInTextInput = ({ 
  onSubmit, 
  initialContent,
  onContentSaved,
  onReset
}: LinkedInTextInputProps) => {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (initialContent) {
      setText(initialContent);
      setIsSubmitted(true);
      setIsEditing(false);
    } else {
      setText("");
      setIsSubmitted(false);
      setIsEditing(false);
    }
  }, [initialContent]);

  const handleSubmit = () => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text",
        variant: "destructive",
      });
      return;
    }

    onSubmit(text);
    setIsSubmitted(true);
    setIsEditing(false);
    onContentSaved();
  };

  const handleReset = () => {
    onReset();
    setText("");
    setIsSubmitted(false);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsSubmitted(false);
  };

  return (
    <div className="space-y-4">
      <Textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (!isEditing) setIsEditing(true);
        }}
        placeholder="Paste your LinkedIn About section text here"
        className="min-h-[200px] font-mono"
        disabled={isSubmitted && !isEditing}
      />
      <div className="flex gap-2">
        {isSubmitted && !isEditing ? (
          <Button
            variant="outline"
            onClick={handleEdit}
            className="gap-2"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="gap-2"
          >
            {isSubmitted && <Check className="h-4 w-4 text-green-500" />}
            {isSubmitted ? "Submitted" : "Submit"}
          </Button>
        )}
        {(isSubmitted || text) && (
          <Button
            variant="outline"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCw className="h-4 w-4" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};