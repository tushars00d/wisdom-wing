# Wisdom Wing Firebase + Vercel Setup

This app needs three hosted services for a fully working production deploy:

1. Firebase Authentication for login/signup.
2. MongoDB Atlas for app data.
3. Vercel for the frontend and backend deployments.

## 1. Firebase

Create or open a Firebase project, then enable:

- Authentication > Sign-in method > Email/Password
- Authentication > Sign-in method > Google

Create a Web app in Firebase Project settings. Copy its config into:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

For the backend, open Firebase Project settings > Service accounts > Generate new private key.
Copy these values from the downloaded JSON:

```env
FIREBASE_PROJECT_ID=project_id
FIREBASE_CLIENT_EMAIL=client_email
FIREBASE_PRIVATE_KEY="private_key"
```

Keep the private key as one env value. If pasting into a `.env` file, keep the quotes and `\n` newline escapes.

## 2. MongoDB Atlas

Create an Atlas cluster and database user, then add the connection string:

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/wisdom-wing
```

In Atlas Network Access, allow Vercel to connect. The simplest startup setting is `0.0.0.0/0`, but restrict it later if your deployment plan supports stable outbound IPs.

## 3. Vercel Projects

Deploy this monorepo as two Vercel projects from the same Git repository.

### Backend project

- Root Directory: `backend`
- Framework Preset: Other
- Build Command: leave empty/default
- Output Directory: leave empty/default

Environment variables:

```env
PORT=5001
MONGODB_URI=
CLIENT_URL=https://YOUR-FRONTEND.vercel.app
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
SUPERADMIN_EMAIL=tushar.09sood@gmail.com
GEMINI_API_KEY=
EMBEDDING_PROVIDER=local
EMBEDDING_MODEL=text-embedding-004
VECTOR_INDEX_NAME=question_embedding_index
```

After deployment, check:

```text
https://YOUR-BACKEND.vercel.app/health
```

### Frontend project

- Root Directory: `frontend`
- Framework Preset: Next.js
- Build Command: `npm run build`

Environment variables:

```env
NEXT_PUBLIC_API_URL=https://YOUR-BACKEND.vercel.app
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

## 4. Authorized Domains

After frontend deployment, add these in Firebase Authentication > Settings > Authorized domains:

- `localhost`
- `YOUR-FRONTEND.vercel.app`
- any custom domain you connect to Vercel

## 5. Local Development

Fill:

- `frontend/.env.local`
- `backend/.env`

Then run:

```bash
npm run dev:frontend
npm --workspace backend run start
```

The backend `dev` script uses `node --watch`, which can hit macOS watcher limits on some machines. `start` is fine for local verification.
