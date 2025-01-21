import { Upload, Bot, Combine } from "lucide-react";

export const MinimalistConnector = () => {
  return (
    <div className="relative h-4 mx-auto max-w-6xl px-8">
      <div className="absolute inset-0 grid grid-cols-[300px_1fr_300px] gap-0">
        <div className="flex items-center justify-center">
          <Upload className="size-6 text-primary fill-white" strokeWidth={1} />
        </div>
        <div className="flex items-center">
          <div className="-ml-[150px] flex-1 h-[1px] bg-gradient-to-r from-gray-300/40 to-gray-300/40" />
          <Combine className="size-6 text-primary fill-white mx-2" strokeWidth={1} />
          <div className="mr-[150px] flex-1 h-[1px] bg-gradient-to-r from-gray-300/40 to-gray-300/40" />
        </div>
        <div className="flex items-center justify-center">
          <Bot className="size-6 text-primary fill-white" strokeWidth={1} />
        </div>
      </div>
    </div>
  );
};