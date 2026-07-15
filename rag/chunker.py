def chunk_text(documents, chunk_size=500, chunk_overlap=100):
    print(f"Chunking {len(documents)} documents...")
    chunks = []
    
    for doc in documents:
        text = doc["text"]
        
        # Simple sliding window chunker
        start = 0
        while start < len(text):
            end = min(start + chunk_size, len(text))
            
            # If we're not at the end, try to break at a space
            if end < len(text):
                last_space = text.rfind(' ', start, end)
                if last_space != -1 and last_space > start + (chunk_size // 2):
                    end = last_space
            
            chunk_str = text[start:end].strip()
            if len(chunk_str) > 50:
                chunks.append({
                    "text": chunk_str,
                    "url": doc["url"],
                    "source": doc["source"]
                })
                
            if end == len(text):
                break
            start = end - chunk_overlap
            
    return chunks

if __name__ == "__main__":
    # Test
    docs = [{"text": "Hello world. " * 100, "url": "http://test", "source": "test"}]
    res = chunk_text(docs)
    print(f"Produced {len(res)} chunks.")
