import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-48 h-48 md:w-64 md:h-64",
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Simple brain sketch with clean lines */}
        <g fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round">
          {/* Left hemisphere */}
          <path d="M60,70 C50,55 60,45 70,40 C80,35 95,40 100,50" />
          <path d="M60,70 C55,85 60,100 70,110" />
          <path d="M70,110 C60,125 65,145 75,155 C85,165 95,160 100,155" />
          
          {/* Right hemisphere */}
          <path d="M140,70 C150,55 140,45 130,40 C120,35 105,40 100,50" />
          <path d="M140,70 C145,85 140,100 130,110" />
          <path d="M130,110 C140,125 135,145 125,155 C115,165 105,160 100,155" />
          
          {/* Connecting lines */}
          <path d="M75,55 C85,60 95,58 100,55 C105,58 115,60 125,55" />
          <path d="M70,90 C80,95 90,93 100,90 C110,93 120,95 130,90" />
          <path d="M70,130 C80,135 90,133 100,130 C110,133 120,135 130,130" />
        </g>
      </svg>
    </div>
  );
};

export default Logo;
