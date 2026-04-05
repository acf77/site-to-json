#!/usr/bin/env bun
/**
 * Site to JSON CLI - Standalone, Offline-First
 * 
 * Converts any website URL to structured JSON using json-render.
 * Works completely offline - just needs an OpenAI API key.
 * 
 * Usage:
 *   site-to-json <url> [options]
 * 
 * No external API calls except to OpenAI!
 */

import { parseArgs } from "util";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { applySpecPatch } from "@json-render/core";
import { catalog } from "./catalog.js";

const MAX_HTML_LENGTH = 80_000;

interface ConvertResult {
  spec?: unknown;
  url?: string;
  raw?: string;
  error?: string;
}

function showHelp(): void {
  console.log(`
  Site to JSON CLI - Powered by json-render
  
  Converts any website to structured JSON. Works offline!

  Usage:
    site-to-json <url> [options]

  Options:
    --api-key, -k     OpenAI API key (or set OPENAI_API_KEY env var)
    --model, -m       OpenAI model (default: gpt-4o-mini)
    --output, -o      Output file (default: stdout)
    --pretty, -p      Pretty print JSON output (default: true)
    --raw, -r         Include raw AI response
    --help, -h        Show this help message

  Environment Variables:
    OPENAI_API_KEY    Required. Your OpenAI API key.
    OPENAI_MODEL      Optional. Model to use (default: gpt-4o-mini)

  Examples:
    # Basic usage
    site-to-json https://example.com
    
    # With specific model
    site-to-json https://example.com --model gpt-4o
    
    # Save to file
    site-to-json https://example.com -o result.json
    
    # Include raw response
    site-to-json https://example.com --raw -o output.json

  About:
    This CLI uses json-render to generate structured JSON specs.
    It fetches websites directly and uses OpenAI for AI generation.
    No data is sent to any service except OpenAI's API.
`);
}

function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

async function fetchWebsite(url: string): Promise<{ html: string; error?: string }> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SiteToJSON/1.0; +https://trapiche.cloud)",
        "Accept": "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      return { html: "", error: `HTTP ${response.status}` };
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return { html: "", error: "URL does not return HTML content" };
    }

    const html = await response.text();
    return { html };
  } catch (error) {
    return { 
      html: "", 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

async function convertWebsite(
  url: string, 
  apiKey: string, 
  model: string,
  includeRaw: boolean
): Promise<ConvertResult> {
  // Fetch website
  console.error(`Fetching ${url}...`);
  const { html, error: fetchError } = await fetchWebsite(url);
  
  if (fetchError) {
    return { error: `Failed to fetch: ${fetchError}` };
  }

  // Process content
  const pageContent = stripHtml(html).slice(0, MAX_HTML_LENGTH);
  const rawHtmlSnippet = html.slice(0, 20_000);

  // Build system prompt from catalog
  const systemPrompt = catalog.prompt({
    system: `You are a website structure analyzer. Given the HTML and text content of a webpage, extract its structure and content into a JSON specification using only the components defined in the catalog.

Rules:
- Represent the FULL page structure from top to bottom.
- Use "Page" as the root component.
- Preserve all meaningful text, headings, links, images, and data visible on the page.
- Use "Section" to group related content areas.
- Use "CardGrid" as a parent when there are multiple "Card" siblings.
- Use realistic extracted values — do not invent content not present on the page.
- Keep text concise but accurate to the source.

Styles (REQUIRED — every component MUST include a "style" object):
- Infer colors from the HTML/CSS: background colors, text colors, border colors.
- Infer spacing: padding and margin values visible in the layout.
- Infer shape: borderRadius for cards, buttons, badges, and containers.
- Infer typography: fontSize and fontWeight for headings and prominent text.
- Infer shadows: boxShadow for elevated cards or modals.
- If a value cannot be determined from the source, omit that specific field — but always include the style object itself.
- Use standard CSS values (e.g. "#1a1a2e", "8px", "1rem", "600").`,
  });

  const userPrompt = `Convert this website into a JSON spec.

URL: ${url}

=== RAW HTML (first 20KB) ===
${rawHtmlSnippet}

=== VISIBLE TEXT CONTENT ===
${pageContent}`;

  // Generate with OpenAI
  console.error(`Generating JSON spec with ${model}...`);
  
  const openai = createOpenAI({ apiKey });
  
  let text: string;
  try {
    const result = await generateText({
      model: openai(model),
      system: systemPrompt,
      prompt: userPrompt,
    });
    text = result.text;
  } catch (err) {
    return { 
      error: `AI generation failed: ${err instanceof Error ? err.message : String(err)}` 
    };
  }

  // Parse patches and apply with json-render
  console.error("Applying json-render patches...");
  
  let spec: unknown;
  try {
    const patches: unknown[] = [];
    let buffer = "";
    for (const line of text.split("\n")) {
      buffer += (buffer ? "\n" : "") + line;
      try {
        patches.push(JSON.parse(buffer));
        buffer = "";
      } catch {
        // incomplete — keep accumulating
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = {};
    for (const patch of patches) {
      current = applySpecPatch(current, patch as unknown as Parameters<typeof applySpecPatch>[1]);
    }
    spec = current;
  } catch (err) {
    return { 
      raw: text, 
      error: `Could not parse JSON from AI response: ${err instanceof Error ? err.message : String(err)}` 
    };
  }

  const result: ConvertResult = { spec, url };
  if (includeRaw) {
    result.raw = text;
  }
  
  return result;
}

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      "api-key": { type: "string", short: "k" },
      "model": { type: "string", short: "m" },
      "output": { type: "string", short: "o" },
      "pretty": { type: "boolean", short: "p", default: true },
      "raw": { type: "boolean", short: "r", default: false },
      "help": { type: "boolean", short: "h", default: false },
    },
    strict: true,
    allowPositionals: true,
  });

  if (values.help) {
    showHelp();
    process.exit(0);
  }

  if (positionals.length === 0) {
    console.error("Error: URL required");
    console.error("Run with --help for usage");
    process.exit(1);
  }

  const url = positionals[0];
  const apiKey = values["api-key"] || process.env.OPENAI_API_KEY;
  const model = values.model || process.env.OPENAI_MODEL || "gpt-4o-mini";

  // Validate URL
  try {
    new URL(url);
  } catch {
    console.error(`Error: Invalid URL "${url}"`);
    process.exit(1);
  }

  // Validate API key
  if (!apiKey) {
    console.error("Error: OpenAI API key required.");
    console.error("Set OPENAI_API_KEY environment variable or use --api-key flag.");
    process.exit(1);
  }

  // Convert
  const result = await convertWebsite(url, apiKey, model, values.raw);

  if (result.error) {
    console.error(`Error: ${result.error}`);
    if (result.raw && !values.raw) {
      console.error("\nRaw AI response (for debugging):");
      console.error(result.raw.slice(0, 1000) + "...");
    }
    process.exit(1);
  }

  // Format output
  const output = values.pretty
    ? JSON.stringify(result.spec, null, 2)
    : JSON.stringify(result.spec);

  // Write to file or stdout
  if (values.output) {
    await Bun.write(values.output, output);
    console.error(`✓ Saved to ${values.output}`);
  } else {
    console.log(output);
  }
}

main().catch((err) => {
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
