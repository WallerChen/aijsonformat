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
      id: "csv-to-json",
      title: "CSV to JSON",
      category: "JSON",
      path: "/tools/csv-to-json/",
      description: "Convert CSV tables into JSON arrays with header-based object keys.",
      inputLabel: "CSV Input",
      outputLabel: "JSON Output",
      actionLabel: "Convert to JSON",
      sample: "name,type\nAI JSON Format,tool\nTimestamp Converter,time",
      run: csvToJsonTool,
      faq: [
        ["What CSV format works best?", "A header row followed by data rows works best because headers become JSON object keys."],
        ["Are quoted CSV values supported?", "Yes. Quoted fields and escaped double quotes are supported."],
        ["Does this upload my CSV?", "No. CSV to JSON conversion runs locally in your browser."]
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
      id: "json-compare",
      title: "JSON Compare",
      category: "JSON",
      path: "/tools/json-compare/",
      description: "Compare two JSON values and list added, removed and changed paths.",
      inputLabel: "First JSON, blank line, second JSON",
      outputLabel: "JSON Differences",
      actionLabel: "Compare JSON",
      sample: '{ "name": "AI JSON Format", "version": 1, "tools": ["json"] }\n\n{ "name": "AI JSON Format", "version": 2, "tools": ["json", "text"] }',
      run: jsonCompareTool,
      faq: [
        ["How do I enter two JSON values?", "Paste the first JSON value, add a blank line, then paste the second JSON value."],
        ["What differences are shown?", "The tool lists added, removed and changed paths with old and new values."],
        ["Is this a visual diff?", "This version is a concise path-based diff designed for quick API and config checks."]
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
      sample: "1714857600",
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
      id: "url-parser",
      title: "URL Parser",
      category: "Encode",
      path: "/tools/url-parser/",
      description: "Parse a URL into protocol, host, path, query parameters, hash and origin.",
      inputLabel: "URL",
      outputLabel: "Parsed URL",
      actionLabel: "Parse URL",
      sample: "https://aijsonformat.com/tools/json-formatter/?utm_source=chat&q=json#tool",
      run: urlParserTool,
      faq: [
        ["What URL parts are shown?", "The parser returns protocol, hostname, port, path, query parameters, hash and origin."],
        ["Can it parse relative URLs?", "Yes. Relative URLs are resolved against this site's domain for parsing."],
        ["Is the URL sent to a server?", "No. URL parsing uses the browser URL API locally."]
      ]
    },
    {
      id: "query-string-to-json",
      title: "Query String to JSON",
      category: "Encode",
      path: "/tools/query-string-to-json/",
      description: "Convert URL query strings into JSON objects for debugging links and tracking parameters.",
      inputLabel: "Query String or URL",
      outputLabel: "JSON Output",
      actionLabel: "Convert Query to JSON",
      sample: "https://aijsonformat.com/?utm_source=google&utm_medium=organic&q=json&q=tools",
      run: queryStringToJsonTool,
      faq: [
        ["Can I paste a full URL?", "Yes. The tool extracts the query string from a full URL or accepts only the part after the question mark."],
        ["How are duplicate keys handled?", "Duplicate keys become arrays so repeated parameters are preserved."],
        ["Does this decode percent encoding?", "Yes. URLSearchParams decodes percent-encoded values."]
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
      id: "remove-whitespace",
      title: "Remove Whitespace",
      category: "Text",
      path: "/tools/remove-whitespace/",
      description: "Remove spaces, tabs, line breaks or normalize repeated whitespace in text.",
      inputLabel: "Input Text",
      outputLabel: "Cleaned Text",
      actionLabel: "Remove All Whitespace",
      secondaryActionLabel: "Normalize Spaces",
      sample: "  AI   JSON   Format  \n\n  remove   extra   spaces\tand line breaks.  ",
      run: removeWhitespaceTool,
      secondaryRun: normalizeWhitespaceTool,
      faq: [
        ["What whitespace is removed?", "The main action removes spaces, tabs and line breaks. Normalize Spaces keeps words readable with single spaces."],
        ["Can I remove line breaks only?", "Use Text Formatter or Line Sorter for line-based cleanup."],
        ["Is the text uploaded?", "No. Whitespace cleanup runs locally in your browser."]
      ]
    },
    {
      id: "text-formatter",
      title: "Text Formatter",
      category: "Text",
      path: "/tools/text-formatter/",
      description: "Format plain text by trimming lines, normalizing blank lines and cleaning repeated spaces.",
      inputLabel: "Messy Text",
      outputLabel: "Formatted Text",
      actionLabel: "Format Text",
      secondaryActionLabel: "Compact Paragraphs",
      sample: "  First line with   extra spaces.  \n\n\n  Second line.  \nThird    line.",
      run: textFormatterTool,
      secondaryRun: compactParagraphsTool,
      faq: [
        ["What does text formatting change?", "It trims each line, normalizes repeated spaces and collapses multiple blank lines."],
        ["Does it rewrite the words?", "No. It only cleans spacing and line breaks."],
        ["Can I use it for copied docs?", "Yes. It is useful for cleaning copied emails, notes, prompts and documentation snippets."]
      ]
    },
    {
      id: "text-replace",
      title: "Find and Replace Text",
      category: "Text",
      path: "/tools/text-replace/",
      description: "Find and replace text online with plain text or regex-style replacement.",
      inputLabel: "Find, replace, then text",
      outputLabel: "Replaced Text",
      actionLabel: "Replace Text",
      secondaryActionLabel: "Regex Replace",
      sample: "Find: JSON\nReplace: AI JSON\n\nJSON Formatter helps format JSON quickly.",
      run: textReplaceTool,
      secondaryRun: regexReplaceTool,
      faq: [
        ["How do I enter find and replace?", "Use Find: value and Replace: value on the first lines, then add a blank line and the text to update."],
        ["Can I use regex?", "Yes. Use Regex Replace with a pattern such as /json/gi in the Find line."],
        ["Does this run locally?", "Yes. Replacement happens in your browser."]
      ]
    },
    {
      id: "regex-tester",
      title: "Regex Tester",
      category: "Text",
      path: "/tools/regex-tester/",
      description: "Test regular expressions against text and inspect matches, groups and indexes.",
      inputLabel: "Pattern, then test text",
      outputLabel: "Regex Matches",
      actionLabel: "Test Regex",
      sample: "Pattern: /json/gi\n\nAI JSON Format includes json formatter and JSON repair tools.",
      run: regexTesterTool,
      faq: [
        ["How do I enter a regex?", "Use Pattern: /your-pattern/flags on the first line, then add a blank line and the text to test."],
        ["Are capture groups shown?", "Yes. Capture groups are shown when the regex includes them."],
        ["Does it modify text?", "No. Regex Tester only reports matches. Use Find and Replace Text when you want to replace matches."]
      ]
    },
    {
      id: "line-sorter",
      title: "Line Sorter",
      category: "Text",
      path: "/tools/line-sorter/",
      description: "Sort lines alphabetically, reverse line order and clean line-based lists.",
      inputLabel: "Lines",
      outputLabel: "Sorted Lines",
      actionLabel: "Sort Lines",
      secondaryActionLabel: "Reverse Lines",
      sample: "json formatter\nai json repair\ntimestamp converter\nbase64 decoder",
      run: lineSorterTool,
      secondaryRun: reverseLinesTool,
      faq: [
        ["How are lines sorted?", "Lines are sorted alphabetically with case-insensitive comparison."],
        ["Are blank lines kept?", "Blank lines are removed before sorting or reversing."],
        ["Can I deduplicate lines?", "Yes. Use the Duplicate Line Remover tool."]
      ]
    },
    {
      id: "duplicate-line-remover",
      title: "Duplicate Line Remover",
      category: "Text",
      path: "/tools/duplicate-line-remover/",
      description: "Remove duplicate lines from lists while preserving the first occurrence order.",
      inputLabel: "Lines",
      outputLabel: "Unique Lines",
      actionLabel: "Remove Duplicates",
      secondaryActionLabel: "Case-insensitive Unique",
      sample: "json\nJSON\nformatter\njson\nrepair\nformatter",
      run: duplicateLineRemoverTool,
      secondaryRun: duplicateLineRemoverInsensitiveTool,
      faq: [
        ["Does order stay the same?", "Yes. The first occurrence is kept and later duplicates are removed."],
        ["Can matching ignore case?", "Yes. Use Case-insensitive Unique to treat JSON and json as the same value."],
        ["Are blank lines included?", "Blank lines are ignored."]
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
      id: "ai-json-schema-generator",
      title: "AI JSON Schema Generator",
      category: "AI",
      path: "/tools/ai-json-schema-generator/",
      description: "Generate JSON Schema from sample JSON, field notes or plain-English API requirements.",
      inputLabel: "Sample JSON or schema notes",
      outputLabel: "JSON Schema",
      actionLabel: "Generate Schema",
      secondaryActionLabel: "Generate with AI",
      sample: "A user profile object with id, email, display name, plan, signup date and an array of feature flags.",
      run: localJsonSchemaFromTextTool,
      secondaryRun: aiJsonSchemaTool,
      faq: [
        ["What can I paste?", "Paste valid JSON, a field list or a short description of the API object you want to validate."],
        ["Is the schema ready for production?", "It is a strong first draft. Review required fields, formats and enums before production validation."],
        ["Does this use AI?", "Valid JSON can be converted locally. Natural-language requirements use the configured AI API."]
      ]
    },
    {
      id: "ai-json-explainer",
      title: "AI JSON Explainer",
      category: "AI",
      path: "/tools/ai-json-explainer/",
      description: "Explain JSON structure, important fields and likely issues in plain language.",
      inputLabel: "JSON or JSON-like input",
      outputLabel: "Explanation",
      actionLabel: "Explain JSON",
      sample: '{"user":{"id":123,"email":"demo@example.com","roles":["admin"]},"active":true,"lastLogin":"2026-05-06T08:30:00Z"}',
      run: aiJsonExplainerTool,
      faq: [
        ["What does the explainer look for?", "It summarizes the top-level type, important fields, potential issues and practical next steps."],
        ["Can it explain broken JSON?", "It can often explain JSON-like input, but repairing it first gives the best result."],
        ["Is this local?", "This tool uses the configured AI API because it produces a human-readable explanation."]
      ]
    },
    {
      id: "ai-mock-json-generator",
      title: "AI Mock JSON Generator",
      category: "AI",
      path: "/tools/ai-mock-json-generator/",
      description: "Generate realistic mock JSON from a schema, field list or plain-English data description.",
      inputLabel: "Schema, fields or description",
      outputLabel: "Mock JSON",
      actionLabel: "Generate Mock JSON",
      sample: "Create 3 product review objects with id, rating, reviewer, title, body, tags and createdAt.",
      run: aiMockJsonTool,
      faq: [
        ["What is mock JSON useful for?", "Use it for prototypes, API docs, fixtures, demos and frontend states before the backend is ready."],
        ["Can I paste JSON Schema?", "Yes. Pasting a schema usually produces more consistent mock data."],
        ["Should mock data include secrets?", "No. Use fake emails, IDs and values only."]
      ]
    },
    {
      id: "ai-regex-generator",
      title: "AI Regex Generator",
      category: "AI",
      path: "/tools/ai-regex-generator/",
      description: "Generate a regular expression from a plain-English matching requirement.",
      inputLabel: "Regex requirement",
      outputLabel: "Generated Regex",
      actionLabel: "Generate Regex",
      sample: "Match lowercase slugs that can contain letters, numbers and hyphens, but cannot start or end with a hyphen.",
      run: aiRegexGeneratorTool,
      faq: [
        ["What does the tool return?", "It returns a regex pattern, flags, short explanation, examples and notes."],
        ["Should I test the regex?", "Yes. Open Regex Tester and verify the pattern against real examples."],
        ["Does this replace a security review?", "No. Review generated regexes carefully before using them in validation or security-sensitive code."]
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
        ["Is this AI powered?", "The default conversion is local. The AI mode uses the configured site AI API."],
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
        "Paste the raw AI response, including any prose or code fences, into AI JSON Repair.",
        "Let local repair strip code fences, comments, single quotes and trailing commas.",
        "Format the cleaned JSON for review, or send it to JSON Validator before parsing in production code.",
        "Use the AI fallback only when local rules cannot rebuild the broken structure."
      ],
      details: [
        {
          heading: "Why AI JSON output needs its own formatter",
          paragraphs: [
            "Large language models almost never return strict JSON on the first try. ChatGPT, Claude and Doubao routinely wrap output in triple-backtick code fences, add a sentence of explanation before or after the payload, use JavaScript-style single quotes, leave a trailing comma after the last array item, or insert // and /* */ comments for clarity. A traditional JSON formatter assumes valid input and fails on the first quirky character.",
            "An AI JSON formatter is a workflow rather than a single button. It repairs the response first, then prettifies the cleaned data, then validates the result. Skipping the repair step is the most common reason developers get stuck in a loop of SyntaxError messages when integrating model output into a typed system."
          ]
        },
        {
          heading: "What this workflow handles automatically",
          paragraphs: [
            "AI JSON Repair on this site is tuned for the patterns we see most often in production prompts, tool calls and structured-output endpoints."
          ],
          list: [
            "Triple-backtick markdown fences with or without the json language label.",
            "Single quotes around keys and string values from copied JavaScript objects.",
            "Trailing commas after the last item in arrays and objects.",
            "Inline // and /* */ comments left over from sample code.",
            "Smart quotes (curly quotes) pasted from chat UIs and rich text editors.",
            "Leading or trailing prose such as 'Here is the JSON you asked for'."
          ]
        },
        {
          heading: "Difference from a plain JSON formatter",
          paragraphs: [
            "A plain JSON formatter requires a valid JSON value as input. If you feed it raw model output, you usually see Unexpected token at the first non-JSON character. The AI workflow accepts messy text, runs deterministic local repair first, and only falls back to a model when the structure is too broken for rules to recover.",
            "If you already have clean JSON, use the JSON Formatter directly. AI JSON Repair returns the same output for clean input but adds an extra step you do not need."
          ]
        }
      ],
      examples: [
        {
          heading: "Markdown-fenced response with comments and trailing comma",
          input: "Here is the JSON you asked for:\n\n```json\n{\n  \"name\": \"Ada\",\n  // primary contact\n  \"emails\": [\"ada@example.com\",],\n}\n```",
          output: "{\n  \"name\": \"Ada\",\n  \"emails\": [\n    \"ada@example.com\"\n  ]\n}",
          note: "Local repair strips the prose, the code fence and the inline comment, and removes the trailing comma before the closing bracket."
        },
        {
          heading: "Smart quotes from a chat UI",
          input: "{\n  “model”: “doubao”,\n  “temperature”: 0,\n}",
          output: "{\n  \"model\": \"doubao\",\n  \"temperature\": 0\n}",
          note: "Curly quotes are normalized to standard ASCII double quotes so JSON.parse accepts the result on the first try."
        }
      ],
      faq: [
        ["What is an AI JSON formatter?", "It is a formatter designed for JSON-like output from AI tools, where responses often include markdown, prose, or small syntax mistakes that strict JSON parsers reject."],
        ["Is it different from a normal JSON formatter?", "Yes. A normal formatter requires valid JSON first. AI JSON formatting almost always needs a repair pass before the prettify step."],
        ["Can it handle ChatGPT JSON?", "Yes. The repair workflow is built for ChatGPT, Claude, Doubao and other LLM responses, including tool-call payloads and structured outputs."],
        ["Will my data go to a model?", "Local repair runs entirely in your browser. The optional AI fallback only sends data to the configured provider when local rules cannot finish the job."],
        ["Is this safe to use on production payloads?", "Avoid pasting secrets or private user data into any online tool. The repair logic itself does not require uploading anything for the local path."]
      ]
    },
    {
      id: "ai-json-format",
      title: "AI JSON Format",
      category: "AI JSON guide",
      description: "Clean, format and validate JSON for AI workflows, structured prompts and model responses.",
      primaryToolId: "ai-json-repair",
      points: [
        "Repair first: send any AI response into AI JSON Repair to remove fences, prose and JS-style syntax.",
        "Format second: feed the repaired text into JSON Formatter for readable indentation.",
        "Validate third: run JSON Validator before parsing the output in your service.",
        "Type fourth (optional): use JSON to TypeScript or JSON to Schema to lock the contract once the data is clean."
      ],
      details: [
        {
          heading: "Three stages of an AI JSON formatting pipeline",
          paragraphs: [
            "Treat AI JSON formatting as a pipeline, not a one-click action. The repair stage is permissive and tolerates broken input. The format stage assumes valid JSON and enforces consistent indentation. The validate stage rejects anything that would crash JSON.parse in your service. Splitting the work this way gives you clearer error messages when something goes wrong, because each stage only owns one type of failure.",
            "Keeping the stages separate also makes it easy to swap any single piece. If you switch from Doubao to a different model, only the repair stage needs to learn new quirks. The formatter and validator stay the same."
          ]
        },
        {
          heading: "When to use AI fallback vs local repair",
          paragraphs: [
            "Local repair handles the long tail of LLM output mistakes deterministically. It is fast, free and never sends your data anywhere. Reach for the AI fallback when the structure is so broken that no rule-based pass can recover the original intent — for example, when the model returned a paragraph of natural language that needs to be reshaped into a JSON object based on its meaning."
          ],
          list: [
            "Use local repair for: code fences, single quotes, trailing commas, comments, smart quotes, leading prose.",
            "Use AI fallback for: deeply nested broken arrays, model output that mixes prose and JSON, messy text-to-JSON conversions.",
            "Skip the AI fallback entirely if the input is already valid JSON or only needs whitespace cleanup."
          ]
        },
        {
          heading: "Integrating the workflow into a service",
          paragraphs: [
            "If you build on top of structured outputs from Doubao or OpenAI, run repair as a defensive middleware before JSON.parse. Surface the repair logs so you can spot drifting patterns in model output, then feed those patterns back into your prompt or schema. This site mirrors the same pipeline so you can sanity-check responses by hand without writing throwaway code."
          ]
        }
      ],
      examples: [
        {
          heading: "Tool-call payload with prose wrapper",
          input: "Sure! Here is the function call:\n\n{ name: 'create_invoice', arguments: { 'amount': 99.5, 'currency': 'USD' }, }",
          output: "{\n  \"name\": \"create_invoice\",\n  \"arguments\": {\n    \"amount\": 99.5,\n    \"currency\": \"USD\"\n  }\n}",
          note: "Repair removes the prose, quotes the unquoted key, normalizes single quotes and drops the trailing comma."
        }
      ],
      faq: [
        ["Why does AI JSON need formatting?", "AI output may include explanations, markdown fences or JSON-like syntax that strict parsers reject."],
        ["Can I use this for structured outputs?", "Yes. It is useful for verifying and cleaning structured outputs before they hit your downstream code."],
        ["Should I validate after formatting?", "Yes. Validation catches subtle issues like accidentally string-quoted numbers, unmatched brackets or duplicate keys."],
        ["Does this replace prompt engineering?", "No. Strict prompts and JSON Schema constraints are still the cheapest fix. The pipeline is a safety net, not a substitute."],
        ["Is the result safe to send to JSON.parse?", "After validate passes, yes. The pipeline is designed to produce parser-ready output."]
      ]
    },
    {
      id: "json-format-online",
      title: "JSON Format Online",
      category: "JSON guide",
      description: "Format JSON online into readable indentation and copy clean output for APIs, configs and docs.",
      primaryToolId: "json-formatter",
      points: [
        "Open JSON Formatter from any device — no download or install required.",
        "Paste the JSON you got from an API client, log line or config file.",
        "Format with two-space indentation and copy the result for review or sharing."
      ],
      details: [
        {
          heading: "Why format JSON in the browser",
          paragraphs: [
            "Formatting JSON online removes the friction of reaching for a CLI. You do not need jq installed, you do not need to remember Python's json.tool flags, and you do not need to write a temporary file just to look at a payload. A browser-based formatter is the fastest path from 'I have a wall of unreadable JSON' to 'I can see the structure'.",
            "It also works when you cannot install software — locked-down work laptops, freshly provisioned servers accessed through a jump host, or a tablet you happened to grab. The same URL works everywhere your browser does."
          ]
        },
        {
          heading: "Indent options that matter in practice",
          paragraphs: [
            "Most teams pick two-space indentation because it matches what you get from JSON.stringify(value, null, 2) in JavaScript and json.dumps(value, indent=2) in Python. That makes the formatted output easy to drop into a code review or docs without surprises. Tabs are uncommon in JSON but readable in some editors. Four-space indentation is heavier visually and rarely worth it for JSON specifically."
          ],
          list: [
            "Two-space indent: matches JS/Python conventions, the default for code review.",
            "Four-space indent: easier on small fonts, but takes more horizontal space for nested objects.",
            "Tab indent: lets each reader pick their own width, but breaks JSON.stringify defaults."
          ]
        },
        {
          heading: "What 'online' does not mean",
          paragraphs: [
            "Online here does not mean 'uploaded to a server'. The JSON Formatter on this site runs the format step entirely in your browser using JSON.parse plus a stringify pass. Your payload is not transmitted, not logged and not used for training. The only network calls on the page are static asset loads and Google Analytics for anonymous traffic stats."
          ]
        }
      ],
      examples: [
        {
          heading: "Compact API response",
          input: "{\"id\":42,\"customer\":{\"name\":\"Ada\",\"plan\":\"pro\"},\"items\":[{\"sku\":\"A1\",\"qty\":2},{\"sku\":\"B7\",\"qty\":1}]}",
          output: "{\n  \"id\": 42,\n  \"customer\": {\n    \"name\": \"Ada\",\n    \"plan\": \"pro\"\n  },\n  \"items\": [\n    {\n      \"sku\": \"A1\",\n      \"qty\": 2\n    },\n    {\n      \"sku\": \"B7\",\n      \"qty\": 1\n    }\n  ]\n}",
          note: "The structure is identical — only whitespace changes. Keys, values and order are preserved exactly."
        }
      ],
      faq: [
        ["What does JSON format online mean?", "It means prettifying JSON in the browser so nested data is easier to read, with no install, no upload and no signup."],
        ["Does formatting change values?", "No. Formatting only changes whitespace when the input is valid JSON. Numbers, strings and key order are preserved."],
        ["What if my JSON is invalid?", "Run AI JSON Repair first to clean syntax issues, then format the repaired result here."],
        ["Is there a size limit?", "Practically, the limit is your browser memory. Multi-megabyte payloads work but stay responsive only on a desktop browser."],
        ["Can I share the formatted JSON?", "Copy and paste anywhere. There is no upload-based sharing, which keeps the data private to you."]
      ]
    },
    {
      id: "json-formatter-online-free",
      title: "JSON Formatter Online Free",
      category: "JSON guide",
      description: "Use a free online JSON formatter with no signup for quick developer copy-and-paste workflows.",
      primaryToolId: "json-formatter",
      points: [
        "Open the JSON Formatter without creating an account.",
        "Paste JSON from a webhook, response viewer or test fixture.",
        "Format, copy and close the tab — nothing is saved on a server."
      ],
      details: [
        {
          heading: "What 'free' actually means here",
          paragraphs: [
            "Free in this context means three concrete things: no account is required, the format step runs locally in your browser, and there is no paywalled tier with extra features hidden behind a subscription. The site is supported by display advertising rather than subscriptions. You get the same formatter, validator and converter behavior whether you visit once a month or a hundred times a day.",
            "Some online formatters require sign-up to unlock larger payloads, theming or export. None of that is gated here. The trade-off is that there is no cloud history of past payloads — copy what you need before you close the tab."
          ]
        },
        {
          heading: "Privacy expectations for a free tool",
          paragraphs: [
            "When a tool is free, it is reasonable to ask 'so what's the catch?'. The catch on this site is contextual ads and standard analytics. The JSON you paste is not part of either. Format, validate, minify, sort and convert all run on the JavaScript engine in your browser. The only payloads that leave your device are the ones explicitly sent through the AI fallback button, which is clearly labeled and only used when local repair cannot finish the job."
          ],
          list: [
            "No login, no tokens, no quotas.",
            "Formatting and validation happen in your browser, not on a server.",
            "Ads are contextual; the payload itself is never used to target ads.",
            "AI fallback is opt-in, with a different button and a clear status indicator."
          ]
        },
        {
          heading: "Comparison with desktop tools",
          paragraphs: [
            "Desktop apps like Visual Studio Code's JSON formatter are excellent when you already have the editor open. A web tool wins for quick one-off formatting, for sharing a URL with a colleague who does not have the editor configured, and for environments where installing software is restricted. Use the right tool for the moment — there is no need to pick one."
          ]
        }
      ],
      examples: [
        {
          heading: "Webhook payload",
          input: "{\"event\":\"user.signup\",\"timestamp\":1714857600,\"data\":{\"id\":\"u_42\",\"plan\":\"trial\"}}",
          output: "{\n  \"event\": \"user.signup\",\n  \"timestamp\": 1714857600,\n  \"data\": {\n    \"id\": \"u_42\",\n    \"plan\": \"trial\"\n  }\n}",
          note: "Typical inbound webhook shape. Format, eyeball the keys, then drop into your handler test."
        }
      ],
      faq: [
        ["Is the JSON formatter free?", "Yes. The formatter is free and does not require an account, login or trial."],
        ["Will I see ads?", "The site shows contextual display ads to fund hosting. The JSON you paste is never used for ad targeting."],
        ["Does it run locally?", "Yes. The format, validate, minify and convert steps all run in your browser using the standard JSON parser."],
        ["Is there a paid version?", "There is no paid tier today. If specific features get added later that need infrastructure, the free formatter stays free."],
        ["Can I use it at work?", "Most teams allow it because nothing is uploaded for the local workflow. Check your own policy if you handle regulated data."]
      ]
    },
    {
      id: "json-beautifier",
      title: "JSON Beautifier",
      category: "JSON guide",
      description: "Beautify minified JSON into readable, indented output for debugging and documentation.",
      primaryToolId: "json-formatter",
      points: [
        "Paste minified JSON copied from a network tab, a log line or an API response.",
        "Run JSON Formatter to add line breaks and consistent indentation.",
        "Use the beautified output in code review, bug reports or runbook documentation."
      ],
      details: [
        {
          heading: "Beautify, format, prettify — same thing for JSON",
          paragraphs: [
            "In the JSON ecosystem, 'beautify', 'format' and 'prettify' all describe the same operation: parse the input, then re-emit it with line breaks and indentation so the structure becomes visible to a human. The terms come from different tooling traditions — beautifiers came from minified JavaScript culture, formatters from IDE conventions, prettifiers from code-formatting libraries — but for JSON they collapse to one behavior.",
            "The beautify framing is most natural when the starting point is heavily minified. If you opened a network response and saw one giant line of nested braces, beautify is what makes the response legible."
          ]
        },
        {
          heading: "When beautify earns its keep",
          paragraphs: [
            "Beautifying matters most for the moments when you need to read JSON, not when you need to send it. A few common scenarios:"
          ],
          list: [
            "Reviewing an API response that returned compact JSON to save bytes.",
            "Pasting JSON evidence into a bug report or pull request.",
            "Sharing a config snippet in documentation where readability beats payload size.",
            "Comparing two API responses by eye before reaching for a diff tool."
          ]
        },
        {
          heading: "Beautify and minify are reversible",
          paragraphs: [
            "Beautifying does not destroy any data. The structure stays intact and you can re-minify the output at any time using JSON Minifier. Treat beautify and minify as opposite ends of a slider — beautify when you need to think, minify when you need to ship.",
            "If the input is invalid JSON to start with, the parser will throw before beautifying. That is correct behavior: a beautifier should refuse to invent meaning. Use AI JSON Repair first to clean up the syntax, then beautify the repaired output."
          ]
        }
      ],
      examples: [
        {
          heading: "From minified to beautified",
          input: "{\"order\":{\"id\":1001,\"items\":[{\"sku\":\"A\",\"qty\":3},{\"sku\":\"B\",\"qty\":1}],\"total\":42.5}}",
          output: "{\n  \"order\": {\n    \"id\": 1001,\n    \"items\": [\n      {\n        \"sku\": \"A\",\n        \"qty\": 3\n      },\n      {\n        \"sku\": \"B\",\n        \"qty\": 1\n      }\n    ],\n    \"total\": 42.5\n  }\n}",
          note: "The beautified version makes the order/items relationship visible at a glance and is much easier to scan during a review."
        }
      ],
      faq: [
        ["Is beautify the same as format?", "Yes. For JSON tools, beautify, format and prettify all mean producing the same readable, indented output."],
        ["Can it beautify invalid JSON?", "No, the beautifier will not guess. Use AI JSON Repair first to fix syntax, then beautify the repaired output."],
        ["Can I minify it again?", "Yes. JSON Minifier reverses the beautify step and produces the original compact form."],
        ["Does beautifying change the data?", "No. The keys, values and order are preserved exactly. Only whitespace changes."],
        ["Why is my JSON minified by default?", "APIs minify responses to save bandwidth. Beautifying is a viewing-time concern, not a transport concern."]
      ]
    },
    {
      id: "json-prettify",
      title: "Prettify JSON Online",
      category: "JSON guide",
      description: "Prettify JSON online with clean indentation, validation feedback and one-click copy.",
      primaryToolId: "json-formatter",
      points: [
        "Paste a single JSON value (object, array, string, number, boolean or null).",
        "Click Format JSON to prettify with two-space indentation.",
        "Copy the result, or pipe it into JSON Validator and JSON Sorter for further cleanup."
      ],
      details: [
        {
          heading: "Prettify in JavaScript and Python terms",
          paragraphs: [
            "If you have ever written JSON.stringify(value, null, 2) in JavaScript or json.dumps(data, indent=2) in Python, you have used the prettify operation in code. This online tool is the same idea moved into the browser so you can prettify ad-hoc JSON without writing a script. Internally it parses with the standard JSON parser and re-serializes with a fixed indent, exactly how the language built-ins behave."
          ]
        },
        {
          heading: "Prettify, then sort, then diff",
          paragraphs: [
            "Prettifying is usually the first step in a longer cleanup. After prettifying, sorting object keys with JSON Sorter makes diffs deterministic — two responses with the same content but different key order will look identical, which is the behavior you want when a flaky API shuffles keys between requests.",
            "If you are comparing two responses, prettify both, sort both, then paste them into JSON Compare to see only the structural differences."
          ],
          list: [
            "Prettify: produce readable output.",
            "Sort: stabilize key order so diffs are signal-only.",
            "Compare: show added, removed and changed fields between two payloads."
          ]
        },
        {
          heading: "Prettify vs jq",
          paragraphs: [
            "If jq is already in your terminal, jq '.' is a great prettifier. The browser tool wins when you want to share a URL with someone, when you need to prettify a single payload without leaving your browser, or when the input is broken JSON that would make jq fail. AI JSON Repair plus the prettifier on this site handle messy input that jq refuses to parse."
          ]
        }
      ],
      examples: [
        {
          heading: "Prettify a log-line JSON entry",
          input: "{\"level\":\"info\",\"msg\":\"request handled\",\"ctx\":{\"path\":\"/users\",\"status\":200,\"ms\":42}}",
          output: "{\n  \"level\": \"info\",\n  \"msg\": \"request handled\",\n  \"ctx\": {\n    \"path\": \"/users\",\n    \"status\": 200,\n    \"ms\": 42\n  }\n}",
          note: "Logs typically print JSON on one line. Prettifying turns each request into something you can scan in a review."
        }
      ],
      faq: [
        ["What is prettified JSON?", "Prettified JSON is JSON printed with line breaks and indentation so nested structure is visible to a human."],
        ["Why prettify JSON?", "It makes nested data easier to inspect, easier to share in a code review, and easier to compare against another response."],
        ["Can I prettify JSON from logs?", "Yes, as long as the JSON portion is extracted and is valid (or repaired first with AI JSON Repair)."],
        ["Is prettify the same as JSON.stringify(value, null, 2)?", "Yes. The output matches the standard library behavior for two-space indentation."],
        ["Can I pick the indent width?", "The default is two spaces, which matches JS and Python convention. Different indent widths can be added later."]
      ]
    },
    {
      id: "json-lint-online",
      title: "JSON Lint Online",
      category: "JSON guide",
      description: "Lint JSON online by validating syntax and identifying parse errors before using data in code.",
      primaryToolId: "json-validator",
      points: [
        "Paste JSON suspected of having a parser error into JSON Validator.",
        "Read the error message and the position it points to.",
        "Fix the issue manually, or send the input through AI JSON Repair to handle the long tail of common mistakes."
      ],
      details: [
        {
          heading: "What linting catches and what it doesn't",
          paragraphs: [
            "JSON linting checks one thing: does the input parse as valid JSON under the strict spec. It does not check business rules, field meaning, expected types, or whether your numbers are within an allowed range. Those are schema checks, handled by JSON Schema or JSON to Schema. Treat linting as the syntax pass — if it fails, no other check will run reliably."
          ],
          list: [
            "Lint = syntax: would JSON.parse accept this string?",
            "Validate against schema = semantics: do the fields and types match what the API expects?",
            "Format = readability: does the indentation make the structure visible?"
          ]
        },
        {
          heading: "The most common JSON lint errors",
          paragraphs: [
            "Roughly 90% of lint failures we see fall into a handful of patterns. Knowing them by sight saves you a trip back to the documentation."
          ],
          list: [
            "Trailing comma — a comma after the last item in [] or {}.",
            "Single quotes — JSON strings must use double quotes only.",
            "Unquoted keys — every object key needs to be a quoted string.",
            "Comments — // and /* */ are JavaScript syntax, not JSON.",
            "Mismatched brackets — extra or missing { } or [ ].",
            "Bad escapes — backslashes inside strings need to be paired with a valid escape character."
          ]
        },
        {
          heading: "From lint failure to working JSON",
          paragraphs: [
            "If the validator reports a position, jump there in your editor and look at the character before it — the parser usually flags the next character after the actual mistake. If you cannot spot it, paste into AI JSON Repair, run repair, then run lint again on the cleaned output. Once the validator returns OK, the JSON is safe to feed into a typed parser, JSON.parse or your service's JSON middleware."
          ]
        }
      ],
      examples: [
        {
          heading: "Trailing comma",
          input: "{\n  \"name\": \"Ada\",\n  \"role\": \"admin\",\n}",
          output: "Error: Unexpected token } at line 4 column 1.",
          note: "The trailing comma after \"admin\" is the actual culprit, but most parsers report the next character."
        },
        {
          heading: "Single quotes",
          input: "{ 'host': 'localhost', 'port': 3000 }",
          output: "Error: Unexpected token ' at line 1 column 3.",
          note: "JSON strings must use double quotes. Single quotes are valid JavaScript but invalid JSON."
        }
      ],
      faq: [
        ["What is JSON linting?", "JSON linting is a syntax check that confirms whether the input is valid under the strict JSON spec."],
        ["Does linting format JSON?", "No. Linting only validates. Use JSON Formatter when you also want readable output."],
        ["What should I do with an error?", "Read the line and column, fix the character at that position, and re-run. If you cannot spot the issue, run AI JSON Repair."],
        ["Is JSON Lint the same as ajv?", "ajv validates against a JSON Schema, which is a stricter check on top of the syntax pass. Linting here means just the syntax pass."],
        ["Can I lint JSONL?", "Lint each line individually, or use JSON Lines to JSON to convert it into an array first."]
      ]
    },
    {
      id: "json-parser-online",
      title: "JSON Parser Online",
      category: "JSON guide",
      description: "Parse JSON online to confirm whether a value is a valid object, array, string, number, boolean or null.",
      primaryToolId: "json-validator",
      points: [
        "Paste any JSON value (object, array, scalar) into JSON Validator.",
        "Run validation — the validator parses your input behind the scenes.",
        "Read the result summary to confirm the top-level type and whether parsing succeeded."
      ],
      details: [
        {
          heading: "What a JSON parser actually does",
          paragraphs: [
            "A JSON parser reads a string of characters and produces structured data — an object tree your code can index into. The parser walks token by token, validating each one against the JSON grammar. If anything is out of place, parsing stops and the parser reports an error pointing to the offending token. JSON Validator on this site uses the browser's built-in JSON.parse, which is the same parser used by every JavaScript runtime."
          ]
        },
        {
          heading: "Top-level JSON values you can paste",
          paragraphs: [
            "JSON is more permissive than people remember. The top-level value does not have to be an object. Any of these are valid JSON documents:"
          ],
          list: [
            "Object: {\"key\": \"value\"}",
            "Array: [1, 2, 3]",
            "String: \"hello\"",
            "Number: 42",
            "Boolean: true or false",
            "Null: null"
          ]
        },
        {
          heading: "Why parsing fails",
          paragraphs: [
            "Parser failures fall into three buckets: syntax mistakes (trailing commas, single quotes, unquoted keys), encoding issues (smart quotes copied from a chat app, mismatched escape sequences) and structural mistakes (mismatched brackets, missing closing quote on a string). The parser reports the position of the unexpected token, which is usually one character past the actual mistake. If the input came from an LLM, run AI JSON Repair before parsing — it handles the long tail of LLM-specific issues automatically."
          ]
        }
      ],
      examples: [
        {
          heading: "Top-level array parses fine",
          input: "[\"alpha\", \"beta\", \"gamma\"]",
          output: "Valid JSON. Top-level type: array (3 items).",
          note: "A standalone array is a valid JSON document — you do not need to wrap it in an object."
        },
        {
          heading: "Top-level scalar also parses",
          input: "true",
          output: "Valid JSON. Top-level type: boolean.",
          note: "Booleans, numbers, strings and null are all valid top-level JSON values."
        }
      ],
      faq: [
        ["Can JSON be an array?", "Yes. A valid JSON document can be an object, array, string, number, boolean or null at the top level."],
        ["What does a JSON parser do?", "It reads JSON text and converts it into structured data your code can navigate."],
        ["Why does parsing fail?", "Parsing fails when syntax does not match the strict JSON grammar — usually trailing commas, comments, single quotes or mismatched brackets."],
        ["Is the parser online or local?", "The parser runs in your browser. Nothing is sent to a server when you click validate."],
        ["Can I parse very large payloads?", "Browser parsers handle multi-megabyte inputs but slow down on very large files. For huge payloads, parse in a Node script or use streaming JSON."]
      ]
    },
    {
      id: "json-cleaner",
      title: "JSON Cleaner",
      category: "JSON guide",
      description: "Clean JSON-like text by removing comments, trailing commas, code fences and other parser-breaking syntax.",
      primaryToolId: "ai-json-repair",
      points: [
        "Paste JSON-like text — copied from a JS file, an AI response, a config or a log.",
        "Run AI JSON Repair to remove comments, fences, trailing commas and similar noise.",
        "Validate the cleaned output, then format it with JSON Formatter."
      ],
      details: [
        {
          heading: "What JSON cleaning means in practice",
          paragraphs: [
            "Cleaning JSON is a wider operation than formatting. A formatter assumes the input already parses; a cleaner accepts JSON-flavoured text and tries to make it parseable. The two are complements — clean first, format second.",
            "Common sources of dirty JSON are JavaScript files where someone copied an object literal, configuration files written by hand, model output with markdown fences and prose, and log lines where multiple JSON fragments got concatenated."
          ]
        },
        {
          heading: "Things the cleaner removes or rewrites",
          paragraphs: [
            "AI JSON Repair handles the patterns that make JSON.parse throw."
          ],
          list: [
            "// line comments and /* block comments */ left over from JS sources.",
            "Trailing commas after the last item in arrays and objects.",
            "Single-quoted keys and string values from JS object literals.",
            "Unquoted keys (still valid in JS, never valid in JSON).",
            "Markdown code fences such as ```json and the closing ```.",
            "Surrounding prose like 'Here is the JSON:' or 'Result:'."
          ]
        },
        {
          heading: "What cleaning will not do",
          paragraphs: [
            "Cleaning is a syntactic pass, not a semantic one. It will not invent missing fields, fix a wrong type, or guess what a field should be when the value is corrupted beyond recognition. If the original input is so broken that there is no clear original intent, the cleaner returns the best parseable version it can and you should review the result before trusting it.",
            "For data with semantic constraints (required fields, enum values, value ranges), pair cleaning with JSON Schema validation. Run cleaner first to make the input parseable, then validate against your schema to confirm it is also correct."
          ]
        }
      ],
      examples: [
        {
          heading: "JavaScript object literal",
          input: "// from src/config.js\nconst config = {\n  host: 'localhost',\n  port: 3000,\n  features: ['ssr', 'edge',],\n}",
          output: "{\n  \"host\": \"localhost\",\n  \"port\": 3000,\n  \"features\": [\n    \"ssr\",\n    \"edge\"\n  ]\n}",
          note: "The cleaner strips the comment, the variable declaration, removes the trailing commas and quotes the keys."
        }
      ],
      faq: [
        ["What can a JSON cleaner fix?", "Comments, single quotes, trailing commas, unquoted keys, markdown fences and surrounding prose."],
        ["Is cleaned JSON always correct?", "Cleaning fixes syntax, not meaning. Review business-critical data after cleaning, especially when the original text is badly broken."],
        ["Can it clean API examples?", "Yes. It is useful for copied examples that look like JavaScript objects instead of strict JSON."],
        ["What if the cleaner cannot recover the input?", "Use the AI fallback for badly broken structures, then verify the result against your schema."],
        ["Can I run cleaning on JSONL?", "Clean each line individually, or use JSON Lines to JSON to combine them into an array first."]
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
      id: "ai-json-schema-generator",
      title: "AI JSON Schema Generator",
      category: "AI JSON guide",
      description: "Create JSON Schema from sample JSON, API notes or plain-English requirements for validation and documentation.",
      primaryToolId: "ai-json-schema-generator",
      points: [
        "Paste sample JSON when you have a real payload.",
        "Use natural-language field notes when the API shape is still being planned.",
        "Review required fields, formats and enums before using the schema in production."
      ],
      faq: [
        ["What is an AI JSON Schema generator?", "It uses sample data or requirements to draft a JSON Schema document faster."],
        ["Can this infer schema from JSON?", "Yes. Valid JSON can be converted locally, and AI mode can handle rough descriptions."],
        ["Should I edit the generated schema?", "Yes. Generated schemas are a starting point and should be reviewed for business rules."]
      ]
    },
    {
      id: "ai-json-explainer",
      title: "AI JSON Explainer",
      category: "AI JSON guide",
      description: "Explain JSON structure, important fields and likely cleanup steps for unfamiliar API responses or AI output.",
      primaryToolId: "ai-json-explainer",
      points: [
        "Paste the JSON payload or model output you want to understand.",
        "Run the explainer to get a concise structure summary and important fields.",
        "Use the suggested next steps to validate, format or convert the data."
      ],
      faq: [
        ["Why explain JSON with AI?", "AI can summarize field meaning and likely issues faster than manually scanning a large payload."],
        ["Can it explain nested JSON?", "Yes. It can highlight nested fields and top-level structure."],
        ["Should I paste private data?", "Avoid secrets and sensitive production data in any AI-powered online tool."]
      ]
    },
    {
      id: "ai-mock-json-generator",
      title: "AI Mock JSON Generator",
      category: "AI JSON guide",
      description: "Generate mock JSON examples for API docs, prototypes, frontend states and test fixtures.",
      primaryToolId: "ai-mock-json-generator",
      points: [
        "Describe the data shape, count and important fields.",
        "Paste JSON Schema when you want more consistent mock output.",
        "Validate and format the generated JSON before adding it to docs or fixtures."
      ],
      faq: [
        ["What is mock JSON?", "Mock JSON is fake but realistic structured data used for demos, testing and documentation."],
        ["Can AI generate arrays of objects?", "Yes. Ask for a count and describe the object fields."],
        ["Can I use this for frontend development?", "Yes. It is useful before the backend endpoint is ready."]
      ]
    },
    {
      id: "ai-regex-generator",
      title: "AI Regex Generator",
      category: "AI guide",
      description: "Generate a regular expression from plain English, then test it with real examples.",
      primaryToolId: "ai-regex-generator",
      points: [
        "Describe what should match and what should not match.",
        "Generate the regex pattern, flags and examples.",
        "Open Regex Tester to verify the pattern against realistic input."
      ],
      faq: [
        ["Can AI write regex?", "It can produce a useful first draft, but you should always test edge cases."],
        ["What should my prompt include?", "Mention allowed characters, length limits, anchors and negative examples when possible."],
        ["Can this help with validation?", "Yes, but generated regex validation should be reviewed before production use."]
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
    "ai-json-schema-generator",
    "ai-json-explainer",
    "ai-mock-json-generator",
    "json-format-for-ai",
    "format-api-response-json"
  ];
  const growthGuides = growthGuideIds.map((id) => guidesById[id]).filter(Boolean);
  const directoryPages = [
    {
      id: "directories",
      title: "Tool Directories",
      category: "Directory",
      description: "Browse AI JSON Format by tool category, search intent and everyday developer workflow.",
      path: "/directories/",
      intro: "Start from a focused directory when you know the type of task you need: JSON formatting, AI JSON cleanup, conversion, timestamps, hashes or encoding.",
      directoryIds: ["json-tools", "ai-json-tools", "json-format-tools", "json-converter-tools", "text-tools", "developer-tools"]
    },
    {
      id: "json-tools",
      title: "JSON Tools Online",
      category: "JSON directory",
      description: "A focused directory of free JSON tools for formatting, validating, repairing, sorting, extracting and converting JSON.",
      path: "/json-tools/",
      intro: "Use these JSON tools for API responses, config files, logs, AI model output and quick debugging sessions.",
      toolIds: ["json-formatter", "ai-json-repair", "json-validator", "json-minifier", "json-sorter", "json-compare", "json-path", "json-lines", "json-to-markdown", "json-escape-unescape"],
      guideIds: ["json-format-online", "json-formatter-online-free", "json-beautifier", "json-prettify", "json-lint-online", "json-parser-online", "json-cleaner", "format-api-response-json"]
    },
    {
      id: "ai-json-tools",
      title: "AI JSON Tools",
      category: "AI JSON directory",
      description: "Tools and guides for repairing, formatting and generating JSON for AI prompts, agents and model responses.",
      path: "/ai-json-tools/",
      intro: "AI JSON output often needs repair before a strict parser can read it. This directory collects the pages that handle that workflow.",
      toolIds: ["ai-json-repair", "text-to-json", "ai-json-schema-generator", "ai-json-explainer", "ai-mock-json-generator", "ai-regex-generator", "json-formatter", "json-validator", "json-to-typescript", "json-to-schema"],
      guideIds: ["ai-json-formatter", "ai-json-format", "ai-json-generator", "ai-json-schema-generator", "ai-json-explainer", "ai-mock-json-generator", "ai-regex-generator", "ai-json-to-typescript", "json-format-for-ai", "json-format-for-openai-response", "fix-json-from-chatgpt"]
    },
    {
      id: "json-format-tools",
      title: "JSON Format Tools",
      category: "JSON format directory",
      description: "Format, beautify, prettify, minify and sort JSON with free browser-based tools.",
      path: "/json-format-tools/",
      intro: "This directory targets the common JSON formatting jobs people search for when they need readable or compact JSON fast.",
      toolIds: ["json-formatter", "json-minifier", "json-sorter", "json-validator", "ai-json-repair"],
      guideIds: ["json-format-online", "json-formatter-online-free", "json-beautifier", "json-prettify", "json-format-for-ai", "format-api-response-json"]
    },
    {
      id: "json-converter-tools",
      title: "JSON Converter Tools",
      category: "JSON converter directory",
      description: "Convert JSON to CSV, YAML, TypeScript, JSON Schema, Markdown tables and JSON Lines.",
      path: "/json-converter-tools/",
      intro: "Use these converters when JSON needs to move into docs, spreadsheets, typed code, schemas, logs or configuration files.",
      toolIds: ["json-to-csv", "csv-to-json", "json-to-yaml", "json-to-typescript", "json-to-schema", "ai-json-schema-generator", "json-to-markdown", "json-lines", "query-string-to-json", "text-to-json"],
      guideIds: ["ai-json-to-typescript", "ai-json-schema-generator", "format-api-response-json", "json-format-for-ai"]
    },
    {
      id: "developer-tools",
      title: "Free Developer Tools",
      category: "Developer tools directory",
      description: "A directory of free browser-based tools for JSON, Base64, hashes, timestamps, UUIDs, JWTs, text and encoding.",
      path: "/developer-tools/",
      intro: "Beyond JSON, this directory groups the everyday utilities developers often need while debugging APIs and writing docs.",
      toolIds: ["base64", "md5", "sha256", "timestamp", "current-timestamp", "url-encode", "url-parser", "query-string-to-json", "html-entity", "uuid", "jwt-decoder", "regex-tester", "ai-regex-generator", "case-converter", "slug-generator", "word-counter", "cron-parser", "password-generator"],
      guideIds: ["base64-decode-online", "md5-hash-generator", "sha256-checksum", "unix-timestamp-to-date", "date-to-unix-timestamp", "current-unix-timestamp", "jwt-payload-decoder", "ai-regex-generator"]
    },
    {
      id: "text-tools",
      title: "Text Tools Online",
      category: "Text tools directory",
      description: "Free text tools for removing whitespace, formatting text, find and replace, sorting lines, removing duplicates and counting words.",
      path: "/text-tools/",
      intro: "Use these text utilities when copied notes, prompts, lists or documentation snippets need quick cleanup before being pasted into another tool.",
      toolIds: ["remove-whitespace", "text-formatter", "text-replace", "regex-tester", "line-sorter", "duplicate-line-remover", "word-counter", "case-converter", "slug-generator"],
      guideIds: []
    }
  ];
  const directoriesById = Object.fromEntries(directoryPages.map((directory) => [directory.id, directory]));
  const languagePages = [
    {
      code: "ja",
      title: "日本語",
      localTitle: "AI JSON フォーマッター",
      path: "/ja/",
      description: "日本語ユーザー向けの JSON 整形、AI JSON 修復、JSON 検証ツール入口です。"
    },
    {
      code: "de",
      title: "Deutsch",
      localTitle: "AI JSON Formatter",
      path: "/de/",
      description: "Deutschsprachiger Einstieg fuer JSON formatieren, AI JSON reparieren und Entwickler-Tools."
    },
    {
      code: "es",
      title: "Español",
      localTitle: "Formateador AI JSON",
      path: "/es/",
      description: "Entrada en espanol para formatear JSON, reparar AI JSON y usar herramientas de desarrollo."
    }
  ];

  if (typeof window !== "undefined") {
    window.__AI_JSON_FORMAT_DATA__ = {
      tools,
      guidePages,
      growthGuideIds,
      directoryPages,
      languagePages
    };
  }

  const app = document.getElementById("app");
  const pageId = app.dataset.page || pageFromPath();
  const toolMount = document.getElementById("tool-mount");
  const isRealMount = toolMount && typeof toolMount.outerHTML === "string";

  if (isRealMount) {
    const toolId = toolMount.dataset.toolId || pageId;
    const tool = byId[toolId];
    if (tool) {
      toolMount.outerHTML = renderToolPanel(tool);
      bindTool(tool);
    }
  } else {
    renderShell(pageId);
  }

  function renderShell(id) {
    const isHome = id === "home";
    const isGuides = id === "guides";
    const isTools = id === "tools";
    const isToolPath = window.location.pathname.split("/").filter(Boolean)[0] === "tools";
    const guide = isToolPath ? null : guidesById[id] || guidesById[pageFromPath()];
    const directory = directoriesById[id] || directoriesById[pageFromPath()];
    const tool = byId[id] || byId[pageFromPath()] || (isTools ? null : byId["json-formatter"]);

    app.innerHTML = `
      <div class="site-shell">
        <header class="topbar">
          <nav class="nav" aria-label="Primary">
            <a class="brand" href="/">
              <span class="brand-mark">{ }</span>
              <span>AI JSON Format</span>
            </a>
            <div class="nav-links">
              <a class="nav-primary" href="/tools/json-formatter/">Format JSON</a>
              <a class="nav-primary" href="/tools/ai-json-repair/">AI Repair</a>
              <details class="nav-menu">
                <summary>Tools</summary>
                <div class="nav-menu-panel">
                  <a href="/tools/">All Tools</a>
                  <a href="/ai-json-tools/">AI JSON Tools</a>
                  <a href="/json-tools/">JSON Tools</a>
                  <a href="/json-converter-tools/">Converters</a>
                  <a href="/text-tools/">Text Tools</a>
                  <a href="/developer-tools/">Developer Tools</a>
                </div>
              </details>
              <details class="nav-menu">
                <summary>Resources</summary>
                <div class="nav-menu-panel">
                  <a href="/directories/">Directories</a>
                  <a href="/guides/">Guides</a>
                  <a href="/languages/">Languages</a>
                  <a href="/tools/ai-json-schema-generator/">AI Schema</a>
                  <a href="/tools/ai-mock-json-generator/">Mock JSON</a>
                  <a href="/tools/ai-regex-generator/">AI Regex</a>
                </div>
              </details>
            </div>
          </nav>
        </header>
        ${isHome ? renderHome() : isGuides ? renderGuideIndex() : isTools ? renderToolIndex() : directory ? renderDirectoryPage(directory) : guide ? renderGuidePage(guide) : renderToolPage(tool)}
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
    } else if (isTools) {
      bindToolIndex();
    } else if (!guide && !isGuides && !directory) {
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
        ${renderInternalLinkBand(
          "Popular workflows",
          "Start from the task people search for most, then move into the exact tool or guide.",
          homeWorkflowLinks()
        )}
        <section class="content-band">
          <div class="section-head">
            <div>
              <h2>Browse by Directory</h2>
              <p>Focused hubs help you find the right tool path and give search engines a clearer site structure.</p>
            </div>
          </div>
          <div class="tool-grid">
            ${directoryPages.filter((directory) => directory.id !== "directories").map(renderDirectoryCard).join("")}
          </div>
        </section>
        <section class="content-band">
          <div class="section-head">
            <div>
              <h2>Language Entrances</h2>
              <p>Lightweight regional landing pages for users who search for JSON tools in their own language.</p>
            </div>
          </div>
          <div class="tool-grid">
            ${languagePages.map(renderLanguageCard).join("")}
          </div>
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

  function renderToolPanel(tool) {
    return `<section class="tool-panel" aria-label="${escapeHtml(tool.title)}">
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
    </section>`;
  }

  function renderToolPage(tool) {
    return `
      <main class="main">
        ${renderBreadcrumb([{ label: "Tools", href: "/tools/" }, { label: tool.title }])}
        <div class="tool-page">
          <div>
            <section class="tool-intro">
              <div class="eyebrow">${escapeHtml(tool.category)} tool</div>
              <h1>${escapeHtml(tool.title)}</h1>
              <p>${escapeHtml(tool.description)}</p>
            </section>
            ${renderToolPanel(tool)}
            <section class="content-band">
              <h2>About this tool</h2>
              <p>${escapeHtml(tool.description)} It is designed for fast copy-and-paste workflows and does not require a login.</p>
              <h3>Common use cases</h3>
              <ul class="plain-list">
                ${toolUseCases(tool).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
              </ul>
              <div class="faq">
                ${tool.faq.map(([question, answer]) => `
                  <article class="faq-item">
                    <h3>${escapeHtml(question)}</h3>
                    <p>${escapeHtml(answer)}</p>
                  </article>
                `).join("")}
              </div>
            </section>
            ${renderInternalLinkBand(
              "Next useful workflows",
              "Move from this tool into adjacent JSON, AI and developer workflows.",
              internalLinksForTool(tool)
            )}
          </div>
          <aside class="side-rail" aria-label="Related tools">
            <div class="side-box">
              <h3>Related tools</h3>
              <div class="side-links">
                ${relatedTools(tool).map((item) => `<a href="${item.path}">${escapeHtml(item.title)}</a>`).join("")}
              </div>
            </div>
            <div class="side-box">
              <h3>Directories</h3>
              <div class="side-links">
                ${directoriesForTool(tool).map((item) => `<a href="${item.path}">${escapeHtml(item.title)}</a>`).join("")}
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
        ${renderBreadcrumb([{ label: "Guides", href: "/guides/" }, { label: guide.title }])}
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
            ${renderInternalLinkBand(
              "Related workflows",
              "Continue with the most relevant tools, directories and follow-up guides.",
              internalLinksForGuide(guide)
            )}
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
            <div class="side-box">
              <h3>Related directories</h3>
              <div class="side-links">
                ${directoriesForGuide(guide).map((item) => `<a href="${item.path}">${escapeHtml(item.title)}</a>`).join("")}
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

  function renderToolIndex() {
    return `
      <main class="main">
        ${renderBreadcrumb([{ label: "Tools" }])}
        <section class="tool-intro">
          <div class="eyebrow">Tools</div>
          <h1>Free Online Developer Tools</h1>
          <p>Browse every AI JSON Format utility for JSON formatting, AI cleanup, conversion, hashing, timestamps, encoding, JWTs and text work.</p>
        </section>
        <section aria-labelledby="tools-index-heading">
          <div class="section-head">
            <div>
              <h2 id="tools-index-heading">All Tools</h2>
              <p>Each tool is free, browser-friendly and built for quick copy-and-paste workflows.</p>
            </div>
            <input class="tool-filter" id="tool-filter" type="search" placeholder="Search tools" />
          </div>
          <div class="tool-grid">
            ${tools.map(renderToolCard).join("")}
          </div>
        </section>
      </main>
    `;
  }

  function renderDirectoryPage(directory) {
    const isIndex = directory.id === "directories";
    const toolsForDirectory = (directory.toolIds || []).map((id) => byId[id]).filter(Boolean);
    const guidesForDirectory = (directory.guideIds || []).map((id) => guidesById[id]).filter(Boolean);
    const childDirectories = (directory.directoryIds || []).map((id) => directoriesById[id]).filter(Boolean);
    return `
      <main class="main">
        ${renderBreadcrumb([{ label: "Directories", href: "/directories/" }, { label: directory.title }])}
        <section class="tool-intro">
          <div class="eyebrow">${escapeHtml(directory.category)}</div>
          <h1>${escapeHtml(directory.title)}</h1>
          <p>${escapeHtml(directory.description)}</p>
        </section>
        <section class="content-band">
          <h2>${isIndex ? "Choose a directory" : "What this directory covers"}</h2>
          <p>${escapeHtml(directory.intro)}</p>
        </section>
        ${renderInternalLinkBand(
          isIndex ? "High-intent hubs" : "Related hubs",
          "These internal links keep common JSON, AI and developer workflows close together.",
          internalLinksForDirectory(directory)
        )}
        ${childDirectories.length ? `
          <section aria-labelledby="directory-list-heading">
            <div class="section-head">
              <div>
                <h2 id="directory-list-heading">Directories</h2>
                <p>Start with the hub that matches your task.</p>
              </div>
            </div>
            <div class="tool-grid">
              ${childDirectories.map(renderDirectoryCard).join("")}
            </div>
          </section>
        ` : ""}
        ${toolsForDirectory.length ? `
          <section aria-labelledby="directory-tools-heading">
            <div class="section-head">
              <div>
                <h2 id="directory-tools-heading">Tools in this directory</h2>
                <p>Open the tool that matches the action you need right now.</p>
              </div>
            </div>
            <div class="tool-grid">
              ${toolsForDirectory.map(renderToolCard).join("")}
            </div>
          </section>
        ` : ""}
        ${guidesForDirectory.length ? `
          <section class="content-band" aria-labelledby="directory-guides-heading">
            <div class="section-head">
              <div>
                <h2 id="directory-guides-heading">Related SEO guides</h2>
                <p>These pages cover the common search questions around ${escapeHtml(directory.title.toLowerCase())}.</p>
              </div>
            </div>
            <div class="tool-grid">
              ${guidesForDirectory.map(renderGuideCard).join("")}
            </div>
          </section>
        ` : ""}
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

  function renderDirectoryCard(directory) {
    return `
      <a class="tool-card" href="${directory.path}">
        <span>
          <h3>${escapeHtml(directory.title)}</h3>
          <p>${escapeHtml(directory.description)}</p>
        </span>
        <span class="tag-row">
          <span class="tag">${escapeHtml(directory.category)}</span>
          <span class="tag">Directory</span>
        </span>
      </a>
    `;
  }

  function renderLanguageCard(language) {
    return `
      <a class="tool-card" href="${language.path}" hreflang="${language.code}">
        <span>
          <h3>${escapeHtml(language.localTitle)}</h3>
          <p>${escapeHtml(language.description)}</p>
        </span>
        <span class="tag-row">
          <span class="tag">${escapeHtml(language.title)}</span>
          <span class="tag">Language</span>
        </span>
      </a>
    `;
  }

  function renderInternalLinkBand(title, intro, links) {
    const visibleLinks = links.filter(Boolean).slice(0, 8);
    if (!visibleLinks.length) return "";
    return `
      <section class="content-band">
        <div class="section-head">
          <div>
            <h2>${escapeHtml(title)}</h2>
            <p>${escapeHtml(intro)}</p>
          </div>
        </div>
        <div class="link-cluster">
          ${visibleLinks.map((link) => `
            <a class="link-item" href="${link.href}">
              <span>${escapeHtml(link.label)}</span>
              <small>${escapeHtml(link.description)}</small>
            </a>
          `).join("")}
        </div>
      </section>
    `;
  }

  function homeWorkflowLinks() {
    return [
      linkToTool("json-formatter", "Format JSON online"),
      linkToTool("ai-json-repair", "Fix invalid AI JSON"),
      linkToTool("text-to-json", "Generate JSON from text"),
      linkToTool("ai-json-schema-generator", "Draft JSON Schema"),
      linkToDirectory("json-converter-tools", "Convert JSON"),
      linkToDirectory("text-tools", "Clean text"),
      linkToGuide("json-parser-error-unexpected-token", "Fix parser errors"),
      linkToGuide("json-format-for-ai", "Prepare JSON for AI")
    ];
  }

  function internalLinksForTool(tool) {
    const base = [
      linkToDirectory("json-tools", "Browse JSON tools"),
      linkToDirectory("ai-json-tools", "Browse AI JSON tools"),
      linkToGuide("json-format-online", "JSON format guide"),
      linkToGuide("fix-invalid-json", "Fix invalid JSON")
    ];
    const byCategory = {
      JSON: [
        linkToTool("json-validator", "Validate JSON"),
        linkToTool("json-compare", "Compare JSON"),
        linkToTool("json-to-schema", "Generate schema"),
        linkToGuide("format-api-response-json", "Format API responses")
      ],
      AI: [
        linkToTool("ai-json-repair", "Repair AI JSON"),
        linkToTool("text-to-json", "Text to JSON"),
        linkToTool("ai-mock-json-generator", "Mock JSON"),
        linkToGuide("ai-json-generator", "AI JSON generator guide")
      ],
      Text: [
        linkToDirectory("text-tools", "Browse text tools"),
        linkToTool("regex-tester", "Test regex"),
        linkToTool("text-replace", "Find and replace"),
        linkToTool("duplicate-line-remover", "Remove duplicates")
      ],
      Encode: [
        linkToDirectory("developer-tools", "Browse developer tools"),
        linkToTool("jwt-decoder", "Decode JWT"),
        linkToTool("url-parser", "Parse URLs"),
        linkToTool("query-string-to-json", "Query to JSON")
      ],
      Hash: [
        linkToDirectory("developer-tools", "Browse developer tools"),
        linkToGuide("md5-hash-generator", "MD5 guide"),
        linkToGuide("sha256-checksum", "SHA256 guide")
      ],
      Time: [
        linkToTool("current-timestamp", "Current timestamp"),
        linkToGuide("unix-timestamp-to-date", "Timestamp to date"),
        linkToGuide("date-to-unix-timestamp", "Date to timestamp")
      ]
    };
    return (byCategory[tool.category] || []).concat(base).filter((link) => link && link.href !== tool.path);
  }

  function internalLinksForGuide(guide) {
    const tool = byId[guide.primaryToolId];
    return [
      tool ? linkToTool(tool.id, `Open ${tool.title}`) : null,
      linkToDirectory("ai-json-tools", "AI JSON tools"),
      linkToDirectory("json-tools", "JSON tools"),
      linkToGuide("ai-json-formatter", "AI JSON formatter"),
      linkToGuide("json-format-online", "JSON format online"),
      linkToGuide("fix-json-from-chatgpt", "Fix ChatGPT JSON"),
      linkToGuide("format-api-response-json", "Format API response"),
      linkToTool("json-validator", "Validate JSON")
    ].filter((link) => link && link.href !== `/${guide.id}/`);
  }

  function internalLinksForDirectory(directory) {
    if (directory.id === "directories") {
      return [
        linkToDirectory("json-tools", "JSON tools"),
        linkToDirectory("ai-json-tools", "AI JSON tools"),
        linkToDirectory("json-converter-tools", "Converters"),
        linkToDirectory("text-tools", "Text tools"),
        linkToDirectory("developer-tools", "Developer tools")
      ];
    }
    return [
      linkToDirectory("directories", "All directories"),
      linkToDirectory("json-tools", "JSON tools"),
      linkToDirectory("ai-json-tools", "AI JSON tools"),
      linkToDirectory("json-converter-tools", "JSON converters"),
      linkToDirectory("text-tools", "Text tools"),
      linkToDirectory("developer-tools", "Developer tools"),
      linkToGuide("json-format-online", "JSON format online"),
      linkToGuide("ai-json-generator", "AI JSON generator")
    ].filter((link) => link && link.href !== directory.path);
  }

  function linkToTool(id, label) {
    const tool = byId[id];
    return tool ? { href: tool.path, label: label || tool.title, description: tool.description } : null;
  }

  function linkToGuide(id, label) {
    const guide = guidesById[id];
    return guide ? { href: `/${guide.id}/`, label: label || guide.title, description: guide.description } : null;
  }

  function linkToDirectory(id, label) {
    const directory = directoriesById[id];
    return directory ? { href: directory.path, label: label || directory.title, description: directory.description } : null;
  }

  function renderBreadcrumb(items) {
    const crumbs = [{ label: "Home", href: "/" }, ...items];
    return `
      <nav class="breadcrumb" aria-label="Breadcrumb">
        ${crumbs.map((item, index) => item.href && index < crumbs.length - 1
          ? `<a href="${item.href}">${escapeHtml(item.label)}</a><span>/</span>`
          : `<span>${escapeHtml(item.label)}</span>`).join("")}
      </nav>
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

  function bindToolIndex() {
    bindHome();
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

  function directoriesForTool(tool) {
    const matches = directoryPages.filter((directory) => (directory.toolIds || []).includes(tool.id));
    return (matches.length ? matches : directoryPages.filter((directory) => directory.id !== "directories")).slice(0, 4);
  }

  function directoriesForGuide(guide) {
    const matches = directoryPages.filter((directory) => (directory.guideIds || []).includes(guide.id));
    return (matches.length ? matches : directoryPages.filter((directory) => directory.id !== "directories")).slice(0, 4);
  }

  function toolUseCases(tool) {
    const cases = {
      JSON: [
        "Clean API responses before sharing them in documentation.",
        "Debug parser errors from logs, webhooks and config files.",
        "Prepare JSON examples for prompts, tests and frontend code."
      ],
      AI: [
        "Turn rough notes or model output into valid JSON.",
        "Review AI-generated data before using it in an app.",
        "Move from natural language to structured fields faster."
      ],
      Hash: [
        "Create quick fingerprints for snippets and expected values.",
        "Compare text checksums during debugging.",
        "Generate non-secret hashes without a server round trip."
      ],
      Time: [
        "Convert timestamps while reading logs and API payloads.",
        "Check local and UTC time without changing apps.",
        "Copy seconds or milliseconds for databases and scripts."
      ],
      Encode: [
        "Encode or decode data while testing requests and tokens.",
        "Inspect copied values without sending them to another service.",
        "Prepare text for URLs, HTML, Base64 or JWT debugging."
      ],
      Text: [
        "Clean titles, identifiers and documentation snippets.",
        "Convert text into developer-friendly formats.",
        "Remove whitespace, replace text and reshape lists during content and code reviews."
      ],
      Random: [
        "Generate identifiers or passwords for tests and prototypes.",
        "Create random values locally in the browser.",
        "Copy outputs into API clients, docs or fixtures."
      ]
    };
    return cases[tool.category] || cases.JSON;
  }

  function result(output, message, level) {
    return { output: String(output || ""), message: message || "Done.", level: level || "ok" };
  }

  function parseAndStringify(value, spaces) {
    try {
      const parsed = JSON.parse(value);
      return result(JSON.stringify(parsed, null, spaces), spaces === 0 ? "JSON minified." : "JSON formatted.", "ok");
    } catch (error) {
      return result("", humanJsonError(error, value), "error");
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
      const friendly = humanJsonError(error, value);
      return result(friendly, friendly.split("\n")[0], "error");
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
      return result(repaired, `Best effort repair created, but JSON still has an error: ${humanJsonError(error, repaired)}`, "warn");
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

  function urlParserTool(value) {
    try {
      const url = new URL(String(value || "").trim(), window.location.origin);
      const parsed = {
        href: url.href,
        protocol: url.protocol,
        origin: url.origin,
        hostname: url.hostname,
        port: url.port,
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
        query: paramsToObject(url.searchParams)
      };
      return result(JSON.stringify(parsed, null, 2), "URL parsed.", "ok");
    } catch (error) {
      return result("", "Enter a valid URL.", "error");
    }
  }

  function queryStringToJsonTool(value) {
    try {
      const input = String(value || "").trim();
      if (!input) return result("{}", "Enter a query string or URL.", "error");
      const query = input.includes("?") ? new URL(input, window.location.origin).search : input.startsWith("?") ? input : `?${input}`;
      return result(JSON.stringify(paramsToObject(new URLSearchParams(query)), null, 2), "Query string converted to JSON.", "ok");
    } catch (error) {
      return result("", "Enter a valid query string or URL.", "error");
    }
  }

  function paramsToObject(params) {
    const object = {};
    for (const [key, value] of params.entries()) {
      if (key in object) {
        object[key] = Array.isArray(object[key]) ? object[key].concat(value) : [object[key], value];
      } else {
        object[key] = value;
      }
    }
    return object;
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

  function removeWhitespaceTool(value) {
    const output = String(value || "").replace(/\s+/g, "");
    return result(output, `Removed whitespace. Output length: ${output.length}.`, "ok");
  }

  function normalizeWhitespaceTool(value) {
    const output = String(value || "").trim().replace(/\s+/g, " ");
    return result(output, output ? "Whitespace normalized to single spaces." : "Enter text to normalize.", output ? "ok" : "error");
  }

  function textFormatterTool(value) {
    const output = String(value || "")
      .replace(/\r\n?/g, "\n")
      .split("\n")
      .map((line) => line.trim().replace(/[ \t]+/g, " "))
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    return result(output, output ? "Text formatted." : "Enter text to format.", output ? "ok" : "error");
  }

  function compactParagraphsTool(value) {
    const output = String(value || "")
      .replace(/\r\n?/g, "\n")
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.split("\n").map((line) => line.trim()).filter(Boolean).join(" ").replace(/[ \t]+/g, " "))
      .filter(Boolean)
      .join("\n\n");
    return result(output, output ? "Paragraphs compacted." : "Enter text to compact.", output ? "ok" : "error");
  }

  function textReplaceTool(value) {
    const parsed = parseReplaceInput(value);
    if (!parsed.find) return result("", "Use Find: value and Replace: value, then a blank line and the text.", "error");
    const output = parsed.text.split(parsed.find).join(parsed.replace);
    const count = parsed.text.split(parsed.find).length - 1;
    return result(output, `Replaced ${count} occurrence${count === 1 ? "" : "s"}.`, "ok");
  }

  function regexReplaceTool(value) {
    try {
      const parsed = parseReplaceInput(value);
      if (!parsed.find) return result("", "Use Find: /pattern/flags and Replace: value, then a blank line and the text.", "error");
      const regex = parseRegexPattern(parsed.find);
      const matches = parsed.text.match(regex);
      return result(parsed.text.replace(regex, parsed.replace), `Regex replaced ${matches ? matches.length : 0} match${matches && matches.length === 1 ? "" : "es"}.`, "ok");
    } catch (error) {
      return result("", error.message, "error");
    }
  }

  function regexTesterTool(value) {
    try {
      const text = String(value || "").replace(/\r\n?/g, "\n");
      const blocks = text.split(/\n\s*\n/);
      const header = blocks.shift() || "";
      const body = blocks.join("\n\n");
      const patternLine = header.split("\n").find((line) => /^pattern\s*:/i.test(line)) || header.split("\n")[0] || "";
      const patternText = patternLine.replace(/^pattern\s*:/i, "").trim();
      if (!patternText) return result("", "Use Pattern: /your-pattern/flags, then a blank line and test text.", "error");
      const regex = parseRegexPattern(patternText);
      const matches = Array.from(body.matchAll(regex));
      if (!matches.length) return result("No matches.", "No regex matches found.", "warn");
      const lines = matches.map((match, index) => {
        const groups = match.length > 1 ? `\n  Groups: ${match.slice(1).map((item) => item ?? "").join(" | ")}` : "";
        return `Match ${index + 1}: ${match[0]}\n  Index: ${match.index}${groups}`;
      });
      return result(lines.join("\n\n"), `Found ${matches.length} match${matches.length === 1 ? "" : "es"}.`, "ok");
    } catch (error) {
      return result("", error.message, "error");
    }
  }

  function parseReplaceInput(value) {
    const text = String(value || "").replace(/\r\n?/g, "\n");
    const blocks = text.split(/\n\s*\n/);
    const header = blocks.shift() || "";
    const body = blocks.join("\n\n");
    const lines = header.split("\n");
    const findLine = lines.find((line) => /^find\s*:/i.test(line)) || lines[0] || "";
    const replaceLine = lines.find((line) => /^replace\s*:/i.test(line)) || lines[1] || "";
    const find = findLine.replace(/^find\s*:/i, "").trim();
    const replace = replaceLine.replace(/^replace\s*:/i, "");
    return { find, replace: replace.trim(), text: body || lines.slice(2).join("\n") };
  }

  function parseRegexPattern(value) {
    const match = String(value).match(/^\/([\s\S]+)\/([a-z]*)$/i);
    if (match) return new RegExp(match[1], match[2].includes("g") ? match[2] : `${match[2]}g`);
    return new RegExp(escapeRegExp(value), "g");
  }

  function lineSorterTool(value) {
    const lines = cleanLines(value).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
    return result(lines.join("\n"), `Sorted ${lines.length} line${lines.length === 1 ? "" : "s"}.`, lines.length ? "ok" : "error");
  }

  function reverseLinesTool(value) {
    const lines = cleanLines(value).reverse();
    return result(lines.join("\n"), `Reversed ${lines.length} line${lines.length === 1 ? "" : "s"}.`, lines.length ? "ok" : "error");
  }

  function duplicateLineRemoverTool(value) {
    return uniqueLinesTool(value, false);
  }

  function duplicateLineRemoverInsensitiveTool(value) {
    return uniqueLinesTool(value, true);
  }

  function uniqueLinesTool(value, insensitive) {
    const seen = new Set();
    const unique = [];
    for (const line of cleanLines(value)) {
      const key = insensitive ? line.toLowerCase() : line;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(line);
    }
    return result(unique.join("\n"), `Kept ${unique.length} unique line${unique.length === 1 ? "" : "s"}.`, unique.length ? "ok" : "error");
  }

  function cleanLines(value) {
    return String(value || "").replace(/\r\n?/g, "\n").split("\n").map((line) => line.trim()).filter(Boolean);
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

  function localJsonSchemaFromTextTool(value) {
    try {
      JSON.parse(value);
      return jsonToSchemaTool(value);
    } catch {
      const fields = cleanLines(value)
        .flatMap((line) => line.split(/,|;|\band\b/i))
        .map((field) => field.replace(/\b(a|an|the|with|object|array|field|fields|of|and)\b/gi, " ").trim())
        .map((field) => field.match(/[A-Za-z][A-Za-z0-9 _-]*/)?.[0] || "")
        .map(toCamelKey)
        .filter((field) => field && field !== "value");
      const uniqueFields = Array.from(new Set(fields)).slice(0, 24);
      if (!uniqueFields.length) {
        return result("", "Paste valid JSON or list the fields you want in the schema.", "error");
      }
      const schema = {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        type: "object",
        properties: Object.fromEntries(uniqueFields.map((field) => [field, inferSchemaForField(field)])),
        required: uniqueFields
      };
      return result(JSON.stringify(schema, null, 2), "Generated a local schema draft from field names.", "warn");
    }
  }

  async function aiJsonSchemaTool(value) {
    const aiResult = await callAiJson("schema-from-text", value);
    if (aiResult) return aiResult;
    return localJsonSchemaFromTextTool(value);
  }

  async function aiJsonExplainerTool(value) {
    const aiResult = await callAiJsonData("explain-json", value);
    if (aiResult && !aiResult.error) {
      return result(formatJsonExplanation(aiResult.data), aiResult.message || "AI explained the JSON structure.", "ok");
    }
    try {
      const parsed = JSON.parse(value);
      return result(formatLocalJsonExplanation(parsed), "Generated a local JSON structure summary.", "warn");
    } catch (error) {
      const repaired = repairJson(value);
      try {
        const parsed = JSON.parse(repaired);
        return result(formatLocalJsonExplanation(parsed), "Repaired JSON locally and generated a structure summary.", "warn");
      } catch {
        return result("", aiResult?.error || humanJsonError(error, value), "error");
      }
    }
  }

  async function aiMockJsonTool(value) {
    const aiResult = await callAiJson("mock-json", value);
    if (aiResult) return aiResult;
    try {
      const parsed = JSON.parse(value);
      const mock = mockFromSchema(parsed);
      return result(JSON.stringify(mock, null, 2), "Generated local mock JSON from schema-like input.", "warn");
    } catch {
      return result(textToJsonTool(value).output, "AI mode is not configured, so a local JSON draft was generated.", "warn");
    }
  }

  async function aiRegexGeneratorTool(value) {
    const aiResult = await callAiJsonData("regex-from-text", value);
    if (aiResult && !aiResult.error) {
      return result(formatRegexResult(aiResult.data), aiResult.message || "AI generated a regex.", "ok");
    }
    return result(formatRegexResult(heuristicRegex(value)), aiResult?.error || "Generated a local regex draft.", "warn");
  }

  async function callAiJsonData(mode, input, localRepair) {
    try {
      const response = await fetch("/api/ai-json/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, input, localRepair })
      });
      if (response.status === 404 || response.status === 501) return null;
      const data = await response.json();
      if (!response.ok) return { error: data.error || "AI request failed." };
      return {
        data: JSON.parse(data.output),
        message: data.message || "AI JSON generated."
      };
    } catch {
      return null;
    }
  }

  async function callAiJson(mode, input, localRepair) {
    const aiResult = await callAiJsonData(mode, input, localRepair);
    if (!aiResult) return null;
    if (aiResult.error) return result(localRepair || "", aiResult.error, "warn");
    return result(JSON.stringify(aiResult.data, null, 2), aiResult.message || "AI JSON generated.", "ok");
  }

  function inferSchemaForField(field) {
    if (/id$/i.test(field)) return { type: "string" };
    if (/email/i.test(field)) return { type: "string", format: "email" };
    if (/url|uri|link/i.test(field)) return { type: "string", format: "uri" };
    if (/date|time|created|updated/i.test(field)) return { type: "string", format: "date-time" };
    if (/count|total|amount|price|score|rating|age|number/i.test(field)) return { type: "number" };
    if (/is|has|enabled|active|valid|paid/i.test(field)) return { type: "boolean" };
    if (/tags|items|list|roles|flags/i.test(field)) return { type: "array", items: { type: "string" } };
    return { type: "string" };
  }

  function formatJsonExplanation(data) {
    if (!data || typeof data !== "object") return formatJsonValue(data);
    const lines = [];
    if (data.summary) lines.push(`Summary: ${data.summary}`);
    if (data.topLevelType) lines.push(`Top-level type: ${data.topLevelType}`);
    const listFields = [
      ["Important fields", data.importantFields],
      ["Potential issues", data.potentialIssues],
      ["Suggested next steps", data.suggestedNextSteps]
    ];
    for (const [label, items] of listFields) {
      if (!Array.isArray(items) || !items.length) continue;
      lines.push("");
      lines.push(`${label}:`);
      lines.push(...items.map((item) => `- ${String(item)}`));
    }
    return lines.join("\n").trim() || JSON.stringify(data, null, 2);
  }

  function formatLocalJsonExplanation(value) {
    const topLevelType = Array.isArray(value) ? "array" : value === null ? "null" : typeof value;
    const paths = collectFieldPaths(value).slice(0, 16);
    const lines = [
      `Summary: This is a JSON ${topLevelType}.`,
      `Top-level type: ${topLevelType}`
    ];
    if (paths.length) {
      lines.push("");
      lines.push("Important fields:");
      lines.push(...paths.map((path) => `- ${path}`));
    }
    lines.push("");
    lines.push("Suggested next steps:");
    lines.push("- Validate the JSON before parsing it in production.");
    lines.push("- Generate TypeScript or JSON Schema if you need a contract.");
    return lines.join("\n");
  }

  function collectFieldPaths(value, prefix = "$", output = []) {
    if (Array.isArray(value)) {
      if (value.length) collectFieldPaths(value[0], `${prefix}[0]`, output);
      return output;
    }
    if (value && typeof value === "object") {
      for (const [key, item] of Object.entries(value)) {
        const path = `${prefix}.${key}`;
        output.push(path);
        if (item && typeof item === "object") collectFieldPaths(item, path, output);
      }
    }
    return output;
  }

  function mockFromSchema(schema) {
    if (schema && schema.$schema && schema.type) return exampleFromSchema(schema, "value");
    if (schema && schema.type) return exampleFromSchema(schema, "value");
    if (schema && typeof schema === "object") {
      return Object.fromEntries(Object.keys(schema).slice(0, 12).map((key) => [key, mockValueForKey(key)]));
    }
    return { value: "Example value" };
  }

  function exampleFromSchema(schema, key) {
    if (!schema || typeof schema !== "object") return mockValueForKey(key);
    if (schema.example !== undefined) return schema.example;
    if (schema.default !== undefined) return schema.default;
    const type = Array.isArray(schema.type) ? schema.type.find((item) => item !== "null") : schema.type;
    if (type === "object" || schema.properties) {
      const properties = schema.properties || {};
      return Object.fromEntries(Object.entries(properties).slice(0, 16).map(([property, child]) => [property, exampleFromSchema(child, property)]));
    }
    if (type === "array") return [exampleFromSchema(schema.items || {}, key)];
    if (type === "number" || type === "integer") return mockValueForKey(key, "number");
    if (type === "boolean") return true;
    if (schema.enum && schema.enum.length) return schema.enum[0];
    return mockValueForKey(key);
  }

  function mockValueForKey(key, preferredType) {
    if (preferredType === "number") return /rating|score/i.test(key) ? 4.8 : 123;
    if (/email/i.test(key)) return "demo@example.com";
    if (/url|link/i.test(key)) return "https://aijsonformat.com/";
    if (/date|time|created|updated/i.test(key)) return new Date().toISOString();
    if (/id$/i.test(key)) return "item_123";
    if (/active|enabled|valid|paid/i.test(key)) return true;
    if (/tags|roles|items|flags/i.test(key)) return ["example"];
    return `Example ${String(key || "value").replace(/([A-Z])/g, " $1").toLowerCase()}`.trim();
  }

  function heuristicRegex(value) {
    const text = String(value || "").toLowerCase();
    if (text.includes("email")) {
      return {
        pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
        flags: "",
        explanation: "Matches a simple email address shape.",
        examples: ["demo@example.com"],
        notes: ["Use stricter validation for production identity systems."]
      };
    }
    if (text.includes("url") || text.includes("http")) {
      return {
        pattern: "^https?:\\/\\/[^\\s/$.?#].[^\\s]*$",
        flags: "i",
        explanation: "Matches a basic HTTP or HTTPS URL.",
        examples: ["https://aijsonformat.com/tools/"],
        notes: ["URL parsing is often safer than regex-only validation."]
      };
    }
    if (text.includes("slug")) {
      return {
        pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
        flags: "",
        explanation: "Matches lowercase URL slugs without leading or trailing hyphens.",
        examples: ["ai-json-format"],
        notes: ["Adjust length limits if your app needs them."]
      };
    }
    return {
      pattern: ".+",
      flags: "",
      explanation: "Fallback pattern that matches non-empty text.",
      examples: ["example"],
      notes: ["Describe allowed characters, length and negative examples for a better AI regex."]
    };
  }

  function formatRegexResult(data) {
    const pattern = String(data?.pattern || ".+");
    const flags = String(data?.flags || "");
    const examples = toStringList(data?.examples);
    const notes = toStringList(data?.notes);
    const lines = [
      `Regex: /${pattern.replace(/\//g, "\\/")}/${flags}`,
      `Pattern: ${pattern}`,
      `Flags: ${flags || "(none)"}`
    ];
    if (data?.explanation) lines.push("", `Explanation: ${data.explanation}`);
    if (examples.length) {
      lines.push("", "Examples:");
      lines.push(...examples.map((item) => `- ${item}`));
    }
    if (notes.length) {
      lines.push("", "Notes:");
      lines.push(...notes.map((item) => `- ${item}`));
    }
    return lines.join("\n");
  }

  function toStringList(value) {
    if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean);
    if (value === undefined || value === null || value === "") return [];
    return [String(value)];
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
      return result("", humanJsonError(error, value), "error");
    }
  }

  function csvToJsonTool(value) {
    try {
      const rows = parseCsv(value);
      if (rows.length < 2) return result("[]", "CSV needs a header row and at least one data row.", "error");
      const headers = rows[0].map((header, index) => toCamelKey(header || `column ${index + 1}`));
      const data = rows.slice(1).filter((row) => row.some((cell) => String(cell).trim())).map((row) => {
        return Object.fromEntries(headers.map((header, index) => [header, coerceValue(row[index] || "")]));
      });
      return result(JSON.stringify(data, null, 2), `Converted ${data.length} CSV row${data.length === 1 ? "" : "s"} to JSON.`, "ok");
    } catch (error) {
      return result("", error.message, "error");
    }
  }

  function jsonToYamlTool(value) {
    try {
      const parsed = JSON.parse(value);
      return result(toYaml(parsed), "Converted JSON to YAML.", "ok");
    } catch (error) {
      return result("", humanJsonError(error, value), "error");
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
      return result("", humanJsonError(error, value), "error");
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
      return result("", humanJsonError(error, value), "error");
    }
  }

  function jsonCompareTool(value) {
    let first;
    let second;
    try {
      ({ first, second } = splitTwoInputs(value, "Paste the first JSON, a blank line, then the second JSON."));
    } catch (error) {
      return result("", error.message, "error");
    }
    let left;
    try {
      left = JSON.parse(first);
    } catch (error) {
      return result("", `First JSON: ${humanJsonError(error, first)}`, "error");
    }
    let right;
    try {
      right = JSON.parse(second);
    } catch (error) {
      return result("", `Second JSON: ${humanJsonError(error, second)}`, "error");
    }
    const changes = [];
    compareJsonValues(left, right, "$", changes);
    if (!changes.length) return result("No differences found.", "JSON values are equal.", "ok");
    const summary = summarizeJsonDiffs(changes);
    const formatted = formatJsonDiffs(changes);
    return result(formatted, summary, "warn");
  }

  function summarizeJsonDiffs(changes) {
    let added = 0;
    let removed = 0;
    let changed = 0;
    for (const line of changes) {
      if (line.startsWith("Added ")) added += 1;
      else if (line.startsWith("Removed ")) removed += 1;
      else changed += 1;
    }
    const parts = [];
    if (added) parts.push(`${added} added`);
    if (removed) parts.push(`${removed} removed`);
    if (changed) parts.push(`${changed} changed`);
    return parts.length ? parts.join(", ") : `${changes.length} differences`;
  }

  function formatJsonDiffs(changes) {
    return changes.map((line) => {
      if (line.startsWith("Added ")) return `+ ${line.slice(6)}`;
      if (line.startsWith("Removed ")) return `- ${line.slice(8)}`;
      if (line.startsWith("Changed ")) return `~ ${line.slice(8)}`;
      return line;
    }).join("\n");
  }

  function jsonSorterTool(value) {
    try {
      const parsed = JSON.parse(value);
      return result(JSON.stringify(sortJsonValue(parsed), null, 2), "JSON object keys sorted recursively.", "ok");
    } catch (error) {
      return result("", humanJsonError(error, value), "error");
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
      return result("", humanJsonError(error, jsonText), "error");
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
          throw new Error(`Line ${index + 1}: ${humanJsonError(error, line)}`);
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
      return result("", humanJsonError(error, value), "error");
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
      return result("", humanJsonError(error, value), "error");
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

  function parseCsv(value) {
    const rows = [];
    let row = [];
    let cell = "";
    let quoted = false;
    const text = String(value || "").replace(/\r\n?/g, "\n");
    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      const next = text[index + 1];
      if (quoted) {
        if (char === '"' && next === '"') {
          cell += '"';
          index += 1;
        } else if (char === '"') {
          quoted = false;
        } else {
          cell += char;
        }
      } else if (char === '"') {
        quoted = true;
      } else if (char === ",") {
        row.push(cell);
        cell = "";
      } else if (char === "\n") {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
      } else {
        cell += char;
      }
    }
    if (quoted) throw new Error("CSV has an unclosed quoted field.");
    row.push(cell);
    rows.push(row);
    return rows.filter((item) => item.some((cellValue) => String(cellValue).trim()));
  }

  function splitTwoInputs(value, message) {
    const blocks = String(value || "").trim().split(/\n\s*\n/);
    if (blocks.length < 2) throw new Error(message);
    return { first: blocks[0].trim(), second: blocks.slice(1).join("\n\n").trim() };
  }

  function compareJsonValues(left, right, path, changes) {
    if (Object.is(left, right)) return;
    if (Array.isArray(left) || Array.isArray(right)) {
      if (!Array.isArray(left)) {
        changes.push(`Changed ${path}: ${formatDiffValue(left)} -> ${formatDiffValue(right)}`);
        return;
      }
      if (!Array.isArray(right)) {
        changes.push(`Changed ${path}: ${formatDiffValue(left)} -> ${formatDiffValue(right)}`);
        return;
      }
      const max = Math.max(left.length, right.length);
      for (let index = 0; index < max; index += 1) {
        const nextPath = `${path}[${index}]`;
        if (index >= left.length) changes.push(`Added ${nextPath}: ${formatDiffValue(right[index])}`);
        else if (index >= right.length) changes.push(`Removed ${nextPath}: ${formatDiffValue(left[index])}`);
        else compareJsonValues(left[index], right[index], nextPath, changes);
      }
      return;
    }
    if (isPlainObject(left) && isPlainObject(right)) {
      const keys = Array.from(new Set([...Object.keys(left), ...Object.keys(right)])).sort();
      for (const key of keys) {
        const nextPath = `${path}.${key}`;
        if (!(key in left)) changes.push(`Added ${nextPath}: ${formatDiffValue(right[key])}`);
        else if (!(key in right)) changes.push(`Removed ${nextPath}: ${formatDiffValue(left[key])}`);
        else compareJsonValues(left[key], right[key], nextPath, changes);
      }
      return;
    }
    changes.push(`Changed ${path}: ${formatDiffValue(left)} -> ${formatDiffValue(right)}`);
  }

  function isPlainObject(value) {
    return value && typeof value === "object" && !Array.isArray(value);
  }

  function formatDiffValue(value) {
    return typeof value === "string" ? JSON.stringify(value) : JSON.stringify(value);
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

  function humanJsonError(error, source) {
    const message = error && error.message ? String(error.message) : "Invalid JSON.";
    if (typeof source !== "string" || !source) return message;
    const position = extractJsonErrorPosition(message, source);
    if (position == null) return message;
    const { line, column } = positionToLineColumn(source, position);
    const snippet = formatErrorSnippet(source, line, column);
    const cleaned = message
      .replace(/\s+at position \d+/i, "")
      .replace(/\s+\(line \d+ column \d+\)/i, "")
      .replace(/\s+in JSON\b/i, "")
      .trim();
    return `${cleaned} (line ${line}, column ${column})\n${snippet}`;
  }

  function extractJsonErrorPosition(message, source) {
    const positionMatch = message.match(/position\s+(\d+)/i);
    if (positionMatch) return Math.min(Number(positionMatch[1]), source.length);
    const lineColMatch = message.match(/line\s+(\d+)\s+column\s+(\d+)/i);
    if (lineColMatch) {
      const line = Number(lineColMatch[1]);
      const column = Number(lineColMatch[2]);
      return lineColumnToPosition(source, line, column);
    }
    const snippetMatch = message.match(/\.\.\."([\s\S]*?)"\s+is\s+not\s+valid\s+JSON/i);
    if (snippetMatch) {
      const snippet = unescapeJsonErrorSnippet(snippetMatch[1]);
      const head = snippet.slice(0, 30);
      if (head) {
        const idx = source.indexOf(head);
        if (idx !== -1) return idx;
      }
    }
    const tokenMatch = message.match(/Unexpected token\s+'?([^']{1,3})'?/i);
    if (tokenMatch && tokenMatch[1]) {
      const idx = source.indexOf(tokenMatch[1]);
      if (idx !== -1) return idx;
    }
    return null;
  }

  function unescapeJsonErrorSnippet(text) {
    return String(text)
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
  }

  function positionToLineColumn(source, position) {
    let line = 1;
    let column = 1;
    for (let index = 0; index < position && index < source.length; index += 1) {
      if (source.charCodeAt(index) === 10) {
        line += 1;
        column = 1;
      } else {
        column += 1;
      }
    }
    return { line, column };
  }

  function lineColumnToPosition(source, line, column) {
    let currentLine = 1;
    for (let index = 0; index < source.length; index += 1) {
      if (currentLine === line) return Math.min(index + column - 1, source.length);
      if (source.charCodeAt(index) === 10) currentLine += 1;
    }
    return source.length;
  }

  function formatErrorSnippet(source, line, column) {
    const lines = source.split("\n");
    const start = Math.max(1, line - 2);
    const end = Math.min(lines.length, line + 2);
    const width = String(end).length;
    const out = [];
    for (let index = start; index <= end; index += 1) {
      const prefix = String(index).padStart(width, " ");
      const marker = index === line ? ">" : " ";
      out.push(`${marker} ${prefix} | ${lines[index - 1] || ""}`);
      if (index === line) {
        const caret = " ".repeat(column - 1) + "^";
        out.push(`  ${" ".repeat(width)} | ${caret}`);
      }
    }
    return out.join("\n");
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

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
