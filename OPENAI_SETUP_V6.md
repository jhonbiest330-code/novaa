# NOVA v6: OpenAI setup for Render (beginner steps)

## Very important: rotate the exposed key

Any OpenAI key pasted in a chat, screenshot, repository, shared document, or code file should be treated as exposed. **Revoke that key at https://platform.openai.com/api-keys**, create a new restricted project key, and **do not paste the replacement into ChatGPT**. NOVA v6 intentionally does not contain a real key.

## Connect OpenAI in Render

1. Open https://dashboard.render.com and select the existing NOVA Academy **Web Service**.
2. Open **Environment**. Add or update the keys below in Render itself, not in GitHub.
3. Save and redeploy. The website can keep its existing `onrender.com` URL.
4. Sign in as `demo` using the `DEMO_ACCESS_PASSWORD` value you created.
5. Visit `/owner-console.html`. Under **AI connection & capabilities**, click **Verify key and text model**. This checks credentials and text-model availability without displaying secrets. It does not verify voice quality.
6. Open `/invention-lab.html`, launch the Class 3 demonstration, then press **AI TEACHER LIVE**. This guided teaching route now uses OpenAI TTS, response generation and transcription when configured. Check the sound in the browser, with the microphone off by default.
7. For spontaneous live audio conversation, press **Connect live AI**, explicitly enable the microphone and test with an adult role-playing a fictional student. The app must be running over HTTPS. Stop the microphone immediately after testing.

| Render environment key | Recommended setting | Role |
|---|---|---|
| `OPENAI_API_KEY` | New private replacement key | Server-side access for all API features |
| `OPENAI_TEXT_MODEL` | `gpt-5-mini` | Student-answer coaching and Q&A |
| `OPENAI_TTS_MODEL` | `gpt-4o-mini-tts` | Teacher-like narration and feedback audio |
| `OPENAI_STT_MODEL` | `gpt-4o-mini-transcribe` | Adult opt-in microphone transcription |
| `OPENAI_REALTIME_MODEL` | `gpt-realtime` | Optional live two-way speech |
| `OPENAI_DEFAULT_VOICE` | `marin` | Default teacher narration voice |
| `OPENAI_IMAGE_MODEL` | `gpt-image-1-mini` | Optional real visual concept illustration |
| `ENABLE_LIVE_IMAGES` | `false` | Change to `true` only when you want paid images |
| `DEMO_ACCESS_PASSWORD` | Strong unique password | Owner-only Basic login (`demo`) |
| `HOST` | `0.0.0.0` | Bind on Render |

The app also supports separate adult evaluator accounts through `DEMO_ACCOUNTS_JSON`. Do not input actual student names or classroom recordings into this sales-demo build.

## How the integrated OpenAI features work

| Feature | User action | Server route | What to expect |
|---|---|---|---|
| Narration | Start lesson with narration | `/api/narration?scene=…` | Professional voice for approved lesson script; caches approved scene audio in server memory |
| Teacher dialogue | Open **AI TEACHER LIVE**, role-play an answer | `/api/director-reply` | Contextual, short teaching feedback |
| Voice for dialogue | Speak back as NOVA | `/api/director-voice` | Voice selected in classroom director |
| Microphone / spoken answer | Tap microphone to record, tap to stop | `/api/director-transcribe` | Transcription used to drive a teaching turn; no recording is intentionally saved |
| Typed question | Ask NOVA | `/api/ask` | Constrained response about the current scene |
| Live audio conversation | Connect live AI | `/api/realtime-token` then browser WebRTC | Ephemeral credential; main key stays on Render |
| AI invention image | Adult confirms *Generate an actual AI concept* | `/api/invention-image` | Real generated image, visibly labeled, up to 2 requests per evaluator daily |
| Connectivity diagnostic | Owner presses **Verify key and text model** | `/api/ai-diagnostics` | Tests key/model access without revealing credential |

## If the sound is not natural enough

Start with voice `marin` or try `cedar`. Use **AI TEACHER LIVE** to hear several lines rather than relying on the browser's speech synthesizer. The fallback browser voices sound different across Windows, Chrome and operating-system settings. Audio generation is not always instantaneous; an unstable Render connection or exhausted API balance can lead to browser speech fallback.

If the owner check succeeds but narration fails, verify your account's API billing, model permissions and rate limits, then test `/api/narration?scene=0` from your authenticated browser. If the app plays browser audio instead, check the Render logs for transient upstream failures (never copy full secret values into support chats).

For responsive dialogue, NOVA has two modes: **AI TEACHER LIVE** is a turn-based workflow using transcription → text model → speech, while **Connect live AI** uses OpenAI Realtime and should feel quicker. These are separate paths. Realtime voice should be tested with headphones or a quiet room to prevent feedback.

## Paid requests and safeguards

Text generation, transcription, TTS, Realtime and images can incur separate API charges. Set a project spending limit and budget alerts in the OpenAI Platform. NOVA includes in-memory per-account request limits, but these reset on server restart and are **not** a substitute for OpenAI project billing limits or database-backed quotas. Never expose the sales demo without a strong password.

This is a **synthetic-data, adult-operated commercial demonstration**. It is not approved for child audio capture or actual school student records. Real-child deployment requires a separate privacy, legal, age, supervision and data-retention review.
