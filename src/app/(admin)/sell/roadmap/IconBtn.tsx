import React, { FC, MouseEventHandler } from "react";

interface IconButtonProps {
  text?: string; // Optional button text
  onClick: MouseEventHandler<HTMLButtonElement>; // Click handler
  icon: string; // SVG path for the icon
  buttonClass?: string; // Additional CSS classes for the button
  hoverColor?: string; // Icon color on hover
  defaultColor?: string; // Default icon color
}

const IconButton: FC<IconButtonProps> = ({
  text = "Button",
  onClick,
  icon,
  buttonClass = "",
  hoverColor = "#FFF",
  defaultColor = "#ed8796",
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <button
      className={`border px-4 py-2 rounded flex items-center space-x-2 transition duration-300 ${buttonClass}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        viewBox="0 0 16 16"
        className="mr-2"
      >
        <path
          fill="none"
          stroke={isHovered ? hoverColor : defaultColor}
          strokeLinecap="round"
          strokeLinejoin="round"
          d={icon}
        ></path>
      </svg>
      <span>{text}</span>
    </button>
  );
};

export default IconButton;
