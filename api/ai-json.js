const MAX_INPUT_CHARS = 12000;
const RATE_LIMIT_WINDOW_MS = Number(process.env.AI_RATE_LIMIT_WINDOW_MS || 60_000);
const RATE_LIMIT_MAX_REQUESTS = Number(process.env.AI_RATE_LIMIT_MAX_REQUESTS || 12);
const RATE_LIMIT_BUCKETS = new Map();

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const rateLimit = checkRateLimit(getClientKey(req));
  res.setHeader("X-RateLimit-Limit", String(RATE_LIMIT_MAX_REQUESTS));
  res.setHeader("X-RateLimit-Remaining", String(rateLimit.remaining));
  res.setHeader("X-RateLimit-Reset", String(Math.ceil(rateLimit.resetAt / 1000)));
  if (!rateLimit.allowed) {
    res.setHeader("Retry-After", String(Math.ceil(rateLimit.retryAfterMs / 1000)));
    return res.status(429).json({ error: "Too many AI requests. Please wait a moment and try again." });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  } catch {
    return res.status(400).json({ error: "Request body must be valid JSON." });
  }
  const mode = normalizeMode(body.mode);
  const rawInput = String(body.input || "");
  const rawLocalRepair = String(body.localRepair || "");
  if (rawInput.length > MAX_INPUT_CHARS || rawLocalRepair.length > MAX_INPUT_CHARS) {
    return res.status(413).json({ error: `Input is too long. Please keep each field under ${MAX_INPUT_CHARS} characters.` });
  }
  const input = rawInput;
  const localRepair = rawLocalRepair;

  if (!input.trim()) {
    return res.status(400).json({ error: "Input is required." });
  }

  const config = getProviderConfig();
  if (!config.apiKey) {
    return res.status(501).json({ error: "AI is not configured. Set AI_API_KEY, ARK_API_KEY, or OPENAI_API_KEY in Vercel." });
  }

  const prompt = promptForMode(mode);

  const user = [
    prompt.task,
    localRepair ? `Best local repair attempt:\n${localRepair}` : "",
    `User input:\n${input}`
  ].filter(Boolean).join("\n\n");

  try {
    const data = await callModel(config, prompt.developer, user);
    const text = extractModelText(data).trim();
    const jsonText = extractJson(text);
    const outputText = mode === "regex-from-text" ? normalizeRegexOutput(jsonText, input) : jsonText;
    JSON.parse(outputText);

    return res.status(200).json({
      output: outputText,
      message: prompt.message
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "AI JSON processing failed." });
  }
};

function checkRateLimit(key) {
  const now = Date.now();
  const resetAt = now + RATE_LIMIT_WINDOW_MS;
  cleanupRateLimitBuckets(now);

  const bucket = RATE_LIMIT_BUCKETS.get(key);
  if (!bucket || bucket.resetAt <= now) {
    RATE_LIMIT_BUCKETS.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: Math.max(0, RATE_LIMIT_MAX_REQUESTS - 1),
      resetAt,
      retryAfterMs: 0
    };
  }

  if (bucket.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: bucket.resetAt,
      retryAfterMs: bucket.resetAt - now
    };
  }

  bucket.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, RATE_LIMIT_MAX_REQUESTS - bucket.count),
    resetAt: bucket.resetAt,
    retryAfterMs: 0
  };
}

function cleanupRateLimitBuckets(now) {
  if (RATE_LIMIT_BUCKETS.size < 5000) return;
  for (const [key, bucket] of RATE_LIMIT_BUCKETS.entries()) {
    if (bucket.resetAt <= now) RATE_LIMIT_BUCKETS.delete(key);
  }
}

function getClientKey(req) {
  const headers = req.headers || {};
  const forwardedFor = String(headers["x-forwarded-for"] || "");
  const ip = forwardedFor.split(",")[0].trim() || headers["x-real-ip"] || req.socket?.remoteAddress || "unknown";
  return `${ip}:${String(headers["user-agent"] || "unknown").slice(0, 80)}`;
}

function normalizeMode(mode) {
  const value = String(mode || "").toLowerCase();
  const allowed = new Set([
    "repair",
    "text-to-json",
    "schema-from-text",
    "explain-json",
    "mock-json",
    "regex-from-text"
  ]);
  return allowed.has(value) ? value : "repair";
}

function promptForMode(mode) {
  const base = [
    "You are a strict JSON transformation engine.",
    "Return only valid JSON. Do not include markdown, comments, code fences, explanations, or trailing text.",
    "Preserve the user's meaning and data. Do not invent unrelated fields unless the task explicitly asks for realistic examples."
  ];
  const prompts = {
    repair: {
      task: "Repair the user input into clean, valid JSON. Fix syntax while preserving the intended data.",
      message: "AI repaired JSON."
    },
    "text-to-json": {
      task: "Convert the user input into clean, valid JSON. Choose a useful object or array shape.",
      message: "AI converted text to JSON."
    },
    "schema-from-text": {
      task: "Create a JSON Schema draft 2020-12 document from the user input. If the input is sample JSON, infer the schema from it. If the input is a description, create a practical schema for that data shape.",
      message: "AI generated a JSON Schema."
    },
    "explain-json": {
      task: "Explain the JSON or JSON-like input as a valid JSON object with keys summary, topLevelType, importantFields, potentialIssues, and suggestedNextSteps. Use arrays of short strings for list fields.",
      message: "AI explained the JSON structure."
    },
    "mock-json": {
      task: "Generate realistic mock JSON from the user's schema, field list, or plain-English description. Return only the mock JSON object or array.",
      message: "AI generated mock JSON."
    },
    "regex-from-text": {
      task: "Generate a useful regular expression from the user's plain-English requirement. Respect casing, anchors, allowed characters, length rules and negative constraints exactly. If the user says lowercase, do not include uppercase character ranges. Return a JSON object with keys pattern, flags, explanation, examples, and notes. examples and notes must be arrays of short strings. The pattern value must not include slash delimiters.",
      message: "AI generated a regex."
    }
  };
  const prompt = prompts[mode] || prompts.repair;
  return {
    developer: base.join(" "),
    ...prompt
  };
}

function normalizeRegexOutput(jsonText, input) {
  const parsed = JSON.parse(jsonText);
  if (!parsed || typeof parsed !== "object" || typeof parsed.pattern !== "string") {
    return jsonText;
  }
  const wantsLowercase = /\blowercase\b/i.test(input) && !/\b(case[-\s]?insensitive|ignore case|uppercase|mixed case)\b/i.test(input);
  if (wantsLowercase) {
    parsed.flags = String(parsed.flags || "").replace(/i/g, "");
    parsed.pattern = parsed.pattern
      .replace(/\[a-zA-Z/g, "[a-z")
      .replace(/\[A-Za-z/g, "[a-z")
      .replace(/A-Z/g, "a-z");
  }
  if (parsed.examples !== undefined && !Array.isArray(parsed.examples)) {
    parsed.examples = [String(parsed.examples)];
  }
  if (parsed.notes !== undefined && !Array.isArray(parsed.notes)) {
    parsed.notes = [String(parsed.notes)];
  }
  return JSON.stringify(parsed, null, 2);
}

function getProviderConfig() {
  const provider = (process.env.AI_PROVIDER || process.env.LLM_PROVIDER || "openai").toLowerCase();
  const isDoubao = provider === "doubao" || provider === "ark" || provider === "volcengine";
  const baseUrl = (process.env.AI_BASE_URL || process.env.ARK_BASE_URL || process.env.OPENAI_BASE_URL || (isDoubao ? "https://ark.cn-beijing.volces.com/api/v3" : "https://api.openai.com/v1")).replace(/\/+$/, "");
  const apiKey = process.env.AI_API_KEY || process.env.ARK_API_KEY || process.env.OPENAI_API_KEY;
  const model = process.env.AI_MODEL || process.env.DOUBAO_CHAT_MODEL || process.env.OPENAI_MODEL || (isDoubao ? "doubao-seed-1-6-251015" : "gpt-5.5");
  return {
    provider,
    isOpenAIResponses: !isDoubao && baseUrl === "https://api.openai.com/v1",
    baseUrl,
    apiKey,
    model
  };
}

async function callModel(config, developer, user) {
  const endpoint = config.isOpenAIResponses ? `${config.baseUrl}/responses` : `${config.baseUrl}/chat/completions`;
  const body = config.isOpenAIResponses
    ? {
        model: config.model,
        input: [
          { role: "developer", content: developer },
          { role: "user", content: user }
        ],
        reasoning: { effort: "low" },
        max_output_tokens: 2000
      }
    : {
        model: config.model,
        messages: [
          { role: "system", content: developer },
          { role: "user", content: user }
        ],
        temperature: 0,
        max_tokens: 2000
      };

  const apiResponse = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify(body)
  });

  const data = await apiResponse.json();
  if (!apiResponse.ok) {
    throw new Error(data.error?.message || `${config.provider} request failed.`);
  }
  return data;
}

function extractModelText(data) {
  if (typeof data.output_text === "string") return data.output_text;
  if (data.choices?.[0]?.message?.content) return data.choices[0].message.content;
  const chunks = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (typeof content.text === "string") chunks.push(content.text);
    }
  }
  return chunks.join("");
}

function extractJson(text) {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch {
    const firstObject = cleaned.indexOf("{");
    const firstArray = cleaned.indexOf("[");
    const start =
      firstObject === -1 ? firstArray : firstArray === -1 ? firstObject : Math.min(firstObject, firstArray);
    const end = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
    if (start >= 0 && end > start) return cleaned.slice(start, end + 1);
    return cleaned;
  }
}
