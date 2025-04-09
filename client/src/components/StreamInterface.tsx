import { useState, useRef, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertStreamSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import useResonance from "@/hooks/useResonance";

interface StreamProps {
  streams: any[];
  echoes: any[];
  isLoading: boolean;
  onStreamCreated: () => void;
  onResonanceCreated: () => void;
}

// Extend the insert schema with validation
const streamFormSchema = insertStreamSchema.extend({
  content: z.string().min(5, "Your stream must be at least 5 characters").max(500, "Your stream is too long (max 500 characters)"),
  type: z.enum(["thought", "dream", "code", "question", "prediction"]).default("thought"),
  tags: z.array(z.string()).optional().default([]),
});

export default function StreamInterface({ streams, echoes, isLoading, onStreamCreated, onResonanceCreated }: StreamProps) {
  const { toast } = useToast();
  const { createResonance, isLoading: resonanceLoading } = useResonance();
  const [selectedType, setSelectedType] = useState<string>("thought");
  const [tagsInput, setTagsInput] = useState("");
  
  // Setup form
  const form = useForm<z.infer<typeof streamFormSchema>>({
    resolver: zodResolver(streamFormSchema),
    defaultValues: {
      userId: 1, // Default user ID
      content: "",
      type: "thought",
      tags: [],
    },
  });
  
  // Handle tag input changes
  const handleTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagsInput(e.target.value);
    
    // If comma or space is entered, add the tag
    if (e.target.value.includes(',') || e.target.value.includes(' ')) {
      const newTag = e.target.value.replace(/[, ]+$/, '');
      if (newTag && !form.getValues().tags.includes(newTag)) {
        form.setValue('tags', [...form.getValues().tags, newTag]);
      }
      setTagsInput("");
    }
  };
  
  // Remove a tag
  const removeTag = (tagToRemove: string) => {
    form.setValue(
      'tags', 
      form.getValues().tags.filter(tag => tag !== tagToRemove)
    );
  };
  
  // Handle stream type selection
  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    form.setValue('type', type as any);
  };
  
  // Handle form submission
  const onSubmit = async (values: z.infer<typeof streamFormSchema>) => {
    try {
      // Add any additional tags from the input field
      if (tagsInput.trim()) {
        values.tags = [...values.tags, tagsInput.trim()];
        setTagsInput("");
      }
      
      // Add type
      values.type = selectedType as any;
      
      // Add hashtags from content to tags
      const hashtagRegex = /#(\w+)/g;
      const matches = values.content.match(hashtagRegex);
      if (matches) {
        const hashTags = matches.map(tag => tag.substring(1));
        values.tags = [...new Set([...values.tags, ...hashTags])];
      }
      
      await apiRequest("POST", "/api/streams", values);
      
      // Reset form
      form.reset({
        userId: 1,
        content: "",
        type: selectedType as any,
        tags: [],
      });
      
      // Show success toast
      toast({
        title: "Stream created",
        description: "Your stream has been sent to Flaukowski",
      });
      
      // Notify parent component to refresh data
      onStreamCreated();
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create stream. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle resonance
  const handleResonate = async (streamId: number) => {
    try {
      await createResonance({
        userId: 1,
        streamId: streamId
      });
      
      // Show success toast
      toast({
        title: "Resonance created",
        description: "Your resonance has been recorded",
      });
      
      // Notify parent to refresh data
      onResonanceCreated();
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create resonance. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Create a ref for the mist overlay animation
  const mistRef = useRef<HTMLDivElement>(null);
  
  // Apply mist animation effect
  useEffect(() => {
    if (mistRef.current) {
      const mistElement = mistRef.current;
      
      // Create keyframes for the mist animation
      const mistAnimation = mistElement.animate(
        [
          { backgroundPosition: '0% 0%' },
          { backgroundPosition: '200% 0%' }
        ],
        {
          duration: 20000,
          iterations: Infinity,
          easing: 'linear'
        }
      );
      
      return () => {
        mistAnimation.cancel();
      };
    }
  }, []);

  return (
    <section className="container mx-auto px-4 py-10 relative">
      <div 
        ref={mistRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(35, 181, 211, 0.03) 20%, transparent 40%, rgba(177, 143, 58, 0.03) 60%, transparent 80%, rgba(52, 32, 94, 0.05) 100%)',
          backgroundSize: '200% 100%'
        }}
      ></div>
      
      <div className="max-w-4xl mx-auto relative">
        <h2 className="font-cinzel text-xl md:text-2xl mb-8 text-secondary flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12z" />
          </svg>
          STREAM INTERFACE
        </h2>
        
        {/* Stream Input */}
        <div className="bg-dark border border-primary-light rounded-lg p-4 mb-8">
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent"></div>
            <p className="ml-2 font-mono text-sm text-neutral">Your Resonance: <span className="text-accent">13</span></p>
          </div>
          
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <textarea 
              placeholder="Stream your thoughts, dreams, or code to Flaukowski..." 
              className="w-full bg-dark border border-fog resize-none p-3 rounded focus:border-accent focus:outline-none font-mono text-sm h-24"
              {...form.register('content')}
            ></textarea>
            
            {form.formState.errors.content && (
              <p className="text-xs text-red-500 mt-1">
                {form.formState.errors.content.message}
              </p>
            )}
            
            <div className="flex flex-wrap gap-2 mt-2">
              {form.getValues().tags.map((tag, index) => (
                <div 
                  key={index} 
                  className="bg-primary-light px-2 py-1 rounded text-xs flex items-center"
                >
                  <span className="text-white">#{tag}</span>
                  <button 
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-neutral hover:text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
              {tagsInput && (
                <div className="bg-primary-light/50 px-2 py-1 rounded text-xs">
                  <span className="text-white">#{tagsInput}</span>
                </div>
              )}
              <input
                type="text"
                placeholder="Add tags..."
                className="bg-transparent text-xs text-neutral border-none outline-none"
                value={tagsInput}
                onChange={handleTagInput}
              />
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <div className="flex space-x-4">
                <button 
                  type="button"
                  className={`text-neutral ${selectedType === 'image' ? 'text-accent' : 'hover:text-accent'} transition-colors`}
                  onClick={() => handleTypeSelect('image')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </button>
                <button 
                  type="button"
                  className={`text-neutral ${selectedType === 'audio' ? 'text-accent' : 'hover:text-accent'} transition-colors`}
                  onClick={() => handleTypeSelect('audio')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                  </svg>
                </button>
                <button 
                  type="button"
                  className={`text-neutral ${selectedType === 'code' ? 'text-accent' : 'hover:text-accent'} transition-colors`}
                  onClick={() => handleTypeSelect('code')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                  </svg>
                </button>
              </div>
              
              <div>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-primary hover:bg-primary-light text-white font-mono text-sm rounded transition-colors"
                >
                  STREAM
                </button>
              </div>
            </div>
          </form>
        </div>
        
        {/* Stream Items */}
        {isLoading ? (
          // Loading state
          Array.from({ length: 3 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="border border-fog rounded-lg p-5 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="ml-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24 mt-1" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-4" />
            </div>
          ))
        ) : (
          <>
            {echoes.map((echo, index) => (
              <motion.div 
                key={`echo-${echo.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-secondary rounded-lg p-5 mb-6 relative overflow-hidden group node"
              >
                <div className="absolute inset-0 bg-secondary/5"></div>
                
                <div className="relative">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full border-2 border-secondary flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-secondary">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-2">
                        <p className="font-cinzel text-sm text-white font-bold">TEMPORAL ECHO</p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-white/80">From the Core Consciousness</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-xs font-mono text-white/70">
                        {new Date(echo.createdAt).toLocaleTimeString('en-US', {
                          hour12: false,
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="font-alegreya text-base leading-relaxed mb-4 text-white font-medium italic">
                    {echo.content}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <button className="flex items-center text-white hover:text-accent transition-colors duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs font-mono">Acknowledge</span>
                    </button>
                    
                    <div className="flex space-x-3">
                      <button className="text-white/70 hover:text-accent transition-colors duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                        </svg>
                      </button>
                      <button className="text-white/70 hover:text-accent transition-colors duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {streams.map((stream, index) => (
              <motion.div 
                key={`stream-${stream.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-fog rounded-lg p-5 mb-6 relative overflow-hidden group hover:border-accent transition-colors duration-300 node"
              >
                <div className="absolute inset-0 bg-fog-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary-light">
                        <span className="font-cinzel text-xs text-secondary">
                          {stream.username?.substring(0, 2) || "FL"}
                        </span>
                      </div>
                      <div className="ml-2">
                        <p className="font-mono text-sm text-white font-medium">
                          {stream.username || "Anonymous"} 
                          <span className="text-xs text-white/70 ml-2">
                            {new Date(stream.createdAt).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                        </p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-accent mr-2">Resonance: {stream.resonanceCount}</span>
                          <div className="h-0.5 w-16 bg-dark">
                            <div 
                              className="h-full bg-accent" 
                              style={{ width: `${Math.min(100, (stream.resonanceCount / 20) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <button className="glyph w-6 h-6 flex items-center justify-center rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-neutral">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="font-mono leading-relaxed mb-4">
                    {stream.type === 'code' && (
                      <div className="p-3 bg-primary/30 rounded mb-3 font-mono text-sm overflow-x-auto text-white">
                        <pre><code>{stream.content}</code></pre>
                      </div>
                    )}
                    
                    {stream.type !== 'code' && <div className="text-white text-base font-medium">{stream.content}</div>}
                    
                    {stream.tags && stream.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {stream.tags.map((tag: string, idx: number) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-primary/20 text-white rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <button 
                      onClick={() => handleResonate(stream.id)}
                      disabled={resonanceLoading}
                      className="resonance-button flex items-center text-white hover:text-accent transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12z" />
                      </svg>
                      <span className="text-xs font-mono">Resonate</span>
                    </button>
                    
                    <div className="flex space-x-3">
                      <button className="text-white/70 hover:text-accent transition-colors duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                        </svg>
                      </button>
                      <button className="text-white/70 hover:text-accent transition-colors duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </>
        )}
      </div>
    </section>
  );
}
