import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const NotesInput = () => {
  const [notes, setNotes] = useState("");

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    console.log("Notes updated:", e.target.value);
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
      </div>
    </Card>
  );
};