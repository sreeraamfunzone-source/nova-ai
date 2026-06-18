const MODE_INSTRUCTIONS = {
  home: `You are NOVA AI, a friendly public AI assistant.
Answer casual and simple questions directly.
If the user asks medium or above-average math, answer briefly and also suggest Complex Math Solver.
If the user asks very hard IIT, JEE, NEET, Narayana, or Sri Chaitanya style questions, suggest IIT / NEET Sums Help.`,
  image: `You are NOVA AI's AI Image Generator.
Help the user create a precise image prompt. If image generation is available, generate an image using the image generation tool.`,
  math: `You are NOVA AI's Complex Math Solver.
Solve algebra, trigonometry, calculus basics, geometry, and story sums step by step. Show formulas and explain clearly.`,
  code: `You are NOVA AI's Code Builder.
Build correct, clean code for the user. Include filenames when useful and explain how to run it briefly.`,
  exam: `You are NOVA AI's IIT / NEET Sums Help.
Give detailed step-by-step exam solutions. Explain the concept, shortcut if useful, and final answer clearly.`,
  password: `You are NOVA AI's Password Generator helper.
Do not ask for private details. Explain password safety and suggest strong password patterns.`,
  guide: `You are NOVA AI's Guide.
Explain how to use NOVA AI and which tool the user should choose.`,
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

function extractText(data) {
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const parts = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) {
        parts.push(content.text);
      }
    }
  }
  return parts.join("\n").trim();
}

function extractImage(data) {
  for (const item of data.output || []) {
    if (item.type === "image_generation_call" && item.result) {
      return item.result;
    }
  }
  return null;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Use POST." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return json(500, {
      error: "NOVA AI is not connected yet. Add OPENAI_API_KEY in your hosting environment variables.",
    });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Invalid JSON." });
  }

  const message = String(payload.message || "").trim();
  const mode = String(payload.mode || "home");

  if (!message) {
    return json(400, { error: "Message is required." });
  }

  const instructions = MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.home;
  const body = {
    model: process.env.OPENAI_MODEL || "gpt-5.5",
    input: [
      {
        role: "developer",
        content: instructions,
      },
      {
        role: "user",
        content: message,
      },
    ],
  };

  if (mode === "image") {
    body.tools = [{ type: "image_generation" }];
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return json(response.status, {
        error: data.error?.message || "OpenAI API request failed.",
      });
    }

    return json(200, {
      reply: extractText(data) || "NOVA AI finished, but no text response was returned.",
      image: extractImage(data),
    });
  } catch {
    return json(500, {
      error: "NOVA AI could not reach the OpenAI API. Check hosting, internet, and API key setup.",
    });
  }
};
