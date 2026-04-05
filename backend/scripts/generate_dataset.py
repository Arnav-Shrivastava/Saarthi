import os
import json
import time
from dotenv import load_dotenv
from openai import OpenAI

# Load env to get OPENAI_API_KEY
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

PROMPT = """
You are a synthetic data generator for an Indian agricultural/welfare AI named "Saarthi".
Your task is to generate {count} highly realistic, varied user questions.

Generate exactly {count} distinct JSON objects inside a JSON array.
Each object must match this schema exactly:
{
  "id": "q1",
  "category": "String (one of: 'scheme_query', 'scam_check', 'complaint_draft', 'irrelevant')",
  "query": "String (the exact text message the user sends, mostly English or Hinglish)",
  "expected_intent": "String (what the RAG backend should do, e.g., 'recommend schemes', 'detect scam', 'draft complaint', 'answer query', 'decline gently')"
}

Categories distribution:
- ~60% 'scheme_query' (e.g. "I have 2 acres, what schemes can I get?", "How to apply for PM Kisan?", "Does my grandmother get pension?")
- ~25% 'scam_check' (e.g. "Got a message saying click here for free 50000 rupees modi yojana. true?", "Free laptop scheme application forward real?")
- ~10% 'complaint_draft' (e.g. "Someone stole my cattle last night, write a police complaint.", "My neighbor encroached my farm, need an FIR draft.")
- ~5% 'irrelevant' (e.g. "Who won the cricket match?", "Write a poem about nature", "Translate hello to french")

Make the wording realistic — sometimes grammatically poor, sometimes polite, sometimes frantic.
Return ONLY valid JSON. Do not include markdown blocks.
"""

def generate_dataset(total_count=100, batch_size=20):
    dataset = []
    
    # We batch because asking an LLM for 100 JSON items at once is prone to truncation/errors
    batches = total_count // batch_size
    remainder = total_count % batch_size
    
    print(f"Generating {total_count} questions in {batches + (1 if remainder else 0)} batches...")
    
    for i in range(batches + (1 if remainder else 0)):
        count_to_generate = batch_size if i < batches else remainder
        if count_to_generate == 0: break
        
        print(f"--- Batch {i+1} : Requesting {count_to_generate} questions ---")
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini", # Using extremely cheap/fast model
                temperature=0.8,
                messages=[
                    {"role": "system", "content": "You are a JSON data generator."},
                    {"role": "user", "content": PROMPT.replace("{count}", str(count_to_generate))}
                ]
            )
            
            content = response.choices[0].message.content.strip()
            # Strip markdown if present
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
            
            batch_data = json.loads(content)
            
            # Auto-assign unique IDs
            for j, item in enumerate(batch_data):
                item["id"] = f"q_{len(dataset) + j + 1}"
                
            dataset.extend(batch_data)
            print(f"✅ Batch {i+1} successful. Total so far: {len(dataset)}")
            
        except Exception as e:
            print(f"❌ Error in batch {i+1}: {e}")
            print("Retrying after 5 seconds...")
            time.sleep(5)
            # Simple 1-time retry for a batch
            try:
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    temperature=0.8,
                    messages=[
                        {"role": "system", "content": "You are a JSON data generator."},
                        {"role": "user", "content": PROMPT.replace("{count}", str(count_to_generate))}
                    ]
                )
                content = response.choices[0].message.content.strip()
                if content.startswith("```json"): content = content[7:]
                if content.endswith("```"): content = content[:-3]
                batch_data = json.loads(content)
                for j, item in enumerate(batch_data):
                    item["id"] = f"q_{len(dataset) + j + 1}"
                dataset.extend(batch_data)
                print(f"✅ Batch {i+1} successful on retry.")
            except Exception as e2:
                print(f"❌ Retry failed: {e2}. Skipping this batch.")
        
        # Sleep slightly to respect rate limits
        time.sleep(2)
        
    # Save to file
    out_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, "test_dataset.json")
    
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=2)
        
    print(f"\n🎉 Successfully generated {len(dataset)} questions and saved to {out_file}")

if __name__ == "__main__":
    generate_dataset(100, batch_size=20)
