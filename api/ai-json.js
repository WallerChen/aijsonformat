const MAX_INPUT_CHARS = 12000;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(501).json({ error: "AI is not configured. Set OPENAI_API_KEY in Vercel." });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const mode = body.mode === "text-to-json" ? "text-to-json" : "repair";
  const input = String(body.input || "").slice(0, MAX_INPUT_CHARS);
  const localRepair = String(body.localRepair || "").slice(0, MAX_INPUT_CHARS);

  if (!input.trim()) {
    return res.status(400).json({ error: "Input is required." });
  }

  const developer = [
    "You are a strict JSON transformation engine.",
    "Return only valid JSON. Do not include markdown, comments, code fences, explanations, or trailing text.",
    "Preserve the user's meaning and data. Do not invent unrelated fields."
  ].join(" ");

  const task =
    mode === "text-to-json"
      ? "Convert the user input into clean, valid JSON. Choose a useful object or array shape."
      : "Repair the user input into clean, valid JSON. Fix syntax while preserving the intended data.";

  const user = [
    task,
    localRepair ? `Best local repair attempt:\n${localRepair}` : "",
    `User input:\n${input}`
  ].filter(Boolean).join("\n\n");

  try {
    const apiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.5",
        input: [
          { role: "developer", content: developer },
          { role: "user", content: user }
        ],
        reasoning: { effort: "low" },
        max_output_tokens: 2000
      })
    });

    const data = await apiResponse.json();
    if (!apiResponse.ok) {
      return res.status(502).json({ error: data.error?.message || "OpenAI request failed." });
    }

    const text = extractResponseText(data).trim();
    const jsonText = extractJson(text);
    JSON.parse(jsonText);

    return res.status(200).json({
      output: jsonText,
      message: mode === "text-to-json" ? "AI converted text to JSON." : "AI repaired JSON."
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "AI JSON processing failed." });
  }
};

function extractResponseText(data) {
  if (typeof data.output_text === "string") return data.output_text;
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
