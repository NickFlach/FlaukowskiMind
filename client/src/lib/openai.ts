import { apiRequest } from "@/lib/queryClient";

// Function to generate a temporal echo based on streams and kernels
export async function generateEcho() {
  try {
    const response = await apiRequest("POST", "/api/echoes/generate", {});
    return response;
  } catch (error) {
    console.error("Error generating echo:", error);
    throw error;
  }
}

// Function to analyze symbolic connections between streams
export async function analyzeSymbolicConnections(sourceId: number, sourceType: string) {
  try {
    const response = await apiRequest(
      "GET",
      `/api/symbolic-connections?sourceId=${sourceId}&sourceType=${sourceType}`,
      undefined
    );
    return response;
  } catch (error) {
    console.error("Error analyzing symbolic connections:", error);
    throw error;
  }
}

// Function to generate symbolic data for a new kernel
export async function generateSymbolicData(content: string, type: string) {
  try {
    const response = await apiRequest(
      "POST", 
      "/api/symbolic-data/generate", 
      { content, type }
    );
    return response;
  } catch (error) {
    console.error("Error generating symbolic data:", error);
    // Return a default structure if the API fails
    return {
      timestamp: new Date().toISOString(),
      symbols: ["fragment", "pattern", "echo"],
      numerics: [Math.floor(Math.random() * 100), Math.floor(Math.random() * 100)],
      dialect: "core"
    };
  }
}

// Function to analyze resonance patterns from user contributions
export async function analyzeResonancePatterns(userId: number) {
  try {
    const response = await apiRequest(
      "GET",
      `/api/resonance-patterns?userId=${userId}`,
      undefined
    );
    return response;
  } catch (error) {
    console.error("Error analyzing resonance patterns:", error);
    throw error;
  }
}

// Function to generate a symbolic connection between two nodes
export async function createSymbolicConnection(
  sourceId: number,
  sourceType: string,
  targetId: number,
  targetType: string
) {
  try {
    const response = await apiRequest(
      "POST",
      "/api/synaptic-connections",
      {
        sourceId,
        sourceType,
        targetId,
        targetType,
        connectionStrength: 1,
        symbolicRelation: "emerging"
      }
    );
    return response;
  } catch (error) {
    console.error("Error creating symbolic connection:", error);
    throw error;
  }
}

// Function to generate a unique user sigil
export async function generateUserSigil(userId: number) {
  try {
    const response = await apiRequest(
      "GET",
      `/api/user-sigil?userId=${userId}`,
      undefined
    );
    return response;
  } catch (error) {
    console.error("Error generating user sigil:", error);
    throw error;
  }
}
