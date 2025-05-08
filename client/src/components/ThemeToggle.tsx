import React from "react";
import { Button } from "@/components/ui/button";

const ThemeToggle: React.FC = () => {
  // In this initial version, we'll keep it simple and just show the moon icon
  // A more advanced implementation would toggle between light and dark modes
  return (
    <Button variant="ghost" size="icon" className="rounded-full text-gray-400 hover:text-white hover:bg-dark-card">
      <i className="fas fa-moon"></i>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeToggle;
