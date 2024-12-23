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
      
      // Check if candidate already exists
      let candidate = candidates.find(c => 
        c.linkedin_url?.includes(name.toLowerCase()) || 
        c.screening_notes?.includes(name)
      );

      if (!candidate) {
        console.log("Creating new candidate for:", name);
        
        // First, try to get the user's profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        // If no profile exists, create one
        if (!profile) {
          console.log("No profile found, creating one...");
          const { data: newProfile, error: insertProfileError } = await supabase
            .from("profiles")
            .insert([{ }])
            .select()
            .single();

          if (insertProfileError) {
            throw insertProfileError;
          }

          console.log("Created new profile:", newProfile);
          
          // Use the newly created profile
          const { data: newCandidate, error: insertError } = await supabase
            .from("candidates")
            .insert([
              { 
                profile_id: newProfile.id,
                linkedin_url: `https://linkedin.com/in/${name.toLowerCase().replace(" ", "-")}`,
                screening_notes: `Initial notes for ${name}`,
              }
            ])
            .select()
            .single();

          if (insertError) throw insertError;
          candidate = newCandidate;
          
          console.log("Created new candidate:", newCandidate);
          setCandidates(prev => [...prev, newCandidate]);
        } else {
          // Use existing profile
          const { data: newCandidate, error: insertError } = await supabase
            .from("candidates")
            .insert([
              { 
                profile_id: profile.id,
                linkedin_url: `https://linkedin.com/in/${name.toLowerCase().replace(" ", "-")}`,
                screening_notes: `Initial notes for ${name}`,
              }
            ])
            .select()
            .single();

          if (insertError) throw insertError;
          candidate = newCandidate;
          
          console.log("Created new candidate:", newCandidate);
          setCandidates(prev => [...prev, newCandidate]);
        }
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
        description: "Failed to load candidate profile",
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