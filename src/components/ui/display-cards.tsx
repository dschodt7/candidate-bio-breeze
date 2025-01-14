"use client";

import { cn } from "@/lib/utils";
import { Sparkles, Check } from "lucide-react";
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
      className={props.className}
      onClick={props.onClick}
      isComplete={props.isComplete}
    />;
  }

  return (
    <div
      className={cn(
        "relative flex h-[100px] w-[16rem] select-none flex-col justify-between rounded-lg border bg-white shadow-sm px-3 py-2 transition-all duration-300 hover:shadow-md [&>*]:flex [&>*]:items-center [&>*]:gap-2",
        props.className
      )}
      onClick={props.onClick}
    >
      <div>
        <span className="relative inline-block rounded-full bg-blue-50 p-1">
          {props.icon || <Sparkles className="size-4 text-blue-300" />}
        </span>
        <p className={cn("text-lg font-medium", props.titleClassName)}>{props.title || "Featured"}</p>
      </div>
      <p className="whitespace-nowrap text-lg">{props.description || "Discover amazing content"}</p>
      <p className="text-muted-foreground">{props.date || "Just now"}</p>
      {props.isComplete && (
        <div className="absolute top-2 right-2">
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
    <div className="grid gap-2">
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}