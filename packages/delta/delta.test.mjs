import test from "node:test";
import assert from "node:assert/strict";
import { agent, connect } from "./delta.agent.js";

test("delta agent definition metadata", () => {
  assert.equal(agent.id, "delta");
  assert.equal(agent.name, "Delta");
  assert.equal(agent.format, "json");
  assert.equal(agent.model, "portable.profiles.worker.model");
  assert.deepEqual(agent.ua, ["delta", "zed"]);
});

test("delta agent library configuration bridges ~/.agents", () => {
  assert.equal(agent.library.instructions, "~/.agents/AGENTS.md");
  assert.equal(agent.library.skills, "~/.agents/skills");
  assert.equal(agent.library.mcp, "~/.agents/mcp.json");
  assert.equal(agent.library.mcpFormat, "zed");
});

test("delta connect returns valid Delta schema without unknown root keys", () => {
  const result = connect({
    gateway: { url: "http://127.0.0.1:3425", v1: "http://127.0.0.1:3425/v1", key: "test-key" },
    model: { id: "group/auto-minimax-m3-1-flash-preview", name: "MiniMax M3.1 Flash" },
    models: [
      { id: "group/auto-minimax-m3-1-flash-preview", name: "MiniMax M3.1 Flash", context: 1000000, output: 128000, efforts: ["low", "high"] },
      { id: "group/space-bunny", name: "Space Bunny", context: 1000000, output: 32768, efforts: [] }
    ]
  });

  // Verify custom provider structure
  assert.ok(result["native.custom_providers"], "native.custom_providers should be defined");
  const providers = result["native.custom_providers"];
  assert.equal(providers.length, 1);
  assert.equal(providers[0].name, "Magpie");
  assert.equal(providers[0].base_url, "http://127.0.0.1:3425/v1");
  assert.equal(providers[0].api_mode, "open_ai_chat_completions");
  assert.equal(providers[0].headers[0].name, "Authorization");
  assert.equal(providers[0].headers[0].value, "Bearer test-key");
  assert.equal(providers[0].models.length, 2);
  assert.equal(providers[0].models[0].id, "group/auto-minimax-m3-1-flash-preview");
  assert.deepEqual(providers[0].models[0].reasoning_efforts, ["low", "high"]);

  // Verify subagent profiles
  assert.equal(result["portable.profiles.scout.model"], "group/auto-minimax-m3-1-flash-preview");
  assert.equal(result["portable.profiles.reviewer.model"], "group/auto-minimax-m3-1-flash-preview");

  // Verify no legacy Zed keys that violate Delta's StoredSettings schema
  for (const key of Object.keys(result)) {
    assert.ok(
      key.startsWith("portable.") || key.startsWith("native.") || key === "version",
      `Key ${key} must not be placed at root to avoid Serde deny_unknown_fields error`
    );
  }
});
