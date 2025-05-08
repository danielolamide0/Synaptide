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
        {/* Super minimalist brain outline - pure essential */}
        <g fill="none" stroke="#ffffff" strokeWidth="1" strokeLinecap="round">
          {/* Complete brain outline */}
          <path d="M100,40 
                  C80,40 65,55 60,75 
                  C55,95 60,120 75,140 
                  C85,150 95,155 100,155
                  C105,155 115,150 125,140 
                  C140,120 145,95 140,75 
                  C135,55 120,40 100,40" />
          
          {/* Center division line */}
          <path d="M100,40 L100,155" strokeDasharray="5,5" />
          
          {/* Just one fold on each side for minimalism */}
          <path d="M70,90 C80,95 90,85 95,80" />
          <path d="M130,90 C120,95 110,85 105,80" />
        </g>
      </svg>
    </div>
  );
};

export default Logo;
