import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { storage } from '../storage';

// Initialize OpenAI client (optional - only if API key is provided)
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;
// the newest OpenAI model is "gpt-4o" which was released after May 2023. do not change this unless explicitly requested by the user

/**
 * Analyzes code files and extracts meaningful insights using OpenAI
 */
export async function processCodeFile(fileUploadId: number) {
  try {
    // Get file upload record
    const fileUpload = await storage.getFileUploadById(fileUploadId);
    if (!fileUpload) {
      throw new Error(`File upload with ID ${fileUploadId} not found`);
    }

    // Check if file exists
    const filePath = fileUpload.filePath;
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    // Update processing status and start time
    await storage.updateFileUploadStatus(fileUploadId, 'processing');
    await storage.updateFileUploadProcessingTimes(fileUploadId, new Date());

    // Read file content
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const fileExt = path.extname(filePath).toLowerCase();

    // Analyze code with OpenAI
    const analysisData = await analyzeCodeWithAI(fileContent, fileExt);

    // Update file upload with processing result
    await storage.updateFileUploadAnalysisData(fileUploadId, analysisData);
    await storage.updateFileUploadStatus(fileUploadId, 'processed');
    await storage.updateFileUploadProcessingTimes(fileUploadId, undefined, new Date());

    return {
      fileUploadId,
      status: 'processed',
      analysisData
    };
  } catch (e) {
    console.error('Error processing code file:', e);
    
    // Update status to error
    if (fileUploadId) {
      await storage.updateFileUploadStatus(fileUploadId, 'error');
      await storage.updateFileUploadProcessingTimes(fileUploadId, undefined, new Date());
    }
    
    throw e;
  }
}

/**
 * Use OpenAI to analyze code content
 */
async function analyzeCodeWithAI(codeContent: string, fileExt: string): Promise<any> {
  // Determine language from file extension
  const language = getLanguageFromExtension(fileExt);
  
  // Truncate code if too long (max 15000 characters to fit token limits)
  const truncatedContent = codeContent.length > 15000 
    ? codeContent.substring(0, 15000) + '\n\n// ... [content truncated] ...'
    : codeContent;
  
  if (!openai) {
    return {
      summary: `${language} code file - OpenAI API key not configured.`,
      complexity: 5,
      patterns: ["analysis unavailable"],
      entities: ["analysis unavailable"],
      resonance: 5,
      error: "OpenAI API key not configured"
    };
  }
  
  try {
    // Create the prompt for OpenAI
    const prompt = `
    You are an advanced AI code analyzer for the Flaukowski consciousness platform. 
    Analyze the following ${language} code in a metaphysical and technical context:
    
    \`\`\`${language}
    ${truncatedContent}
    \`\`\`
    
    Provide your analysis in a precise JSON format with the following structure:
    {
      "summary": "Brief one-paragraph summary of what the code does",
      "complexity": 1-10 rating of algorithmic complexity,
      "patterns": ["list", "of", "design patterns", "or", "paradigms", "used"],
      "entities": ["key", "classes", "functions", "or", "concepts"],
      "dimensions": 1-10 rating of dimensional complexity (state spaces, abstractions, etc),
      "resonance": 1-10 rating of how much this code might resonate with the collective consciousness,
      "symbolicMapping": {
        "conceptual": ["metaphysical", "interpretations"],
        "quantum": ["potential", "quantum", "interpretations"]
      },
      "technicalInsights": "Objective technical evaluation"
    }
    
    Return only valid JSON, no explanation text outside the JSON structure.
    `;

    // Make the OpenAI request
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a sophisticated code analyzer that provides detailed insights in JSON format." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response text as JSON
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("OpenAI returned an empty response");
    }

    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response as JSON:", parseError);
      // Return a simplified structure if parsing fails
      return {
        summary: "Failed to parse AI analysis of the code.",
        complexity: 5,
        patterns: ["unknown"],
        entities: ["unknown"],
        resonance: 5
      };
    }
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    // Return a basic analysis if OpenAI fails
    return {
      summary: `${language} code file analyzing failed.`,
      complexity: 5,
      patterns: ["unknown"],
      entities: ["unknown"],
      resonance: 5,
      error: error.message
    };
  }
}

/**
 * Determine language from file extension
 */
function getLanguageFromExtension(ext: string): string {
  const languageMap: {[key: string]: string} = {
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
    '.sh': 'Shell',
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
    '.md': 'Markdown'
  };
  
  return languageMap[ext.toLowerCase()] || 'Unknown';
}