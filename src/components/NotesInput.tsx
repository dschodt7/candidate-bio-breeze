import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const NotesInput = () => {
  const [notes, setNotes] = useState("");
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
        setNotes(data.screening_notes || "");
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

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    console.log("Notes updated:", e.target.value);
  };

  const handleSave = async () => {
    if (!candidateId) {
      toast({
        title: "Error",
        description: "No candidate selected",
        variant: "destructive",
      });
      return;
    }

    if (!notes) {
      toast({
        title: "Error",
        description: "Please enter some notes",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Saving notes for candidate:", candidateId);
      const { error } = await supabase
        .from('candidates')
        .update({ screening_notes: notes })
        .eq('id', candidateId);

      if (error) throw error;

      console.log("Notes saved successfully");
      toast({
        title: "Success",
        description: "Notes saved successfully",
      });
    } catch (error) {
      console.error("Error saving notes:", error);
      toast({
        title: "Error",
        description: "Failed to save notes",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 animate-fadeIn">
      <div className="space-y-4">
        <Label htmlFor="screening-notes">Screening Notes</Label>
        <Textarea
          id="screening-notes"
          placeholder="Enter your screening notes here..."
          value={notes}
          onChange={handleNotesChange}
          className="min-h-[200px] resize-none"
        />
        <div className="flex justify-end">
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </Card>
  );
};