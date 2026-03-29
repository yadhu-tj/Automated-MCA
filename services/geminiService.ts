import { GoogleGenAI, Type } from "@google/genai";
import { EventCategory, Role } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateGreetingSuggestion = async (
  category: EventCategory,
  recipientRole: Role,
  context: string
): Promise<{ title: string; message: string; tone: string } | null> => {
  const ai = getClient();
  if (!ai) return null;

  const prompt = `
    You are an assistant for a University MCA Department.
    Generate a ${category} greeting message for a ${recipientRole}.
    Context/Details: ${context}.
    
    The tone should be professional yet warm.
    Return the response in strict JSON format with keys: "suggestedTitle", "suggestedMessage", "tone".
    Do not include markdown code blocks.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedTitle: { type: Type.STRING },
            suggestedMessage: { type: Type.STRING },
            tone: { type: Type.STRING },
          },
          required: ["suggestedTitle", "suggestedMessage", "tone"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;

    const data = JSON.parse(text);
    return {
      title: data.suggestedTitle,
      message: data.suggestedMessage,
      tone: data.tone
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};
