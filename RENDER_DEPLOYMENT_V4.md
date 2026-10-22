# Deploy NOVA Academy v4 on Render (beginner instructions)

The package is a **complete Node.js web service**. It requires no build tools, database or paid dependency to launch the interactive evaluation edition.

## If you already have NOVA hosted on Render

1. Download `NOVA_Academy_Class3_Render_v4.zip`, extract it on your PC.
2. Open the **GitHub repository connected to your existing Render service**. Upload/commit the contents of the extracted project **into the repository root**, not the ZIP itself. Keep the `server.js`, `package.json`, `render.yaml`, `invention-lab.html`, `invention-lab.css`, `invention-lab.js` and `narration.json` side by side. The package intentionally contains the older dashboard and sales portal as well.
3. In Render, open your existing web service. It may automatically deploy the new GitHub commit. Otherwise, choose **Manual Deploy → Deploy latest commit**.
4. Open **Environment** and verify:
   - `HOST` = `0.0.0.0` (this is required on Render)
   - `DEMO_ACCESS_PASSWORD` = a strong private password you create
   - `OPENAI_API_KEY` = **NEW private key** (optional for first visual demo, required for professional narration/live AI)
   - `OPENAI_REALTIME_MODEL` = `gpt-realtime-2.1` (default)
   - `MAX_DAILY_VOICE_SESSIONS` = `12` (adjust based on budget)
   - `NODE_VERSION` = `22`
5. Save your settings, deploy, then open your **existing Render URL**. The new Invention Lab loads at `/` after browser Basic Auth. Username: `demo`. Password: your `DEMO_ACCESS_PASSWORD` value.
6. First test all activity scenes in silent/normal mode. Next, click **Enable narration** or reconnect professional narration after confirming your new API key. Finally, test **Connect live AI** with an adult tester in Chrome/Edge, explicitly enabling the microphone. You should see browser microphone permission and hear NOVA responding.

If GitHub's web interface becomes confusing for replacing files, clone the repository using GitHub Desktop, copy the extracted project files into the local repository folder, commit and push.

## If you are creating a new Render service

1. Create a private GitHub repo containing the extracted project at the root.
2. Render dashboard → **New → Web Service** → connect that repo, runtime **Node**.
3. Build command: `npm install --omit=dev` (there are no third-party runtime dependencies).
4. Start command: `npm start`.
5. Add the environment variables above, then deploy. Render supplies HTTPS and a shareable URL.

You can also create a Render **Blueprint** from `render.yaml`. If a Render service with the previous name already exists, adding a second Blueprint might create a **second** service rather than replace the old one. For an existing site, updating its current GitHub repo is simpler.

## How to demonstrate to a school

1. Give the principal a separate adult demo username/password created through the owner console and added to `DEMO_ACCOUNTS_JSON` in Render. Never share your owner's password. The earlier owner console stores draft credentials **in the browser only until you copy them to Render**.
2. Direct them to your site root `/`. Principal showcase takes roughly 8–12 minutes depending on participation; the full lesson has all 13 scenes.
3. Present the prepared illustration, classroom choices and sample reports as demos, not already-proven results.
4. Do not provide accounts for real children or accept their personal data on this app.

## Common deployment problems

- **Browser Sign In pop-up:** username is `demo`, password is `DEMO_ACCESS_PASSWORD`, never the API key.
- **502/503 on narration or voice:** set a new OpenAI API key in Render. Your OpenAI project must have access/billing for the appropriate model. While disconnected, browser fallback voice and interactive content should still work.
- **404 for CSS/JS:** check extracted files are at the GitHub repo root, and the deployed commit includes `invention-lab.css` and `invention-lab.js`.
- **Render build/deploy fails:** check Build Logs. Node v22 or newer required. `HOST` must be `0.0.0.0` on Render.
- **Old homepage appears:** check the latest deploy succeeded, refresh with Ctrl+Shift+R, verify commit has new `index.html`.
- **Microphone does not work:** use HTTPS, allow browser permission and click the explicit microphone button. You can still type questions in the teacher console.
- **Animations too intense:** operating system reduced-motion accessibility setting minimizes unnecessary movement.

## Costs and limits

This adult evaluation edition can use Render hosting plus billed OpenAI APIs. Professional narration, text replies, and live audio sessions **all incur API usage**, so use service/API budgets and quotas. Rates and hosting plans change; review current Render and OpenAI pricing. The in-memory session/rate limits reset if the Node service restarts. Before production, use durable centralized quotas and billing controls.
