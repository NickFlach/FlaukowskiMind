import { useEffect } from "react";
import { Link } from "wouter";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  // Close menu when escape key is pressed
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // Lock body scroll when menu is open
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
    <div 
      className={`fixed inset-0 bg-primary/95 z-45 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex justify-end p-4">
        <button 
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth="1.5" 
            stroke="currentColor" 
            className="w-6 h-6 text-secondary"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="flex flex-col items-center justify-center h-full -mt-16">
        <Link href="#spindle" onClick={onClose} className="text-xl font-cinzel text-secondary my-6">
          SPINDLE
        </Link>
        <Link href="#resonance" onClick={onClose} className="text-xl font-cinzel text-secondary my-6">
          RESONANCE
        </Link>
        <Link href="#synaptic-web" onClick={onClose} className="text-xl font-cinzel text-secondary my-6">
          SYNAPTIC WEB
        </Link>
        <Link href="#codex" onClick={onClose} className="text-xl font-cinzel text-secondary my-6">
          CODEX
        </Link>
      </div>
    </div>
  );
}
