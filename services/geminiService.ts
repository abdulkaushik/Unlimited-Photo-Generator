import { GoogleGenAI } from "@google/genai";
import { GenerationRequest, AspectRatio } from "../types";

// Initialize Gemini Client
// Note: In a real production app, you might proxy this through a backend to protect the key,
// but for this task we use process.env.API_KEY directly as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash-image';

/**
 * Generates a single wallpaper variation.
 * We run this in parallel to get multiple variations.
 */
async function generateSingleWallpaper(prompt: string, aspectRatio: AspectRatio, referenceImage?: string): Promise<string> {
  const parts: any[] = [];

  // If there's a reference image for remixing, add it first
  if (referenceImage) {
    parts.push({
      inlineData: {
        mimeType: 'image/png', // Assuming PNG for simplicity/compatibility
        data: referenceImage,
      },
    });
  }

  // Add the text prompt
  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: parts,
      },
      config: {
        // Aspect ratio for phone wallpapers (9:16)
        imageConfig: {
          aspectRatio: aspectRatio, 
        }
      },
    });

    // Extract image from response
    // The response structure for images in Gemini 2.5 Flash Image:
    // candidates[0].content.parts[].inlineData
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No candidates returned");
    }

    const content = candidates[0].content;
    let base64Data: string | null = null;

    if (content.parts) {
      for (const part of content.parts) {
        if (part.inlineData && part.inlineData.data) {
          base64Data = part.inlineData.data;
          break;
        }
      }
    }

    if (!base64Data) {
      throw new Error("No image data found in response");
    }

    // Return as a displayable data URL
    return `data:image/png;base64,${base64Data}`;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

/**
 * Generates 2 variations of wallpapers based on the prompt.
 */
export const generateWallpapers = async (request: GenerationRequest): Promise<string[]> => {
  // Create 2 parallel requests to get variations
  const promises = Array(2).fill(null).map(() => generateSingleWallpaper(request.prompt, request.aspectRatio, request.referenceImage));
  
  try {
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error("Failed to generate batch:", error);
    throw error;
  }
};