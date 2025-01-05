import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check, RotateCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const NotesInput = () => {
  const [notes, setNotes] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get('candidate');

  useEffect(() => {
    const fetchNotes = async () => {
      if (!candidateId) return;

      try {
        console.log("Fetching notes for candidate:", candidateId);
        const { data, error } = await supabase
          .from('candidates')
          .select('screening_notes')
          .eq('id', candidateId)
          .single();

        if (error) throw error;

        console.log("Fetched notes:", data.screening_notes);
        if (data.screening_notes) {
          setNotes(data.screening_notes);
          // Only set submitted state if notes exist and are not empty
          setIsSubmitted(data.screening_notes.trim().length > 0);
        } else {
          setNotes("");
          setIsSubmitted(false);
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
        toast({
          title: "Error",
          description: "Failed to load notes",
          variant: "destructive",
        });
      }
    };

    fetchNotes();
  }, [candidateId, toast]);

  const handleSubmit = async () => {
    if (!candidateId) {
      toast({
        title: "Error",
        description: "No candidate selected",
        variant: "destructive",
      });
      return;
    }

    if (!notes.trim()) {
      toast({
        title: "Error",
        description: "Please enter some notes",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Submitting notes for candidate:", candidateId);
      const { error } = await supabase
        .from('candidates')
        .update({ screening_notes: notes })
        .eq('id', candidateId);

      if (error) throw error;

      console.log("Notes submitted successfully");
      setIsSubmitted(true);
      toast({
        title: "Success",
        description: "Notes submitted successfully",
      });
    } catch (error) {
      console.error("Error submitting notes:", error);
      toast({
        title: "Error",
        description: "Failed to submit notes",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setNotes("");
    setIsSubmitted(false);
    console.log("Notes reset");
    toast({
      title: "Reset",
      description: "Notes have been reset",
    });
  };

  return (
    <Card className="p-6 animate-fadeIn">
      <div className="space-y-4">
        <Label htmlFor="screening-notes">Leader Discovery Criteria</Label>
        <Textarea
          id="screening-notes"
          placeholder="Enter your screening notes here..."
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setIsSubmitted(false);
          }}
          className="min-h-[200px] resize-none"
        />
        <div className="flex justify-end gap-2">
          <Button onClick={handleSubmit} className="gap-2">
            {isSubmitted && <Check className="h-4 w-4 text-green-500" />}
            {isSubmitted ? "Submitted" : "Submit"}
          </Button>
          {isSubmitted && (
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCw className="h-4 w-4" />
              Reset
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};