# magpie-agent-delta

> Use any AI model in [Delta](https://delta.dev) (by Zed Industries) through [magpie](https://usemagpie.ai).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![magpie-plugin](https://img.shields.io/badge/topic-magpie--plugin-orange.svg)](https://github.com/topics/magpie-plugin)

## Features

- **Any Model Routing**: Switch Delta to Claude, GPT, DeepSeek, Gemini, MiniMax, or any custom routing group in one click via Magpie.
- **Reasoning Effort Passthrough**: Automatically maps model reasoning / thinking effort (`low`, `medium`, `high`, `xhigh`, `max`) into Delta's `reasoning_efforts`.
- **Accurate Context Windows**: Dynamically passes the model's actual context window (`context_window`) and output token limit (`max_output_tokens`).
- **Safe Stash & Restoration**: Seamlessly injects `Magpie` into Delta's `native.custom_providers` and preserves existing custom providers. Upon disconnect, Magpie restores original user settings.
- **Library Ecosystem Synchronization**: Integrates Magpie's Library skills and MCP tools directly into `~/.agents/skills`, `~/.agents/mcp.json`, and `~/.agents/AGENTS.md`.

---

## Installation & Usage

### Method 1: Via Magpie Discover (Recommended)
1. Open Magpie and go to **Plugins** -> **Discover**.
2. Search for **Delta** or locate `magpie-agent-delta`.
3. Click **Install**.
4. Return to the **Agent** page and choose any model on the Delta row!

### Method 2: Via CLI
```bash
# Local development mount
magpie plugin add F:/magpie-agent-delta

# Or install from npm (once published)
magpie plugin add @magpie-community/agent-delta
```

---

## How It Works

This agent integration is built against Magpie's Agent Plugin Specification and targets Delta's native engine:
1. **Config Discovery**: Discovers Delta's configuration path (`%APPDATA%\delta\settings.json` on Windows, `~/.config/delta/settings.json` on macOS/Linux, or `$DELTA_CONFIG_DIR`).
2. **Native Custom Provider Injection**: Injects the `Magpie` OpenAI-compatible gateway into `native.custom_providers` adhering to Delta's `StoredSettings` schema.
3. **Multi-Agent Profile Binding**: Synchronizes the selected model across Delta profiles (`worker`, `scout`, `reviewer`) under `portable.profiles`.
4. **Library Bridging**: Symlinks/copies Library assets into `~/.agents/skills` and `~/.agents/mcp.json`.
5. **Clean Unwire**: Automatically restores original custom providers and profiles on disconnect.

---

## 中文说明

### 🌟 特性

- 🔄 **全模型支持**: 在 Magpie 的 Agents 界面一键将 Delta 切换至任意大模型或自定义路由组。
- 🧠 **思考等级透传**: 自动将模型推理思考深度同步至 Delta 的 `reasoning_efforts`。
- 📏 **精准上下文窗口**: 动态传递各模型的实际上下文窗口长度与最大输出 Token。
- 🛡️ **无损注入与平滑恢复**: 在 `native.custom_providers` 注入 Magpie 网关并保留用户已有自定义 Provider，断开时 100% 恢复。
- 📚 **Library 生态互通**: 自动对齐 Magpie 的 Library（Skills、MCP）到 Delta 识别的 `~/.agents/skills` 与 `~/.agents/mcp.json`。

### ⚙️ 使用说明

1. 在 Magpie 插件市场安装 Delta 插件后，在 Agents 列表点击连接。
2. 若 Delta 正在运行，请重启 Delta 使新注入的 Custom Provider 生效。
3. 在 Delta 模型选择器中选择 Magpie 路由的模型即可开始对话。

---

## License

MIT © [KuaaMU](https://github.com/KuaaMU)
