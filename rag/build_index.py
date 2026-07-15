import os
import faiss
import pickle
from scraper import scrape_jiit_site
from reddit_scraper import scrape_reddit_jiit
from chunker import chunk_text
from embedder import embed_texts

VECTOR_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "vectorstore")
INDEX_PATH = os.path.join(VECTOR_DIR, "index.faiss")
CHUNKS_PATH = os.path.join(VECTOR_DIR, "chunks.pkl")

def build_and_save_index():
    print("Starting index build process...")
    
    # 1. Scrape data
    jiit_docs = scrape_jiit_site()
    reddit_docs = scrape_reddit_jiit()
    all_docs = jiit_docs + reddit_docs
    
    if not all_docs:
        print("No documents scraped. Exiting.")
        return
        
    # 2. Chunk data
    chunks = chunk_text(all_docs, chunk_size=500, chunk_overlap=100)
    
    if not chunks:
        print("No chunks generated. Exiting.")
        return
        
    # 3. Embed chunks
    print("Generating embeddings...")
    texts_to_embed = [c["text"] for c in chunks]
    embeddings = embed_texts(texts_to_embed)
    
    # 4. Build FAISS index
    print("Building FAISS index...")
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)
    
    # 5. Save to disk
    os.makedirs(VECTOR_DIR, exist_ok=True)
    faiss.write_index(index, INDEX_PATH)
    
    with open(CHUNKS_PATH, "wb") as f:
        pickle.dump(chunks, f)
        
    print(f"Index built successfully! Total chunks: {len(chunks)}. Saved to {VECTOR_DIR}")

if __name__ == "__main__":
    build_and_save_index()
