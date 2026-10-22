# NOVA v7 Multilingual — verification

**What was actually tested**

- `node --check` validates JavaScript syntax for server, classroom director, invention lab and multilingual UI module.
- `python tests/test_routes.py` exercises 42 local server checks with a **mock OpenAI service**, not live billable provider access. Checks include:
  - English, Urdu, Arabic, French, German capability listing
  - Urdu/French/German/Arabic translation endpoint behavior
  - Urdu and Arabic prepared narration routes
  - Urdu and French classroom speech routes
  - Urdu input accepted by the teacher-response API
  - Urdu Realtime session credentials request
  - invalid languages rejected and origin checks enforced
  - main school demo, owner, image service, quota and secret-file restrictions
- The mock OpenAI service returns synthetic translations and test audio bytes to verify orchestration and security boundaries. It does not establish real voice quality, provider compatibility or translation correctness.

**Not verified in this environment**

- Browser automation is blocked by an administrator policy (Playwright Chromium fails with `ERR_BLOCKED_BY_ADMINISTRATOR`, even for local HTML). This is not an application test failure or success.
- The actual Urdu/Arabic/French/German translated output, pronunciation, accents, transcript accuracy and Realtime audio were not tested against a live OpenAI account.
- Full production browser responsiveness and RTL layout require a manual browser pass on deployed Render.

**Mandatory acceptance pass before client demos:** Set the private key on Render; test each language's scene narration, named-pupil question, typed/mic response and slide content; confirm Urdu slide text stays English; check Arabic RTL; switch languages during speech; use Stop; complete quiz; use voice preview in owner console.
