# Update your existing NOVA Render service to v7

**No new service required.** This ZIP replaces the source code of the currently deployed NOVA demo. It uses the existing Render Node.js backend, password and OpenAI configuration. This is still an adult-only sales demonstration with synthetic participants.

1. Download and extract `NOVA_Academy_Multilingual_v7_Render.zip`.
2. Back up your current GitHub repository, then copy **the contents** of the extracted project folder into the root of your connected private GitHub repository. Commit and push. Do not place the entire unextracted ZIP in the repository.
3. In [Render](https://dashboard.render.com), open the existing NOVA web service. If it has not automatically deployed the new commit, use Manual Deploy → Deploy latest commit.
4. In Render → Environment, verify `HOST=0.0.0.0`, `DEMO_ACCESS_PASSWORD` (your existing strong password) and `OPENAI_API_KEY` (a **new private** key, never pasted in chat or committed to GitHub). Save and deploy if you change any environment values.
5. Once the deploy is green, open your usual `onrender.com` link, sign in as `demo`, and find the Teaching Language dropdown on the opening Class 3 screen. You can also select language in the classroom top bar or teacher director.
6. Choose **Urdu** to keep the English slides and hear NOVA teach in Urdu. Choose **Arabic**, **French**, or **German** for speech in that language. Use **Translate slides (optional)** to choose translated or English written slides for those languages.
7. Open `/owner-console.html` while logged in with owner credentials and use the language + voice selectors to hear a real paid OpenAI speech preview. Test all required languages before showing clients.

**Important:** OpenAI speech and translation incur API charges. Urdu/Arabic native-accent quality is not guaranteed; the voices currently are optimized for English. Verify them with native speakers. The live audio/transcription connection has not been verified here with an actual OpenAI key.

**Do not use this adult demo with real children's names or voices.** It has not undergone the privacy and safety work required for live school deployment.

For details, see `LANGUAGE_SETUP_V7.md` and `QA_V7.md`.
