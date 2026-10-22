# Pilot Edition test notes

## Verified in this build (20 local HTTP checks passed)

- `node --check server.js` and `node --check pilot.js` succeed.
- HTTP 200 response for `/healthz` without login.
- HTTP 401 for protected school tour without credentials.
- HTTP 200 for a valid owner or valid school evaluator on `/school-pilot.html`.
- HTTP 403 for a school evaluator opening the owner console or owner API.
- HTTP 200 for valid owner on `/owner-console.html`.
- HTTP 503 with an explicit configuration message if the Realtime token endpoint is called without `OPENAI_API_KEY`.
- The existing course data, classroom and demos are preserved in the archive.

## Not verified

- Live OpenAI voice end-to-end. No API call was made with the key pasted in chat. A new private key and API billing are required.
- Browser-rendered interaction regression tests for this exact build. The browser in this environment denied navigation, so no browser UI pass is claimed.
- Paid hosting, custom-domain DNS, database persistence, payments, user billing or child use.

This is a commercial school *evaluation package*, not a production certification or guarantee of functionality in every deployment environment.
