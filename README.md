# Wisdom Wing

Wisdom Wing is a dedicated, college-focused collaboration and knowledge-sharing platform designed to solve the critical problem of fragmented communication within university ecosystems. Currently, students struggle to find reliable answers, discover relevant opportunities, and connect with peers or alumni due to information being scattered across chaotic WhatsApp groups, generic social media, or outdated college portals. By consolidating discussions, resource sharing, and verified AI-driven answers into one secure environment, Wisdom Wing eliminates the noise, making it effortless for college communities to preserve institutional knowledge and foster meaningful academic networking.
<img width="1600" height="943" alt="image" src="https://github.com/user-attachments/assets/b5dde60b-e0a5-4d36-8bf6-5d0554b910cd" />
<img width="1044" height="781" alt="image" src="https://github.com/user-attachments/assets/63c2a3d9-76a3-4f26-a0b5-2821acd72b33" />
<img width="1600" height="1239" alt="image" src="https://github.com/user-attachments/assets/b6806321-8e48-408d-b626-40eea6404d17" />
<img width="1600" height="1060" alt="image" src="https://github.com/user-attachments/assets/16496480-fa27-443c-b193-809fc80eba7d" />
<img width="790" height="693" alt="image" src="https://github.com/user-attachments/assets/47de9b23-07d8-45e9-8903-cb2b685cf7c9" />

## Key Features

- **Community-Driven Q&A Platform**
  - Ask and answer questions specific to college life, academics, and placements.
  - Supports anonymous posting to encourage open discussion on sensitive topics.
- **AI-Powered RAG Auto-Answering**
  - Uses a Retrieval-Augmented Generation (RAG) pipeline to instantly answer student questions.
  - Dynamically routes queries between a "college mode" (grounded in verified college data via FAISS vector search) and an "open mode" for general knowledge.
- **Advanced Hybrid Search**
  - Combines MongoDB Atlas keyword search with semantic/vector search for highly accurate information retrieval.
- **Secure Authentication & Access Control**
  - Integrates Firebase Authentication (Email/Password & Google OAuth) to ensure only authorized students and alumni can access the platform.
- **Modern, Intuitive User Interface**
  - Built with Next.js and Tailwind CSS for a fast, responsive, and aesthetic "college dashboard" experience that avoids the clutter of traditional forums.

## Design Decisions & Architecture

- **Frontend**: Next.js and Tailwind CSS were chosen to deliver a highly interactive, server-side rendered application with rapid styling capabilities and excellent performance.
- **Backend**: A Node.js/Express backend provides a robust and scalable API layer to manage authentication tokens, database operations, and asynchronous process spawning.
- **Database**: MongoDB Atlas was selected for its flexible document structure and native support for both text and vector search, eliminating the need for a separate search engine.
- **AI Pipeline**: Python with `google.generativeai` (Gemini Flash) and `FAISS`. Python was chosen for the AI pipeline due to its unmatched ecosystem for vector operations and machine learning integrations.

### Challenges Faced & Architectural Evolutions

1. **AI Hallucinations on College-Specific Queries**
   - *Problem*: The AI would confidently invent answers about college policies (e.g., passing criteria or placement stats) when it didn't inherently know the answer.
   - *Solution*: Researched RAG (Retrieval-Augmented Generation) and implemented a FAISS vectorstore in Python. The architecture was updated to scrape official college portals and Reddit, chunk the data, and strictly ground the AI's prompt in retrieved context, preventing hallucinations.
2. **Handling Diverse Query Types (College vs. General)**
   - *Problem*: Once strictly grounded, the AI refused to answer general programming or career questions (like "What is Image Segmentation?").
   - *Solution*: Updated the system architecture to include a dual-routing mechanism. The Node backend now intelligently passes `--mode college` or `--mode open` arguments to the Python engine, allowing it to dynamically bypass the local vectorstore for general knowledge queries while remaining strict for college-specific ones.
3. **API Rate Limiting and Model Instability**
   - *Problem*: Hardcoding specific bleeding-edge Gemini model versions (like 2.0-flash) resulted in 404 and 429 quota errors on the free tier, breaking the auto-answer pipeline.
   - *Solution*: Transitioned the architecture to use stable aliases like `gemini-flash-latest` for generation and `gemini-embedding-2` for high-dimensional vector creation. Implemented a robust fallback system in the Python pipeline that degrades gracefully to local `all-MiniLM` embeddings and deterministic text responses if API quotas are temporarily exhausted.


## Tech Stack

- Frontend: Next.js, React, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB Atlas
- Authentication: Firebase Authentication
- Search: MongoDB Atlas Search + Atlas Vector Search

## Features Included

- Email/password authentication
- Google sign-in with Firebase
- Backend Firebase token verification
- College-style dashboard and product UI
- Hybrid question search:
  - keyword search
  - semantic/vector search
- Free local embedding fallback for development

## Project Structure

- `frontend/`: Next.js app
- `backend/`: Express API
- `README.md`: setup guide

## Before You Start

You should have these installed:

- Node.js 20+
- npm
- A Firebase project
- A MongoDB Atlas cluster

## 1. Clone The Project

```bash
git clone <your-github-repo-url>
cd wisdom-wing
```

If your folder name is different, use that folder name instead.

## 2. Install Dependencies

Install root, frontend, and backend packages:

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
cd ..
```

## 3. Set Up Firebase Authentication

### A. Firebase Console

In Firebase Console:

1. Open your project `WisdomWing`
2. Go to `Authentication`
3. Enable:
   - `Google`
   - `Email/Password`
4. Go to `Authentication` -> `Settings`
5. Add `localhost` to Authorized Domains if it is not already there

### B. Create Firebase Web App

1. Go to `Project settings`
2. In `Your apps`, click the web icon `</>`
3. Register a web app
4. Copy the Firebase config values

### C. Frontend Environment

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

Fill the values using your Firebase web app config.

## 4. Set Up Firebase Admin For Backend

1. In Firebase Console, go to `Project settings`
2. Open `Service accounts`
3. Click `Generate new private key`
4. Download the JSON file

Create `backend/.env`:

```env
PORT=5001
MONGODB_URI=
CLIENT_URL=http://localhost:3000
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GEMINI_API_KEY=
EMBEDDING_PROVIDER=local
EMBEDDING_MODEL=text-embedding-004
VECTOR_INDEX_NAME=question_embedding_index
```

Copy these values from the downloaded Firebase Admin JSON:

- `project_id` -> `FIREBASE_PROJECT_ID`
- `client_email` -> `FIREBASE_CLIENT_EMAIL`
- `private_key` -> `FIREBASE_PRIVATE_KEY`

Important:

- Keep `FIREBASE_PRIVATE_KEY` inside double quotes
- Keep the `\n` escapes in the key

## 5. Set Up MongoDB Atlas

1. Create a free `M0` cluster in MongoDB Atlas
2. Create a database user
3. Add your IP address to network access
4. Copy the connection string
5. Paste it into `backend/.env` as `MONGODB_URI`

Example:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wisdom-wing
```

## 6. Create Atlas Vector Search Index

In MongoDB Atlas, create a vector search index for the `questions` collection using this configuration:

File reference:
`backend/src/config/vector-index.example.json`

Expected dimensions:

- `256` for the current local embedding fallback

Current default:

- `EMBEDDING_PROVIDER=local`

That means you can test semantic search without paying for an embedding API.

## 7. Run The Project

Open two terminals.

### Terminal 1: frontend

```bash
cd wisdom-wing
npm run dev:frontend
```

### Terminal 2: backend

```bash
cd wisdom-wing
npm run dev:backend
```

Open:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend health: [http://localhost:5001/health](http://localhost:5001/health)

## 8. Test Authentication

Try these routes:

- [http://localhost:3000/auth/signup](http://localhost:3000/auth/signup)
- [http://localhost:3000/auth/login](http://localhost:3000/auth/login)

Test:

- sign up with email/password
- sign in with Google

## 9. Test Question Search

The backend search route is:

- `GET /api/search/questions?query=<text>&mode=hybrid`

Modes:

- `hybrid`
- `keyword`
- `semantic`

## 10. Push To GitHub Safely

This project now includes a `.gitignore` that blocks:

- `frontend/.env.local`
- `backend/.env`
- Firebase service account JSON files
- `node_modules`
- build output

Before pushing, make sure you do not commit secrets.

Check status:

```bash
git status
```

Initialize and push:

```bash
git add .
git commit -m "Initial Wisdom Wing setup"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

If `origin` already exists:

```bash
git remote set-url origin <your-github-repo-url>
git push -u origin main
```

## Common Issues

### Google login works but then shows `Failed to fetch`

This usually means the frontend cannot reach the backend.

Check:

- frontend uses `NEXT_PUBLIC_API_URL=http://localhost:5001`
- backend runs on `PORT=5001`
- backend is running
- [http://localhost:5001/health](http://localhost:5001/health) responds

### Firebase Admin token verification fails

Check:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

### MongoDB connection fails

Check:

- IP access list in MongoDB Atlas
- username/password in `MONGODB_URI`
- database user permissions

## Notes

- Do not commit your `.env` files
- Do not commit Firebase Admin JSON keys
- For stronger semantic search later, you can set `EMBEDDING_PROVIDER=gemini` and add `GEMINI_API_KEY`
