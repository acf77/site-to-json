# Site to JSON CLI

Convert any website URL to structured JSON using the power of Trapiche Cloud's Site to JSON service.

## Installation

```bash
# Using bun (recommended)
bun install -g site-to-json-cli

# Or run directly with bun
bun run cli.ts <url>
```

## Usage

```bash
# Basic usage
site-to-json https://example.com

# With API key
site-to-json https://example.com --api-key sk-your-key-here

# Or set API key as environment variable
export OPENAI_API_KEY=sk-your-key-here
site-to-json https://example.com

# Save to file
site-to-json https://example.com -o output.json

# Pretty print JSON
site-to-json https://example.com --pretty

# Show help
site-to-json --help
```

## Options

| Option | Short | Description |
|--------|-------|-------------|
| `--api-key` | `-k` | OpenAI API key |
| `--output` | `-o` | Output file path |
| `--pretty` | `-p` | Pretty print JSON output |
| `--help` | `-h` | Show help message |

## Compile to Binary

You can compile the CLI to a standalone executable:

```bash
bun build cli.ts --compile --outfile site-to-json
```

This creates a single binary file that can be run without Bun installed.

## Examples

### Convert a website and save to file
```bash
site-to-json https://vercel.com -o vercel.json --pretty
```

### Use with jq for filtering
```bash
site-to-json https://example.com | jq '.elements'
```

### Batch processing
```bash
for url in https://site1.com https://site2.com; do
  site-to-json "$url" -o "${url##*/}.json"
done
```

## License

MIT
