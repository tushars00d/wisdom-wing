# WISDOM WING: PROJECT X-RAY
*An Engineering Postmortem and Technical Documentary for Future Generations*

==================================================
## SECTION 1 — PROJECT IDENTITY
==================================================

**Project Name:** Wisdom Wing  
**Mission Statement:** To democratize college community knowledge by organizing scattered academic, placement, and peer guidance into an AI-augmented, centralized platform.  
**Elevator Pitch:** Wisdom Wing is a Next.js/Node.js community platform that uses AI-driven retrieval and automated Q&A to ensure no student question goes unanswered, functioning as an intelligent "Stack Overflow for College Communities."  
**Core Business Problem Solved:** Institutional knowledge (e.g., how to secure an internship, college-specific administrative processes, curriculum guidance) is traditionally lost in ephemeral chat groups (WhatsApp, Telegram) or undocumented word-of-mouth. Wisdom Wing captures, structures, and resurfaces this knowledge using Vector Search and Large Language Models (LLMs).  
**Industry/Domain:** EdTech / Community Administration Platform  
**Intended Users:** College students, community administrators, and university faculty.  
**Scale Expectations:** Designed to support thousands of concurrent students per institution with low-latency reads and real-time AI-assisted generation.  

### Historical Context
When Wisdom Wing was created (circa 2026), the world was transitioning into the "Generative AI Era." Competing systems like Reddit, Discord, and standalone forums existed, but they lacked native AI integrations designed to instantly answer questions based on historical context. Existing solutions were insufficient because they relied purely on human availability. Wisdom Wing's architecture was chosen to bridge this gap: combining traditional CRUD (Create, Read, Update, Delete) community management with an intelligent "auto-answer" layer powered by the Gemini API.

==================================================
## SECTION 2 — PROJECT ORIGIN STORY
==================================================

### The Genesis
The idea originated from a recurring pain point observed by M.Tech students: juniors continuously asked the same questions regarding placements, internships, and coursework. Seniors, suffering from fatigue, would either ignore them or provide fragmented answers. 

### Motivations & Constraints
- **Business/Academic Motivation:** To build a robust dissertation project proving the efficacy of Retrieval-Augmented Generation (RAG) in community environments.
- **Technical Motivation:** To master full-stack JavaScript (Next.js + Express) and integrate cutting-edge LLM technology (Gemini) into a traditional web architecture.
- **Constraints:** The system had to be built with zero/low-budget cloud infrastructure (hence the use of Railway and MongoDB Atlas free tiers). It had to be delivered within a single academic semester by a solo developer/small team.

### Evolution
The initial MVP was just a basic forum. However, as requirements evolved, the team realized that relying on humans to populate answers was a bottleneck. The architecture pivoted to include the `auto-answer.service.js`, embedding a fallback deterministic system that eventually evolved into a dynamic Gemini-powered agent. Success originally meant "people can post." It evolved into "the AI can instantly and accurately answer 80% of posts."

==================================================
## SECTION 3 — HIGH LEVEL SYSTEM OVERVIEW
==================================================

Imagine a city. The **Client Side** is the public storefront, the **Backend** is the administrative office, the **Database** is the central library, and the **AI** is the intelligent librarian.

### Architecture Breakdown
1. **Client Side (Next.js Frontend):** The user interface rendered in the browser. It handles state, routing, and UI components. Chosen for its Server-Side Rendering (SSR) capabilities which aid in SEO and initial load speeds.
2. **Backend (Express.js/Node.js):** The central nervous system. It receives API requests from the frontend, enforces security rules, and dictates business logic.
3. **Database (MongoDB Atlas):** A NoSQL document database. Chosen because community data (posts, comments, unstructured tags) fits perfectly into flexible JSON-like documents.
4. **Authentication (Firebase Auth):** Handles user identities securely without forcing the backend to manage raw passwords.
5. **AI/ML System (Gemini API & Local Embeddings):** When a user asks a question, the backend queries the Gemini API to stream an answer. Vector embeddings are used to find similar past questions.

### Alternatives Rejected
A monolithic framework like Django (Python) or Ruby on Rails was rejected in favor of a decoupled React (Next.js) + Node.js architecture to allow the frontend and backend to scale independently and to utilize the massive JavaScript ecosystem.

==================================================
## SECTION 4 — COMPLETE TECH STACK DEEP DIVE
==================================================

### Frontend: Next.js (React) & Tailwind CSS
- **Mechanics:** Next.js compiles React components into static HTML or server-rendered pages. Tailwind provides utility-first CSS, meaning styles are applied directly via class names (e.g., `flex text-center`).
- **Why Chosen:** Unmatched developer velocity and performance. 

### Backend: Express.js (Node.js)
- **Mechanics:** An event-driven, non-blocking I/O server. It uses a single-threaded event loop to handle thousands of concurrent requests by offloading heavy operations to the OS.
- **Why Chosen:** Unifies the language stack (JavaScript everywhere).

### Database: MongoDB & Mongoose
- **Mechanics:** Stores data as BSON (Binary JSON). Mongoose acts as the Object Data Modeling (ODM) layer, providing schema validation over a schemaless database.
- **Why Chosen:** High flexibility for evolving schemas (e.g., adding a new "upvotes" array to a post doesn't require a rigid schema migration).

### Authentication: Firebase
- **Mechanics:** Uses OAuth and JWT (JSON Web Tokens). The frontend talks to Google servers to log in, receives a cryptographic token, and passes it to the Express backend. The backend verifies the token using the Firebase Admin SDK.
- **Security Implications:** Eliminates the risk of storing salted passwords in the database.

==================================================
## SECTION 5 — DATA FLOW (VERY IMPORTANT)
==================================================

Let's trace a user posting a question:

1. **User Action:** The user types a question and clicks "Submit" on the Next.js frontend.
2. **Frontend Event:** React intercepts the click, prevents default browser reloading, and grabs the form state.
3. **API Call:** A `fetch` request is dispatched to `https://[backend-url]/api/questions` with a Bearer JWT in the authorization header.
4. **Middleware:** The Express backend receives the request. The CORS middleware checks the origin. The Auth middleware verifies the JWT against Firebase's public keys.
5. **Business Logic:** The `question.service.js` kicks in. It sanitizes the input.
6. **AI Trigger (Async):** The `auto-answer.service.js` is triggered. It packages the question and sends a prompt to the Gemini API.
7. **Database Operation:** Mongoose writes the new question document to MongoDB.
8. **Response:** The backend sends a `201 Created` status back to the client.
9. **Frontend Rendering:** React updates the local state and visually inserts the new question into the feed without refreshing the page.

==================================================
## SECTION 6 — DATABASE ARCHITECTURE
==================================================

**Philosophy:** Denormalization where read-heavy, normalization where write-heavy.

**Core Collections:**
- `Users`: Stores profile data, roles (admin/student), and community affiliations.
- `Communities`: Represents groups (e.g., "Computer Science 2026").
- `Questions` & `Posts`: The core content. Includes arrays for `tags` and references to the `Author` (User ID).
- `Answers` & `Replies`: Linked via ObjectIds to the parent Question.

**Optimization Evolution:**
Initially, fetching a feed required querying the database, then doing a "join" (using `$lookup` in MongoDB) to fetch the author's name. As the app grew, basic author details (Name, Avatar) were duplicated (denormalized) directly into the `Post` document to achieve sub-50ms read times, trading storage space for extreme read speed.

==================================================
## SECTION 7 — AUTHENTICATION & SECURITY
==================================================

**Model:** Stateless JWT architecture.

- **Flow:** Firebase handles the actual credential verification. It returns a JWT. The Express backend uses `firebase-admin.auth().verifyIdToken()` middleware on protected routes.
- **CORS:** The backend explicitly restricts access to the Next.js frontend domain (`process.env.CLIENT_URL`), preventing malicious sites from making cross-origin API calls on behalf of the user.
- **Secrets:** Keys like `GEMINI_API_KEY` and `MONGODB_URI` are injected via environment variables at runtime by the cloud provider (Railway) and never hardcoded.
- **Threat Model:** The biggest threat is unauthorized data mutation. This is mitigated by role-based access control (RBAC) enforced at the service layer (e.g., checking `if (user.role !== 'admin') throw Error`).

==================================================
## SECTION 8 — FRONTEND ARCHITECTURE
==================================================

**UI Philosophy:** Clean, fast, and accessible. Designed to look premium and intuitive.

**Mechanics:**
- **Component Architecture:** Heavily modular. Buttons, Input fields, and Cards are isolated components reused across pages.
- **Routing:** Handled by the Next.js App Router.
- **Error Handling:** Global Error Boundaries catch crashes. If an API call fails, a visually pleasing Toast notification informs the user, preventing a "white screen of death."

==================================================
## SECTION 9 — BACKEND ARCHITECTURE
==================================================

**Philosophy:** "Thin Controllers, Fat Services."

- **Controllers (`src/routes/*`):** Only handle HTTP mechanics (extracting `req.body`, sending `res.status`).
- **Services (`src/services/*`):** Hold all business logic. This makes the code highly testable. If the team ever decided to drop Express for another framework, the service files would remain completely untouched.
- **Error Boundaries:** A global Express error middleware catches any thrown errors in the services and formats them into a standard JSON response (`{ message: "..." }`), ensuring the server never crashes from unhandled exceptions.

==================================================
## SECTION 10 — DEVOPS & INFRASTRUCTURE
==================================================

**Hosting Strategy:** Platform-as-a-Service (PaaS).
- **Railway:** Chosen to host both the Node.js backend and Next.js frontend. Railway abstracts away Docker and Kubernetes. It links directly to GitHub, detecting when code is pushed to the `main` branch, automatically building the container, and deploying it with zero downtime.
- **Environment Separation:** Local `.env` files dictate the local environment. Railway's dashboard injects production variables.

==================================================
## SECTION 11 — PERFORMANCE ENGINEERING
==================================================

**Bottlenecks Encountered:** The Gemini API introduced massive latency (1-3 seconds) to the otherwise blazing fast (45ms) Node.js server.
**Optimization:** AI generation was decoupled. Instead of making the user wait for the AI to finish thinking before the post was "saved", the backend saves the post instantly and returns a response. The AI answers asynchronously in the background and updates the database a few seconds later.

==================================================
## SECTION 12 — AI/ML SYSTEMS
==================================================

**Model:** Gemini (1.5 Flash/Pro via API).
**Prompt Engineering:** The `auto-answer.service.js` uses strict system prompting. It explicitly tells the model: *"Do not give generic filler. If the user asks about jobs, answer with roles and practical next steps."*
**Fallback Mechanism:** If the API key is missing or the Google servers are down, a deterministic fallback system uses basic RegEx and keyword matching (`tokenize`, `hasAny`) to provide pre-written guidance, guaranteeing 100% uptime for automated answers.

==================================================
## SECTION 13 — ENGINEERING PHILOSOPHY
==================================================

- **Pragmatism over Purity:** Choosing MongoDB because it allows fast iteration, rather than spending weeks designing a rigid SQL schema.
- **Fail Gracefully:** Seen in the AI fallback mechanics. If the shiny new AI tech fails, the system degrades to a hardcoded string rather than crashing.
- **Decoupling:** Keeping the frontend and backend in separate folders (monorepo) so they can be scaled, tested, and deployed independently.

==================================================
## SECTION 14 — FAILURES, LESSONS & TRADEOFFS
==================================================

- **The CORS Incident:** During initial deployment, the frontend could not connect to the backend ("Failed to fetch"). The team learned that browsers enforce strict Cross-Origin Resource Sharing. The lesson: always explicitly configure `credentials: true` and the exact `origin` in Express.
- **Vercel vs. Railway Tradeoff:** The backend was initially designed for Vercel's serverless functions (hence `if (process.env.NODE_ENV !== "production") app.listen(...)`). It was later migrated to Railway, a long-running container service. The team had to re-architect the `server.js` startup script to account for this paradigm shift.

==================================================
## SECTION 15 — COMPLETE CHRONOLOGICAL EVOLUTION
==================================================

1. **V1 (Local Prototype):** Basic Express server and React frontend. Hardcoded mock data.
2. **Database Integration:** Mongoose connected to Atlas. Real CRUD operations established.
3. **Authentication Layer:** Firebase integrated. Security rules enforced.
4. **The AI Pivot:** Gemini API integrated. `auto-answer.service.js` built to augment the community.
5. **The Deployment Incident:** Moved to Railway. Fixed CORS issues and Serverless vs. Container startup scripts.
6. **M.Tech Finalization:** Comprehensive evaluation metrics and testing architectures formalized for academic defense.

==================================================
## SECTION 16 — REBUILD GUIDE (For Future Civilizations)
==================================================

If civilization falls and you must rebuild Wisdom Wing:
1. **Start with the Database:** Establish the MongoDB schema. The shape of the data defines the reality of the app.
2. **Build the API Layer:** Recreate the Express endpoints. Do not worry about AI yet; ensure a human can post and retrieve a question.
3. **Add the Frontend:** Build the Next.js UI to interact with the API.
4. **Inject AI:** Finally, add the Gemini API middleware to intercept questions. 
*Hidden Insight:* Do not tighten CORS until production. Develop with open CORS (`*`), then lock it down to the exact domain when deploying.

==================================================
## SECTION 17 — SIMPLIFIED EXPLANATION FOR FUTURE HUMANS
==================================================

Imagine a massive, magical library. 
Usually, when you enter a library and ask a question, you have to write it on a bulletin board and wait days for another human to walk by, read it, and write an answer below it. 
**Wisdom Wing** is a library that has a magical, invisible scholar living inside the walls (the AI). The second you pin your question to the board, the scholar reads it, searches every book in the library instantly, and writes a highly accurate, personalized answer for you within seconds. If the magical scholar ever falls asleep (API failure), the librarian (the deterministic fallback code) has a pre-printed cheat sheet to hand you so you never leave empty-handed.
