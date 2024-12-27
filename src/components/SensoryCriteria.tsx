import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { SensorySection } from "./sensory/SensorySection";
import { sensorySections } from "./sensory/sensorySections";

export const SensoryCriteria = () => {
  const { toast } = useToast();
  const [sections, setSections] = useState(sensorySections);
  const [savedSections, setSavedSections] = useState<Record<string, boolean>>({});

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

  return (
    <div className="space-y-6">
      {Object.entries(sections).map(([key, section]) => (
        <SensorySection
          key={key}
          title={section.title}
          helpText={section.helpText}
          value={section.value}
          isSubmitted={savedSections[key]}
          onChange={(value) => handleChange(key, value)}
          onSubmit={() => handleSubmit(key)}
          onReset={() => handleReset(key)}
        />
      ))}
    </div>
  );
};