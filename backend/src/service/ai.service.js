const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Fast active models in priority order with instant fallback
const FAST_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
];

// =========================
// Generate AI Response (Optimized for Low Latency)
// =========================
async function generateResponse(content) {
  // Normalize content into standard Gemini format: [{ role, parts: [{ text }] }]
  let contents = [];

  if (typeof content === "string") {
    contents = [{ role: "user", parts: [{ text: content }] }];
  } else if (Array.isArray(content)) {
    contents = content.map((item) => {
      // Legacy interaction format: { type: 'user_input' | 'model_output', content: [{ text }] }
      if (item.type && item.content) {
        const role = item.type === "model_output" ? "model" : "user";
        const text =
          typeof item.content[0] === "string"
            ? item.content[0]
            : item.content[0]?.text || "";
        return { role, parts: [{ text }] };
      }
      // Standard role/parts format
      if (item.role && item.parts) {
        return item;
      }
      // Simple role/content format
      if (item.role && item.content) {
        return {
          role: item.role === "model" ? "model" : "user",
          parts: [{ text: item.content }],
        };
      }
      return { role: "user", parts: [{ text: JSON.stringify(item) }] };
    });
  }

  // Ensure consecutive turns alternate roles as required by Gemini
  const sanitizedContents = [];
  for (const turn of contents) {
    if (sanitizedContents.length > 0) {
      const prev = sanitizedContents[sanitizedContents.length - 1];
      if (prev.role === turn.role) {
        // Merge text if duplicate role
        prev.parts[0].text += "\n" + turn.parts[0].text;
        continue;
      }
    }
    sanitizedContents.push(turn);
  }

  // Try the fastest responsive model first, with instant fallback
  let lastError = null;
  for (const model of FAST_MODELS) {
    try {
      console.log(`[AI Service] Generating response with ${model}...`);
      const response = await ai.models.generateContent({
        model: model,
        contents: sanitizedContents,
        config: {
          temperature: 0.7,
        },
      });

      const text = response?.text;
      if (text && text.trim().length > 0) {
        return text;
      }
    } catch (error) {
      console.warn(
        `[AI Service] Model ${model} failed (${error.status || error.code || error.message}). Trying next...`
      );
      lastError = error;
    }
  }

  throw lastError || new Error("All Gemini models failed to respond");
}

// =========================
// Generate Vector Embedding
// =========================
async function generateVector(content) {
  try {
    const text = typeof content === "string" ? content : JSON.stringify(content);
    const response = await ai.models.embedContent({
      model: "gemini-embedding-2",
      contents: text,
      config: {
        outputDimensionality: 768,
      },
    });

    return response.embeddings[0].values;
  } catch (error) {
    console.error("[AI Service] Gemini Embedding Error:", error.message);
    throw error;
  }
}

module.exports = {
  generateResponse,
  generateVector,
};
