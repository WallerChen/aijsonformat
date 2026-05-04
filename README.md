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
  - JSON Escape / Unescape
  - Base64 Encode / Decode
  - MD5 Generator
  - SHA256 Generator
  - Timestamp Converter
  - URL Encode / Decode
  - UUID Generator
  - JWT Decoder
  - Password Generator
  - Text to JSON
- Advertising placeholder slots
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
- Add your ad network script to the shared layout in `assets/app.js` or directly replace `.ad-slot` blocks.
- Add `ads.txt` after receiving your publisher ID.
- Verify `https://aijsonformat.com/sitemap.xml` in Google Search Console.

## Next SEO pages

Good long-tail pages to add next:

- `/fix-invalid-json/`
- `/fix-json-from-chatgpt/`
- `/fix-json-trailing-comma/`
- `/unix-timestamp-to-date/`
- `/date-to-unix-timestamp/`
- `/md5-hash-generator/`
- `/sha256-checksum/`
- `/base64-decode-online/`
- `/jwt-payload-decoder/`
