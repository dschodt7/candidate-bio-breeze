import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RotateCw, Loader2, CircleCheck } from "lucide-react";
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
    <Card className="p-6 animate-fadeIn bg-white shadow-lg transition-all duration-300 border border-white/20 hover:bg-black/5">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {isSubmitted && <CircleCheck className="h-4 w-4 text-green-500" />}
          <Label htmlFor="screening-notes" className="text-lg font-medium text-gray-800">Leader Discovery Screening</Label>
        </div>
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
          className="min-h-[200px] resize-none bg-white/70 backdrop-blur-sm border-gray-200 focus:border-primary/50 focus:ring-primary/50 transition-colors"
          disabled={isSubmitted}
        />
        <div className="flex justify-end gap-2">
          {!isSubmitted && (
            <Button 
              onClick={handleSubmit}
              className="bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all duration-300"
            >
              Submit
            </Button>
          )}
          {isSubmitted && (
            <Button 
              variant="outline" 
              onClick={handleReset} 
              className="gap-2 border-gray-200 hover:bg-gray-50/50 transition-colors"
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