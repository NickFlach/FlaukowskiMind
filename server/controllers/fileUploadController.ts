import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertFileUploadSchema } from '@shared/schema';
import path from 'path';
import * as codeProcessingService from '../services/codeProcessingService';

/**
 * Controller for handling file uploads
 */

// Process a file upload request
export const handleFileUpload = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { userId, fileType } = req.body;
    
    if (!userId || !fileType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const fileUpload = await storage.createFileUpload({
      userId: parseInt(userId, 10),
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      fileType: fileType,
      filePath: req.file.path,
      status: 'uploaded',
    });
    
    res.status(201).json(fileUpload);
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to upload file' });
  }
};

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

// Process a code file with OpenAI
export const processCodeFile = async (req: Request, res: Response) => {
  try {
    const fileUploadId = parseInt(req.params.id, 10);
    
    if (!fileUploadId) {
      return res.status(400).json({ error: 'Invalid file upload ID' });
    }
    
    const fileUpload = await storage.getFileUploadById(fileUploadId);
    
    if (!fileUpload) {
      return res.status(404).json({ error: 'File upload not found' });
    }
    
    // Only process files that are code-related
    if (fileUpload.fileType !== 'code') {
      return res.status(400).json({ error: 'Only code files can be processed with this endpoint' });
    }
    
    const result = await codeProcessingService.processCodeFile(fileUploadId);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Process code file error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to process code file' });
  }
};