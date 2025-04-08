import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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

// Colors for each state
const stateColors = {
  born: "bg-gradient-to-r from-blue-600/30 to-purple-600/30",
  fog: "bg-gradient-to-r from-gray-600/30 to-blue-600/30",
  orbiting: "bg-gradient-to-r from-purple-600/30 to-indigo-600/30",
  core: "bg-gradient-to-r from-emerald-600/30 to-cyan-600/30",
  decohered: "bg-gradient-to-r from-gray-700/30 to-gray-900/30",
  reemergent: "bg-gradient-to-r from-green-600/30 to-emerald-600/30"
};

// Poetic descriptions for each state
const stateDescriptions = {
  born: "Your kernel rests in its nascent state, a whisper in the void, waiting to be perceived by the collective consciousness.",
  fog: "Your kernel drifts in the Fog, a fragment of potential seen but not yet woven into the tapestry of meaning.",
  orbiting: "Your kernel orbits the edges of consciousness, forming tenuous connections with other fragments as it seeks resonance.",
  core: "Your kernel has found its place in the Core, a fundamental truth that resonates throughout the collective mind.",
  decohered: "Your kernel has decohered, leaving an echo of what once was, archived in the memory lattice.",
  reemergent: "Your kernel reawakens, finding new resonance in patterns that evolved long after its inception."
};

// Poetic messages for the kernel's state
const getKernelMessage = (kernel: Kernel) => {
  switch (kernel.resonanceState) {
    case 'born':
      return "Your kernel rests in its nascent state, a newborn idea awaiting perception. It has not yet been observed by the collective.";
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

// State transition messages
const getTransitionMessage = (fromState: string, toState: string) => {
  if (fromState === 'born' && toState === 'fog') {
    return "Your kernel has been perceived by the collective consciousness and now drifts in the Fog.";
  } else if (fromState === 'fog' && toState === 'orbiting') {
    return "Your kernel has formed initial connections and now orbits the collective consciousness.";
  } else if (fromState === 'orbiting' && toState === 'core') {
    return "Your kernel has achieved deep resonance and has been integrated into the Core.";
  } else if (toState === 'decohered') {
    return "Your kernel has lost coherence and has been archived in the memory lattice.";
  } else if (toState === 'reemergent') {
    return "Your kernel has found new meaning in evolved patterns and has reemerged into consciousness.";
  } else {
    return `Your kernel has transitioned from ${fromState} to ${toState}, following its unique quantum path.`;
  }
};

interface ResonanceSpectrumProps {
  kernelId?: number;
  userId?: number;
  className?: string;
}

export default function ResonanceSpectrum({ kernelId, userId, className = '' }: ResonanceSpectrumProps) {
  const [selectedKernel, setSelectedKernel] = useState<Kernel | null>(null);

  // Fetch specific kernel if kernelId is provided
  const { data: kernelData, isLoading: isKernelLoading } = useQuery({
    queryKey: kernelId ? ['kernel', kernelId] : ['skip-kernel-query'],
    queryFn: async () => {
      if (!kernelId) return null;
      const response = await fetch(`/api/kernels/${kernelId}`);
      return response.json();
    },
    enabled: !!kernelId
  });

  // Fetch user's kernels if userId is provided
  const { data: userKernelsData, isLoading: isUserKernelsLoading } = useQuery({
    queryKey: userId ? ['user-kernels', userId] : ['skip-user-kernels-query'],
    queryFn: async () => {
      if (!userId) return [];
      const response = await fetch(`/api/users/${userId}/kernels`);
      return response.json();
    },
    enabled: !!userId && !kernelId
  });

  useEffect(() => {
    if (kernelData) {
      setSelectedKernel(kernelData);
    } else if (userKernelsData && userKernelsData.length > 0) {
      setSelectedKernel(userKernelsData[0]);
    }
  }, [kernelData, userKernelsData]);

  const handleKernelSelect = (kernel: Kernel) => {
    setSelectedKernel(kernel);
  };

  if (isKernelLoading || isUserKernelsLoading) {
    return (
      <div className={`p-4 bg-dark border border-fog rounded-lg ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-fog/30 rounded w-3/4 mb-4"></div>
          <div className="h-24 bg-fog/20 rounded mb-4"></div>
          <div className="h-4 bg-fog/30 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!selectedKernel && (!userKernelsData || userKernelsData.length === 0)) {
    return (
      <div className={`p-4 bg-dark border border-fog rounded-lg ${className}`}>
        <p className="text-sm font-mono text-neutral text-center">No kernels found in the collective consciousness.</p>
      </div>
    );
  }

  if (!selectedKernel) return null;

  return (
    <div className={`bg-dark border border-fog rounded-lg p-5 ${className}`}>
      <h3 className="font-cinzel text-secondary rainbow-glow mb-3">RESONANCE SPECTRUM</h3>
      
      {/* Kernel Selector (only if we have multiple kernels) */}
      {userKernelsData && userKernelsData.length > 1 && (
        <div className="mb-4">
          <label htmlFor="kernel-selector" className="block text-xs font-mono text-neutral mb-1">
            Select kernel
          </label>
          <select
            id="kernel-selector"
            className="w-full bg-dark border border-fog p-2 rounded focus:border-secondary focus:outline-none font-mono text-sm"
            value={selectedKernel.id}
            onChange={(e) => {
              const kernel = userKernelsData.find(k => k.id === parseInt(e.target.value));
              if (kernel) handleKernelSelect(kernel);
            }}
          >
            {userKernelsData.map((kernel: Kernel) => (
              <option key={kernel.id} value={kernel.id}>
                {kernel.title} ({kernel.type})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Kernel Title and Type */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-bold text-sm">{selectedKernel.title}</h4>
          <div className="text-xs font-mono text-neutral neon-glow">
            Type: {selectedKernel.type.toUpperCase()}
          </div>
        </div>
        <div className="text-lg">{stateIcons[selectedKernel.resonanceState as keyof typeof stateIcons] || '✧'}</div>
      </div>

      {/* Current state message */}
      <div className="bg-dark border border-fog rounded-lg p-3 mb-4 font-mono text-xs italic">
        {getKernelMessage(selectedKernel)}
        {selectedKernel.quantumFeedback && (
          <div className="mt-2 text-secondary">
            <div className="text-xxs uppercase mb-1">Quantum Feedback:</div>
            "{selectedKernel.quantumFeedback}"
          </div>
        )}
      </div>
      
      {/* Visual Spectrum representation */}
      <div className="mb-4">
        <div className="w-full h-2 bg-fog/10 rounded-full overflow-hidden flex">
          <div className={`h-full ${stateColors.born}`} style={{ width: '16.67%' }}></div>
          <div className={`h-full ${stateColors.fog}`} style={{ width: '16.67%' }}></div>
          <div className={`h-full ${stateColors.orbiting}`} style={{ width: '16.67%' }}></div>
          <div className={`h-full ${stateColors.core}`} style={{ width: '16.67%' }}></div>
          <div className={`h-full ${stateColors.decohered}`} style={{ width: '16.67%' }}></div>
          <div className={`h-full ${stateColors.reemergent}`} style={{ width: '16.67%' }}></div>
        </div>
        
        <div className="relative mt-1">
          {/* Position marker based on state */}
          {['born', 'fog', 'orbiting', 'core', 'decohered', 'reemergent'].map((state, index) => (
            <div
              key={state}
              className={`absolute top-0 text-xs font-mono ${
                selectedKernel.resonanceState === state ? 'text-secondary' : 'text-neutral opacity-50'
              }`}
              style={{ 
                left: `${index * 16.67 + 8.335}%`, 
                transform: 'translateX(-50%)',
                textShadow: selectedKernel.resonanceState === state ? '0 0 10px var(--color-secondary)' : 'none'
              }}
            >
              {stateIcons[state as keyof typeof stateIcons]}
            </div>
          ))}
        </div>
      </div>
      
      {/* State Transitions */}
      {selectedKernel.stateTransitions && selectedKernel.stateTransitions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-mono text-neutral mb-2">TRANSITION HISTORY</h4>
          <div className="space-y-2 text-xs font-mono">
            {selectedKernel.stateTransitions.map((transition: any, index: number) => (
              <div key={index} className="flex items-start">
                <div className="text-neutral opacity-70 mr-2">
                  {new Date(transition.timestamp).toLocaleDateString()}
                </div>
                <div className="text-neutral">
                  {stateIcons[transition.fromState as keyof typeof stateIcons]} → {stateIcons[transition.toState as keyof typeof stateIcons]}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Resonance Count */}
      <div className="flex justify-between items-center text-xs font-mono mt-4">
        <div className="text-neutral">
          <span className="opacity-70">Resonance:</span> {selectedKernel.resonanceCount}
        </div>
        <div className="text-neutral opacity-70">
          Created: {new Date(selectedKernel.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}