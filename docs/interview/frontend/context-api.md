# Context API

## Why this topic exists in MockMate
MockMate manages its global states (user session metadata, token state, Socket.IO client instances) using React's native Context API. This isolates state machines, avoids component property propagation overheads (props-drilling), and ensures that authentication states and socket lifecycles are instantly available to any component in the render tree.

## Where it is implemented
- [AuthContext.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/context/AuthContext.jsx) — Provider wrapper managing authentication state, tokenStore subscriptions, registration, and logout operations.
- [SocketContext.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/context/SocketContext.jsx) — Provider wrapper managing active Socket.IO connection instances, events binding, and lifecycle checks.
- [App.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/App.jsx) — Registers context providers around the application component tree.

## UI Flow
1. **Login Request**: User submits credentials, which triggers `login(payload)` in `AuthContext`.
2. **REST Call**: `AuthContext` calls `authService.login()`.
3. **Memory Update**: Returns the access token. `AuthContext` calls `setAccessToken(token)` to store it strictly in-memory (`tokenStore.js`).
4. **State Synchronization**: The tokenStore notifies the subbed React callback, updating the `accessToken` state inside `AuthContext`.
5. **Socket Reaction**: `SocketProvider` detects the non-null `accessToken` change in its `useEffect` dependency array, cleans up any dead connections, and instantiates a new Socket.IO client.
6. **UI Re-render**: `AuthContext` updates the `user` state and sets `loading = false`, transitioning the UI to the dashboard.

## Components Involved
- Context Providers (`AuthProvider`, `SocketProvider`), Root Router wraps, Auth Components (`LoginForm`, `RegisterForm`), real-time views needing sockets (`Room`, `Dashboard`).

## Hooks Used
- Built-in hooks: `useState`, `useEffect`, `useRef`, `useContext`.
- Custom hooks: `useAuth` (consumes AuthContext), `useSocket` (consumes SocketContext).

## Dependencies Used
- `react`, `socket.io-client`.

## Related Modules
- [react-architecture.md](react-architecture.md), [custom-hooks.md](custom-hooks.md), [socket-client.md](socket-client.md).

## Concepts I MUST Study
- Context Provider / Consumer architecture and re-render triggers
- Context value reference matching (`useMemo` considerations)
- In-memory JS closures vs browser-persisted states for storage
- React render trees optimization and context nesting ordering
- Memory cleanups inside provider effects
- Pub/Sub subscription synchronization patterns between React and non-React files

## Beginner Interview Questions
- What is the React Context API and what problem does it solve?
- What global states are managed via Context in MockMate?
- How is the `AuthProvider` component wrapped inside `main.jsx`?
- How does a child component retrieve user details from context?

## Intermediate Questions
- Why is the `SocketProvider` nested inside the `AuthProvider` at the root of `main.jsx`?
- Why do public routes (like `/login` or `/signup`) bypass page loading spinners, but still call the silent refresh bootstraps in the background?
- Explain how `SocketProvider` manages the socket instance. Why are both state (`socket`) and ref (`socketRef`) used?
- How does `AuthContext` clean up subscriptions on unmount?

## Advanced Questions
- Explain what happens to consumer components of `AuthContext` when `setUser()` is called. Do all consumer components re-render? How can this be optimized?
- Walk through how `AuthContext` coordinates silent token updates with the non-React Axios interceptor file. How does the Axios file update React states?
- How does `AuthContext` prevent double-bootstrapping a silent refresh under React 19's StrictMode double-mounting checks?

## Staff-Level Questions
- Design a provider-free state orchestration layout for a large-scale React application. If the number of contexts exceeds 30, how would you structure global state management to avoid nesting creep (provider hell)?
- Critique using the Context API for high-frequency real-time updates (like collaborative text synchronization or pointer positions). What are the rendering performance bottlenecks, and what alternatives (e.g. direct Ref manipulation or external mutable state managers) are more suitable?

## Questions About MY Implementation
- Why does `AuthContext` subscribe to `subscribeAccessToken`? What state does it update?
- What would break in the socket connection if the React state representation of `accessToken` was removed from `AuthContext`?
- Why is the authentication bootstrap ref `bootstrapStarted.current` initialized to `false`?

## Follow-up Questions
- What happens if the backend `/current-user` REST check fails during a page refresh?
- How does the Axios client interceptor trigger an unauthenticated logout event in `AuthContext`? (Answer: Via `triggerAuthFailure()`, which calls the callback registered inside `AuthContext`'s `setAuthFailureHandler`).

## Code Reading Questions
- In `AuthContext.jsx`, locate the `subscribeAccessToken` subscription inside `useEffect`.
- In `SocketContext.jsx`, find the dependency array of the socket instantiation effect.
- Locate the destructured properties inside `useAuth.js`.

## Debugging Questions
- A user logs in, but the socket is not initialized, and `useSocket()` returns null. Trace why the `accessToken` state inside `AuthContext` did not update.
- The browser logs connection loops. Debug if it is caused by constant re-evaluation of context values re-triggering provider effects.

## Edge Cases
- Rapidly logging in and logging out before the initial bootstrap `/refresh-token` promise resolves.
- Opening the browser's developer console and calling context methods manually.

## Security Questions
- How does storing credentials in-memory protect them from malicious browser extensions reading DOM elements or storage caches?
- What steps are taken on logout to clear all in-memory references to tokens?

## Performance Questions
- What is the rendering impact on the component tree when a silent refresh rotates the access token?

## Scalability Questions
- How would you modify `SocketProvider` to support distinct namespaces (e.g. `/editor` vs `/notifications`) under the current context wrapper?

## Trade-off Questions
- In-memory context credentials vs cookie-sharing headers: trace the developers' layout flexibility vs security posture.

## Refactoring Questions
- Refactor the context providers to handle state transitions using `useReducer` to enforce action-based mutations.

## Whiteboard Questions
- Diagram how an Axios request failure (401) triggers a silent refresh, updates the in-memory store, notifies AuthContext, and reconnects the SocketProvider.
- Draw the nested context provider hierarchy in MockMate.

## Practical Coding Exercises
- Implement a mock test that validates that `SocketProvider` correctly disconnects the active socket when the context `accessToken` becomes null.

## Revision Checklist
- [ ] I can trace the auth and socket context lifecycles from start to finish.
- [ ] I can explain how the Axios interceptor notifies the React contexts of token changes and failures.
- [ ] I can justify the provider wrapping order (`AuthProvider` wrapping `SocketProvider`).
- [ ] I can write the pub/sub bridging code in `tokenStore.js` and `AuthContext.jsx` from memory.
