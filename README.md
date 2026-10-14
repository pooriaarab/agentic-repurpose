# agentic-repurpose

[![npm version](https://img.shields.io/npm/v/agentic-repurpose)](https://www.npmjs.com/package/agentic-repurpose)
[![Monthly downloads](https://img.shields.io/npm/dm/agentic-repurpose)](https://www.npmjs.com/package/agentic-repurpose)
[![MIT license](https://img.shields.io/badge/license-MIT-blue)](https://opensource.org/license/mit)

[Package](https://www.npmjs.com/package/agentic-repurpose) · [Source and support](https://github.com/pooriaarab/agentic-repurpose)

agentic-repurpose is an open-source content repurposing library that creates text drafts for developers. Six deterministic templates produce social captions, outlines, and scripts. It runs locally through TypeScript, a command-line interface, or Model Context Protocol (MCP).

## Install

```sh
npm install agentic-repurpose
```

Requires Node.js 18 or later. The package includes TypeScript declarations and has two direct runtime dependencies.

## Create your first draft

Run this command after installation. No credentials, environment variables, or `.env` loader are required.

```sh
npx agentic-repurpose repurpose --text "A useful source." --platforms linkedin,x-thread
```

Success prints JSON with `dryRun: true` and two variants. Each variant includes content, disclosure, a truncation report, and a score.

```js
import { repurpose, scoreVariant } from "agentic-repurpose";

const [draft] = repurpose("A useful source.", ["linkedin"]);
console.log(draft.content);
console.log(scoreVariant(draft));
```

The second output has `score: 100` and the reason `within platform limits and disclosed`.

## How it works

```text
Text / listing fields / loaded file or URL
                  |
          Fixed text templates
                  |
    Hashtags + truncation + disclosure
                  |
         Drafts + reports + scores
```

URL loading returns the response body as text. It does not extract article content from HTML.

## Why it exists

Developers can generate predictable drafts inside their own tools. Buffer handles scheduling; Repurpose.io handles distribution workflows. This package provides local text transformations.

## Compare

Scope checked on 2026-10-14 using the linked product documentation.

| Scope | agentic-repurpose | [Buffer](https://buffer.com/publish) | [Repurpose.io](https://support.repurpose.io/en/article/quick-start-guide-1aqbuu5/) |
| --- | --- | --- | --- |
| Primary operation | Local text templates | Compose, schedule, publish posts | Transform and distribute content |
| Workflow configuration | SDK arguments or CLI flags | Publishing interface | Connected source and destination accounts |

## Coverage

| Format or destination | Local draft | Publishing integration |
| --- | --- | --- |
| X (Twitter), `x-thread` | ✓ | — |
| LinkedIn, `linkedin` | ✓ | — |
| Instagram, `instagram-caption` | ✓ | — |
| Carousel outline, `carousel-outline` | ✓ | — |
| Short video script, `short-video-script` | ✓ | — |
| Reddit, `reddit-post` | ✓ | — |

The source registry has six templates and zero social publishing integrations. Local tests cover generation; no platform credentials are checked.

## Common use cases

1. Node.js developers convert release notes into LinkedIn drafts.
2. TypeScript tool builders produce X (Twitter) thread drafts for review.
3. MCP client users generate Instagram captions from supplied text.
4. Content teams use the Node.js CLI to turn local files into carousel outlines.

## Features

- **Source loading:** SDK helpers accept text, listing fields, files, and HTTP URLs.
- **Draft generation:** Six fixed templates use format-specific character and hashtag caps.
- **Disclosure:** Every generated draft includes an AI-assistance disclosure line.
- **Inspection:** Truncation reports and rule-based scores describe each draft.
- **Routing helpers:** Separate SDK helpers provide local receipts and generic HTTP POST delivery.
- **Guards:** Optional SDK guards enforce dispatch caps, UTC quiet hours, and text blocklists.

## Runtime surfaces

The Node.js SDK exports generation, source loading, scoring, text statistics, routing, guards, logging, and session cost helpers.

CLI commands: `repurpose`, `costs`, and `mcp`. Help uses `--help` or `-h`; version uses `--version` or `-V`.

`repurpose` accepts `--text`, `--file`, `--platforms`, `--dry-run`, and `--live --approve`.
The CLI defaults to dry-run. Live requires approval but still only generates drafts.

```sh
npx agentic-repurpose mcp
```

MCP exposes exactly two tools: `repurpose` and `score_variant`. Its `repurpose` tool requires `approved: true` when `live: true`.

The repository also contains a Worker handler with `GET /health` and `POST /repurpose`.
It is source code for deployment by the user, rather than a managed endpoint or package export.

## Delivery and behavior limits

Generation uses fixed templates, without a language-model API. It does not publish, schedule, render media, or create separate thread posts.
The X template caps the entire draft at 280 JavaScript string units.

Scores check disclosure, length, and truncation. They do not predict engagement or validate platform acceptance.
URL loading has no built-in retry or timeout configuration. Generic HTTP routing defaults to a ten-second timeout and has no retries.

Local routing returns a receipt without external delivery. HTTP routing sends `{ text }` to a caller-supplied endpoint.
Cost reports store in-memory units, rather than vendor billing totals. Draft generation does not record cost entries.

## Integration guides

Use the SDK example for Node.js applications. Use the MCP command for clients that support stdio servers.
For local files, run `npx agentic-repurpose repurpose --file source.txt --platforms linkedin`.
No public documentation site is configured in the repository metadata.

## Status

Version 0.1.0 is an early release; interfaces can change. Report problems through [GitHub issues](https://github.com/pooriaarab/agentic-repurpose/issues).
Public case studies are not yet published in this repository.

## FAQ

### What is agentic-repurpose?

agentic-repurpose is a local text draft generator. It offers six fixed templates through an SDK, CLI, and MCP server.

### Which integrations are verified?

agentic-repurpose has six locally tested templates. It has no credential-verified social publishing integrations.

### Does agentic-repurpose provide a managed publishing service?

agentic-repurpose provides local code. Users run the package and deploy any endpoints themselves.

### How is agentic-repurpose different from Buffer?

agentic-repurpose generates local drafts. [Buffer](https://buffer.com/publish) provides post scheduling and publishing.

### How is agentic-repurpose different from Repurpose.io?

agentic-repurpose transforms supplied text through fixed templates. [Repurpose.io](https://support.repurpose.io/en/article/quick-start-guide-1aqbuu5/) connects content sources and destinations for distribution workflows.

### Does it call an AI model?

agentic-repurpose does not call a model provider. Its output comes from fixed templates, despite the disclosure wording.

### Can it load a URL?

agentic-repurpose exports `loadSource` for HTTP URLs. It returns raw response text; the CLI accepts text or files.

### What does live mode do?

agentic-repurpose requires explicit approval for the CLI and MCP live flags. Those paths still generate drafts without social delivery.

## License

MIT.
