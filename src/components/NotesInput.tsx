import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check, RotateCw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ScreeningAnalysis } from "@/components/screening/ScreeningAnalysis";

export const NotesInput = () => {
  const [notes, setNotes] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
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
          .maybeSingle();

        if (error) throw error;

        console.log("Fetched notes:", data?.screening_notes);
        if (data?.screening_notes) {
          setNotes(data.screening_notes);
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

  const handleReset = async () => {
    if (!candidateId) return;
    
    setIsResetting(true);
    console.log("Starting reset process for candidate:", candidateId);

    try {
      // First, delete the analysis
      console.log("Deleting screening analysis...");
      const { error: analysisError } = await supabase
        .from('screening_analyses')
        .delete()
        .eq('candidate_id', candidateId);

      if (analysisError) throw analysisError;

      // Then, clear the notes
      console.log("Clearing screening notes...");
      const { error: notesError } = await supabase
        .from('candidates')
        .update({ screening_notes: null })
        .eq('id', candidateId);

      if (notesError) throw notesError;

      // Only clear UI state after successful database operations
      setNotes("");
      setIsSubmitted(false);
      console.log("Reset completed successfully");
      
      toast({
        title: "Reset Complete",
        description: "Notes and analysis have been cleared",
      });
    } catch (error) {
      console.error("Error during reset:", error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset notes and analysis",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Card className="p-6 animate-fadeIn">
      <div className="space-y-4">
        <Label htmlFor="screening-notes">Leader Discovery Screening</Label>
        <Textarea
          id="screening-notes"
          placeholder="Areas Analyzed:
1. Compensation expectations
2. Work arrangements
3. Availability timeline
4. Current challenges
5. Executive summary notes"
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            if (isSubmitted) {
              setIsSubmitted(false);
            }
          }}
          className="min-h-[200px] resize-none"
          disabled={isSubmitted}
        />
        <div className="flex justify-end gap-2">
          <Button onClick={handleSubmit} className="gap-2">
            {isSubmitted && <Check className="h-4 w-4 text-green-500" />}
            {isSubmitted ? "Submitted" : "Submit"}
          </Button>
          {isSubmitted && (
            <Button 
              variant="outline" 
              onClick={handleReset} 
              className="gap-2"
              disabled={isResetting}
            >
              {isResetting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCw className="h-4 w-4" />
              )}
              {isResetting ? "Resetting..." : "Reset"}
            </Button>
          )}
        </div>
        {candidateId && (
          <ScreeningAnalysis
            notes={notes}
            isNotesSubmitted={isSubmitted}
            candidateId={candidateId}
          />
        )}
      </div>
    </Card>
  );
};