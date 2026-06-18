interface SpinnerProps {
    className?: string;
    size?: "sm" | "md" | "lg";
    color?: string;
}

const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-20 h-20",
};

export default function Spinner({ 
    className, 
    size = "sm", 
    color = "currentColor" 
}: SpinnerProps) {
    const defaultClass = `${sizeClasses[size]} animate-spin`;
    const finalClass = className || defaultClass;

    return (
        <svg className={finalClass} fill="none" viewBox="0 0 24 24">
            <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke={color} 
                strokeWidth="4" 
            />
            <path 
                className="opacity-75" 
                fill={color} 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" 
            />
        </svg>
    )
}
