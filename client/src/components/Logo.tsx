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
        {/* Dark background */}
        <circle cx="100" cy="100" r="95" fill="#111111" />
        
        {/* Brain outline sketch - combined shape */}
        <path
          d="M100,25 
          C120,25 140,35 150,55 
          C160,75 155,100 145,115 
          C155,125 160,145 150,160 
          C140,175 120,180 100,180 
          C80,180 60,175 50,160 
          C40,145 45,125 55,115 
          C45,100 40,75 50,55 
          C60,35 80,25 100,25 Z"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="2,1"
        />
        
        {/* Left hemisphere details */}
        <path
          d="M50,65 C60,55 70,60 75,70 C80,85 75,95 70,105"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1"
          strokeLinecap="round"
        />
        
        <path
          d="M55,115 C65,125 60,145 50,150"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1"
          strokeLinecap="round"
        />
        
        {/* Right hemisphere details */}
        <path
          d="M150,65 C140,55 130,60 125,70 C120,85 125,95 130,105"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1"
          strokeLinecap="round"
        />
        
        <path
          d="M145,115 C135,125 140,145 150,150"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1"
          strokeLinecap="round"
        />
        
        {/* Synapse tides - flowing connections */}
        <path
          d="M75,40 C85,60 90,80 85,100 C90,120 85,140 75,160"
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeDasharray="1,2"
        />
        
        <path
          d="M125,40 C115,60 110,80 115,100 C110,120 115,140 125,160"
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeDasharray="1,2"
        />
        
        {/* Central connecting synapse */}
        <path
          d="M100,30 C100,60 100,90 100,120 C100,140 100,160 100,170"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeDasharray="3,2"
        />
        
        {/* Synapse connection points */}
        <circle cx="65" cy="50" r="1.5" fill="#ffffff" />
        <circle cx="55" cy="80" r="1.5" fill="#ffffff" />
        <circle cx="70" cy="110" r="1.5" fill="#ffffff" />
        <circle cx="60" cy="140" r="1.5" fill="#ffffff" />
        
        <circle cx="135" cy="50" r="1.5" fill="#ffffff" />
        <circle cx="145" cy="80" r="1.5" fill="#ffffff" />
        <circle cx="130" cy="110" r="1.5" fill="#ffffff" />
        <circle cx="140" cy="140" r="1.5" fill="#ffffff" />
        
        {/* Cross-brain connections */}
        <path
          d="M70,70 C85,80 115,80 130,70"
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.8"
          strokeDasharray="1,1"
          strokeLinecap="round"
        />
        
        <path
          d="M70,130 C85,120 115,120 130,130"
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.8"
          strokeDasharray="1,1"
          strokeLinecap="round"
        />
        
        {/* More detailed neural network */}
        <path
          d="M65,90 C75,95 85,90 95,95"
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.5"
          strokeLinecap="round"
        />
        
        <path
          d="M105,95 C115,90 125,95 135,90"
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default Logo;
