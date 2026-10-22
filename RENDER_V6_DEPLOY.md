# Update your existing NOVA Render deployment to v6

No need to create a new Render service. The existing `nova-academy-demo.onrender.com` address can continue to be used if you replace the source files in its connected GitHub repository.

1. **Back up the GitHub repo** or create a branch/tag before updating.
2. Download and unzip `NOVA_Academy_OpenAI_Unified_v6_Render.zip`. Upload its files to the **top level** of the same private GitHub repo (not into a nested folder). Replace earlier `server.js`, `invention-lab.js`, `pilot.js`, `render.yaml` and related files.
3. Confirm `server.js`, `package.json`, `render.yaml`, `invention-lab.html`, `invention-lab.js`, and `invention-lab.css` are at the project root.
4. In Render, use **Runtime: Node**, **Build command: `npm install --omit=dev`**, **Start command: `npm start`**. Set `HOST=0.0.0.0` and a strong `DEMO_ACCESS_PASSWORD`.
5. **Revoke the exposed API key.** In **Render → Environment**, replace `OPENAI_API_KEY` with a newly generated secret. Use the other settings in `OPENAI_SETUP_V6.md`. The image feature is disabled by default.
6. Render will redeploy after your GitHub commit if auto-deploy is enabled. Otherwise choose **Manual Deploy → Deploy latest commit**. Wait until Render reports **Live**.
7. Visit your existing Render URL, enter username `demo` and your configured password. Open `/owner-console.html` and run the OpenAI check. Then test the Class 3 lesson from `/invention-lab.html`.
8. Test the AI teacher response and a short adult voice recording. Only enable optional live images when you intend to pay for real generation.

## Troubleshooting

- **Authentication prompt:** username is `demo`, password is whatever is currently set as `DEMO_ACCESS_PASSWORD` in Render. This is not the OpenAI API key.
- **Service fails to start:** check Render logs; make sure Node.js 22 is used, and that `DEMO_ACCESS_PASSWORD` exists.
- **AI status says missing:** add `OPENAI_API_KEY` in Render Environment, save, redeploy.
- **Owner check says rejected:** the new key might lack API billing, access to the configured model, or permissions. Rotate it if compromised.
- **Voice sounds robotic:** the browser synthesis fallback is probably playing. Check actual `/api/director-voice`/`/api/narration` operation and account billing.
- **AI image button disabled:** set `ENABLE_LIVE_IMAGES=true` in Render, redeploy, and reload the classroom. Actual generation requires explicit click confirmation, has a two-image daily allowance per evaluator, and incurs API costs.
- **Old page remains:** confirm the latest commit is deployed and refresh without cache (Ctrl+Shift+R).

Do not reuse the previously shared key, add it to `.env.example`, store it in frontend JavaScript, or send screenshots showing secret values.
