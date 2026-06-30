# Authentication

## Why this topic exists in MockMate
MockMate gates every meaningful action (rooms, scheduling, feedback, sockets) behind a logged-in, **email-verified** user. Authentication establishes *who* the request belongs to before any controller runs. Our architecture is designed to resist token theft (XSS) by holding the access token purely in-memory and persisting session credentials via a browser-managed HttpOnly refresh cookie.

## Where it is implemented
- [auth.controller.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/controllers/auth.controller.js) — register, login, verifyEmail, resendVerification, refresh, logout, getProfile, userUpdate.
- [User.model.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/models/User.model.js) — password hashing hook, `isPasswordCorrect` comparison, access and refresh token generation.
- [auth.middleware.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/middlewares/auth.middleware.js) — `verifyJWT` reads and validates the access token from the `Authorization: Bearer <token>` header.
- [tokenStore.js](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/api/tokenStore.js) — Memory-only storage for the active access token, offering pub/sub access for Axios interceptors and React state synchronization.
- [AuthContext.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/context/AuthContext.jsx) — Bootstraps session restoration, coordinates tokenStore updates, and manages UI authentication states.
- [axios.js](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/api/axios.js) — Custom axios instance injecting the in-memory access token into requests and triggering silent refresh on 401s.

## Code Flow
1. **Registration**: `POST /auth/register` → validate → normalize email/username → create user (pre-save hashes password) → generate verification code (store SHA-256 hash + 15-min expiry) → email raw code → respond with user email.
2. **Email Verification**: `POST /auth/verify-email` → hash submitted code → look up user by email + hash + unexpired status → set `isVerified = true`, clear token fields.
3. **Login**: `POST /auth/login` → locate user by email → verify password (bcrypt compare) → block if `!isVerified` → generate access token (short-lived) + refresh token (7 days) → save refresh token in database → set refresh token cookie → return `{ user, accessToken }` in JSON body. The frontend stores `accessToken` strictly in-memory.
4. **Authenticated Requests**: Outgoing REST requests attach the access token as `Authorization: Bearer <token>`. The `verifyJWT` middleware reads the token from the header, verifies it via `ACCESS_TOKEN_SECRET`, queries the database to exclude password/refreshToken, and attaches `req.user`.
5. **Session Restoration (Page Reload)**: The frontend memory is wiped. `AuthContext` triggers `refreshAccessToken()` silently → calls `POST /auth/refresh-token` (browser sends refresh cookie) → server rotates refresh token, sets a new cookie, and returns the new access token in the JSON body → client saves the access token in-memory and calls `GET /auth/current-user` to populate the `user` state.

## Components involved
- User model methods, auth controller, `verifyJWT`, rate limiters, validation middleware, email service, `tokenStore.js`, `AuthProvider`, custom hooks.

## Dependencies involved
- `bcrypt`, `jsonwebtoken`, `crypto`, `mongoose`, `express`, `cookie-parser`, `axios`.

## Related modules
- [jwt.md](jwt.md), [refresh-tokens.md](refresh-tokens.md), [cookies-and-token-storage.md](cookies-and-token-storage.md), [authorization.md](authorization.md), [rate-limiting.md](rate-limiting.md), [email-service.md](email-service.md), [context-api.md](context-api.md)

## Concepts I MUST Study
- Stateful vs stateless authentication flows
- Adaptive credentials hashing and salt rounds
- Timing-safe password comparisons (preventing side-channel timing attacks)
- Account enumeration defenses
- Email verification lifecycles and token storage hashing (SHA-256 vs Bcrypt)
- Access token in-memory storage (anti-XSS) vs cookies/local storage persistence
- Bearer token authorization scheme
- Idempotency and token verification concurrency
- Database re-querying during JWT verification (balancing DB load vs stale data)

## Beginner Interview Questions
- What is authentication and how does it differ from authorization?
- What does the `/register` endpoint do step-by-step?
- How are passwords stored and verified in your database?
- Where on the client is the access token stored, and why?
- Where is `req.user` populated?

## Intermediate Questions
- Why do you normalize email to lowercase before database uniqueness checks?
- Why check the password *before* checking the `isVerified` flag during login?
- Why is the email verification code stored as a SHA-256 hash instead of a bcrypt hash?
- How does page load session restoration work if the access token is in-memory only?

## Advanced Questions
- Walk through how the client handles access token expiry. What happens when a request fails with 401?
- Explain how we prevent account enumeration on the registration and email verification endpoints.
- Why does the `verifyJWT` middleware re-query the database to fetch the user instead of relying entirely on the payload decoded from the JWT?
- If the access token is in-memory, what happens when a user opens MockMate in a new browser tab? How is the session restored?

## Staff-Level Questions
- Design a passwordless authentication flow (e.g. Magic Links or WebAuthn/Passkeys) that fits into this cookie-refresh architecture.
- If we scaled the backend to 50 active instances, how would we validate in-memory access tokens statelessly, and how would we handle immediate global token revocation?
- Analyze the security and implementation trade-offs of storing the access token in-memory vs storing it in a partitionable, CSRF-protected cookie.

## Questions About MY Implementation
- Why did you choose bcrypt with 10 salt rounds specifically?
- Why does `resendVerification` always return a generic success message, and how does this protect user privacy?
- Why does the login endpoint return the access token in the JSON payload rather than putting it in a cookie?
- Explain why `AuthContext` uses `bootstrapStarted.current` ref during session restoration on mount.

## Follow-up Questions
- What breaks if we don't clear the access token in-memory when the silent refresh fails?
- What happens if the email verification delivery fails mid-registration?
- How does the system handle concurrent API calls when the access token is expired?

## Code Reading Questions
- Locate where `verifyJWT` extracts the token. What header prefix does it expect?
- Trace the fields excluded by `.select("-password -refreshToken")` in `verifyJWT`.
- In `AuthContext.jsx`, look at the `setAuthFailureHandler` registration. What does it do when a refresh failure is triggered?

## Debugging Questions
- A user is logged in, but refreshing the page instantly redirects them to `/login`. Where do you start debugging (check `/refresh-token` cookies, check console logs)?
- Sockets fail to authenticate and reconnect in a loop. How do you trace if the socket client is receiving the rotated access token from the context?

## Edge Cases
- The user changes their password from device A; how is the session invalidated on device B?
- The backend database goes down while a client is executing a silent refresh request.
- The access token expires in the middle of a continuous live interview room coding session.

## Security Questions
- Why is it insecure to use MD5 or SHA-1 for passwords, but acceptable to use SHA-256 for email verification codes?
- How does this implementation mitigate XSS access to authentication states?
- What stops an attacker from executing a CSRF attack on protected endpoints under this architecture?

## Performance Questions
- What is the CPU cost of bcrypt on login, and does it present a vector for DDoS attacks?
- Does running a silent refresh on every browser boot significantly impact page load speeds?

## Scalability Questions
- How does the in-memory access token architecture scale for users with multiple browser tabs?
- If we implement single sign-on (SSO) or OAuth, how does the token lifecycle adjust?

## Trade-off Questions
- Single-instance in-memory token state vs Redux/Zustand global store mapping.
- Password hashing on DB pre-save hooks vs controller-level hashing.

## Refactoring Questions
- Refactor the auth controllers to separate registration, verification, and session flows into dedicated service modules.

## Whiteboard Questions
- Draw the complete sequence diagram for registration, email verification, login, authenticated request, and silent token refresh.
- Diagram how the Axios interceptor, `tokenStore.js`, and `AuthContext` interact to coordinate token refreshes.

## Practical Coding Exercises
- Implement a lockout mechanism that blocks login attempts on an account after 5 failed password checks.
- Add an Express middleware that checks the IP address and enforces geographic boundaries on login attempts.

## Revision Checklist
- [ ] I can describe the exact registration, verification, and login flows.
- [ ] I can justify why the access token is stored in-memory and refresh token is in a cookie.
- [ ] I can trace the silent refresh sequence diagram from memory.
- [ ] I can explain why timing-safe comparisons are crucial for credential validation.
- [ ] I can explain why timing of password check vs email verification check matters.

