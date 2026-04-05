#!/usr/bin/env bun
/**
 * Site to JSON MCP Server
 * Connects with Claude Code, Cursor, VS Code Copilot, and other MCP-compatible tools
 * 
 * Usage:
 *   bun mcp-server.ts
 * 
 * Add to Claude Code:
 *   Add to claude_desktop_config.json or .claude/CLAUDE.md:
 *   {
 *     "mcpServers": {
 *       "site-to-json": {
 *         "command": "bun",
 *         "args": ["/path/to/site-to-json/mcp/mcp-server.ts"],
 *         "env": {
 *           "OPENAI_API_KEY": "sk-xxx"
 *         }
 *       }
 *     }
 *   }
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const API_URL = process.env.SITE_TO_JSON_API_URL || "https://site-to-json.vercel.app/api/convert";
const API_KEY = process.env.OPENAI_API_KEY;

// Tool definitions
const TOOLS = [
  {
    name: "convert_website_to_json",
    description: "Convert any website URL to structured JSON format. Perfect for extracting website structure, content, and metadata for analysis, migration, or automation.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The website URL to convert (e.g., https://example.com)",
        },
        api_key: {
          type: "string",
          description: "OpenAI API key (optional if set via OPENAI_API_KEY env var)",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "analyze_website_structure",
    description: "Analyze a website's structure and return a summary of components, layout, and key elements. Great for understanding site architecture.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The website URL to analyze",
        },
      },
      required: ["url"],
    },
  },
];

interface ConvertResult {
  spec?: unknown;
  url?: string;
  raw?: string;
  error?: string;
}

async function convertWebsite(url: string, apiKey?: string): Promise<ConvertResult> {
  const key = apiKey || API_KEY;
  
  if (!key) {
    return { error: "OpenAI API key required. Set OPENAI_API_KEY environment variable." };
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: url.trim(),
        apiKey: key.trim(),
      }),
    });

    return await response.json();
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

// Create MCP server
const server = new Server(
  {
    name: "site-to-json",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "convert_website_to_json") {
    const url = args?.url as string;
    const apiKey = args?.api_key as string | undefined;
    
    if (!url) {
      return {
        content: [
          {
            type: "text",
            text: "Error: URL is required",
          },
        ],
        isError: true,
      };
    }

    const result = await convertWebsite(url, apiKey);

    if (result.error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${result.error}`,
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result.spec, null, 2),
        },
      ],
    };
  }

  if (name === "analyze_website_structure") {
    const url = args?.url as string;
    
    if (!url) {
      return {
        content: [
          {
            type: "text",
            text: "Error: URL is required",
          },
        ],
        isError: true,
      };
    }

    const result = await convertWebsite(url);

    if (result.error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${result.error}`,
          },
        ],
        isError: true,
      };
    }

    // Provide a summary analysis
    const spec = result.spec as Record<string, unknown>;
    const root = spec?.root as string;
    const elements = spec?.elements as Record<string, unknown>;
    
    const elementCount = elements ? Object.keys(elements).length : 0;
    const componentTypes = elements 
      ? [...new Set(Object.values(elements).map((e: unknown) => (e as {type?: string})?.type))]
      : [];

    const analysis = {
      url: result.url,
      summary: {
        totalElements: elementCount,
        rootComponent: root,
        componentTypes: componentTypes,
      },
      fullSpec: spec,
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(analysis, null, 2),
        },
      ],
    };
  }

  return {
    content: [
      {
        type: "text",
        text: `Unknown tool: ${name}`,
      },
    ],
    isError: true,
  };
});

// Start server with stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Log to stderr (stdout is used for MCP protocol)
  console.error("Site to JSON MCP Server running on stdio");
  console.error(`API URL: ${API_URL}`);
  console.error(`API Key: ${API_KEY ? "✓ Set" : "✗ Not set (will require in requests)"}`);
}

main().catch(console.error);
