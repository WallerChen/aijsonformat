const MAX_INPUT_CHARS = 12000;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const config = getProviderConfig();
  if (!config.apiKey) {
    return res.status(501).json({ error: "AI is not configured. Set AI_API_KEY, ARK_API_KEY, or OPENAI_API_KEY in Vercel." });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const mode = normalizeMode(body.mode);
  const input = String(body.input || "").slice(0, MAX_INPUT_CHARS);
  const localRepair = String(body.localRepair || "").slice(0, MAX_INPUT_CHARS);

  if (!input.trim()) {
    return res.status(400).json({ error: "Input is required." });
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
    JSON.parse(jsonText);

    return res.status(200).json({
      output: jsonText,
      message: prompt.message
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "AI JSON processing failed." });
  }
};

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
      task: "Generate a useful regular expression from the user's plain-English requirement. Return a JSON object with keys pattern, flags, explanation, examples, and notes. The pattern value must not include slash delimiters.",
      message: "AI generated a regex."
    }
  };
  const prompt = prompts[mode] || prompts.repair;
  return {
    developer: base.join(" "),
    ...prompt
  };
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
