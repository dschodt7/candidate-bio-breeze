import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Check, RotateCw } from "lucide-react";

interface LinkedInTextInputProps {
  onSubmit: (text: string) => void;
}

export const LinkedInTextInput = ({ onSubmit }: LinkedInTextInputProps) => {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

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
    toast({
      title: "Success",
      description: "Text submitted successfully",
    });
  };

  const handleReset = () => {
    setText("");
    setIsSubmitted(false);
    toast({
      title: "Reset",
      description: "Text has been cleared",
    });
  };

  return (
    <div className="space-y-4">
      <Textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setIsSubmitted(false);
        }}
        placeholder="Paste your LinkedIn About section text here"
        className="min-h-[200px] font-mono"
      />
      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="gap-2"
        >
          {isSubmitted && <Check className="h-4 w-4 text-green-500" />}
          {isSubmitted ? "Submitted" : "Submit"}
        </Button>
        {isSubmitted && (
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