import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LinkedInSectionType } from "@/integrations/supabase/types/linkedin";

export const useLinkedInContent = (candidateId: string | null, sectionType: LinkedInSectionType) => {
  const [savedContent, setSavedContent] = useState<string | null>(null);
  const [hasContent, setHasContent] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const fetchContent = async () => {
      if (!candidateId) return;

      try {
        console.log(`Fetching LinkedIn ${sectionType} content for candidate:`, candidateId);
        const { data, error } = await supabase
          .from('linkedin_sections')
          .select('content')
          .eq('candidate_id', candidateId)
          .eq('section_type', sectionType)
          .maybeSingle();

        if (error) throw error;

        // Only update state if component is still mounted
        if (isMounted) {
          setSavedContent(data?.content || null);
          setHasContent(!!data?.content);
          console.log(`LinkedIn ${sectionType} content fetched:`, data?.content ? "Content found" : "No content");
        }
      } catch (error) {
        console.error(`Error fetching LinkedIn ${sectionType} content:`, error);
        if (isMounted) {
          setSavedContent(null);
          setHasContent(false);
          toast({
            title: "Error",
            description: `Failed to fetch ${sectionType} content`,
            variant: "destructive",
          });
        }
      }
    };

    fetchContent();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [candidateId, sectionType, toast]);

  return {
    savedContent,
    hasContent,
    setSavedContent,
    setHasContent
  };
};