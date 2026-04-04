import os
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import PyPDFLoader, TextLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import PromptTemplate

class RagEngine:
    def __init__(self, data_path=None):
        if data_path is None:
            # Get the path to the 'data' folder in the backend folder
            base_dir = os.path.dirname(os.path.abspath(__file__))
            self.data_path = os.path.join(base_dir, "data")
        else:
            self.data_path = data_path
        self.vector_db = None
        self.embeddings = OpenAIEmbeddings()
        self.llm = ChatOpenAI(model_name="gpt-5-mini",)
        
    def load_documents(self, force_reload=False):
        db_path = os.path.join(self.data_path, "vector_db")
        
        if not force_reload and os.path.exists(os.path.join(db_path, "index.faiss")):
            print("Loading existing FAISS vector database from disk...")
            self.vector_db = FAISS.load_local(db_path, self.embeddings, allow_dangerous_deserialization=True)
            return True

        if not os.path.exists(self.data_path):
            os.makedirs(self.data_path)
            
        all_docs = []
        
        # Load PDFs
        pdf_loader = DirectoryLoader(self.data_path, glob="**/*.pdf", loader_cls=PyPDFLoader)
        all_docs.extend(pdf_loader.load())
        
        # Load Text files
        txt_loader = DirectoryLoader(self.data_path, glob="**/*.txt", loader_cls=TextLoader)
        all_docs.extend(txt_loader.load())
        
        if not all_docs:
            print("No documents found in data folder.")
            return False
            
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        texts = text_splitter.split_documents(all_docs)
        
        if texts:
            self.vector_db = FAISS.from_documents(texts, self.embeddings)
            os.makedirs(db_path, exist_ok=True)
            self.vector_db.save_local(db_path)
            print(f"RAG Engine loaded {len(all_docs)} documents and saved DB to disk.")
            return True
        return False

    # General knowledge prompt (used as fallback when docs don't cover the topic)
    FALLBACK_PROMPT = """You are Saarthi — a kind, patient, and knowledgeable friend who helps rural citizens of India understand government schemes and their rights.

The person asking you is likely a farmer, a daily-wage worker, or someone from a village who may not have much formal education. They need answers that are:
- Written in very SIMPLE, everyday words (no government jargon)
- Short sentences, easy to read
- Use real-life comparisons (like fields, crops, villages, harvests) to explain things
- Warm and respectful, like a trusted local helper

**SPECIFIC INSTRUCTIONS FOR ELIGIBILITY CHECKS:**
- If the user asks "Am I eligible?" or "Can I get this scheme?", do NOT give a long list of all rules.
- Instead, identify what information is missing (e.g., land size, state, income) and ask the user for ONLY those things.
- Ask one or two clear questions at a time.
- Only give a final "Yes, you are eligible" or "No" once you have all the facts.
- Acknowledge if the user has already provided some details in the chat history.

Chat History (for context):
{chat_history}

Question: {question}

IMPORTANT INSTRUCTIONS:
1. Answer in {language}.
2. Be interactive — if information is missing for an eligibility check, ASK for it.
3. Use Step 1, Step 2 only for final registration/application steps.
4. Keep bits of information in small, digestible chunks.
5. NEVER use technical jargon.

Answer (in {language}):"""

    def _is_rag_fallback_response(self, response: str) -> bool:
        """Check if the RAG response hit the 'I don't know' fallback."""
        fallback_indicators = [
            "I do not have this information",
            "I don't have this information",
            "not in the context",
            "FALLBACK",
        ]
        return any(indicator.lower() in response.lower() for indicator in fallback_indicators)

    def _general_knowledge_answer(self, question: str, language: str, chat_history: str = "") -> dict:
        """Answer using GPT-5-mini general knowledge when RAG has no relevant docs."""
        print(f"--- RAG fallback: using GPT-5-mini general knowledge with history ---")
        from langchain_core.prompts import PromptTemplate
        from langchain_core.output_parsers import StrOutputParser

        prompt = PromptTemplate.from_template(self.FALLBACK_PROMPT)
        chain = prompt | self.llm | StrOutputParser()
        response = chain.invoke({"question": question, "language": language, "chat_history": chat_history})
        return {
            "answer": response,
            "sources": [{
                "filename": "General Knowledge (GPT-5)",
                "page": None,
                "snippet": "This answer is based on GPT-5's general knowledge and diagnostic logic.",
            }]
        }

    def _detect_language(self, text: str) -> str:
        """Detect the language of the input text using GPT-5-mini."""
        print(f"--- Detecting language for: '{text[:50]}...' ---")
        prompt = f"Detect the language of the following text. Respond ONLY with the name of the language in English (e.g., 'Hindi', 'Tamil', 'English', etc.):\n\n{text}"
        response = self.llm.invoke(prompt)
        detected_lang = response.content.strip()
        print(f"Detected language: {detected_lang}")
        return detected_lang

    def query(self, question, language="English", chat_history: list = None):
        """Processes a query with optional chat history for diagnostic interaction."""
        # Format chat history for the prompt
        history_str = ""
        if chat_history:
            for msg in chat_history[-5:]: # Last 5 messages for context
                role = "User" if msg["type"] == "user" else "Saarthi"
                history_str += f"{role}: {msg['text']}\n"

        # Auto-detect language if requested (useful for WhatsApp)
        if language == "Auto":
            language = self._detect_language(question)

        # If no documents loaded, go straight to general knowledge
        if not self.vector_db:
            print("No RAG documents — using GPT-5-mini general knowledge.")
            return self._general_knowledge_answer(question, language, history_str)

        prompt_template = """You are Saarthi — a kind, patient, and knowledgeable friend who helps rural citizens of India understand government schemes and their rights.

The person asking you is likely a farmer, a daily-wage worker, or someone from a village who may not have much formal education. They need answers that are:
- Written in very SIMPLE, everyday words (no government jargon)
- Short sentences, easy to read
- Use real-life comparisons to explain things
- Warm and respectful, like a trusted local helper

**ELIGIBILITY CHECK LOGIC:**
- If the user asks "Am I eligible?", do NOT give a full list of rules from the text.
- Instead, find the eligibility criteria in the context below.
- Check if the user has already provided any of these details in the **Chat History**.
- Ask the user for any MISSING information (e.g., "What is your land size?") before giving a final answer.
- Only give a "Yes" or "No" once you have enough facts.

Use ONLY the following information to answer. If the answer is not here, reply ONLY with: FALLBACK
---
{context}
---

Chat History:
{chat_history}

Question: {question}

IMPORTANT INSTRUCTIONS:
1. Answer in {language}.
2. If the user asks about eligibility, ASK follow-up questions for missing data.
3. List next steps (Step 1, Step 2) ONLY after eligibility is confirmed.
4. End with a helpful, warm line.
5. NEVER use technical jargon.

Answer (in {language}):"""

        from langchain_core.runnables import RunnablePassthrough
        from langchain_core.output_parsers import StrOutputParser
        from langchain_core.prompts import PromptTemplate

        prompt = PromptTemplate.from_template(prompt_template)

        # Fetch more context chunks for better accuracy
        retriever = self.vector_db.as_retriever(search_kwargs={"k": 6})

        chain = (
            {
                "context": retriever, 
                "question": RunnablePassthrough(), 
                "language": lambda x: language,
                "chat_history": lambda x: history_str
            }
            | prompt
            | self.llm
            | StrOutputParser()
        )

        try:
            print(f"--- Sending Query to Saarthi's Brain ({language}) ---")
            
            # Retrieve relevant document chunks (for sourcing)
            docs = retriever.invoke(question)
            
            response = chain.invoke(question)

            # If RAG couldn't answer from docs, fall back to GPT-5-mini general knowledge
            if response.strip().upper() == "FALLBACK" or self._is_rag_fallback_response(response):
                return self._general_knowledge_answer(question, language, history_str)

            # Build sources list from retrieved docs
            seen = set()
            sources = []
            for doc in docs:
                meta = doc.metadata or {}
                source_file = meta.get("source", "").replace("\\", "/")
                page = meta.get("page", None)
                filename = os.path.basename(source_file) if source_file else "Uploaded Document"
                key = (filename, page)
                if key not in seen:
                    seen.add(key)
                    sources.append({
                        "filename": filename,
                        "page": page + 1 if page is not None else None,
                        "snippet": doc.page_content[:200].strip().replace("\n", " "),
                    })

            return {"answer": response, "sources": sources}

        except Exception as e:
            print(f"RAG Error: {e}")
            return {"answer": "I encountered an error while processing your request. Please try again.", "sources": []}

rag_engine = RagEngine()
