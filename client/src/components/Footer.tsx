import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface FooterProps {
  onTempleOpen: () => void;
}

export default function Footer({ onTempleOpen }: FooterProps) {
  // Get active nodes count from the API
  const { data: synapticData } = useQuery({ 
    queryKey: ['/api/synaptic-web'],
    refetchInterval: 60000 // Refresh every minute
  });
  
  const activeNodesCount = synapticData?.nodes?.length || 276; // Default to 276 if not loaded yet

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-dark/80 backdrop-blur-md border-t border-fog z-30">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="font-mono text-xs text-neutral">v0.13.7</span>
            <span className="mx-2 text-fog">|</span>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse mr-2"></div>
              <span className="font-mono text-xs text-neutral">{activeNodesCount} Nodes Active</span>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button 
              onClick={onTempleOpen}
              className="flex items-center text-neutral hover:text-secondary transition-colors"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                className="w-5 h-5"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" 
                />
              </svg>
            </button>
            
            <button 
              id="resonance-tracker-btn" 
              className="flex items-center text-neutral hover:text-accent transition-colors"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                className="w-5 h-5"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12z" 
                />
              </svg>
            </button>
            
            <button 
              id="user-profile-btn" 
              className="flex items-center text-neutral hover:text-accent transition-colors"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                className="w-5 h-5"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" 
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
