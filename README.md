# Wisdom Wing

Wisdom Wing is a college-focused collaboration platform where students can ask questions, connect with seniors and alumni, share resources, and discover relevant opportunities without the clutter of a typical social feed.

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
