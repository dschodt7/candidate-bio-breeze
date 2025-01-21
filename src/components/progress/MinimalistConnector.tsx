import { Upload, Bot, Combine } from "lucide-react";

export const MinimalistConnector = () => {
  return (
    <div className="relative h-4 mx-auto max-w-6xl px-8">
      <div className="absolute inset-0 grid grid-cols-[300px_1fr_300px] items-center">
        <div className="flex justify-center">
          <Upload className="size-6 text-primary fill-white" strokeWidth={1} />
        </div>
        <div className="flex justify-center">
          <Combine className="size-6 text-primary fill-white" strokeWidth={1} />
        </div>
        <div className="flex justify-center">
          <Bot className="size-6 text-primary fill-white" strokeWidth={1} />
        </div>
      </div>
    </div>
  );
};