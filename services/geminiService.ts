
import { GoogleGenAI, Type } from "@google/genai";
import { Category, Difficulty, Question } from "../types";

export const generateQuestions = async (
  category: Category,
  difficulty: Difficulty,
  region: string
): Promise<Question[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Generate a set of 5 educational multiple-choice questions. 
    Topic: ${category}
    Difficulty: ${difficulty}
    ${region ? `Specific Region/Context: ${region}` : ""}
    Ensure questions are engaging, factually accurate, and culturally sensitive.
    Return the response as a JSON array.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: 'The question text.' },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: 'Four multiple choice options.'
            },
            correctAnswerIndex: { type: Type.INTEGER, description: 'Index of the correct answer (0-3).' },
            explanation: { type: Type.STRING, description: 'A brief educational explanation.' },
            points: { type: Type.INTEGER, description: 'Points awarded (suggested: Easy 100, Med 200, Hard 300).' }
          },
          required: ["text", "options", "correctAnswerIndex", "explanation", "points"]
        }
      }
    }
  });

  const rawJson = response.text.trim();
  const parsed = JSON.parse(rawJson);
  
  return parsed.map((q: any, index: number) => ({
    ...q,
    id: `q-${index}`
  }));
};
