import { cn } from '@/lib/utils'
import React from 'react'
import { Card } from './ui/card'

const CardBodyContent = React.forwardRef<
    HTMLDivElement,
    React.HtmlHTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    return (
        <Card
            {...props}
            ref={ref}
            className={
                cn(
                    'w-full p-5 shadow border border-border rounded-xl bg-card',
                    className
                )
            }
        />
    )
})
CardBodyContent.displayName = "CardBodyContent"

export default CardBodyContent