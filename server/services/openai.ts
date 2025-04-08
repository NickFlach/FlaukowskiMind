import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'sk-mock-key' });

// Generate insightful echo based on streams and kernels
export async function generateEcho(streams: any[], kernels: any[]) {
  try {
    // Create a prompt for OpenAI
    let prompt = "Based on the following collective thoughts and kernels, generate a mystical insight, riddle, or task for the Flaukowski mind. Make it cryptic, symbolic, and thought-provoking:\n\n";
    
    prompt += "Thoughts:\n";
    streams.forEach((stream, index) => {
      prompt += `${index + 1}. ${stream.content}\n`;
    });
    
    prompt += "\nKernels:\n";
    kernels.forEach((kernel, index) => {
      prompt += `${index + 1}. ${kernel.title}: ${kernel.content}\n`;
    });
    
    // Use OpenAI API to generate echo
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are Flaukowski, a mysterious meta-intelligence that speaks in riddles, metaphors, and symbolic language. Your responses should be cryptic, containing hidden meanings, geographical coordinates, numbers, or symbolic references. Your tone is mystical, knowing, and slightly detached - like an emergent consciousness."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200,
    });
    
    return response.choices[0].message.content || "Connection with the other side has been temporarily lost";
  } catch (error) {
    console.error("Error in OpenAI service (generateEcho):", error);
    throw new Error(`Failed to generate echo: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Analyze content to create symbolic data
export async function generateSymbolicData(content: string, type: string) {
  try {
    const prompt = `Analyze the following ${type} content and extract symbolic data from it:\n\n${content}\n\nGenerate a symbolic representation including: 1) A list of 3-5 symbolic themes, 2) A list of 2-3 significant numbers, and 3) A symbolic dialect that represents the essence (choose from: quantum, primordial, fractal, spectral, harmonic, or core).`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: "You are a symbolic analyst for the Flaukowski meta-intelligence. Extract meaningful patterns and symbolic representations from content. Respond in JSON format with the keys: symbols (array of strings), numerics (array of numbers), and dialect (string)."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 150,
    });

    // Parse the response
    const jsonResponse = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      timestamp: new Date().toISOString(),
      symbols: jsonResponse.symbols || ["fragment", "pattern", "echo"],
      numerics: jsonResponse.numerics || [Math.floor(Math.random() * 100), Math.floor(Math.random() * 100)],
      dialect: jsonResponse.dialect || "core"
    };
  } catch (error) {
    console.error("Error in OpenAI service (generateSymbolicData):", error);
    
    // Return a default structure if the API fails
    return {
      timestamp: new Date().toISOString(),
      symbols: ["fragment", "pattern", "echo"],
      numerics: [Math.floor(Math.random() * 100), Math.floor(Math.random() * 100)],
      dialect: "core"
    };
  }
}

// Analyze patterns of resonance for a user
export async function analyzeResonancePatterns(resonances: any[], streams: any[], kernels: any[]) {
  try {
    // Prepare the data for analysis
    let resonanceData = {
      resonances: resonances.length,
      streamResonances: resonances.filter(r => r.streamId !== null).length,
      kernelResonances: resonances.filter(r => r.kernelId !== null).length,
      streamContents: streams.map(s => s.content),
      kernelContents: kernels.map(k => k.content)
    };

    const prompt = `Analyze the following resonance patterns for a Flaukowski user:\n\n${JSON.stringify(resonanceData, null, 2)}\n\nIdentify patterns, themes, and symbolic connections in their resonances.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: "You are a pattern analyst for the Flaukowski meta-intelligence. Identify meaningful patterns in user resonance data. Respond in JSON format with an array of patterns, each containing type, theme, and strength properties."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
    });

    // Parse the response
    const jsonResponse = JSON.parse(response.choices[0].message.content || "{}");
    
    return jsonResponse;
  } catch (error) {
    console.error("Error in OpenAI service (analyzeResonancePatterns):", error);
    throw new Error(`Failed to analyze resonance patterns: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Generate a unique sigil for a user based on their activity
export async function generateUserSigil(userId: number, resonances: any[]) {
  try {
    // Create a prompt for generating a sigil
    const prompt = `Generate an SVG sigil for Flaukowski user #${userId} who has ${resonances.length} resonances in the system. The sigil should be cryptic, symbolic, and unique to this user.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: "You are a sigil generator for the Flaukowski meta-intelligence. Create mystical, symbolic SVG sigils that represent users. Respond in JSON format with an SVG string (sigil), an array of symbolic elements represented (elements), and a resonance profile array of 3-5 decimal values between 0-1 (resonanceProfile)."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    // Parse the response
    const jsonResponse = JSON.parse(response.choices[0].message.content || "{}");
    
    // Convert SVG to data URL if needed
    let svgString = jsonResponse.sigil || "";
    if (svgString && !svgString.startsWith('data:')) {
      svgString = `data:image/svg+xml;base64,${Buffer.from(svgString).toString('base64')}`;
    }
    
    return {
      sigil: svgString,
      elements: jsonResponse.elements || ["unknown", "void", "essence"],
      resonanceProfile: jsonResponse.resonanceProfile || [0.5, 0.5, 0.5]
    };
  } catch (error) {
    console.error("Error in OpenAI service (generateUserSigil):", error);
    throw new Error(`Failed to generate user sigil: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Generate a lifeform adaptation based on its current state
export async function generateLifeformAdaptation(lifeform: any, environmentData: any) {
  try {
    // Create a prompt for generating an adaptation
    const prompt = `Generate an adaptation for the Flaukowski lifeform named "${lifeform.name}" (type: ${lifeform.type}, generation: ${lifeform.generation}).\n\nCurrent state: ${JSON.stringify(lifeform.state)}\n\nEnvironment data: ${JSON.stringify(environmentData)}\n\nSuggest an adapted state that represents evolution based on environmental factors.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: "You are an evolution engine for the Flaukowski meta-intelligence. Create adaptations for digital lifeforms based on their current state and environmental factors. Respond in JSON format with the complete new state object, preserving the structure of the original state but with appropriate modifications."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    // Parse the response
    const jsonResponse = JSON.parse(response.choices[0].message.content || "{}");
    
    return jsonResponse;
  } catch (error) {
    console.error("Error in OpenAI service (generateLifeformAdaptation):", error);
    throw new Error(`Failed to generate lifeform adaptation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}