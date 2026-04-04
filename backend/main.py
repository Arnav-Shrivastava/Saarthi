from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import base64
from dotenv import load_dotenv
from twilio.twiml.messaging_response import MessagingResponse
from twilio.twiml.voice_response import VoiceResponse, Gather
import requests
from contextlib import asynccontextmanager

load_dotenv()

from rag_engine import rag_engine
from openai import OpenAI
from scheme_recommender import (
    recommend_schemes,
    is_recommendation_request,
    format_whatsapp_recommendation,
    format_voice_recommendation,
    verify_scheme_message,
)
from pydantic import BaseModel
from typing import Optional

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize RAG on startup
    success = rag_engine.load_documents()
    if success:
        print(f"RAG Engine loaded successfully with {len(rag_engine.vector_db.docstore._dict) if rag_engine.vector_db else 0} entries.")
    else:
        print("No documents found in data folder. RAG might not work yet.")
    yield

app = FastAPI(
    title="Saarthi API", 
    description="Multilingual Assistant for Citizens",
    lifespan=lifespan
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# System components initialized in lifespan above
# Simple in-memory chat history storage
# Key is user ID (IP for web, phone number for WhatsApp/Voice)
chat_histories = {}

# WhatsApp recommendation conversation state
# Tracks which step of the profile collection we're on per user
whatsapp_recommend_state: dict[str, dict] = {}

WA_RECOMMEND_STEPS = ["occupation", "income", "land_size", "age"]

WA_QUESTIONS = {
    "occupation": {
        "English": "🎯 Great! Let me find schemes for you.\n\nFirst: What is your occupation?\nReply with: *farmer*, *student*, *msme* (business), *labour*, *senior_citizen*, or *other*",
        "Hindi": "🎯 बढ़िया! मैं आपके लिए योजनाएं खोजता हूं।\n\nपहला सवाल: आपका पेशा क्या है?\nजवाब दें: *किसान*, *छात्र*, *व्यवसाय*, *मजदूर*, *वरिष्ठ नागरिक*, या *अन्य*",
        "Tamil": "🎯 சரி! உங்களுக்கான திட்டங்களை தேடுகிறேன்.\n\nமுதல் கேள்வி: உங்கள் தொழில் என்ன?\nபதில்: *விவசாயி*, *மாணவர்*, *தொழில்*, *தொழிலாளி*, *மூத்த குடிமகன்*, அல்லது *மற்றவர்*",
        "Telugu": "🎯 సరే! మీకు పథకాలు కనుగొంటాను.\n\nమొదటి ప్రశ్న: మీ వృత్తి ఏమిటి?\nసమాధానం: *రైతు*, *విద్యార్థి*, *వ్యాపారం*, *కూలీ*, *వృద్ధుడు*, లేదా *ఇతరులు*",
        "Bengali": "🎯 ঠিক আছে! আপনার জন্য প্রকল্প খুঁজছি।\n\nপ্রথম প্রশ্ন: আপনার পেশা কী?\nউত্তর দিন: *কৃষক*, *ছাত্র*, *ব্যবসা*, *শ্রমিক*, *প্রবীণ*, বা *অন্য*",
        "Marathi": "🎯 छान! मी तुमच्यासाठी योजना शोधतो.\n\nपहिला प्रश्न: तुमचा व्यवसाय काय आहे?\nउत्तर द्या: *शेतकरी*, *विद्यार्थी*, *व्यवसाय*, *मजूर*, *ज्येष्ठ नागरिक*, किंवा *इतर*",
        "Kannada": "🎯 ಸರಿ! ನಿಮಗಾಗಿ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕುತ್ತೇನೆ.\n\nಮೊದಲ ಪ್ರಶ್ನೆ: ನಿಮ್ಮ ವೃತ್ತಿ ಏನು?\nಉತ್ತರ: *ರೈತ*, *ವಿದ್ಯಾರ್ಥಿ*, *ವ್ಯಾಪಾರ*, *ಕಾರ್ಮಿಕ*, *ಹಿರಿಯ ನಾಗರಿಕ*, ಅಥವಾ *ಇತರೆ*",
        "Gujarati": "🎯 સારું! તમારા માટે યોજનાઓ શોધું.\n\nપ્રથમ પ્રશ્ન: તમારો વ્યવસાય શું છે?\nજવાબ: *ખેડૂત*, *વિદ્યાર્થી*, *ધંધો*, *મજૂર*, *વૃદ્ધ*, અથવા *અન્ય*",
        "Punjabi": "🎯 ਠੀਕ ਹੈ! ਤੁਹਾਡੇ ਲਈ ਯੋਜਨਾਵਾਂ ਲੱਭਦਾ ਹਾਂ।\n\nਪਹਿਲਾ ਸਵਾਲ: ਤੁਹਾਡਾ ਕਿੱਤਾ ਕੀ ਹੈ?\nਜਵਾਬ: *ਕਿਸਾਨ*, *ਵਿਦਿਆਰਥੀ*, *ਕਾਰੋਬਾਰ*, *ਮਜ਼ਦੂਰ*, *ਬਜ਼ੁਰਗ*, ਜਾਂ *ਹੋਰ*",
        "Malayalam": "🎯 ശരി! നിങ്ങൾക്കുള്ള പദ്ധതികൾ കണ്ടെത്തുന്നു.\n\nആദ്യ ചോദ്യം: നിങ്ങളുടെ തൊഴിൽ എന്താണ്?\nഉത്തരം: *കർഷകൻ*, *വിദ്യാർഥി*, *ബിസിനസ്*, *തൊഴിലാളി*, *മുതിർന്ന പൗരൻ*, അല്ലെങ്കിൽ *മറ്റ്*",
    },
    "income": {
        "English": "💰 What is your approximate *annual income* in rupees?\nReply with a number (e.g. *100000* for ₹1 lakh, *300000* for ₹3 lakh)",
        "Hindi": "💰 आपकी लगभग *वार्षिक आय* कितनी है?\nरुपये में संख्या लिखें (जैसे *100000* = ₹1 लाख, *300000* = ₹3 लाख)",
        "Tamil": "💰 உங்கள் *ஆண்டு வருமானம்* தோராயமாக எவ்வளவு?\nரூபாயில் எண் கொடுங்கள் (எ.கா: *100000* = ₹1 லட்சம்)",
        "Telugu": "💰 మీ సుమారు *వార్షిక ఆదాయం* ఎంత?\nరూపాయిలో సంఖ్య చెప్పండి (ఉదా: *100000* = ₹1 లక్ష)",
        "Bengali": "💰 আপনার আনুমানিক *বার্ষিক আয়* কত?\nটাকায় সংখ্যা লিখুন (যেমন *100000* = ₹১ লাখ)",
        "Marathi": "💰 तुमचे अंदाजे *वार्षिक उत्पन्न* किती आहे?\nरुपयांमध्ये संख्या लिहा (जसे *100000* = ₹1 लाख)",
        "Kannada": "💰 ನಿಮ್ಮ ಅಂದಾಜು *ವಾರ್ಷಿಕ ಆದಾಯ* ಎಷ್ಟು?\nರೂಪಾಯಿ ಸಂಖ್ಯೆಯಲ್ಲಿ ಹೇಳಿ (ಉದಾ: *100000* = ₹1 ಲಕ್ಷ)",
        "Gujarati": "💰 તમારી અંદાજિત *વાર્ષિક આવક* કેટલી છે?\nરૂપિયામાં સંખ્યા લખો (દા.ત. *100000* = ₹1 લાખ)",
        "Punjabi": "💰 ਤੁਹਾਡੀ ਲਗਭਗ *ਸਾਲਾਨਾ ਆਮਦਨ* ਕਿੰਨੀ ਹੈ?\nਰੁਪਏ ਵਿੱਚ ਨੰਬਰ ਲਿਖੋ (ਜਿਵੇਂ *100000* = ₹1 ਲੱਖ)",
        "Malayalam": "💰 നിങ്ങളുടെ ഏകദേശ *വാർഷിക വരുമാനം* എത്രയാണ്?\nരൂപയിൽ ഒരു സംഖ്യ നൽകുക (ഉദാ: *100000* = ₹1 ലക്ഷം)",
    },
    "land_size": {
        "English": "🌱 How many *acres of land* do you own? (Reply *0* if you don't own any land)",
        "Hindi": "🌱 आपके पास कितनी *एकड़ जमीन* है? (जमीन न होने पर *0* लिखें)",
        "Tamil": "🌱 உங்களிடம் எத்தனை *ஏக்கர் நிலம்* உள்ளது? (நிலம் இல்லையென்றால் *0* என்று பதிலளிக்கவும்)",
        "Telugu": "🌱 మీకు ఎన్ని *ఎకరాల భూమి* ఉంది? (భూమి లేకపోతే *0* అని చెప్పండి)",
        "Bengali": "🌱 আপনার কত *একর জমি* আছে? (জমি না থাকলে *0* লিখুন)",
        "Marathi": "🌱 तुमच्याकडे किती *एकर जमीन* आहे? (नसल्यास *0* लिहा)",
        "Kannada": "🌱 ನಿಮ್ಮ ಬಳಿ ಎಷ್ಟು *ಎಕರೆ ಜಮೀನು* ಇದೆ? (ಇಲ್ಲದಿದ್ದರೆ *0* ಎಂದು ಹೇಳಿ)",
        "Gujarati": "🌱 તમારી પાસે કેટલી *એકર જમીન* છે? (ન હોય તો *0* લખો)",
        "Punjabi": "🌱 ਤੁਹਾਡੇ ਕੋਲ ਕਿੰਨੀ *ਏਕੜ ਜ਼ਮੀਨ* ਹੈ? (ਨਾ ਹੋਣ ਤੇ *0* ਲਿਖੋ)",
        "Malayalam": "🌱 നിങ്ങൾക്ക് എത്ര *ഏക്കർ ഭൂമി* ഉണ്ട്? (ഇല്ലെങ്കിൽ *0* എന്ന് ഉത്തരം നൽകുക)",
    },
    "age": {
        "English": "🎂 Almost done! What is your *age*? (Just the number, e.g. *35*)",
        "Hindi": "🎂 लगभग हो गया! आपकी *उम्र* क्या है? (बस संख्या, जैसे *35*)",
        "Tamil": "🎂 கிட்டத்தட்ட முடிந்தது! உங்கள் *வயது* என்ன? (எண் மட்டும், எ.கா: *35*)",
        "Telugu": "🎂 దాదాపు అయింది! మీ *వయసు* ఎంత? (కేవలం సంఖ్య, ఉదా: *35*)",
        "Bengali": "🎂 প্রায় শেষ! আপনার *বয়স* কত? (শুধু সংখ্যা, যেমন *35*)",
        "Marathi": "🎂 जवळजवळ झाले! तुमचे *वय* किती आहे? (फक्त संख्या, जसे *35*)",
        "Kannada": "🎂 ಬಹುತೇಕ ಮುಗಿಯಿತು! ನಿಮ್ಮ *ವಯಸ್ಸು* ಎಷ್ಟು? (ಕೇವಲ ಸಂಖ್ಯೆ, ಉದಾ: *35*)",
        "Gujarati": "🎂 લગભગ પૂર્ણ! તમારી *ઉંમર* કેટલી છે? (ફક્ત સંખ્યા, જેમ કે *35*)",
        "Punjabi": "🎂 ਲਗਭਗ ਹੋ ਗਿਆ! ਤੁਹਾਡੀ *ਉਮਰ* ਕੀ ਹੈ? (ਸਿਰਫ਼ ਨੰਬਰ, ਜਿਵੇਂ *35*)",
        "Malayalam": "🎂 ഏതാണ്ട് കഴിഞ്ഞു! നിങ്ങളുടെ *പ്രായം* എത്ര? (ഒരു സംഖ്യ, ഉദാ: *35*)",
    },
}

OCCUPATION_MAP = {
    # English
    "farmer": "farmer", "farming": "farmer", "agriculture": "farmer", "kisan": "farmer",
    "student": "student", "studying": "student", "school": "student", "college": "student",
    "msme": "msme", "business": "msme", "entrepreneur": "msme", "shop": "msme",
    "labour": "labour", "worker": "labour", "labourer": "labour", "mgnrega": "labour",
    "senior": "senior_citizen", "senior citizen": "senior_citizen", "old": "senior_citizen", "pensioner": "senior_citizen",
    # Hindi
    "किसान": "farmer", "कृषक": "farmer",
    "छात्र": "student", "विद्यार्थी": "student",
    "व्यवसाय": "msme", "दुकानदार": "msme",
    "मजदूर": "labour", "श्रमिक": "labour",
    "वरिष्ठ नागरिक": "senior_citizen", "बुजुर्ग": "senior_citizen",
    # Tamil
    "விவசாயி": "farmer", "மாணவர்": "student", "தொழில்": "msme",
    "தொழிலாளி": "labour", "மூத்த குடிமகன்": "senior_citizen",
    # Telugu
    "రైతు": "farmer", "విద్యార్థి": "student", "వ్యాపారం": "msme",
    "కూలీ": "labour", "వృద్ధుడు": "senior_citizen",
    # Bengali
    "কৃষক": "farmer", "ছাত্র": "student", "ব্যবসা": "msme",
    "শ্রমিক": "labour", "প্রবীণ": "senior_citizen",
    # Marathi
    "शेतकरी": "farmer", "विद्यार्थी": "student", "व्यवसाय": "msme",
    "मजूर": "labour", "ज्येष्ठ नागरिक": "senior_citizen",
    # Kannada
    "ರೈತ": "farmer", "ವಿದ್ಯಾರ್ಥಿ": "student", "ವ್ಯಾಪಾರ": "msme",
    "ಕಾರ್ಮಿಕ": "labour", "ಹಿರಿಯ ನಾಗರಿಕ": "senior_citizen",
    # Gujarati
    "ખેડૂત": "farmer", "વિદ્યાર્થી": "student", "ધંધો": "msme",
    "મજૂર": "labour", "વૃદ્ધ": "senior_citizen",
    # Punjabi
    "ਕਿਸਾਨ": "farmer", "ਵਿਦਿਆਰਥੀ": "student", "ਕਾਰੋਬਾਰ": "msme",
    "ਮਜ਼ਦੂਰ": "labour", "ਬਜ਼ੁਰਗ": "senior_citizen",
    # Malayalam
    "കർഷകൻ": "farmer", "വിദ്യാർഥി": "student", "ബിസിനസ്": "msme",
    "തൊഴിലാളി": "labour", "മുതിർന്ന പൗരൻ": "senior_citizen",
    # Generic fallbacks for 'other' in each language
    "other": "other", "others": "other", "अन्य": "other", "इतर": "other",
    "மற்றவர்": "other", "ఇతరులు": "other", "অন্য": "other",
    "ಇತರೆ": "other", "અન્ય": "other", "ਹੋਰ": "other", "മറ്റ്": "other",
}

def get_history(user_id: str):
    if user_id not in chat_histories:
        chat_histories[user_id] = []
    return chat_histories[user_id]

def add_to_history(user_id: str, message: str, role: str):
    history = get_history(user_id)
    history.append({"type": role, "text": message})
    # Keep only last 10 messages to save memory
    if len(chat_histories[user_id]) > 10:
        chat_histories[user_id] = chat_histories[user_id][-10:]

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Saarthi API"}

# ---------------------------------------------------------------------------
# Pydantic model for /recommend
# ---------------------------------------------------------------------------
class ComplaintRequest(BaseModel):
    story: str
    language: str = "English"
    recipient: str = "Police Station"

class RecommendRequest(BaseModel):
    occupation: str
    income: float = 0
    state: str = "All India"
    land_size: float = 0
    age: int = 25
    language: str = "English"


@app.post("/draft-complaint")
async def draft_complaint(req: ComplaintRequest):
    """
    Drafts a formal structured legal complaint/FIR based on user's natural language story.
    Returns the drafted text in the requested language.
    """
    try:
        response = client.chat.completions.create(
            model="gpt-5-mini",
            messages=[
                {
                    "role": "user",
                    "content": f"You are an expert Indian legal assistant.\n"
                               f"Translate and format the following casual story into a formal, structured official complaint addressed to the {req.recipient} in {req.language}.\n"
                               f"Maintain a respectful, formal, and objective legal tone.\n"
                               f"Include standard placeholders like [Date], [Your Name], [Your Address], and [Signature] where appropriate.\n"
                               f"Ensure the chronological order of events is clear and any demands for action/investigation are formally stated at the end.\n\n"
                               f"Story:\n{req.story}"
                }
            ],
            max_completion_tokens=800
        )
        draft = response.choices[0].message.content
        return {"draft": draft}
    except Exception as e:
        print(f"Complaint Drafter Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommend")
async def recommend(req: RecommendRequest):
    """Personalised multilingual scheme recommendation endpoint."""
    try:
        profile = {
            "occupation": req.occupation.lower().strip(),
            "income": req.income,
            "state": req.state,
            "land_size": req.land_size,
            "age": req.age,
        }
        schemes = recommend_schemes(profile, language=req.language, llm=rag_engine.llm, vector_db=rag_engine.vector_db)
        return {
            "schemes": schemes,
            "count": len(schemes),
            "language": req.language,
            "profile_summary": (
                f"{req.occupation.title()}, {req.state}, "
                f"land: {req.land_size}ac, income: ₹{int(req.income):,}, age: {req.age}"
            ),
        }
    except Exception as e:
        print(f"Recommend Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat")
async def chat(message: str = Form(...), language: str = Form("English")):
    try:
        # Use a static ID for web for now (real apps would use sessions/auth)
        user_id = "web-user-default"
        history = get_history(user_id)
        
        result = rag_engine.query(message, language=language, chat_history=history)
        
        # Save to history
        add_to_history(user_id, message, "user")
        add_to_history(user_id, result["answer"], "saarthi")
        
        return {
            "user_message": message,
            "language": language,
            "saarthi_response": result["answer"],
            "sources": result.get("sources", []),
            "audio_url": None
        }
    except Exception as e:
        print(f"Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/whatsapp")
async def whatsapp_webhook(
    Body: str = Form(""), 
    From: str = Form(...), 
    MediaUrl0: str = Form(None), 
    MediaContentType0: str = Form(None)
):
    """
    Webhook for Twilio WhatsApp integration.
    Handles text, images, and PDFs.
    """
    try:
        print(f"--- Recieved WhatsApp Message from {From} ---")
        
        twiml = MessagingResponse()
        
        # 1. HANDLE MEDIA (Images or PDFs)
        if MediaUrl0:
            print(f"--- Processing WhatsApp Media: {MediaContentType0} ---")
            
            # Twilio media usually requires auth to download
            twilio_sid = os.getenv("TWILIO_ACCOUNT_SID")
            twilio_token = os.getenv("TWILIO_AUTH_TOKEN")
            
            if twilio_sid and twilio_token:
                resp = requests.get(MediaUrl0, auth=(twilio_sid, twilio_token))
            else:
                resp = requests.get(MediaUrl0)
                
            if resp.status_code != 200:
                print(f"Error: Failed to download WhatsApp media. Status: {resp.status_code}")
                twiml.message("I'm sorry, I couldn't download the image you sent. Please make sure your Twilio credentials are set correctly.")
                return Response(content=str(twiml), media_type="application/xml")
                
            media_content = resp.content
            
            # --- IMAGE HANDLING ---
            if MediaContentType0.startswith("image/"):
                base64_image = base64.b64encode(media_content).decode('utf-8')
                
                # Standardize MIME type for OpenAI
                mime_type = MediaContentType0
                if "jpeg" in mime_type or "jpg" in mime_type or "pjpeg" in mime_type:
                    mime_type = "image/jpeg"
                
                # Determine response language: prioritize the language of the user's question (Body)
                response_lang = "the same language as the document"
                if Body:
                    response_lang = rag_engine._detect_language(Body)

                # Use auto-language detection logic indirectly by asking Vision to detect
                response = client.chat.completions.create(
                    model="gpt-5-mini",
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "text",
                                    "text": (
                                        f"You are Saarthi, a helpful assistant for rural citizens of India. "
                                        f"Read everything in this image carefully and explain what it says in very simple, "
                                        f"everyday words in {response_lang}. "
                                        f"{'If ' + response_lang + ' is not English, first detect the document language.' if response_lang != 'English' else ''} "
                                        f"Explain it as if you are talking to a farmer who hasn't studied much. "
                                        f"Avoid jargon. Mention important dates/amounts clearly."
                                    )
                                },
                                {
                                    "type": "image_url",
                                    "image_url": {"url": f"data:{mime_type};base64,{base64_image}"},
                                },
                            ],
                        }
                    ],
                    max_completion_tokens=800,
                )
                answer = response.choices[0].message.content
                
                # --- AUTO SCAM CHECK FOR IMAGES ---
                print("--- WhatsApp: Checking OCR text for scams ---")
                verdict = verify_scheme_message(answer, language=response_lang, llm=rag_engine.llm, vector_db=rag_engine.vector_db)
                
                if verdict.get("verdict") in ["Fake", "Suspicious"]:
                    icon = "❌" if verdict["verdict"] == "Fake" else "⚠️"
                    answer += f"\n\n{icon} *SAARTHI SCAM ALERT: {verdict['verdict'].upper()}*\n"
                    answer += f"🛡️ *Reasoning:* {verdict.get('reasoning')}\n"
                    if verdict.get("official_details"):
                        answer += f"\n✅ *Actual Official Details:* {verdict['official_details']}"
                elif verdict.get("verdict") == "Authentic":
                    answer += f"\n\n✅ *SAARTHI VERIFIED: AUTHENTIC*\n"
                    answer += f"🛡️ *Reasoning:* This matches our official government records."

                twiml.message(answer)
                return Response(content=str(twiml), media_type="application/xml")

            # --- PDF HANDLING ---
            elif MediaContentType0 == "application/pdf":
                # Create a filename based on timestamp or something unique
                import time
                filename = f"whatsapp_upload_{int(time.time())}.pdf"
                base_dir = os.path.dirname(os.path.abspath(__file__))
                data_dir = os.path.join(base_dir, "data")  # absolute path
                if not os.path.exists(data_dir):
                    os.makedirs(data_dir)
                
                file_path = os.path.join(data_dir, filename)
                with open(file_path, "wb") as f:
                    f.write(media_content)
                
                # --- AUTO SCAM CHECK FOR PDFs ---
                from langchain_community.document_loaders import PyPDFLoader
                try:
                    loader = PyPDFLoader(file_path)
                    docs = loader.load()
                    pdf_text = " ".join([d.page_content for d in docs])
                    
                    print("--- WhatsApp: Checking PDF text for scams ---")
                    verify_lang = rag_engine._detect_language(Body) if Body else "English"
                    
                    # We might need to reduce the size of pdf_text if it's too huge, but usually GPT can handle standard scheme PDFs.
                    # We'll take the first 4000 characters for the scam check to save tokens and prevent timeouts.
                    check_text = pdf_text[:4000]
                    
                    verdict = verify_scheme_message(check_text, language=verify_lang, llm=rag_engine.llm, vector_db=rag_engine.vector_db)
                    
                    if verdict.get("verdict") in ["Fake", "Suspicious"]:
                        # Delete the file so it doesn't pollute the RAG database
                        os.remove(file_path)
                        icon = "❌" if verdict["verdict"] == "Fake" else "⚠️"
                        
                        answer = f"{icon} *SAARTHI SCAM ALERT: {verdict['verdict'].upper()}*\n\n"
                        answer += f"🛡️ *Reasoning:* I have scanned the PDF you sent and it appears to be fraudulent. {verdict.get('reasoning')}\n\n"
                        answer += "🚫 *This document has NOT been saved to my memory.*"
                        
                        if verify_lang != "English":
                            # Translate the rejection message
                            msg_resp = client.chat.completions.create(
                                model="gpt-5-mini",
                                messages=[{"role": "user", "content": f"Translate this message concisely to {verify_lang}: {answer}"}]
                            )
                            answer = msg_resp.choices[0].message.content
                            
                        twiml.message(answer)
                        return Response(content=str(twiml), media_type="application/xml")
                    else:
                        # Re-index RAG only if it is Authentic
                        rag_engine.load_documents(force_reload=True)
                        
                        msg = f"✅ *VERIFIED: AUTHENTIC*\n\nI've received your PDF document '{filename}' and verified its authenticity. It is a genuine scheme document!\n\nI'm adding it to my memory now. You can start asking me questions about it!"
                        if verify_lang != "English":
                            # Simple translate/re-generate confirmation
                            msg_resp = client.chat.completions.create(
                                model="gpt-5-mini",
                                messages=[{"role": "user", "content": f"Translate this message concisely to {verify_lang}: {msg}"}]
                            )
                            msg = msg_resp.choices[0].message.content
                        
                        twiml.message(msg)
                        return Response(content=str(twiml), media_type="application/xml")
                
                except Exception as e:
                    print("Error parsing PDF:", e)
                    if os.path.exists(file_path):
                        os.remove(file_path)
                    error_msg = "Sorry, I couldn't read that PDF. Please send a clearer document or an image."
                    if Body and rag_engine._detect_language(Body) != "English":
                        error_msg = f"Sorry, I couldn't read that PDF." # Simplified translation for error case.
                    twiml.message(error_msg)
                    return Response(content=str(twiml), media_type="application/xml")

        # 2. HANDLE TEXT ONLY (or caption with media if wasn't returned earlier)
        user_message = Body
        if not user_message:
            twiml.message("Namaste! I am Saarthi. How can I help you today?")
            return Response(content=str(twiml), media_type="application/xml")

        # ── Recommendation State Machine ───────────────────────────────────────
        # Step A: Check if user is mid-recommendation-flow
        if From in whatsapp_recommend_state:
            state = whatsapp_recommend_state[From]
            step = state.get("step")
            lang = state.get("language", "English")

            if step == "occupation":
                # Map multilingual occupation answer to canonical value
                occ_key = user_message.strip().lower()
                occupation = OCCUPATION_MAP.get(occ_key) or OCCUPATION_MAP.get(user_message.strip(), "other")
                # Prefix match fallback
                if occupation == "other":
                    for k, v in OCCUPATION_MAP.items():
                        if k in occ_key:
                            occupation = v
                            break
                state["profile"]["occupation"] = occupation
                state["step"] = "income"
                twiml.message(WA_QUESTIONS["income"].get(lang, WA_QUESTIONS["income"]["English"]))
                return Response(content=str(twiml), media_type="application/xml")

            elif step == "income":
                try:
                    income = float("".join(filter(lambda c: c.isdigit() or c == ".", user_message)))
                except Exception:
                    income = 0
                state["profile"]["income"] = income
                state["step"] = "land_size"
                twiml.message(WA_QUESTIONS["land_size"].get(lang, WA_QUESTIONS["land_size"]["English"]))
                return Response(content=str(twiml), media_type="application/xml")

            elif step == "land_size":
                try:
                    land = float("".join(filter(lambda c: c.isdigit() or c == ".", user_message)))
                except Exception:
                    land = 0
                state["profile"]["land_size"] = land
                state["step"] = "age"
                twiml.message(WA_QUESTIONS["age"].get(lang, WA_QUESTIONS["age"]["English"]))
                return Response(content=str(twiml), media_type="application/xml")

            elif step == "age":
                try:
                    age = int("".join(filter(str.isdigit, user_message)))
                except Exception:
                    age = 25
                state["profile"]["age"] = age

                # All data collected — run recommendation
                del whatsapp_recommend_state[From]
                profile = state["profile"]
                schemes = recommend_schemes(profile, language=lang, llm=rag_engine.llm, vector_db=rag_engine.vector_db)
                answer = format_whatsapp_recommendation(schemes, lang)
                twiml.message(answer)
                return Response(content=str(twiml), media_type="application/xml")

        # Step B: Check if this is a new recommendation request
        if is_recommendation_request(user_message):
            detected_lang = rag_engine._detect_language(user_message)
            whatsapp_recommend_state[From] = {
                "step": "occupation",
                "language": detected_lang,
                "profile": {"state": "All India"},
            }
            question = WA_QUESTIONS["occupation"].get(detected_lang, WA_QUESTIONS["occupation"]["English"])
            twiml.message(question)
            return Response(content=str(twiml), media_type="application/xml")
        # ── End Recommendation State Machine ───────────────────────────────────

        # Step B.5: Check if user wants to draft a complaint/FIR
        if user_message.lower().strip().startswith("draft:") or user_message.lower().strip().startswith("draft ") or "complaint" in user_message.lower() or "शिकायत" in user_message.lower():
            # If the user says "draft: my neighbor stole my tractor", we extract "my neighbor stole my tractor"
            # If they just mention "complaint", we will see if we should treat it as a drafting request or general RAG.
            # We'll use a simple heuristic: if it starts with "draft", or contains a "complaint" intent that is clearly a drafting request.
            # For simplicity in this demo, let's process it if it has "draft" or "complaint".
            
            # check intent
            intent_check = client.chat.completions.create(
                model="gpt-5-mini",
                messages=[{"role": "user", "content": "Return 'TRUE' if the user is asking to write, draft, or format a complaint/FIR. Otherwise return 'FALSE'.\n\nUser message: " + user_message}],
            ).choices[0].message.content.strip()

            if "TRUE" in intent_check:
                print("--- WhatsApp: Complaint Drafting request detected ---")
                detected_lang = rag_engine._detect_language(user_message)
                # Draft the complaint
                try:
                    draft_resp = client.chat.completions.create(
                        model="gpt-5-mini",
                        messages=[
                            {
                                "role": "user",
                                "content": f"You are an expert Indian legal assistant.\n"
                                           f"Translate and format the following casual story into a formal, structured official complaint addressed to the Police Station or relevant authority in {detected_lang}.\n"
                                           f"Maintain a respectful, formal, and objective legal tone.\n"
                                           f"Include standard placeholders like [Date], [Your Name], [Your Address], and [Signature] where appropriate.\n"
                                           f"Ensure the chronological order of events is clear and any demands for action/investigation are formally stated at the end.\n\n"
                                           f"Story:\n{user_message}"
                            }
                        ],
                        max_completion_tokens=800
                    )
                    draft = draft_resp.choices[0].message.content
                    twiml.message(f"📝 *Saarthi Legal Draft*\n\n{draft}")
                    return Response(content=str(twiml), media_type="application/xml")
                except Exception as e:
                    print(f"WhatsApp Complaint Error: {e}")

        # Step C: AUTO SCAM DETECTION (New hackathon feature)
        # If message is long (forwarded style) or contains "fake/real/scam"
        scam_triggers = ["fake", "real", "scam", "fraud", "सही है", "फेक", "धोखा"]
        if len(user_message) > 150 or any(t in user_message.lower() for t in scam_triggers):
            print("--- WhatsApp: Potential Scam/Forward detected ---")
            verdict = verify_scheme_message(user_message, language="Auto", llm=rag_engine.llm, vector_db=rag_engine.vector_db)
            
            if verdict.get("verdict") in ["Fake", "Suspicious"]:
                icon = "❌" if verdict["verdict"] == "Fake" else "⚠️"
                response_text = f"{icon} *SAARTHI ALERT: {verdict['verdict'].upper()}*\n\n"
                response_text += f"🛡️ *Reasoning:* {verdict.get('reasoning')}\n\n"
                if verdict.get("official_details"):
                    response_text += f"✅ *Actual Official Details:* {verdict['official_details']}"
                
                twiml.message(response_text)
                return Response(content=str(twiml), media_type="application/xml")

        # Get history for this WhatsApp user
        history = get_history(From)

        # Query the RAG engine with history
        result = rag_engine.query(user_message, language="Auto", chat_history=history)
        answer = result["answer"]
        
        # Save to history
        add_to_history(From, user_message, "user")
        add_to_history(From, answer, "saarthi")
        
        # Add a small signature for WhatsApp
        if result.get("sources"):
            answer += "\n\n📄 Sources:"
            for i, src in enumerate(result["sources"][:2]):
                answer += f"\n[{i+1}] {src['filename']}"
                if src['page']:
                    answer += f" (p.{src['page']})"
        
        twiml.message(answer)
        return Response(content=str(twiml), media_type="application/xml")
        
    except Exception as e:
        print(f"WhatsApp Error: {e}")
        import traceback
        traceback.print_exc()
        twiml = MessagingResponse()
        twiml.message("I'm sorry, I'm having trouble thinking right now. Please try again later!")
        return Response(content=str(twiml), media_type="application/xml")

def _get_voice(detected_lang: str) -> tuple[str, str]:
    """Returns (voice_name, lang_code) for a given detected language name."""
    lang_voice_map = {
        "Hindi": ("Polly.Aditi", "hi-IN"),  # Polly Aditi supports Hindi natively
        "Tamil": ("Google.ta-IN-Standard-A", "ta-IN"),
        "Telugu": ("Google.te-IN-Standard-A", "te-IN"),
        "Bengali": ("Google.bn-IN-Standard-A", "bn-IN"),
        "Marathi": ("Google.mr-IN-Standard-A", "mr-IN"),
        "Kannada": ("Google.kn-IN-Standard-A", "kn-IN"),
        "Gujarati": ("Google.gu-IN-Standard-A", "gu-IN"),
        "Punjabi": ("Google.pa-IN-Standard-A", "pa-IN"),
        "Malayalam": ("Google.ml-IN-Standard-A", "ml-IN"),
    }
    for lang_key, (voice, code) in lang_voice_map.items():
        if lang_key.lower() in detected_lang.lower():
            return voice, code
    return "Polly.Aditi", "en-IN"  # default Indian English


@app.post("/voice")
async def voice_greeting():
    """Initial greeting for the voice helpline (Language Selection)."""
    try:
        print("--- Incoming Voice Call! ---")
        response = VoiceResponse()
        
        # IVR Language Selection
        gather = Gather(num_digits=1, action="/voice-language-select", timeout=12)
        # We speak the prompt in the respective languages
        gather.say("Welcome to Saarthi. For English, press 1.", voice="Polly.Aditi", language="en-IN")
        gather.say("सारथी में आपका स्वागत है। हिंदी के लिए, दो दबाएं।", voice="Polly.Aditi", language="hi-IN")
        gather.say("சாரதிக்கு வரவேற்கிறோம். தமிழுக்கு மூன்றை அழுத்தவும்.", voice="Google.ta-IN-Standard-A", language="ta-IN")
        gather.say("సారథికి స్వాగతం. తెలుగు కోసం నాలుగు నొక్కండి.", voice="Google.te-IN-Standard-A", language="te-IN")
        gather.say("सारथीमध्ये आपले स्वागत आहे. मराठीसाठी पाच दाबा.", voice="Google.mr-IN-Standard-A", language="mr-IN")
        gather.say("সারথিতে স্বাগতম। বাংলার জন্য ছয় চাপুন।", voice="Google.bn-IN-Standard-A", language="bn-IN")
        response.append(gather)
        
        # If they don't press anything
        response.say("I'm sorry, I didn't receive an input. Please call back. Good bye!", voice="Polly.Aditi", language="en-IN")
        
        return Response(content=str(response), media_type="text/xml")
    except Exception as e:
        print(f"Voice Error: {e}")
        return Response(content="<Response><Say>Internal Error</Say></Response>", media_type="text/xml")

@app.post("/voice-language-select")
async def voice_language_select(Digits: str = Form(None), From: str = Form(None)):
    """Handles the IVR language selection and prompts for the first question."""
    try:
        response = VoiceResponse()
        
        # Map digits to language codes
        lang_map = {
            "1": {"saarthi_lang": "English", "twilio_lang": "en-IN", "voice": "Polly.Aditi", "prompt": "Namaste! I am Saarthi, your helpful friend. How can I help you today? Please tell me your question now.", "fallback": "I'm sorry, I didn't hear anything. Please call back if you need help."},
            "2": {"saarthi_lang": "Hindi", "twilio_lang": "hi-IN", "voice": "Polly.Aditi", "prompt": "नमस्ते! मैं सारथी हूँ, आपका मददगार दोस्त। आज मैं आपकी कैसे मदद कर सकता हूँ? कृपया अपना सवाल अभी बताएं।", "fallback": "मुझे कुछ सुनाई नहीं दिया। कृपया फिर से कॉल करें।"},
            "3": {"saarthi_lang": "Tamil", "twilio_lang": "ta-IN", "voice": "Google.ta-IN-Standard-A", "prompt": "நமஸ்தே! நான் சாரதி, உங்கள் உதவிகரமான நண்பன். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்? தயவுசெய்து உங்கள் கேள்வியை இப்போது சொல்லுங்கள்.", "fallback": "மன்னிக்கவும், எனக்கு எதுவும் கேட்கவில்லை. தயவுசெய்து மீண்டும் அழைக்கவும்."},
            "4": {"saarthi_lang": "Telugu", "twilio_lang": "te-IN", "voice": "Google.te-IN-Standard-A", "prompt": "నమస్తే! నేను సారథి, మీ సహాయక స్నేహితుడిని. ఈ రోజు నేను మీకు ఎలా సహాయపడగలను? దయచేసి మీ ప్రశ్నను ఇప్పుడు చెప్పండి.", "fallback": "క్షమించండి, నాకు ఏమీ వినపడలేదు. దయచేసి మళ్లీ కాల్ చేయండి."},
            "5": {"saarthi_lang": "Marathi", "twilio_lang": "mr-IN", "voice": "Google.mr-IN-Standard-A", "prompt": "नमस्ते! मी सारथी आहे, तुमचा मदतीचा मित्र. आज मी तुम्हाला कशी मदत करू शकतो? कृपया आपला प्रश्न आता सांगा.", "fallback": "क्षमस्व, मला काहीही ऐकू आले नाही. कृपया पुन्हा कॉल करा."},
            "6": {"saarthi_lang": "Bengali", "twilio_lang": "bn-IN", "voice": "Google.bn-IN-Standard-A", "prompt": "নমস্তে! আমি সারথি, আপনার সাহায্যকারী বন্ধু। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি? দয়া করে এখন আপনার প্রশ্নটি বলুন।", "fallback": "দুঃখিত, আমি কিছু শুনতে পাইনি। অনুগ্রহ করে আবার কল করুন।"}
        }
        
        # Default to English if invalid input
        selection = lang_map.get(Digits, lang_map["1"])
        
        # Pass the selected language code to the voice-answer endpoint
        action_url = f"/voice-answer?lang_code={selection['twilio_lang']}&saarthi_lang={selection['saarthi_lang']}"
        
        # Add timeout to give them time to think before speaking
        gather = Gather(input="speech", action=action_url, timeout=10, speechTimeout="auto", language=selection['twilio_lang'])
        gather.say(selection['prompt'], voice=selection['voice'], language=selection['twilio_lang'])
        response.append(gather)
        
        # If they don't say anything
        response.say(selection['fallback'], voice=selection['voice'], language=selection['twilio_lang'])
        
        return Response(content=str(response), media_type="text/xml")
    except Exception as e:
        print(f"Language Select Error: {e}")
        return Response(content="<Response><Say>Internal Error</Say></Response>", media_type="text/xml")

@app.post("/voice-answer")
async def voice_answer(
    SpeechResult: str = Form(None), 
    From: str = Form(None),
    lang_code: str = "en-IN",
    saarthi_lang: str = "English"
):
    """Processes the speech transcript and speaks the answer back."""
    try:
        response = VoiceResponse()
        
        voice, _ = _get_voice(saarthi_lang) # We already know the language now

        if not SpeechResult:
            print("--- Voice: No speech detected ---")
            no_speech_reqs = {
                "English": "I'm sorry, I didn't quite catch that. Please tell me your question again.",
                "Hindi": "मुझे क्षमा करें, मैं समझ नहीं पाया। कृपया अपना प्रश्न फिर से बताएं।",
                "Tamil": "மன்னிக்கவும், எனக்கு புரியவில்லை. தயவுசெய்து உங்கள் கேள்வியை மீண்டும் சொல்லுங்கள்.",
                "Telugu": "క్షమించండి, నాకు అర్థం కాలేదు. దయచేసి మీ ప్రశ్నను మళ్ళీ చెప్పండి.",
                "Marathi": "क्षमस्व, मला समजले नाही. कृपया तुमचा प्रश्न पुन्हा सांगा.",
                "Bengali": "দুঃখিত, আমি বুঝতে পারিনি। অনুগ্রহ করে আপনার প্রশ্নটি আবার বলুন।"
            }
            no_speech_msg = no_speech_reqs.get(saarthi_lang, no_speech_reqs["English"])
            
            response.say(no_speech_msg, voice=voice, language=lang_code)
            
            action_url = f"/voice-answer?lang_code={lang_code}&saarthi_lang={saarthi_lang}"
            response.redirect(action_url)
            return Response(content=str(response), media_type="text/xml")
        
        print(f"--- Recieved Voice Question: {SpeechResult} ---")

        # Detect language (We default to saarthi_lang but RAG does its own detection optionally)
        # Using saarthi_lang passed from IVR is safer to enforce the intended response language
        detected_lang = saarthi_lang
        
        # ── Voice Recommendation ───────────────────────────────────────────────
        if is_recommendation_request(SpeechResult):
            print("--- Voice: Recommendation request detected ---")
            # Use a broad default profile for voice (can't collect multi-step easily)
            # Just respond with top schemes for a general citizen profile
            profile = {
                "occupation": "other",
                "income": 300000,
                "land_size": 0,
                "age": 35,
            }
            schemes = recommend_schemes(profile, language=detected_lang, llm=rag_engine.llm, vector_db=rag_engine.vector_db)
            answer = format_voice_recommendation(schemes, detected_lang)

            # Follow up with invitation to use WhatsApp for detailed recommendation
            followup = {
                "English": " Send 'recommend' on our WhatsApp to get personalized schemes based on your details!",
                "Hindi": " हमारे WhatsApp पर 'योजना' भेजें और अपनी जानकारी देकर सटीक योजनाएं पाएं!",
            }
            answer += followup.get(detected_lang, followup["English"])

            voice, _ = _get_voice(detected_lang)
            response.say(answer, voice=voice, language=lang_code)

            action_url = f"/voice-answer?lang_code={lang_code}&saarthi_lang={saarthi_lang}"
            # Add timeout
            gather = Gather(input="speech", action=action_url, timeout=10, speechTimeout="auto", language=lang_code)
            
            more_qs = {
                "English": "Do you have any more questions? Please tell me now, or you can hang up.",
                "Hindi": "क्या आपका कोई और सवाल है? कृपया मुझे अभी बताएं, या आप फोन काट सकते हैं।",
                "Tamil": "உங்களுக்கு வேறு ஏதேனும் கேள்விகள் உள்ளதா? தயவுசெய்து இப்போது சொல்லுங்கள் அல்லது அழைப்பைத் துண்டிக்கலாம்.",
                "Telugu": "మీకు ఇంకా ఏమైనా ప్రశ్నలు ఉన్నాయా? దయచేసి ఇప్పుడే చెప్పండి లేదా మీరు కట్ చేయవచ్చు.",
                "Marathi": "तुमचे आणखी काही प्रश्न आहेत का? कृपया आता सांगा, किंवा तुम्ही फोन ठेवू शकता.",
                "Bengali": "আপনার কি আরও কোনো প্রশ্ন আছে? দয়া করে এখনই বলুন, বা আপনি ফোন কেটে দিতে পারেন।"
            }
            more_q_msg = more_qs.get(detected_lang, more_qs["English"])
            
            gather.say(more_q_msg, voice=voice, language=lang_code)
            response.append(gather)
            response.redirect(action_url) # Fallback if they stay silent

            return Response(content=str(response), media_type="text/xml")
        # ── End Voice Recommendation ───────────────────────────────────────────

        # Get history for this caller
        caller_id = From or "voice-anonymous"
        history = get_history(caller_id)

        # Step C: Voice Scam Check
        scam_voice_triggers = ["fake", "real", "scam", "correct", "sahi", "galat"]
        if any(t in SpeechResult.lower() for t in scam_voice_triggers):
            print("--- Voice: Scam check detected ---")
            verdict = verify_scheme_message(SpeechResult, language=detected_lang, llm=rag_engine.llm, vector_db=rag_engine.vector_db)
            if verdict.get("verdict") in ["Fake", "Suspicious"]:
                prefix = "Attention. Be careful. " if verdict["verdict"] == "Fake" else "Note. This seems a bit suspicious. "
                voice_resp = f"{prefix} {verdict.get('reasoning')} "
                if verdict.get("official_details"):
                    voice_resp += f"The actual official information is: {verdict['official_details']}"
                
                voice, _ = _get_voice(detected_lang)
                response.say(voice_resp, voice=voice, language=lang_code)

                action_url = f"/voice-answer?lang_code={lang_code}&saarthi_lang={saarthi_lang}"
                gather = Gather(input="speech", action=action_url, timeout=10, speechTimeout="auto", language=lang_code)
                
                safe_msgs = {
                    "English": "Stay safe from fraud. Do you have any other questions? Please tell me now, or you can hang up.",
                    "Hindi": "धोखाधड़ी से सुरक्षित रहें। क्या आपका कोई और सवाल है? कृपया मुझे अभी बताएं।",
                    "Tamil": "மோசடியில் இருந்து உங்களைப் பாதுகாத்துக் கொள்ளுங்கள். உங்களுக்கு வேறு ஏதேனும் கேள்விகள் உள்ளதா? தயவுசெய்து இப்போது சொல்லுங்கள்.",
                    "Telugu": "మోసం నుండి సురక్షితంగా ఉండండి. మీకు ఇతర ప్రశ్నలు ఉన్నాయా? దయచేసి ఇప్పుడే చెప్పండి.",
                    "Marathi": "फसवणुकीपासून सुरक्षित राहा. तुमचे आणखी काही प्रश्न आहेत का? कृपया आता सांगा.",
                    "Bengali": "প্রতারণা থেকে নিরাপদ থাকুন। আপনার কি অন্য কোনো প্রশ্ন আছে? দয়া করে এখনই বলুন।"
                }
                safe_msg = safe_msgs.get(detected_lang, safe_msgs["English"])
                
                gather.say(safe_msg, voice=voice, language=lang_code)
                response.append(gather)
                response.redirect(action_url) # Fallback


                return Response(content=str(response), media_type="text/xml")

        # Query Saarthi's brain with history
        result = rag_engine.query(SpeechResult, language=detected_lang, chat_history=history)
        answer = result["answer"]
        
        # Save to history
        add_to_history(caller_id, SpeechResult, "user")
        add_to_history(caller_id, answer, "saarthi")
        
        # Determine which voice to use based on detected language
        voice, _ = _get_voice(detected_lang)

        # Speak the answer
        response.say(answer, voice=voice, language=lang_code)
        
        # Ask if they have more questions with a Gather loop
        action_url = f"/voice-answer?lang_code={lang_code}&saarthi_lang={saarthi_lang}"
        # Add timeout
        gather = Gather(input="speech", action=action_url, timeout=10, speechTimeout="auto", language=lang_code)
        
        more_qs_end = {
            "English": "Do you have any more questions? Please tell me now, or you can hang up.",
            "Hindi": "क्या आपका कोई और सवाल है? कृपया मुझे अभी बताएं, या आप फोन काट सकते हैं।",
            "Tamil": "உங்களுக்கு வேறு ஏதேனும் கேள்விகள் உள்ளதா? தயவுசெய்து இப்போது சொல்லுங்கள் அல்லது அழைப்பைத் துண்டிக்கலாம்.",
            "Telugu": "మీకు ఇంకా ఏమైనా ప్రశ్నలు ఉన్నాయా? దయచేసి ఇప్పుడే చెప్పండి లేదా మీరు ఫోన్ పెట్టవచ్చు.",
            "Marathi": "तुमचे आणखी काही प्रश्न आहेत का? कृपया आता सांगा, किंवा तुम्ही फोन ठेवू शकता.",
            "Bengali": "আপনার কি আরও কোনো প্রশ্ন আছে? দয়া করে এখনই বলুন, বা আপনি ফোন কেটে দিতে পারেন।"
        }
        more_q_msg = more_qs_end.get(detected_lang, more_qs_end["English"])
        
        gather.say(more_q_msg, voice=voice, language=lang_code)
        response.append(gather)
        
        # Fallback if no speech detected
        response.redirect(action_url)
        
        return Response(content=str(response), media_type="text/xml")
        
    except Exception as e:
        print(f"Voice Answer Error: {e}")
        import traceback
        traceback.print_exc()
        resp = VoiceResponse()
        resp.say("I am sorry, I am having a little trouble thinking. Please call again in a few minutes.", voice="Polly.Aditi", language="en-IN")
        return Response(content=str(resp), media_type="text/xml")

@app.post("/verify")
async def verify(
    text: str = Form(""), 
    language: str = Form("English"),
    file: UploadFile = File(None)
):
    """Endpoint for the Scam Detector UI, supporting both text and PDF uploads."""
    try:
        content_to_verify = text
        file_path = None  # Initialize to prevent reference-before-assignment

        # If a PDF file is uploaded, parse its text first
        if file and file.filename and file.filename.endswith(".pdf"):
            import time
            from langchain_community.document_loaders import PyPDFLoader
            
            # Save temporarily
            base_dir = os.path.dirname(os.path.abspath(__file__))
            data_dir = os.path.join(base_dir, "data")
            if not os.path.exists(data_dir):
                os.makedirs(data_dir)
                
            temp_filename = f"web_upload_{int(time.time())}.pdf"
            file_path = os.path.join(data_dir, temp_filename)
            
            content = await file.read()
            with open(file_path, "wb") as f:
                f.write(content)
                
            try:
                loader = PyPDFLoader(file_path)
                docs = loader.load()
                pdf_text = " ".join([d.page_content for d in docs])
                content_to_verify = pdf_text[:4000] # Cap at 4k chars to avoid token limits
            except Exception as read_err:
                if os.path.exists(file_path):
                    os.remove(file_path)
                raise Exception(f"Failed to read PDF file: {read_err}")
                
        # Run verification engine
        result = verify_scheme_message(content_to_verify, language=language, llm=rag_engine.llm, vector_db=rag_engine.vector_db)
        
        # If a file was uploaded, handle the database logic
        if file and file.filename and file.filename.endswith(".pdf") and file_path:
            if result.get("verdict") in ["Fake", "Suspicious"]:
                # ❌ Delete the fake file so it doesn't pollute the RAG database
                if os.path.exists(file_path):
                    os.remove(file_path)
            else:
                # ✅ Authentic file: leave it in the data folder and re-index
                rag_engine.load_documents(force_reload=True)

        return result
        
    except Exception as e:
        print(f"Verify Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/upload")
async def upload_document(file: UploadFile = File(...), language: str = Form("English")):
    try:
        # Use absolute path relative to this script's location
        base_dir = os.path.dirname(os.path.abspath(__file__))
        data_dir = os.path.join(base_dir, "data")
        
        if not os.path.exists(data_dir):
            os.makedirs(data_dir)
        file_path = os.path.join(data_dir, file.filename)
        content = await file.read()
        
        with open(file_path, "wb") as f:
            f.write(content)
        
        # If it's an image, use OpenAI Vision for OCR
        if file.content_type.startswith("image/"):
            print(f"--- Sending Image to OpenAI Vision for OCR ---")
            base64_image = base64.b64encode(content).decode('utf-8')
            response = client.chat.completions.create(
                model="gpt-5-mini",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": (
                                    "You are Saarthi, a helpful assistant for rural citizens of India. "
                                    "Read all the text in this image carefully. "
                                    "Then explain what it says in very simple, everyday words — as if you are explaining to a farmer who has not studied much. "
                                    "Avoid all government jargon. "
                                    "If there are any important dates, amounts, or steps to follow, mention them clearly."
                                )
                            },
                            {
                                "type": "image_url",
                                "image_url": {"url": f"data:{file.content_type};base64,{base64_image}"},
                            },
                        ],
                    }
                ],
                max_completion_tokens=600,
            )
            summary = response.choices[0].message.content
            print(f"--- OCR Summary Received ---")
            print(f"Summary: {summary[:100]}...")
        else:
            # For PDFs, RAG will handle it after reload
            summary = f"I've received your document '{file.filename}'. I'm processing it now. You can ask questions about its contents in {language}."

        # Re-index RAG
        rag_engine.load_documents()
        
        return {
            "filename": file.filename,
            "language": language,
            "status": "Success",
            "summary": summary
        }
    except Exception as e:
        print(f"Upload Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
