import { Card } from "@/components/ui/card";
import { EditableTextarea } from "@/components/common/EditableTextarea";
import { useCandidate } from "@/hooks/useCandidate";
import { ScreeningAnalysis } from "@/components/screening/ScreeningAnalysis";

export const NotesInput = () => {
  const { candidate } = useCandidate();

  return (
    <Card className="p-6 animate-fadeIn bg-white/50 backdrop-blur-sm shadow-lg border border-white/20">
      <EditableTextarea
        label="Leader Discovery Screening Notes"
        placeholder="Enter your screening notes here..."
        initialValue={candidate?.screening_notes || ""}
        onSave={async (content) => {
          if (!candidate?.id) {
            toast({
              title: "Error",
              description: "No candidate selected",
              variant: "destructive",
            });
            return;
          }

          try {
            console.log("Saving screening notes for candidate:", candidate.id);
            const { error } = await supabase
              .from('candidates')
              .update({ screening_notes: content })
              .eq('id', candidate.id);

            if (error) throw error;

            console.log("Screening notes saved successfully");
            toast({
              title: "Success",
              description: "Screening notes saved successfully",
            });
          } catch (error) {
            console.error("Error saving screening notes:", error);
            toast({
              title: "Error",
              description: "Failed to save screening notes",
              variant: "destructive",
            });
          }
        }}
      />
      {candidate?.screening_notes && <ScreeningAnalysis notes={candidate.screening_notes} />}
    </Card>
  );
};
