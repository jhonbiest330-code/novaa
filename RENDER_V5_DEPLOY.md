# Upgrade your existing NOVA Academy Render service to v5

You **do not** need to create another Render account or a second web service.

## 1. Backup

Download the current working GitHub repository as a ZIP or create a git tag before replacing the project files. Keep credentials in Render, not in your repository.

## 2. Upload v5 to the SAME GitHub repository

Extract `NOVA_Academy_Interactive_Teacher_v5_Render.zip`. Upload the files at the repository root (where `server.js`, `package.json`, `index.html`, `render.yaml`, `invention-lab.html`, `classroom-director.js`, and `classroom-director.css` are visible). Delete replaced obsolete files only if you know they are no longer used. Preserve current project history in Git.

## 3. Confirm your Render web service settings

Open your service in https://dashboard.render.com . In Settings verify:

- Runtime: **Node**
- Root Directory: repository root (blank or `.`)
- Build Command: `npm install --omit=dev`
- Start Command: `npm start`
- Health Check Path: `/healthz` (optional)
- `HOST`: `0.0.0.0`
- `NODE_VERSION`: `22` or another currently supported Node 20+ version

## 4. Keep/set private Environment variables

In **Environment**, set:

| Name | Value |
|---|---|
| `DEMO_ACCESS_PASSWORD` | Your existing strong password or a fresh strong password |
| `OPENAI_API_KEY` | A NEW private OpenAI key (revoke any key shared in chat) |
| `HOST` | `0.0.0.0` |
| `OPENAI_TTS_MODEL` | `gpt-4o-mini-tts` (optional) |
| `OPENAI_STT_MODEL` | `gpt-4o-mini-transcribe` (optional) |
| `OPENAI_TEXT_MODEL` | `gpt-5-mini` (optional) |
| `OPENAI_REALTIME_MODEL` | `gpt-realtime-2.1` (optional, used by the separate older Realtime mode) |

Use **Save, deploy** or Save, rebuild and deploy. NEVER put the API key into files you upload or share. OpenAI API charges may apply; set account-level spending controls.

## 5. Deploy

If Render does not automatically deploy the new GitHub commit, use **Manual Deploy → Deploy latest commit**. Wait for the service status to say Live. Visit your existing `https://<your-service>.onrender.com/` address. The browser may show HTTP Basic Authentication:

- Username: `demo`
- Password: `DEMO_ACCESS_PASSWORD` value from Render

The homepage is now the upgraded Class 3 Invention Lab. The director panel opens after you start the lesson.

## 6. Demonstrate safely

Tap `ENTER THE INVENTION LAB` → edit/skip previous-lesson recap → let NOVA call fictional students from its sample roster → role-play answers → let the class ask questions → use `No more questions → continue`. Go through the main stage activities; incomplete activities require an intentional teacher override. Finish with the group quiz and project report.

For the best voice quality, on Chrome/Edge choose `Marin` inside Class roster & teacher settings and allow audio playback. The browser voice fallback can be noticeably robotic and is not equivalent to OpenAI premium speech.

To test spoken Q&A: configure API first, deploy over HTTPS, then tap `Speak answer` in the director panel. The microphone is OFF before that tap. Each role-play answer is a short recording (up to 15 seconds). Voice responsiveness depends on server/network latency; it is not zero-latency full-duplex.

## 7. Before presenting to a paying school

Confirm premium voice actually works, test microphone permissions, test quiz with known correct/incorrect selections, test pause and emergency stop, ensure private passwords, check project spending limits, rehearse full-screen projector navigation and review your local laws and child-data restrictions. This version is solely an adult-facing evaluation: **do not enter real student names or record real children's voices in the demo.**

### Troubleshooting

- **401 sign-in:** use `demo` and the password in `DEMO_ACCESS_PASSWORD`. Browser may cache Basic Auth: use a private window after changing credentials.
- **Missing AI narration:** key may be absent, revoked, or billing unavailable. Check Render Logs and OpenAI usage/settings. Scripted lesson should still work.
- **Microphone fails:** use HTTPS and Chrome/Edge, grant microphone permission; typed answers work as backup.
- **Voice too slow:** short answers cost/latency depend on model and network. Try prepared fallback for principal showcase; do not promise instantaneous replies.
- **Page not updated:** confirm same GitHub branch and most recent deployed commit, then hard-refresh.
- **Render fails to bind port:** verify `HOST=0.0.0.0`, `npm start`, and use Render's `PORT` environment variable as supplied automatically.
