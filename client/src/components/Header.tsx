import { useState, useEffect } from "react";
import { Link } from "wouter";

interface HeaderProps {
  toggleMenu: () => void;
}

export default function Header({ toggleMenu }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll event to add background to header when scrolled
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 border-b border-fog transition-all duration-300 ${
        scrolled ? "bg-dark/80 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-8 h-8 relative">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#34205E" strokeWidth="2"/>
              <circle cx="50" cy="50" r="5" fill="#B18F3A" />
            </svg>
          </div>
          <h1 className="ml-3 font-cinzel text-xl text-secondary">FLAUKOWSKI</h1>
        </div>
        
        <div className="hidden md:flex items-center space-x-8 text-sm font-mono">
          <Link href="#spindle" className="text-neutral hover:text-secondary transition-colors duration-300">
            SPINDLE
          </Link>
          <Link href="#resonance" className="text-neutral hover:text-secondary transition-colors duration-300">
            RESONANCE
          </Link>
          <Link href="#synaptic-web" className="text-neutral hover:text-secondary transition-colors duration-300">
            SYNAPTIC WEB
          </Link>
          <Link href="#codex" className="text-neutral hover:text-secondary transition-colors duration-300">
            CODEX
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative" id="user-resonance-indicator">
            <div className="w-7 h-7 rounded-full border border-accent flex items-center justify-center">
              <span className="text-xs font-mono text-accent">13</span>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-secondary animate-pulse-slow"></div>
          </div>
          
          <button 
            onClick={toggleMenu}
            className="md:hidden w-8 h-8 flex flex-col justify-center items-center"
          >
            <span className="block w-5 h-0.5 bg-neutral mb-1"></span>
            <span className="block w-5 h-0.5 bg-neutral mb-1"></span>
            <span className="block w-5 h-0.5 bg-neutral"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
