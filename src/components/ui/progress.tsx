import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-full w-full overflow-hidden rounded-full bg-secondary/20",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 transition-all duration-300 ease-in-out relative overflow-hidden rounded-full"
      style={{
        transform: `translateX(-${100 - (value || 0)}%)`,
        background: "linear-gradient(90deg, #074E9F 0%, #8B5CF6 100%)",
        boxShadow: "0 0 8px rgba(139, 92, 246, 0.5)"
      }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }