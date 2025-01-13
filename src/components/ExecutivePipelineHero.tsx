import React from "react";

export const ExecutivePipelineHero = () => {
  return (
    <div className="relative h-[400px] px-8 bg-background/80 backdrop-blur-sm">
      {/* Glow Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,_hsla(210,100%,50%,0.15)_10%,_transparent_70%)] animate-aurora" />
      </div>
      
      {/* Title */}
      <div className="relative z-10 mb-8 pt-12 text-center">
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-b from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
          Executive Pipeline
        </h2>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-[300px_1fr_300px] gap-8 relative z-10">
        <div>
          <h3 className="text-lg font-semibold text-center">AI Input Analyzer</h3>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-center">AI Compiler</h3>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-center">AI Agents</h3>
        </div>
      </div>
    </div>
  );
};