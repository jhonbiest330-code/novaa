# NOVA v6 quality and verification record

## Passed locally (October 22, 2026)

- 26 of 26 Node server tests using a **mocked** OpenAI API passed.
- Validated server startup after correcting a configuration initialization error.
- Verified script syntax (`node --check`) for `server.js`, `pilot.js` and `invention-lab.js`.
- Verified routes for OpenAI TTS, scene narration, text Q&A, student-turn replies, transcription, Realtime ephemeral credentials and the new AI image request.
- Verified owner-only diagnostic endpoint, approval requirement for images, allowed image parameters, image quota, cross-origin checks, and denial of backend and environment-file access.
- No user-provided OpenAI key was written to application files or the ZIP.

## Not verified end to end

- Live calls to OpenAI using a **valid replacement key** were **not performed**. API permissions, billing status, TTS playback quality, spoken-turn latency, live image generation quality and live Realtime negotiation need testing on the user's Render service.
- Automated Chromium browser navigation was blocked by the execution environment's administrator network policy, so the v6 browser regression could not be completed. Frontend integration code passes syntax checking and the server returns the edited assets, but its live UI has not been fully revalidated.
- This is an adult-operated **sales/pilot demo**, not a production deployment approved for real children or real school records.

## After deploying to Render

1. Owner authenticates and verifies key/model visibility.
2. Start Class 3 scene 0 and listen to real model narration with `marin` voice.
3. Enable AI TEACHER LIVE, hear a fictional student called on by name, provide a spoken answer as an adult and confirm NOVA's response.
4. Ask a lesson question and check that the response is contextual, concise and accurate.
5. Connect Realtime in a quiet room, explicitly enable microphone and verify start/stop controls.
6. Verify prepared invention preview works with images disabled.
7. If live images were enabled deliberately, generate at most one illustration in scene 8 and verify the UI displays 'LIVE OPENAI ILLUSTRATION'.
8. Validate quiz scoring and final report independently of AI availability.
