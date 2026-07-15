# Wisdom Wing API Blueprint

## Core Modules

- `POST /api/auth/signup`: create user and set `verificationStatus=pending`
- `POST /api/auth/session`: verify Firebase token and upsert local user profile
- `POST /api/auth/verify-college-id`: upload proof and enqueue admin review
- `GET /api/questions`: fetch personalized home feed
- `POST /api/questions`: create question, generate embedding, run duplicate search
- `GET /api/questions/:questionId`: fetch question, answers, AI summary, related items
- `GET /api/search`: support keyword mode and semantic mode
- `GET /api/search/questions`: search posted questions with hybrid, keyword, or semantic mode
- `POST /api/resources`: upload resource and optionally create knowledge base chunks
- `GET /api/admin/overview`: moderation metrics and AI feedback signals

## AI / RAG Flow

1. User posts a question.
2. Backend creates embeddings for duplicate detection.
3. Question is saved with `aiSummaryStatus=queued`.
4. A delayed job checks `answersCount` after 15 minutes.
5. If still unanswered, retrieve top knowledge chunks via MongoDB vector search.
6. Send strict prompt plus retrieved chunks to Gemini.
7. Save output as `Answer` with `isAiGenerated=true`.
8. Downvotes or reports feed back into admin review.

## Free-Tier Friendly Notes

- `Firebase Authentication` handles Google sign-in and email/password login.
- `MongoDB Atlas M0` can store your operational question data and vector index for small-scale use.
- `EMBEDDING_PROVIDER=local` keeps development fully free with local hashed embeddings.
- Switch to `EMBEDDING_PROVIDER=gemini` when you add `GEMINI_API_KEY` for better semantic quality.
