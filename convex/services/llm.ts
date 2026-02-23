import { GoogleGenerativeAI } from "@google/generative-ai";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is not set");
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Call Gemini 1.5 Flash for text generation.
 * This is the ONLY place in the codebase allowed to make outbound LLM calls.
 */
export async function callGemini(prompt: string): Promise<string> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}

/**
 * Generate a 768-dimensional embedding vector for the given text using
 * Gemini's text-embedding-004 model (successor to embedding-001, same 768 dims).
 */
export async function createEmbedding(text: string): Promise<number[]> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(text);
  return result.embedding.values;
}
