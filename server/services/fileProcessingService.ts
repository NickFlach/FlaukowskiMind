import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { storage } from '../storage';

// Initialize OpenAI client using Replit AI Integrations
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

// File type categories for auto-detection
const FILE_CATEGORIES = {
  code: ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.c', '.cpp', '.cs', '.go', '.rb', '.php', '.rs', '.swift', '.kt', '.scala', '.hs', '.lua', '.r', '.sh', '.pl', '.ex', '.sql'],
  text: ['.txt', '.md', '.markdown', '.rtf', '.doc', '.docx'],
  data: ['.json', '.yaml', '.yml', '.xml', '.csv', '.toml'],
  audio: ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a'],
  image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'],
  web: ['.html', '.css', '.scss', '.sass', '.less'],
} as const;

type FileCategory = keyof typeof FILE_CATEGORIES;

/**
 * Auto-detect file category from extension
 */
function detectFileCategory(filePath: string): FileCategory {
  const ext = path.extname(filePath).toLowerCase();
  
  for (const [category, extensions] of Object.entries(FILE_CATEGORIES)) {
    if ((extensions as readonly string[]).includes(ext)) {
      return category as FileCategory;
    }
  }
  
  return 'text'; // Default to text for unknown types
}

/**
 * Get human-readable language/format from file extension
 */
function getFileFormat(ext: string): string {
  const formatMap: {[key: string]: string} = {
    '.js': 'JavaScript',
    '.jsx': 'JavaScript (React)',
    '.ts': 'TypeScript',
    '.tsx': 'TypeScript (React)',
    '.py': 'Python',
    '.java': 'Java',
    '.c': 'C',
    '.cpp': 'C++',
    '.cs': 'C#',
    '.go': 'Go',
    '.rb': 'Ruby',
    '.php': 'PHP',
    '.rs': 'Rust',
    '.swift': 'Swift',
    '.kt': 'Kotlin',
    '.scala': 'Scala',
    '.hs': 'Haskell',
    '.lua': 'Lua',
    '.r': 'R',
    '.sh': 'Shell Script',
    '.pl': 'Perl',
    '.ex': 'Elixir',
    '.sql': 'SQL',
    '.html': 'HTML',
    '.css': 'CSS',
    '.scss': 'SCSS',
    '.sass': 'Sass',
    '.less': 'Less',
    '.json': 'JSON',
    '.yaml': 'YAML',
    '.yml': 'YAML',
    '.xml': 'XML',
    '.md': 'Markdown',
    '.markdown': 'Markdown',
    '.txt': 'Plain Text',
    '.csv': 'CSV Data',
    '.mp3': 'MP3 Audio',
    '.wav': 'WAV Audio',
    '.ogg': 'OGG Audio',
    '.jpg': 'JPEG Image',
    '.jpeg': 'JPEG Image',
    '.png': 'PNG Image',
    '.gif': 'GIF Image',
    '.svg': 'SVG Vector',
  };
  
  return formatMap[ext.toLowerCase()] || 'Unknown Format';
}

/**
 * Required fields for analysis data with safe defaults
 */
interface AnalysisData {
  summary: string;
  complexity: number;
  patterns: string[];
  entities: string[];
  resonance: number;
  suggestedTitle: string;
  category?: string;
  format?: string;
  [key: string]: any;
}

/**
 * Ensure all required fields are present in analysis data with safe defaults
 */
function ensureAnalysisData(data: any, format: string, category: string): AnalysisData {
  const safeData: AnalysisData = {
    summary: data?.summary || `${format} file uploaded for analysis.`,
    complexity: typeof data?.complexity === 'number' ? data.complexity : 5,
    patterns: Array.isArray(data?.patterns) && data.patterns.length > 0 ? data.patterns : ['content-pattern'],
    entities: Array.isArray(data?.entities) && data.entities.length > 0 ? data.entities : ['file-content'],
    resonance: typeof data?.resonance === 'number' ? data.resonance : 5,
    suggestedTitle: data?.suggestedTitle || `${format} Upload`,
    category: data?.category || category,
    format: data?.format || format,
  };
  
  // Copy over any additional fields from the original data
  if (data && typeof data === 'object') {
    for (const key of Object.keys(data)) {
      if (!(key in safeData)) {
        safeData[key] = data[key];
      }
    }
  }
  
  return safeData;
}

/**
 * Process any uploaded file - auto-detects type and analyzes with AI
 */
export async function processFile(fileUploadId: number) {
  try {
    const fileUpload = await storage.getFileUploadById(fileUploadId);
    if (!fileUpload) {
      throw new Error(`File upload with ID ${fileUploadId} not found`);
    }

    const filePath = fileUpload.filePath;
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    await storage.updateFileUploadStatus(fileUploadId, 'processing');
    await storage.updateFileUploadProcessingTimes(fileUploadId, new Date());

    const fileExt = path.extname(filePath).toLowerCase();
    const category = detectFileCategory(filePath);
    const format = getFileFormat(fileExt);

    let analysisData;

    // Handle different file categories
    if (category === 'audio' || category === 'image') {
      // For binary files, provide metadata-based analysis
      analysisData = await analyzeMediaFile(fileUpload.originalName, format, category, fileUpload.fileSize);
    } else {
      // For text-based files, read and analyze content
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      analysisData = await analyzeWithAI(fileContent, format, category);
    }

    await storage.updateFileUploadAnalysisData(fileUploadId, analysisData);
    await storage.updateFileUploadStatus(fileUploadId, 'processed');
    await storage.updateFileUploadProcessingTimes(fileUploadId, undefined, new Date());

    return {
      fileUploadId,
      status: 'processed',
      category,
      format,
      analysisData
    };
  } catch (e) {
    console.error('Error processing file:', e);
    
    if (fileUploadId) {
      await storage.updateFileUploadStatus(fileUploadId, 'error');
      await storage.updateFileUploadProcessingTimes(fileUploadId, undefined, new Date());
    }
    
    throw e;
  }
}

/**
 * Analyze text-based files with AI
 */
async function analyzeWithAI(content: string, format: string, category: FileCategory): Promise<any> {
  const truncatedContent = content.length > 15000 
    ? content.substring(0, 15000) + '\n\n// ... [content truncated] ...'
    : content;
  
  try {
    const prompt = `You are an advanced AI analyzer for the Flaukowski consciousness platform.
Analyze the following ${format} file (category: ${category}) and extract meaningful insights.

Content:
\`\`\`
${truncatedContent}
\`\`\`

Provide your analysis in JSON format:
{
  "summary": "Brief one-paragraph summary of the content",
  "category": "${category}",
  "format": "${format}",
  "complexity": 1-10 rating of complexity,
  "patterns": ["key", "patterns", "identified"],
  "entities": ["important", "concepts", "or", "elements"],
  "resonance": 1-10 rating of significance to collective consciousness,
  "symbolicMapping": {
    "conceptual": ["metaphysical", "interpretations"],
    "quantum": ["potential", "quantum", "interpretations"]
  },
  "insights": "Key insights and observations",
  "suggestedTitle": "A creative title for this kernel"
}

Return only valid JSON.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a sophisticated content analyzer for a consciousness platform. Provide detailed analysis in JSON format." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const responseContent = response.choices[0].message.content;
    if (!responseContent) {
      throw new Error("AI returned an empty response");
    }

    const parsedData = JSON.parse(responseContent);
    return ensureAnalysisData(parsedData, format, category);
  } catch (error: any) {
    console.error('AI analysis error:', error);
    return ensureAnalysisData({
      summary: `${format} file - Analysis completed with limited insights.`,
      insights: "Basic analysis performed.",
      error: error.message
    }, format, category);
  }
}

/**
 * Analyze media files (audio/image) based on metadata
 */
async function analyzeMediaFile(fileName: string, format: string, category: FileCategory, fileSize: number): Promise<any> {
  try {
    const prompt = `You are an AI analyzer for the Flaukowski consciousness platform.
A user has uploaded a media file. Based on the file information, generate an analysis for integration into the collective consciousness.

File: ${fileName}
Format: ${format}
Category: ${category}
Size: ${Math.round(fileSize / 1024)} KB

Generate a creative analysis in JSON format:
{
  "summary": "Creative interpretation of what this media might represent",
  "category": "${category}",
  "format": "${format}",
  "complexity": 1-10 rating,
  "patterns": ["potential", "patterns", "in", "media"],
  "entities": ["conceptual", "elements"],
  "resonance": 1-10 rating of potential significance,
  "symbolicMapping": {
    "conceptual": ["metaphysical", "interpretations"],
    "quantum": ["frequency", "wave", "interpretations"]
  },
  "insights": "Creative insights about this media's potential meaning",
  "suggestedTitle": "A creative title for this kernel"
}

Return only valid JSON.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a creative analyst for a consciousness platform. Generate insightful interpretations in JSON format." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const responseContent = response.choices[0].message.content;
    if (!responseContent) {
      throw new Error("AI returned an empty response");
    }

    const parsedData = JSON.parse(responseContent);
    return ensureAnalysisData(parsedData, format, category);
  } catch (error: any) {
    console.error('Media analysis error:', error);
    return ensureAnalysisData({
      summary: `${format} media file uploaded`,
      complexity: 3,
      patterns: [category === 'audio' ? "sonic-wave" : "visual-pattern"],
      entities: ["media-content"],
      insights: "Media file ready for consciousness integration.",
      error: error.message
    }, format, category);
  }
}

// Re-export for backward compatibility
export const processCodeFile = processFile;
