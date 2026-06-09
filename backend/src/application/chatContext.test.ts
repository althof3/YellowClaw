import test from "node:test";
import assert from "node:assert/strict";
import { buildProjectInstructions } from "./chatContext";

test("buildProjectInstructions appends uploaded file knowledge after the system prompt", () => {
  const instructions = buildProjectInstructions("Answer briefly.", [
    {
      id: "file_1",
      projectId: "project_1",
      providerFileId: null,
      filename: "pricing.md",
      contentText: "Plan A costs 10 dollars per seat.",
      createdAt: "2026-06-09T00:00:00.000Z"
    }
  ]);

  assert.match(instructions, /^Answer briefly\./);
  assert.match(instructions, /Attached knowledge files:/);
  assert.match(instructions, /\[pricing\.md\]/);
  assert.match(instructions, /Plan A costs 10 dollars per seat\./);
});

test("buildProjectInstructions ignores uploaded files with empty content", () => {
  const instructions = buildProjectInstructions("Base prompt", [
    {
      id: "file_1",
      projectId: "project_1",
      providerFileId: null,
      filename: "empty.txt",
      contentText: "   ",
      createdAt: "2026-06-09T00:00:00.000Z"
    }
  ]);

  assert.equal(instructions, "Base prompt");
});
