import { Textarea } from "@/components/ui/textarea";

interface CredibilityInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const CredibilityInput = ({ value, onChange }: CredibilityInputProps) => {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-[200px]"
      placeholder="Enter or compile credibility statements..."
    />
  );
};