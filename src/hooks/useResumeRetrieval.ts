import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useResumeRetrieval = (
  candidateId: string | null,
  setUploadedFileName: (name: string | null) => void
) => {
  const { toast } = useToast();

  useEffect(() => {
    const fetchResumePath = async () => {
      if (!candidateId) return;

      try {
        console.log("Fetching resume path for candidate:", candidateId);
        const { data, error } = await supabase
          .from('candidates')
          .select('resume_path')
          .eq('id', candidateId)
          .single();

        if (error) throw error;

        if (data.resume_path) {
          console.log("Fetched resume path:", data.resume_path);
          setUploadedFileName(data.resume_path.split('/').pop());
        } else {
          setUploadedFileName(null);
        }
      } catch (error) {
        console.error("Error fetching resume path:", error);
        toast({
          title: "Error",
          description: "Failed to load resume information",
          variant: "destructive",
        });
      }
    };

    fetchResumePath();
  }, [candidateId, toast, setUploadedFileName]);
};