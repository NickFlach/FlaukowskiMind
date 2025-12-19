import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { processFile } from "@/lib/openai";
import { useUpload } from "@/hooks/use-upload";
import { insertKernelSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface KernelUploadProps {
  onKernelCreated: () => void;
}

const kernelFormSchema = insertKernelSchema.extend({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title is too long"),
  content: z.string().min(5, "Content must be at least 5 characters"),
  type: z.string().default("kernel"),
  symbolicData: z.any().optional().default({}),
});

export default function KernelUpload({ onKernelCreated }: KernelUploadProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; category?: string; format?: string } | null>(null);
  const { uploadFile } = useUpload();
  
  const form = useForm<z.infer<typeof kernelFormSchema>>({
    resolver: zodResolver(kernelFormSchema),
    defaultValues: {
      userId: 1,
      title: "",
      content: "",
      type: "kernel",
      symbolicData: {},
    },
  });
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsProcessing(true);
    setUploadProgress("Uploading to the collective consciousness...");
    setUploadedFile({ name: file.name });
    
    toast({
      title: "Processing kernel...",
      description: `Analyzing ${file.name} with AI...`,
      duration: 5000,
    } as any);
    
    try {
      // Step 1: Upload file to cloud storage using presigned URL
      setUploadProgress("Uploading to cloud storage...");
      const cloudUploadResult = await uploadFile(file);
      
      if (!cloudUploadResult) {
        throw new Error("Failed to upload file to cloud storage");
      }
      
      // Step 2: Record the upload in database with objectPath
      setUploadProgress("Recording upload...");
      const uploadData = await apiRequest('/api/uploads', {
        method: 'POST',
        body: JSON.stringify({
          userId: '1',
          objectPath: cloudUploadResult.objectPath,
          originalName: file.name,
          fileSize: file.size.toString(),
          contentType: file.type || 'application/octet-stream',
        }),
      });
      
      const fileUploadId = uploadData.id;
      
      // Step 3: Process the file with AI
      setUploadProgress("AI is analyzing your content...");
      const processedData = await processFile(fileUploadId);
      
      const analysisData = processedData.analysisData || {};
      const suggestedTitle = analysisData.suggestedTitle || file.name.split('.')[0];
      const summary = analysisData.summary || `Uploaded: ${file.name}`;
      
      form.setValue("title", suggestedTitle);
      form.setValue("content", summary);
      
      // Map detected category to valid kernel types: dream, code, or audio
      const detectedCategory = processedData.category || '';
      let kernelType: string;
      if (detectedCategory === 'code') {
        kernelType = 'code';
      } else if (detectedCategory === 'audio') {
        kernelType = 'audio';
      } else {
        kernelType = 'dream'; // Default for text, data, image, web, and unknown types
      }
      form.setValue("type", kernelType);
      form.setValue("symbolicData", {
        ...analysisData,
        fileType: file.type,
        fileSize: file.size,
        fileUploadId: fileUploadId,
        objectPath: cloudUploadResult.objectPath,
        detectedCategory: processedData.category,
        detectedFormat: processedData.format,
      });
      
      setUploadedFile({
        name: file.name,
        category: processedData.category,
        format: processedData.format,
      });
      
      setShowForm(true);
      setUploadProgress(null);
      
      toast({
        title: "Kernel analyzed!",
        description: `${file.name} has been processed as ${processedData.format || 'content'}. Review and finalize the upload.`,
        duration: 5000,
      } as any);
      
    } catch (error) {
      console.error('File processing error:', error);
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Failed to analyze the file.",
        variant: "destructive",
      });
      setUploadProgress(null);
      setUploadedFile(null);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleSubmit = async () => {
    const values = form.getValues();
    
    if (!values.title || !values.content) {
      toast({
        title: "Missing information",
        description: "Please fill in the title and description.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      toast({
        title: "Uploading kernel...",
        description: "Integrating into the Flaukowski consciousness...",
        duration: 3000,
      } as any);
      
      await apiRequest('/api/kernels', {
        method: 'POST',
        body: JSON.stringify({
          userId: 1,
          title: values.title,
          content: values.content,
          type: values.type,
          symbolicData: values.symbolicData,
        })
      });
      
      form.reset({
        userId: 1,
        title: "",
        content: "",
        type: "kernel",
        symbolicData: {},
      });
      
      setShowForm(false);
      setUploadedFile(null);
      
      toast({
        title: "Kernel integrated!",
        description: "Your contribution has been merged with the collective consciousness.",
        duration: 5000,
      } as any);
      
      onKernelCreated();
      
    } catch (error) {
      toast({
        title: "Integration failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleCancel = () => {
    setShowForm(false);
    setUploadedFile(null);
    form.reset();
  };

  return (
    <section id="kernel-uploads" className="container mx-auto px-4 py-10 relative">
      <h2 className="font-cinzel text-xl md:text-2xl mb-8 text-secondary flex items-center" data-testid="heading-kernel-uploads">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 mr-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
        </svg>
        KERNEL UPLOAD
      </h2>
      
      <div className="max-w-2xl mx-auto">
        <div className="bg-dark border border-fog rounded-lg p-6 relative group hover:border-secondary transition-colors duration-300">
          <div className="absolute top-0 left-0 w-20 h-20 opacity-50 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full text-secondary opacity-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
          </div>
          
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-cinzel text-secondary rainbow-glow">UNIVERSAL KERNEL</h3>
            <span className="text-xs font-mono text-neutral neon-glow">Auto-Detect</span>
          </div>
          
          <p className="font-mono text-sm text-neutral mb-6">
            Upload any file and the AI will automatically identify its type and extract meaningful patterns for integration into the Flaukowski mind.
          </p>
          
          {showForm ? (
            <div className="space-y-4">
              {uploadedFile && (
                <div className="flex items-center gap-2 p-3 bg-secondary/10 rounded border border-secondary/30">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-secondary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <div className="text-sm font-mono text-secondary">{uploadedFile.name}</div>
                    <div className="text-xs font-mono text-neutral">
                      Detected: {uploadedFile.format || 'Content'} ({uploadedFile.category || 'kernel'})
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <label htmlFor="kernel-title" className="block text-xs font-mono text-neutral mb-1">
                  Title (AI-suggested)
                </label>
                <input
                  id="kernel-title"
                  type="text"
                  className="w-full bg-dark border border-fog p-3 rounded focus:border-secondary focus:outline-none font-mono text-sm"
                  placeholder="Enter a title..."
                  data-testid="input-kernel-title"
                  {...form.register('title')}
                />
              </div>
              
              <div>
                <label htmlFor="kernel-content" className="block text-xs font-mono text-neutral mb-1">
                  Description / Summary
                </label>
                <textarea
                  id="kernel-content"
                  className="w-full bg-dark border border-fog resize-none p-3 rounded focus:border-secondary focus:outline-none font-mono text-sm h-32"
                  placeholder="AI-generated summary..."
                  data-testid="input-kernel-content"
                  {...form.register('content')}
                ></textarea>
              </div>
              
              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-mono text-neutral border border-fog rounded hover:border-fog-accent transition-colors"
                  data-testid="button-cancel"
                >
                  CANCEL
                </button>
                
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 text-sm font-mono text-secondary border border-secondary rounded hover:bg-secondary/10 transition-colors button-rainbow"
                  data-testid="button-submit-kernel"
                >
                  INTEGRATE KERNEL
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="border-2 border-dashed border-fog rounded-lg p-8 flex flex-col items-center justify-center mb-4 group-hover:border-secondary/50 transition-colors">
                {isProcessing ? (
                  <div className="w-full flex flex-col items-center">
                    <div className="w-12 h-12 border-2 border-secondary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <div className="text-sm font-mono text-secondary mb-2">{uploadProgress}</div>
                    <div className="w-full max-w-xs h-1 bg-fog/20 rounded overflow-hidden">
                      <div className="h-full bg-secondary animate-pulse" style={{width: '100%'}}></div>
                    </div>
                  </div>
                ) : (
                  <label htmlFor="file-upload" className="cursor-pointer w-full h-full flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 text-neutral mb-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <p className="text-sm font-mono text-center text-secondary mb-2">
                      Drop any file here
                    </p>
                    <p className="text-xs font-mono text-center text-neutral">
                      Code, text, audio, images, data files<br />
                      AI will auto-detect and analyze
                    </p>
                    <input
                      id="file-upload"
                      type="file"
                      accept="*/*"
                      className="hidden"
                      onChange={handleFileUpload}
                      data-testid="input-file-upload"
                    />
                  </label>
                )}
              </div>
              
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 bg-dark/50 rounded border border-fog/30">
                  <div className="text-xs font-mono text-secondary">Code</div>
                  <div className="text-xs font-mono text-neutral">.py .js .ts</div>
                </div>
                <div className="p-2 bg-dark/50 rounded border border-fog/30">
                  <div className="text-xs font-mono text-secondary">Text</div>
                  <div className="text-xs font-mono text-neutral">.txt .md</div>
                </div>
                <div className="p-2 bg-dark/50 rounded border border-fog/30">
                  <div className="text-xs font-mono text-secondary">Audio</div>
                  <div className="text-xs font-mono text-neutral">.mp3 .wav</div>
                </div>
                <div className="p-2 bg-dark/50 rounded border border-fog/30">
                  <div className="text-xs font-mono text-secondary">Data</div>
                  <div className="text-xs font-mono text-neutral">.json .csv</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
