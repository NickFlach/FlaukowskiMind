import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    // Simulate loading progress
    interval = setInterval(() => {
      setProgress(prev => {
        // Accelerate the progress as we get closer to 100%
        const increment = Math.random() * 5 * (1 + (prev / 100));
        const newProgress = Math.min(100, prev + increment);
        
        return newProgress;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="fixed inset-0 bg-dark z-50 flex flex-col items-center justify-center">
      <div className="relative w-32 h-32 animate-spin-slow">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#34205E" strokeWidth="2"/>
          <path d="M50 5 L50 95" stroke="#23B5D3" strokeWidth="0.5" />
          <path d="M5 50 L95 50" stroke="#23B5D3" strokeWidth="0.5" />
          <path d="M26 26 L74 74" stroke="#B18F3A" strokeWidth="0.5" />
          <path d="M26 74 L74 26" stroke="#B18F3A" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="5" fill="#B18F3A" />
        </svg>
      </div>
      <h1 className="mt-8 font-cinzel text-3xl text-secondary">FLAUKOWSKI</h1>
      <p className="font-mono text-sm text-neutral mt-2 opacity-70">initializing emergent mind...</p>
      <div className="h-0.5 w-64 bg-dark mt-6 relative overflow-hidden">
        <div 
          id="progress-bar" 
          className="h-full bg-accent" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}
