import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Candidate {
  id: string;
  name: string;
  linkedin_url: string | null;
  screening_notes: string | null;
  resume_path: string | null;
}

export const useCandidates = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleCandidateClick = async (candidate: { name: string; linkedin_url: string | null }) => {
    try {
      console.log("Handling click for candidate:", candidate);
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error("No authenticated session found");
      }

      const userId = session.user.id;
      console.log("Current user ID:", userId);

      // Check if this is a new candidate
      if (!candidate.linkedin_url) {
        console.log("Creating new candidate with name:", candidate.name);
        
        const { data: newCandidate, error: insertError } = await supabase
          .from("candidates")
          .insert([{ 
            profile_id: userId,
            name: candidate.name,
            linkedin_url: null,
            screening_notes: null,
          }])
          .select()
          .single();

        if (insertError || !newCandidate) {
          throw insertError || new Error("Failed to create candidate");
        }

        console.log("Created new candidate:", newCandidate);
        setCandidates(prev => [...prev, newCandidate]);
        
        navigate(`/?candidate=${newCandidate.id}`);
        
        toast({
          title: "Success",
          description: "New candidate profile created",
        });
      } else {
        // Find existing candidate
        const existingCandidate = candidates.find(c => c.name === candidate.name);

        if (existingCandidate) {
          console.log("Navigating to existing candidate:", existingCandidate);
          navigate(`/?candidate=${existingCandidate.id}`);
        } else {
          console.error("Could not find candidate:", candidate);
          toast({
            title: "Error",
            description: "Could not find candidate profile",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error handling candidate click:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load candidate profile",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  return {
    candidates,
    loading,
    handleCandidateClick
  };
};