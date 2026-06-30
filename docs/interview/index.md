# MockMate Interview Preparation Documentation Index

Welcome to the MockMate technical interview study guide and question bank index. This documentation is structured to help you review, study, and prepare to defend every major engineering decision made in this codebase.

## Core Concepts & Architectural Topics

Each link below redirects to a dedicated topic guide containing implementation details, code flows, key study concepts, and a comprehensive bank of interview questions (no answers provided, designed for active recall).

### Authentication & Authorization
- [Authentication](authentication.md) — Registration, credentials hashing, email verification, and profile management.
- [Authorization](authorization.md) — Role controls, private room boundaries, and resource ownership checks.
- [JWT (JSON Web Tokens)](jwt.md) — Stateless token payloads, claim structures, and signature verification.
- [Cookies & Token Storage](cookies-and-token-storage.md) — Browser storage choices, SameSite, Secure flags, and XSS/CSRF trade-offs.
- [Refresh Tokens & Rotation](refresh-tokens.md) — Silent token refresh, concurrency, and token reuse protection.

### Infrastructure, DB & Backend Services
- [MongoDB & Mongoose](mongodb.md) — Schemas, validation hooks, transaction sessions, connection pools, and indexes.
- [Middleware Architecture](middleware.md) — Express middleware order, rate limiters, body sizes, and route wiring.
- [Error Handling, Logging, & Validation](error-handling.md) — Centralized Express error handlers, custom validators, and async handler decorators.
- [Email Service & Integration](email-service.md) — Brevo HTTPS transactional API, exponential backoffs, SPF/DKIM, and queues.

### Real-Time & Live Features
- [Sockets & Real-Time Sync](sockets.md) — Socket.IO rooms, connection registries, in-memory state caching, and debounced database autosaves.
- [Code Execution Engine](code-execution.md) — Judge0 integration, C++/Java wrapper builders, base64 data pipelines, and security sandboxing.
- [Interview Rooms & Workspace](rooms.md) — Workspace creation, status flow charts, transaction rollbacks, and participant guards.
- [Interview Scheduling & Calendar](scheduling.md) — Booking calendars, math-based conflict evaluations, and date structures.

### Frontend, Deployment & Environments
- [React Architecture & Context API](react-architecture.md) — React 19 structures, app boot flows, auth/socket context providers, hooks, and axios queues.
- [Deployment, CORS, & Environments](deployment.md) — Vercel and Render layouts, CORS credentials constraints, proxy routing, and Helmet CSP settings.
- [Security, Encryption, & Rate Limiting](security.md) — Hashing algorithms, express rate limit structures, body sizes, NAT blocking, and XSS sanitizers.

---

## Study Strategy
1. **Active Recall**: Read through the question lists inside each topic guide. Answer them aloud or write down your answers without checking the code first.
2. **Code Reading**: Use the "Code Reading Questions" section in each file to trace exact execution lines inside your IDE workspace.
3. **Whiteboarding**: Practice drawing the sequence diagrams requested in the "Whiteboard Questions" sections.
4. **Hands-On Exercises**: Complete the "Practical Coding Exercises" to deepen your refactoring and testing skills.
