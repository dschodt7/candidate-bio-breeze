import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";

interface InputDisplayCardProps {
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
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
        "relative flex h-[80px] w-[16rem] select-none flex-col rounded-lg border bg-white shadow-sm p-2 transition-all duration-300 hover:shadow-md cursor-pointer hover:bg-black/5",
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
          <div className="absolute top-2 right-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{date}</span>
        <span className="text-sm">{description}</span>
      </div>
    </div>
  );
}