# NOVA AI

NOVA AI is a static, Netlify-ready AI workspace with chat, AI image prompts, math and exam help, a Code Builder, password generation, live market/weather snapshots, voice dictation, sign-in-gated History, section memory, and a subscription-ready Upgrade page.

## What is included

- **Market:** live Gold, Silver, S&P 500, NIFTY 50, Reliance, TCS, Apple, NVIDIA, Bitcoin, India time and city weather snapshots through a Netlify function.
- **History and section memory:** recent requests and up to ten messages per tool are kept in the visitor's browser. History is available only after signing in and is grouped by date and section.
- **Guest limits:** Chat 60, Image Generator 10, Math 20, Code Builder 20, IIT/NEET 15; Password and Guide are unlimited. Signed-in FREE users have unlimited non-image tools and 100 image uses per one-hour window.
- **Plans:** disabled Coming Soon cards for NOVA AI Go (₹299/month), Plus (₹1,499/month), and Pro (₹2,999/month). The payment/autopay controls are intentionally disabled.
- **Voice:** browser speech-to-text in supported Chromium browsers.
- **Code Builder:** language and build-type selectors, code copy, and file download.
- **Guide:** credits Codex and ChatGPT.

## Deploy to Netlify

1. Create a GitHub repository and push this folder.
2. In Netlify, choose **Add new site → Import an existing project**, then select the repository.
3. Netlify reads `netlify.toml`: publish directory is the repository root and functions are in `netlify/functions`.
4. Add one AI key in **Site configuration → Environment variables**:
   - `GROQ_API_KEY` (default model: `openai/gpt-oss-120b`; override with `GROQ_MODEL` if needed)
   - `GEMINI_API_KEY`
   - `OPENAI_API_KEY`
5. Optionally set `GROQ_MODEL`, `GEMINI_MODEL`, or `OPENAI_MODEL`, then deploy.

## Important production notes

- Never place AI keys in browser files.
- The Google/Gmail/GitHub sign-in screen is a local preview only. For real sign-in, usage enforcement, plans, and history sync, add OAuth, a server-side database, payment provider, and rate limiting.
- Market data is informational only and is not financial advice.
