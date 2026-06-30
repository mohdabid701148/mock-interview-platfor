# Refresh Tokens & Rotation

## Why this topic exists in MockMate
Short-lived access tokens improve security but would force users to re-login frequently. A rotating refresh token lets the client silently obtain new access tokens while keeping the session active and enabling server-side revocation. The refresh token is the only piece of persistent authentication state, stored inside a secure cookie and rotated on every single validation to prevent replay attacks.

## Where it is implemented
- [auth.controller.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/controllers/auth.controller.js) — `refreshAccessToken` verifies the refresh token, invalidates reuse, generates new tokens, updates the database, and rotates the refresh cookie.
- [User.model.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/models/User.model.js) — Defines the `refreshToken` field and generates refresh tokens with `generateRefreshToken()`.
- [axios.js](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/api/axios.js) — Catch 401s, queue requests, perform silent token refresh via `POST /auth/refresh-token`, update memory, and retry original requests.
- [AuthContext.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/context/AuthContext.jsx) — Performs silent refresh on boot/mount to restore user sessions.

## Code Flow
1. **Refresh Validation**: When a 401 occurs or at boot, the client posts to `/auth/refresh-token`. The server extracts the token strictly from `req.cookies?.refreshToken`.
2. **Reuse Detection & Rotation**:
   - The server decodes the token, loads the user from the database, and compares the stored database `refreshToken` with the incoming token.
   - If they match, the server generates a brand new `accessToken` and `newRefreshToken`.
   - The server overwrites the user's `refreshToken` field in the database with the `newRefreshToken` (rotating it).
   - The server sets the rotated token in the `refreshToken` cookie and returns `{ accessToken: newAccessToken }` in the JSON response body.
   - If the database `refreshToken` does NOT match the incoming token (or is empty), it indicates that the token was either already rotated (potential theft/replay) or revoked. The server throws a `401 Unauthorized`.
3. **Revocation (Logout)**: The `logoutUser` controller unsets the `refreshToken` in the database, rendering any leaked or old cookies immediately invalid.
4. **Client Concurrency**: The Axios interceptor uses `isRefreshing` to handle multiple concurrent 401 errors. Only the first request triggers the refresh POST. The rest are queued via `failedQueue` and resolved once the new access token is stored in memory.

## Components involved
- `refreshCookieOptions`, `refreshAccessToken` controller, `failedQueue` in Axios interceptor, `AuthContext` bootstrap ref.

## Dependencies involved
- `jsonwebtoken`, `mongoose`, `axios`, `express`.

## Related modules
- [jwt.md](jwt.md), [authentication.md](authentication.md), [cookies-and-token-storage.md](cookies-and-token-storage.md)

## Concepts I MUST Study
- Refresh token rotation (RTR) mechanics
- Token reuse / replay detection and threat response
- Absolute vs sliding session expiries
- Concurrency and race conditions in rotating token designs
- Idempotence issues under concurrent requests
- Promise-based queuing on the client side
- Single-token session revocation vs multi-device session collections

## Beginner Interview Questions
- What is a refresh token and what security problem does it solve?
- Where is the refresh token stored on the server?
- What does logging out do to the refresh token in the database?
- How is the refresh token cookie transmitted from the frontend to the backend?

## Intermediate Questions
- Explain what "refresh token rotation" (RTR) is and how it is implemented in MockMate.
- Why does the server issue a brand-new refresh token on every single refresh request?
- How does the server detect if a refresh token has already been used?
- What happens to the client when a refresh token request fails?

## Advanced Questions
- What happens if two concurrent requests from the same user trigger two simultaneous silent refreshes? How does the server handle rotation without causing a race condition that logs the user out?
- Describe the blast radius if an attacker manages to steal a refresh token cookie. What detection triggers are in place?
- Why does the client interceptor use a `failedQueue` instead of simply looping or retrying immediately?

## Staff-Level Questions
- Design a multi-device refresh token system that tracks a collection of active sessions per user (with device metadata, IP, and location) and enables granular revocation of a single device.
- Critique MockMate's single-token rotation schema. How does it handle simultaneous requests from two different browser tabs (concurrency storm), and how would you redesign it using a sliding window lock or Redis to prevent false positives in reuse detection?
- How would you implement a token-revocation list (blocklist) in Redis to support immediate global token revocation at scale?

## Questions About MY Implementation
- Why is the incoming refresh token parsed strictly from `req.cookies?.refreshToken`?
- What database query is executed to invalidate a refresh token on logout?
- Why does the server return only the `accessToken` in the JSON response payload of `/refresh-token`?
- How does the React frontend ensure that the page boot silent refresh does not double-fire under StrictMode?

## Follow-up Questions
- What breaks if you remove the string comparison `user.refreshToken !== incomingRefreshToken` from the controller?
- What happens if the database write fails after the server has already sent the new rotated cookie?
- Why did we drop body and authorization header lookups for the refresh token?

## Code Reading Questions
- In `auth.controller.js`, look at the `refreshAccessToken` controller. What string comparison is done?
- Where inside the response interceptor in `axios.js` is the `/refresh-token` path checked to avoid refresh loops?
- Identify where `bootstrapStarted.current` is set to true in `AuthContext.jsx`.

## Debugging Questions
- A user reports that opening MockMate in two tabs logs them out of one of them. Trace how token rotation and concurrent requests cause this, and explain the fix.
- A user is stuck in a redirect loop between the dashboard and the login page. What checks in the interceptor and route guards do you trace?

## Edge Cases
- Two simultaneous refreshes occurring at the exact same millisecond.
- Network dropout immediately after the server validates the refresh token but before the response reaches the client.
- The refresh token is valid but the user account has been deleted.

## Security Questions
- Why are refresh tokens stored in HttpOnly cookies instead of in-memory like access tokens?
- If an attacker compromises the server's database, can they generate valid cookies? Why or why not?

## Performance Questions
- How many database updates are performed during a single access token refresh request?
- How does rotation affect database write load under highly active user sessions?

## Scalability Questions
- If we scale MockMate's backend to multiple stateless containers, how do we coordinate token rotation updates to avoid consistency lags?

## Trade-off Questions
- Single-session simplicity (storing one token string on the user document) vs multi-session arrays: discuss the implementation complexity vs security trade-offs.
- High-security rotation (immediate reuse detection) vs UX friction (false-positive logouts under network delays).

## Refactoring Questions
- Refactor the database model to support a sub-document array of refresh tokens representing active device sessions.

## Whiteboard Questions
- Draw the sequence diagram of a client sending 3 concurrent API requests, encountering 401s, queuing, executing a single refresh, updating memory, and replaying the requests.
- Sketch the database schema for a multi-session refresh token collection.

## Practical Coding Exercises
- Implement a token family tracking schema with automatic invalidation of all child sessions if reuse is detected.

## Revision Checklist
- [ ] I can explain refresh token rotation and how reuse detection operates on the server.
- [ ] I can describe the lifecycle of a silent refresh triggered by an Axios interceptor.
- [ ] I can explain the client concurrency queuing mechanism.
- [ ] I can list the database commands used to update and invalidate refresh tokens.
- [ ] I can explain why the refresh token endpoint returns the access token in JSON but sets the refresh token in a cookie.

