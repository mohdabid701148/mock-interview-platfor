# MockMate 🎯

> A free, peer-to-peer mock interview platform for students — a shared code editor, live code execution, scheduling, and structured feedback, all in the browser.

Practice technical interviews the way they actually happen: pair up with a peer, take turns as interviewer and interviewee, solve problems in a real-time collaborative editor, run your code, and trade an honest scorecard at the end.

**Live demo:** [mock-interview-platfor.vercel.app](https://mock-interview-platfor.vercel.app)

> ⚠️ The backend runs on a free Render instance, so the **first request after inactivity may take ~30–50s** to wake up (cold start). Give it a moment on first load.

---

## ✨ Features

- **Authentication** — register/login with JWT access token (in-memory) + refresh token (HttpOnly, Secure, SameSite cookie with rotation).
- **Email verification** — 6-digit code sent on signup (via Brevo); login is blocked until verified.
- **Role-based sessions** — create an interview session and pair up as **interviewer** and **interviewee**.
- **Real-time collaboration** — a shared **Monaco** editor (the editor behind VS Code) synced live over Socket.IO; every keystroke and language switch appears for both participants.
- **Code execution** — run **JavaScript, TypeScript, Python, Java, and C++** with custom input (powered by Judge0).
- **Question attachment** — the interviewer can attach a problem (title, difficulty, description, examples) that syncs instantly.
- **Scheduling** — plan sessions ahead of time.
- **Notifications** — in-app notifications for relevant events.
- **Feedback & evaluation** — structured scorecards (problem-solving, communication, etc.) plus written notes.
- **History** — revisit past sessions, attached questions, code, and feedback.
- **Light / dark theme** and a fully responsive UI (mobile drawer navigation, etc.).

---

## 🧱 Tech Stack

**Frontend**
- React 19 + Vite
- React Router v7
- Tailwind CSS v4
- Monaco Editor (`@monaco-editor/react`)
- Socket.IO client
- Axios (with automatic token-refresh interceptor and in-memory `tokenStore.js`)
- lucide-react icons

**Backend**
- Node.js (ES modules) + Express 5
- MongoDB + Mongoose
- Socket.IO (JWT-authenticated)
- JWT (access + refresh) + bcrypt
- Helmet, CORS, express-rate-limit
- Brevo (Sendinblue) HTTP API for transactional email
- Judge0 CE for code execution

**Infrastructure (all free tier)**
- Frontend: **Vercel**
- Backend: **Render**
- Database: **MongoDB Atlas**
- DNS/SSL (optional): **Cloudflare**

---

## 🏗️ Architecture

```
React SPA (Vercel)
   │  REST  (axios, JWT Bearer)        ┌── MongoDB Atlas
   ├───────────────────────────►  Express API (Render) ──┤
   │  WebSocket (Socket.IO, JWT)       └── Judge0 (code execution)
   └───────────────────────────►  Socket.IO server (presence, live editor)
                                          │
                                          └── Brevo HTTP API (verification emails)
```

- **Auth:** Access token is stored strictly in-memory (XSS-resistant) and the rotating refresh token is stored in an HttpOnly, Secure, SameSite cookie. Outgoing REST requests attach the access token in `Authorization: Bearer <token>` headers. The Axios interceptor transparently runs a silent refresh on `401` errors and replays pending requests.
- **Real-time:** Socket.IO connection handshake is authenticated via JWT access token. Editor state is kept in memory and autosaved to MongoDB for active sessions.
- **Email:** uses Brevo's **HTTP API** (not SMTP) because most PaaS hosts block outbound SMTP ports.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (20/22 recommended)
- A MongoDB database (local or [Atlas](https://www.mongodb.com/atlas))
- A [Brevo](https://www.brevo.com) account (free) for verification emails — with a **verified sender**

### 1. Clone
```bash
git clone https://github.com/mohdabid701148/mock-interview-platfor.git
cd mock-interview-platfor
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env     # then fill in the values (see below)
npm run dev              # starts on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env     # then fill in the values (see below)
npm run dev              # starts on http://localhost:5173
```

Open the frontend URL, register an account, enter the 6-digit code from your email, and you're in.

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string (include the DB name) |
| `PORT` | Server port locally (e.g. `5000`); on Render leave unset |
| `NODE_ENV` | `development` locally, **`production`** when deployed (required for secure cross-site cookies) |
| `ACCESS_TOKEN_SECRET` | long random string |
| `REFRESH_TOKEN_SECRET` | a **different** long random string |
| `ACCESS_TOKEN_EXPIRY` | e.g. `2h` |
| `REFRESH_TOKEN_EXPIRY` | e.g. `7d` |
| `CORS_ORIGIN` | the frontend origin, e.g. `https://your-app.vercel.app` |
| `BREVO_API_KEY` | Brevo API key (`xkeysib-...`) |
| `EMAIL_FROM` | a **verified** Brevo sender, e.g. `MockMate <no-reply@yourdomain.com>` |
| `JUDGE0_API_URL` | Judge0 endpoint, e.g. `https://ce.judge0.com` |

### Frontend (`frontend/.env`)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend REST base URL incl. `/api/v1`, e.g. `https://your-backend.onrender.com/api/v1` |
| `VITE_SOCKET_URL` | Backend origin for Socket.IO, e.g. `https://your-backend.onrender.com` |

> Vite inlines `VITE_*` variables at **build time** — rebuild/redeploy after changing them.

---

## 📜 Scripts

**Backend**
| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm start` | Start the server (production) |

**Frontend**
| Command | Description |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

---

## ☁️ Deployment

- **Frontend → Vercel:** root directory `frontend`, set `VITE_API_URL` and `VITE_SOCKET_URL`. A `vercel.json` rewrite serves `index.html` for client-side routes.
- **Backend → Render:** root directory `backend`, build `npm install`, start `npm start`, health check path `/health`. Add all backend env vars; use a paid/always-on instance if you want to avoid cold starts.
- **Database → MongoDB Atlas:** allow your backend host's IP (or `0.0.0.0/0` with a strong DB user).
- **Email → Brevo:** verify a sender (or domain) and create an API key. Free tier sends ~300 emails/day.

---

## 📁 Project Structure

```
mock-interview-platfor/
├── backend/
│   ├── server.js
│   └── src/
│       ├── config/        # db + socket setup
│       ├── controllers/   # auth, rooms, code execution, feedback, schedule, notifications
│       ├── middlewares/    # auth, rate limiting, validation
│       ├── models/        # User, Room, Feedback, Schedule, Notification
│       ├── routes/        # /api/v1/* route definitions
│       ├── services/      # email (Brevo), code execution (Judge0)
│       ├── sockets/       # room presence + collaborative editor
│       └── utils/         # ApiError, ApiResponse, helpers, email templates
└── frontend/
    ├── index.html
    ├── vercel.json
    └── src/
        ├── pages/         # Landing, Login, Signup, VerifyEmail, Dashboard, Rooms, Room, Schedule, History, Profile, Settings
        ├── components/    # dashboard (nav/sidebar), editor, rooms, schedule, history, Logo
        ├── context/       # Auth + Socket providers
        ├── services/      # API clients (axios)
        └── hooks/
```

> Note: internally the data model and routes use the term **"room"** (`/rooms`, `roomCode`, socket events like `join-room`), while the UI presents these as **"sessions."**

---

## 🗺️ Notes & Limitations

- **Video/voice** is handled via an external **meeting link** (Google Meet, Zoom, Jitsi, etc.) that the interviewer attaches — there's no built-in video.
- Code execution depends on the configured **Judge0** instance; the public CE instance is rate-limited and best-effort.
- Real-time presence/editor state is kept **in memory** on a single backend instance (fine for the target scale; horizontal scaling would need a Redis Socket.IO adapter).

---

## 🤝 Contributing

Issues and PRs are welcome. Please open an issue to discuss substantial changes first.

---

## 📄 License

Released under the MIT License — free to use and modify.

---

Built by a student who got tired of practicing interviews alone. 🚀
