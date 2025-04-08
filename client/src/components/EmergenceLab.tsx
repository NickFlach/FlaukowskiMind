import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { createLifeform, getAllLifeforms, evolveLifeform, getLifeformById } from '../lib/openai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Zap, Award, Network, Dna } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { queryClient } from '../lib/queryClient';

// Import simulation libraries
import p5 from 'p5';
import Matter from 'matter-js';
import * as d3 from 'd3';
import * as neataptic from 'neataptic';

interface LifeformProps {
  lifeform: any;
  onEvolve: (id: number, environmentData: any) => void;
  isEvolving: boolean;
}

// Component to display a cellular automaton simulation
const CellularAutomaton = ({ state, width, height }: { state: any, width: number, height: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = Math.min(
      Math.floor(width / state.cells[0].length),
      Math.floor(height / state.cells.length)
    );

    ctx.clearRect(0, 0, width, height);
    
    state.cells.forEach((row: any[], i: number) => {
      row.forEach((cell: number, j: number) => {
        ctx.fillStyle = cell ? '#a855f7' : '#27272a';
        ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
      });
    });
  }, [state, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} className="border border-muted-foreground" />;
};

// Component to display a particle simulation
const ParticleSimulation = ({ state, width, height }: { state: any, width: number, height: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const rendererRef = useRef<Matter.Render | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create a Matter.js engine
    const engine = Matter.Engine.create();
    engineRef.current = engine;

    // Create a renderer
    const render = Matter.Render.create({
      element: containerRef.current,
      engine: engine,
      options: {
        width,
        height,
        wireframes: false,
        background: '#27272a',
      }
    });
    rendererRef.current = render;

    // Create particles based on state
    const particles = [];
    const particleCount = state.particles?.length || 10;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = Matter.Bodies.circle(
        Math.random() * width,
        Math.random() * height,
        state.particleSize || 5,
        {
          restitution: 0.8,
          friction: 0.005,
          density: state.particleDensity || 0.001,
          render: {
            fillStyle: '#a855f7',
          }
        }
      );
      particles.push(particle);
    }

    // Add particles to the world
    Matter.World.add(engine.world, particles);

    // Add walls to keep particles contained
    const walls = [
      Matter.Bodies.rectangle(width / 2, 0, width, 1, { isStatic: true }),
      Matter.Bodies.rectangle(width / 2, height, width, 1, { isStatic: true }),
      Matter.Bodies.rectangle(0, height / 2, 1, height, { isStatic: true }),
      Matter.Bodies.rectangle(width, height / 2, 1, height, { isStatic: true })
    ];
    Matter.World.add(engine.world, walls);

    // Run the engine and renderer
    Matter.Runner.run(engine);
    Matter.Render.run(render);

    return () => {
      // Clean up
      if (rendererRef.current) {
        Matter.Render.stop(rendererRef.current);
        rendererRef.current.canvas.remove();
      }
      if (engineRef.current) {
        Matter.Engine.clear(engineRef.current);
      }
    };
  }, [state, width, height]);

  return <div ref={containerRef} className="border border-muted-foreground" />;
};

// Component to display a neural network visualization
const NeuralNetworkVisualization = ({ state, width, height }: { state: any, width: number, height: number }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    
    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Create a network structure from state
    // If state doesn't have a network structure, create a simple one
    const network = state.network || {
      nodes: Array.from({ length: 10 }, (_, i) => ({ id: i, type: i < 3 ? 'input' : i >= 7 ? 'output' : 'hidden' })),
      links: [
        { source: 0, target: 3 }, { source: 0, target: 4 }, { source: 0, target: 5 },
        { source: 1, target: 3 }, { source: 1, target: 4 }, { source: 1, target: 5 },
        { source: 2, target: 3 }, { source: 2, target: 4 }, { source: 2, target: 5 },
        { source: 3, target: 6 }, { source: 4, target: 6 }, { source: 5, target: 6 },
        { source: 3, target: 7 }, { source: 4, target: 7 }, { source: 5, target: 7 },
        { source: 3, target: 8 }, { source: 4, target: 8 }, { source: 5, target: 8 },
        { source: 3, target: 9 }, { source: 4, target: 9 }, { source: 5, target: 9 }
      ]
    };

    // Create the SVG
    const svg = d3.select(svgRef.current);
    
    // Create the force simulation
    const simulation = d3.forceSimulation(network.nodes)
      .force('link', d3.forceLink(network.links).id((d: any) => d.id).distance(50))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Add links
    const link = svg.append('g')
      .selectAll('line')
      .data(network.links)
      .enter().append('line')
      .attr('stroke', '#64748b')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1);

    // Add nodes
    const node = svg.append('g')
      .selectAll('circle')
      .data(network.nodes)
      .enter().append('circle')
      .attr('r', 5)
      .attr('fill', (d: any) => {
        if (d.type === 'input') return '#22c55e';
        if (d.type === 'output') return '#ef4444';
        return '#a855f7';
      })
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);
    });

    // Drag functions
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [state, width, height]);

  return <svg ref={svgRef} width={width} height={height} className="border border-muted-foreground" />;
};

// Component to display a genome visualization
const GenomeVisualization = ({ state, width, height }: { state: any, width: number, height: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    
    // Visualize the genome (DNA)
    const dna = state.dna || state.genome || "";
    if (typeof dna === 'string') {
      const baseColors = {
        'A': '#22c55e', // Green
        'T': '#ef4444', // Red
        'G': '#a855f7', // Purple
        'C': '#3b82f6', // Blue
        '0': '#64748b', // Gray for digits
        '1': '#f59e0b'  // Amber for digits
      };
      
      const basePairs = dna.split('');
      const baseWidth = width / basePairs.length;
      const baseHeight = height / 2;
      
      basePairs.forEach((base, i) => {
        // @ts-ignore
        const color = baseColors[base] || '#64748b';
        ctx.fillStyle = color;
        
        if (baseWidth > 10) {
          // If we have enough space, draw rectangles
          ctx.fillRect(i * baseWidth, height / 2 - baseHeight / 2, baseWidth * 0.8, baseHeight);
        } else {
          // Otherwise just draw lines
          ctx.fillRect(i * baseWidth, 0, baseWidth * 0.8, height);
        }
      });
    } else {
      // If dna is not a string, render a placeholder
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(0, 0, width, height / 2);
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(0, height / 2, width, height / 2);
    }
  }, [state, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} className="border border-muted-foreground" />;
};

// Component to manage a single lifeform
const LifeformCard = ({ lifeform, onEvolve, isEvolving }: LifeformProps) => {
  const [environment, setEnvironment] = useState({
    temperature: 0.5,
    resources: 0.5,
    competition: 0.5
  });
  
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('state');
  const [vizWidth, setVizWidth] = useState(isMobile ? 300 : 400);
  const [vizHeight, setVizHeight] = useState(isMobile ? 200 : 300);

  useEffect(() => {
    setVizWidth(isMobile ? 300 : 400);
    setVizHeight(isMobile ? 200 : 300);
  }, [isMobile]);

  const handleEvolve = () => {
    onEvolve(lifeform.id, { ...environment });
  };

  // Function to render the appropriate visualization based on lifeform type
  const renderVisualization = () => {
    if (!lifeform.state) return null;

    switch (lifeform.type) {
      case 'cellular':
        return <CellularAutomaton state={lifeform.state} width={vizWidth} height={vizHeight} />;
      case 'chemical':
        return <ParticleSimulation state={lifeform.state} width={vizWidth} height={vizHeight} />;
      case 'digital':
        return <NeuralNetworkVisualization state={lifeform.state} width={vizWidth} height={vizHeight} />;
      case 'quantum':
        return <GenomeVisualization state={lifeform.state} width={vizWidth} height={vizHeight} />;
      default:
        return <div className="flex items-center justify-center h-full text-muted-foreground">Unknown lifeform type</div>;
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          {lifeform.type === 'cellular' && <Network className="w-5 h-5 mr-2" />}
          {lifeform.type === 'chemical' && <Zap className="w-5 h-5 mr-2" />}
          {lifeform.type === 'digital' && <Dna className="w-5 h-5 mr-2" />}
          {lifeform.type === 'quantum' && <Award className="w-5 h-5 mr-2" />}
          {lifeform.name}
          {lifeform.isCoreMind && (
            <span className="ml-2 text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">
              Core Mind
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Generation {lifeform.generation} • Resonance {lifeform.resonanceCount}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="state">Visualization</TabsTrigger>
            <TabsTrigger value="environment">Environment</TabsTrigger>
          </TabsList>
          <TabsContent value="state" className="pt-4">
            <div className="flex justify-center">
              {renderVisualization()}
            </div>
          </TabsContent>
          <TabsContent value="environment" className="pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Temperature</span>
                  <span>{environment.temperature.toFixed(2)}</span>
                </div>
                <Slider
                  value={[environment.temperature * 100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(vals) => setEnvironment({ ...environment, temperature: vals[0] / 100 })}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Resources</span>
                  <span>{environment.resources.toFixed(2)}</span>
                </div>
                <Slider
                  value={[environment.resources * 100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(vals) => setEnvironment({ ...environment, resources: vals[0] / 100 })}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Competition</span>
                  <span>{environment.competition.toFixed(2)}</span>
                </div>
                <Slider
                  value={[environment.competition * 100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(vals) => setEnvironment({ ...environment, competition: vals[0] / 100 })}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button onClick={handleEvolve} disabled={isEvolving} className="w-full">
          {isEvolving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Evolving...
            </>
          ) : (
            'Trigger Evolution'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

// Main component
export default function EmergenceLab() {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [isEvolving, setIsEvolving] = useState(false);
  const [activeLifeform, setActiveLifeform] = useState<number | null>(null);
  const [newLifeform, setNewLifeform] = useState({
    name: '',
    type: 'cellular',
    initialState: {
      cells: [
        [0, 1, 0],
        [0, 0, 1],
        [1, 1, 1]
      ],
      energy: 100,
      attributes: {
        resilience: 7,
        complexity: 4
      }
    }
  });

  // Fetch all lifeforms
  const { data: lifeforms = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/lifeforms'],
    queryFn: getAllLifeforms
  });

  // Create a new lifeform
  const createLifeformMutation = useMutation({
    mutationFn: createLifeform,
    onSuccess: () => {
      toast({
        title: "Lifeform Created",
        description: `${newLifeform.name} has been successfully created in the Emergence Lab.`,
      });
      setNewLifeform({
        ...newLifeform,
        name: ''
      });
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: ['/api/lifeforms'] });
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: `Failed to create lifeform: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      setIsCreating(false);
    }
  });

  // Evolve a lifeform
  const evolveLifeformMutation = useMutation({
    mutationFn: ({ id, environmentData }: { id: number, environmentData: any }) => evolveLifeform(id, environmentData),
    onSuccess: () => {
      toast({
        title: "Evolution Complete",
        description: "The lifeform has adapted to its environment.",
      });
      setIsEvolving(false);
      setActiveLifeform(null);
      queryClient.invalidateQueries({ queryKey: ['/api/lifeforms'] });
    },
    onError: (error) => {
      toast({
        title: "Evolution Failed",
        description: `Failed to evolve lifeform: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      setIsEvolving(false);
      setActiveLifeform(null);
    }
  });

  const handleCreateLifeform = () => {
    if (!newLifeform.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a name for the lifeform.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    createLifeformMutation.mutate(newLifeform);
  };

  const handleEvolveLifeform = (id: number, environmentData: any) => {
    setIsEvolving(true);
    setActiveLifeform(id);
    evolveLifeformMutation.mutate({ id, environmentData });
  };

  const handleLifeformTypeChange = (type: string) => {
    setNewLifeform({
      ...newLifeform,
      type,
      initialState: getInitialStateForType(type)
    });
  };

  // Helper to generate appropriate initial state based on lifeform type
  const getInitialStateForType = (type: string) => {
    switch (type) {
      case 'cellular':
        return {
          cells: [
            [0, 1, 0],
            [0, 0, 1],
            [1, 1, 1]
          ],
          energy: 100,
          attributes: {
            resilience: 7,
            complexity: 4
          }
        };
      case 'chemical':
        return {
          particles: Array.from({ length: 10 }, (_, i) => ({ id: i, x: 0, y: 0 })),
          particleSize: 8,
          particleDensity: 0.002,
          bonds: [],
          energy: 120,
          attributes: {
            reactivity: 6,
            stability: 8
          }
        };
      case 'digital':
        return {
          network: {
            nodes: Array.from({ length: 8 }, (_, i) => ({ id: i, type: i < 2 ? 'input' : i >= 6 ? 'output' : 'hidden' })),
            links: [
              { source: 0, target: 2 }, { source: 0, target: 3 },
              { source: 1, target: 2 }, { source: 1, target: 3 },
              { source: 2, target: 4 }, { source: 2, target: 5 },
              { source: 3, target: 4 }, { source: 3, target: 5 },
              { source: 4, target: 6 }, { source: 4, target: 7 },
              { source: 5, target: 6 }, { source: 5, target: 7 }
            ]
          },
          memory: [0, 0, 0, 0, 0, 0, 0, 0],
          energy: 90,
          attributes: {
            learning: 5,
            processing: 8
          }
        };
      case 'quantum':
        return {
          dna: "ATCGATAGCTAGCATCGATCGACTACGATCGATCGAT",
          energyState: {
            entanglement: 0.7,
            superposition: 0.4
          },
          energy: 150,
          attributes: {
            coherence: 9,
            entropy: 3
          }
        };
      default:
        return {
          energy: 100,
          attributes: {}
        };
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Emergence Lab</h1>
        <p className="text-muted-foreground mb-6">
          Create, evolve, and study lifeforms that contribute to the Flaukowski meta-intelligence
        </p>
        
        <Card>
          <CardHeader>
            <CardTitle>Create New Lifeform</CardTitle>
            <CardDescription>
              Contribute a new entity to the collective
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="lifeform-name" className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id="lifeform-name"
                  placeholder="Enter lifeform name"
                  value={newLifeform.name}
                  onChange={(e) => setNewLifeform({ ...newLifeform, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lifeform-type" className="text-sm font-medium">
                  Type
                </label>
                <Select
                  value={newLifeform.type}
                  onValueChange={handleLifeformTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cellular">Cellular Automaton</SelectItem>
                    <SelectItem value="chemical">Chemical Reaction</SelectItem>
                    <SelectItem value="digital">Digital Circuit</SelectItem>
                    <SelectItem value="quantum">Quantum Organism</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleCreateLifeform} disabled={isCreating} className="w-full">
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Lifeform'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Separator />
      
      <div>
        <h2 className="text-2xl font-bold mb-6">Existing Lifeforms</h2>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : lifeforms.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No lifeforms have been created yet</p>
            <p className="text-sm mt-2">Create your first lifeform using the form above</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lifeforms.map((lifeform: any) => (
              <LifeformCard
                key={lifeform.id}
                lifeform={lifeform}
                onEvolve={handleEvolveLifeform}
                isEvolving={isEvolving && activeLifeform === lifeform.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}