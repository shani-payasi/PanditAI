const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});


// =========================
// Generate AI Response
// =========================

async function generateResponse(content) {

  try {

    console.log(
      "Sending to Gemini:",
      JSON.stringify(content, null, 2)
    );

    const interaction = await ai.interactions.create({
      model: "gemini-3.8-flash",
      input: content,
      generation_config: {
        thinking_level: "low"
      }
    });

    console.log(
      "Gemini Interaction:",
      interaction
    );

    return interaction.output_text;

  } catch (error) {

    console.error(
      "========== GEMINI ERROR =========="
    );

    console.error("Message:", error.message);
    console.error("Status:", error.status);
    console.error("Status Code:", error.statusCode);
    console.error("Error:", error);

    console.error(
      "=================================="
    );

    throw error;
  }
}


// =========================
// Generate Vector
// =========================

async function generateVector(content) {

  try {

    const response = await ai.models.embedContent({
      model: "gemini-embedding-2",
      contents: content,
      config: {
        outputDimensionality: 768
      }
    });

    return response.embeddings[0].values;

  } catch (error) {

    console.error(
      "Gemini Embedding Error:",
      error
    );

    throw error;
  }
}


// =========================
// Export
// =========================

module.exports = {
  generateResponse,
  generateVector
};