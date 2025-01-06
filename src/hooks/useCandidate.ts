import { useToast } from "@/components/ui/use-toast";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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
  const candidateId = searchParams.get('candidate');

  const { data: candidate } = useQuery({
    queryKey: ['candidate', candidateId],
    queryFn: async () => {
      if (!candidateId) return null;

      try {
        console.log("Fetching candidate details for ID:", candidateId);
        const { data, error } = await supabase
          .from('candidates')
          .select('*')
          .eq('id', candidateId)
          .maybeSingle();

        if (error) throw error;

        console.log("Fetched candidate details:", data);
        return data;
      } catch (error) {
        console.error("Error fetching candidate:", error);
        toast({
          title: "Error",
          description: "Failed to load candidate details",
          variant: "destructive",
        });
        throw error;
      }
    },
    enabled: !!candidateId,
    staleTime: 0, // Always fetch fresh data
    retry: 1, // Minimal retry for better UX
  });

  const getCandidateName = () => {
    if (!candidate) return "Select a Candidate";
    return candidate.name;
  };

  return {
    candidate,
    getCandidateName,
  };
};