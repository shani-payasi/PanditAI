const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});

async function generateResponse(content) {

  try {

    const interaction = await ai.interactions.create({
      model: "gemini-3.8-flash",
      input: content,
      generation_config: {
        thinking_level: "low"
      }
    });

    return interaction.output_text;

  } catch (error) {

    console.error("Gemini API Error:", error);

    if (error.status === 429 || error.statusCode === 429) {
      return "AI service rate limit reached. Please try again later.";
    }

    return "AI service is temporarily unavailable.";
  }
}

module.exports = {
  generateResponse
};