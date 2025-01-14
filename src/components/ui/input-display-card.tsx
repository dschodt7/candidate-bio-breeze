import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface InputDisplayCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  date: string;
  iconClassName?: string;
  titleClassName?: string;
  className?: string;
  onClick?: () => void;
  isComplete?: boolean;
}

export function InputDisplayCard({
  className,
  icon,
  title,
  description,
  date,
  iconClassName = "text-blue-500",
  titleClassName = "text-blue-500",
  onClick,
  isComplete = false,
}: InputDisplayCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-36 w-[16rem] select-none flex-col justify-between rounded-lg border bg-white shadow-sm px-4 py-3 transition-all duration-300 hover:shadow-md",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <span className="relative inline-block rounded-full bg-blue-50 p-1">
          {icon}
        </span>
        <p className={cn("text-lg font-medium", titleClassName)}>{title}</p>
        {isComplete && (
          <div className="absolute top-3 right-3">
            <Check className="h-5 w-5 text-green-500" />
          </div>
        )}
      </div>
      <p className="whitespace-nowrap text-lg">{description}</p>
      <p className="text-muted-foreground">{date}</p>
    </div>
  );
}