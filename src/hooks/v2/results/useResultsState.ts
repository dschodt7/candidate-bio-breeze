import { useState } from "react";

export const useResultsState = () => {
  const [value, setValue] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMerging, setIsMerging] = useState(false);

  return {
    value,
    setValue,
    isSubmitted,
    setIsSubmitted,
    isEditing,
    setIsEditing,
    isLoading,
    setIsLoading,
    isMerging,
    setIsMerging,
  };
};