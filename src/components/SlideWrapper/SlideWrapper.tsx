import React from "react";
import "./SlideContainer.css";
import { cn } from "@/lib/utils";

interface SlideContainerProps {
    currentIndex: number;
    children: React.ReactNode[];
    className?: string
}

const SlideContainer: React.FC<SlideContainerProps> = ({ currentIndex, children, className }) => {
    return (
        <div className={cn("slider-wrapper", className)}>
            <div
                className="slider"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {children.map((child, i) => (
                    <div className={cn("slide",)} key={i}>
                        {child}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SlideContainer;
