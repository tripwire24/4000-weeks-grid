
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedJournalEntry } from '../types';

if (!process.env.API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this context, we assume the key is set.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
const model = 'gemini-2.5-flash';

export const getTalkingPoints = async (userInput: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
        model,
        contents: `Based on the following user thought, generate 3 open-ended, reflective questions to help them journal more deeply. The questions should encourage introspection. User thought: "${userInput}"`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    questions: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                }
            }
        }
    });
    
    const jsonText = response.text.trim();
    const data = JSON.parse(jsonText);
    
    if (data && Array.isArray(data.questions)) {
        return data.questions;
    }
    return [];
  } catch (error) {
    console.error("Error getting talking points from Gemini:", error);
    throw new Error("Failed to generate talking points. Please check your API key and try again.");
  }
};

export const createJournalEntryFromPoints = async (
  topic: string,
  answers: { question: string; answer: string }[]
): Promise<GeneratedJournalEntry> => {
  const prompt = `
    A user is journaling about: "${topic}".
    They have answered the following reflective questions:
    ${answers.map(a => `Q: ${a.question}\nA: ${a.answer}`).join('\n\n')}

    Synthesize these answers into a cohesive and reflective journal entry.
    The entry should flow naturally. Also suggest a concise title for the entry,
    a single-word mood that captures the essence of the entry (e.g., Grateful, Reflective, Anxious, Hopeful),
    and up to 3 relevant tags as an array of strings.
  `;
  
  try {
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    content: { type: Type.STRING },
                    mood: { type: Type.STRING },
                    tags: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                }
            }
        }
    });

    const jsonText = response.text.trim();
    const data = JSON.parse(jsonText);
    
    return data as GeneratedJournalEntry;
  } catch (error) {
    console.error("Error creating journal entry from Gemini:", error);
    throw new Error("Failed to create journal entry. Please check your API key and try again.");
  }
};
