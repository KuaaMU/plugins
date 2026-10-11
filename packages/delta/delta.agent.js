// Delta (delta.dev by Zed Industries) as a magpie coding agent.
// Settings are stored in settings.json:
// - Windows: %APPDATA%/delta/settings.json
// - macOS / Linux: ~/.config/delta/settings.json (or $DELTA_CONFIG_DIR)
//
// Delta's settings root struct is StoredSettings with 3 fields: version, portable, native.
// Custom providers belong in: native.custom_providers
// Subagent profiles belong in: portable.profiles.{worker,scout,reviewer}.model
// Skills, AGENTS instructions, and MCP belong in: ~/.agents

function getDeltaConfigPath() {
  if (typeof process !== "undefined" && process.env?.DELTA_CONFIG_DIR) {
    return `${process.env.DELTA_CONFIG_DIR}/settings.json`;
  }
  const stack = new Error().stack || "";
  const isWindows =
    (typeof process !== "undefined" && process.platform === "win32") ||
    stack.includes("\\") ||
    stack.includes(":\\");

  return isWindows
    ? "$APPDATA/delta/settings.json"
    : "~/.config/delta/settings.json";
}

export const agent = {
  id: "delta",
  name: "Delta",
  bin: "delta",
  config: getDeltaConfigPath(),
  format: "json",
  model: "portable.profiles.worker.model",
  ua: ["delta", "zed"],
  notice: "Restart Delta if the model picker does not update immediately.",
  icon: "https://delta.dev/favicon.svg",
  library: {
    instructions: "~/.agents/AGENTS.md",
    mcp: "~/.agents/mcp.json",
    mcpFormat: "zed",
    skills: "~/.agents/skills",
  },
};

/**
 * Configure Delta to connect to magpie's local gateway.
 * @param {Object} context
 * @param {Object} context.gateway - { url, v1, key }
 * @param {Object} context.model - { id, name, context, output, efforts }
 * @param {Array} context.models - list of all active models in magpie
 */
export function connect({ gateway, model, models }) {
  const deltaModels = (models || []).map((m) => {
    return {
      id: m.id,
      context_window: m.context || 128000,
      max_output_tokens: m.output || 16384,
      reasoning_efforts: Array.isArray(m.efforts) ? m.efforts : [],
      parallel_tool_calls: true,
      interleaved_reasoning: false,
    };
  });

  const targetModelId = model?.id || deltaModels[0]?.id || "";

  const magpieProvider = {
    name: "Magpie",
    base_url: gateway?.v1 || "http://127.0.0.1:3425/v1",
    api_mode: "open_ai_chat_completions",
    headers: [
      {
        name: "Authorization",
        value: `Bearer ${gateway?.key || ""}`,
      },
    ],
    models: deltaModels,
  };

  const result = {
    "native.custom_providers": [magpieProvider],
    "portable.profiles.worker.model": targetModelId,
    "portable.profiles.scout.model": targetModelId,
    "portable.profiles.reviewer.model": targetModelId,
  };

  // Wire detection probe: store gateway key in native.env so Magpie recognizes Delta connection state
  if (gateway?.key) {
    result["native.env.MAGPIE_GATEWAY_KEY"] = gateway.key;
  }

  return result;
}
