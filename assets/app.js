(function () {
  "use strict";

  const tools = [
    {
      id: "ai-json-repair",
      title: "AI JSON Repair",
      category: "JSON",
      path: "/tools/ai-json-repair/",
      description:
        "Fix broken JSON from ChatGPT, APIs, logs and config files with local repair and optional AI fallback.",
      inputLabel: "Broken JSON",
      outputLabel: "Repaired JSON",
      actionLabel: "Repair JSON",
      sample:
        "{\n  name: 'AI JSON Format',\n  tags: ['json', 'tools',],\n  active: true,\n}",
      run: repairJsonTool,
      faq: [
        ["Can this fix JSON from ChatGPT?", "Yes. It handles common model output issues like code fences, comments, single quotes, trailing commas and unquoted keys."],
        ["Is my JSON uploaded?", "Local repair runs in your browser. If AI fallback is configured and needed, the input is sent to the site API."],
        ["What if repair fails?", "The tool returns the best local repair and can ask the AI fallback when the API is configured."]
      ]
    },
    {
      id: "json-formatter",
      title: "JSON Formatter",
      category: "JSON",
      path: "/tools/json-formatter/",
      description: "Prettify JSON with readable indentation, validation and one-click copy.",
      inputLabel: "JSON Input",
      outputLabel: "Formatted JSON",
      actionLabel: "Format JSON",
      sample: '{"name":"AI JSON Format","tools":["format","repair","validate"],"free":true}',
      run: (value) => parseAndStringify(value, 2),
      faq: [
        ["What does a JSON formatter do?", "It parses valid JSON and prints it with consistent indentation so objects and arrays are easier to read."],
        ["Does it change values?", "No. Formatting only changes whitespace when the input is valid JSON."],
        ["Can I format large JSON?", "Yes, but very large files depend on your browser memory."]
      ]
    },
    {
      id: "json-validator",
      title: "JSON Validator",
      category: "JSON",
      path: "/tools/json-validator/",
      description: "Validate JSON syntax and find parse errors before using it in code or APIs.",
      inputLabel: "JSON Input",
      outputLabel: "Validation Result",
      actionLabel: "Validate JSON",
      sample: '{"ok":true,"items":[1,2,3]}',
      run: validateJsonTool,
      faq: [
        ["What makes JSON invalid?", "Common issues include trailing commas, comments, single quotes, missing quotes around keys and unmatched brackets."],
        ["Can this validate JSON arrays?", "Yes. Any valid JSON value can be validated, including objects, arrays, strings, numbers, booleans and null."],
        ["Is validation local?", "Yes. Validation runs in your browser."]
      ]
    },
    {
      id: "json-minifier",
      title: "JSON Minifier",
      category: "JSON",
      path: "/tools/json-minifier/",
      description: "Remove whitespace from JSON for compact API payloads and config snippets.",
      inputLabel: "JSON Input",
      outputLabel: "Minified JSON",
      actionLabel: "Minify JSON",
      sample: '{\n  "name": "AI JSON Format",\n  "compact": true\n}',
      run: (value) => parseAndStringify(value, 0),
      faq: [
        ["Why minify JSON?", "Minified JSON is smaller and easier to embed in code, URLs or API examples."],
        ["Does minifying remove data?", "No. It only removes unnecessary whitespace from valid JSON."],
        ["Can I undo minification?", "Use the JSON Formatter tool to prettify minified JSON again."]
      ]
    },
    {
      id: "json-to-csv",
      title: "JSON to CSV",
      category: "JSON",
      path: "/tools/json-to-csv/",
      description: "Convert JSON arrays and objects into CSV tables for spreadsheets and reports.",
      inputLabel: "JSON Input",
      outputLabel: "CSV Output",
      actionLabel: "Convert to CSV",
      sample: '[{"name":"AI JSON Format","type":"tool"},{"name":"Timestamp Converter","type":"time"}]',
      run: jsonToCsvTool,
      faq: [
        ["What JSON works best?", "Arrays of objects convert best because each object becomes one CSV row."],
        ["How are nested values handled?", "Nested objects and arrays are stringified into JSON inside a CSV cell."],
        ["Can I paste the result into Excel?", "Yes. Copy the CSV output into Excel, Google Sheets or Numbers."]
      ]
    },
    {
      id: "json-to-yaml",
      title: "JSON to YAML",
      category: "JSON",
      path: "/tools/json-to-yaml/",
      description: "Convert JSON into clean YAML for configs, docs and examples.",
      inputLabel: "JSON Input",
      outputLabel: "YAML Output",
      actionLabel: "Convert to YAML",
      sample: '{"name":"AI JSON Format","features":["format","repair","convert"],"free":true}',
      run: jsonToYamlTool,
      faq: [
        ["Why convert JSON to YAML?", "YAML is common in configuration files and is often easier to scan by hand."],
        ["Does this preserve all JSON values?", "Yes. Objects, arrays, strings, numbers, booleans and null are represented in YAML."],
        ["Is the conversion local?", "Yes. It runs in your browser."]
      ]
    },
    {
      id: "json-to-typescript",
      title: "JSON to TypeScript",
      category: "JSON",
      path: "/tools/json-to-typescript/",
      description: "Generate a TypeScript interface from sample JSON data.",
      inputLabel: "JSON Input",
      outputLabel: "TypeScript Output",
      actionLabel: "Generate TypeScript",
      sample: '{"id":123,"name":"AI JSON Format","tags":["json","tools"],"active":true}',
      run: jsonToTypeScriptTool,
      faq: [
        ["What interface name is used?", "The generated interface is named RootObject in this version."],
        ["How are arrays handled?", "Arrays infer from the first item and fall back to unknown[] when empty."],
        ["Should I review the types?", "Yes. Generated types are a fast starting point, not a substitute for API documentation."]
      ]
    },
    {
      id: "json-to-schema",
      title: "JSON to Schema",
      category: "JSON",
      path: "/tools/json-to-schema/",
      description: "Generate a JSON Schema draft-style object from example JSON.",
      inputLabel: "JSON Input",
      outputLabel: "JSON Schema",
      actionLabel: "Generate Schema",
      sample: '{"id":123,"name":"AI JSON Format","active":true,"tags":["json","schema"]}',
      run: jsonToSchemaTool,
      faq: [
        ["What is JSON Schema used for?", "JSON Schema describes and validates the expected shape of JSON data."],
        ["Are fields marked required?", "Object keys present in the sample are marked as required."],
        ["Can I edit the schema?", "Yes. Treat the generated schema as a strong first draft."]
      ]
    },
    {
      id: "json-sorter",
      title: "JSON Sorter",
      category: "JSON",
      path: "/tools/json-sorter/",
      description: "Sort JSON object keys recursively for stable diffs, cleaner configs and predictable output.",
      inputLabel: "JSON Input",
      outputLabel: "Sorted JSON",
      actionLabel: "Sort JSON",
      sample: '{"z":3,"a":{"name":"AI JSON Format","id":1},"tags":["json","format"]}',
      run: jsonSorterTool,
      faq: [
        ["What does JSON sorting change?", "It sorts object keys alphabetically while preserving values and array order."],
        ["Why sort JSON keys?", "Sorted keys make diffs, reviews and config comparisons easier to scan."],
        ["Does it upload data?", "No. Sorting runs locally in your browser."]
      ]
    },
    {
      id: "json-path",
      title: "JSON Path Extractor",
      category: "JSON",
      path: "/tools/json-path/",
      description: "Extract a value from JSON with a simple path such as $.user.name or items[0].id.",
      inputLabel: "JSON, then path on last line",
      outputLabel: "Extracted Value",
      actionLabel: "Extract Value",
      sample: '{\n  "user": { "name": "AI JSON Format", "active": true },\n  "items": [{ "id": 123 }]\n}\n\n$.items[0].id',
      run: jsonPathTool,
      faq: [
        ["What path syntax is supported?", "Use simple dot paths and array indexes, such as $.user.name or $.items[0].id."],
        ["Can this query multiple values?", "This lightweight version extracts one path at a time."],
        ["Is this full JSONPath?", "No. It supports the common simple subset developers use for quick inspection."]
      ]
    },
    {
      id: "json-lines",
      title: "JSON Lines to JSON",
      category: "JSON",
      path: "/tools/json-lines/",
      description: "Convert JSONL or NDJSON rows into a JSON array, or convert a JSON array back to JSON Lines.",
      inputLabel: "JSON Lines or JSON Array",
      outputLabel: "Converted Output",
      actionLabel: "JSONL to Array",
      secondaryActionLabel: "Array to JSONL",
      sample: '{"id":1,"name":"JSON Formatter"}\n{"id":2,"name":"AI JSON Repair"}',
      run: jsonLinesToArrayTool,
      secondaryRun: jsonArrayToLinesTool,
      faq: [
        ["What is JSON Lines?", "JSON Lines stores one valid JSON value per line, often used for logs and datasets."],
        ["Can blank lines be included?", "Blank lines are ignored when converting JSON Lines to an array."],
        ["What is NDJSON?", "NDJSON is newline-delimited JSON, another name for the same common format."]
      ]
    },
    {
      id: "json-to-markdown",
      title: "JSON to Markdown Table",
      category: "JSON",
      path: "/tools/json-to-markdown/",
      description: "Convert JSON arrays and objects into Markdown tables for docs, GitHub READMEs and notes.",
      inputLabel: "JSON Input",
      outputLabel: "Markdown Table",
      actionLabel: "Convert to Markdown",
      sample: '[{"tool":"JSON Formatter","type":"format"},{"tool":"AI JSON Repair","type":"repair"}]',
      run: jsonToMarkdownTool,
      faq: [
        ["What JSON works best?", "Arrays of flat objects convert best into Markdown tables."],
        ["How are nested values handled?", "Nested objects and arrays are stringified inside a table cell."],
        ["Where can I use the output?", "Use it in GitHub, Markdown docs, Notion imports or developer notes."]
      ]
    },
    {
      id: "json-escape-unescape",
      title: "JSON Escape / Unescape",
      category: "JSON",
      path: "/tools/json-escape-unescape/",
      description: "Escape strings for JSON or unescape JSON string values back to readable text.",
      inputLabel: "Text or JSON String",
      outputLabel: "Result",
      actionLabel: "Escape",
      secondaryActionLabel: "Unescape",
      sample: 'Line one\n"quoted value"\n/path/to/file',
      run: escapeJsonString,
      secondaryRun: unescapeJsonString,
      faq: [
        ["When should I escape JSON?", "Escape text when it needs to be safely placed inside a JSON string value."],
        ["What does unescape do?", "It converts escaped sequences like backslash-n and escaped quotes back into readable text."],
        ["Does this parse whole JSON objects?", "This tool is for string escaping. Use JSON Formatter for complete JSON documents."]
      ]
    },
    {
      id: "base64",
      title: "Base64 Encode / Decode",
      category: "Encode",
      path: "/tools/base64/",
      description: "Encode text to Base64 or decode Base64 back to Unicode text.",
      inputLabel: "Text or Base64",
      outputLabel: "Result",
      actionLabel: "Encode",
      secondaryActionLabel: "Decode",
      sample: "AI JSON Format",
      run: encodeBase64,
      secondaryRun: decodeBase64,
      faq: [
        ["Is Base64 encryption?", "No. Base64 is encoding, not encryption. Anyone can decode it."],
        ["Does this support Unicode?", "Yes. The tool supports Unicode text."],
        ["Is data uploaded?", "No. Encoding and decoding run locally."]
      ]
    },
    {
      id: "md5",
      title: "MD5 Generator",
      category: "Hash",
      path: "/tools/md5/",
      description: "Generate MD5 hashes for text, checksums and quick non-security fingerprints.",
      inputLabel: "Input Text",
      outputLabel: "MD5 Hash",
      actionLabel: "Generate MD5",
      sample: "AI JSON Format",
      run: (value) => result(md5(value), "MD5 generated locally.", "ok"),
      faq: [
        ["Is MD5 secure?", "No. MD5 is not recommended for passwords or security-sensitive signatures."],
        ["What is MD5 useful for?", "It is still useful for quick fingerprints, legacy checksums and simple comparisons."],
        ["Is the hash generated locally?", "Yes. The text is processed in your browser."]
      ]
    },
    {
      id: "sha256",
      title: "SHA256 Generator",
      category: "Hash",
      path: "/tools/sha256/",
      description: "Create SHA-256 hashes for text with the browser crypto API.",
      inputLabel: "Input Text",
      outputLabel: "SHA256 Hash",
      actionLabel: "Generate SHA256",
      sample: "AI JSON Format",
      run: sha256Tool,
      faq: [
        ["Is SHA256 better than MD5?", "SHA-256 is stronger than MD5 and is preferred for modern checksums and signatures."],
        ["Can I hash files?", "This first version hashes text. File hashing can be added later."],
        ["Does it use a server?", "No. It uses your browser crypto API."]
      ]
    },
    {
      id: "timestamp",
      title: "Timestamp Converter",
      category: "Time",
      path: "/tools/timestamp/",
      description: "Convert Unix timestamps to dates and dates back to Unix time in seconds or milliseconds.",
      inputLabel: "Timestamp or Date",
      outputLabel: "Converted Time",
      actionLabel: "Convert",
      sample: String(Math.floor(Date.now() / 1000)),
      run: timestampTool,
      faq: [
        ["What is a Unix timestamp?", "It is the number of seconds since January 1, 1970 at 00:00:00 UTC."],
        ["Does this support milliseconds?", "Yes. 13-digit timestamps are treated as milliseconds."],
        ["What timezone is shown?", "The output includes both local time and UTC."]
      ]
    },
    {
      id: "current-timestamp",
      title: "Current Unix Timestamp",
      category: "Time",
      path: "/tools/current-timestamp/",
      description: "Get the current Unix timestamp in seconds, milliseconds, local time and UTC.",
      inputLabel: "Optional Date",
      outputLabel: "Current Time",
      actionLabel: "Refresh",
      sample: "",
      run: currentTimestampTool,
      faq: [
        ["What is the current Unix timestamp?", "It is the current number of seconds since January 1, 1970 at 00:00:00 UTC."],
        ["Why show milliseconds too?", "JavaScript and many logging systems use milliseconds instead of seconds."],
        ["Does this update automatically?", "Click Refresh to generate the latest values."]
      ]
    },
    {
      id: "url-encode",
      title: "URL Encode / Decode",
      category: "Encode",
      path: "/tools/url-encode/",
      description: "Encode text for URLs or decode percent-encoded query strings.",
      inputLabel: "Text or Encoded URL",
      outputLabel: "Result",
      actionLabel: "Encode",
      secondaryActionLabel: "Decode",
      sample: "https://aijsonformat.com/tools/json-formatter/?q=hello world",
      run: (value) => result(encodeURIComponent(value), "URL encoded.", "ok"),
      secondaryRun: (value) => {
        try {
          return result(decodeURIComponent(value), "URL decoded.", "ok");
        } catch (error) {
          return result("", error.message, "error");
        }
      },
      faq: [
        ["When should I URL encode text?", "Encode values before putting them inside query strings or URL path segments."],
        ["Does this encode a full URL?", "It encodes the complete input. For full URLs, usually encode only the parameter value."],
        ["Is decoding safe?", "Decoding only transforms percent escapes into readable characters."]
      ]
    },
    {
      id: "html-entity",
      title: "HTML Entity Encode / Decode",
      category: "Encode",
      path: "/tools/html-entity/",
      description: "Encode HTML entities or decode escaped HTML text back to readable characters.",
      inputLabel: "HTML or Text",
      outputLabel: "Result",
      actionLabel: "Encode",
      secondaryActionLabel: "Decode",
      sample: '<div class="note">Tom & Jerry</div>',
      run: htmlEntityEncodeTool,
      secondaryRun: htmlEntityDecodeTool,
      faq: [
        ["When should I encode HTML entities?", "Encode text before displaying it as literal text inside HTML."],
        ["What does decoding do?", "It turns sequences like ampersand-lt and ampersand-amp back into readable characters."],
        ["Is this a sanitizer?", "No. It is an encoder and decoder, not a full security sanitizer."]
      ]
    },
    {
      id: "uuid",
      title: "UUID Generator",
      category: "Random",
      path: "/tools/uuid/",
      description: "Generate random UUID v4 identifiers for tests, records and API examples.",
      inputLabel: "Count",
      outputLabel: "UUIDs",
      actionLabel: "Generate UUID",
      sample: "5",
      run: uuidTool,
      faq: [
        ["What version are these UUIDs?", "The tool generates UUID v4 values."],
        ["Can I generate multiple UUIDs?", "Yes. Enter a count between 1 and 100."],
        ["Are they generated locally?", "Yes. They use browser crypto when available."]
      ]
    },
    {
      id: "case-converter",
      title: "Case Converter",
      category: "Text",
      path: "/tools/case-converter/",
      description: "Convert text into camelCase, PascalCase, snake_case, kebab-case, uppercase and lowercase.",
      inputLabel: "Input Text",
      outputLabel: "Converted Cases",
      actionLabel: "Convert Case",
      sample: "AI JSON Format developer tools",
      run: caseConverterTool,
      faq: [
        ["What cases are generated?", "The tool outputs camelCase, PascalCase, snake_case, kebab-case, uppercase and lowercase."],
        ["Is this useful for code?", "Yes. It helps convert labels, keys and file names into code-friendly forms."],
        ["Does it support punctuation?", "Punctuation is treated as a word separator."]
      ]
    },
    {
      id: "slug-generator",
      title: "Slug Generator",
      category: "Text",
      path: "/tools/slug-generator/",
      description: "Generate clean URL slugs from titles, headings and article names.",
      inputLabel: "Title or Text",
      outputLabel: "Slug",
      actionLabel: "Generate Slug",
      sample: "Fix Invalid JSON Online: Free Developer Tool",
      run: slugGeneratorTool,
      faq: [
        ["What is a slug?", "A slug is the readable part of a URL, often made from lowercase words separated by hyphens."],
        ["Are special characters removed?", "Yes. The generator normalizes text and removes punctuation that does not belong in a clean URL."],
        ["Can I use this for SEO URLs?", "Yes. Short, readable slugs are useful for SEO and sharing."]
      ]
    },
    {
      id: "word-counter",
      title: "Word Counter",
      category: "Text",
      path: "/tools/word-counter/",
      description: "Count words, characters, lines and paragraphs in plain text.",
      inputLabel: "Input Text",
      outputLabel: "Text Stats",
      actionLabel: "Count Text",
      sample: "AI JSON Format is a free developer tools website.\nIt formats JSON and converts timestamps.",
      run: wordCounterTool,
      faq: [
        ["What does this count?", "It counts words, characters, characters without spaces, lines and paragraphs."],
        ["Does it work offline?", "The counting logic runs locally in your browser."],
        ["Can I use it for meta descriptions?", "Yes. Character counts are useful when drafting titles and descriptions."]
      ]
    },
    {
      id: "cron-parser",
      title: "Cron Parser",
      category: "Time",
      path: "/tools/cron-parser/",
      description: "Explain common 5-field cron expressions in plain English.",
      inputLabel: "Cron Expression",
      outputLabel: "Explanation",
      actionLabel: "Explain Cron",
      sample: "*/15 9-17 * * 1-5",
      run: cronParserTool,
      faq: [
        ["What cron format is supported?", "This tool explains common five-field cron expressions: minute, hour, day of month, month and day of week."],
        ["Does it calculate future runs?", "This first version explains the schedule in plain English rather than listing future run times."],
        ["Are names like MON supported?", "Yes. Common month and weekday names are supported in explanations."]
      ]
    },
    {
      id: "jwt-decoder",
      title: "JWT Decoder",
      category: "Encode",
      path: "/tools/jwt-decoder/",
      description: "Decode JWT header and payload without sending tokens to a server.",
      inputLabel: "JWT",
      outputLabel: "Decoded Header and Payload",
      actionLabel: "Decode JWT",
      sample:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiQUkgSlNPTiBGb3JtYXQiLCJpYXQiOjE3MTUyMDAwMDB9.signature",
      run: jwtTool,
      faq: [
        ["Does this verify JWT signatures?", "No. It decodes header and payload only. Signature verification requires the secret or public key."],
        ["Is my token uploaded?", "No. Decoding runs in your browser."],
        ["Can expired tokens be decoded?", "Yes. Expiration does not prevent decoding."]
      ]
    },
    {
      id: "password-generator",
      title: "Password Generator",
      category: "Random",
      path: "/tools/password-generator/",
      description: "Generate strong random passwords with configurable length and simple character options.",
      inputLabel: "Length or Options",
      outputLabel: "Password",
      actionLabel: "Generate Password",
      sample: "24 symbols",
      run: passwordTool,
      faq: [
        ["What length should I use?", "Use at least 16 characters for most accounts and longer for shared secrets."],
        ["Are passwords stored?", "No. They are generated locally and not saved."],
        ["Can I avoid symbols?", "Yes. Enter a length followed by no symbols, for example: 24 no symbols."]
      ]
    },
    {
      id: "text-to-json",
      title: "Text to JSON",
      category: "AI",
      path: "/tools/text-to-json/",
      description: "Convert simple key-value text, lists and tables into clean JSON.",
      inputLabel: "Text Input",
      outputLabel: "JSON Output",
      actionLabel: "Convert to JSON",
      secondaryActionLabel: "Convert with AI",
      sample: "name: AI JSON Format\ncategory: developer tools\nfree: true",
      run: textToJsonTool,
      secondaryRun: aiTextToJsonTool,
      faq: [
        ["What text formats work best?", "Key-value lines, comma-separated lists and simple tables work best."],
        ["Is this AI powered?", "The default conversion is local. The AI mode uses the site API when OPENAI_API_KEY is configured."],
        ["Can I edit the output?", "Yes. Copy the JSON and refine it in the JSON Formatter or Repair tools."]
      ]
    }
  ];

  const byId = Object.fromEntries(tools.map((tool) => [tool.id, tool]));
  const guidePages = [
    {
      id: "fix-invalid-json",
      title: "Fix Invalid JSON Online",
      category: "JSON guide",
      description: "Repair common JSON syntax errors such as trailing commas, comments, single quotes, missing quotes and unmatched brackets.",
      primaryToolId: "ai-json-repair",
      points: [
        "Paste the broken JSON into AI JSON Repair.",
        "Run the repair tool to remove common syntax problems.",
        "Copy the formatted output and validate it before using it in code or an API."
      ],
      faq: [
        ["What usually makes JSON invalid?", "Trailing commas, comments, single quotes, unquoted keys and unmatched braces are the most common causes."],
        ["Can invalid JSON be repaired automatically?", "Often, yes. Simple syntax issues can usually be repaired, but you should still review the result."],
        ["Is this safe for private data?", "The current repair tool runs locally in your browser, but you should avoid pasting secrets into any online tool."]
      ]
    },
    {
      id: "fix-json-from-chatgpt",
      title: "Fix JSON from ChatGPT",
      category: "AI guide",
      description: "Clean up JSON returned by ChatGPT or other AI tools when the response includes markdown fences, comments or invalid syntax.",
      primaryToolId: "ai-json-repair",
      points: [
        "Remove surrounding explanation by pasting the whole response into the repair tool.",
        "Let the tool strip markdown fences and normalize common JSON-like syntax.",
        "Validate the result before sending it to your app, parser or workflow."
      ],
      faq: [
        ["Why does AI output invalid JSON?", "Models sometimes include explanations, markdown fences or JavaScript-style syntax instead of strict JSON."],
        ["Can this handle code fences?", "Yes. The repair tool strips common json and JavaScript code fences."],
        ["Should I ask AI to output strict JSON?", "Yes. A strict prompt helps, but a repair step is useful when output still breaks."]
      ]
    },
    {
      id: "fix-json-trailing-comma",
      title: "Fix JSON Trailing Comma",
      category: "JSON guide",
      description: "Remove trailing commas from JSON objects and arrays so strict JSON parsers can read the data.",
      primaryToolId: "ai-json-repair",
      points: [
        "Paste JSON that fails with an unexpected token error.",
        "Repair the JSON to remove commas before closing braces or brackets.",
        "Use JSON Validator to confirm the result is valid."
      ],
      faq: [
        ["Are trailing commas allowed in JSON?", "No. JavaScript allows them in many places, but strict JSON does not."],
        ["What error do trailing commas cause?", "Many parsers report an unexpected token near the closing brace or bracket."],
        ["Can I format after fixing?", "Yes. The repair tool formats the repaired JSON automatically."]
      ]
    },
    {
      id: "unix-timestamp-to-date",
      title: "Unix Timestamp to Date",
      category: "Time guide",
      description: "Convert Unix seconds or milliseconds into readable local and UTC date strings.",
      primaryToolId: "timestamp",
      points: [
        "Paste a 10-digit Unix timestamp for seconds or a 13-digit timestamp for milliseconds.",
        "Run the converter to see local time, UTC time, seconds and milliseconds.",
        "Copy the format you need for logs, dashboards or docs."
      ],
      faq: [
        ["Is Unix time in seconds or milliseconds?", "Classic Unix time is seconds, while many JavaScript APIs use milliseconds."],
        ["What timezone is Unix time?", "The timestamp itself is timezone-neutral. Displayed dates can be local time or UTC."],
        ["Can negative timestamps work?", "Yes. Negative values represent dates before January 1, 1970 UTC."]
      ]
    },
    {
      id: "date-to-unix-timestamp",
      title: "Date to Unix Timestamp",
      category: "Time guide",
      description: "Convert a readable date into Unix seconds and milliseconds for APIs, databases and logs.",
      primaryToolId: "timestamp",
      points: [
        "Paste a date string such as 2026-05-05 12:30:00.",
        "Run the timestamp converter.",
        "Use the Unix seconds or milliseconds output depending on your API."
      ],
      faq: [
        ["What date formats can I paste?", "Most browser-supported date strings work, including ISO timestamps."],
        ["Why do timezones matter?", "A date string without a timezone is usually interpreted as local time by the browser."],
        ["Which value should I use for JavaScript?", "JavaScript Date timestamps are usually milliseconds."]
      ]
    },
    {
      id: "base64-decode-online",
      title: "Base64 Decode Online",
      category: "Encode guide",
      description: "Decode Base64 text back into readable Unicode text without uploading it to a server.",
      primaryToolId: "base64",
      points: [
        "Paste the Base64 string into the input box.",
        "Click Decode.",
        "Copy the readable output."
      ],
      faq: [
        ["Is Base64 secure?", "No. Base64 is reversible encoding, not encryption."],
        ["Can Base64 contain binary data?", "Yes, but this browser tool is optimized for text output."],
        ["Can I encode text too?", "Yes. The same tool supports encode and decode."]
      ]
    },
    {
      id: "md5-hash-generator",
      title: "MD5 Hash Generator",
      category: "Hash guide",
      description: "Generate an MD5 hash from text and understand when MD5 is useful or unsafe.",
      primaryToolId: "md5",
      points: [
        "Paste the text you want to hash.",
        "Click Generate MD5.",
        "Copy the 32-character hexadecimal hash."
      ],
      faq: [
        ["Can MD5 be used for passwords?", "No. MD5 is not secure for passwords or modern authentication."],
        ["Why do people still use MD5?", "It is still common for quick fingerprints, legacy checksums and non-security comparisons."],
        ["Is the input uploaded?", "No. The MD5 tool runs in your browser."]
      ]
    },
    {
      id: "sha256-checksum",
      title: "SHA256 Checksum Generator",
      category: "Hash guide",
      description: "Generate a SHA-256 checksum from text for stronger fingerprints and integrity checks.",
      primaryToolId: "sha256",
      points: [
        "Paste the text to hash.",
        "Click Generate SHA256.",
        "Copy the 64-character hexadecimal digest."
      ],
      faq: [
        ["Is SHA-256 stronger than MD5?", "Yes. SHA-256 is the better default for modern checksums."],
        ["Can this hash files?", "The current tool hashes text. File hashing can be added later."],
        ["Does it use browser crypto?", "Yes. It uses the browser crypto API when available."]
      ]
    },
    {
      id: "jwt-payload-decoder",
      title: "JWT Payload Decoder",
      category: "Encode guide",
      description: "Decode a JWT payload and header locally so you can inspect token claims.",
      primaryToolId: "jwt-decoder",
      points: [
        "Paste the JWT into the decoder.",
        "Decode the header and payload.",
        "Review claims such as sub, exp, iat, aud and iss."
      ],
      faq: [
        ["Does decoding verify the token?", "No. Decoding only reads the header and payload. It does not verify the signature."],
        ["Can I decode expired tokens?", "Yes. Expired tokens can still be decoded."],
        ["Should I paste production tokens?", "Avoid pasting sensitive tokens into online tools unless you understand the risk."]
      ]
    },
    {
      id: "current-unix-timestamp",
      title: "Current Unix Timestamp",
      category: "Time guide",
      description: "View the current Unix timestamp in seconds and milliseconds with UTC and local time.",
      primaryToolId: "current-timestamp",
      points: [
        "Open the Current Unix Timestamp tool.",
        "Click Refresh to get the latest seconds and milliseconds.",
        "Copy the timestamp format your API or database expects."
      ],
      faq: [
        ["What is the current Unix timestamp?", "It is the current number of seconds since January 1, 1970 UTC."],
        ["Why are there two timestamp lengths?", "10-digit values are usually seconds. 13-digit values are usually milliseconds."],
        ["Does timezone affect the timestamp?", "No. The timestamp is absolute, but displayed dates can be local or UTC."]
      ]
    },
    {
      id: "ai-json-formatter",
      title: "AI JSON Formatter",
      category: "AI JSON guide",
      description: "Format and repair AI-generated JSON from ChatGPT, APIs and automation tools with a practical AI JSON formatter workflow.",
      primaryToolId: "ai-json-repair",
      points: [
        "Paste AI-generated JSON or JSON-like output into AI JSON Repair.",
        "Let local repair clean common issues such as code fences, single quotes and trailing commas.",
        "Use the AI fallback when the structure is too broken for local repair."
      ],
      faq: [
        ["What is an AI JSON formatter?", "It is a formatter designed for JSON-like output from AI tools, where responses often include markdown or small syntax mistakes."],
        ["Is it different from a normal JSON formatter?", "Yes. A normal formatter requires valid JSON first. AI JSON formatting often needs repair before prettifying."],
        ["Can it handle ChatGPT JSON?", "Yes. The repair workflow is designed for model output, copied API examples and automation snippets."]
      ]
    },
    {
      id: "ai-json-format",
      title: "AI JSON Format",
      category: "AI JSON guide",
      description: "Clean, format and validate JSON for AI workflows, structured prompts and model responses.",
      primaryToolId: "ai-json-repair",
      points: [
        "Use AI JSON Repair when model output is not strict JSON.",
        "Use JSON Formatter after repair to make the output readable.",
        "Use JSON Validator before sending the data to an API or parser."
      ],
      faq: [
        ["Why does AI JSON need formatting?", "AI output may include explanations, markdown fences or JSON-like syntax that strict parsers reject."],
        ["Can I use this for structured outputs?", "Yes. It is useful for checking and cleaning structured AI responses before integration."],
        ["Should I validate after formatting?", "Yes. Validation catches syntax issues before production use."]
      ]
    },
    {
      id: "json-format-online",
      title: "JSON Format Online",
      category: "JSON guide",
      description: "Format JSON online into readable indentation and copy clean output for APIs, configs and docs.",
      primaryToolId: "json-formatter",
      points: [
        "Paste valid JSON into the JSON Formatter.",
        "Click Format JSON to prettify objects and arrays.",
        "Copy the formatted result into code, docs or API clients."
      ],
      faq: [
        ["What does JSON format online mean?", "It means prettifying JSON in the browser so nested data is easier to read."],
        ["Does formatting change values?", "No. It only changes whitespace when the input is valid JSON."],
        ["What if my JSON is invalid?", "Use AI JSON Repair first, then format the repaired result."]
      ]
    },
    {
      id: "json-formatter-online-free",
      title: "JSON Formatter Online Free",
      category: "JSON guide",
      description: "Use a free online JSON formatter with no signup for quick developer copy-and-paste workflows.",
      primaryToolId: "json-formatter",
      points: [
        "Open the JSON Formatter tool.",
        "Paste JSON from an API response, config file or log.",
        "Format, copy and reuse the cleaned output."
      ],
      faq: [
        ["Is the JSON formatter free?", "Yes. The formatter is free and does not require an account."],
        ["Can I use it for API responses?", "Yes. It is useful for formatting API responses, webhook payloads and config data."],
        ["Does it run locally?", "The formatter runs in your browser."]
      ]
    },
    {
      id: "json-beautifier",
      title: "JSON Beautifier",
      category: "JSON guide",
      description: "Beautify minified JSON into readable, indented output for debugging and documentation.",
      primaryToolId: "json-formatter",
      points: [
        "Paste minified or compact JSON.",
        "Run the JSON Formatter to beautify it.",
        "Copy the indented output for review or documentation."
      ],
      faq: [
        ["Is beautify the same as format?", "For JSON tools, beautify and format usually mean the same thing: readable indentation."],
        ["Can it beautify invalid JSON?", "Invalid JSON must be repaired first."],
        ["Can I minify it again?", "Yes. Use JSON Minifier to compact the formatted output."]
      ]
    },
    {
      id: "json-prettify",
      title: "Prettify JSON Online",
      category: "JSON guide",
      description: "Prettify JSON online with clean indentation, validation feedback and one-click copy.",
      primaryToolId: "json-formatter",
      points: [
        "Paste your JSON into the formatter.",
        "Click Format JSON.",
        "Review indentation and copy the prettified result."
      ],
      faq: [
        ["What is prettified JSON?", "Prettified JSON is JSON printed with line breaks and indentation."],
        ["Why prettify JSON?", "It makes nested data easier to inspect and debug."],
        ["Can I prettify JSON from logs?", "Yes, as long as the JSON portion is valid or repaired first."]
      ]
    },
    {
      id: "json-lint-online",
      title: "JSON Lint Online",
      category: "JSON guide",
      description: "Lint JSON online by validating syntax and identifying parse errors before using data in code.",
      primaryToolId: "json-validator",
      points: [
        "Paste JSON into the JSON Validator.",
        "Run validation to check parser compatibility.",
        "Repair invalid JSON if the validator reports an error."
      ],
      faq: [
        ["What is JSON linting?", "JSON linting checks whether JSON syntax is valid and parser-ready."],
        ["Does linting format JSON?", "Validation checks syntax. Use JSON Formatter when you also want pretty output."],
        ["What should I do with an error?", "Use the error message to locate the issue or open AI JSON Repair."]
      ]
    },
    {
      id: "json-parser-online",
      title: "JSON Parser Online",
      category: "JSON guide",
      description: "Parse JSON online to confirm whether a value is a valid object, array, string, number, boolean or null.",
      primaryToolId: "json-validator",
      points: [
        "Paste the JSON value into JSON Validator.",
        "Run validation to parse the value.",
        "Use the result summary to understand the top-level JSON type."
      ],
      faq: [
        ["Can JSON be an array?", "Yes. A valid JSON document can be an object, array, string, number, boolean or null."],
        ["What does a JSON parser do?", "It reads JSON text and converts it into structured data."],
        ["Why does parsing fail?", "Parsing fails when syntax is not strict JSON."]
      ]
    },
    {
      id: "json-cleaner",
      title: "JSON Cleaner",
      category: "JSON guide",
      description: "Clean JSON-like text by removing comments, trailing commas, code fences and other parser-breaking syntax.",
      primaryToolId: "ai-json-repair",
      points: [
        "Paste JSON-like text into AI JSON Repair.",
        "Clean syntax issues with local repair.",
        "Validate and format the cleaned JSON."
      ],
      faq: [
        ["What can a JSON cleaner fix?", "It can often fix comments, single quotes, trailing commas, unquoted keys and markdown fences."],
        ["Is cleaned JSON always correct?", "Review important data after cleaning, especially when the original text is badly broken."],
        ["Can it clean API examples?", "Yes. It is useful for copied examples that look like JavaScript objects instead of strict JSON."]
      ]
    },
    {
      id: "ai-json-generator",
      title: "AI JSON Generator",
      category: "AI JSON guide",
      description: "Generate structured JSON from text, requirements or simple notes using the Text to JSON workflow.",
      primaryToolId: "text-to-json",
      points: [
        "Describe the data you want as text or key-value notes.",
        "Use Text to JSON for local structured conversion.",
        "Use Convert with AI when the input is messy or natural language."
      ],
      faq: [
        ["What is an AI JSON generator?", "It converts natural language or rough notes into a useful JSON structure."],
        ["Can it infer fields?", "AI mode can infer useful fields from text, but you should review the output."],
        ["Can I validate the generated JSON?", "Yes. Send it to JSON Validator or JSON Formatter after generation."]
      ]
    },
    {
      id: "ai-json-to-typescript",
      title: "AI JSON to TypeScript",
      category: "AI JSON guide",
      description: "Clean AI JSON output and turn it into TypeScript interfaces for frontend and API development.",
      primaryToolId: "json-to-typescript",
      points: [
        "Repair AI-generated JSON if needed.",
        "Paste the valid JSON into JSON to TypeScript.",
        "Copy the generated RootObject type or interface."
      ],
      faq: [
        ["Why convert AI JSON to TypeScript?", "It helps turn example model responses into typed frontend or API code."],
        ["Should I review generated types?", "Yes. Generated types are a starting point and may need optional fields or unions."],
        ["Can arrays be converted?", "Yes. Arrays generate a RootObject array type."]
      ]
    },
    {
      id: "json-format-for-ai",
      title: "JSON Format for AI",
      category: "AI JSON guide",
      description: "Prepare clean JSON for AI prompts, structured outputs, agents and automation workflows.",
      primaryToolId: "json-formatter",
      points: [
        "Format JSON before putting it into a prompt or config.",
        "Validate syntax so the AI example is unambiguous.",
        "Minify JSON when you need a compact prompt snippet."
      ],
      faq: [
        ["Why format JSON for AI?", "Readable JSON examples make prompts and structured-output instructions easier to inspect."],
        ["Should prompt JSON be valid?", "Yes. Valid JSON reduces ambiguity in examples and tool configuration."],
        ["Can I use minified JSON in prompts?", "Yes, but formatted JSON is easier to review before minifying."]
      ]
    },
    {
      id: "json-format-for-openai-response",
      title: "JSON Format for OpenAI Response",
      category: "AI JSON guide",
      description: "Format and repair JSON-like responses from OpenAI-style APIs and structured AI outputs.",
      primaryToolId: "ai-json-repair",
      points: [
        "Paste the response body or JSON-like output.",
        "Repair syntax if the response includes markdown or commentary.",
        "Format and validate the final JSON before parsing it in code."
      ],
      faq: [
        ["Why would an AI response need repair?", "Some responses include markdown fences or explanatory text around JSON."],
        ["Can this parse API response JSON?", "Yes. Use JSON Formatter when the API response is already valid JSON."],
        ["Can this help with structured outputs?", "Yes. It is useful for checking examples and debugging parser failures."]
      ]
    },
    {
      id: "json-parser-error-unexpected-token",
      title: "JSON Parser Error Unexpected Token",
      category: "JSON guide",
      description: "Understand and fix unexpected token errors from JSON.parse and strict JSON parsers.",
      primaryToolId: "ai-json-repair",
      points: [
        "Paste the JSON that caused the unexpected token error.",
        "Repair common syntax problems such as comments, trailing commas and single quotes.",
        "Validate the repaired JSON before parsing again."
      ],
      faq: [
        ["What causes unexpected token in JSON?", "The parser found a character that strict JSON does not allow at that position."],
        ["Are comments allowed in JSON?", "No. Comments are common in JavaScript objects but invalid in strict JSON."],
        ["How do I fix the error?", "Repair the syntax, then validate the result with JSON Validator."]
      ]
    },
    {
      id: "format-api-response-json",
      title: "Format API Response JSON",
      category: "JSON guide",
      description: "Format API response JSON from REST endpoints, webhooks and logs for easier debugging.",
      primaryToolId: "json-formatter",
      points: [
        "Copy the JSON response from your API client or logs.",
        "Paste it into JSON Formatter.",
        "Format, inspect and copy the readable output."
      ],
      faq: [
        ["Can I format webhook payloads?", "Yes. Webhook payloads are often JSON and can be formatted for review."],
        ["What if the response is escaped JSON?", "Use JSON Escape / Unescape first if the JSON is inside a string."],
        ["Can I convert an API response to TypeScript?", "Yes. Use JSON to TypeScript after formatting the response."]
      ]
    }
  ];
  const guidesById = Object.fromEntries(guidePages.map((guide) => [guide.id, guide]));
  const growthGuideIds = [
    "ai-json-formatter",
    "ai-json-format",
    "json-format-online",
    "json-formatter-online-free",
    "json-beautifier",
    "json-prettify",
    "json-lint-online",
    "json-parser-online",
    "json-cleaner",
    "ai-json-generator",
    "json-format-for-ai",
    "format-api-response-json"
  ];
  const growthGuides = growthGuideIds.map((id) => guidesById[id]).filter(Boolean);
  const app = document.getElementById("app");
  const pageId = app.dataset.page || pageFromPath();

  renderShell(pageId);

  function renderShell(id) {
    const isHome = id === "home";
    const isGuides = id === "guides";
    const guide = guidesById[id] || guidesById[pageFromPath()];
    const tool = byId[id] || byId[pageFromPath()] || byId["json-formatter"];

    app.innerHTML = `
      <div class="site-shell">
        <header class="topbar">
          <nav class="nav" aria-label="Primary">
            <a class="brand" href="/">
              <span class="brand-mark">{ }</span>
              <span>AI JSON Format</span>
            </a>
            <div class="nav-links">
              <a href="/tools/ai-json-repair/">AI Repair</a>
              <a href="/tools/json-formatter/">JSON</a>
              <a href="/tools/md5/">Hash</a>
              <a href="/tools/timestamp/">Time</a>
              <a href="/guides/">Guides</a>
              <a href="/#all-tools">All tools</a>
            </div>
          </nav>
        </header>
        ${isHome ? renderHome() : isGuides ? renderGuideIndex() : guide ? renderGuidePage(guide) : renderToolPage(tool)}
        <footer class="footer">
          <div class="footer-inner">
            <span>AI JSON Format provides free browser-based developer utilities.</span>
            <span><a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a> · <a href="/contact/">Contact</a></span>
          </div>
        </footer>
      </div>
    `;

    if (isHome) {
      bindHome();
      bindMiniTool();
    } else if (!guide && !isGuides) {
      bindTool(tool);
    }
  }

  function renderHome() {
    return `
      <section class="hero">
        <div class="hero-inner">
          <div>
            <div class="eyebrow">Free developer tools</div>
            <h1>Format, repair and convert JSON fast.</h1>
            <p class="hero-copy">
              A practical utility hub for JSON, hashing, timestamps, encoding and AI-assisted cleanup.
              Most tools run locally in your browser, with clean output ready for APIs, configs and docs.
            </p>
            <div class="hero-actions">
              <a class="button primary" href="/tools/ai-json-repair/">Repair JSON</a>
              <a class="button" href="/tools/json-formatter/">Format JSON</a>
              <a class="button" href="#all-tools">Browse tools</a>
            </div>
          </div>
          <div class="mini-tool" aria-label="Quick JSON formatter">
            <div class="mini-tool-head">
              <span class="mini-title">Quick JSON Formatter</span>
              <span class="status-pill">Local</span>
            </div>
            <div class="mini-grid">
              <textarea id="mini-input" spellcheck="false">{"site":"aijsonformat","tools":["json","hash","time"],"free":true}</textarea>
              <textarea id="mini-output" spellcheck="false" readonly></textarea>
            </div>
            <div class="mini-actions">
              <button class="button primary" id="mini-format">Format</button>
              <button class="button" id="mini-repair">Repair</button>
              <button class="button" id="mini-copy">Copy</button>
            </div>
          </div>
        </div>
      </section>
      <main class="main">
        <section id="all-tools" aria-labelledby="tools-heading">
          <div class="section-head">
            <div>
              <h2 id="tools-heading">Developer Tools</h2>
              <p>JSON, encoding, hashing, timestamps and AI-friendly utilities.</p>
            </div>
            <input class="tool-filter" id="tool-filter" type="search" placeholder="Search tools" />
          </div>
          <div class="tool-grid" id="tool-grid">
            ${tools.map(renderToolCard).join("")}
          </div>
        </section>
        <section class="content-band">
          <h2>Built for quick work</h2>
          <p>
            The site starts with JSON because that is where the domain has the strongest match, then expands into
            everyday developer utilities such as MD5, SHA256, Base64, timestamps, UUIDs and JWT decoding.
          </p>
        </section>
        <section class="content-band">
          <div class="section-head">
            <div>
              <h2>AI JSON Guides</h2>
              <p>Growth pages around AI JSON formatting, JSON parser errors and practical model-output cleanup.</p>
            </div>
          </div>
          <div class="tool-grid">
            ${growthGuides.slice(0, 6).map(renderGuideCard).join("")}
          </div>
        </section>
        <section class="content-band">
          <div class="section-head">
            <div>
              <h2>Popular Fixes</h2>
              <p>Long-tail guides for common parser errors and everyday developer conversions.</p>
            </div>
          </div>
          <div class="tool-grid">
            ${guidePages.filter((guide) => !growthGuideIds.includes(guide.id)).slice(0, 6).map(renderGuideCard).join("")}
          </div>
        </section>
      </main>
    `;
  }

  function renderToolPage(tool) {
    return `
      <main class="main">
        <div class="tool-page">
          <div>
            <section class="tool-intro">
              <div class="eyebrow">${escapeHtml(tool.category)} tool</div>
              <h1>${escapeHtml(tool.title)}</h1>
              <p>${escapeHtml(tool.description)}</p>
            </section>
            <section class="tool-panel" aria-label="${escapeHtml(tool.title)}">
              <div class="tool-layout">
                <div class="tool-io">
                  <div class="io-label">
                    <span>${escapeHtml(tool.inputLabel)}</span>
                    <button class="button" id="sample-button" type="button">Sample</button>
                  </div>
                  <textarea id="tool-input" spellcheck="false">${escapeHtml(tool.sample || "")}</textarea>
                </div>
                <div class="tool-io">
                  <div class="io-label">
                    <span>${escapeHtml(tool.outputLabel)}</span>
                    <button class="button" id="copy-button" type="button">Copy</button>
                  </div>
                  <textarea id="tool-output" spellcheck="false" readonly></textarea>
                </div>
              </div>
              <div class="tool-actions">
                <button class="button primary" id="run-button" type="button">${escapeHtml(tool.actionLabel)}</button>
                ${
                  tool.secondaryRun
                    ? `<button class="button" id="secondary-button" type="button">${escapeHtml(tool.secondaryActionLabel)}</button>`
                    : ""
                }
                <button class="button" id="clear-button" type="button">Clear</button>
              </div>
              <div class="tool-message" id="tool-message">Ready.</div>
            </section>
            <section class="content-band">
              <h2>About this tool</h2>
              <p>${escapeHtml(tool.description)} It is designed for fast copy-and-paste workflows and does not require a login.</p>
              <div class="faq">
                ${tool.faq.map(([question, answer]) => `
                  <article class="faq-item">
                    <h3>${escapeHtml(question)}</h3>
                    <p>${escapeHtml(answer)}</p>
                  </article>
                `).join("")}
              </div>
            </section>
          </div>
          <aside class="side-rail" aria-label="Related tools">
            <div class="side-box">
              <h3>Related tools</h3>
              <div class="side-links">
                ${relatedTools(tool).map((item) => `<a href="${item.path}">${escapeHtml(item.title)}</a>`).join("")}
              </div>
            </div>
          </aside>
        </div>
      </main>
    `;
  }

  function renderToolCard(tool) {
    return `
      <a class="tool-card" href="${tool.path}" data-tool-card data-search="${escapeHtml(`${tool.title} ${tool.category} ${tool.description}`.toLowerCase())}">
        <span>
          <h3>${escapeHtml(tool.title)}</h3>
          <p>${escapeHtml(tool.description)}</p>
        </span>
        <span class="tag-row">
          <span class="tag">${escapeHtml(tool.category)}</span>
          <span class="tag">Free</span>
          <span class="tag">No signup</span>
        </span>
      </a>
    `;
  }

  function renderGuidePage(guide) {
    const tool = byId[guide.primaryToolId] || byId["json-formatter"];
    return `
      <main class="main">
        <div class="tool-page">
          <div>
            <section class="tool-intro">
              <div class="eyebrow">${escapeHtml(guide.category)}</div>
              <h1>${escapeHtml(guide.title)}</h1>
              <p>${escapeHtml(guide.description)}</p>
              <div class="hero-actions">
                <a class="button primary" href="${tool.path}">Open ${escapeHtml(tool.title)}</a>
                <a class="button" href="/#all-tools">Browse tools</a>
              </div>
            </section>
            <section class="content-band">
              <h2>How to do it</h2>
              <ol class="steps-list">
                ${guide.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
              </ol>
            </section>
            <section class="content-band">
              <h2>Recommended tool</h2>
              ${renderToolCard(tool)}
            </section>
            <section class="content-band">
              <h2>FAQ</h2>
              <div class="faq">
                ${guide.faq.map(([question, answer]) => `
                  <article class="faq-item">
                    <h3>${escapeHtml(question)}</h3>
                    <p>${escapeHtml(answer)}</p>
                  </article>
                `).join("")}
              </div>
            </section>
          </div>
          <aside class="side-rail" aria-label="Related guides">
            <div class="side-box">
              <h3>Related guides</h3>
              <div class="side-links">
                ${relatedGuides(guide).map((item) => `<a href="/${item.id}/">${escapeHtml(item.title)}</a>`).join("")}
              </div>
            </div>
          </aside>
        </div>
      </main>
    `;
  }

  function renderGuideIndex() {
    return `
      <main class="main">
        <section class="tool-intro">
          <div class="eyebrow">Guides</div>
          <h1>Developer Fixes and Conversion Guides</h1>
          <p>Short, practical pages for common JSON parser errors, timestamp conversions and encoding tasks.</p>
        </section>
        <section aria-labelledby="guides-heading">
          <div class="section-head">
            <div>
              <h2 id="guides-heading">All Guides</h2>
              <p>Each guide links to a free browser-based tool you can use right away.</p>
            </div>
          </div>
          <div class="tool-grid">
            ${guidePages.map(renderGuideCard).join("")}
          </div>
        </section>
      </main>
    `;
  }

  function renderGuideCard(guide) {
    return `
      <a class="tool-card" href="/${guide.id}/">
        <span>
          <h3>${escapeHtml(guide.title)}</h3>
          <p>${escapeHtml(guide.description)}</p>
        </span>
        <span class="tag-row">
          <span class="tag">${escapeHtml(guide.category)}</span>
          <span class="tag">Guide</span>
        </span>
      </a>
    `;
  }

  function bindHome() {
    const filter = document.getElementById("tool-filter");
    const cards = Array.from(document.querySelectorAll("[data-tool-card]"));
    filter.addEventListener("input", () => {
      const query = filter.value.trim().toLowerCase();
      cards.forEach((card) => {
        card.classList.toggle("hidden", query && !card.dataset.search.includes(query));
      });
    });
  }

  function bindMiniTool() {
    const input = document.getElementById("mini-input");
    const output = document.getElementById("mini-output");
    const format = document.getElementById("mini-format");
    const repair = document.getElementById("mini-repair");
    const copy = document.getElementById("mini-copy");
    const runFormat = () => {
      const response = parseAndStringify(input.value, 2);
      output.value = response.output || response.message;
    };
    format.addEventListener("click", runFormat);
    repair.addEventListener("click", () => {
      const response = repairJsonTool(input.value);
      output.value = response.output || response.message;
    });
    copy.addEventListener("click", () => copyText(output.value));
    runFormat();
  }

  function bindTool(tool) {
    const input = document.getElementById("tool-input");
    const output = document.getElementById("tool-output");
    const message = document.getElementById("tool-message");
    const runButton = document.getElementById("run-button");
    const secondaryButton = document.getElementById("secondary-button");
    const sampleButton = document.getElementById("sample-button");
    const clearButton = document.getElementById("clear-button");
    const copyButton = document.getElementById("copy-button");

    const run = async (runner) => {
      const response = await runner(input.value);
      output.value = response.output;
      message.textContent = response.message;
      message.className = `tool-message ${response.level || ""}`;
    };

    runButton.addEventListener("click", () => run(tool.run));
    if (secondaryButton && tool.secondaryRun) {
      secondaryButton.addEventListener("click", () => run(tool.secondaryRun));
    }
    sampleButton.addEventListener("click", () => {
      input.value = tool.sample || "";
      run(tool.run);
    });
    clearButton.addEventListener("click", () => {
      input.value = "";
      output.value = "";
      message.textContent = "Cleared.";
      message.className = "tool-message";
    });
    copyButton.addEventListener("click", async () => {
      await copyText(output.value);
      message.textContent = "Copied output.";
      message.className = "tool-message ok";
    });
    run(tool.run);
  }

  function pageFromPath() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    if (parts[0] === "tools" && parts[1]) return parts[1];
    return parts[0] || "home";
  }

  function relatedTools(tool) {
    const same = tools.filter((item) => item.category === tool.category && item.id !== tool.id);
    const rest = tools.filter((item) => item.category !== tool.category);
    return same.concat(rest).slice(0, 7);
  }

  function relatedGuides(guide) {
    const sameCategory = guidePages.filter((item) => item.category === guide.category && item.id !== guide.id);
    const sameTool = guidePages.filter((item) => item.primaryToolId === guide.primaryToolId && item.category !== guide.category && item.id !== guide.id);
    const rest = guidePages.filter((item) => item.category !== guide.category && item.primaryToolId !== guide.primaryToolId && item.id !== guide.id);
    return sameCategory.concat(sameTool, rest).slice(0, 7);
  }

  function result(output, message, level) {
    return { output: String(output || ""), message: message || "Done.", level: level || "ok" };
  }

  function parseAndStringify(value, spaces) {
    try {
      const parsed = JSON.parse(value);
      return result(JSON.stringify(parsed, null, spaces), spaces === 0 ? "JSON minified." : "JSON formatted.", "ok");
    } catch (error) {
      return result("", humanJsonError(error), "error");
    }
  }

  function validateJsonTool(value) {
    try {
      const parsed = JSON.parse(value);
      const summary = Array.isArray(parsed)
        ? `Valid JSON array with ${parsed.length} item${parsed.length === 1 ? "" : "s"}.`
        : parsed && typeof parsed === "object"
          ? `Valid JSON object with ${Object.keys(parsed).length} top-level key${Object.keys(parsed).length === 1 ? "" : "s"}.`
          : `Valid JSON ${typeof parsed}.`;
      return result(summary, summary, "ok");
    } catch (error) {
      return result(humanJsonError(error), humanJsonError(error), "error");
    }
  }

  async function repairJsonTool(value) {
    const repaired = repairJson(value);
    try {
      const parsed = JSON.parse(repaired);
      return result(JSON.stringify(parsed, null, 2), "JSON repaired and formatted.", "ok");
    } catch (error) {
      const aiResult = await callAiJson("repair", value, repaired);
      if (aiResult) return aiResult;
      return result(repaired, `Best effort repair created, but JSON still has an error: ${humanJsonError(error)}`, "warn");
    }
  }

  function repairJson(value) {
    let text = String(value || "").trim();
    text = text.replace(/^```(?:json|javascript|js)?\s*/i, "").replace(/```$/i, "").trim();
    text = text.replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'");
    text = text.replace(/\/\*[\s\S]*?\*\//g, "");
    text = text.replace(/(^|[^:])\/\/.*$/gm, "$1");
    text = text.replace(/,\s*([}\]])/g, "$1");
    text = text.replace(/([{,]\s*)([A-Za-z_$][\w$-]*)(\s*:)/g, '$1"$2"$3');
    text = replaceSingleQuotedStrings(text);
    text = balanceBrackets(text);
    return text;
  }

  function replaceSingleQuotedStrings(text) {
    return text.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_, inner) => {
      return `"${inner.replace(/"/g, '\\"')}"`;
    });
  }

  function balanceBrackets(text) {
    const stack = [];
    let inString = false;
    let escaped = false;
    for (const char of text) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;
      if (char === "{" || char === "[") stack.push(char);
      if (char === "}" && stack[stack.length - 1] === "{") stack.pop();
      if (char === "]" && stack[stack.length - 1] === "[") stack.pop();
    }
    while (stack.length) {
      text += stack.pop() === "{" ? "}" : "]";
    }
    return text;
  }

  function escapeJsonString(value) {
    return result(JSON.stringify(String(value)).slice(1, -1), "String escaped for JSON.", "ok");
  }

  function unescapeJsonString(value) {
    try {
      return result(JSON.parse(`"${String(value).replace(/^"|"$/g, "")}"`), "JSON string unescaped.", "ok");
    } catch (error) {
      return result("", error.message, "error");
    }
  }

  function encodeBase64(value) {
    return result(btoa(unescape(encodeURIComponent(value))), "Base64 encoded.", "ok");
  }

  function decodeBase64(value) {
    try {
      return result(decodeURIComponent(escape(atob(value.trim()))), "Base64 decoded.", "ok");
    } catch (error) {
      return result("", "Invalid Base64 input.", "error");
    }
  }

  async function sha256Tool(value) {
    if (!window.crypto || !window.crypto.subtle) {
      return result("", "Browser crypto API is not available.", "error");
    }
    const bytes = new TextEncoder().encode(value);
    const digest = await window.crypto.subtle.digest("SHA-256", bytes);
    const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    return result(hash, "SHA256 generated locally.", "ok");
  }

  function timestampTool(value) {
    const input = value.trim();
    if (!input) return result("", "Enter a timestamp or date.", "error");
    let date;
    if (/^-?\d+$/.test(input)) {
      const number = Number(input);
      date = new Date(Math.abs(number) > 9999999999 ? number : number * 1000);
    } else {
      date = new Date(input);
    }
    if (Number.isNaN(date.getTime())) {
      return result("", "Could not parse the timestamp or date.", "error");
    }
    const seconds = Math.floor(date.getTime() / 1000);
    const milliseconds = date.getTime();
    return result(
      [
        `Unix seconds: ${seconds}`,
        `Unix milliseconds: ${milliseconds}`,
        `Local time: ${date.toString()}`,
        `UTC time: ${date.toISOString()}`
      ].join("\n"),
      "Timestamp converted.",
      "ok"
    );
  }

  function currentTimestampTool(value) {
    const input = value.trim();
    const date = input ? new Date(input) : new Date();
    if (Number.isNaN(date.getTime())) {
      return result("", "Could not parse the optional date. Leave it empty for the current time.", "error");
    }
    return result(
      [
        `Unix seconds: ${Math.floor(date.getTime() / 1000)}`,
        `Unix milliseconds: ${date.getTime()}`,
        `ISO 8601: ${date.toISOString()}`,
        `UTC time: ${date.toUTCString()}`,
        `Local time: ${date.toString()}`
      ].join("\n"),
      input ? "Converted the provided date." : "Current timestamp generated.",
      "ok"
    );
  }

  function uuidTool(value) {
    const count = clamp(parseInt(value, 10) || 1, 1, 100);
    const ids = Array.from({ length: count }, () => {
      if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
        const random = Math.floor(Math.random() * 16);
        const value = char === "x" ? random : (random & 0x3) | 0x8;
        return value.toString(16);
      });
    });
    return result(ids.join("\n"), `${count} UUID${count === 1 ? "" : "s"} generated.`, "ok");
  }

  function htmlEntityEncodeTool(value) {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return result(String(value).replace(/[&<>"']/g, (char) => map[char]), "HTML entities encoded.", "ok");
  }

  function htmlEntityDecodeTool(value) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = value;
    return result(textarea.value, "HTML entities decoded.", "ok");
  }

  function caseConverterTool(value) {
    const words = splitWords(value);
    if (!words.length) return result("", "Enter text to convert.", "error");
    const lowerWords = words.map((word) => word.toLowerCase());
    const pascal = lowerWords.map(capitalize).join("");
    const camel = pascal.charAt(0).toLowerCase() + pascal.slice(1);
    const lines = [
      `camelCase: ${camel}`,
      `PascalCase: ${pascal}`,
      `snake_case: ${lowerWords.join("_")}`,
      `kebab-case: ${lowerWords.join("-")}`,
      `UPPERCASE: ${String(value).toUpperCase()}`,
      `lowercase: ${String(value).toLowerCase()}`
    ];
    return result(lines.join("\n"), "Converted text into common cases.", "ok");
  }

  function slugGeneratorTool(value) {
    const slug = String(value)
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-");
    return result(slug, slug ? "Slug generated." : "Enter text to generate a slug.", slug ? "ok" : "error");
  }

  function wordCounterTool(value) {
    const text = String(value);
    const words = text.trim() ? text.trim().match(/\S+/g) || [] : [];
    const lines = text ? text.split(/\r?\n/) : [];
    const paragraphs = text.trim() ? text.trim().split(/\n\s*\n/).filter(Boolean) : [];
    return result(
      [
        `Words: ${words.length}`,
        `Characters: ${text.length}`,
        `Characters without spaces: ${text.replace(/\s/g, "").length}`,
        `Lines: ${lines.length}`,
        `Paragraphs: ${paragraphs.length}`
      ].join("\n"),
      "Text counted.",
      "ok"
    );
  }

  function cronParserTool(value) {
    const parts = value.trim().split(/\s+/);
    if (parts.length !== 5) {
      return result("", "Enter a standard 5-field cron expression: minute hour day-of-month month day-of-week.", "error");
    }
    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    const lines = [
      `Minute: ${describeCronField(minute, "minute")}`,
      `Hour: ${describeCronField(hour, "hour")}`,
      `Day of month: ${describeCronField(dayOfMonth, "day of month")}`,
      `Month: ${describeCronField(month, "month")}`,
      `Day of week: ${describeCronField(dayOfWeek, "day of week")}`
    ];
    return result(lines.join("\n"), "Cron expression explained.", "ok");
  }

  function jwtTool(value) {
    try {
      const parts = value.trim().split(".");
      if (parts.length < 2) throw new Error("JWT must have at least header and payload parts.");
      const header = JSON.parse(base64UrlDecode(parts[0]));
      const payload = JSON.parse(base64UrlDecode(parts[1]));
      return result(
        JSON.stringify({ header, payload }, null, 2),
        "JWT decoded. Signature was not verified.",
        "warn"
      );
    } catch (error) {
      return result("", error.message, "error");
    }
  }

  function passwordTool(value) {
    const options = String(value || "").toLowerCase();
    const length = clamp(parseInt(options, 10) || 24, 8, 128);
    const letters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    const numbers = "23456789";
    const symbols = "!@#$%^&*_-+=?";
    let alphabet = letters + numbers + symbols;
    if (/no[-\s]?symbols?/.test(options)) alphabet = letters + numbers;
    if (/letters?\s+only/.test(options)) alphabet = letters;
    if (/numbers?\s+only|digits?\s+only/.test(options)) alphabet = numbers;
    const array = new Uint32Array(length);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(array);
    } else {
      for (let index = 0; index < length; index += 1) array[index] = Math.floor(Math.random() * 4294967296);
    }
    const password = Array.from(array, (number) => alphabet[number % alphabet.length]).join("");
    return result(password, `Generated a ${length}-character password.`, "ok");
  }

  function textToJsonTool(value) {
    const lines = value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (!lines.length) return result("{}", "Enter text to convert.", "error");

    const object = {};
    let keyValueCount = 0;
    for (const line of lines) {
      const match = line.match(/^([^:=\t]+)\s*[:=\t]\s*(.+)$/);
      if (match) {
        object[toCamelKey(match[1])] = coerceValue(match[2]);
        keyValueCount += 1;
      }
    }
    if (keyValueCount === lines.length) {
      return result(JSON.stringify(object, null, 2), "Converted key-value text to JSON.", "ok");
    }

    if (lines.length > 1 && lines.every((line) => line.includes(","))) {
      const rows = lines.map((line) => line.split(",").map((cell) => cell.trim()));
      const headers = rows[0].map(toCamelKey);
      const data = rows.slice(1).map((row) => Object.fromEntries(headers.map((header, index) => [header, coerceValue(row[index] || "")])));
      return result(JSON.stringify(data, null, 2), "Converted CSV-like text to JSON.", "ok");
    }

    return result(JSON.stringify(lines.map(coerceValue), null, 2), "Converted lines to a JSON array.", "ok");
  }

  async function aiTextToJsonTool(value) {
    const aiResult = await callAiJson("text-to-json", value);
    if (aiResult) return aiResult;
    return result(
      textToJsonTool(value).output,
      "AI mode is not configured yet, so local conversion was used.",
      "warn"
    );
  }

  async function callAiJson(mode, input, localRepair) {
    try {
      const response = await fetch("/api/ai-json/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, input, localRepair })
      });
      if (response.status === 404 || response.status === 501) return null;
      const data = await response.json();
      if (!response.ok) return result(localRepair || "", data.error || "AI request failed.", "warn");
      const parsed = JSON.parse(data.output);
      return result(JSON.stringify(parsed, null, 2), data.message || "AI JSON generated.", "ok");
    } catch (error) {
      return null;
    }
  }

  function jsonToCsvTool(value) {
    try {
      const parsed = JSON.parse(value);
      const rows = Array.isArray(parsed) ? parsed : [parsed];
      if (!rows.length) return result("", "JSON array is empty.", "warn");
      if (!rows.every((row) => row && typeof row === "object" && !Array.isArray(row))) {
        return result("", "JSON to CSV works best with an object or an array of objects.", "error");
      }
      const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
      const csvRows = [
        headers.map(csvEscape).join(","),
        ...rows.map((row) => headers.map((header) => csvEscape(formatCsvValue(row[header]))).join(","))
      ];
      return result(csvRows.join("\n"), `Converted ${rows.length} row${rows.length === 1 ? "" : "s"} to CSV.`, "ok");
    } catch (error) {
      return result("", humanJsonError(error), "error");
    }
  }

  function jsonToYamlTool(value) {
    try {
      const parsed = JSON.parse(value);
      return result(toYaml(parsed), "Converted JSON to YAML.", "ok");
    } catch (error) {
      return result("", humanJsonError(error), "error");
    }
  }

  function jsonToTypeScriptTool(value) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        const itemShape = parsed.length ? typeScriptShape(mergeArrayItems(parsed), 0) : "unknown";
        return result(`type RootObject = ${itemShape}[];`, "Generated TypeScript type.", "ok");
      }
      if (parsed && typeof parsed === "object") {
        return result(`interface RootObject ${typeScriptShape(parsed, 0)}`, "Generated TypeScript interface.", "ok");
      }
      return result(`type RootObject = ${typeScriptShape(parsed, 0)};`, "Generated TypeScript type.", "ok");
    } catch (error) {
      return result("", humanJsonError(error), "error");
    }
  }

  function jsonToSchemaTool(value) {
    try {
      const parsed = JSON.parse(value);
      const schema = {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        ...schemaForValue(parsed)
      };
      return result(JSON.stringify(schema, null, 2), "Generated JSON Schema.", "ok");
    } catch (error) {
      return result("", humanJsonError(error), "error");
    }
  }

  function jsonSorterTool(value) {
    try {
      const parsed = JSON.parse(value);
      return result(JSON.stringify(sortJsonValue(parsed), null, 2), "JSON object keys sorted recursively.", "ok");
    } catch (error) {
      return result("", humanJsonError(error), "error");
    }
  }

  function sortJsonValue(value) {
    if (Array.isArray(value)) return value.map(sortJsonValue);
    if (value && typeof value === "object") {
      return Object.keys(value).sort().reduce((sorted, key) => {
        sorted[key] = sortJsonValue(value[key]);
        return sorted;
      }, {});
    }
    return value;
  }

  function jsonPathTool(value) {
    const { jsonText, path } = splitJsonAndPath(value);
    if (!jsonText || !path) {
      return result("", "Paste JSON, add a blank line, then add a path like $.items[0].id.", "error");
    }
    try {
      const parsed = JSON.parse(jsonText);
      const extracted = readSimpleJsonPath(parsed, path);
      return result(formatJsonValue(extracted), `Extracted value at ${path}.`, "ok");
    } catch (error) {
      return result("", error.message || humanJsonError(error), "error");
    }
  }

  function splitJsonAndPath(value) {
    const text = String(value || "").trim();
    const blocks = text.split(/\n\s*\n/);
    if (blocks.length > 1) {
      return {
        jsonText: blocks.slice(0, -1).join("\n\n").trim(),
        path: blocks[blocks.length - 1].trim().split(/\r?\n/)[0].trim()
      };
    }
    const lines = text.split(/\r?\n/);
    const path = (lines.pop() || "").trim();
    return { jsonText: lines.join("\n").trim(), path };
  }

  function readSimpleJsonPath(value, path) {
    let expression = String(path || "").trim();
    if (!expression) throw new Error("Enter a JSON path.");
    if (expression.startsWith("$")) expression = expression.slice(1);
    if (expression.startsWith(".")) expression = expression.slice(1);
    if (!expression) return value;

    const tokens = [];
    const pattern = /([A-Za-z_$][\w$-]*|\[(?:\d+|"[^"]+"|'[^']+')\])/g;
    let match;
    let cursor = 0;
    while ((match = pattern.exec(expression))) {
      if (match.index !== cursor) {
        throw new Error("Unsupported path syntax. Try $.user.name or $.items[0].id.");
      }
      const token = match[1];
      if (token.startsWith("[")) {
        const inner = token.slice(1, -1);
        tokens.push(/^\d+$/.test(inner) ? Number(inner) : inner.replace(/^["']|["']$/g, ""));
      } else {
        tokens.push(token);
      }
      cursor = pattern.lastIndex;
      if (expression[cursor] === ".") {
        cursor += 1;
        pattern.lastIndex = cursor;
      }
    }
    if (!tokens.length || cursor < expression.length) {
      throw new Error("Unsupported path syntax. Try $.user.name or $.items[0].id.");
    }

    return tokens.reduce((current, token) => {
      if (current == null || !(token in Object(current))) {
        throw new Error(`Path not found at ${String(token)}.`);
      }
      return current[token];
    }, value);
  }

  function jsonLinesToArrayTool(value) {
    try {
      const lines = String(value || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      if (!lines.length) return result("[]", "Enter JSON Lines to convert.", "error");
      const parsed = lines.map((line, index) => {
        try {
          return JSON.parse(line);
        } catch (error) {
          throw new Error(`Line ${index + 1}: ${humanJsonError(error)}`);
        }
      });
      return result(JSON.stringify(parsed, null, 2), `Converted ${parsed.length} JSONL row${parsed.length === 1 ? "" : "s"} to a JSON array.`, "ok");
    } catch (error) {
      return result("", error.message, "error");
    }
  }

  function jsonArrayToLinesTool(value) {
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) return result("", "Input must be a JSON array.", "error");
      return result(parsed.map((item) => JSON.stringify(item)).join("\n"), `Converted ${parsed.length} array item${parsed.length === 1 ? "" : "s"} to JSON Lines.`, "ok");
    } catch (error) {
      return result("", humanJsonError(error), "error");
    }
  }

  function jsonToMarkdownTool(value) {
    try {
      const parsed = JSON.parse(value);
      const rows = Array.isArray(parsed) ? parsed : [parsed];
      if (!rows.length) return result("", "JSON array is empty.", "warn");
      if (!rows.every((row) => row && typeof row === "object" && !Array.isArray(row))) {
        return result("", "JSON to Markdown works best with an object or an array of objects.", "error");
      }
      const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
      const table = [
        `| ${headers.map(markdownCell).join(" | ")} |`,
        `| ${headers.map(() => "---").join(" | ")} |`,
        ...rows.map((row) => `| ${headers.map((header) => markdownCell(formatJsonValue(row[header]))).join(" | ")} |`)
      ];
      return result(table.join("\n"), `Converted ${rows.length} row${rows.length === 1 ? "" : "s"} to a Markdown table.`, "ok");
    } catch (error) {
      return result("", humanJsonError(error), "error");
    }
  }

  function formatJsonValue(value) {
    if (value === undefined) return "";
    if (value && typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
  }

  function markdownCell(value) {
    return String(value ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, "<br>");
  }

  function csvEscape(value) {
    const text = String(value ?? "");
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  function formatCsvValue(value) {
    if (value === undefined || value === null) return "";
    if (typeof value === "object") return JSON.stringify(value);
    return value;
  }

  function toYaml(value, depth = 0) {
    const indent = "  ".repeat(depth);
    if (Array.isArray(value)) {
      if (!value.length) return "[]";
      return value.map((item) => {
        if (item && typeof item === "object") {
          return `${indent}-\n${toYaml(item, depth + 1)}`;
        }
        return `${indent}- ${yamlScalar(item)}`;
      }).join("\n");
    }
    if (value && typeof value === "object") {
      const entries = Object.entries(value);
      if (!entries.length) return "{}";
      return entries.map(([key, item]) => {
        if (item && typeof item === "object") {
          return `${indent}${key}:\n${toYaml(item, depth + 1)}`;
        }
        return `${indent}${key}: ${yamlScalar(item)}`;
      }).join("\n");
    }
    return `${indent}${yamlScalar(value)}`;
  }

  function yamlScalar(value) {
    if (value === null) return "null";
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    const text = String(value);
    return /^[A-Za-z0-9_./:-]+$/.test(text) ? text : JSON.stringify(text);
  }

  function typeScriptShape(value, depth) {
    const indent = "  ".repeat(depth);
    const childIndent = "  ".repeat(depth + 1);
    if (Array.isArray(value)) {
      if (!value.length) return "unknown[]";
      return `${typeScriptShape(value[0], depth)}[]`;
    }
    if (value && typeof value === "object") {
      const lines = Object.entries(value).map(([key, item]) => {
        return `${childIndent}${safeTypeScriptKey(key)}: ${typeScriptShape(item, depth + 1)};`;
      });
      return `{\n${lines.join("\n")}\n${indent}}`;
    }
    if (value === null) return "null";
    if (typeof value === "string") return "string";
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    return "unknown";
  }

  function safeTypeScriptKey(key) {
    return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
  }

  function mergeArrayItems(items) {
    const objectItems = items.filter((item) => item && typeof item === "object" && !Array.isArray(item));
    if (!objectItems.length) return items[0];
    const merged = {};
    for (const item of objectItems) {
      for (const [key, value] of Object.entries(item)) {
        if (!(key in merged)) {
          merged[key] = value;
        } else if (Array.isArray(merged[key]) && Array.isArray(value)) {
          merged[key] = merged[key].length ? merged[key] : value;
        } else if (
          merged[key] &&
          value &&
          typeof merged[key] === "object" &&
          typeof value === "object" &&
          !Array.isArray(merged[key]) &&
          !Array.isArray(value)
        ) {
          merged[key] = { ...merged[key], ...value };
        }
      }
    }
    return merged;
  }

  function schemaForValue(value) {
    if (Array.isArray(value)) {
      return {
        type: "array",
        items: value.length ? schemaForValue(mergeArrayItems(value)) : {}
      };
    }
    if (value && typeof value === "object") {
      const properties = Object.fromEntries(Object.entries(value).map(([key, item]) => [key, schemaForValue(item)]));
      return {
        type: "object",
        properties,
        required: Object.keys(value)
      };
    }
    if (value === null) return { type: "null" };
    return { type: typeof value };
  }

  function humanJsonError(error) {
    return error && error.message ? error.message : "Invalid JSON.";
  }

  function base64UrlDecode(value) {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    return decodeURIComponent(escape(atob(padded)));
  }

  function coerceValue(value) {
    const text = String(value || "").trim();
    if (text === "true") return true;
    if (text === "false") return false;
    if (text === "null") return null;
    if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);
    if (text.includes(",") && !/^https?:\/\//.test(text)) return text.split(",").map((item) => coerceValue(item));
    return text.replace(/^["']|["']$/g, "");
  }

  function toCamelKey(value) {
    return String(value || "")
      .trim()
      .replace(/[^A-Za-z0-9]+(.)/g, (_, char) => char.toUpperCase())
      .replace(/^[A-Z]/, (char) => char.toLowerCase()) || "value";
  }

  function splitWords(value) {
    return String(value)
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .split(/[^A-Za-z0-9]+/)
      .filter(Boolean);
  }

  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function describeCronField(field, label) {
    const names = {
      jan: "January",
      feb: "February",
      mar: "March",
      apr: "April",
      may: "May",
      jun: "June",
      jul: "July",
      aug: "August",
      sep: "September",
      oct: "October",
      nov: "November",
      dec: "December",
      sun: "Sunday",
      mon: "Monday",
      tue: "Tuesday",
      wed: "Wednesday",
      thu: "Thursday",
      fri: "Friday",
      sat: "Saturday"
    };
    const normalize = (text) => names[String(text).toLowerCase()] || text;
    if (field === "*") return `every ${label}`;
    if (/^\*\/\d+$/.test(field)) return `every ${field.slice(2)} ${label}s`;
    if (/^\d+$/.test(field) || names[field.toLowerCase()]) return `at ${normalize(field)}`;
    if (field.includes(",")) return `at ${field.split(",").map(normalize).join(", ")}`;
    if (field.includes("-")) {
      const [start, end] = field.split("-");
      return `from ${normalize(start)} through ${normalize(end)}`;
    }
    if (field.includes("/")) {
      const [range, step] = field.split("/");
      return `every ${step} ${label}s within ${range}`;
    }
    return field;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  async function copyText(value) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return;
    }
    const textArea = document.createElement("textarea");
    textArea.value = value;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand("copy");
    textArea.remove();
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function md5(input) {
    function rotateLeft(value, shift) {
      return (value << shift) | (value >>> (32 - shift));
    }
    function addUnsigned(x, y) {
      const x4 = x & 0x40000000;
      const y4 = y & 0x40000000;
      const x8 = x & 0x80000000;
      const y8 = y & 0x80000000;
      const result = (x & 0x3fffffff) + (y & 0x3fffffff);
      if (x4 & y4) return result ^ 0x80000000 ^ x8 ^ y8;
      if (x4 | y4) {
        if (result & 0x40000000) return result ^ 0xc0000000 ^ x8 ^ y8;
        return result ^ 0x40000000 ^ x8 ^ y8;
      }
      return result ^ x8 ^ y8;
    }
    function f(x, y, z) { return (x & y) | (~x & z); }
    function g(x, y, z) { return (x & z) | (y & ~z); }
    function h(x, y, z) { return x ^ y ^ z; }
    function i(x, y, z) { return y ^ (x | ~z); }
    function transform(fn, a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(fn(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }
    function utf8Encode(text) {
      return unescape(encodeURIComponent(text));
    }
    function convertToWordArray(text) {
      const length = text.length;
      const words = [];
      const numberOfWords = (((length + 8) - ((length + 8) % 64)) / 64 + 1) * 16;
      for (let index = 0; index < numberOfWords; index += 1) words[index] = 0;
      for (let index = 0; index < length; index += 1) {
        words[index >> 2] |= text.charCodeAt(index) << ((index % 4) * 8);
      }
      words[length >> 2] |= 0x80 << ((length % 4) * 8);
      words[numberOfWords - 2] = length << 3;
      words[numberOfWords - 1] = length >>> 29;
      return words;
    }
    function wordToHex(value) {
      let output = "";
      for (let count = 0; count <= 3; count += 1) {
        output += ((value >>> (count * 8)) & 255).toString(16).padStart(2, "0");
      }
      return output;
    }

    const x = convertToWordArray(utf8Encode(input));
    let a = 0x67452301;
    let b = 0xefcdab89;
    let c = 0x98badcfe;
    let d = 0x10325476;

    for (let k = 0; k < x.length; k += 16) {
      const aa = a;
      const bb = b;
      const cc = c;
      const dd = d;

      a = transform(f, a, b, c, d, x[k + 0], 7, 0xd76aa478);
      d = transform(f, d, a, b, c, x[k + 1], 12, 0xe8c7b756);
      c = transform(f, c, d, a, b, x[k + 2], 17, 0x242070db);
      b = transform(f, b, c, d, a, x[k + 3], 22, 0xc1bdceee);
      a = transform(f, a, b, c, d, x[k + 4], 7, 0xf57c0faf);
      d = transform(f, d, a, b, c, x[k + 5], 12, 0x4787c62a);
      c = transform(f, c, d, a, b, x[k + 6], 17, 0xa8304613);
      b = transform(f, b, c, d, a, x[k + 7], 22, 0xfd469501);
      a = transform(f, a, b, c, d, x[k + 8], 7, 0x698098d8);
      d = transform(f, d, a, b, c, x[k + 9], 12, 0x8b44f7af);
      c = transform(f, c, d, a, b, x[k + 10], 17, 0xffff5bb1);
      b = transform(f, b, c, d, a, x[k + 11], 22, 0x895cd7be);
      a = transform(f, a, b, c, d, x[k + 12], 7, 0x6b901122);
      d = transform(f, d, a, b, c, x[k + 13], 12, 0xfd987193);
      c = transform(f, c, d, a, b, x[k + 14], 17, 0xa679438e);
      b = transform(f, b, c, d, a, x[k + 15], 22, 0x49b40821);

      a = transform(g, a, b, c, d, x[k + 1], 5, 0xf61e2562);
      d = transform(g, d, a, b, c, x[k + 6], 9, 0xc040b340);
      c = transform(g, c, d, a, b, x[k + 11], 14, 0x265e5a51);
      b = transform(g, b, c, d, a, x[k + 0], 20, 0xe9b6c7aa);
      a = transform(g, a, b, c, d, x[k + 5], 5, 0xd62f105d);
      d = transform(g, d, a, b, c, x[k + 10], 9, 0x02441453);
      c = transform(g, c, d, a, b, x[k + 15], 14, 0xd8a1e681);
      b = transform(g, b, c, d, a, x[k + 4], 20, 0xe7d3fbc8);
      a = transform(g, a, b, c, d, x[k + 9], 5, 0x21e1cde6);
      d = transform(g, d, a, b, c, x[k + 14], 9, 0xc33707d6);
      c = transform(g, c, d, a, b, x[k + 3], 14, 0xf4d50d87);
      b = transform(g, b, c, d, a, x[k + 8], 20, 0x455a14ed);
      a = transform(g, a, b, c, d, x[k + 13], 5, 0xa9e3e905);
      d = transform(g, d, a, b, c, x[k + 2], 9, 0xfcefa3f8);
      c = transform(g, c, d, a, b, x[k + 7], 14, 0x676f02d9);
      b = transform(g, b, c, d, a, x[k + 12], 20, 0x8d2a4c8a);

      a = transform(h, a, b, c, d, x[k + 5], 4, 0xfffa3942);
      d = transform(h, d, a, b, c, x[k + 8], 11, 0x8771f681);
      c = transform(h, c, d, a, b, x[k + 11], 16, 0x6d9d6122);
      b = transform(h, b, c, d, a, x[k + 14], 23, 0xfde5380c);
      a = transform(h, a, b, c, d, x[k + 1], 4, 0xa4beea44);
      d = transform(h, d, a, b, c, x[k + 4], 11, 0x4bdecfa9);
      c = transform(h, c, d, a, b, x[k + 7], 16, 0xf6bb4b60);
      b = transform(h, b, c, d, a, x[k + 10], 23, 0xbebfbc70);
      a = transform(h, a, b, c, d, x[k + 13], 4, 0x289b7ec6);
      d = transform(h, d, a, b, c, x[k + 0], 11, 0xeaa127fa);
      c = transform(h, c, d, a, b, x[k + 3], 16, 0xd4ef3085);
      b = transform(h, b, c, d, a, x[k + 6], 23, 0x04881d05);
      a = transform(h, a, b, c, d, x[k + 9], 4, 0xd9d4d039);
      d = transform(h, d, a, b, c, x[k + 12], 11, 0xe6db99e5);
      c = transform(h, c, d, a, b, x[k + 15], 16, 0x1fa27cf8);
      b = transform(h, b, c, d, a, x[k + 2], 23, 0xc4ac5665);

      a = transform(i, a, b, c, d, x[k + 0], 6, 0xf4292244);
      d = transform(i, d, a, b, c, x[k + 7], 10, 0x432aff97);
      c = transform(i, c, d, a, b, x[k + 14], 15, 0xab9423a7);
      b = transform(i, b, c, d, a, x[k + 5], 21, 0xfc93a039);
      a = transform(i, a, b, c, d, x[k + 12], 6, 0x655b59c3);
      d = transform(i, d, a, b, c, x[k + 3], 10, 0x8f0ccc92);
      c = transform(i, c, d, a, b, x[k + 10], 15, 0xffeff47d);
      b = transform(i, b, c, d, a, x[k + 1], 21, 0x85845dd1);
      a = transform(i, a, b, c, d, x[k + 8], 6, 0x6fa87e4f);
      d = transform(i, d, a, b, c, x[k + 15], 10, 0xfe2ce6e0);
      c = transform(i, c, d, a, b, x[k + 6], 15, 0xa3014314);
      b = transform(i, b, c, d, a, x[k + 13], 21, 0x4e0811a1);
      a = transform(i, a, b, c, d, x[k + 4], 6, 0xf7537e82);
      d = transform(i, d, a, b, c, x[k + 11], 10, 0xbd3af235);
      c = transform(i, c, d, a, b, x[k + 2], 15, 0x2ad7d2bb);
      b = transform(i, b, c, d, a, x[k + 9], 21, 0xeb86d391);

      a = addUnsigned(a, aa);
      b = addUnsigned(b, bb);
      c = addUnsigned(c, cc);
      d = addUnsigned(d, dd);
    }

    return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
  }
})();
