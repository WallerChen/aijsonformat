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
- Ready for future ad placements after approval
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

This is a static site. Deploy the folder to any static host such as Cloudflare Pages, Vercel, Netlify, GitHub Pages or an Nginx server.

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
- Add ad placements to the shared layout in `assets/app.js` after the site is approved by an ad network.
- Add `ads.txt` after receiving your publisher ID.
- Verify `https://aijsonformat.com/sitemap.xml` in Google Search Console.

## Optional AI features

The site works without AI keys. Local tools remain available even when AI is not configured.

To enable AI fallback for JSON repair and AI mode for Text to JSON, set these Vercel environment variables:

```text
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-5.5
```

`OPENAI_MODEL` is optional. Use a smaller model if you want lower per-request cost.

## Next SEO pages

Good long-tail pages to add next:

- `/json-parser-error-unexpected-token/`
- `/json-format-for-openai-response/`
- `/html-entity-decode/`
- `/cron-expression-every-5-minutes/`
- `/uuid-v4-generator/`
