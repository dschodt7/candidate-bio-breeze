import { motion } from "framer-motion";

export const ExecutivePipelineHero = () => {
  return (
    <div className="relative h-[400px] px-8 bg-background/80 backdrop-blur-sm">
      {/* Lamp Effect Container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main Glow */}
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,_hsla(210,100%,50%,0.15)_10%,_transparent_70%)] animate-aurora" />
        
        {/* Lamp Effect */}
        <motion.div
          initial={{ width: "8rem" }}
          animate={{ width: "16rem" }}
          transition={{ ease: "easeInOut", duration: 0.8 }}
          className="absolute left-1/2 -translate-x-1/2 top-0 z-30 h-36 -translate-y-[20%] rounded-full bg-primary/60 blur-2xl"
        />

        {/* Top Line */}
        <motion.div
          initial={{ width: "15rem" }}
          animate={{ width: "30rem" }}
          transition={{ ease: "easeInOut", duration: 0.8 }}
          className="absolute left-1/2 -translate-x-1/2 z-50 h-0.5 top-[10%] bg-primary/60"
        />

        {/* Left Gradient Cone */}
        <motion.div
          initial={{ opacity: 0.5, width: "15rem" }}
          animate={{ opacity: 1, width: "30rem" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute top-[10%] right-1/2 h-56 w-[30rem] bg-gradient-to-r from-primary/60 via-transparent to-transparent"
          style={{
            maskImage: "linear-gradient(to bottom right, black, transparent)",
          }}
        />

        {/* Right Gradient Cone */}
        <motion.div
          initial={{ opacity: 0.5, width: "15rem" }}
          animate={{ opacity: 1, width: "30rem" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute top-[10%] left-1/2 h-56 w-[30rem] bg-gradient-to-l from-primary/60 via-transparent to-transparent"
          style={{
            maskImage: "linear-gradient(to bottom left, black, transparent)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mb-8 pt-12 text-center">
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-b from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
          Executive Pipeline
        </h2>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-[300px_1fr_300px] gap-8 relative z-10">
        <h3 className="text-lg font-semibold text-center">AI Input Analyzer</h3>
        <h3 className="text-lg font-semibold text-center">AI Compiler</h3>
        <h3 className="text-lg font-semibold text-center">AI Agents</h3>
      </div>

      {/* Subtle Border */}
      <div className="absolute bottom-0 left-1/2 w-[90%] h-px -translate-x-1/2 bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />
    </div>
  );
};