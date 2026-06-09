import test from "node:test";
import assert from "node:assert/strict";
import { createChatResponse } from "./openrouterClient";

test("createChatResponse sends an OpenRouter chat completions request and returns assistant text", async () => {
  const originalFetch = global.fetch;
  let seenUrl = "";
  let seenBody = "";

  global.fetch = (async (input, init) => {
    seenUrl = String(input);
    seenBody = String(init?.body || "");

    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              role: "assistant",
              content: "Hello from OpenRouter"
            }
          }
        ]
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  }) as typeof fetch;

  try {
    const output = await createChatResponse({
      apiKey: "or-key",
      model: "openai/gpt-4.1-mini",
      instructions: "Be concise.",
      messages: [{ role: "user", content: "Hi there" }]
    });

    assert.equal(output, "Hello from OpenRouter");
    assert.equal(seenUrl, "https://openrouter.ai/api/v1/chat/completions");
    assert.match(seenBody, /"model":"openai\/gpt-4\.1-mini"/);
    assert.match(seenBody, /"role":"system"/);
    assert.match(seenBody, /"content":"Be concise\."/);
    assert.match(seenBody, /"role":"user"/);
    assert.match(seenBody, /"content":"Hi there"/);
  } finally {
    global.fetch = originalFetch;
  }
});
