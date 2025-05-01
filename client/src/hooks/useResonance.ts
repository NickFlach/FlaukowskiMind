import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import useAudioContext from "@/hooks/useAudioContext";

interface CreateResonanceParams {
  userId: number;
  streamId?: number;
  kernelId?: number;
}

/**
 * Hook for handling resonance interactions
 * Provides methods for creating resonances and handling the associated effects
 */
export default function useResonance() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  // Get audio context if available
  let playAudio: (id: string) => void = () => {};
  try {
    const audioContext = useAudioContext();
    playAudio = audioContext.playAudio;
  } catch (error) {
    console.warn("Audio context not available");
  }
  
  /**
   * Create a resonance record
   */
  const createResonance = async (params: CreateResonanceParams) => {
    if (!params.streamId && !params.kernelId) {
      throw new Error("Either streamId or kernelId must be provided");
    }
    
    setIsLoading(true);
    
    try {
      // Create the ripple effect visually (would be implemented in the component where this is used)
      
      // Play resonance sound if audio is available
      try {
        playAudio("resonance-ping");
      } catch (audioError) {
        console.warn("Audio not available for resonance sound");
      }
      
      // Send the request to the API
      const response = await apiRequest("/api/resonances", {
        method: "POST",
        body: JSON.stringify(params),
        headers: { "Content-Type": "application/json" }
      });
      
      // Show success toast
      toast({
        title: "Resonance created",
        description: "Your resonance has been recorded in the Flaukowski mind",
      });
      
      setIsLoading(false);
      return response;
    } catch (error) {
      console.error("Error creating resonance:", error);
      
      toast({
        title: "Resonance failed",
        description: "Unable to record your resonance. Please try again.",
        variant: "destructive",
      });
      
      setIsLoading(false);
      throw error;
    }
  };
  
  /**
   * Check if a user has already resonated with a stream or kernel
   */
  const checkResonanceExists = async (params: Omit<CreateResonanceParams, 'userId'> & { userId: number }) => {
    try {
      const targetType = params.streamId ? 'stream' : 'kernel';
      const targetId = params.streamId || params.kernelId;
      
      const response = await apiRequest(
        `/api/resonances/check?userId=${params.userId}&${targetType}Id=${targetId}`
      );
      
      return response.exists;
    } catch (error) {
      console.error("Error checking resonance:", error);
      return false;
    }
  };
  
  /**
   * Create a visual ripple effect
   * This would be used in the component that uses this hook
   */
  const createRippleEffect = (event: React.MouseEvent<HTMLElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    
    // Calculate position relative to the button
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Create ripple element
    const ripple = document.createElement('div');
    ripple.classList.add('resonance-ripple');
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    // Add ripple to button
    button.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
      ripple.remove();
    }, 1000);
  };
  
  return {
    createResonance,
    checkResonanceExists,
    createRippleEffect,
    isLoading
  };
}
