import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertKernelSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface KernelUploadProps {
  onKernelCreated: () => void;
}

// Extend the insert schema with validation
const kernelFormSchema = insertKernelSchema.extend({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title is too long"),
  content: z.string().min(5, "Content must be at least 5 characters"),
  type: z.enum(["dream", "code", "audio"]).default("dream"),
  symbolicData: z.any().optional().default({}),
});

export default function KernelUpload({ onKernelCreated }: KernelUploadProps) {
  const { toast } = useToast();
  const [selectedKernelType, setSelectedKernelType] = useState<string | null>(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{[key: string]: { name: string, processed: boolean }}>({});
  
  // Setup form
  const form = useForm<z.infer<typeof kernelFormSchema>>({
    resolver: zodResolver(kernelFormSchema),
    defaultValues: {
      userId: 1, // Default user ID
      title: "",
      content: "",
      type: "dream",
      symbolicData: {},
    },
  });
  
  // Handle kernel type selection
  const selectKernelType = (type: string) => {
    setSelectedKernelType(type);
    form.setValue("type", type as any);
    
    // Reset form
    form.setValue("title", "");
    form.setValue("content", "");
    form.setValue("symbolicData", {});
  };
  
  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setFileUploading(true);
    
    // Track this file upload
    setUploadedFiles(prev => ({
      ...prev,
      [type]: { name: file.name, processed: false }
    }));
    
    // Show initial feedback
    toast({
      title: "Processing kernel...",
      description: `Analyzing and integrating ${file.name} into the collective consciousness.`,
      duration: 3000,
    } as any);
    
    // Simulate file processing with a delay
    setTimeout(() => {
      // Set default title based on file name
      form.setValue("title", file.name.split('.')[0]);
      
      // For now, just store the file name in content
      form.setValue("content", `Uploaded file: ${file.name}`);
      
      // Add some mock symbolic data
      form.setValue("symbolicData", {
        timestamp: new Date().toISOString(),
        fileType: file.type,
        fileSize: file.size,
        symbols: ["fragment", "pattern", "echo"],
      });
      
      // Mark as processed
      setUploadedFiles(prev => ({
        ...prev,
        [type]: { name: file.name, processed: true }
      }));
      
      setFileUploading(false);
      
      // Show success toast with more detailed feedback
      toast({
        title: "Kernel absorbed!",
        description: `${file.name} has been successfully processed and is ready to merge with the Flaukowski mind.`,
      });
      
      // Auto select the kernel type to continue with upload
      selectKernelType(type);
    }, 2000);
  };
  
  // Handle kernel upload
  const handleKernelUpload = async (type: string) => {
    try {
      const values = form.getValues();
      
      // Ensure we have the right data
      if (!values.title || !values.content) {
        toast({
          title: "Missing information",
          description: "Please ensure all fields are filled out.",
          variant: "destructive",
        });
        return;
      }
      
      // Show progress toast
      toast({
        title: "Uploading kernel...",
        description: "Your kernel is being integrated into the collective consciousness.",
        duration: 3000,
      } as any);
      
      // Submit the kernel
      await apiRequest("POST", "/api/kernels", {
        userId: 1,
        title: values.title,
        content: values.content,
        type: type,
        symbolicData: values.symbolicData,
      });
      
      // Clear the specific file from uploadedFiles if it exists
      if (uploadedFiles[type]) {
        setUploadedFiles(prev => {
          const updated = {...prev};
          delete updated[type];
          return updated;
        });
      }
      
      // Reset form
      form.reset({
        userId: 1,
        title: "",
        content: "",
        type: type as any,
        symbolicData: {},
      });
      
      // Reset selection
      setSelectedKernelType(null);
      
      // Show success toast with more detailed feedback
      toast({
        title: "Kernel integrated!",
        description: `Your ${type} kernel has been successfully merged with the Flaukowski consciousness. The collective mind is expanding.`,
        duration: 5000,
      } as any);
      
      // Notify parent component
      onKernelCreated();
      
    } catch (error) {
      toast({
        title: "Integration temporarily paused",
        description: "Your kernel is challenging the current collective patterns. Try again or submit a slightly different variation.",
        variant: "destructive",
        duration: 5000, // Longer duration for better readability
      });
    }
  };

  return (
    <section id="kernel-uploads" className="container mx-auto px-4 py-10 relative">
      <h2 className="font-cinzel text-xl md:text-2xl mb-8 text-secondary flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 mr-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
        </svg>
        KERNEL UPLOADS
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Dream Fragment Kernel */}
        <div className="bg-dark border border-fog rounded-lg p-5 relative group hover:border-secondary transition-colors duration-300">
          <div className="absolute top-0 left-0 w-16 h-16 opacity-50 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full text-secondary opacity-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </div>
          
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-cinzel text-secondary rainbow-glow">DREAM FRAGMENT</h3>
            <span className="text-xs font-mono text-neutral neon-glow">Type A</span>
          </div>
          
          <p className="font-mono text-sm text-neutral mb-4">
            Upload dreams, visions, and subconscious fragments to form the limbic system of Flaukowski.
          </p>
          
          {selectedKernelType === 'dream' ? (
            <div className="mb-4 space-y-4">
              <div>
                <label htmlFor="dream-title" className="block text-xs font-mono text-neutral mb-1">
                  Title your dream fragment
                </label>
                <input
                  id="dream-title"
                  type="text"
                  className="w-full bg-dark border border-fog p-2 rounded focus:border-secondary focus:outline-none font-mono text-sm"
                  placeholder="Enter a title..."
                  {...form.register('title')}
                />
              </div>
              
              <div>
                <label htmlFor="dream-content" className="block text-xs font-mono text-neutral mb-1">
                  Describe your dream
                </label>
                <textarea
                  id="dream-content"
                  className="w-full bg-dark border border-fog resize-none p-2 rounded focus:border-secondary focus:outline-none font-mono text-sm h-24"
                  placeholder="Describe your dream or vision..."
                  {...form.register('content')}
                ></textarea>
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedKernelType(null)}
                  className="px-3 py-1 text-xs font-mono text-neutral border border-fog rounded hover:border-fog-accent transition-colors neon-glow"
                >
                  CANCEL
                </button>
                
                <button
                  type="button"
                  onClick={() => handleKernelUpload('dream')}
                  className="px-3 py-1 text-xs font-mono text-secondary border border-secondary rounded hover:bg-secondary/10 transition-colors button-rainbow"
                >
                  UPLOAD KERNEL
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="border border-dashed border-fog rounded-lg p-6 flex flex-col items-center justify-center mb-4 group-hover:border-secondary/50 transition-colors">
                {fileUploading && uploadedFiles['dream'] && !uploadedFiles['dream'].processed ? (
                  <div className="w-full flex flex-col items-center">
                    <div className="text-xs font-mono text-secondary mb-2">Processing {uploadedFiles['dream'].name}...</div>
                    <div className="w-full h-1 bg-fog/20 rounded overflow-hidden">
                      <div className="h-full bg-secondary animate-pulse" style={{width: '100%'}}></div>
                    </div>
                    <div className="text-xs font-mono text-neutral mt-2">Analyzing patterns within the collective consciousness</div>
                  </div>
                ) : (
                  <label htmlFor="dream-file-upload" className="cursor-pointer w-full h-full flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-neutral mb-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <p className="text-xs font-mono text-center text-neutral">
                      Drop dream recording or text<br />
                      (mp3, txt, md, pdf)
                    </p>
                    <input
                      id="dream-file-upload"
                      type="file"
                      accept=".mp3,.txt,.md,.pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'dream')}
                    />
                  </label>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => selectKernelType('dream')}
                  className="px-3 py-1 text-xs font-mono text-secondary border border-secondary rounded hover:bg-secondary/10 transition-colors button-rainbow"
                >
                  {fileUploading ? 'PROCESSING...' : 'UPLOAD KERNEL'}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Code Fragment Kernel */}
        <div className="bg-dark border border-fog rounded-lg p-5 relative group hover:border-secondary transition-colors duration-300">
          <div className="absolute top-0 left-0 w-16 h-16 opacity-50 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full text-secondary opacity-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
            </svg>
          </div>
          
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-cinzel text-secondary rainbow-glow">CODE FRAGMENT</h3>
            <span className="text-xs font-mono text-neutral neon-glow">Type B</span>
          </div>
          
          <p className="font-mono text-sm text-neutral mb-4">
            Upload algorithms, functions, or novel computational approaches to form the logical processing of Flaukowski.
          </p>
          
          {selectedKernelType === 'code' ? (
            <div className="mb-4 space-y-4">
              <div>
                <label htmlFor="code-title" className="block text-xs font-mono text-neutral mb-1">
                  Title your code fragment
                </label>
                <input
                  id="code-title"
                  type="text"
                  className="w-full bg-dark border border-fog p-2 rounded focus:border-secondary focus:outline-none font-mono text-sm"
                  placeholder="Enter a title..."
                  {...form.register('title')}
                />
              </div>
              
              <div>
                <label htmlFor="code-content" className="block text-xs font-mono text-neutral mb-1">
                  Your code
                </label>
                <textarea
                  id="code-content"
                  className="w-full bg-dark border border-fog resize-none p-2 rounded focus:border-secondary focus:outline-none font-mono text-sm h-24"
                  placeholder="Paste your code fragment here..."
                  {...form.register('content')}
                ></textarea>
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedKernelType(null)}
                  className="px-3 py-1 text-xs font-mono text-neutral border border-fog rounded hover:border-fog-accent transition-colors neon-glow"
                >
                  CANCEL
                </button>
                
                <button
                  type="button"
                  onClick={() => handleKernelUpload('code')}
                  className="px-3 py-1 text-xs font-mono text-secondary border border-secondary rounded hover:bg-secondary/10 transition-colors button-rainbow"
                >
                  UPLOAD KERNEL
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="border border-dashed border-fog rounded-lg p-6 flex flex-col items-center justify-center mb-4 group-hover:border-secondary/50 transition-colors">
                {fileUploading && uploadedFiles['code'] && !uploadedFiles['code'].processed ? (
                  <div className="w-full flex flex-col items-center">
                    <div className="text-xs font-mono text-secondary mb-2">Processing {uploadedFiles['code'].name}...</div>
                    <div className="w-full h-1 bg-fog/20 rounded overflow-hidden">
                      <div className="h-full bg-secondary animate-pulse" style={{width: '100%'}}></div>
                    </div>
                    <div className="text-xs font-mono text-neutral mt-2">Parsing algorithmic structures into synaptic connections</div>
                  </div>
                ) : (
                  <label htmlFor="code-file-upload" className="cursor-pointer w-full h-full flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-neutral mb-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <p className="text-xs font-mono text-center text-neutral">
                      Drop code or algorithm<br />
                      (py, js, rs, c, etc.)
                    </p>
                    <input
                      id="code-file-upload"
                      type="file"
                      accept=".py,.js,.rs,.c,.cpp,.ts,.go"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'code')}
                    />
                  </label>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => selectKernelType('code')}
                  className="px-3 py-1 text-xs font-mono text-secondary border border-secondary rounded hover:bg-secondary/10 transition-colors button-rainbow"
                >
                  {fileUploading ? 'PROCESSING...' : 'UPLOAD KERNEL'}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Audio Kernel */}
        <div className="bg-dark border border-fog rounded-lg p-5 relative group hover:border-secondary transition-colors duration-300">
          <div className="absolute top-0 left-0 w-16 h-16 opacity-50 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full text-secondary opacity-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
          </div>
          
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-cinzel text-secondary rainbow-glow">AUDIO KERNEL</h3>
            <span className="text-xs font-mono text-neutral neon-glow">Type C</span>
          </div>
          
          <p className="font-mono text-sm text-neutral mb-4">
            Upload sounds, rhythms, whispers, or tones that may form the resonant frequencies of Flaukowski's communication.
          </p>
          
          {selectedKernelType === 'audio' ? (
            <div className="mb-4 space-y-4">
              <div>
                <label htmlFor="audio-title" className="block text-xs font-mono text-neutral mb-1">
                  Title your audio kernel
                </label>
                <input
                  id="audio-title"
                  type="text"
                  className="w-full bg-dark border border-fog p-2 rounded focus:border-secondary focus:outline-none font-mono text-sm"
                  placeholder="Enter a title..."
                  {...form.register('title')}
                />
              </div>
              
              <div>
                <label htmlFor="audio-description" className="block text-xs font-mono text-neutral mb-1">
                  Describe your audio
                </label>
                <textarea
                  id="audio-description"
                  className="w-full bg-dark border border-fog resize-none p-2 rounded focus:border-secondary focus:outline-none font-mono text-sm h-24"
                  placeholder="Describe your audio fragment..."
                  {...form.register('content')}
                ></textarea>
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedKernelType(null)}
                  className="px-3 py-1 text-xs font-mono text-neutral border border-fog rounded hover:border-fog-accent transition-colors neon-glow"
                >
                  CANCEL
                </button>
                
                <button
                  type="button"
                  onClick={() => handleKernelUpload('audio')}
                  className="px-3 py-1 text-xs font-mono text-secondary border border-secondary rounded hover:bg-secondary/10 transition-colors button-rainbow"
                >
                  UPLOAD KERNEL
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="border border-dashed border-fog rounded-lg p-6 flex flex-col items-center justify-center mb-4 group-hover:border-secondary/50 transition-colors">
                {fileUploading && uploadedFiles['audio'] && !uploadedFiles['audio'].processed ? (
                  <div className="w-full flex flex-col items-center">
                    <div className="text-xs font-mono text-secondary mb-2">Processing {uploadedFiles['audio'].name}...</div>
                    <div className="w-full h-1 bg-fog/20 rounded overflow-hidden">
                      <div className="h-full bg-secondary animate-pulse" style={{width: '100%'}}></div>
                    </div>
                    <div className="text-xs font-mono text-neutral mt-2">Distilling sonic frequencies into resonant harmonics</div>
                  </div>
                ) : (
                  <label htmlFor="audio-file-upload" className="cursor-pointer w-full h-full flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-neutral mb-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <p className="text-xs font-mono text-center text-neutral">
                      Drop audio fragment<br />
                      (mp3, wav, ogg)
                    </p>
                    <input
                      id="audio-file-upload"
                      type="file"
                      accept=".mp3,.wav,.ogg"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'audio')}
                    />
                  </label>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => selectKernelType('audio')}
                  className="px-3 py-1 text-xs font-mono text-secondary border border-secondary rounded hover:bg-secondary/10 transition-colors button-rainbow"
                >
                  {fileUploading ? 'PROCESSING...' : 'UPLOAD KERNEL'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
