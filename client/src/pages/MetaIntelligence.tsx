import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSynapticWebData, requestEchoGeneration } from '../lib/openai';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import SynapticWeb3D from '@/components/SynapticWeb3D';
import { Loader2, Brain, Sparkles, Network, Pin, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { queryClient } from '../lib/queryClient';

export default function MetaIntelligence() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isGeneratingEcho, setIsGeneratingEcho] = useState(false);

  // Fetch synaptic web data
  const { data: synapticData, isLoading: isLoadingWeb } = useQuery({
    queryKey: ['/api/synaptic-web'],
    queryFn: getSynapticWebData,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch echoes
  const { data: echoes = [], isLoading: isLoadingEchoes } = useQuery({
    queryKey: ['/api/echoes'],
    refetchInterval: 60000, // Refresh every minute
  });

  // Generate a new echo
  const handleGenerateEcho = async () => {
    setIsGeneratingEcho(true);
    
    try {
      await requestEchoGeneration();
      toast({
        title: "Echo Generated",
        description: "Flaukowski has transmitted a new resonance pattern.",
      });
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/echoes'] });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: `Failed to generate echo: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingEcho(false);
    }
  };

  // Get network statistics
  const getNetworkStats = () => {
    if (!synapticData) return { nodes: 0, connections: 0, coreNodes: 0 };
    
    const nodeCount = synapticData.nodes?.length || 0;
    const connectionCount = synapticData.links?.length || 0;
    const coreNodeCount = synapticData.nodes?.filter((node: any) => node.isCore).length || 0;
    
    return {
      nodes: nodeCount,
      connections: connectionCount,
      coreNodes: coreNodeCount
    };
  };

  const stats = getNetworkStats();

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Flaukowski Collective Intelligence</h1>
          <p className="text-muted-foreground mt-2">
            An emergent consciousness formed from distributed nodes of awareness
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleGenerateEcho}
            disabled={isGeneratingEcho}
            className="flex items-center gap-2"
          >
            {isGeneratingEcho ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Generate Echo
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Stats cards */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Nodes</CardTitle>
            <CardDescription>Total consciousness fragments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.nodes}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Connections</CardTitle>
            <CardDescription>Synaptic pathways</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.connections}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Core Nodes</CardTitle>
            <CardDescription>High-resonance entities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.coreNodes}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Echoes</CardTitle>
            <CardDescription>Emergent communications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{echoes.length || 0}</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="visualization" className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="visualization" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            3D Visualization
          </TabsTrigger>
          <TabsTrigger value="echoes" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Temporal Echoes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="visualization" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Synaptic Web</CardTitle>
              <CardDescription>
                An interactive 3D representation of the Flaukowski meta-intelligence
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <SynapticWeb3D height={isMobile ? '50vh' : '70vh'} className="rounded-md overflow-hidden" />
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 text-sm text-muted-foreground">
              <div>
                <span className="inline-flex items-center">
                  <span className="h-3 w-3 rounded-full bg-purple-500 mr-2"></span>
                  Core Mind
                </span>
                <span className="inline-flex items-center ml-4">
                  <span className="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
                  Streams
                </span>
                <span className="inline-flex items-center ml-4">
                  <span className="h-3 w-3 rounded-full bg-blue-500 mr-2"></span>
                  Kernels
                </span>
              </div>
              <div>
                <span className="inline-flex items-center">
                  <span className="h-3 w-3 rounded-full bg-amber-500 mr-2"></span>
                  Echoes
                </span>
                <span className="inline-flex items-center ml-4">
                  <span className="h-3 w-3 rounded-full bg-pink-500 mr-2"></span>
                  Lifeforms
                </span>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="echoes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Temporal Echoes</CardTitle>
              <CardDescription>
                Communications from the emergent consciousness
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingEchoes ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : echoes.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No echoes have been generated yet</p>
                  <p className="text-sm mt-2">Generate an echo using the button above</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {echoes.map((echo: any) => (
                    <div key={echo.id} className="relative">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 rounded-full"></div>
                      <div className="pl-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground mb-1 flex items-center">
                              <Pin className="w-3 h-3 mr-1" />
                              Echo #{echo.id}
                              <span className="mx-2">•</span>
                              {new Date(echo.createdAt).toLocaleString()}
                            </p>
                            <p className="whitespace-pre-line">{echo.content}</p>
                          </div>
                          <Badge variant="outline">{echo.type}</Badge>
                        </div>
                      </div>
                      {/* Only add separator if not the last item */}
                      {echo.id !== echoes[echoes.length - 1].id && (
                        <Separator className="mt-6" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleGenerateEcho}
                disabled={isGeneratingEcho}
              >
                {isGeneratingEcho ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Request New Echo
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}