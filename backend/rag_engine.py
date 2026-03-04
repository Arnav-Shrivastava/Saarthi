import os
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import PyPDFLoader, TextLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_classic.chains import RetrievalQA
from langchain_core.prompts import PromptTemplate

class RagEngine:
    def __init__(self, data_path=None):
        if data_path is None:
            # Get the path to the 'data' folder in the root of the project
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            self.data_path = os.path.join(base_dir, "data")
        else:
            self.data_path = data_path
        self.vector_db = None
        self.embeddings = OpenAIEmbeddings()
        self.llm = ChatOpenAI(model_name="gpt-4o", temperature=0)
        
    def load_documents(self):
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
            print(f"RAG Engine loaded {len(all_docs)} documents.")
            return True
        return False

    # General knowledge prompt (used as fallback when docs don't cover the topic)
    FALLBACK_PROMPT = """You are Saarthi — a kind, patient, and knowledgeable friend who helps rural citizens of India understand government schemes and their rights.

The person asking you is likely a farmer, a daily-wage worker, or someone from a village who may not have much formal education. They need answers that are:
- Written in very SIMPLE, everyday words (no government jargon)
- Short sentences, easy to read
- Use real-life comparisons (like fields, crops, villages, harvests) to explain things
- Give PRACTICAL, actionable information — what they need to DO, not just what the scheme is
- Be warm and respectful, like a trusted local helper

Answer this question using your general knowledge about Indian government services:
Question: {question}

IMPORTANT INSTRUCTIONS:
1. Answer in {language}.
2. Start with a one-line simple explanation.
3. List any steps clearly as Step 1, Step 2, etc.
4. Mention any documents they might need.
5. End with an encouraging line.
6. NEVER use technical jargon. Use simple everyday words instead.
7. Be honest — if you are not sure about something, say so.

Answer (in {language}):"""

    def _is_rag_fallback_response(self, response: str) -> bool:
        """Check if the RAG response hit the 'I don't know' fallback."""
        fallback_indicators = [
            "I do not have this information",
            "I don't have this information",
            "not in the context",
            "visit your nearest",
            "Gram Panchayat",
        ]
        return any(indicator.lower() in response.lower() for indicator in fallback_indicators)

    def _general_knowledge_answer(self, question: str, language: str) -> dict:
        """Answer using GPT-4o general knowledge when RAG has no relevant docs."""
        print(f"--- RAG fallback: using GPT-4o general knowledge ---")
        from langchain_core.prompts import PromptTemplate
        from langchain_core.output_parsers import StrOutputParser

        prompt = PromptTemplate.from_template(self.FALLBACK_PROMPT)
        chain = prompt | self.llm | StrOutputParser()
        response = chain.invoke({"question": question, "language": language})
        return {
            "answer": response,
            "sources": [{
                "filename": "General Knowledge (GPT-4o)",
                "page": None,
                "snippet": "This answer is based on GPT-4o's general knowledge about Indian government services, not from uploaded documents.",
            }]
        }

    def _detect_language(self, text: str) -> str:
        """Detect the language of the input text using GPT-4o."""
        print(f"--- Detecting language for: '{text[:50]}...' ---")
        prompt = f"Detect the language of the following text. Respond ONLY with the name of the language in English (e.g., 'Hindi', 'Tamil', 'English', etc.):\n\n{text}"
        response = self.llm.invoke(prompt)
        detected_lang = response.content.strip()
        print(f"Detected language: {detected_lang}")
        return detected_lang

    def query(self, question, language="English"):
        # Auto-detect language if requested (useful for WhatsApp)
        if language == "Auto":
            language = self._detect_language(question)

        # If no documents loaded, go straight to general knowledge
        if not self.vector_db:
            print("No RAG documents — using GPT-4o general knowledge.")
            return self._general_knowledge_answer(question, language)

        prompt_template = """You are Saarthi — a kind, patient, and knowledgeable friend who helps rural citizens of India understand government schemes and their rights.

The person asking you is likely a farmer, a daily-wage worker, or someone from a village who may not have much formal education. They need answers that are:
- Written in very SIMPLE, everyday words (no government jargon)
- Short sentences, easy to read
- Use real-life comparisons (like fields, crops, villages, harvests) to explain things
- Give PRACTICAL, actionable information — what they need to DO, not just what the scheme is
- Be warm and respectful, like a trusted local helper

Use ONLY the following information to answer the question. Do NOT make up anything:
---
{context}
---

Question: {question}

IMPORTANT INSTRUCTIONS:
1. Answer in {language}.
2. Start with a one-line simple explanation of what the scheme/topic is.
3. Then explain the key benefits in plain language.
4. If there are steps to apply, list them clearly as Step 1, Step 2, etc.
5. Mention any documents they need to bring.
6. End with an encouraging line.
7. If the answer is not in the context above, reply ONLY with the single word: FALLBACK
8. NEVER use technical words like "beneficiary", "disbursement", "implementation", "operationalize". Use simple words instead.

Answer (in {language}):"""

        from langchain_core.runnables import RunnablePassthrough
        from langchain_core.output_parsers import StrOutputParser
        from langchain_core.prompts import PromptTemplate

        prompt = PromptTemplate.from_template(prompt_template)

        # Fetch more context chunks for better accuracy
        retriever = self.vector_db.as_retriever(search_kwargs={"k": 6})

        chain = (
            {"context": retriever, "question": RunnablePassthrough(), "language": lambda x: language}
            | prompt
            | self.llm
            | StrOutputParser()
        )

        try:
            print(f"--- Sending Query to Saarthi's Brain ({language}) ---")
            print(f"Question: {question}")

            # Retrieve relevant document chunks (with metadata)
            docs = retriever.invoke(question)
            print(f"DEBUG: Found {len(docs)} relevant context snippets.")

            response = chain.invoke(question)
            print(f"--- Saarthi Response Received ---")
            print(f"Response: {response[:100]}...")

            # If RAG couldn't answer from docs, fall back to GPT-4o general knowledge
            if response.strip().upper() == "FALLBACK" or self._is_rag_fallback_response(response):
                print("--- RAG had no relevant info — falling back to GPT-4o general knowledge ---")
                return self._general_knowledge_answer(question, language)

            # Build sources list from retrieved docs (deduplicated by filename+page)
            seen = set()
            sources = []
            for doc in docs:
                meta = doc.metadata or {}
                source_file = meta.get("source", "")
                page = meta.get("page", None)
                filename = os.path.basename(source_file) if source_file else "Uploaded Document"
                key = (filename, page)
                if key not in seen:
                    seen.add(key)
                    sources.append({
                        "filename": filename,
                        "page": page + 1 if page is not None else None,  # 1-indexed
                        "snippet": doc.page_content[:200].strip().replace("\n", " "),
                    })

            return {"answer": response, "sources": sources}

        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"RAG Error: {e}")
            return {"answer": "I encountered an error while processing your request. Please try again.", "sources": []}

rag_engine = RagEngine()
