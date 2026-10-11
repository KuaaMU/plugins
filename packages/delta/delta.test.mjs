import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { agent, connect } from "./delta.agent.js";

test("delta agent definition metadata", () => {
  assert.equal(agent.id, "delta");
  assert.equal(agent.name, "Delta");
  assert.equal(agent.format, "json");
  assert.equal(agent.model, "portable.profiles.worker.model");
  assert.deepEqual(agent.ua, ["delta", "zed"]);
  assert.ok(agent.config.includes("settings.json"));
});

test("delta agent library configuration bridges ~/.agents", () => {
  assert.equal(agent.library.instructions, "~/.agents/AGENTS.md");
  assert.equal(agent.library.skills, "~/.agents/skills");
  assert.equal(agent.library.mcp, "~/.agents/mcp.json");
  assert.equal(agent.library.mcpFormat, "zed");
});

test("delta connect returns valid Delta schema and captures gateway key for wire probe", () => {
  const result = connect({
    gateway: { url: "http://127.0.0.1:3425", v1: "http://127.0.0.1:3425/v1", key: "test-gateway-key" },
    model: { id: "test-model-1", name: "Test Model 1" },
    models: [
      { id: "test-model-1", name: "Test Model 1", context: 1000000, output: 128000, efforts: ["low", "high"] },
      { id: "test-model-2", name: "Test Model 2", context: 500000, output: 32768, efforts: [] }
    ]
  });

  // Verify custom provider structure
  assert.ok(result["native.custom_providers"], "native.custom_providers should be defined");
  const providers = result["native.custom_providers"];
  assert.ok(providers.length >= 1);
  const magpie = providers.find((p) => p.name === "Magpie");
  assert.ok(magpie);
  assert.equal(magpie.base_url, "http://127.0.0.1:3425/v1");
  assert.equal(magpie.api_mode, "open_ai_chat_completions");
  assert.equal(magpie.headers[0].name, "Authorization");
  assert.equal(magpie.headers[0].value, "Bearer test-gateway-key");
  assert.equal(magpie.models.length, 2);
  assert.equal(magpie.models[0].id, "test-model-1");
  assert.deepEqual(magpie.models[0].reasoning_efforts, ["low", "high"]);

  // Verify worker, scout, and reviewer profiles
  assert.equal(result["portable.profiles.worker.model"], "test-model-1");
  assert.equal(result["portable.profiles.scout.model"], "test-model-1");
  assert.equal(result["portable.profiles.reviewer.model"], "test-model-1");

  // Verify wire probe captures gateway key in native.env
  assert.equal(result["native.env.MAGPIE_GATEWAY_KEY"], "test-gateway-key");

  // Verify no unknown root keys
  for (const key of Object.keys(result)) {
    assert.ok(
      key.startsWith("portable.") || key.startsWith("native.") || key === "version",
      `Key ${key} must adhere to StoredSettings hierarchy`
    );
  }
});
