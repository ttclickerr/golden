import * as React from "react"
import { cn } from "@/lib/utils"

interface StickyFooterProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  className?: string
  blur?: boolean
}

const StickyFooter = React.forwardRef<HTMLElement, StickyFooterProps>(
  ({ children, className, blur = true, ...props }, ref) => {
    return (
      <footer
        ref={ref as React.Ref<HTMLElement>}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 border-t border-white/10",
          blur ? "bg-gradient-to-t from-gray-900/95 to-gray-800/90 backdrop-blur-md" : "bg-background",
          className
        )}
        {...props}
      >
        <div className="container mx-auto px-4 py-2">
          {children}
        </div>
      </footer>
    )
  }
)

StickyFooter.displayName = "StickyFooter"

export { StickyFooter }