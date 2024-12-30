import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Candidate {
  id: string;
  name: string;
  linkedin_url: string | null;
  screening_notes: string | null;
  resume_path: string | null;
}

export const useCandidate = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [candidate, setCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    const fetchCandidate = async () => {
      const candidateId = searchParams.get('candidate');
      if (!candidateId) {
        setCandidate(null);
        return;
      }

      try {
        console.log("Fetching candidate details for ID:", candidateId);
        const { data, error } = await supabase
          .from('candidates')
          .select('*')
          .eq('id', candidateId)
          .maybeSingle();

        if (error) throw error;

        console.log("Fetched candidate details:", data);
        setCandidate(data);
      } catch (error) {
        console.error("Error fetching candidate:", error);
        toast({
          title: "Error",
          description: "Failed to load candidate details",
          variant: "destructive",
        });
      }
    };

    fetchCandidate();
  }, [searchParams, toast]);

  const getCandidateName = () => {
    if (!candidate) return "Select a Candidate";
    return candidate.name;
  };

  return {
    candidate,
    getCandidateName,
  };
};