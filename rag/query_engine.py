import os
import sys
import json
import faiss
import pickle
import argparse
import google.generativeai as genai
from embedder import embed_query
from prompts import build_prompt, build_open_prompt
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "backend", ".env"))

VECTOR_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "vectorstore")
INDEX_PATH = os.path.join(VECTOR_DIR, "index.faiss")
CHUNKS_PATH = os.path.join(VECTOR_DIR, "chunks.pkl")

# L2 distance threshold: higher means less similar. 
# For Gemini embeddings (which are normalized), 1.0 is a good strict threshold.
DISTANCE_THRESHOLD = 1.0
TOP_K = 4

def get_gemini_answer(prompt):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return "Reliable information for this question could not be found in the available sources."
        
    genai.configure(api_key=api_key)
    # Using gemini-flash-latest which is highly available
    model = genai.GenerativeModel("gemini-flash-latest")
    
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.2,
                max_output_tokens=200,
            )
        )
        return response.text.strip()
    except Exception as e:
        return f"Error: {str(e)}"

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", type=str, default="college", choices=["college", "open"])
    parser.add_argument("--query", type=str, required=True)
    args = parser.parse_args()
    
    query = args.query
    mode = args.mode
    
    if mode == "open":
        prompt = build_open_prompt(query)
        answer = get_gemini_answer(prompt)
        print(json.dumps({
            "status": "success",
            "answer": answer
        }))
        sys.exit(0)
    
    # 1. Load index and chunks
    if not os.path.exists(INDEX_PATH) or not os.path.exists(CHUNKS_PATH):
        print(json.dumps({
            "status": "success", 
            "answer": "Reliable information for this question could not be found in the available JIIT sources. (Index missing)"
        }))
        sys.exit(0)
        
    index = faiss.read_index(INDEX_PATH)
    with open(CHUNKS_PATH, "rb") as f:
        chunks = pickle.load(f)
        
    # 2. Embed query
    query_emb = embed_query(query)
    
    # 3. Search
    distances, indices = index.search(query_emb, TOP_K)
    
    # 4. Filter by threshold
    retrieved = []
    for dist, idx in zip(distances[0], indices[0]):
        if idx != -1 and dist < DISTANCE_THRESHOLD:
            retrieved.append(chunks[idx])
            
    if not retrieved:
        print(json.dumps({
            "status": "success", 
            "answer": "Reliable information for this question could not be found in the available JIIT sources."
        }))
        sys.exit(0)
        
    # 5. Build prompt
    prompt = build_prompt(query, retrieved)
    
    # 6. Call Gemini
    answer = get_gemini_answer(prompt)
    
    print(json.dumps({
        "status": "success",
        "answer": answer
    }))

if __name__ == "__main__":
    main()
