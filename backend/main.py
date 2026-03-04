from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import base64
from dotenv import load_dotenv
from twilio.twiml.messaging_response import MessagingResponse
from twilio.twiml.voice_response import VoiceResponse, Gather
import requests

load_dotenv()

from rag_engine import rag_engine
from openai import OpenAI

app = FastAPI(title="Saarthi API", description="Multilingual Assistant for Citizens")
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG on startup
@app.on_event("startup")
async def startup_event():
    success = rag_engine.load_documents()
    if success:
        print("RAG Engine loaded successfully.")
    else:
        print("No documents found in data folder. RAG might not work yet.")

@app.get("/")
async def root():
    return {"message": "Welcome to Saarthi API"}

@app.post("/chat")
async def chat(message: str = Form(...), language: str = Form("English")):
    try:
        result = rag_engine.query(message, language=language)
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
                    model="gpt-4o",
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
                    max_tokens=800,
                )
                answer = response.choices[0].message.content
                twiml.message(answer)
                return Response(content=str(twiml), media_type="application/xml")

            # --- PDF HANDLING ---
            elif MediaContentType0 == "application/pdf":
                # Create a filename based on timestamp or something unique
                import time
                filename = f"whatsapp_upload_{int(time.time())}.pdf"
                data_dir = "../data" # Path relative to backend/
                if not os.path.exists(data_dir):
                    os.makedirs(data_dir)
                
                file_path = os.path.join(data_dir, filename)
                with open(file_path, "wb") as f:
                    f.write(media_content)
                
                # Re-index RAG
                rag_engine.load_documents()
                
                # Detect language of the confirmation message based on the Body caption or default
                confirm_lang = "English"
                if Body:
                    confirm_lang = rag_engine._detect_language(Body)
                
                msg = f"I've received your PDF document '{filename}'. I'm adding it to my memory now. You can start asking me questions about it!"
                if confirm_lang != "English":
                    # Simple translate/re-generate confirmation
                    msg_resp = client.chat.completions.create(
                        model="gpt-4o",
                        messages=[{"role": "user", "content": f"Translate this message concisely to {confirm_lang}: {msg}"}]
                    )
                    msg = msg_resp.choices[0].message.content
                
                twiml.message(msg)
                return Response(content=str(twiml), media_type="application/xml")

        # 2. HANDLE TEXT ONLY (or caption with media if wasn't returned earlier)
        user_message = Body
        if not user_message:
            # If there was media but no body, and we already handled it, this code won't reach here
            # But if there's no body AND no media, just return a nudge
            twiml.message("Namaste! I am Saarthi. How can I help you today?")
            return Response(content=str(twiml), media_type="application/xml")

        # Query the RAG engine with "Auto" language detection
        result = rag_engine.query(user_message, language="Auto")
        answer = result["answer"]
        
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

@app.post("/voice")
async def voice_greeting():
    """Initial greeting for the voice helpline."""
    try:
        print("--- Incoming Voice Call! ---")
        response = VoiceResponse()
        
        # Use Polly.Aditi for a natural Indian accent
        gather = Gather(input="speech", action="/voice-answer", speechTimeout="auto", language="en-IN")
        gather.say(
            "Namaste! I am Saarthi, your helpful friend. "
            "How can I help you today? Please tell me your question now.", 
            voice="Polly.Aditi",
            language="en-IN"
        )
        response.append(gather)
        
        # If they don't say anything
        response.say("I'm sorry, I didn't hear anything. Please call back if you need help. Good bye!", voice="Polly.Aditi", language="en-IN")
        
        return Response(content=str(response), media_type="text/xml")
    except Exception as e:
        print(f"Voice Error: {e}")
        return Response(content="<Response><Say>Internal Error</Say></Response>", media_type="text/xml")

@app.post("/voice-answer")
async def voice_answer(SpeechResult: str = Form(None)):
    """Processes the speech transcript and speaks the answer back."""
    try:
        response = VoiceResponse()
        
        if not SpeechResult:
            print("--- Voice: No speech detected ---")
            response.say("I'm sorry, I didn't quite catch that. Please tell me your question again.", voice="Polly.Aditi", language="en-IN")
            response.redirect("/voice")
            return Response(content=str(response), media_type="text/xml")
        
        print(f"--- Recieved Voice Question: {SpeechResult} ---")
        
        # Query Saarthi's brain with Auto detection
        result = rag_engine.query(SpeechResult, language="Auto")
        answer = result["answer"]
        
        # Determine which voice to use based on detected language
        detected_lang = rag_engine._detect_language(SpeechResult)
        
        voice = "Polly.Aditi" # Default Indian English
        lang_code = "en-IN"
        
        if "Hindi" in detected_lang:
            voice = "Polly.Aditi" 
            lang_code = "hi-IN"
        elif "Tamil" in detected_lang:
            lang_code = "ta-IN"
            voice = "Polly.Pallavi"
        elif "Telugu" in detected_lang:
            lang_code = "te-IN"
            voice = "Polly.Suvi"
            
        # Speak the answer
        response.say(answer, voice=voice, language=lang_code)
        
        # Ask if they have more questions
        response.say("Do you have any more questions? If not, you can hang up.", voice="Polly.Aditi", language="en-IN")
        
        return Response(content=str(response), media_type="text/xml")
        
    except Exception as e:
        print(f"Voice Answer Error: {e}")
        import traceback
        traceback.print_exc()
        resp = VoiceResponse()
        resp.say("I am sorry, I am having a little trouble thinking. Please call again in a few minutes.", voice="Polly.Aditi", language="en-IN")
        return Response(content=str(resp), media_type="text/xml")

@app.post("/upload")
async def upload_document(file: UploadFile = File(...), language: str = Form("English")):
    try:
        data_dir = "../data"
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
                model="gpt-4o",
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
                max_tokens=600,
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
