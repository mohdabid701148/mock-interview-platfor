# React Architecture & Context API

## Why this topic exists in MockMate
MockMate is built as a single-page application (SPA) using React 19. React controls the rendering layout, routing, collaborative workspace modules, live dashboards, and calendar systems. The Context API manages global states (authentication credentials, user profiles, socket connection instances) cleanly, feeding states to nested components without props-drilling.

## Where it is implemented
- [main.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/main.jsx) — Entry point wrapping the application in providers and routing scopes.
- [App.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/App.jsx) — Route configuration, global layout wrapper, context provider stack.
- [tokenStore.js](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/api/tokenStore.js) — In-memory Access Token storage with subscriber pattern for Axios and React Context.
- [AuthContext.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/context/AuthContext.jsx) — Client authentication state machine (loading, user, accessToken), silent refresh session restoration on boot, and active profile fetch calls.
- [SocketContext.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/context/SocketContext.jsx) — Live Socket.IO client socket connection lifecycle management, reconnecting on token changes, and event handlers binding.

## Code Flow
1. **Bootstrap**: `main.jsx` mounts the app → `App.jsx` wraps routing in `BrowserRouter` and registers the context wrappers: `AuthProvider` → `SocketProvider`.
2. **Session Restoration**: `AuthProvider` mounts, runs `refreshAccessToken()` silently via `POST /auth/refresh-token` (sending the HttpOnly cookie) → if success, writes access token in-memory and calls `fetchCurrentUser()` → sets `user` state and updates `loading = false`.
3. **Socket Handshake**: `SocketProvider` listens to the `accessToken` state in a `useEffect` dependency array. When a valid token is set, it calls `io()` passing `auth: { token: accessToken }` to verify the handshake on the backend.
4. **API Integration**: Component REST calls go through `axiosInstance` → request interceptor fetches the token via `getAccessToken()` and appends it as `Authorization: Bearer <token>` → if 401 occurs, response interceptor locks request queue, runs silent refresh, writes new token in-memory, and replays all queued calls.

## Components involved
- App providers (Auth, Socket), Custom hooks (useAuth, useSocket, useDebounce), Axios config, `tokenStore.js`, client router mappings, and page views.

## Dependencies involved
- `react`, `react-dom` (React v19), `react-router-dom` (routing engine), `axios` (REST Client), `socket.io-client` (real-time sync).

## Related modules
- [authentication.md](authentication.md) (complements client auth), [sockets.md](sockets.md) (complements socket connection), [cookies-and-token-storage.md](cookies-and-token-storage.md) (cookie scopes).

## Concepts I MUST Study
- Single Page Application (SPA) routing mechanics
- Virtual DOM and reconciliation in React 19
- React Context API and Providers
- Custom Hooks pattern and state reuse
- Component lifecycle, mounting, cleanups, and side-effects (`useEffect`)
- HTTP Interceptors and automatic request-response hooks
- Debouncing user inputs (avoiding re-renders and excessive calls)
- Code Splitting and dynamic loading (React.lazy, Suspense)
- Memory leaks in React (uncleaned interval timers, socket listeners)
- Props drilling vs Context vs Redux/Zustand state managers

## Beginner Interview Questions
- How is the React application boot-strapped inside `main.jsx`?
- What is React Context, and why do we use it in MockMate?
- What does the `useAuth` hook provide to components?
- Where is the Axios instance configured in your frontend?

## Intermediate Questions
- Why does the `SocketProvider` list `accessToken` in its `useEffect` dependency array?
- Explain what happens to the client socket when a user logs out.
- How does the `useDebounce` hook work? Why is it useful in a search box or text editor?
- What loading guards exist in the route setup to prevent unauthenticated users from visiting the dashboard?

## Advanced Questions
- Walk through how the Axios response interceptor handles a `401 Unauthorized` token expiry. How does it refresh the token silently without logging out the user?
- How does the Axios interceptor queue requests while it is waiting for a refresh token response? What concurrency issues does this resolve?
- What are the performance implications of wrapping the entire application in multiple Context Providers? How do you prevent unnecessary re-renders?
- How does MockMate clean up socket event listeners in component hooks to avoid memory leaks?

## Staff-Level Questions
- Design a state management strategy for MockMate that handles collaborative state sync using a store manager like Zustand, explaining how it handles offline-first caching.
- If the frontend experiences severe input latency in the code editor, how would you trace the cause? Explain React Profiler debugging and rendering optimizations.
- How would you implement code splitting and route-based lazy loading in App.jsx to optimize initial page bundle sizes?

## Questions About MY Implementation
- Why is `SocketProvider` nested inside `AuthProvider`? What breaks if their registration order is reversed?
- Why did you use React Context instead of a state library like Redux or Zustand?
- What would happen to the UI if `/current-user` REST check takes 5 seconds during boot load?
- Why is the access token stored strictly in-memory instead of cookies/localStorage on the client side?

## Follow-up Questions
- What breaks if we don't return a cleanup function inside a socket listener `useEffect`?
- How does the UI handle a failure of the `/refresh-token` API call?
- What happens to the socket connection if the user updates their user profile in AuthContext?

## Code Reading Questions
- In `AuthContext.jsx`, trace the state hooks that manage authentication status.
- Locate the request interceptor in `axios.js` and trace what headers it adds.
- Trace the render function in `App.jsx` and explain how route guards are configured.
- Find the `useSocket` implementation and list what it returns.

## Debugging Questions
- A component is rendering 5 times on mount, slowing down the UI. What tools and methods do you use to trace the trigger?
- The socket context says it is connected, but no events are triggering components. Where do you look first?
- You see `TypeError: Cannot read properties of null (reading 'emit')`. What context check was bypassed?
- Automatic JWT refresh goes into an infinite loop. Trace the bug in the Axios response interceptor.

## Edge Cases
- Client token expires in the middle of a massive code execution request.
- User logs out in one tab; how does the second tab identify the logout and clean up its sockets?
- Socket server restarts while client is typing; trace the re-synchronization steps.

## Security Questions
- How do you prevent Cross-Site Scripting (XSS) when rendering username values in dashboard components?
- Why is it insecure to store sensitive JWT payload keys in local storage?
- How do you defend against Cross-Site Request Forgery (CSRF) if the frontend relies on credential-sharing cookies?

## Performance Questions
- How does the application optimize component rendering when the collaborative socket broadcasts code updates 20 times per second?
- Why is it better to debounce Monaco typing events before sending them to the backend rather than updating local states on every keystroke?

## Scalability Questions
- If we add 20 new context scopes (e.g., ThemeContext, NotificationContext), how does it affect app bundle size and render trees?
- How would you design the frontend to support offline code writing with automatic synchronization upon reconnection?

## Trade-off Questions
- Context API (native, quick setup) vs Redux (external, heavy boilerplates) for a real-time collaborative workspace: trace the tradeoffs.
- Dynamic page bundles vs static client bundles: trace compile speeds vs initial page loading latencies.

## Refactoring Questions
- Refactor the Axios client code to support multi-backend routing based on api prefixes.
- Convert the AuthContext logic to use React 19's native `use()` hook for loading async contexts.

## Whiteboard Questions
- Draw the component hierarchy of MockMate, detailing state flows and context injection points.
- Design a custom React hook `useOnlineStatus` that tracks and returns real-time connection status.

## Practical Coding Exercises
- Implement a route guard component `<ProtectedRoute>` that validates both login status and email verification before showing children.
- Write a unit test using React Testing Library to verify that AuthProvider sets the user state when a mock profile API resolves.

## Revision Checklist
- [ ] I can explain the React Context rendering flow and potential performance issues.
- [ ] I can describe the silent token-refresh sequence in the Axios interceptor.
- [ ] I can detail how React Hooks reuse logic and state variables.
- [ ] I can explain why cleanups are crucial in event listener `useEffect` hooks.
- [ ] I can trace the auth token flow from memory to request headers.
ocal storage to request headers.
