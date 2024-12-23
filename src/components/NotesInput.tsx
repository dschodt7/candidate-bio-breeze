import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export const NotesInput = () => {
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    console.log("Notes updated:", e.target.value);
  };

  const handleSave = () => {
    if (!notes) {
      toast({
        title: "Error",
        description: "Please enter some notes",
        variant: "destructive",
      });
      return;
    }
    console.log("Notes saved:", notes);
    toast({
      title: "Success",
      description: "Notes saved successfully",
    });
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