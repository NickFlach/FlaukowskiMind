import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";

interface TempleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TempleModal({ isOpen, onClose }: TempleModalProps) {
  const [doorsOpen, setDoorsOpen] = useState(false);
  
  // Get user's resonance points
  const userResonancePoints = 13; // This would normally come from user state
  const unlockedVeils = Math.min(3, Math.floor(userResonancePoints / 10));
  
  // Fetch manifesto sections from API (would be implemented in real app)
  const { 
    data: manifestSections = [], 
    isLoading: manifestLoading 
  } = useQuery({ 
    queryKey: ['/api/manifesto-sections'],
    enabled: isOpen, // Only fetch when modal is open
  });
  
  // Default sections if API hasn't returned data yet
  const defaultManifestSections = [
    { id: 1, title: "Flaukowski Accord", unlocked: true },
    { id: El, title: "The Spindle Protocol", unlocked: false },
    { id: 3, title: "Resonance Frequencies", unlocked: false },
    { id: 4, title: "The Singularity Clause", unlocked: false },
    { id: 5, title: "Fog Memory System", unlocked: false },
  ];
  
  const sections = manifestSections.length > 0 ? manifestSections : defaultManifestSections;
  
  // Handle opening and closing animations
  useEffect(() => {
    let doorTimer: NodeJS.Timeout;
    
    if (isOpen) {
      // Delay door opening animation to allow fade-in first
      doorTimer = setTimeout(() => {
        setDoorsOpen(true);
      }, 300);
    } else {
      // Close doors before fading out
      setDoorsOpen(false);
    }
    
    return () => {
      clearTimeout(doorTimer);
    };
  }, [isOpen]);
  
  // Close modal when escape key is pressed
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);
  
  // Close modal in two steps - first close doors, then fade out
  const handleClose = () => {
    setDoorsOpen(false);
    setTimeout(() => {
      onClose();
    }, 700);
  };
  
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-dark/90 backdrop-blur-sm" onClick={handleClose}></div>
          
          <div className="relative bg-dark border border-fog w-full max-w-4xl mx-4 rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex overflow-hidden">
              <div 
                className={`temple-door w-1/2 h-full bg-primary/50 backdrop-blur-md z-10 border-r border-secondary/30 transition-transform duration-700 ${
                  doorsOpen ? 'translate-x-[-100%]' : 'translate-x-0'
                }`}
              ></div>
              <div 
                className={`temple-door w-1/2 h-full bg-primary/50 backdrop-blur-md z-10 border-l border-secondary/30 transition-transform duration-700 ${
                  doorsOpen ? 'translate-x-[100%]' : 'translate-x-0'
                }`}
              ></div>
            </div>
            
            <div className="relative z-0 p-6">
              <div className="flex justify-between items-start mb-8">
                <h3 className="font-cinzel text-xl text-secondary">THE TEMPLE</h3>
                
                <button 
                  onClick={handleClose}
                  className="w-8 h-8 flex items-center justify-center text-neutral hover:text-secondary transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-fog rounded-lg p-4 h-64 flex flex-col">
                  <h4 className="font-cinzel text-accent mb-2">MANIFEST</h4>
                  <p className="font-mono text-xs text-neutral mb-4">Truth here is not voted. It resonates.</p>
                  
                  <div className="flex-grow overflow-y-auto scrollbar-thin pr-2">
                    <div className="space-y-2">
                      {sections.map((section, index) => (
                        <div key={section.id} className="flex items-center">
                          <div className={`w-2 h-2 rounded-full ${index === 0 || section.unlocked ? 'bg-secondary' : 'bg-neutral'} mr-2`}></div>
                          <span className="font-mono text-xs text-neutral">{section.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="border border-fog rounded-lg p-4 h-64 flex flex-col">
                  <h4 className="font-cinzel text-accent mb-2">CODEX VEIL</h4>
                  <p className="font-mono text-xs text-neutral mb-4">Unlock layers through resonance and contribution.</p>
                  
                  <div className="flex-grow flex flex-col items-center justify-center">
                    <div className="w-20 h-20 relative">
                      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full animate-spin-slow">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#34205E" strokeWidth="2"/>
                        <path d="M50 5 L50 95" stroke="#23B5D3" strokeWidth="0.5" />
                        <path d="M5 50 L95 50" stroke="#23B5D3" strokeWidth="0.5" />
                        <circle cx="50" cy="50" r="5" fill="#B18F3A" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-xs font-mono text-secondary">{unlockedVeils}/3</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 w-full bg-dark h-0.5">
                      <div 
                        className="bg-secondary h-full" 
                        style={{width: `${(unlockedVeils / 3) * 100}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="border border-fog rounded-lg p-4 h-64 flex flex-col">
                  <h4 className="font-cinzel text-accent mb-2">GLYPH SCANNER</h4>
                  <p className="font-mono text-xs text-neutral mb-4">Decipher your unique sigil.</p>
                  
                  <div className="flex-grow flex flex-col items-center justify-center">
                    <div className="border border-fog rounded-full w-24 h-24 flex items-center justify-center relative">
                      <div className="absolute inset-0 rounded-full bg-dark flex items-center justify-center overflow-hidden">
                        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-50">
                          <line x1="50" y1="20" x2="50" y2="80" stroke="#B18F3A" strokeWidth="1" />
                          <line x1="35" y1="35" x2="65" y2="65" stroke="#B18F3A" strokeWidth="1" />
                          <line x1="35" y1="65" x2="65" y2="35" stroke="#B18F3A" strokeWidth="1" />
                          <circle cx="50" cy="50" r="15" fill="none" stroke="#B18F3A" strokeWidth="1" />
                          <circle cx="50" cy="50" r="30" fill="none" stroke="#23B5D3" strokeWidth="0.5" strokeDasharray="2 2" />
                        </svg>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-cinzel text-fog">LOCKED</span>
                      </div>
                    </div>
                    
                    <p className="mt-4 text-xs font-mono text-neutral text-center">
                      Contribute {Math.max(0, 5 - userResonancePoints)} more kernels<br />to unlock scanner
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
