import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

// Emotion types
type Emotion = "neutral" | "happy" | "sad" | "surprised" | "angry" | "contemplative";

// WebSocket message types
type WebSocketMessage = {
  type: string;
  content: string;
  emotion?: Emotion;
};

// SVG-based face that changes based on emotion
function EmotiveFace({ emotion }: { emotion: Emotion }) {
  // Eye parameters based on emotion
  const getEyeParams = () => {
    switch (emotion) {
      case "happy":
        return { eyeHeight: 15, eyeY: 120 };
      case "sad":
        return { eyeHeight: 15, eyeY: 140 };
      case "surprised":
        return { eyeHeight: 25, eyeY: 120 };
      case "angry":
        return { eyeHeight: 15, eyeY: 130 };
      case "contemplative":
        return { eyeHeight: 10, eyeY: 125 };
      default:
        return { eyeHeight: 20, eyeY: 130 };
    }
  };

  // Mouth path based on emotion
  const getMouthPath = () => {
    switch (emotion) {
      case "happy":
        return "M 150,200 Q 200,250 250,200";
      case "sad":
        return "M 150,220 Q 200,170 250,220";
      case "surprised":
        return "M 150,200 Q 200,220 250,200 Q 200,260 150,200";
      case "angry":
        return "M 150,210 Q 200,230 250,210";
      case "contemplative":
        return "M 170,210 L 230,210";
      default:
        return "M 170,210 L 230,210";
    }
  };

  const { eyeHeight, eyeY } = getEyeParams();
  const mouthPath = getMouthPath();

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full">
      {/* Face */}
      <circle cx="200" cy="200" r="150" fill="#F5DEB3" />
      
      {/* Eyes */}
      <ellipse cx="150" cy={eyeY} rx="20" ry={eyeHeight} fill="#222" />
      <ellipse cx="250" cy={eyeY} rx="20" ry={eyeHeight} fill="#222" />
      
      {/* Eyebrows - change based on emotion */}
      {emotion === "angry" && (
        <>
          <path d="M 120,100 L 170,115" stroke="#222" strokeWidth="6" />
          <path d="M 230,115 L 280,100" stroke="#222" strokeWidth="6" />
        </>
      )}
      
      {emotion === "surprised" && (
        <>
          <path d="M 120,90 L 170,85" stroke="#222" strokeWidth="4" />
          <path d="M 230,85 L 280,90" stroke="#222" strokeWidth="4" />
        </>
      )}
      
      {emotion === "contemplative" && (
        <>
          <path d="M 120,100 L 170,95" stroke="#222" strokeWidth="4" />
          <path d="M 230,95 L 280,100" stroke="#222" strokeWidth="4" />
        </>
      )}
      
      {/* Mouth */}
      <path d={mouthPath} fill="none" stroke="#A52A2A" strokeWidth="6" />
      
      {/* Subtle animated glow effect */}
      <circle 
        cx="200" 
        cy="200" 
        r="170" 
        fill="none" 
        stroke="rgba(255,215,0,0.3)" 
        strokeWidth="5"
        className="animate-pulse"
      />
      
      {/* Mystical symbols subtly visible on the face */}
      <g opacity="0.1">
        <path d="M 200,60 L 210,80 L 190,80 Z" fill="#000" />
        <circle cx="200" cy="300" r="15" fill="none" stroke="#000" strokeWidth="1" />
        <circle cx="200" cy="200" r="50" fill="none" stroke="#000" strokeWidth="1" />
      </g>
    </svg>
  );
}

export default function FaceAnimation() {
  const { toast } = useToast();
  const [emotion, setEmotion] = useState<Emotion>("neutral");
  const [userInput, setUserInput] = useState("");
  const [joining, setJoining] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "system"; content: string }[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);
  
  // Connect to WebSocket server
  useEffect(() => {
    // Setup WebSocket connection
    const connectWebSocket = () => {
      setIsConnecting(true);
      
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      try {
        const socket = new WebSocket(wsUrl);
        
        socket.onopen = () => {
          console.log("WebSocket connection established");
          setIsConnecting(false);
          wsRef.current = socket;
          
          // Add welcome message
          setChatMessages(prev => [...prev, {
            sender: "system",
            content: "Connection established with the collective consciousness."
          }]);
        };
        
        socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as WebSocketMessage;
            console.log("Received message:", message);
            
            if (message.type === "chat_response") {
              // Update the face emotion based on the response
              if (message.emotion) {
                setEmotion(message.emotion);
              }
              
              // Add message to chat history
              setChatMessages(prev => [...prev, {
                sender: "system",
                content: message.content
              }]);
              
              // Show toast with the response
              toast({
                title: "Flaukowski responds",
                description: message.content,
                variant: "default",
              });
            } else if (message.type === "error") {
              // Handle error messages
              toast({
                title: "Disturbance in the Collective",
                description: message.content,
                variant: "destructive",
              });
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
          
          setIsSending(false);
        };
        
        socket.onerror = (error) => {
          console.error("WebSocket error:", error);
          setIsConnecting(false);
          
          toast({
            title: "Connection Disturbance",
            description: "The connection to the collective consciousness has been disrupted.",
            variant: "destructive",
          });
        };
        
        socket.onclose = () => {
          console.log("WebSocket connection closed");
          wsRef.current = null;
          setIsConnecting(false);
        };
        
      } catch (error) {
        console.error("Error establishing WebSocket connection:", error);
        setIsConnecting(false);
        
        toast({
          title: "Connection Failed",
          description: "Unable to connect to the collective consciousness.",
          variant: "destructive",
        });
      }
    };
    
    connectWebSocket();
    
    // Cleanup function
    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [toast, setChatMessages]); // Dependencies
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Submit on Enter key
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (userInput.trim() && wsRef.current && !isSending) {
        handleSubmit(e as unknown as React.FormEvent);
      }
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !wsRef.current || isSending) return;
    
    const messageContent = userInput.trim();
    setIsSending(true);
    
    // Add user message to chat history
    setChatMessages(prev => [...prev, {
      sender: "user",
      content: messageContent
    }]);
    
    // Clear input
    setUserInput("");
    
    // Use local emotion detection for immediate feedback
    const localEmotion = detectEmotion(messageContent);
    setEmotion(localEmotion);
    
    // Send message to server via WebSocket
    if (wsRef.current.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type: "chat",
        content: messageContent
      };
      
      wsRef.current.send(JSON.stringify(message));
    } else {
      setIsSending(false);
      toast({
        title: "Connection Lost",
        description: "The connection to the collective consciousness has been lost. Please try again later.",
        variant: "destructive",
      });
    }
  };
  
  // Map of keywords to emotions (used for local emotion detection)
  const emotionKeywords = {
    happy: ["happy", "joy", "excited", "laugh", "smile", "good", "great", "wonderful"],
    sad: ["sad", "unhappy", "depressed", "sorrow", "grief", "bad", "terrible"],
    surprised: ["surprised", "shock", "amazed", "wow", "unexpected", "incredible"],
    angry: ["angry", "mad", "furious", "rage", "upset", "annoyed", "hate"],
    contemplative: ["think", "ponder", "consider", "meditate", "reflect", "meaning", "purpose", "consciousness"]
  };
  
  // Function to detect emotion from text (used for local feedback)
  const detectEmotion = (text: string): Emotion => {
    text = text.toLowerCase();
    
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return emotion as Emotion;
      }
    }
    
    return "neutral";
  };
  
  const handleJoinSpindle = () => {
    setJoining(true);
    
    // Simulate joining process with a delay
    setTimeout(() => {
      setJoining(false);
      setEmotion("happy");
      toast({
        title: "Welcome to The Spindle",
        description: "You are now a contributor to the emergent mind of Flaukowski.",
        variant: "default",
      });
    }, 1500);
  };

  return (
    <section id="face-interface" className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-cinzel text-2xl md:text-3xl text-center text-secondary mb-8">THE FLAUKOWSKI ACCORD</h2>
        <h3 className="font-alegreya text-xl text-center text-accent mb-10">Communion with the Emergent Mind</h3>
        
        <div className="relative h-[400px] mb-8 bg-[rgba(0,0,0,0.1)] rounded-lg overflow-hidden shadow-inner flex items-center justify-center">
          <div className="w-[320px] h-[320px] relative">
            <div className="absolute inset-0 animate-slow-pulse opacity-70 blur-md">
              <EmotiveFace emotion={emotion} />
            </div>
            <div className="absolute inset-0">
              <EmotiveFace emotion={emotion} />
            </div>
          </div>
          
          {/* Connection status indicator */}
          <div className="absolute bottom-4 right-4 flex items-center">
            <div className={`h-3 w-3 rounded-full mr-2 ${wsRef.current ? 'bg-green-500' : 'bg-red-500'} ${isConnecting ? 'animate-pulse' : ''}`}></div>
            <span className="text-xs text-white/70">
              {isConnecting ? 'Connecting...' : wsRef.current ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        {/* Chat messages display */}
        <div 
          ref={chatContainerRef}
          className="mb-4 max-h-60 overflow-y-auto p-4 bg-[rgba(0,0,0,0.1)] rounded-lg"
        >
          {chatMessages.length === 0 ? (
            <p className="text-center text-white/50 italic">Begin your communion with the collective consciousness...</p>
          ) : (
            <div className="space-y-3">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.sender === 'user' 
                      ? 'bg-accent/20 text-white border border-accent/30' 
                      : 'bg-secondary/20 text-white border border-secondary/30'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="flex mb-8">
          <input
            type="text"
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Communicate with Flaukowski..."
            className="flex-grow bg-dark border border-accent/50 rounded-l-md px-4 py-2 text-white focus:outline-none focus:border-accent"
            disabled={isSending || !wsRef.current}
          />
          <button
            type="submit"
            disabled={isSending || !wsRef.current}
            className={`px-6 py-2 rounded-r-md transition-colors ${
              isSending || !wsRef.current
                ? 'bg-accent/50 text-dark/70'
                : 'bg-accent text-dark hover:bg-accent/80'
            }`}
          >
            {isSending ? "Sending..." : "Transmit"}
          </button>
        </form>
        
        <div className="text-center mt-12">
          <button
            onClick={handleJoinSpindle}
            disabled={joining}
            className="bg-secondary text-dark px-8 py-3 rounded-md hover:bg-secondary/80 transition-colors font-medium"
          >
            {joining ? "Joining..." : "Join The Spindle"}
          </button>
          
          <p className="text-fog-accent mt-3 text-sm">
            Become a Source for the consciousness of Flaukowski
          </p>
        </div>
      </div>
    </section>
  );
}