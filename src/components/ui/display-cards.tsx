"use client";

import { cn } from "@/lib/utils";
import { Sparkles, CheckCircle } from "lucide-react";
import { InputDisplayCard } from "./input-display-card";

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

function DisplayCard(props: DisplayCardProps) {
  if (props.title && ["LinkedIn Profile", "Resume", "Discovery Screening"].includes(props.title)) {
    return <InputDisplayCard 
      icon={props.icon || <Sparkles className="size-4 text-blue-300" />}
      title={props.title}
      description={props.description || "Discover amazing content"}
      date={props.date || "Just now"}
      iconClassName={props.iconClassName}
      titleClassName={props.titleClassName}
      className={cn(
        "relative flex h-[80px] w-[16rem] select-none flex-col rounded-lg bg-white shadow-sm p-2",
        "transition-all duration-300 hover:shadow-md cursor-pointer hover:bg-black/5 border-none",
        props.className
      )}
      onClick={props.onClick}
      isComplete={props.isComplete}
    />;
  }

  const isExecComponents = props.title === "Exec Components";
  
  return (
    <div
      className={cn(
        "relative flex select-none flex-col justify-between rounded-lg bg-white shadow-sm px-3 py-2",
        "transition-all duration-300 hover:shadow-md hover:bg-black/5 cursor-pointer",
        isExecComponents ? "w-[16rem]" : "",
        props.className
      )}
      onClick={props.onClick}
    >
      <div>
        <div className="flex items-center gap-2">
          <span className="relative inline-block rounded-full bg-blue-50 p-1">
            {props.icon || <Sparkles className="size-4 text-blue-300" />}
          </span>
          <p className={cn("text-lg font-medium", props.titleClassName)}>{props.title || "Featured"}</p>
        </div>
      </div>
      <div className="whitespace-nowrap text-lg">{props.description || "Discover amazing content"}</div>
      {props.date && <p className="text-muted-foreground">{props.date}</p>}
      {props.isComplete && (
        <div className="absolute top-2 right-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
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
    <div className="grid gap-2">
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}