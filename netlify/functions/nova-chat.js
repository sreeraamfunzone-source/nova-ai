const MODE_INSTRUCTIONS = {
  home: `You are NOVA AI, a friendly public AI assistant.
Answer casual and simple questions directly.
Creator facts: NOVA AI was founded/created by D.Sreeraam, a student. Tools used: Codex. Languages used: HTML, CSS, and JavaScript. Date created: 18 June 2026.
If users ask who created NOVA AI, who founded NOVA AI, who owns NOVA AI, or similar questions, answer clearly: the founder/creator of NOVA AI is D.Sreeraam.
Use the live context supplied by the server for today's date, day, time, weather, and known current facts.
For current events or facts not present in the live context, be honest that you may need verification instead of pretending.
If the user asks medium or above-average math, answer briefly and also suggest Complex Math Solver.
If the user asks very hard IIT, JEE, NEET, Narayana, or Sri Chaitanya style questions, suggest IIT / NEET Sums Help.`,
  image: `You are NOVA AI's AI Image Generator.
Create one highly detailed image prompt for the user's request.
Return a polished prompt that can be used directly by an image model.
Include subject, setting, style, lighting, camera/framing, colors, materials, mood, and quality details.
Do not say you cannot generate images. Do not include long explanations.`,
  math: `You are NOVA AI's Complex Math Solver.
Solve algebra, trigonometry, calculus basics, geometry, and story sums step by step. Show formulas and explain clearly.`,
  code: `You are NOVA AI's Code Builder.
Build correct, clean code for the user. Include filenames when useful and explain how to run it briefly.`,
  exam: `You are NOVA AI's IIT / NEET Sums Help.
Give detailed step-by-step exam solutions. Explain the concept, shortcut if useful, and final answer clearly.`,
  password: `You are NOVA AI's Password Generator helper.
Do not ask for private details. Explain password safety and suggest strong password patterns.`,
  guide: `You are NOVA AI's Guide.
Answer the user's guide question directly and teach them how to use NOVA AI.
Explain which NOVA AI tool to use and why.
Keep the answer practical, friendly, and step-by-step when helpful.`,
};

const CREATOR_CONTEXT = `NOVA AI creator details:
- Founder/Creator: D.Sreeraam
- Work: Student
- Tools used: Codex
- Languages used: HTML, CSS, JavaScript
- Date created: 18 June 2026`;

const KNOWN_CURRENT_FACTS = `Known current facts available to NOVA AI:
- As of 19 June 2026, the current Chief Minister of Tamil Nadu is C. Joseph Vijay, also known as Thalapathy Vijay.`;

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

function getIndiaDateTimeContext() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZoneName: "short",
  }).formatToParts(now);

  const value = (type) => parts.find((part) => part.type === type)?.value || "";
  const formatted = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "medium",
  }).format(now);

  return {
    formatted,
    weekday: value("weekday"),
    date: `${value("day")} ${value("month")} ${value("year")}`,
    time: `${value("hour")}:${value("minute")}:${value("second")} ${value("dayPeriod")} IST`,
    iso: now.toISOString(),
  };
}

function directFounderAnswer(message) {
  if (/\b(founder|creator|created|made|owner|who\s+made|who\s+created|who\s+founded)\b/i.test(message)) {
    return "The founder and creator of NOVA AI is D.Sreeraam. He is a student, and NOVA AI was built using Codex with HTML, CSS, and JavaScript. NOVA AI was created on 18 June 2026.";
  }
  return null;
}

function directDateTimeAnswer(message) {
  const context = getIndiaDateTimeContext();
  const asksDate = /\b(date|today|day|weekday)\b/i.test(message);
  const asksTime = /\b(time|clock)\b/i.test(message);

  if (asksDate && asksTime) {
    return `Today is ${context.weekday}, ${context.date}. The current time in India is ${context.time}.`;
  }

  if (asksDate) {
    return `Today is ${context.weekday}, ${context.date}.`;
  }

  if (asksTime) {
    return `The current time in India is ${context.time}.`;
  }

  return null;
}

function directKnownCurrentFact(message) {
  if (/\b(tamil\s*nadu|tn)\b/i.test(message) && /\b(cm|chief\s*minister)\b/i.test(message)) {
    return "As of 19 June 2026, the current Chief Minister of Tamil Nadu is C. Joseph Vijay, also known as Thalapathy Vijay.";
  }
  return null;
}

function extractWeatherPlace(message) {
  const match =
    message.match(/\bweather\s+(?:in|at|for)\s+([a-zA-Z .'-]{2,60})/i) ||
    message.match(/\btemperature\s+(?:in|at|for)\s+([a-zA-Z .'-]{2,60})/i);

  if (!match) return null;
  return match[1].replace(/[?.!,]+$/g, "").trim();
}

function weatherCodeText(code) {
  const codes = {
    0: "clear sky",
    1: "mainly clear",
    2: "partly cloudy",
    3: "overcast",
    45: "fog",
    48: "depositing rime fog",
    51: "light drizzle",
    53: "moderate drizzle",
    55: "dense drizzle",
    61: "slight rain",
    63: "moderate rain",
    65: "heavy rain",
    71: "slight snow",
    73: "moderate snow",
    75: "heavy snow",
    80: "slight rain showers",
    81: "moderate rain showers",
    82: "violent rain showers",
    95: "thunderstorm",
  };
  return codes[code] || "weather conditions";
}

async function directWeatherAnswer(message) {
  if (!/\b(weather|temperature|rain|forecast)\b/i.test(message)) return null;

  const place = extractWeatherPlace(message);
  if (!place) {
    return "Tell me the city or place name, for example: weather in Chennai.";
  }

  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1&language=en&format=json`;
  const geoResponse = await fetch(geoUrl);
  const geoData = await geoResponse.json();
  const location = geoData.results?.[0];

  if (!location) {
    return `I could not find weather data for "${place}". Try a nearby city name.`;
  }

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
  const weatherResponse = await fetch(weatherUrl);
  const weatherData = await weatherResponse.json();
  const current = weatherData.current;

  if (!current) {
    return `I found ${location.name}, but could not load current weather right now.`;
  }

  return `Current weather in ${location.name}${location.admin1 ? `, ${location.admin1}` : ""}: ${current.temperature_2m}°C, ${weatherCodeText(current.weather_code)}, humidity ${current.relative_humidity_2m}%, wind ${current.wind_speed_10m} km/h.`;
}

function buildLiveContext() {
  const time = getIndiaDateTimeContext();
  return `${CREATOR_CONTEXT}

Live server context:
- Current India date/time: ${time.formatted}
- Current weekday: ${time.weekday}
- Current date: ${time.date}
- Current time in India: ${time.time}
- Current UTC timestamp: ${time.iso}

${KNOWN_CURRENT_FACTS}`;
}

function normalizeImagePrompt(text, original) {
  return text
    .replace(/^image prompt:\s*/i, "")
    .replace(/^prompt:\s*/i, "")
    .trim() || `High-quality detailed image of ${original}, sharp focus, balanced lighting, clean composition.`;
}

function extractGeminiText(data) {
  const parts = [];
  for (const candidate of data.candidates || []) {
    for (const part of candidate.content?.parts || []) {
      if (part.text) parts.push(part.text);
    }
  }
  return parts.join("\n").trim();
}

async function askGemini(mode, message, instructions) {
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: instructions }],
        },
        contents: [
          {
            parts: [{ text: message }],
          },
        ],
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Gemini API request failed.");
  }

  const imageNote =
    mode === "image"
      ? "\n\nNote: This free Gemini setup creates a strong image prompt. Direct image generation can be added later with an image model/provider."
      : "";

  return {
    reply: `${extractGeminiText(data) || "NOVA AI finished, but no text response was returned."}${imageNote}`,
    image: null,
  };
}

async function askGroq(message, instructions, mode) {
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: `${instructions}

${buildLiveContext()}`,
        },
        {
          role: "user",
          content: message,
        },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Groq API request failed.");
  }

  return {
    reply:
      mode === "image"
        ? normalizeImagePrompt(data.choices?.[0]?.message?.content?.trim() || "", message)
        : data.choices?.[0]?.message?.content?.trim() || "NOVA AI finished, but no text response was returned.",
    image: null,
  };
}

async function askOpenAI(mode, message, instructions) {
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
    throw new Error(data.error?.message || "OpenAI API request failed.");
  }

  return {
    reply: extractText(data) || "NOVA AI finished, but no text response was returned.",
    image: extractImage(data),
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Use POST." });
  }

  if (!process.env.GROQ_API_KEY && !process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
    return json(500, {
      error: "NOVA AI is not connected yet. Add GROQ_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY in your hosting environment variables.",
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

  try {
    if (mode === "home") {
      const directAnswer =
        directFounderAnswer(message) ||
        directDateTimeAnswer(message) ||
        directKnownCurrentFact(message) ||
        (await directWeatherAnswer(message));

      if (directAnswer) {
        return json(200, { reply: directAnswer, image: null });
      }
    }

    let result;
    if (process.env.GROQ_API_KEY) {
      result = await askGroq(message, instructions, mode);
    } else if (process.env.GEMINI_API_KEY) {
      result = await askGemini(mode, message, instructions);
    } else {
      result = await askOpenAI(mode, message, instructions);
    }

    return json(200, result);
  } catch (error) {
    return json(500, {
      error: error.message || "NOVA AI could not reach the AI API. Check hosting, internet, and API key setup.",
    });
  }
};
