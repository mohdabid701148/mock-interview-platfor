# Axios Architecture

## Why this topic exists in MockMate
MockMate separates its frontend UI from the Express backend API. To communicate across origins, MockMate uses **Axios** wrapped in a custom configured instance. This architecture centralizes API base URLs, enables credentials cookie sharing, automatically injects authorization bearer headers, intercepts network failures, and coordinates a silent in-memory refresh queue to prevent user logout during token expirations without persisting tokens to browser storage.

## Where it is implemented
- [axios.js](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/api/axios.js) — Custom Axios instance, request interceptor injecting in-memory tokens, response interceptor catching 401s, queuing requests, and handling token updates.
- [tokenStore.js](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/api/tokenStore.js) — Pub/sub-enabled in-memory token container connecting React and non-React files.
- [auth.service.js](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/services/auth.service.js) — Authentication client endpoints mappings.

## UI Flow
1. **REST Request**: Component fires `axiosInstance.get('/rooms/my-rooms')`.
2. **Request Interception**: The request interceptor runs, calls `getAccessToken()` from `tokenStore.js`, and attaches `Authorization: Bearer <accessToken>` (if a token is present in memory).
3. **HTTP 401 Response**: The access token is expired, and the server returns `401 Unauthorized`.
4. **Response Interception**: The response interceptor catches the 401:
   - If `isRefreshing` is true: The request returns a new Promise, pushing `resolve/reject` functions into `failedQueue`.
   - If `isRefreshing` is false: Sets `isRefreshing = true`, flags request with `_retry = true`.
5. **Token Refresh**: The interceptor calls `axios.post('/auth/refresh-token')` with `withCredentials: true`. The browser automatically sends the HttpOnly refresh cookie.
6. **Token Update**: The endpoint returns `{ accessToken }`. The interceptor calls `setAccessToken(newAccessToken)` to update the in-memory store and updates the original request's authorization header.
7. **Replay & Queue Resolution**: Calls `processQueue()` to resolve all queued promises (which triggers them to retry their original API calls with the new access token) and replays the original request that failed.
8. **Refresh Failure (Logout)**: If the refresh request fails (e.g. cookie expired), the interceptor calls `setAccessToken(null)` and triggers `triggerAuthFailure()`, prompting `AuthContext` to clear state and redirect the user to `/login`.

## Components Involved
- Page layouts, forms subcomponents, `AuthProvider`, Axios config.

## Hooks Used
- Built-in hooks: `useState`, `useEffect`.
- Custom hooks: `useAuth` (shares auth state).

## Dependencies Used
- `axios` (HTTP client).

## Related Modules
- [authentication.md](authentication.md) (auth backend checks), [jwt.md](jwt.md) (token properties), [cookies-and-token-storage.md](cookies-and-token-storage.md) (storage access).

## Concepts I MUST Study
- HTTP Request/Response interceptors
- CORS credentials sharing (`withCredentials: true`)
- Promise-based queuing and concurrency synchronization in JS
- Non-React state containers in React applications
- Cross-Site Scripting (XSS) mitigation via in-memory tokens
- Redirection mechanisms in client-side routing on authentication failures
- Safe API retry loops

## Beginner Interview Questions
- What is Axios and what setting is required to send cookies automatically?
- What is the role of request and response interceptors?
- What header key and scheme are used to transmit the access token to the backend?

## Intermediate Questions
- Why does the request interceptor read the access token from `tokenStore.js` instead of `localStorage`?
- Why check `!originalRequest.url?.includes("/refresh-token")` before initiating a silent refresh?
- How does the Axios client interceptor handle multiple simultaneous API calls returning 401 concurrently?
- What actions are taken by the Axios client when a refresh token request fails?

## Advanced Questions
- Walk through how `processQueue` works. How does it resolve or reject queued requests when the token refresh succeeds or fails?
- Why does the interceptor use `window.location.replace("/login")` inside the failure callback instead of React Router's `navigate()`?
- How does the client interceptor avoid request loops when the `/refresh-token` endpoint itself returns a 401 status?

## Staff-Level Questions
- Design a thread-safe token manager in a multi-tab environment. Since cookies are shared across tabs but the access token is in-memory only, how do tabs synchronize access tokens without causing concurrent duplicate refresh requests?
- Critique MockMate's client-side request queue. What memory and performance implications exist if a user keeps clicking actions while offline, filling the queue?

## Questions About MY Implementation
- Why is `tokenStore.js` designed as a pub/sub event emitter instead of a plain global object?
- What parameters are passed to `axios.post` for `/refresh-token` to bypass the default auth-interceptor headers? (Answer: We call direct `axios` rather than `axiosInstance` to avoid adding header authorization and triggering interceptor recursion).
- Why does `axiosInstance` define `skipAuthRefresh` on certain calls, like logout or verification resends?

## Follow-up Questions
- What breaks if we don't clear the `failedQueue` array after a failed token refresh?
- How does the Axios interceptor distinguish between a network failure and an authentication failure?

## Code Reading Questions
- In `axios.js`, identify the call to `getAccessToken()`.
- Identify the call to `setAccessToken(newAccessToken)` inside the response interceptor success path.
- In `tokenStore.js`, find where `authFailureHandler` is invoked.

## Debugging Questions
- A user reports that refreshing a page on a slow network hangs the dashboard loader. Trace how a hanging `/refresh-token` promise affects the Axios queue.
- If the CORS configuration lacks `Access-Control-Allow-Origin: <exact_domain>`, how does the browser intercept the `/refresh-token` response?

## Edge Cases
- The access token expires exactly as the browser tab is closed.
- The refresh token POST is sent but aborted due to user navigation.

## Security Questions
- How does storing the access token in-memory protect it from XSS exfiltration?
- Why is the request interceptor deleting the `Authorization` header when no token is present?

## Performance Questions
- What is the performance overhead of wrapping every request with a header injection interceptor?

## Scalability Questions
- How would you manage Axios configurations if the application integrates with multiple independent API domains?

## Trade-off Questions
- Silent token refresh (better UX, higher complexity) vs force logout on access token expiry.

## Refactoring Questions
- Refactor the Axios configuration to extract the refresh token loop into an independent network manager class.

## Whiteboard Questions
- Write the pseudo code for the response interceptor refresh block from memory.
- Draw a sequence diagram showing a concurrent request storm handled by the interceptor.

## Practical Coding Exercises
- Implement a mock test that asserts that the interceptor retries original requests upon a successful token refresh.

## Revision Checklist
- [ ] I can write the Axios response interceptor refresh block from memory.
- [ ] I can explain the purpose of the `failedQueue` and `isRefreshing` flag.
- [ ] I can detail why access tokens are kept in-memory and how `tokenStore.js` interfaces with Axios.
- [ ] I can justify the `withCredentials` settings.
