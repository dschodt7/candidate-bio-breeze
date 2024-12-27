import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, RotateCw } from "lucide-react";

interface LinkedInTextInputProps {
  onSubmit: (text: string) => void;
  initialContent: string | null;
  onReset: () => void;
}

export const LinkedInTextInput = ({ 
  onSubmit, 
  initialContent,
  onReset
}: LinkedInTextInputProps) => {
  const [text, setText] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (initialContent) {
      setText(initialContent);
      setIsSubmitted(true);
    } else {
      setText("");
      setIsSubmitted(false);
    }
  }, [initialContent]);

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text);
      setIsSubmitted(true);
    }
  };

  const handleReset = () => {
    setText("");
    setIsSubmitted(false);
    onReset();
  };

  return (
    <div className="space-y-4">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your LinkedIn About section text here"
        className="min-h-[200px] font-mono"
        disabled={isSubmitted}
      />
      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={!text.trim() || isSubmitted}
          className="gap-2"
        >
          {isSubmitted && <Check className="h-4 w-4 text-green-500" />}
          {isSubmitted ? "Submitted" : "Submit"}
        </Button>
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