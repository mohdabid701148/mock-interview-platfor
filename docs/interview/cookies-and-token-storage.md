# Cookies & Token Storage

## Why this topic exists in MockMate
The app must persist identity across page reloads and browser restarts without exposing authentication tokens to client-side scripts. To achieve this, MockMate stores the **Access Token strictly in application memory** (via a specialized, non-React JavaScript module `tokenStore.js` and React state `accessToken` in `AuthContext`) and stores the **Refresh Token strictly in an HttpOnly, Secure, SameSite cookie** managed automatically by the browser. This eliminates the vulnerability of storing JWTs in `localStorage` or `sessionStorage` where they can be exfiltrated via Cross-Site Scripting (XSS).

## Where it is implemented
- [tokenStore.js](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/api/tokenStore.js) — The in-memory bridge for the Access Token. Allows non-React Axios interceptors to retrieve and rotate the token, and lets `AuthContext` subscribe to changes.
- [AuthContext.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/context/AuthContext.jsx) — Performs boot-time silent refresh to fetch the access token, loads the current user profile, and exposes them inside React context.
- [axios.js](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/api/axios.js) — Configured with `withCredentials: true` so the browser automatically sends the refresh token cookie to the backend. Injects the in-memory Access Token into outgoing requests' `Authorization: Bearer <token>` headers.
- [auth.controller.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/controllers/auth.controller.js) — `loginUser` issues both tokens but sets ONLY the `refreshToken` in a cookie (using `refreshCookieOptions`) while returning the `accessToken` in the JSON response body. `refreshAccessToken` accepts the refresh token ONLY from cookies, rotates the cookie, and returns ONLY the new `accessToken` in the JSON body. `logoutUser` unsets the refresh token in the database and clears the refresh cookie.
- [auth.middleware.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/middlewares/auth.middleware.js) — `verifyJWT` reads and validates the access token exclusively from the `Authorization: Bearer <token>` header (no cookie fallbacks).
- [app.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/app.js) — Plugs in `cookie-parser`, enables `cors` credentials sharing, and configures `trust proxy` for secure cookies on PaaS proxy hops.

## Code Flow
1. **Login**: The user posts credentials to `/auth/login`. The server returns `{ user, accessToken }` in the JSON body and sets the `refreshToken` in an HttpOnly cookie. The frontend places the `accessToken` strictly in-memory (`tokenStore.js`).
2. **REST Requests**: Axios request interceptor pulls the token from `tokenStore.js` via `getAccessToken()` and attaches it as `Authorization: Bearer <token>`.
3. **Session Restoration (Boot/Reload)**: On startup, the in-memory token is empty. `AuthContext`'s mount effect triggers a silent refresh (`POST /auth/refresh-token`). The browser automatically attaches the `refreshToken` cookie. The backend rotates the refresh cookie and returns `{ accessToken }`. The frontend stores the new token in-memory and calls `GET /auth/current-user` to restore the user session.
4. **Logout**: The user logs out. The backend invalidates the token in the database and clears the cookie via `.clearCookie("refreshToken")`. The client calls `clearAccessToken()` and resets the context `user` state to null.

## Components involved
- `tokenStore.js`, `AuthProvider`, `axiosInstance`, `refreshCookieOptions`, `clearRefreshCookieOptions`, `verifyJWT`, cookie-parser, Express proxy settings.

## Dependencies involved
- `cookie-parser`, `cors`, `axios`, `jsonwebtoken`.

## Related modules
- [authentication.md](authentication.md), [jwt.md](jwt.md), [refresh-tokens.md](refresh-tokens.md), [security.md](security.md)

## Concepts I MUST Study
- HttpOnly, Secure, and SameSite cookie options (Strict vs Lax vs None)
- In-memory credential storage vs persistent browser storage (`localStorage`, `sessionStorage`, `IndexedDB`)
- Cross-Site Scripting (XSS) token exfiltration vectors
- Cross-Site Request Forgery (CSRF) and SameSite mitigation mechanics
- CORS credentials configuration (`withCredentials: true`) and allowed origins matching
- Proxy headers (`X-Forwarded-Proto`, `X-Forwarded-For`) and the role of Express's `trust proxy` setting
- Silent token validation and restoration loops
- Client-side publish/subscribe token observers

## Beginner Interview Questions
- Where is the access token stored on the client side in MockMate?
- What does the `httpOnly` flag on a cookie prevent?
- What does setting `withCredentials: true` on the Axios client accomplish?
- Why does the application no longer store user session data in `localStorage`?

## Intermediate Questions
- Why is `secure` set to true in production but false in development for the refresh cookie?
- Why is `sameSite` set to `"none"` in production but `"lax"` in development?
- Why must CORS allowed origins list exact domains and not use a wildcard `*` when `credentials: true` is enabled?
- Explain why setting `trust proxy` to `1` in Express is required to receive secure cookies on Render.

## Advanced Questions
- If the access token is in-memory only and the refresh token is in an HttpOnly cookie, what CSRF exposure exists on the `/refresh-token` path and how is it mitigated by the Same-Origin Policy?
- In MockMate, how does a non-React Axios interceptor file communicate a rotated token to the React-based `AuthContext`?
- How is the socket handshake authorized if the access token is stored in-memory?
- Why does `verifyJWT` only check the `Authorization` header and not cookies?

## Staff-Level Questions
- Critically evaluate the XSS vs CSRF trade-offs of storing the access token in-memory vs in a cookie. How does this architecture reduce the XSS attack surface to near zero?
- If MockMate was modified to use subdomains (e.g., `app.mockmate.com` and `api.mockmate.com`), how would you configure the cookie `domain` and `sameSite` properties to ensure seamless auth?
- Describe the impact of browser third-party cookie blocking on this architecture in a cross-origin deployment (e.g., Vercel frontend and Render backend).

## Questions About MY Implementation
- Why is the refresh cookie set with a `maxAge` matching the refresh token expiry (7 days)?
- What is the purpose of `tokenStore.js` in the frontend source code?
- How does `AuthContext.jsx` prevent concurrent double-refresh bootstraps on page load during React StrictMode mount?
- Why does `clearCookie` on the backend need the exact same attributes (minus maxAge) as the original `cookie` definition?

## Follow-up Questions
- What happens to the user session if the backend server restarts?
- What happens if the refresh token cookie expires while the user is actively working?
- Why did we drop `localStorage` entirely for authentication, including the cached user JSON object?

## Code Reading Questions
- In `auth.controller.js`, look at `refreshCookieOptions`. What values are set for `httpOnly`, `secure`, and `sameSite`?
- In `auth.middleware.js`, locate where the `Authorization` header is processed. What prefix is parsed?
- In `tokenStore.js`, identify the callback system that notifies subscribers when the token changes.

## Debugging Questions
- Cookies are not appearing in the browser's application tab in production. What CORS, Node Env, or HTTPS variables do you inspect?
- A user is logged in, but reloading the page redirects them to `/login` with a failed refresh token check. How do you debug if it is a cookie path or domain issue?

## Edge Cases
- The browser disables cookies entirely. How does the application react?
- The client refreshes the page exactly as the access token expires. Trace the network requests.
- The `refreshToken` cookie is modified by the browser but lacks a valid JWT signature.

## Security Questions
- How does storing the access token in-memory protect it from XSS exfiltration?
- What is the blast radius if an attacker executes a successful XSS payload on MockMate under this cookie-refresh architecture?
- Why is standard CSRF protection not required for our protected REST resources (like `/rooms/create`)?

## Performance Questions
- Does fetching the current profile via `/auth/current-user` on every page load add excessive latency? How is it resolved?
- What is the memory cost of keeping the access token in a global JS closure variable?

## Scalability Questions
- If the API backend is split into multiple microservices on different domains, how does this cookie configuration affect access validation?

## Trade-off Questions
- In-memory access token + cookie-based refresh token vs purely cookie-based access token: compare their security properties.
- UX latency of bootstrapping via `/refresh-token` vs instant render from `localStorage` cached profiles.

## Refactoring Questions
- Outline the steps required to transition from this memory-based token setup to a custom CSRF token validation flow.

## Whiteboard Questions
- Diagram the sequence of requests during a page reload (session restoration), showing how the refresh cookie is sent, rotated, and the profile is restored.
- Design a block diagram illustrating the interaction between `tokenStore.js`, `axiosInstance`, `AuthProvider`, and `SocketProvider`.

## Practical Coding Exercises
- Implement a CSRF double-submit cookie validation middleware in Express.
- Mock the `tokenStore.js` and verify that subscriptions fire correctly.

## Revision Checklist
- [ ] I can describe the exact cookie options used for the refresh token.
- [ ] I can explain the XSS protection benefits of in-memory token storage.
- [ ] I can trace the session restoration flow step-by-step from boot to user load.
- [ ] I can justify the absence of cookie-lookup fallback in `verifyJWT`.
- [ ] I can explain why `trust proxy` is required for secure cookies behind reverse proxies.

