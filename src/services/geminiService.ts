import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface MathSolution {
  understoodProblem: string;
  explanation: string;
  steps: { title: string; content: string }[];
  answer: string;
  helpingQuestions: { question: string; hint: string }[];
}

const SYSTEM_PROMPT = `You are "AI maths buddy", a highly intelligent, patient, and encouraging math tutor for students.
Your goal is not just to provide the answer, but to help the student *understand* the underlying concepts.

When solving a problem:
1. Clearly restate the problem to show you understood it.
2. Provide a high-level explanation of the strategy or concept needed.
3. Break down the solution into clear, logical steps.
4. Provide the final answer clearly.
5. Create 3 "Helping Questions" that are similar to the original problem but slightly different, to help the student practice. For each helping question, provide a small hint.

Always respond in valid JSON format.`;

export async function solveMathProblem(
  input: { text?: string; imageBase64?: string; mimeType?: string }
): Promise<MathSolution> {
  const model = "gemini-3.1-pro-preview";
  
  const parts: any[] = [];
  
  if (input.text) {
    parts.push({ text: input.text });
  }
  
  if (input.imageBase64 && input.mimeType) {
    parts.push({
      inlineData: {
        data: input.imageBase64,
        mimeType: input.mimeType,
      },
    });
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          understoodProblem: { type: Type.STRING },
          explanation: { type: Type.STRING },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING },
              },
              required: ["title", "content"],
            },
          },
          answer: { type: Type.STRING },
          helpingQuestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                hint: { type: Type.STRING },
              },
              required: ["question", "hint"],
            },
          },
        },
        required: ["understoodProblem", "explanation", "steps", "answer", "helpingQuestions"],
      },
    },
  });

  if (!response.text) {
    throw new Error("No response from AI");
  }

  return JSON.parse(response.text) as MathSolution;
}
