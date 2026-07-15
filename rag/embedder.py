import os
import requests
import numpy as np
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "backend", ".env"))

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
_model = None

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent"

def get_local_model():
    global _model
    if _model is None:
        print(f"Loading local embedding model {MODEL_NAME}...")
        _model = SentenceTransformer(MODEL_NAME)
    return _model

import google.generativeai as genai

def _embed_gemini(text):
    if not GEMINI_API_KEY:
        raise ValueError("Missing GEMINI_API_KEY")
        
    genai.configure(api_key=GEMINI_API_KEY)
    result = genai.embed_content(
        model="models/gemini-embedding-2",
        content=text,
        task_type="retrieval_document"
    )
    return result['embedding']

def embed_texts(texts):
    if GEMINI_API_KEY:
        print(f"Generating Gemini embeddings for {len(texts)} texts...")
        embeddings = []
        for i, text in enumerate(texts):
            try:
                emb = _embed_gemini(text)
                embeddings.append(emb)
            except Exception as e:
                print(f"Error on text {i}: {e}. Falling back to zero vector.")
                embeddings.append([0.0] * 3072)
        return np.array(embeddings, dtype=np.float32)
    else:
        model = get_local_model()
        return model.encode(texts, convert_to_numpy=True)

def embed_query(query):
    if GEMINI_API_KEY:
        try:
            emb = _embed_gemini(query)
            return np.array([emb], dtype=np.float32)
        except Exception as e:
            print(f"Error embedding query with Gemini: {e}")
            return np.zeros((1, 3072), dtype=np.float32)
    else:
        model = get_local_model()
        emb = model.encode(query, convert_to_numpy=True)
        return np.array([emb])

if __name__ == "__main__":
    test_emb = embed_query("What are the placements like?")
    print(f"Embedding shape: {test_emb.shape}")

