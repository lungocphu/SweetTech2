import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, ProductProfile } from "../types";

// IMPORTANT: API Key should be in process.env.API_KEY

export const analyzeProductProfile = async (
  text: string,
  mediaFile: File | null,
  language: string
): Promise<{ profile: ProductProfile; sources: string[] }> => {
  
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelId = "gemini-3-pro-preview";

  let base64Data: string | null = null;
  let mimeType: string | null = null;

  if (mediaFile) {
    base64Data = await fileToBase64(mediaFile);
    mimeType = mediaFile.type;
  }

  const userPrompt = `
    Input Query: ${text}
    Target Language: ${language} (Translate content to this language).
    
    TASK: detailed Product Profiling ONLY.
    
    1. Identify Name, Brand, Weight, Price, Type, Origin, Manufacturer, and Importer.
    2. Extract the FULL ingredient list exactly as written on the label.
    3. Identify E-numbers (Codex) and explain their function.
    4. Identify allergens.
    5. Estimate Specs: Moisture, Brix, Texture, Flavor Profile.

    OUTPUT FORMAT:
    Return **ONLY** raw JSON. Structure:
    {
      "profile": {
        "name": "...", "brand": "...", "netWeight": "...", "price": "...", "type": "...", "origin": "...", "manufacturer": "...", "importer": "...",
        "labelIngredients": "...",
        "ingredients": ["..."],
        "additives": [{"code": "...", "name": "...", "function": "..."}],
        "allergens": ["..."],
        "specs": { "moisture": "...", "brix": "...", "texture": "...", "flavorProfile": "..." }
      }
    }
  `;

  const parts: any[] = [{ text: userPrompt }];

  if (base64Data && mimeType) {
    parts.push({
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.3,
      },
      contents: { parts: parts },
    });

    let resultText = response.text || "";
    resultText = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
    const data = JSON.parse(resultText);
    
    const sources = extractSources(response);

    return { profile: data.profile, sources };

  } catch (error) {
    console.error("Gemini Profile API Error:", error);
    throw new Error("Failed to analyze profile.");
  }
};

export const analyzeProductInsights = async (
  text: string,
  mediaFile: File | null,
  profile: ProductProfile,
  language: string
): Promise<Partial<AnalysisResult>> => {
  
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelId = "gemini-3-pro-preview";

  let base64Data: string | null = null;
  let mimeType: string | null = null;

  if (mediaFile) {
    base64Data = await fileToBase64(mediaFile);
    mimeType = mediaFile.type;
  }

  const userPrompt = `
    Target Language: ${language} (Translate output).
    
    CONTEXT - Product Profile: ${JSON.stringify(profile)}
    ORIGINAL INPUT: ${text}
    
    TASK: Deep R&D Market Analysis & Strategy.
    
    1. **Benchmarking:** Find 3 direct competitors (Prioritize Vietnam/Asia). Compare Price, USP, Sensory, Nutrition.
    2. **Radar Chart:** Score (1-10) for Sweetness, Sourness, Aroma, Texture, Appearance.
    3. **SWOT:** Strengths, Weaknesses, Opportunities, Threats.
    4. **Improvements:** 3 R&D ideas.
    5. **Reviews:** Summarize customer sentiment and key themes.
    6. **Persona:** Target audience & expansion.

    OUTPUT FORMAT:
    Return **ONLY** raw JSON. Structure:
    {
      "competitors": [...],
      "radarChart": [...],
      "swot": {...},
      "improvements": [...],
      "reviews": {...},
      "persona": {...}
    }
    See previous system instructions for detailed schema of these objects.
  `;

  const parts: any[] = [{ text: userPrompt }];
  // We include the image again to help with competitor visual comparison if needed
  if (base64Data && mimeType) {
    parts.push({
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.5,
      },
      contents: { parts: parts },
    });

    let resultText = response.text || "";
    resultText = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
    const data = JSON.parse(resultText);
    
    const sources = extractSources(response);

    return { ...data, sources };

  } catch (error) {
    console.error("Gemini Insights API Error:", error);
    throw new Error("Failed to generate insights.");
  }
};

const extractSources = (response: any): string[] => {
  const sources: string[] = [];
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (groundingChunks) {
    groundingChunks.forEach((chunk: any) => {
       if (chunk.web?.uri) {
         sources.push(chunk.web.uri);
       }
    });
  }
  return Array.from(new Set(sources));
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};