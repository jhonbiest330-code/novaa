# Deploy NOVA Academy online: beginner instructions

## 1. Understand the three pieces

- **GitHub**: The private bookshelf where you store and update source code. It is not your live website.
- **Render**: The internet-connected computer where your program actually runs and gets an HTTPS address.
- **OpenAI API**: The separately billed AI voice service that your server connects to. A ChatGPT subscription does not substitute for API billing.

## 2. First, prepare secure credentials

Revoke the OpenAI API key previously pasted into the conversation at https://platform.openai.com/api-keys. Create a fresh key and keep it private. Ensure your API project has access and billing. Choose a long unique owner password (20+ random characters suggested). Never include the key or password in your GitHub repository, even a private one.

## 3. Upload the source code to GitHub

1. Sign in to https://github.com/ and select **New repository**.
2. Name it `nova-academy-pilot`. Select **Private**.
3. Extract the `NOVA_Academy_School_Pilot_v3.zip` file on Windows. **Do not upload just the ZIP**; upload the unzipped project *contents*.
4. On GitHub, use **Add file → Upload files** (if supported for your repository), and drag the project contents including `server.js`, `render.yaml`, `school-pilot.html`, `data.js`, the `assets` folder and all other shipped files. Make sure `render.yaml` is at repository root, not in a subfolder.
5. Commit the files. Do not upload any `.env` files with real secret values.

If the browser upload does not preserve nested folders, use GitHub Desktop: https://desktop.github.com. The goal is the same: all project files and the `assets/` directory in the repository.

## 4. Turn it into a website on Render

1. Sign in at https://dashboard.render.com/.
2. Choose **New → Blueprint**, connect GitHub and select your private repository (or **New → Web Service** if Blueprint is unavailable).
3. Render reads `render.yaml` and creates a Node-based web service.
4. When it asks for environment variables, enter:

| Variable | Required | What you enter |
|---|---|---|
| `DEMO_ACCESS_PASSWORD` | Yes | Your private owner password |
| `OPENAI_API_KEY` | For live voice | Your **new** private API key |
| `DEMO_ACCOUNTS_JSON` | No | `[]` initially; add adult evaluator logins later |
| `HOST` | Yes | `0.0.0.0` (provided by Blueprint) |
| `OPENAI_REALTIME_MODEL` | Yes for live voice | `gpt-realtime-2.1` (requires model access) |
| `MAX_DAILY_VOICE_SESSIONS` | Recommended | `12` or lower for a private evaluation |

5. If you use **Web Service** instead of Blueprint, select Node and set start command to `npm start` and build command to `npm install --omit=dev`. The web service must listen on `0.0.0.0`.
6. Deploy. On success, Render provides a real URL such as `https://nova-academy-pilot.onrender.com` (your actual address will differ).

Render free web services are suitable for evaluations but not paid uptime commitments. They may sleep after inactivity and have an ephemeral filesystem. Upgrade to an appropriate paid plan before committing to availability or real customer records.

## 5. Open the online classroom

1. Visit `https://YOUR-ACTUAL-RENDER-ADDRESS/school-pilot.html`.
2. The browser's login dialog asks for **username `demo`** and the `DEMO_ACCESS_PASSWORD` you configured on Render.
3. Select **Enter the AI classroom** to open the interactive lesson.
4. Guided preview works without OpenAI.
5. To check voice, select **Live AI voice**, confirm adult-only evaluation, connect, and explicitly enable microphone. Use Chrome/Edge over HTTPS. Allow mic permission when requested.
6. Voice access can fail if API billing, key permissions, model access or network conditions are not correct. The untested live connection must be verified before a client demo.

## 6. Give a school principal THEIR OWN adult demo login

1. Sign into `/owner-console.html` as username `demo` with the owner password.
2. In the **Invite a school evaluator** box, enter a username, generate a long password and click **Prepare demo account**.
3. Click **Copy account settings**.
4. Open **Render → Your NOVA service → Environment → `DEMO_ACCOUNTS_JSON`**.
5. Paste the entire JSON array you copied. Save and deploy.
6. Give the principal the public URL, their **separate username and password**, and the adult-only testing restrictions.
7. IMPORTANT: The console does not read or know the existing passwords from Render. When adding more schools, **include all existing accounts in the new JSON array** or previous demo logins will be replaced/disabled. You can manage the array directly in Render to avoid overwriting accounts. Use unique credentials; rotate/remove them after evaluation.

A principal can use the school tour, classroom and fictional dashboards but **cannot** access the owner console. This is demo access, NOT a production student, teacher or parent login system.

## 7. Custom domain (optional)

Once Render is live, use **Service → Settings → Custom Domains**, add your own purchased domain such as `app.yourbrand.com`, update DNS at your domain provider, and verify. Render issues HTTPS certificates. You can skip the domain and use the Render address for early demos.

## 8. Updating the software later

Modify the source in your private GitHub repository, commit changes, and Render normally deploys automatically from the connected branch. Test important changes on a staging service before showing customers.

## 9. If something goes wrong

- Browser shows **login prompt repeatedly**: double-check the username and password. Use a private/incognito window when switching between owner and school credentials; browsers cache Basic Auth details.
- **No open ports detected**: set `HOST=0.0.0.0` and use `npm start`.
- **OPENAI_API_KEY not configured**: update Render Environment and redeploy.
- **Realtime session rejected**: check API credits, model permissions and the Render log; use the guided demo meanwhile.
- **Microphone unavailable**: ensure HTTPS or localhost, grant browser permission and use desktop Chrome/Edge.
- **Service slow to start**: Free instances can sleep when idle. This is why a paid always-on instance is preferable for customer demos.

Official references: https://render.com/docs/your-first-deploy and https://developers.openai.com/api/docs/guides/voice-webrtc.
