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
  const [isDeleting, setIsDeleting] = useState(false);

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

  const deleteCandidate = async (candidateId: string) => {
    try {
      setIsDeleting(true);
      console.log("[CandidateDelete] Starting deletion for candidate:", candidateId);

      // 1. Delete executive summaries
      console.log("[CandidateDelete] Deleting executive summaries");
      const { error: summaryError } = await supabase
        .from("executive_summaries")
        .delete()
        .eq("candidate_id", candidateId);

      if (summaryError) throw new Error("Failed to delete executive summaries");

      // 2. Delete LinkedIn sections
      console.log("[CandidateDelete] Deleting LinkedIn sections");
      const { error: linkedinError } = await supabase
        .from("linkedin_sections")
        .delete()
        .eq("candidate_id", candidateId);

      if (linkedinError) throw new Error("Failed to delete LinkedIn sections");

      // 3. Delete resume analyses
      console.log("[CandidateDelete] Deleting resume analyses");
      const { error: analysisError } = await supabase
        .from("resume_analyses")
        .delete()
        .eq("candidate_id", candidateId);

      if (analysisError) throw new Error("Failed to delete resume analyses");

      // 4. Delete storage file if exists
      const candidate = candidates.find(c => c.id === candidateId);
      if (candidate?.resume_path) {
        console.log("[CandidateDelete] Deleting resume file:", candidate.resume_path);
        const { error: storageError } = await supabase.storage
          .from("resumes")
          .remove([candidate.resume_path]);

        if (storageError) throw new Error("Failed to delete resume file");
      }

      // 5. Finally delete candidate
      console.log("[CandidateDelete] Deleting candidate record");
      const { error: candidateError } = await supabase
        .from("candidates")
        .delete()
        .eq("id", candidateId);

      if (candidateError) throw new Error("Failed to delete candidate record");

      // Update local state
      setCandidates(prev => prev.filter(c => c.id !== candidateId));
      
      toast({
        title: "Success",
        description: "Candidate deleted successfully",
      });

      // Navigate to root if we're on the deleted candidate's page
      const params = new URLSearchParams(window.location.search);
      if (params.get("candidate") === candidateId) {
        navigate("/");
      }

    } catch (error) {
      console.error("[CandidateDelete] Error during deletion:", error);
      toast({
        title: "Deletion failed",
        description: error instanceof Error ? error.message : "Could not delete candidate",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
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

      // First check if this candidate already exists in our list
      const existingCandidate = candidates.find(c => c.name === candidate.name);
      
      if (existingCandidate) {
        // If the candidate exists, just navigate to their profile
        console.log("Navigating to existing candidate:", existingCandidate);
        navigate(`/?candidate=${existingCandidate.id}`);
        return;
      }

      // If we get here, this is a new candidate
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
    isDeleting,
    handleCandidateClick,
    deleteCandidate
  };
};