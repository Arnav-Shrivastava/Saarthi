"""
add_constitution.py
-------------------
Downloads the official Constitution of India PDF and rebuilds the Saarthi
FAISS vector database so Saarthi can answer questions about it.

Usage (from the backend/ directory, inside your virtual env):
    python scripts/add_constitution.py
"""

import os
import sys
import shutil
import requests

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
CONSTITUTION_URLS = [
    # Primary — Legislative Department, GoI
    "https://legislative.gov.in/sites/default/files/COI_updated.pdf",
    # Fallback 1 — India Code portal
    "https://www.indiacode.nic.in/bitstream/123456789/15240/1/constitution_of_india.pdf",
    # Fallback 2 — Another common mirror
    "https://www.mea.gov.in/Images/pdf1/S1.pdf",
]

SAVE_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "Constitution_of_India.pdf")
VECTOR_DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "vector_db")

# ---------------------------------------------------------------------------
# Step 1: Download the PDF
# ---------------------------------------------------------------------------
def download_constitution():
    save_path = os.path.abspath(SAVE_PATH)

    # Skip download if already present
    if os.path.exists(save_path) and os.path.getsize(save_path) > 100_000:
        print(f"[✓] Constitution PDF already exists at:\n    {save_path}")
        return True

    print("[→] Downloading Constitution of India PDF...")
    for url in CONSTITUTION_URLS:
        try:
            print(f"    Trying: {url}")
            response = requests.get(url, timeout=60, stream=True)
            if response.status_code == 200:
                os.makedirs(os.path.dirname(save_path), exist_ok=True)
                with open(save_path, "wb") as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
                size_mb = os.path.getsize(save_path) / (1024 * 1024)
                print(f"[✓] Downloaded successfully! File size: {size_mb:.2f} MB")
                print(f"    Saved to: {save_path}")
                return True
            else:
                print(f"    [✗] HTTP {response.status_code} — trying next URL...")
        except Exception as e:
            print(f"    [✗] Failed ({e}) — trying next URL...")

    print("\n[✗] All download attempts failed.")
    print("    Please manually download the Constitution PDF from:")
    print("    https://legislative.gov.in/constitution-of-india/")
    print(f"    And place it at: {save_path}")
    return False


# ---------------------------------------------------------------------------
# Step 2: Delete old vector DB so it gets rebuilt fresh
# ---------------------------------------------------------------------------
def clear_vector_db():
    db_path = os.path.abspath(VECTOR_DB_PATH)
    if os.path.exists(db_path):
        print(f"\n[→] Deleting old FAISS vector DB at:\n    {db_path}")
        shutil.rmtree(db_path)
        print("[✓] Old vector DB deleted.")
    else:
        print("\n[→] No existing vector DB found — will build fresh.")


# ---------------------------------------------------------------------------
# Step 3: Rebuild vector DB
# ---------------------------------------------------------------------------
def rebuild_vector_db():
    print("\n[→] Rebuilding Saarthi vector database (this may take a few minutes)...")
    print("    Note: This will use your OpenAI API key to generate embeddings.\n")

    # Add backend dir to path so rag_engine can be imported
    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    sys.path.insert(0, backend_dir)

    try:
        from dotenv import load_dotenv
        load_dotenv(os.path.join(backend_dir, ".env"))

        from rag_engine import RagEngine
        engine = RagEngine()
        success = engine.load_documents(force_reload=True)
        if success:
            count = len(engine.vector_db.docstore._dict) if engine.vector_db else 0
            print(f"\n[✓] Vector DB rebuilt successfully with {count} chunks!")
            print("    Restart your backend server and Saarthi will know the Constitution.")
        else:
            print("\n[✗] No documents found. Make sure PDFs are in backend/data/")
    except Exception as e:
        print(f"\n[✗] Failed to rebuild vector DB: {e}")
        import traceback
        traceback.print_exc()
        print("\n    TIP: Make sure your .env file has OPENAI_API_KEY set and you are")
        print("    running this from inside your virtual environment.")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    print("=" * 60)
    print("  Saarthi — Constitution of India Ingestion Script")
    print("=" * 60)

    downloaded = download_constitution()
    if downloaded:
        clear_vector_db()
        rebuild_vector_db()

    print("\n" + "=" * 60)
    print("  Done! Restart your backend server to apply changes.")
    print("=" * 60)
