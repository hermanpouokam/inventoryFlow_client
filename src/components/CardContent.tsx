import { cn } from '@/lib/utils'
import React from 'react'

const CardBodyContent = React.forwardRef<
    HTMLDivElement,
    React.HtmlHTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    return (
        <div
            {...props}
            ref={ref}
            className={
                cn(
                    'w-full p-5 shadow rounded bg-white border border-neutral-300',
                    className
                )
            }
        />
    )
})
CardBodyContent.displayName = "CardBodyContent"

export default CardBodyContent