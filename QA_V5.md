# NOVA v5 | Verification report

## Verified in local server + static checks

- JavaScript syntax: `node --check server.js`, `node --check invention-lab.js`, `node --check classroom-director.js`.
- Local Node HTTP smoke tests: **17/17 passed** in `test_v5_server.py` (environment has no configured OpenAI key).
- Confirmed the homepage loads the new director script and CSS, and new files are allowlisted by the server.
- Confirmed unauthenticated public routes require HTTP Basic authentication when configured.
- Confirmed `server.js`, `.env.example`, and unknown files remain inaccessible over HTTP.
- Confirmed new voice, reply and transcription endpoints return 503 instead of pretending to work without a key.
- Confirmed original Class 3 page, teacher consoles and curriculum files retained in the deployable project.

## Not yet verified in this environment

- Browser end-to-end UI automation could not run: Chromium is restricted with `ERR_BLOCKED_BY_ADMINISTRATOR` for localhost and file URLs in this environment.
- The new premium text-to-speech, speech-to-text and model-generated teacher responses were not tested against the paid OpenAI API because a fresh, private key was not configured.
- Microphone audio capture requires an actual Chrome/Edge browser session on HTTPS.
- Per-student real progress reporting and authentic previous-lesson recall are not implemented and must not be presented as real.

## Launch acceptance checklist (manual, necessary)

- [ ] Start Class 3 and verify the Teacher Director panel appears automatically.
- [ ] Edit sample recap and answer NOVA's recall question.
- [ ] Confirm NOVA calls different fictional students before repeating one.
- [ ] Submit typed role-play answers and model-generated follow-ups.
- [ ] Configure and test premium `marin` speech; compare the browser fallback.
- [ ] With explicit adult permission, record a short test answer and verify transcription.
- [ ] Raise a lesson-related question and verify NOVA answers in context, then returns to lesson.
- [ ] Try Think–Pair–Share and confidence check.
- [ ] Verify incomplete stage activities require completion or a teacher override.
- [ ] Answer all five quiz questions and verify group score in final showcase.
- [ ] Use Pause and Emergency stop and verify voice and microphone stop.
- [ ] Check 1366×768 projector mode and mobile screen, including director panel minimize.
- [ ] Verify no personal data or real child recordings are used in this adult demo.

## Mock AI integration tests

`python3 tests/test_routes.py`: **13/13 passed**, using a dummy local OpenAI transport, validating reply, speech, transcription, input validation, origin restrictions and private file protection. This does **not** establish live OpenAI API availability, audio quality or browser playback.
