const { Pinecone } = require("@pinecone-database/pinecone");

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const cohortChatGptIndex = pc.Index("cohort-chat-gpt");


// =========================
// CREATE MEMORY
// =========================

async function createMemory({
  vector,
  metadata = {},
  messageId,
}) {

  if (!messageId) {
    throw new Error("Message ID is required");
  }

  if (!Array.isArray(vector) || vector.length === 0) {
    throw new Error("Invalid or empty vector");
  }

  if (vector.length !== 768) {
    throw new Error(
      `Invalid vector dimension: ${vector.length}. Expected 768.`
    );
  }

  await cohortChatGptIndex.upsert({
    records: [
      {
        id: String(messageId),
        values: vector,
        metadata: metadata,
      },
    ],
  });

  console.log(
    "Memory stored in Pinecone:",
    messageId
  );
}


// =========================
// QUERY MEMORY
// =========================

async function queryMemory({
  queryVector,
  limit = 5,
}) {

  if (
    !Array.isArray(queryVector) ||
    queryVector.length === 0
  ) {
    throw new Error(
      "Invalid or empty query vector"
    );
  }

  if (queryVector.length !== 768) {
    throw new Error(
      `Invalid query vector dimension: ${queryVector.length}. Expected 768.`
    );
  }

  const data = await cohortChatGptIndex.query({
    vector: queryVector,
    topK: limit,
    includeMetadata: true,
  });

  return data.matches;
}


module.exports = {
  createMemory,
  queryMemory,
};