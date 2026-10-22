# NOVA Academy: School Sales Pilot Edition

**Read this before deploying or selling.**

## What this package IS

A deployable private adult-facing evaluation system for NOVA Academy. It includes:
- A polished school buyer portal at `/school-pilot.html`.
- A functional guided classroom and an OpenAI Realtime voice integration *path* at `/live-classroom.html`. Voice requires your own newly issued private API key and has not been tested end-to-end here with a live paid model.
- A curriculum explorer and fictional dashboards at `/`.
- An owner-only sales console at `/owner-console.html` for preparing adult demo credentials and modeling potential pricing.
- Separate optional adult evaluator passwords configured through the hosting provider.
- A server-held API key, per-account rate limits and a 15-minute browser voice-session cut-off. In-memory limits can reset on restart and are NOT a production billing safeguard.
- Synthetic student and school content. No real minors, real learning records, real payment processing, or data isolation.

## What this package IS NOT

**Not yet a finished commercial LMS/edtech SaaS for children.** It does not have persistent real users, proper customer management, school data separation, full curriculum authoring for all 128 lessons, parent consent, audit-ready safety safeguards, subscriptions or verified live speech performance. Do not promise or invoice for these absent features, and do not allow children to use this version.

## Start with the easiest path

- **Offline practice:** Open `NOVA_Enhanced_Classroom_Preview.html` in a browser. It is a silent guided demo; no server required.
- **Private adult demo online:** Follow `DEPLOY_FOR_BEGINNERS.md` and host the Node app on Render.
- **Production student service:** See `PRODUCTION_READINESS.md`. Deployment by itself does not turn a demo into a finished service.

## Included pages

| Route | Audience | What it does |
|---|---|---|
| `/school-pilot.html` | Adult school evaluator | Product tour, demo navigation, truthful FAQ |
| `/live-classroom.html` | Adult evaluator | Interactive lesson + optional live OpenAI Realtime voice |
| `/` | Adult evaluator | Curriculum catalog, creative studios, dashboard previews |
| `/owner-console.html` | Owner only | Adult trial-access configuration and unit economics |
| `/healthz` | Hosting provider | No-secrets server health response |

## Run locally on your own computer (if you want)

1. Install Node.js 22 or newer.
2. Extract this ZIP into a folder.
3. Open a terminal *inside the extracted folder* and run `npm start`.
4. Open `http://localhost:3000/school-pilot.html` (the server uses 127.0.0.1 locally).
5. Without an API key, interactive guided lessons still work. Real OpenAI voice remains disabled.

No `npm install` is required for the bundled server because it uses only Node's built-in modules.

## Security

- A key that was previously pasted into a chat was exposed. **Revoke that key and create a new one** before configuring OpenAI.
- Put the new key **only** in Render's Environment settings, under `OPENAI_API_KEY`. Never paste it into HTML, JavaScript, ZIP archives or a public repository.
- Use a long owner `DEMO_ACCESS_PASSWORD`, and unique demo credentials for each adult customer.
- Once real students are involved, this architecture is insufficient. A production security/privacy review is mandatory.
