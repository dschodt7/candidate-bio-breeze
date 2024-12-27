import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, Pencil, RotateCw } from "lucide-react";

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
    if (text.trim()) {
      onSubmit(text);
      setIsSubmitted(true);
      setIsEditing(false);
      onContentSaved();
    }
  };

  const handleReset = () => {
    setText("");
    setIsSubmitted(false);
    setIsEditing(false);
    onReset();
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
            onClick={() => setIsEditing(true)}
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
        <Button
          variant="outline"
          onClick={handleReset}
          className="gap-2"
        >
          <RotateCw className="h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );
};