import React from "react";
import logoImage from "@assets/IMG_5498.jpeg";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  grayscale?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = "md", className = "", grayscale = true }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-48 h-48 md:w-64 md:h-64",
  };

  return (
    <div className={`${sizeClasses[size]} ${className} overflow-hidden rounded-full`}>
      <img 
        src={logoImage} 
        alt="Synaptide Logo" 
        className={`w-full h-full object-cover ${grayscale ? 'grayscale' : ''}`}
      />
    </div>
  );
};

export default Logo;
