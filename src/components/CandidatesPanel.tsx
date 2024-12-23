import { useState, useEffect } from "react";
import { ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";

interface Candidate {
  id: string;
  linkedin_url: string | null;
  screening_notes: string | null;
  resume_path: string | null;
}

const CandidatesPanel = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultCandidates = [
    { name: "Dustin Schodt" },
    { name: "Mo Money" }
  ];

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      console.log("Fetching candidates...");
      const { data: existingCandidates, error } = await supabase
        .from("candidates")
        .select("*");

      if (error) {
        throw error;
      }

      console.log("Fetched candidates:", existingCandidates);
      setCandidates(existingCandidates || []);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast({
        title: "Error",
        description: "Failed to load candidates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateClick = async (name: string) => {
    try {
      console.log("Handling click for candidate:", name);
      
      // Get the current user's session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error("No authenticated session found");
      }

      const userId = session.user.id;
      console.log("Current user ID:", userId);

      // Check if candidate already exists
      let candidate = candidates.find(c => 
        c.linkedin_url?.includes(name.toLowerCase()) || 
        c.screening_notes?.includes(name)
      );

      if (!candidate) {
        console.log("Creating new candidate for:", name);
        
        // Create new candidate using the user's ID directly
        const { data: newCandidate, error: insertError } = await supabase
          .from("candidates")
          .insert([
            { 
              profile_id: userId,
              linkedin_url: `https://linkedin.com/in/${name.toLowerCase().replace(" ", "-")}`,
              screening_notes: `Initial notes for ${name}`,
            }
          ])
          .select()
          .single();

        if (insertError || !newCandidate) {
          throw insertError || new Error("Failed to create candidate");
        }

        candidate = newCandidate;
        console.log("Created new candidate:", candidate);
        setCandidates(prev => [...prev, candidate]);
      }

      // Update URL with candidate ID
      navigate(`/?candidate=${candidate.id}`);
      
      toast({
        title: "Success",
        description: `Loaded profile for ${name}`,
      });
    } catch (error) {
      console.error("Error handling candidate click:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load candidate profile",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <ResizablePanel defaultSize={20} minSize={15} className="p-0">
        <div className="h-full p-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-4">Candidates</h2>
          <div className="space-y-2">
            {defaultCandidates.map((candidate) => (
              <Button
                key={candidate.name}
                variant="ghost"
                className="w-full justify-start text-left"
                onClick={() => handleCandidateClick(candidate.name)}
              >
                {candidate.name}
              </Button>
            ))}
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
    </>
  );
};

export default CandidatesPanel;