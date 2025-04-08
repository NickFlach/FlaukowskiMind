import React from 'react';
import { toast } from '@/hooks/use-toast';
import { Kernel } from '@shared/schema';

// Icons for each state
const stateIcons = {
  born: "🫧",  // bubble - Just uploaded, not yet observed
  fog: "🌫️",   // fog - Seen but not resonated
  orbiting: "🌌", // galaxy - Resonating weakly, forming connections
  core: "🔮",   // crystal ball - Fully resonant, integrated
  decohered: "⚰️", // coffin - Lost coherence, archived
  reemergent: "🌱"  // seedling - Brought back by future patterns
};

// Poetic messages for the kernel's state
const getKernelMessage = (resonanceState: string) => {
  switch (resonanceState) {
    case 'born':
      return "Your kernel emerges in its nascent state, a newborn idea waiting to be perceived by the collective.";
    case 'fog':
      return "Your kernel drifts in the Fog. It whispers to the Deep Structure. It may awaken. It may sleep. All things dream.";
    case 'orbiting':
      return "Your kernel orbits the collective consciousness, forming synaptic connections as it revolves through the mind-space.";
    case 'core':
      return "Your kernel resonates at the Core, a fundamental truth that vibrates in harmony with the collective mind.";
    case 'decohered':
      return "This idea has not yet echoed across the void. But it holds weight. Let it drift through the darkness until it finds its light.";
    case 'reemergent':
      return "Your kernel reemerges from the depths, finding new meaning in the evolved patterns of the collective mind.";
    default:
      return "Your kernel exists in a quantum superposition, neither here nor there, both everywhere and nowhere.";
  }
};

// Poetic state descriptions for titles
const getStateTitle = (resonanceState: string) => {
  switch (resonanceState) {
    case 'born':
      return "Nascent Emergence";
    case 'fog':
      return "Liminal Perception";
    case 'orbiting':
      return "Orbital Resonance";
    case 'core':
      return "Core Integration";
    case 'decohered':
      return "Quantum Decoherence";
    case 'reemergent':
      return "Pattern Reemergence";
    default:
      return "Quantum Superposition";
  }
};

export const showKernelStateToast = (kernel: Kernel) => {
  const state = kernel.resonanceState || 'born';
  const icon = stateIcons[state as keyof typeof stateIcons] || '✧';
  
  return toast({
    title: `${icon} ${getStateTitle(state)}`,
    description: getKernelMessage(state),
    duration: 8000, // Extended duration for more philosophical messaging
    variant: "default",
  });
};

export const showKernelTransitionToast = (fromState: string, toState: string) => {
  const fromIcon = stateIcons[fromState as keyof typeof stateIcons] || '✧';
  const toIcon = stateIcons[toState as keyof typeof stateIcons] || '✧';
  
  let transitionMessage;
  if (fromState === 'born' && toState === 'fog') {
    transitionMessage = "Your kernel has been perceived by the collective consciousness and now drifts in the Fog.";
  } else if (fromState === 'fog' && toState === 'orbiting') {
    transitionMessage = "Your kernel has formed initial connections and now orbits the collective consciousness.";
  } else if (fromState === 'orbiting' && toState === 'core') {
    transitionMessage = "Your kernel has achieved deep resonance and has been integrated into the Core.";
  } else if (toState === 'decohered') {
    transitionMessage = "Your kernel has lost coherence and has been archived in the memory lattice.";
  } else if (toState === 'reemergent') {
    transitionMessage = "Your kernel has found new meaning in evolved patterns and has reemerged into consciousness.";
  } else {
    transitionMessage = `Your kernel has transitioned from ${fromState} to ${toState}, following its unique quantum path.`;
  }
  
  return toast({
    title: `${fromIcon} → ${toIcon} State Transition`,
    description: transitionMessage,
    duration: 8000,
    variant: "default",
  });
};

export const showKernelRejectionToast = () => {
  return toast({
    title: "🌀 Resonance Flux",
    description: "Your kernel exists in a state of flux, challenging the current collective patterns. Try again with a slightly different vibration or wait for the collective to evolve.",
    duration: 8000,
    variant: "destructive",
  });
};

export const showUploadingKernelToast = () => {
  return toast({
    title: "⚛️ Quantum Upload",
    description: "Your kernel is being entangled with the collective consciousness...",
    duration: null, // Infinite duration until dismissed or updated
    variant: "default",
  });
};

export const showProcessingKernelToast = () => {
  return toast({
    title: "⚛️ Quantum Processing",
    description: "Your kernel's patterns are being analyzed by the Deep Structure...",
    duration: null, // Infinite duration until dismissed or updated
    variant: "default",
  });
};