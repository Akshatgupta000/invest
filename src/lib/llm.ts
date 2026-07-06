export interface LLMRequest {
  task: string;
  messages: { role: "system" | "user"; content: string }[];
  responseFormat?: "json";
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export interface LLMResponse {
  content: string;
  provider: "groq" | "gemini" | "openai" | "fallback";
  model: string;
  latencyMs: number;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  success: boolean;
}

async function callGroq(req: LLMRequest, apiKey: string): Promise<LLMResponse> {
  const start = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), req.timeoutMs || 30000);

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: req.messages,
        temperature: req.temperature ?? 0.2,
        max_tokens: req.maxTokens,
        response_format: req.responseFormat === "json" ? { type: "json_object" } : undefined,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Groq HTTP error: ${res.status}`);
    }

    const data = await res.json();
    return {
      content: data.choices[0]?.message?.content || "",
      provider: "groq",
      model: "llama-3.3-70b-versatile",
      latencyMs: Date.now() - start,
      usage: {
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: data.usage?.completion_tokens ?? 0,
        totalTokens: data.usage?.total_tokens ?? 0,
      },
      success: true,
    };
  } catch (error: any) {
    clearTimeout(timeout);
    throw new Error(`Groq failed: ${error.message}`);
  }
}

async function callGemini(req: LLMRequest, apiKey: string): Promise<LLMResponse> {
  const start = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), req.timeoutMs || 30000);

  try {
    const systemInstruction = req.messages.find((m) => m.role === "system")?.content;
    const userPrompt = req.messages.find((m) => m.role === "user")?.content || "";

    const body: any = {
      contents: [{ parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: req.temperature ?? 0.2,
        maxOutputTokens: req.maxTokens,
      },
    };

    if (systemInstruction) {
      body.systemInstruction = { parts: [{ text: systemInstruction }] };
    }
    
    if (req.responseFormat === "json") {
      body.generationConfig.responseMimeType = "application/json";
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Gemini HTTP error: ${res.status}`);
    }

    const data = await res.json();
    return {
      content: data.candidates?.[0]?.content?.parts?.[0]?.text || "",
      provider: "gemini",
      model: "gemini-2.0-flash",
      latencyMs: Date.now() - start,
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount ?? 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
        totalTokens: data.usageMetadata?.totalTokenCount ?? 0,
      },
      success: true,
    };
  } catch (error: any) {
    clearTimeout(timeout);
    throw new Error(`Gemini failed: ${error.message}`);
  }
}

async function callOpenAI(req: LLMRequest, apiKey: string): Promise<LLMResponse> {
  const start = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), req.timeoutMs || 30000);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: req.messages,
        temperature: req.temperature ?? 0.2,
        max_tokens: req.maxTokens,
        response_format: req.responseFormat === "json" ? { type: "json_object" } : undefined,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`OpenAI HTTP error: ${res.status}`);
    }

    const data = await res.json();
    return {
      content: data.choices[0]?.message?.content || "",
      provider: "openai",
      model: "gpt-4o-mini",
      latencyMs: Date.now() - start,
      usage: {
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: data.usage?.completion_tokens ?? 0,
        totalTokens: data.usage?.total_tokens ?? 0,
      },
      success: true,
    };
  } catch (error: any) {
    clearTimeout(timeout);
    throw new Error(`OpenAI failed: ${error.message}`);
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function callLLM(req: LLMRequest, retries = 1): Promise<LLMResponse> {
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const openAIKey = process.env.OPENAI_API_KEY;

  let attempt = 0;
  let lastError = "";

  while (attempt <= retries) {
    if (attempt > 0) {
      // Exponential backoff
      await sleep(1000 * Math.pow(2, attempt));
    }
    attempt++;

    // Fallback logic
    if (groqKey) {
      try {
        return await callGroq(req, groqKey);
      } catch (err: any) {
        lastError = err.message;
        console.warn(`[LLM] Groq attempt ${attempt} failed: ${lastError}`);
      }
    }
    
    if (geminiKey) {
      try {
        return await callGemini(req, geminiKey);
      } catch (err: any) {
        lastError = err.message;
        console.warn(`[LLM] Gemini attempt ${attempt} failed: ${lastError}`);
      }
    }
    
    if (openAIKey) {
      try {
        return await callOpenAI(req, openAIKey);
      } catch (err: any) {
        lastError = err.message;
        console.warn(`[LLM] OpenAI attempt ${attempt} failed: ${lastError}`);
      }
    }
  }

  // If all fails, return a safe failure object
  return {
    content: req.responseFormat === "json" ? "{}" : "",
    provider: "fallback",
    model: "none",
    latencyMs: 0,
    success: false,
  };
}
