"use client";

import { cn } from "@/lib/utils";
import { Sparkles, Check } from "lucide-react";

interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: React.ReactNode;
  date?: string;
  iconClassName?: string;
  titleClassName?: string;
  onClick?: () => void;
  isComplete?: boolean;
}

function DisplayCard({
  className,
  icon = <Sparkles className="size-4 text-blue-300" />,
  title = "Featured",
  description = "Discover amazing content",
  date = "Just now",
  iconClassName = "text-blue-500",
  titleClassName = "text-blue-500",
  onClick,
  isComplete = false,
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-36 w-[16rem] select-none flex-col justify-between rounded-lg border bg-white shadow-sm px-4 py-3 transition-all duration-300 hover:shadow-md [&>*]:flex [&>*]:items-center [&>*]:gap-2",
        className
      )}
      onClick={onClick}
    >
      <div>
        <span className="relative inline-block rounded-full bg-blue-50 p-1">
          {icon}
        </span>
        <p className={cn("text-lg font-medium", titleClassName)}>{title}</p>
      </div>
      <p className="whitespace-nowrap text-lg">{description}</p>
      <p className="text-muted-foreground">{date}</p>
      {isComplete && (
        <div className="absolute top-3 right-3">
          <Check className="h-5 w-5 text-green-500" />
        </div>
      )}
    </div>
  );
}

interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const defaultCards = [
    {
      className: "hover:bg-accent/50",
    },
    {
      className: "hover:bg-accent/50",
    },
    {
      className: "hover:bg-accent/50",
    },
  ];

  const displayCards = cards || defaultCards;

  return (
    <div className="grid gap-4">
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}