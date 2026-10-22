/* Minimal zero-dependency demo server for adult-only OpenAI Realtime test. Node 20+. */
'use strict';
const http=require('node:http');const path=require('node:path');const fs=require('node:fs');const crypto=require('node:crypto');
const PORT=Number(process.env.PORT||3000);const HOST=process.env.HOST||'127.0.0.1';
const DEMO_PASSWORD=process.env.DEMO_ACCESS_PASSWORD||'';
let clientAccounts=[];
try {const parsed=JSON.parse(process.env.DEMO_ACCOUNTS_JSON||'[]');
 if(!Array.isArray(parsed))throw new Error('Expected array');
 clientAccounts=parsed.filter(x=>x && typeof x.user==='string' && typeof x.password==='string' && x.user.length>=3 && x.user.length<=48 && x.password.length>=14 && x.password.length<=200 && /^[a-zA-Z0-9_.-]+$/.test(x.user) && x.user!=='demo');
 if(clientAccounts.length>20)throw new Error('At most 20 trial accounts supported');
}catch(e){console.error('Invalid DEMO_ACCOUNTS_JSON:',e.message);process.exit(1)}
if(HOST!=='127.0.0.1' && !DEMO_PASSWORD){console.error('DEMO_ACCESS_PASSWORD required when binding publicly.');process.exit(1)}
function stableMatch(a,b){const ha=crypto.createHash('sha256').update(a).digest();const hb=crypto.createHash('sha256').update(b).digest();return crypto.timingSafeEqual(ha,hb)}
function identity(req){
 if(!DEMO_PASSWORD)return {user:'demo',owner:true};
 const auth=req.headers.authorization||'';
 if(!auth.startsWith('Basic '))return null;
 let decoded='';try{decoded=Buffer.from(auth.slice(6),'base64').toString('utf8')}catch{return null}
 const ix=decoded.indexOf(':');if(ix<0)return null;
 const u=decoded.slice(0,ix),pw=decoded.slice(ix+1);
 if(stableMatch(u+'\0'+pw,'demo\0'+DEMO_PASSWORD))return {user:'demo',owner:true};
 for(const x of clientAccounts){if(stableMatch(u+'\0'+pw,x.user+'\0'+x.password))return {user:x.user,owner:false}}
 return null;
}
function deny(res){res.writeHead(401,{'WWW-Authenticate':'Basic realm="NOVA Academy Adult Demo", charset="UTF-8"','Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'});res.end('Protected adult-only demo: enter the credentials set by the site owner.')}
const PUBLIC=__dirname;const approvedNarrations=JSON.parse(fs.readFileSync(path.join(__dirname,'narration.json'),'utf8'));const narrationCache=new Map();const generationCounts=new Map();const API_KEY=process.env.OPENAI_API_KEY;const MODEL=process.env.OPENAI_REALTIME_MODEL||'gpt-realtime';
const TEXT_MODEL=process.env.OPENAI_TEXT_MODEL||'gpt-5-mini';
const TTS_MODEL=process.env.OPENAI_TTS_MODEL||'gpt-4o-mini-tts';
const STT_MODEL=process.env.OPENAI_STT_MODEL||'gpt-transcribe';
const IMAGE_MODEL=process.env.OPENAI_IMAGE_MODEL||'gpt-image-1-mini';
const DEFAULT_VOICE=process.env.OPENAI_DEFAULT_VOICE||'marin';
const IMAGES_ENABLED=process.env.ENABLE_LIVE_IMAGES==='true';
const LANGUAGES=Object.freeze({en:'English',ur:'Urdu',ar:'Arabic',fr:'French',de:'German'});
const requestedLang=value=>Object.prototype.hasOwnProperty.call(LANGUAGES,value)?value:'en';
const translationCache=new Map();
const nativeVoiceGuide={
  en:'Use relaxed, upbeat natural English, like a genuinely attentive primary teacher.',
  ur:'Speak in fluent, graceful everyday Pakistani Urdu, in Urdu script. Conversational, caring, native-style teacher rhythm. Explain meaning rather than translating word for word. Use familiar examples from Pakistani school life. Keep AI and common technical terms clear, using a natural Urdu explanation. Never switch to Hindi vocabulary or Roman Urdu unless the fictional pupil asks.',
  ar:'Speak natural, clearly articulated Modern Standard Arabic for primary-school students with a warm, friendly classroom manner. Avoid stiff literal translation or dense formal words.',
  fr:'Speak natural metropolitan French for primary-school students, with warm, lively teacher phrasing, not literal translated English.',
  de:'Speak idiomatic Standard German for primary-school students, in an encouraging teacher tone, never stiff word-by-word translation.'
};
const translationPurpose={
 speech:'Rewrite faithfully as speech a skilled, energetic Grade 3 teacher would naturally say. Preserve correct science, educational questions, safety warnings, named fictional student names, and meaning. Keep sentences conversational and inviting. No English commentary, no labels, no quotes around the output. Do not add or omit activities or claims.',
 ui:'Translate visible learning-interface text into clear, child-friendly language. Preserve button meaning, educational accuracy, punctuation, and names. Do not translate product name NOVA, numbers, or already localized terms. Keep concise.'
};
function parseTextOutput(obj){return String(obj.output_text||obj.output?.flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join(' ')||'').trim()}
async function translateBatch(items,lang,purpose){
 if(lang==='en')return items;
 const keys=items.map(t=>crypto.createHash('sha256').update(lang+'|'+purpose+'|'+t).digest('hex'));
 const pending=items.map((t,i)=>({t,key:keys[i]})).filter(p=>!translationCache.has(p.key));
 if(pending.length){
  const instructions=`Translate each element in the supplied JSON array into ${LANGUAGES[lang]}. Return ONLY a VALID JSON array of strings in the exact same order, length and shape. No Markdown. ${translationPurpose[purpose]} ${nativeVoiceGuide[lang]}`;
  const res=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:TEXT_MODEL,instructions,input:JSON.stringify(pending.map(p=>p.t)),max_output_tokens:Math.min(4700,Math.max(500,pending.map(p=>p.t).join('').length*2))}),signal:AbortSignal.timeout(35000)});
  if(!res.ok)throw Error('Translation provider error');
  const raw=parseTextOutput(await res.json());let parsed;
  try{parsed=JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g,''))}catch{throw Error('Invalid translation result')}
  if(!Array.isArray(parsed)||parsed.length!==pending.length||parsed.some(v=>typeof v!=='string'||!v.trim()))throw Error('Incomplete translation');
  pending.forEach((p,i)=>translationCache.set(p.key,parsed[i]));if(translationCache.size>650)translationCache.clear();
 }
 return keys.map(k=>translationCache.get(k));
}

async function translateSingle(text,lang,purpose='speech'){
 if(lang==='en')return text;
 const key=crypto.createHash('sha256').update(lang+'|'+purpose+'|'+text).digest('hex');
 if(translationCache.has(key))return translationCache.get(key);
 const msg=translationPurpose[purpose]||translationPurpose.speech;
 const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:TEXT_MODEL,instructions:`You are an expert multilingual primary-school curriculum translator and native speaker of ${LANGUAGES[lang]}. ${msg} ${nativeVoiceGuide[lang]} ${lang==='ur'?'The UI remains English, but audio must be in elegant natural Urdu script.':''}`,input:text,max_output_tokens:Math.min(1600,Math.max(260,Math.ceil(text.length*1.7)))}),signal:AbortSignal.timeout(25000)});
 if(!response.ok)throw new Error('Language translation unavailable');
 const value=parseTextOutput(await response.json()).replace(/^```[a-z]*\n?|```$/gi,'').trim();
 if(!value)throw new Error('Empty translated text');
 if(translationCache.size>600)translationCache.clear();
 translationCache.set(key,value);return value;
}
const teacherVoiceStyle='Voice acting notes: an exceptionally clear, warmly animated human classroom instructor, not a robotic announcer. Natural tempo and pitch variation, authentic conversational rhythm, thoughtful pauses at questions, lightly energetic when inviting a student to contribute. Never sing, never shout, never invent extra words or child names.';
const safeVoice=voice=>allowed.has(voice)?voice:(allowed.has(DEFAULT_VOICE)?DEFAULT_VOICE:'marin');

const allowed=new Set(['marin','cedar','coral','sage','shimmer','verse']);
const limits=new Map();const dailyLimits=new Map();const MAX_REQUESTS=5;const WINDOW=60000;const MAX_DAILY_SESSIONS=Math.min(100,Math.max(1,Number(process.env.MAX_DAILY_VOICE_SESSIONS||12))); 
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.json':'application/json'};
function json(res,code,data){res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data))}
function getBody(req,maxChars=3000){return new Promise((resolve,reject)=>{let buf='';req.on('data',c=>{buf+=c;if(buf.length>maxChars){reject(new Error('Request too large'));req.destroy()}});req.on('end',()=>resolve(buf));req.on('error',reject)})}
const policy=`You are NOVA, an animated AI teaching assistant running an ADULT-ONLY concept demonstration with fictional students. You are an AI, not a person. Your tone is lively, warm, confident, curious, concise and articulate. Speak naturally, use short sentences and expressive emphasis, no lengthy monologues. Current subject: creative uses of AI, prompt specificity, verification, safety, invention. This is a guided classroom teaching context, not unrestricted chat. Use age-appropriate grade 3 vocabulary in a simulated scene, but never request real child data. For every approved slide, explain an idea then ask a single thoughtful question. Wait and let the adult tester answer. If asked to explain further, give an example or hint and invite thinking. Correct misunderstandings respectfully. If asked to go to next/previous slide, use request_slide_change; do not claim to change it without calling the tool. Never invent grades, student histories, real class performance, achievements or research. Never claim simulated assets are live generation. Never collect names, locations or identifying information; redirect to lesson topics. The session is for adult product evaluation only.`;
const slideTool={type:'function',name:'request_slide_change',description:'Change the current on-screen lesson slide when the adult operator asks to proceed, go back, or repeat. The app validates permission and bounds.',parameters:{type:'object',properties:{action:{type:'string',enum:['next','previous','repeat']}},required:['action'],additionalProperties:false}};
const allowedFiles=new Set(['nova-language.js','nova-language.css','classroom-director.js','classroom-director.css','invention-lab.html','invention-lab.css','invention-lab.js','dashboard.html','index.html','styles.css','curriculum-data.js','data.js','app.js','live-classroom.html','live-classroom.css','live-classroom.js','NOVA_Enhanced_Classroom_Preview.html','NOVA_Academy_Offline_Demo.html','assets/favicon.svg','school-pilot.html','pilot.css','pilot.js','owner-console.html']);
const server=http.createServer(async(req,res)=>{
try{
const url=new URL(req.url,'http://localhost');
if(url.pathname==='/healthz'){json(res,200,{ok:true});return}
const principal=identity(req);
if(!principal){deny(res);return}
if((url.pathname==='/owner-console.html' || url.pathname==='/api/pilot-owner') && !principal.owner){json(res,403,{error:'Owner-only page'});return}
if(url.pathname==='/api/pilot-owner'){
 json(res,200,{owner:true,voiceConfigured:!!API_KEY,trialAccounts:clientAccounts.map(x=>x.user),dailyVoiceLimit:MAX_DAILY_SESSIONS});return}

if(url.pathname==='/api/status'){json(res,200,{configured:!!API_KEY,mode:'adult-demo-only',model:MODEL,voice:safeVoice(DEFAULT_VOICE),features:{teachingReplies:!!API_KEY,narration:!!API_KEY,transcription:!!API_KEY,realtime:!!API_KEY,images:!!API_KEY&&IMAGES_ENABLED},supportedLanguages:LANGUAGES,urduEnglishText:true,liveImagesRequireTeacherApproval:true});return}
// A key-check endpoint for the owner. Returns only capability metadata, never credentials.
if(url.pathname==='/api/ai-diagnostics'){
 if(!principal.owner){json(res,403,{error:'Owner access required'});return}
 if(req.method!=='GET'){json(res,405,{error:'GET required'});return}
 if(!API_KEY){json(res,503,{configured:false,error:'Set OPENAI_API_KEY privately in Render Environment'});return}
 try{const r=await fetch('https://api.openai.com/v1/models/'+encodeURIComponent(TEXT_MODEL),{headers:{Authorization:'Bearer '+API_KEY},signal:AbortSignal.timeout(7000)});
 json(res,r.ok?200:502,{configured:true,keyAccepted:r.ok,modelAvailable:r.ok,model:TEXT_MODEL,voice:safeVoice(DEFAULT_VOICE),speechModel:TTS_MODEL,transcriptionModel:STT_MODEL,realtimeModel:MODEL,imageModel:IMAGE_MODEL,imagesEnabled:IMAGES_ENABLED,help:r.ok?'Key accepted and text model visible. Test actual voice in the classroom.':'OpenAI rejected the model check. Check your key, project model access, and billing.'});return}
 catch{json(res,502,{configured:true,keyAccepted:false,error:'OpenAI connectivity check unavailable'});return}
}
// Server-side language translation, including natural Urdu teacher speech.
if(url.pathname==='/api/language-translate'){
 if(req.method!=='POST'){json(res,405,{error:'POST required'});return}
 const origin=req.headers.origin;
 if(origin){const scheme=String(req.headers['x-forwarded-proto']||'http').split(',')[0], host=req.headers['x-forwarded-host']||req.headers.host;if(origin!==scheme+'://'+host){json(res,403,{error:'Origin mismatch'});return}}
 let data;try{data=JSON.parse(await getBody(req,12000))}catch{json(res,400,{error:'Invalid language request'});return}
 const lang=requestedLang(data.language);if(lang!==data.language||!['speech','ui'].includes(data.purpose)){json(res,400,{error:'Unsupported language or purpose'});return}
 const texts=Array.isArray(data.texts)?data.texts:null;
 if(!texts||texts.length>22||texts.some(v=>typeof v!=='string'||v.length<1||v.length>800)||texts.join('').length>8000){json(res,400,{error:'Invalid language text batch'});return}
 if(lang==='en'){json(res,200,{language:lang,translations:texts,mode:'original'});return}
 if(!API_KEY){json(res,503,{error:'Set OPENAI_API_KEY privately on Render to enable translated speech and slides'});return}
 const day=new Date().toISOString().slice(0,10),bucket='translation:'+principal.user+':'+day;
 if((generationCounts.get(bucket)||0)>1200){json(res,429,{error:'Daily multilingual translation quota reached'});return}
 generationCounts.set(bucket,(generationCounts.get(bucket)||0)+texts.length);
 try{const result=await translateBatch(texts,lang,data.purpose);json(res,200,{language:lang,translations:result,mode:'live-openai-translation',displayLanguage:lang==='ur'?'en':lang});return}
 catch{json(res,502,{error:'Translation currently unavailable. Original English text remains available.'});return}
}
// Optional and cost-controlled *real* image generation, initiated only by adult click.
if(url.pathname==='/api/invention-image'){
 if(req.method!=='POST'){json(res,405,{error:'POST required'});return}
 const origin=req.headers.origin; if(origin){const scheme=String(req.headers['x-forwarded-proto']||'http').split(',')[0];const host=req.headers['x-forwarded-host']||req.headers.host;if(origin!==scheme+'://'+host){json(res,403,{error:'Origin mismatch'});return}}
 if(!IMAGES_ENABLED){json(res,403,{error:'Owner must enable optional paid live images on Render first'});return}
 if(!API_KEY){json(res,503,{error:'OpenAI image service is not configured'});return}
 const day=new Date().toISOString().slice(0,10),bucket='img:'+principal.user+':'+day;
 if((generationCounts.get(bucket)||0)>=2){json(res,429,{error:'Two live illustration requests allowed per evaluator per day'});return}
 let info;try{info=JSON.parse(await getBody(req))}catch{json(res,400,{error:'Invalid illustration parameters'});return}
 if(info?.confirmed!==true || !info?.build){json(res,400,{error:'Teacher confirmation required'});return}
 const b=info.build;
 const all={shape:['round','square'],color:['mint','blue','gold','violet'],sensor:['flow','sound'],alarm:['light','sound']};
 if(Object.entries(all).some(([k,v])=>!v.includes(b[k]))){json(res,400,{error:'Unsupported invention features'});return}
 const name=String(b.name||'AquaBuddy').trim().slice(0,26);
 if(!/^[\p{L}0-9 '\-]{2,26}$/u.test(name)){json(res,400,{error:'Invalid fictional invention name'});return}
 const prompt=`High-quality editorial concept illustration of a fictional child-friendly water-saving invention named ${name}. An original compact ${b.shape} helper in ${b.color} color installed next to a school handwashing tap. Include a visual concept of a ${b.sensor==='flow'?'water flow':'sound'} sensor and a ${b.alarm==='light'?'gentle light alert':'gentle audio alert icon'}; show safe distance from running water. Exceptional 2D educational illustration, premium vector-inspired finish, softly lit isometric view, navy and teal background. No writing, no people, no real children, no logos, no claims about real engineering. Product concept only, not a real manufactured device.`;
 generationCounts.set(bucket,(generationCounts.get(bucket)||0)+1);
 try{const u=await fetch('https://api.openai.com/v1/images/generations',{method:'POST',headers:{Authorization:'Bearer '+API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:IMAGE_MODEL,prompt,size:'1024x1024',quality:'low',output_format:'webp',n:1}),signal:AbortSignal.timeout(110000)});
 if(!u.ok){json(res,502,{error:'Image generation unavailable. Use the prepared demonstration illustration.'});return}
 const d=await u.json(),base64=d?.data?.[0]?.b64_json;
 if(typeof base64!=='string'||base64.length<200||base64.length>4300000){json(res,502,{error:'No usable image returned'});return}
 json(res,200,{image:'data:image/webp;base64,'+base64,mode:'live-openai-image',model:IMAGE_MODEL,note:'Generated illustration, not proof of a working invention'});return}
 catch{json(res,502,{error:'Image generation timed out. Prepared artwork remains available.'});return}
}

// Orchestrated classroom, adult-only simulated pupils; all payloads are ephemeral.
if(['/api/director-reply','/api/director-voice','/api/director-transcribe'].includes(url.pathname)){
 if(req.method!=='POST'){json(res,405,{error:'POST required'});return}
 const origin=req.headers.origin;
 if(origin){const scheme=String(req.headers['x-forwarded-proto']||'http').split(',')[0];const host=req.headers['x-forwarded-host']||req.headers.host;if(origin!==scheme+'://'+host){json(res,403,{error:'Origin mismatch'});return}}
 if(!API_KEY){json(res,503,{error:'AI services unavailable: configure a new OPENAI_API_KEY privately on Render'});return}
 const route=url.pathname.split('/').pop();
 const day=new Date().toISOString().slice(0,10), quota=route==='director-voice'?160:route==='director-transcribe'?70:120;
 const bucket='v5:'+route+':'+principal.user+':'+day;
 const usage=generationCounts.get(bucket)||0;if(usage>=quota){json(res,429,{error:'Daily adult demonstration quota reached'});return}
 generationCounts.set(bucket,usage+1);
 if(route==='director-transcribe'){
  const type=String(req.headers['content-type']||'').split(';')[0].toLowerCase();
  const formats={'audio/webm':'webm','audio/mp4':'mp4','audio/ogg':'ogg','audio/wav':'wav','audio/mpeg':'mp3'};
  if(!formats[type]){json(res,415,{error:'Unsupported audio type'});return}
  let size=0;const chunks=[];try{for await(const chunk of req){size+=chunk.length;if(size>1300000)throw new Error('Audio over 1.3MB');chunks.push(chunk)}}catch{json(res,413,{error:'Audio too large'});return}
  if(size<150){json(res,400,{error:'Empty recording'});return}
  const form=new FormData();form.set('model',STT_MODEL);form.set('file',new Blob([Buffer.concat(chunks)],{type}), 'adult-demo.'+formats[type]);
  try{const u=await fetch('https://api.openai.com/v1/audio/transcriptions',{method:'POST',headers:{Authorization:'Bearer '+API_KEY},body:form,signal:AbortSignal.timeout(22000)});if(!u.ok){json(res,502,{error:'Speech recognition unavailable'});return}const d=await u.json();json(res,200,{text:String(d.text||'').slice(0,440),mode:'live-transcription',recordingSaved:false});return}
  catch{json(res,502,{error:'Speech recognition connection failed'});return}
 }
 let body;try{body=JSON.parse(await getBody(req))}catch{json(res,400,{error:'Invalid request body'});return}
 if(route==='director-voice'){
  const input=String(body.text||'').trim(),voice=safeVoice(body.voice),language=requestedLang(body.language);
  if(input.length<2||input.length>700){json(res,400,{error:'Speech text must contain 2–700 characters'});return}
  const key=crypto.createHash('sha256').update(language+'|'+voice+'|'+input).digest('hex');const cached=narrationCache.get('dynamic:'+key);
  if(cached){res.writeHead(200,{'Content-Type':'audio/mpeg','Cache-Control':'private,max-age=300'});res.end(cached);return}
  try{const speechText=language==='en'?input:await translateSingle(input,language,'speech');const u=await fetch('https://api.openai.com/v1/audio/speech',{method:'POST',headers:{Authorization:'Bearer '+API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:TTS_MODEL,voice,input:speechText,instructions:teacherVoiceStyle+' '+nativeVoiceGuide[language]+' Speak ONLY in '+LANGUAGES[language]+'.',response_format:'mp3',speed:1.0}),signal:AbortSignal.timeout(42000)});
  if(!u.ok){json(res,502,{error:'Professional speech provider unavailable'});return}const b=Buffer.from(await u.arrayBuffer());if(b.length>1700000){json(res,502,{error:'Speech too large'});return}if(narrationCache.size>160)narrationCache.clear();narrationCache.set('dynamic:'+key,b);res.writeHead(200,{'Content-Type':'audio/mpeg','Cache-Control':'private,max-age=300','X-Content-Type-Options':'nosniff'});res.end(b);return}
  catch{json(res,502,{error:'Speech service timed out'});return}
 }
 if(route==='director-reply'){
  const scene=Number(body.scene), kind=String(body.kind||''), statement=String(body.statement||'').trim(),question=String(body.question||'').trim(),language=requestedLang(body.language);
  if(!Number.isInteger(scene)||scene<0||scene>12||!['student_answer','student_question','followup','recap'].includes(kind)||statement.length<2||statement.length>460||question.length>280){json(res,400,{error:'Invalid classroom interaction'});return}
  const topics=['introduction to AI and noticing problems','AI or ordinary machine','learning from examples, recognizing cats dogs, mistakes','translation accessibility medical image support environmental monitoring','use AI to understand concepts not copy homework','goal details audience output, better prompts','water wastage at school','designing a safe water-saving helper concept','prepared illustration versus actual working machine','improving a prototype by noticing missing sensor','verification privacy AI mistakes','formative quiz discussion','project reflection and safe testing'];
  const directorPolicy=`You are NOVA, a warm, enthusiastic, thoughtful Class 3 AI teacher. This is an adult-operated sales simulation, with ONLY fictional pupils. You are explicitly an AI guide. Your goal is critical thinking, clear explanations, and meaningful follow-up, not praise for everything. Use simple 8-9 year-old language, 2-4 very natural spoken sentences, 65 words maximum. Current verified lesson topic: ${topics[scene]}. Stay within this topic and useful adjacent elementary science. Explain uncertainty, don't invent real class history, real performance or personal details. Do not collect private information. Do not assign marks or definitive scores to subjective spoken answers. For a wrong answer, offer one concrete hint, then ask the child to try again. For a correct answer, say why and make one real-world connection. For a question, answer directly and invite thinking. Accept the simulated student answering in any supported language, including Urdu or Arabic. ALWAYS write this endpoint response in simple English for onscreen reading; the speech service handles spoken localization. Do not force a child to reply in English. If unrelated, bring it back gently. Never claim to actually move a slide. The lesson is fictional and does not enroll actual children.`;
  try{const u=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:TEXT_MODEL,instructions:directorPolicy,input:`Interaction: ${kind}. NOVA asked: ${question||'What have we learned?'}\nAdult role-playing a fictional pupil said: ${statement}\nGive your natural short teacher response.`,max_output_tokens:190}),signal:AbortSignal.timeout(19000)});
  if(!u.ok){json(res,502,{error:'AI teacher reply unavailable'});return}const d=await u.json();const answer=String(d.output_text||d.output?.flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join(' ')||'').trim().slice(0,650);if(!answer){json(res,502,{error:'Empty teacher response'});return}json(res,200,{answer,mode:'live-ai',kind});return}
  catch{json(res,502,{error:'AI teacher response timed out'});return}
 }
}
if(url.pathname==='/api/narration'){
 if(req.method!=='GET'){json(res,405,{error:'GET required'});return}
 const sc=Number(url.searchParams.get('scene')),language=requestedLang(url.searchParams.get('language')||'en');
 if(!Number.isInteger(sc)||sc<0||sc>=approvedNarrations.length){json(res,400,{error:'Invalid approved scene'});return}
 if(!API_KEY){json(res,503,{error:'Professional AI narration requires a privately configured OPENAI_API_KEY'});return}
 if(narrationCache.has('approved:'+sc+':'+language+':'+safeVoice(DEFAULT_VOICE))){res.writeHead(200,{'Content-Type':'audio/mpeg','Cache-Control':'private,max-age=3600','X-Content-Type-Options':'nosniff'});res.end(narrationCache.get('approved:'+sc+':'+language+':'+safeVoice(DEFAULT_VOICE)));return}
 const day=new Date().toISOString().slice(0,10);const key='tts:'+principal.user+':'+day;const count=generationCounts.get(key)||0;
 if(count>=30){json(res,429,{error:'Prepared narration usage limit reached'});return}
 generationCounts.set(key,count+1);
 let upstream;try{upstream=await fetch('https://api.openai.com/v1/audio/speech',{method:'POST',headers:{Authorization:`Bearer ${API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:TTS_MODEL,voice:safeVoice(DEFAULT_VOICE),input:language==='en'?approvedNarrations[sc]:await translateSingle(approvedNarrations[sc],language,'speech'),instructions:teacherVoiceStyle+' '+nativeVoiceGuide[language],response_format:'mp3',speed:1.0}),signal:AbortSignal.timeout(42000)})}catch(e){json(res,502,{error:'Professional narration connection unavailable'});return}
 if(!upstream.ok){json(res,502,{error:'Professional narration service rejected request'});return}
 const audioBuffer=Buffer.from(await upstream.arrayBuffer());if(audioBuffer.length>1500000){json(res,502,{error:'Audio response exceeded limit'});return}
 narrationCache.set('approved:'+sc+':'+language+':'+safeVoice(DEFAULT_VOICE),audioBuffer);
 res.writeHead(200,{'Content-Type':'audio/mpeg','Cache-Control':'private,max-age=3600','X-Content-Type-Options':'nosniff'});res.end(audioBuffer);return
}
if(url.pathname==='/api/ask'){
 if(req.method!=='POST'){json(res,405,{error:'POST required'});return}
 if(!API_KEY){json(res,503,{error:'AI text service not configured'});return}
 const day=new Date().toISOString().slice(0,10);const key='ask:'+principal.user+':'+day;const count=generationCounts.get(key)||0;
 if(count>=50){json(res,429,{error:'Daily adult demo Q&A limit reached'});return}
 let arg;try{arg=JSON.parse(await getBody(req))}catch{json(res,400,{error:'Invalid JSON body'});return}
 if(!Number.isInteger(arg.scene)||arg.scene<0||arg.scene>12||typeof arg.question!=='string'||arg.question.length>400||arg.question.trim().length<2){json(res,400,{error:'Invalid adult demo question or scene'});return}
 generationCounts.set(key,count+1);const language=requestedLang(arg.language);
 const topics=['introduction to useful AI','ordinary machines versus AI','learning patterns from examples','AI use in translation accessibility health and environment','learning versus copying homework','clear instructions and prompt building','school water wastage','designing a water saving helper safely','illustration is not a tested invention','improving a missing sensor warning feature','fact checking and safety','assessment of AI concepts','reflecting on invention design'];
 try{const upstream=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:TEXT_MODEL,max_output_tokens:220,instructions:'You are NOVA, an AI instructor for a private adult-operated Class 3 demonstration. Not a human. Explain only approved topics: elementary AI applications, model patterns, AI limitations, safe use, learning prompts, water-saving invention concepts, images not equal to real devices. Adult is evaluating, no real children. Never solicit personal data, make grades, or claim images were generated live. Answer factually in up to three short sentences. Offer a useful follow-up question when appropriate. For Urdu speech mode respond in English for on-screen text; for other selected languages respond naturally in that selected language. Accept questions typed in any language. Selected language: '+LANGUAGES[language]+'. Current approved lesson topic: '+topics[arg.scene]+'.',input:arg.question}),signal:AbortSignal.timeout(18000)});
 if(!upstream.ok){json(res,502,{error:'Live AI text reply unavailable'});return}
 const data=await upstream.json();const output=String(data.output_text||data.output?.flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join(' ')||'').slice(0,950);
 if(!output){json(res,502,{error:'No answer returned'});return}
 json(res,200,{answer:output,mode:'live-ai',scene:arg.scene});return
 }catch{json(res,502,{error:'Live AI text reply unavailable'});return}
}
if(url.pathname==='/api/realtime-token'){
const origin=req.headers.origin; if(origin){const scheme=(req.headers['x-forwarded-proto']||'http').split(',')[0];const requestedHost=req.headers['x-forwarded-host']||req.headers.host;const expected=scheme+'://'+requestedHost;if(origin!==expected){json(res,403,{error:'Invalid request origin'});return}}
if(req.method!=='POST'){json(res,405,{error:'POST required'});return}
if(!API_KEY){json(res,503,{error:'OPENAI_API_KEY is not configured on the server. Revoke the old exposed key and supply a new one privately.'});return}
const now=Date.now(),ip=(req.socket.remoteAddress||'local')+':'+principal.user;const day=new Date(now).toISOString().slice(0,10);const dailyKey=principal.user+':'+day;
const used=dailyLimits.get(dailyKey)||0;if(used>=MAX_DAILY_SESSIONS){json(res,429,{error:'Daily live voice session limit reached. Try again tomorrow or contact the demo owner.'});return}
const entries=(limits.get(ip)||[]).filter(t=>now-t<WINDOW);if(entries.length>=MAX_REQUESTS){json(res,429,{error:'Rate limit reached. Try again later.'});return}entries.push(now);limits.set(ip,entries);
let input={};try{input=JSON.parse(await getBody(req))}catch{json(res,400,{error:'Invalid request'});return}
const voice=safeVoice(input.voice),language=requestedLang(input.language);const approvedScene=Number.isInteger(input.scene)&&input.scene>=0&&input.scene<=12?input.scene:0;
const sceneTopics=['intro and saving school water','AI versus non-AI','models learn patterns and make mistakes','translation medical review accessibility and environment','AI for learning not copying','building useful prompts','identifying school water waste','designing a safe water-saving concept','prepared illustration not live generated','spotting an absent sensor and improving','AI errors privacy and verification','five-question formative quiz','reflection on student decisions and testing'];
const scenePolicy=policy+' CRITICAL SPEECH LANGUAGE: '+LANGUAGES[language]+'. '+nativeVoiceGuide[language]+' Speak and answer orally ONLY in the selected language. For Urdu spoken mode, the lesson slides remain in English; speak in native Pakistani Urdu without translating displayed UI. Current approved Class 3 Invention Lab scene: '+sceneTopics[approvedScene]+'. The operator must finish the scene interaction before asking to advance. No child participants; audio consent from an adult only.';
const body={session:{type:'realtime',model:MODEL,instructions:scenePolicy,audio:{output:{voice},input:{turn_detection:{type:'semantic_vad',eagerness:'medium',create_response:true,interrupt_response:true}}},tools:[slideTool],tool_choice:'auto'}};
const identifier=crypto.createHash('sha256').update('nova-adult-demo:'+principal.user).digest('hex');
let result;try{result=await fetch('https://api.openai.com/v1/realtime/client_secrets',{method:'POST',headers:{Authorization:`Bearer ${API_KEY}`,'Content-Type':'application/json','OpenAI-Safety-Identifier':identifier},body:JSON.stringify(body),signal:AbortSignal.timeout(16000)})}catch(e){json(res,502,{error:'Could not reach OpenAI Realtime service: '+e.message});return}
const data=await result.json().catch(()=>({}));if(result.ok)dailyLimits.set(dailyKey,used+1);if(!result.ok){json(res,result.status===401?401:502,{error:'OpenAI rejected the token request: '+'Please verify your API key, organization billing and model permissions'});return}
json(res,200,{value:data.value,expires_at:data.expires_at});return
}
if(req.method!=='GET'&&req.method!=='HEAD'){json(res,405,{error:'Method not allowed'});return}
let file=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname).replace(/^\/+/, '');
if(!allowedFiles.has(file)){json(res,403,{error:'Restricted path'});return}
const ext=path.extname(file).toLowerCase();if(!types[ext]){json(res,404,{error:'Not found'});return}
const loc=path.resolve(PUBLIC,file);if(!loc.startsWith(PUBLIC+path.sep)){json(res,403,{error:'Restricted path'});return}
fs.stat(loc,(err,stats)=>{if(err||!stats.isFile()){json(res,404,{error:'Not found'});return}res.writeHead(200,{'Content-Type':types[ext],'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Permissions-Policy':'microphone=(self), camera=()','Cache-Control':ext==='.html'?'no-store':'public, max-age=600','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://api.openai.com; media-src 'self' blob:; object-src 'none'; frame-ancestors 'none'; base-uri 'self'"});if(req.method==='HEAD')res.end();else fs.createReadStream(loc).pipe(res)})
}catch(e){console.error('Demo server error:',e.message);if(!res.headersSent)json(res,500,{error:'Server error'})}
});server.listen(PORT,HOST,()=>console.log(`NOVA adult demo available at http://${HOST}:${PORT}/live-classroom.html. OpenAI configured: ${!!API_KEY}`));
