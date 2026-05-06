# AI JSON Format

Free, ad-supported developer tools website for JSON, hashes, timestamps, encoding and AI-assisted data cleanup.

## What is included

- Home page with tool discovery and a quick JSON formatter
- Independent SEO pages for each tool
- Browser-local tools:
  - AI JSON Repair
  - JSON Formatter
  - JSON Validator
  - JSON Minifier
  - JSON to CSV
  - JSON to YAML
  - JSON to TypeScript
  - JSON to Schema
  - JSON Escape / Unescape
  - Base64 Encode / Decode
  - MD5 Generator
  - SHA256 Generator
  - Timestamp Converter
  - Current Unix Timestamp
  - URL Encode / Decode
  - HTML Entity Encode / Decode
  - UUID Generator
  - Case Converter
  - Slug Generator
  - Word Counter
  - Cron Parser
  - JWT Decoder
  - Password Generator
  - Text to JSON
- Ready for analytics and organic growth pages
- `robots.txt`
- `sitemap.xml`
- Privacy, Terms, Contact and 404 pages

## Run locally

```bash
python3 -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173/
```

## Deploy

This site is deployed on Vercel. Static pages and `/api/ai-json` serverless functions both run through the same Vercel project.

Current deployment:

- GitHub: https://github.com/WallerChen/aijsonformat
- Vercel project: `wallerchens-projects/aijsonformat`
- Vercel production URL: https://aijsonformat.vercel.app
- Custom domains added in Vercel:
  - `aijsonformat.com`
  - `www.aijsonformat.com`

Cloudflare DNS records needed:

| Type | Name | Value | Proxy |
| --- | --- | --- | --- |
| A | `@` | `76.76.21.21` | DNS only |
| A | `www` | `76.76.21.21` | DNS only |

Before submitting to an ad network:

- Configure the real contact email in `/contact/`.
- Add more long-tail SEO pages after the current AI and JSON tool clusters have search data.
- Add `ads.txt` after receiving your publisher ID.
- Verify `https://aijsonformat.com/sitemap.xml` in Google Search Console.

## SEO page generation

The site data lives in `assets/app.js` and can be reused by the generator.

Preview generated SEO files without writing:

```bash
node scripts/generate-seo-pages.js
```

Regenerate tool pages, guide pages, directory pages and `sitemap.xml`:

```bash
node scripts/generate-seo-pages.js --write
```

## Optional AI features

The site works without AI keys. Local tools remain available even when AI is not configured.

To enable AI fallback for JSON repair and AI mode for Text to JSON, set provider environment variables in Vercel.

OpenAI:

```text
AI_PROVIDER=openai
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-5.5
```

Doubao / Volcengine Ark:

```text
AI_PROVIDER=doubao
ARK_API_KEY=your_ark_api_key
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
DOUBAO_CHAT_MODEL=your_doubao_model_or_endpoint_id
```

`AI_BASE_URL` and `AI_MODEL` also work as generic aliases, but the Ark-specific names above are preferred for Doubao.

AI request protection is enabled in the Vercel function. Optional limits:

```text
AI_RATE_LIMIT_WINDOW_MS=60000
AI_RATE_LIMIT_MAX_REQUESTS=12
```

## Next SEO pages

Good long-tail pages to add next:

- `/json-parser-error-unexpected-token/`
- `/json-format-for-openai-response/`
- `/html-entity-decode/`
- `/cron-expression-every-5-minutes/`
- `/uuid-v4-generator/`
