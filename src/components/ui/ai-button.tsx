import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface ButtonDemoProps {
  label: string;
}

function ButtonDemo({ label }: ButtonDemoProps) {
  return (
    <Button variant="outline" className="w-[220px]">
      {label}
      <Sparkles className="-me-1 ms-2 opacity-60" size={16} strokeWidth={2} aria-hidden="true" />
    </Button>
  );
}

export { ButtonDemo };