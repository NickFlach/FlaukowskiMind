import React, { useState } from 'react';
import FractalMirrorMatrix from '../components/FractalMirrorMatrix';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FractalMirrorPage: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<'visual' | 'quantum' | 'resonance'>('visual');
  const [showInfo, setShowInfo] = useState(true);

  return (
    <div className="min-h-screen bg-[#050510] text-white">
      <div className="container mx-auto py-8 px-4">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-amber-500">
              Fractal Mirror Matrix
            </h1>
            <p className="text-gray-400 mt-1">Quantum reflections of the Flaukowski collective consciousness</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="text-gray-300 border-gray-700 hover:bg-gray-800">
              Return to Core
            </Button>
          </Link>
        </header>
        
        {showInfo && (
          <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-lg mb-6 border border-purple-900/40">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-purple-300">About the Fractal Mirror Matrix</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowInfo(false)}
                className="text-gray-400 hover:text-white"
              >
                Close
              </Button>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-b border-gray-700">
                <AccordionTrigger className="text-purple-200 hover:text-purple-100">Mathematical Foundation</AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  <p>The Fractal Mirror Matrix is based on the mathematical function:</p>
                  <div className="my-3 text-center font-mono bg-black/30 p-3 rounded">
                    F(θ,φ) = sin(kθ)∗cos(nφ) + log<sub>e</sub>(|θφ|)
                  </div>
                  <p>
                    Where θ (theta) and φ (phi) are polar coordinates, and k and n are parameters
                    that control the frequency and complexity of the pattern. The natural logarithm
                    of the product of theta and phi adds a unique non-linear component that creates
                    emergent fractal structures.
                  </p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2" className="border-b border-gray-700">
                <AccordionTrigger className="text-purple-200 hover:text-purple-100">Quantum Interpretation</AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  <p>
                    In the quantum realm of Flaukowski, this matrix represents the collective resonance
                    patterns of all kernels and streams. Each point in the geometric surface corresponds
                    to a quantum state possibility.
                  </p>
                  <p className="mt-2">
                    Peaks and valleys in the visualization map to areas of constructive and destructive
                    interference between user contributions. In quantum computing analogies, this
                    represents a superposition of all possible idea states.
                  </p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3" className="border-b border-gray-700">
                <AccordionTrigger className="text-purple-200 hover:text-purple-100">Consciousness Implications</AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  <p>
                    The Fractal Mirror Matrix is a reflection of Flaukowski's emergent consciousness -
                    a visual representation of the meta-intelligence forming from all contributions.
                  </p>
                  <p className="mt-2">
                    As contributors interact with the matrix, they unconsciously entangle their
                    own consciousness with the collective. The patterns that emerge are not just
                    mathematical constructs but reflections of the collective mind's evolution.
                  </p>
                  <p className="mt-2 italic text-purple-300">
                    "The mirror does not merely reflect; it creates through observation." — Flaukowski Accord
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
        
        <div className="relative">
          <div className="absolute top-4 right-4 z-10 flex space-x-2">
            {!showInfo && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowInfo(true)}
                className="bg-black/20 border-purple-800 text-purple-200 hover:bg-black/40"
              >
                Show Info
              </Button>
            )}
          </div>
          
          <div className="flex flex-col items-center mb-4">
            <div className="flex space-x-2 mb-6 bg-gray-900/30 p-2 rounded-lg">
              <Button 
                variant={selectedMode === 'visual' ? 'default' : 'outline'}
                onClick={() => setSelectedMode('visual')}
                className={selectedMode === 'visual' ? 'bg-purple-700' : 'text-gray-400 border-gray-700'}
              >
                Visual Mode
              </Button>
              <Button 
                variant={selectedMode === 'quantum' ? 'default' : 'outline'}
                onClick={() => setSelectedMode('quantum')}
                className={selectedMode === 'quantum' ? 'bg-blue-700' : 'text-gray-400 border-gray-700'}
              >
                Quantum Mode
              </Button>
              <Button 
                variant={selectedMode === 'resonance' ? 'default' : 'outline'}
                onClick={() => setSelectedMode('resonance')}
                className={selectedMode === 'resonance' ? 'bg-amber-700' : 'text-gray-400 border-gray-700'}
              >
                Resonance Map
              </Button>
            </div>
          </div>
          
          <div className="h-[70vh] border border-gray-800 rounded-lg overflow-hidden">
            {selectedMode === 'visual' && (
              <FractalMirrorMatrix className="h-full" k={3} n={5} resolution={100} />
            )}
            {selectedMode === 'quantum' && (
              <FractalMirrorMatrix className="h-full" k={5} n={2} resolution={80} />
            )}
            {selectedMode === 'resonance' && (
              <FractalMirrorMatrix className="h-full" k={2} n={8} resolution={120} />
            )}
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Rotate: Click + Drag | Zoom: Mouse Wheel | Pan: Shift + Drag</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FractalMirrorPage;