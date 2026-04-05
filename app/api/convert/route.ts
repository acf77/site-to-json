import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { applySpecPatch } from "@json-render/core";
import { catalog } from "@/lib/catalog";

const MAX_HTML_LENGTH = 80_000;

function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export async function POST(req: NextRequest) {
  let url: string;
  let apiKey: string | undefined;

  try {
    const body = await req.json();
    url = body.url;
    apiKey = typeof body.apiKey === "string" && body.apiKey.trim() ? body.apiKey.trim() : undefined;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json({ error: "No OpenAI API key provided." }, { status: 400 });
  }

  // Ensure the URL is valid and uses http/https
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json(
        { error: "Only http and https URLs are supported" },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // Fetch the website
  let html: string;
  try {
    const response = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; site-to-json/1.0; +https://github.com/acf77/trapiche)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: HTTP ${response.status}` },
        { status: 502 }
      );
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      return NextResponse.json(
        { error: "URL does not return HTML content" },
        { status: 400 }
      );
    }

    html = await response.text();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Could not fetch URL: ${message}` },
      { status: 502 }
    );
  }

  // Truncate to avoid exceeding context limits
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

URL: ${parsedUrl.toString()}

=== RAW HTML (first 20KB) ===
${rawHtmlSnippet}

=== VISIBLE TEXT CONTENT ===
${pageContent}`;

  const openai = createOpenAI({
    apiKey,
  });

  let text: string;
  try {
    const result = await generateText({
      model: openai("gpt-5.4-nano-2026-03-17"),
      system: systemPrompt,
      prompt: userPrompt,
      maxTokens: 8192,
    });
    text = result.text;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `AI generation failed: ${message}` },
      { status: 500 }
    );
  }

  // The catalog prompt instructs the model to return JSONL patch operations.
  // Parse each patch, accumulating lines in case a single patch spans multiple lines.
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

    let current = {};
    for (const patch of patches) {
      current = applySpecPatch(current, patch);
    }
    spec = current;
  } catch {
    return NextResponse.json({ raw: text, error: "Could not parse JSON from AI response" }, { status: 200 });
  }

  return NextResponse.json({ spec, url: parsedUrl.toString() });
}
