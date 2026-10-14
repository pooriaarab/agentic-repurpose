---
name: agentic-repurpose
description: Turn one source into platform-ready post variants. Keywords: repurpose,content,social,agentic-suite,cli,mcp.
---

# agentic-repurpose

Turn one source into platform-ready post variants.

## Use the SDK

```js
import { summarizeText, dispatchText } from "agentic-repurpose";

summarizeText("some text");
await dispatchText("some text", { dryRun: true });
```

## Use the CLI

```sh
agentic-repurpose summary --text "some text"
agentic-repurpose dispatch --text "some text" --dry-run
```

## Use the MCP server

Start the server with `agentic-repurpose mcp`. Call `summarize_text`
for stats, `dispatch_text` for routes, `get_cost_report` for costs.

## Rules

- Preview each route with dry run first.
- Report guard denials and adapter errors as failures.
- Read the cost report at the end.
