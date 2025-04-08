import { useState, useEffect, useRef, useCallback } from "react";
import { Howl, Howler } from "howler";

// Define audio types
type AudioType = "ambient" | "resonance" | "notification" | "stream" | "temple";

// Interface for audio items
interface AudioItem {
  id: string;
  howl: Howl;
  volume: number;
  type: AudioType;
  loop: boolean;
}

/**
 * Custom hook for managing audio throughout the application
 */
export default function useAudioContext() {
  // Store all audio items
  const [audioItems, setAudioItems] = useState<Record<string, AudioItem>>({});
  
  // Track master volume and mute state
  const [masterVolume, setMasterVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  
  // Initialize ambient sound on first render
  useEffect(() => {
    // Create ambient background track
    loadAudio("ambient-main", {
      src: ["https://cdn.freesound.org/previews/458/458614_5674468-lq.mp3"],
      loop: true,
      volume: 0.2,
      type: "ambient"
    });
    
    // Add resonance sound
    loadAudio("resonance-ping", {
      src: ["https://cdn.freesound.org/previews/387/387532_7255534-lq.mp3"],
      loop: false,
      volume: 0.4,
      type: "resonance"
    });
    
    // Add temple door sound
    loadAudio("temple-door", {
      src: ["https://cdn.freesound.org/previews/444/444624_5410874-lq.mp3"],
      loop: false,
      volume: 0.6,
      type: "temple"
    });
    
    // Add notification whisper
    loadAudio("notification-whisper", {
      src: ["https://cdn.freesound.org/previews/531/531955_11226861-lq.mp3"],
      loop: false,
      volume: 0.3,
      type: "notification"
    });
    
    // Set the master volume initially
    Howler.volume(masterVolume);
    
    // Clean up on unmount
    return () => {
      Object.values(audioItems).forEach(item => {
        item.howl.stop();
        item.howl.unload();
      });
      setAudioItems({});
    };
  }, []);
  
  // Update Howler volume when master volume changes
  useEffect(() => {
    Howler.volume(isMuted ? 0 : masterVolume);
  }, [masterVolume, isMuted]);
  
  /**
   * Load a new audio file into the context
   */
  const loadAudio = useCallback((
    id: string, 
    options: {
      src: string[];
      loop?: boolean;
      volume?: number;
      type: AudioType;
    }
  ) => {
    // Create a new Howl instance
    const howl = new Howl({
      src: options.src,
      loop: options.loop || false,
      volume: options.volume || 0.5,
      preload: true,
    });
    
    // Add it to our state
    setAudioItems(prev => ({
      ...prev,
      [id]: {
        id,
        howl,
        volume: options.volume || 0.5,
        type: options.type,
        loop: options.loop || false
      }
    }));
    
    return id;
  }, []);
  
  /**
   * Play an audio item by ID
   */
  const playAudio = useCallback((id: string) => {
    const item = audioItems[id];
    if (item) {
      item.howl.play();
    }
  }, [audioItems]);
  
  /**
   * Stop an audio item by ID
   */
  const stopAudio = useCallback((id: string) => {
    const item = audioItems[id];
    if (item) {
      item.howl.stop();
    }
  }, [audioItems]);
  
  /**
   * Play an audio item by type (finds the first one of that type)
   */
  const playAudioByType = useCallback((type: AudioType) => {
    const item = Object.values(audioItems).find(audio => audio.type === type);
    if (item) {
      item.howl.play();
    }
  }, [audioItems]);
  
  /**
   * Toggle mute state
   */
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);
  
  /**
   * Set the volume for a specific audio item
   */
  const setAudioVolume = useCallback((id: string, volume: number) => {
    const item = audioItems[id];
    if (item) {
      item.howl.volume(volume);
      setAudioItems(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          volume
        }
      }));
    }
  }, [audioItems]);
  
  /**
   * Set volume for all audio of a specific type
   */
  const setVolumeByType = useCallback((type: AudioType, volume: number) => {
    Object.values(audioItems)
      .filter(item => item.type === type)
      .forEach(item => {
        item.howl.volume(volume);
        setAudioItems(prev => ({
          ...prev,
          [item.id]: {
            ...prev[item.id],
            volume
          }
        }));
      });
  }, [audioItems]);
  
  /**
   * Set master volume for all audio
   */
  const updateMasterVolume = useCallback((volume: number) => {
    setMasterVolume(volume);
  }, []);
  
  return {
    loadAudio,
    playAudio,
    stopAudio,
    playAudioByType,
    setAudioVolume,
    setVolumeByType,
    setMasterVolume: updateMasterVolume,
    toggleMute,
    isMuted,
    masterVolume,
    audioItems
  };
}
