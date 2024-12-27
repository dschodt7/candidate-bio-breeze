import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LinkedInSectionType } from "@/integrations/supabase/types/linkedin";
import { useLinkedInContent } from "./linkedin/useLinkedInContent";
import { useLinkedInSave } from "./linkedin/useLinkedInSave";
import { useLinkedInReset } from "./linkedin/useLinkedInReset";

export const useLinkedInSection = (sectionType: LinkedInSectionType) => {
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get('candidate');
  const [activeTab, setActiveTab] = useState<"text" | "screenshot">("text");
  
  const {
    savedContent,
    hasContent,
    setSavedContent,
    setHasContent
  } = useLinkedInContent(candidateId, sectionType);

  const { saveToDatabase } = useLinkedInSave(
    candidateId,
    sectionType,
    setSavedContent,
    setHasContent
  );

  const { handleReset } = useLinkedInReset(
    candidateId,
    sectionType,
    setSavedContent,
    setHasContent,
    setActiveTab
  );

  return {
    savedContent,
    activeTab,
    setActiveTab,
    saveToDatabase,
    handleReset,
    candidateId,
    hasContent
  };
};