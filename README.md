# agentic-repurpose

Turn one source into disclosed, platform-ready variants for X threads, LinkedIn, Instagram, carousels, short videos, and Reddit.

```sh
npm install
npm run build
node dist/cli.js repurpose --text "A useful source" --platforms linkedin,x-thread
```

The CLI defaults to dry-run. Live actions require both `--live` and `--approve`.

```js
import { repurpose, scoreVariant } from "agentic-repurpose";
const variants = repurpose("A useful source", ["linkedin"]);
console.log(variants, scoreVariant(variants[0]));
```

Every generated variant includes an AI-assistance disclosure, respects character and hashtag caps, and reports safe truncation. URL sources can be loaded with `loadSource(url, { fetchFn })`; inject `fetchFn` in tests.

## MCP

Run `node dist/cli.js mcp`, then use `repurpose` or `score_variant`. MCP repurpose is dry-run by default; a live action requires `live: true` and `approved: true`.
