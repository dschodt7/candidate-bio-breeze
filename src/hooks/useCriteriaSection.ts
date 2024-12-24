import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface CriteriaSection {
  title: string;
  helpText: string;
  value: string;
}

export const useCriteriaSection = (initialSections: Record<string, CriteriaSection>) => {
  const [sections, setSections] = useState(initialSections);
  const [savedSections, setSavedSections] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const handleSubmit = (sectionKey: string) => {
    if (!sections[sectionKey].value) {
      toast({
        title: "Error",
        description: "Please enter some content before submitting",
        variant: "destructive",
      });
      return;
    }

    setSavedSections((prev) => ({ ...prev, [sectionKey]: true }));
    console.log(`Submitted ${sectionKey}:`, sections[sectionKey].value);
    toast({
      title: "Success",
      description: `${sections[sectionKey].title} submitted successfully`,
    });
  };

  const handleReset = (sectionKey: string) => {
    setSections((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], value: "" },
    }));
    setSavedSections((prev) => ({ ...prev, [sectionKey]: false }));
    console.log(`Reset ${sectionKey}`);
    toast({
      title: "Reset",
      description: `${sections[sectionKey].title} has been reset`,
    });
  };

  const handleChange = (sectionKey: string, value: string) => {
    setSections((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], value },
    }));
    setSavedSections((prev) => ({ ...prev, [sectionKey]: false }));
  };

  return {
    sections,
    savedSections,
    handleSubmit,
    handleReset,
    handleChange,
  };
};