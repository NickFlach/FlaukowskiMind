import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with Tailwind's utility classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date to a relative time string (e.g., "3 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  
  // Convert to seconds
  const diffSec = Math.floor(diffMs / 1000);
  
  if (diffSec < 60) {
    return `${diffSec} seconds ago`;
  }
  
  // Convert to minutes
  const diffMin = Math.floor(diffSec / 60);
  
  if (diffMin < 60) {
    return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  // Convert to hours
  const diffHour = Math.floor(diffMin / 60);
  
  if (diffHour < 24) {
    return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
  }
  
  // Convert to days
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffDay < 30) {
    return `${diffDay} ${diffDay === 1 ? 'day' : 'days'} ago`;
  }
  
  // Default to a formatted date for older items
  return past.toLocaleDateString();
}

/**
 * Creates a ripple effect for resonance interactions
 */
export function createRippleEffect(event: React.MouseEvent<HTMLElement>) {
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();
  
  // Calculate position relative to the button
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  // Calculate max dimension to ensure the ripple covers the entire element
  const size = Math.max(rect.width, rect.height);
  
  // Create ripple element
  const ripple = document.createElement('div');
  ripple.classList.add('resonance-ripple');
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x - size/2}px`;
  ripple.style.top = `${y - size/2}px`;
  
  // Add ripple to button
  button.appendChild(ripple);
  
  // Remove ripple after animation
  setTimeout(() => {
    ripple.remove();
  }, 1000);
}

/**
 * Generates a glyph SVG path for symbolic representation
 */
export function generateGlyphPath(seed: number): string {
  const seedValue = seed || Math.floor(Math.random() * 1000);
  const rng = mulberry32(seedValue);
  
  // Generate a series of path commands to create a unique glyph
  const pathCommands: string[] = [];
  
  // Start at center
  pathCommands.push('M50,50');
  
  // Add 3-7 line or curve segments
  const segmentCount = 3 + Math.floor(rng() * 5);
  
  for (let i = 0; i < segmentCount; i++) {
    const angle = rng() * Math.PI * 2;
    const distance = 15 + rng() * 35;
    const x = 50 + Math.cos(angle) * distance;
    const y = 50 + Math.sin(angle) * distance;
    
    // Occasionally make a curve instead of a line
    if (rng() > 0.6) {
      // Create a curve with a control point
      const ctrlDist = 10 + rng() * 20;
      const ctrlAngle = angle + (rng() - 0.5) * Math.PI;
      const cx = 50 + Math.cos(ctrlAngle) * ctrlDist;
      const cy = 50 + Math.sin(ctrlAngle) * ctrlDist;
      
      pathCommands.push(`Q${cx.toFixed(1)},${cy.toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`);
    } else {
      // Simple line
      pathCommands.push(`L${x.toFixed(1)},${y.toFixed(1)}`);
    }
  }
  
  // Close the path to create a shape in some cases
  if (rng() > 0.7) {
    pathCommands.push('Z');
  }
  
  return pathCommands.join(' ');
}

/**
 * Creates a simple pseudorandom number generator from a seed
 */
function mulberry32(seed: number) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Extracts and formats hashtags from text
 */
export function extractHashtags(text: string): string[] {
  const hashtagRegex = /#(\w+)/g;
  const matches = text.match(hashtagRegex);
  
  if (!matches) return [];
  
  // Remove the # symbol and return unique tags
  return [...new Set(matches.map(tag => tag.substring(1)))];
}

/**
 * Decodes a symbolic data object for visualization
 */
export function decodeSymbolicData(data: any): { 
  symbols: string[]; 
  numerics: number[]; 
  dialect: string; 
  timestamp: string;
} {
  // Default structure if data is missing
  const defaultData = {
    symbols: ["fragment", "pattern", "echo"],
    numerics: [0, 0],
    dialect: "core",
    timestamp: new Date().toISOString()
  };
  
  if (!data) return defaultData;
  
  return {
    symbols: Array.isArray(data.symbols) ? data.symbols : defaultData.symbols,
    numerics: Array.isArray(data.numerics) ? data.numerics : defaultData.numerics,
    dialect: data.dialect || defaultData.dialect,
    timestamp: data.timestamp || defaultData.timestamp
  };
}
