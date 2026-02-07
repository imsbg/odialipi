import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API Client
// Ideally, the API key should be checked here, but we will handle missing keys gracefully in the UI.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-3-flash-preview';

/**
 * Transliterates English phonetic text to Odia script using Gemini.
 * It strictly instructs the model to transliterate, not translate.
 */
export const transliterateToOdia = async (text: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }
  
  if (!text.trim()) return "";

  try {
    const prompt = `
      You are a strict transliteration engine. 
      Task: Convert the following phonetic English text into Odia (Oriya) script.
      Rules:
      1. Do NOT translate the meaning. Convert the sounds (phonemes) to Odia script.
      2. Maintain punctuation and formatting (newlines, spacing).
      3. Output ONLY the Odia text. No explanations.
      4. Example: "namaskar" -> "ନମସ୍କାର"
      5. Example: "mu bhala achi" -> "ମୁଁ ଭଲ ଅଛି"
      
      Input text:
      "${text}"
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Transliteration error:", error);
    throw new Error("Failed to transliterate text. Please try again.");
  }
};
