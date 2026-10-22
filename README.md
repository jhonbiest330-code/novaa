# NOVA Academy v7 • Multilingual AI Teacher (Render)

**Start here:** `RENDER_UPGRADE_V7.md` and `LANGUAGE_SETUP_V7.md`.

# NOVA Academy v6 · Unified OpenAI / Render Edition

**Security first:** this project deliberately contains **no API key**. A key pasted in chat is exposed and must be revoked. Use a newly created OpenAI key in Render Environment as `OPENAI_API_KEY`.

All existing v5 classroom teaching, recap, roster, teacher speech, audio transcription, Realtime voice, lesson narration, and text Q&A remain. V6 adds a unified OpenAI configuration, owner-only key diagnostics, and optional paid live illustration generation with explicit approval and a strict daily cap.

See `OPENAI_SETUP_V6.md` and `RENDER_V6_DEPLOY.md`. This application is an **adult-operated sales demonstration using fictional learners**. It is **not approved to collect or process real children's data or classroom recordings.**

To run locally (Node.js 22 recommended):

```bash
npm install
DEMO_ACCESS_PASSWORD='change_this_to_a_secure_secret' HOST=127.0.0.1 npm start
```

The OpenAI key is optional for local scripted testing. Never put it into GitHub, the HTML or screenshots.

V6 online entry: `https://<your-render-service>.onrender.com` using username `demo` and your configured demo password.


## v7 Multilingual Classroom (English / Urdu / Arabic / French / German)

Open the Class 3 Invention Lab and select **Teaching language** before starting. The choice also appears in the top bar, classroom director, and owner audio diagnostic console.

- **Urdu:** Slides, questions and activity text stay **in English**. NOVA speaks teacher narration, named student questions, hints, follow-ups and replies in natural Pakistani Urdu. The OpenAI text model first rewrites English content idiomatically into Urdu script; the speech model then reads Urdu. The realtime conversation prompt requests Urdu speech. Participants can answer in English or Urdu during an adult-only demonstration.
- **Arabic:** Modern Standard Arabic teacher speech and dynamically translated lesson-interface text, with right-to-left reading direction on the teaching canvas.
- **French / German:** Localized spoken teaching and on-demand translated slide, activity and classroom-director text.
- **English:** Original course content without translation calls.

The multilingual API uses an in-memory translation cache to reduce repeated cost. A page reload can require retranslation. Language preference is stored in that browser's local storage, but student information is not stored there.

Without `OPENAI_API_KEY`, the non-English language option is visible but a complete translated experience is **unavailable**. NOVA must not pretend that English fallback voice is Urdu or Arabic. Use the owner console to test voices in each language before demos.

**Privacy:** This remains an adult-operated presentation using fictional students. Do not enroll children, collect real pupil names, or record actual children's voice with this demo.

**Audio compatibility:** Current project uses `gpt-4o-mini-tts` at the Speech API. OpenAI says this model is scheduled for retirement on January 6, 2027. Migrate the speech workflow to the supported Realtime model before that date. Current TTS voices are still optimized for English, so always listen critically to Urdu and Arabic pronunciation with a native speaker.
