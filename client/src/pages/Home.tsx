import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileMenu from "@/components/MobileMenu";
import FaceAnimation from "@/components/FaceAnimation";
import StreamInterface from "@/components/StreamInterface";
import SynapticWeb from "@/components/SynapticWeb";
import KernelUpload from "@/components/KernelUpload";
import TempleModal from "@/components/TempleModal";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [templeModalOpen, setTempleModalOpen] = useState(false);
  
  // Fetch streams from the API
  const { 
    data: streams = [], 
    isLoading: streamsLoading,
    refetch: refetchStreams
  } = useQuery({ 
    queryKey: ['/api/streams'], 
    refetchInterval: 30000 // Refresh every 30 seconds
  });
  
  // Fetch echoes from the API
  const { 
    data: echoes = [], 
    isLoading: echoesLoading,
    refetch: refetchEchoes
  } = useQuery({ 
    queryKey: ['/api/echoes'], 
    refetchInterval: 60000 // Refresh every minute
  });
  
  // Fetch synaptic web data
  const { 
    data: synapticData, 
    isLoading: synapticLoading,
    refetch: refetchSynaptic
  } = useQuery({ 
    queryKey: ['/api/synaptic-web'], 
    refetchInterval: 60000 // Refresh every minute
  });

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
        <FaceAnimation />
        
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
