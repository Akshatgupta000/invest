import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { z } from "zod";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export function getChatModel(temperature = 0.2): BaseChatModel {
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (groqKey) {
    return new ChatGroq({
      apiKey: groqKey,
      model: "llama-3.3-70b-versatile",
      temperature,
      maxRetries: 3,
    }) as unknown as BaseChatModel;
  }

  if (geminiKey) {
    return new ChatGoogleGenerativeAI({
      apiKey: geminiKey,
      model: "gemini-2.0-flash",
      temperature,
      maxRetries: 3,
    }) as unknown as BaseChatModel;
  }

  throw new Error("No valid LLM API key found (GROQ_API_KEY or GEMINI_API_KEY required).");
}

export async function callLLMWithSchema<T>(
  prompt: string,
  schema: z.ZodType<T>,
  temperature = 0.2
): Promise<T> {
  // Light stagger to help with concurrent calls from news.ts, scenarios.ts, competitors.ts
  await delay(Math.random() * 3000);

  const model = getChatModel(temperature);
  const structuredLlm = model.withStructuredOutput(schema, { name: "Output" });
  const response = await structuredLlm.invoke(prompt);
  return response as T;
}
