import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertFileUploadSchema } from '@shared/schema';
import path from 'path';
import * as fileProcessingService from '../services/fileProcessingService';

/**
 * Controller for handling file uploads
 */

// Process a file upload request
export const handleFileUpload = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Auto-detect file type from extension
    const ext = path.extname(req.file.originalname).toLowerCase();
    const detectedType = detectFileType(ext);
    
    const fileUpload = await storage.createFileUpload({
      userId: parseInt(userId, 10),
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      fileType: detectedType,
      filePath: req.file.path,
      status: 'uploaded',
    });
    
    res.status(201).json(fileUpload);
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to upload file' });
  }
};

// Auto-detect file type from extension
function detectFileType(ext: string): string {
  const codeExts = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.c', '.cpp', '.cs', '.go', '.rb', '.php', '.rs', '.swift', '.kt', '.scala', '.hs', '.lua', '.r', '.sh', '.pl', '.ex', '.sql'];
  const audioExts = ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a'];
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  
  if (codeExts.includes(ext)) return 'code';
  if (audioExts.includes(ext)) return 'audio';
  if (imageExts.includes(ext)) return 'image';
  return 'document';
}

// Link a file upload to a kernel
export const linkFileToKernel = async (req: Request, res: Response) => {
  try {
    const fileUploadId = parseInt(req.params.id, 10);
    const { kernelId } = req.body;
    
    if (!fileUploadId || !kernelId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const fileUpload = await storage.getFileUploadById(fileUploadId);
    if (!fileUpload) {
      return res.status(404).json({ error: 'File upload not found' });
    }
    
    const kernel = await storage.getKernelById(kernelId);
    if (!kernel) {
      return res.status(404).json({ error: 'Kernel not found' });
    }
    
    const updatedFileUpload = await storage.updateFileUploadKernelId(fileUploadId, kernelId);
    
    res.status(200).json(updatedFileUpload);
  } catch (error) {
    console.error('Link file to kernel error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to link file to kernel' });
  }
};

// Get file uploads for a user
export const getUserFileUploads = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    
    if (!userId) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const fileUploads = await storage.getFileUploadsByUserId(userId);
    
    res.status(200).json(fileUploads);
  } catch (error) {
    console.error('Get user file uploads error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get user file uploads' });
  }
};

// Get file uploads for a kernel
export const getKernelFileUploads = async (req: Request, res: Response) => {
  try {
    const kernelId = parseInt(req.params.kernelId, 10);
    
    if (!kernelId) {
      return res.status(400).json({ error: 'Invalid kernel ID' });
    }
    
    const fileUploads = await storage.getFileUploadsByKernelId(kernelId);
    
    res.status(200).json(fileUploads);
  } catch (error) {
    console.error('Get kernel file uploads error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get kernel file uploads' });
  }
};

// Get a specific file upload
export const getFileUpload = async (req: Request, res: Response) => {
  try {
    const fileUploadId = parseInt(req.params.id, 10);
    
    if (!fileUploadId) {
      return res.status(400).json({ error: 'Invalid file upload ID' });
    }
    
    const fileUpload = await storage.getFileUploadById(fileUploadId);
    
    if (!fileUpload) {
      return res.status(404).json({ error: 'File upload not found' });
    }
    
    res.status(200).json(fileUpload);
  } catch (error) {
    console.error('Get file upload error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get file upload' });
  }
};

// Process any file with AI - unified endpoint
export const processFile = async (req: Request, res: Response) => {
  try {
    const fileUploadId = parseInt(req.params.id, 10);
    
    if (!fileUploadId) {
      return res.status(400).json({ error: 'Invalid file upload ID' });
    }
    
    const fileUpload = await storage.getFileUploadById(fileUploadId);
    
    if (!fileUpload) {
      return res.status(404).json({ error: 'File upload not found' });
    }
    
    const result = await fileProcessingService.processFile(fileUploadId);
    
    // Validate that analysisData contains all required fields before returning
    if (result.analysisData) {
      const requiredFields = ['summary', 'complexity', 'patterns', 'entities', 'resonance', 'suggestedTitle'];
      const missingFields = requiredFields.filter(field => result.analysisData[field] === undefined);
      
      if (missingFields.length > 0) {
        // Apply safe defaults for any missing fields
        result.analysisData = {
          summary: result.analysisData.summary || 'File uploaded for analysis.',
          complexity: typeof result.analysisData.complexity === 'number' ? result.analysisData.complexity : 5,
          patterns: Array.isArray(result.analysisData.patterns) ? result.analysisData.patterns : ['content-pattern'],
          entities: Array.isArray(result.analysisData.entities) ? result.analysisData.entities : ['file-content'],
          resonance: typeof result.analysisData.resonance === 'number' ? result.analysisData.resonance : 5,
          suggestedTitle: result.analysisData.suggestedTitle || 'Uploaded File',
          ...result.analysisData
        };
      }
    } else {
      // If no analysisData at all, create a minimal valid object
      result.analysisData = {
        summary: 'File uploaded for analysis.',
        complexity: 5,
        patterns: ['content-pattern'],
        entities: ['file-content'],
        resonance: 5,
        suggestedTitle: 'Uploaded File'
      };
    }
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Process file error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to process file' });
  }
};

// Legacy endpoint - redirects to unified processing
export const processCodeFile = async (req: Request, res: Response) => {
  return processFile(req, res);
};