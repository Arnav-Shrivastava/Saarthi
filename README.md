# Saarthi: Omnichannel AI Guide for Citizens 🤖🇮🇳

**Saarthi** is a multilingual, omnichannel AI assistant designed to bridge the digital divide for rural citizens in India. It simplifies complex government schemes, legal documents, and policy papers into plain, actionable language.

---

## 🌟 The Omnichannel Edge
Saarthi meets citizens where they are. Whether they have a smartphone or a basic feature phone, Saarthi is accessible through **three primary channels**:

1.  **💻 Web Dashboard**: A modern, responsive React interface for deep chat and document uploads.
2.  **📱 WhatsApp Bot**: Direct interaction via the world's most popular messaging app. Supports **Text, Images (OCR), and PDFs**.
3.  **📞 Voice Helpline**: A telephone helpline where users speak their query and Saarthi speaks back in a natural, localized Indian accent.

---

## ✨ Key Features
- **Hybrid RAG System**: Primary answers sourced with high precision from indexed official PDFs; auto-fallback to GPT-4o’s deep knowledge of Indian policies for maximum coverage.
- **Multilingual Excellence**: Supports 10+ Indian languages (Hindi, Tamil, Telugu, Marathi, etc.) with automatic language detection.
- **Vision AI**: Snap a photo of any printed government circular or form to get an instant, simple explanation.
- **Dynamic PDF Indexing**: Upload new scheme documents via WhatsApp or Web to instantly update Saarthi's knowledge.
- **Rural-First UX**: Uses simple analogies and avoids technical jargon to empower users with low literacy.

---

## 🛠 Tech Stack
- **AI/LLM**: OpenAI GPT-4o (Reasoning + Vision), OpenAI Embeddings.
- **RAG Framework**: LangChain + FAISS Vector Database.
- **Communication**: Twilio (WhatsApp Messaging API & Programmable Voice).
- **Backend**: FastAPI (Python).
- **Frontend**: React, Vite, TailwindCSS, Lucide Icons.

---

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.10+
- Node.js & npm
- OpenAI API Key
- Twilio Account (for WhatsApp/Voice)

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
# Create .env with: OPENAI_API_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN
python main.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Enable Omnichannel
Use **ngrok** to link your local server to Twilio:
```bash
ngrok http 8000
```
Update your Twilio Webhook URLs to `https://your-ngrok-url/whatsapp` and `.../voice`.

---

## 🧠 Architecture
Saarthi uses a **Retrieval-Augmented Generation (RAG)** architecture. It first searches a localized vector database of official government documents. If a specific match is found, it uses that "Ground Truth" to generate an answer. If no specific document is found, it leverages GPT-4o's pre-trained knowledge of Indian constitutional and social policies to assist the user.

---

## 🏆 Hackathon Submission
Built for the **LinguaVerse: Multilingual Generative AI Hackathon**. Saarthi aims to democratize access to justice and information for 1.4 billion citizens.
