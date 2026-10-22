# NOVA Academy v7 — Language Setup for Render

## What is included

The multilingual feature is built into **the same** v6 Node.js application. There is no extra translation provider or API key. The server safely uses `OPENAI_API_KEY` for translations, voice generation, typed student feedback, and temporary Realtime session credentials.

**Language combinations:**

| Selector | Slides / main learning text | Spoken teacher / questions / replies |
|---|---|---|
| English | English | English |
| Urdu / اردو | **English** (deliberate) | Native-style, conversational Pakistani Urdu |
| Arabic / العربية | Arabic (AI-translated) | Modern Standard Arabic |
| French / Français | French (AI-translated) | French |
| German / Deutsch | German (AI-translated) | German |

Arabic, French and German can show translated slide text or English slide text: uncheck **Translate slides (optional)** next to the language menu to retain English. Urdu always keeps English slides. Interface translation requires the OpenAI API. Some fixed secondary historical dashboards remain English; the fully connected language switch applies to the flagship Class 3 classroom and its director controls. Dynamic translation can take a few moments and should be checked for accuracy before school presentations.

## Update your existing Render service

1. Back up the current GitHub repository or make a backup branch.
2. Extract `NOVA_Academy_Multilingual_v7_Render.zip`. Copy the extracted project files **to the root** of the same private GitHub repository connected to your existing Render web service. Replace the old files, commit, and push.
3. Render usually deploys automatically. Or open Render → your service → Manual Deploy → Deploy latest commit.
4. Under Render → Environment confirm:
   - `HOST=0.0.0.0`
   - `DEMO_ACCESS_PASSWORD=<your own strong password>`
   - `OPENAI_API_KEY=<new private OpenAI API key>`
   - `OPENAI_TEXT_MODEL=gpt-5-mini` (optional model selection)
   - `OPENAI_DEFAULT_VOICE=marin` (optional)
   - `OPENAI_TTS_MODEL=gpt-4o-mini-tts` (existing compatible model; see deprecation note)
   - `OPENAI_STT_MODEL=gpt-transcribe` (recommended for existing uploaded recordings)
5. Save and deploy. **Never put actual API credentials inside the ZIP, GitHub, README, JS, HTML or browser settings.** Revoke previously exposed keys.
6. Open your Render web URL and sign in with username `demo` and the `DEMO_ACCESS_PASSWORD` you chose.
7. At the lesson welcome modal, select Urdu or Arabic, then choose Principal Showcase or Full Classroom and press Start. The top-bar dropdown changes language any time.
8. Open `/owner-console.html`, select a voice and language and press *Listen to NOVA* to test real generated speech. Compare `marin`, `cedar`, `coral` and `sage` with native speakers.

## Testing natural Urdu

Choose Urdu and run Scene 2 or the main invention activity. Confirm these results:
- Main lesson canvas remains in English.
- NOVA asks a fictional student the question in spoken Urdu.
- A simulated Urdu question typed into the director, e.g. `AI غلطی کیوں کر سکتا ہے؟`, receives a meaningful on-screen answer and Urdu speech.
- Press Stop while speaking: playback ends. Switch the language to English and replay: English speech resumes.
- In Urdu mode, text-to-speech is generated from **Urdu script**, not English text with an Urdu accent instruction alone.

## Reality checks and troubleshooting

- **No language audio:** check Render environment `OPENAI_API_KEY`, OpenAI project billing/model access, and your browser audio settings. Urdu/Arabic audio cannot be guaranteed by browser-native speech fallback.
- **Arabic/French/German text still English:** wait for translation. If it fails, the English original stays visible and the warning appears. Check `/api/status` while signed in and browser network requests to `/api/language-translate`.
- **Quality sounds too robotic:** try Marin and Cedar; shorten utterances, vary classroom prompts, and verify Urdu pronunciation with a native Urdu speaker. OpenAI states its built-in speech voices are still optimized for English, so perfect native accent cannot be promised.
- **Slow translation:** first-generation translations call the text model. The server caches repeats in memory, not permanently.
- **Speech API changes:** OpenAI lists `gpt-4o-mini-tts` as deprecated with a January 6, 2027 shutdown. Migration to the recommended current Realtime model needs an API workflow change, not merely changing the environment variable.

## Production and student-data safety

This edition remains a restricted **adult-facing demo using fictional student data only**. It does not provide production-grade school accounts, guardian permission, individual student records, or audited child privacy safeguards. Do not collect real children's names, voice, recordings, or personal data here. Before any actual rollout, implement and review the required safeguards, age-eligibility rules and API data-handling requirements.

## Verification

- Language routes, protected files, adult authentication and mocked integrations: see `tests/test_routes.py` and `QA_V7.md`.
- Browser end-to-end verification was not possible in the available browser environment; see test report. Test on deployed Chrome before a client demonstration.
