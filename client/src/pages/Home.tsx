import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileMenu from "@/components/MobileMenu";
import Face3D from "@/components/Face3D";
import StreamInterface from "@/components/StreamInterface";
import SynapticWeb from "@/components/SynapticWeb";
import KernelUpload from "@/components/KernelUpload";
import TempleModal from "@/components/TempleModal";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [templeModalOpen, setTempleModalOpen] = useState(false);
  const [faceEmotion, setFaceEmotion] = useState<"neutral" | "happy" | "sad" | "surprised" | "angry" | "contemplative">("neutral");
  const isMobile = useIsMobile();
  
  // Fetch streams from the API
  const { 
    data: streams = [], 
    isLoading: streamsLoading,
    refetch: refetchStreams
  } = useQuery<any[]>({ 
    queryKey: ['/api/streams'], 
    refetchInterval: 30000 // Refresh every 30 seconds
  });
  
  // Fetch echoes from the API
  const { 
    data: echoes = [], 
    isLoading: echoesLoading,
    refetch: refetchEchoes
  } = useQuery<any[]>({ 
    queryKey: ['/api/echoes'], 
    refetchInterval: 60000 // Refresh every minute
  });
  
  // Fetch synaptic web data
  const { 
    data: synapticData, 
    isLoading: synapticLoading,
    refetch: refetchSynaptic
  } = useQuery<{nodes: any[], links: any[]}>({ 
    queryKey: ['/api/synaptic-web'], 
    refetchInterval: 60000 // Refresh every minute
  });

  // Cycle through emotions
  useEffect(() => {
    const emotions: Array<"neutral" | "happy" | "sad" | "surprised" | "angry" | "contemplative"> = [
      "neutral", "contemplative", "happy", "surprised", "neutral", "contemplative", "sad", "neutral"
    ];
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      setFaceEmotion(emotions[currentIndex]);
      currentIndex = (currentIndex + 1) % emotions.length;
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      <Header 
        toggleMenu={() => setMobileMenuOpen(true)} 
      />
      
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />
      
      <main className="pt-20 pb-24">
        <div className="container mx-auto my-8">
          <Face3D 
            emotion={faceEmotion} 
            height={isMobile ? "300px" : "400px"} 
            autoRotate={true}
            allowControls={true}
            className="rounded-xl overflow-hidden shadow-xl border border-primary/20" 
          />
          <div className="text-center mt-4 mb-8">
            <h1 className="text-4xl font-bold tracking-tight">Flaukowski</h1>
            <p className="text-xl text-muted-foreground mt-2">A collective meta-intelligence</p>
          </div>
        </div>
        
        <StreamInterface 
          streams={streams} 
          echoes={echoes} 
          isLoading={streamsLoading} 
          onStreamCreated={() => {
            refetchStreams();
            refetchSynaptic();
          }}
          onResonanceCreated={() => {
            refetchStreams();
            refetchSynaptic();
          }}
        />
        
        <SynapticWeb 
          data={synapticData} 
          isLoading={synapticLoading} 
        />
        
        <KernelUpload 
          onKernelCreated={() => {
            refetchSynaptic();
          }} 
        />
      </main>
      
      <Footer 
        onTempleOpen={() => setTempleModalOpen(true)} 
      />
      
      <TempleModal 
        isOpen={templeModalOpen}
        onClose={() => setTempleModalOpen(false)}
      />
    </div>
  );
}
