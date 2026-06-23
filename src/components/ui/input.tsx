import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(`w-full px-4 py-3 text-sm rounded-xl bg-neutral-500/5 dark:bg-white/5 border border-zinc-500/10 text-black dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-transparent
                        transition-all duration-200
                        [:-webkit-autofill]:shadow-[0_0_0px_1000px_rgba(255,255,255,0.05)_inset]
                        dark:[:-webkit-autofill]:shadow-[0_0_0px_1000px_rgba(255,255,255,0.05)_inset]
                        [:-webkit-autofill]:text-black
                        dark:[:-webkit-autofill]:text-white
                    `,
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
