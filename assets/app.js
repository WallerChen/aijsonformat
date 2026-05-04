(function () {
  "use strict";

  const tools = [
    {
      id: "ai-json-repair",
      title: "AI JSON Repair",
      category: "JSON",
      path: "/tools/ai-json-repair/",
      description:
        "Fix broken JSON from ChatGPT, APIs, logs and config files with smart local repair.",
      inputLabel: "Broken JSON",
      outputLabel: "Repaired JSON",
      actionLabel: "Repair JSON",
      sample:
        "{\n  name: 'AI JSON Format',\n  tags: ['json', 'tools',],\n  active: true,\n}",
      run: repairJsonTool,
      faq: [
        ["Can this fix JSON from ChatGPT?", "Yes. It handles common model output issues like code fences, comments, single quotes, trailing commas and unquoted keys."],
        ["Is my JSON uploaded?", "No. This tool runs in your browser for the current version."],
        ["What if repair fails?", "The output still shows the best cleaned version and the message explains what failed."]
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
      description: "Generate strong random passwords with adjustable length and character sets.",
      inputLabel: "Length",
      outputLabel: "Password",
      actionLabel: "Generate Password",
      sample: "24",
      run: passwordTool,
      faq: [
        ["What length should I use?", "Use at least 16 characters for most accounts, and longer for shared secrets."],
        ["Are passwords stored?", "No. They are generated locally and not saved."],
        ["Can I avoid symbols?", "This first version includes letters, numbers and symbols for stronger defaults."]
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
      sample: "name: AI JSON Format\ncategory: developer tools\nfree: true",
      run: textToJsonTool,
      faq: [
        ["What text formats work best?", "Key-value lines, comma-separated lists and simple tables work best."],
        ["Is this AI powered?", "This version uses local structured parsing. It is designed so an AI parser can be added later."],
        ["Can I edit the output?", "Yes. Copy the JSON and refine it in the JSON Formatter or Repair tools."]
      ]
    }
  ];

  const byId = Object.fromEntries(tools.map((tool) => [tool.id, tool]));
  const app = document.getElementById("app");
  const pageId = app.dataset.page || pageFromPath();

  renderShell(pageId);

  function renderShell(id) {
    const isHome = id === "home";
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
              <a href="/#all-tools">All tools</a>
            </div>
          </nav>
        </header>
        ${isHome ? renderHome() : renderToolPage(tool)}
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
    } else {
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
        <div class="ad-slot">Ad placement</div>
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
            <div class="ad-slot">Ad placement</div>
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
            <div class="ad-slot">Ad placement</div>
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
    return parts[0] === "tools" && parts[1] ? parts[1] : "home";
  }

  function relatedTools(tool) {
    const same = tools.filter((item) => item.category === tool.category && item.id !== tool.id);
    const rest = tools.filter((item) => item.category !== tool.category);
    return same.concat(rest).slice(0, 7);
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

  function repairJsonTool(value) {
    const repaired = repairJson(value);
    try {
      const parsed = JSON.parse(repaired);
      return result(JSON.stringify(parsed, null, 2), "JSON repaired and formatted.", "ok");
    } catch (error) {
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
    const length = clamp(parseInt(value, 10) || 24, 8, 128);
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*_-+=?";
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
