const pages = document.querySelectorAll("[data-page-panel]");
const navButtons = document.querySelectorAll(".tool-button");

const toolNames = {
  image: "AI Image Generator",
  math: "Complex Math Solver",
  code: "Code Builder",
  exam: "IIT / NEET Sums Help",
  password: "Password Generator",
  guide: "Guide",
};

function showPage(pageName) {
  pages.forEach((page) => {
    page.classList.toggle("active", page.dataset.pagePanel === pageName);
  });

  navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.page === pageName);
  });

  history.replaceState(null, "", `#${pageName}`);
}

function addMessage(container, role, text) {
  const message = document.createElement("article");
  message.className = `message ${role}`;
  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  message.append(paragraph);
  container.append(message);
  container.scrollTop = container.scrollHeight;
}

function localRouteHint(text) {
  const lower = text.toLowerCase();
  const hasAny = (words) => words.some((word) => new RegExp(`\\b${word}\\b`, "i").test(lower));
  const veryHard = ["iit", "neet", "jee", "advanced", "narayana", "sri chaitanya", "olympiad"];
  const math = ["math", "algebra", "trig", "trigonometry", "calculus", "geometry", "equation", "sum", "solve"];

  if (hasAny(veryHard)) {
    return "This looks like a hard exam-style question. IIT / NEET Sums Help is the best page for a detailed solution.";
  }

  if (hasAny(math)) {
    return "This looks like a medium or above-average math question. Complex Math Solver is the best page for a clean solution path.";
  }

  return "";
}

async function askNova(mode, message) {
  const response = await fetch("/.netlify/functions/nova-chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mode, message }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "NOVA AI is not connected yet.");
  }

  return data;
}

function homeReply(text) {
  const lower = text.toLowerCase();
  const hasAny = (words) => words.some((word) => new RegExp(`\\b${word}\\b`, "i").test(lower));
  const veryHard = ["iit", "neet", "jee", "advanced", "narayana", "sri chaitanya", "olympiad"];
  const math = ["math", "algebra", "trig", "trigonometry", "calculus", "geometry", "equation", "sum", "solve"];
  const image = ["image", "picture", "photo", "poster", "logo", "art"];
  const code = ["code", "website", "app", "python", "javascript", "html", "css"];

  if (hasAny(veryHard)) {
    return "This looks like a hard exam-style question. Click IIT / NEET Sums Help so NOVA can give a detailed step-by-step solution.";
  }

  if (hasAny(math)) {
    return "This looks like a medium or above-average math question. Click Complex Math Solver for a clean solution path.";
  }

  if (hasAny(image)) {
    return "For images, click AI Image Generator and describe the exact scene, style, colors, and details you want.";
  }

  if (hasAny(code)) {
    return "For coding work, click Code Builder and explain what you want built, the language, and any features.";
  }

  return "I can help with that. In this first free version, I can guide you and route your question. The next upgrade is connecting a real AI API for live answers.";
}

function setPanelResult(id, title, text) {
  const panel = document.getElementById(id);
  panel.innerHTML = "";

  const heading = document.createElement("p");
  heading.className = "result-title";
  heading.textContent = title;

  const result = document.createElement("div");
  result.className = "result-text";
  result.textContent = text;

  panel.append(heading, result);
}

function buildToolReply(type, input) {
  if (type === "image") {
    return {
      title: "Image Prompt",
      text: `Create a high-quality image of: ${input}\n\nStyle: sharp, detailed, balanced lighting, clean composition, realistic depth, and accurate subject details.`,
    };
  }

  if (type === "math") {
    return {
      title: "Solution Plan",
      text: `Question: ${input}\n\n1. Identify the given values and what must be found.\n2. Choose the right formula or concept.\n3. Substitute carefully.\n4. Simplify step by step.\n5. Check the final answer.\n\nFor the live solver, we will connect an AI model next.`,
    };
  }

  if (type === "exam") {
    return {
      title: "Detailed Exam Approach",
      text: `Question: ${input}\n\nStep 1: Read the question and mark the topic.\nStep 2: Write all known data.\nStep 3: Choose the fastest exam method.\nStep 4: Solve without skipping logic.\nStep 5: Verify units, options, or final conclusion.\n\nThis page is prepared for IIT / NEET-level AI solving in the next upgrade.`,
    };
  }

  if (type === "guide") {
    return {
      title: "NOVA AI Guide",
      text: `You asked: ${input}\n\nUse Chat for normal questions.\nUse Complex Math Solver for medium math.\nUse IIT / NEET Sums Help for difficult exam questions.\nUse Code Builder for programming.\nUse AI Image Generator for pictures.\nUse Password Generator for strong passwords.`,
    };
  }

  if (type === "password") {
    return {
      title: "Password Advice",
      text: `For "${input}", use a long password with uppercase, lowercase, numbers, and symbols. Avoid names, birthdays, phone numbers, and school names.`,
    };
  }

  return {
    title: "Code Draft",
    text: `// Request: ${input}
function novaAiFeature() {
  return "This is where NOVA AI will generate exact code after the AI API is connected.";
}

console.log(novaAiFeature());`,
  };
}

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
  const password = Array.from({ length: 18 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  document.getElementById("password-output").textContent = password;
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => showPage(button.dataset.page));
});

document.querySelectorAll(".chat-form").forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = form.elements.message;
    const text = input.value.trim();

    if (!text) return;

    const type = form.dataset.chat;

    if (type === "home") {
      addMessage(document.getElementById("home-messages"), "user", text);
      addMessage(document.getElementById("home-messages"), "assistant", "Thinking...");
      const messages = document.querySelectorAll("#home-messages .assistant p");
      const pending = messages[messages.length - 1];

      try {
        const data = await askNova(type, text);
        const hint = localRouteHint(text);
        pending.textContent = hint ? `${hint}\n\n${data.reply}` : data.reply;
      } catch (error) {
        pending.textContent = `${homeReply(text)}\n\nSetup note: ${error.message}`;
      }
    } else if (type === "code") {
      document.getElementById("code-output").textContent = "NOVA AI is building...";
      try {
        const data = await askNova(type, text);
        document.getElementById("code-output").textContent = data.reply;
      } catch (error) {
        const reply = buildToolReply(type, text);
        document.getElementById("code-output").textContent = `${reply.text}\n\nSetup note: ${error.message}`;
      }
    } else {
      setPanelResult(`${type}-output`, "NOVA AI", "Thinking...");
      try {
        const data = await askNova(type, text);
        setPanelResult(`${type}-output`, toolNames[type] || "NOVA AI", data.reply);

        if (type === "image" && data.image) {
          const panel = document.getElementById("image-output");
          const image = document.createElement("img");
          image.alt = text;
          image.src = `data:image/png;base64,${data.image}`;
          image.className = "generated-image";
          panel.append(image);
        }
      } catch (error) {
        const reply = buildToolReply(type, text);
        setPanelResult(`${type}-output`, reply.title, `${reply.text}\n\nSetup note: ${error.message}`);
      }
    }

    input.value = "";
  });
});

document.getElementById("generate-password").addEventListener("click", generatePassword);

const initialPage = location.hash.replace("#", "") || "home";
showPage(toolNames[initialPage] || initialPage === "home" ? initialPage : "home");
