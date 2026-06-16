import * as React from "react"
import { cn } from "../../lib/utils/utils"

const Textarea = React.forwardRef(({ className, error, errorMessage, ...props }, ref) => {
  return (
    <div className="w-full">
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-red-500 focus-visible:ring-red-500" : "border-input focus-visible:ring-ring",
          className
        )}
        ref={ref}
        {...props}
      />
      {error && errorMessage && (
        <span className="text-red-500 text-xs font-semibold mt-1.5 block text-left font-sans">
          {errorMessage}
        </span>
      )}
    </div>
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
