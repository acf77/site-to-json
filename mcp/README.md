# Site to JSON MCP Server

Model Context Protocol (MCP) server for Site to JSON. Connect with Claude Code, Cursor, VS Code Copilot, OpenCode, and any MCP-compatible AI coding assistant.

## What is MCP?

MCP (Model Context Protocol) is an open standard that allows AI assistants to connect to external tools and data sources. Think of it like a USB-C port for AI applications - it provides a standardized way to extend AI capabilities.

## Supported AI Tools

- ✅ **Claude Code** (Anthropic's CLI tool)
- ✅ **Cursor** (AI-powered code editor)
- ✅ **VS Code + GitHub Copilot**
- ✅ **OpenCode** (AI coding assistant)
- ✅ **Any MCP-compatible client**

## Installation

```bash
cd mcp
bun install
```

## Configuration

### Claude Code

Add to your Claude Code configuration (`~/.claude/CLAUDE.md` or via the Claude Code UI):

```json
{
  "mcpServers": {
    "site-to-json": {
      "command": "bun",
      "args": ["/path/to/site-to-json/mcp/mcp-server.ts"],
      "env": {
        "OPENAI_API_KEY": "sk-your-key-here"
      }
    }
  }
}
```

Or use the CLI:
```bash
claude mcp add site-to-json bun /path/to/site-to-json/mcp/mcp-server.ts
```

### Cursor

Add to Cursor's MCP settings (Settings > Features > MCP):

```json
{
  "mcpServers": {
    "site-to-json": {
      "command": "bun",
      "args": ["/path/to/site-to-json/mcp/mcp-server.ts"],
      "env": {
        "OPENAI_API_KEY": "sk-your-key-here"
      }
    }
  }
}
```

### VS Code with Copilot

Add to your VS Code settings (`.vscode/settings.json`):

```json
{
  "github.copilot.chat.mcpServers": {
    "site-to-json": {
      "command": "bun",
      "args": ["${workspaceFolder}/mcp/mcp-server.ts"],
      "env": {
        "OPENAI_API_KEY": "${env:OPENAI_API_KEY}"
      }
    }
  }
}
```

### OpenCode

Add to your OpenCode configuration (`~/.config/opencode/config.toml` or project `.opencode.toml`):

```toml
[mcp.site-to-json]
command = "bun"
args = ["/path/to/site-to-json/mcp/mcp-server.ts"]
env = { OPENAI_API_KEY = "sk-your-key-here" }
```

## Available Tools

### 1. `convert_website_to_json`

Converts any website URL to structured JSON format.

**Parameters:**
- `url` (required): The website URL to convert
- `api_key` (optional): OpenAI API key (if not set via env var)

**Example usage in Claude Code:**
```
Can you convert https://example.com to JSON format?
```

### 2. `analyze_website_structure`

Analyzes a website's structure and returns a summary.

**Parameters:**
- `url` (required): The website URL to analyze

**Example usage:**
```
Analyze the structure of https://trapiche.cloud and tell me what components it uses.
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes* |
| `SITE_TO_JSON_API_URL` | Custom API endpoint | No |

\* Required unless passed per-request

## Example Conversations

### With Claude Code

**You:** Convert https://vercel.com to JSON

**Claude:** I'll convert that website to JSON for you.
*[uses convert_website_to_json tool]*

Here's the JSON structure for Vercel's homepage:
```json
{
  "root": "page-1",
  "elements": {
    "page-1": { "type": "Page", ... },
    ...
  }
}
```

### With Cursor

**You:** @site-to-json analyze the component structure of https://ui.shadcn.com

**Cursor:** Analyzing the website structure...
*[uses analyze_website_structure tool]*

The site contains:
- 12 Card components
- 3 Navigation sections  
- 8 Button components
- ...

## Testing

Test the MCP server manually:

```bash
# Set your API key
export OPENAI_API_KEY=sk-your-key

# Run the server
bun mcp-server.ts

# In another terminal, send a test request
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | bun mcp-server.ts
```

## Troubleshooting

### "OpenAI API key required"
Make sure you've set the `OPENAI_API_KEY` environment variable in your MCP server configuration.

### "Command not found: bun"
Ensure Bun is installed and in your PATH. Install from https://bun.sh

### Server not connecting
1. Check that the path to `mcp-server.ts` is absolute
2. Verify the file has execute permissions: `chmod +x mcp-server.ts`
3. Check stderr output for error messages

## License

MIT
