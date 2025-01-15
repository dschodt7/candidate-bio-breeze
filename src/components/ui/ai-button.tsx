import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface ButtonDemoProps {
  label: string;
  onClick?: () => void;
}

function ButtonDemo({ label, onClick }: ButtonDemoProps) {
  return (
    <Button 
      variant="outline" 
      className="w-[210px] flex justify-between items-center"
      onClick={onClick}
    >
      {label}
      <Sparkles className="opacity-60" size={16} strokeWidth={2} aria-hidden="true" />
    </Button>
  );
}

export { ButtonDemo };