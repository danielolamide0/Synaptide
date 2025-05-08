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
        {/* Simple, unmistakable brain sketch */}
        <g fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round">
          {/* Brain outline */}
          <path d="M65,75 C55,60 60,45 75,40 C85,35 100,45 100,50" />
          <path d="M135,75 C145,60 140,45 125,40 C115,35 100,45 100,50" />
          
          {/* Bottom curve */}
          <path d="M65,75 C55,100 55,130 70,150 C85,165 95,160 100,155" />
          <path d="M135,75 C145,100 145,130 130,150 C115,165 105,160 100,155" />
          
          {/* Brain folds - left side */}
          <path d="M65,75 C75,85 85,75 90,70" />
          <path d="M60,100 C70,110 80,100 85,95" />
          <path d="M65,125 C75,135 85,125 90,120" />
          
          {/* Brain folds - right side */}
          <path d="M135,75 C125,85 115,75 110,70" />
          <path d="M140,100 C130,110 120,100 115,95" />
          <path d="M135,125 C125,135 115,125 110,120" />

          {/* Cerebellum */}
          <path d="M80,150 C90,155 95,155 100,155" />
          <path d="M120,150 C110,155 105,155 100,155" />
          
          {/* Stem */}
          <path d="M100,155 L100,165" />
        </g>
      </svg>
    </div>
  );
};

export default Logo;
