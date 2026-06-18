# NOVA AI

NOVA AI is a public AI assistant website with pages for chat, image generation, math solving, code building, IIT / NEET help, passwords, and a guide.

## Free Hosting Path

Use Netlify free hosting for the website and serverless API function.

1. Create a GitHub repository and upload this folder.
2. Create a Netlify site from that GitHub repository.
3. In Netlify, open Site configuration, then Environment variables.
4. Add `OPENAI_API_KEY` with your OpenAI API key.
5. Optional: add `OPENAI_MODEL` if you want to choose a different model.
6. Deploy the site.

## Important

Do not put the OpenAI API key in `script.js`, `index.html`, or any browser file. It must stay in Netlify environment variables so visitors cannot see or steal it.

The website hosting can be free. OpenAI API usage may cost money depending on how many people use NOVA AI and which model you choose.
