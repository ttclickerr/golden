import * as React from "react"
import { cn } from "@/lib/utils"

interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  sticky?: boolean
}

const Footer = React.forwardRef<HTMLDivElement, FooterProps>(
  ({ className, sticky = true, ...props }, ref) => {
    return (
      <footer
        ref={ref}
        className={cn(
          "bg-gradient-to-t from-slate-900/95 to-slate-800/90 border-t border-slate-700/50 py-4 px-4",
          sticky && "fixed bottom-0 left-0 right-0 z-50",
          "backdrop-blur-md shadow-lg",
          className
        )}
        {...props}
      />
    )
  }
)

Footer.displayName = "Footer"

export { Footer }