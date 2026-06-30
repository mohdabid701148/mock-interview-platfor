# Socket.IO Client Architecture

## Why this topic exists in MockMate

MockMate is a real-time collaborative platform where candidates and interviewers pair program, attach questions, and track presence. To provide a desktop-like user experience, MockMate integrates the **Socket.IO Client** library on the frontend. The client connects to the backend Socket.IO server, establishes a persistent, bidirectional WebSocket channel, and manages event broadcasts while handling reconnections, cleanups, and React rendering cycles.

---

## High-Level Client Architecture

The Socket.IO Client sits between the React component tree and the network transport layer:

```
┌────────────────────────────────────────────────────────────────────────┐
│                              REACT LAYER                               │
└────────────────────────────────────────────────────────────────────────┘
  [Active Workspace Page (Room.jsx)] / [Collaborative Editor (CodeEditor.jsx)]
            ▲
            │ (Subscribes to context socket instance)
            ▼
  [SocketContext.Provider (SocketContext.jsx)]
            ▲
            │ (Subscribes to useAuth() accessToken state)
            ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          SOCKET.IO CLIENT LAYER                        │
└────────────────────────────────────────────────────────────────────────┘
  [Socket.IO Client Engine.IO Transport]
            ▲
            │ (Serializes packets into WebSocket connection frames)
            ▼
  [WebSocket Protocol Stream] (Persistent TCP connection to backend)
```

---

## Technical Foundations: Client-Side Options & Transport Upgrades

### Handshake Parameters & Configurations
Inside [SocketContext.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/context/SocketContext.jsx), the client is configured with specific parameters to ensure connection resilience:

- **`withCredentials: true`**: Instructs the browser to include cookies automatically when upgrading the connection from HTTP to WebSockets. This is required to send the HttpOnly `refreshToken` cookie.
- **`autoConnect: false`**: Prevents the client from attempting to connect immediately upon initialization. The connection is instead triggered manually using `socket.connect()` after event listeners are bound.
- **`reconnection: true`**: Enables automatic reconnect loops if the connection drops.
- **`reconnectionAttempts: Infinity`**: Instructs the client to retry connecting indefinitely.
- **`reconnectionDelay: 1000` & `reconnectionDelayMax: 5000`**: Configures exponential backoff for reconnection attempts, starting at a 1-second delay and capping at 5 seconds.
- **`timeout: 20000`**: Sets a 20-second connection timeout before triggering a `connect_error`.
- **`forceNew: true`**: Forces the creation of a new connection instead of reusing an existing socket instance.
- **`transports: ["websocket", "polling"]`**: Establishes WebSockets as the primary transport layer, falling back to HTTP Long-Polling if WebSockets are blocked by client-side firewalls or corporate proxies.
- **`auth: { token: accessToken }`**: Injects the in-memory access token into the handshake payload. Since WebSockets do not support custom headers in browser environments, the `auth` object is the standard way to pass authorization tokens.

---

## React Lifecycle Integration & React Context

### 1. In-Memory Token Reactivity
Because MockMate stores the access token strictly in application memory, the socket connection lifecycle is bound to the React `accessToken` state inside `SocketContext.jsx`:

- **Active State Subscriptions**: The `SocketProvider` imports `accessToken` from `useAuth()`.
- **Effect Dependency Pipeline**: A `useEffect` hooks into `accessToken` changes:
  - When the user logs in or silent refresh rotates the access token, the dependency array `[accessToken]` triggers the effect, which calls `cleanupSocket()` and instantiates a new Socket.IO connection with the new token.
  - When the user logs out or authorization fails, the `accessToken` becomes null, triggering `cleanupSocket()`, which disconnects the socket and prevents unauthorized connection attempts.

### 2. Preventing Memory Leaks and Duplicate Event Listeners
A common bug in Socket.IO React apps is registering duplicate event listeners on component re-renders, which can lead to memory leaks and multiple executions of the same event handler.

MockMate prevents this using cleanups inside React `useEffect` hooks:

- **Unmount Cleanups**:
  Inside [Room.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/pages/Room.jsx), listeners for `connect`, `disconnect`, `room-users`, `socket-error`, and `question-updated` are bound inside a `useEffect` and cleaned up when the component unmounts:
  ```javascript
  return () => {
    clearTimeout(reconnectTimer);
    if (socket.connected) {
      socket.emit("leave-room", { roomId: socketRoomId });
    }
    socket.off("connect", handleConnect);
    socket.off("disconnect", handleDisconnect);
    socket.off("connect_error", handleConnectError);
    socket.off("room-users", handleRoomUsers);
    socket.off("socket-error", handleSocketError);
    socket.off("room-updated", handleRoomUpdated);
    socket.off("question-updated", handleQuestionUpdated);
    socket.off("feedback-submitted", handleFeedbackSubmitted);
  };
  ```
- **Socket.IO Listener Removal (`socket.off`)**: 
  Using `socket.off(eventName, handlerName)` ensures that only the specific listener instance is removed, leaving other listeners intact.

### 3. Editor Event Control
Inside [CodeEditor.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/components/editor/CodeEditor.jsx):
- **Feedback Loops Prevention**:
  When a user types in Monaco, the editor triggers `handleCodeChange`, which emits `code-change` to the server. When the server broadcasts `code-update` back, the peer applies this update to their local editor.
  To prevent this remote update from triggering another local change event and creating an infinite loop, MockMate uses `isApplyingRemoteRef`:
  ```javascript
  const handleCodeUpdate = ({ language: inLang, code: inCode }) => {
    if (!inLang) return;
    isApplyingRemoteRef.current = true;
    // Apply changes locally...
    setTimeout(() => { isApplyingRemoteRef.current = false; }, 0);
  };
  ```
  Inside the editor's change handler, edits are ignored if `isApplyingRemoteRef.current` is true:
  ```javascript
  const handleCodeChange = (value) => {
    if (isApplyingRemoteRef.current || disabled) return;
    // Emit code-change to server...
  ```
- **Keystroke Debouncing**:
  Instead of emitting events on every keystroke, the client debounces changes by **350ms**, reducing network traffic and server CPU load.

---

## Detailed Socket Event Registry (Client Side)

### 1. `join-room` (Emit)
- **Trigger**: Fired when the socket successfully connects or the room page mounts.
- **Payload**: `{ roomId: String }`

### 2. `leave-room` (Emit)
- **Trigger**: Fired when the user navigates away from the room or the component unmounts.
- **Payload**: `{ roomId: String }`

### 3. `editor-join` (Emit)
- **Trigger**: Fired when `CodeEditor.jsx` mounts to verify authorization and fetch the initial room code state.
- **Payload**: `{ roomId: String }`

### 4. `code-change` (Emit)
- **Trigger**: Fired after 350ms of typing inactivity.
- **Payload**: `{ roomId: String, language: String, code: String }`

### 5. `language-change` (Emit)
- **Trigger**: Fired immediately when the user changes the language selector.
- **Payload**: `{ roomId: String, language: String, codeByLanguage: Object }`

### 6. `question-attached` (Emit)
- **Trigger**: Fired when the interviewer clicks "Attach Question" on a selected problem.
- **Payload**: `{ roomId: String, questionData: Object }`

### 7. `user-joined` (Listen)
- **Trigger**: Received when a peer joins the room.
- **Action**: Renders a participant connection notification banner.

### 8. `user-left` (Listen)
- **Trigger**: Received when a peer disconnects or leaves the room.
- **Action**: Renders a participant disconnection notification banner.

### 9. `room-users` (Listen)
- **Trigger**: Received on joins, leaves, and disconnects.
- **Action**: Updates the active participant panel list in `Room.jsx`.

### 10. `code-update` (Listen)
- **Trigger**: Received when the peer makes edits.
- **Action**: Updates the code state in the Monaco Editor wrapper.

### 11. `language-update` (Listen)
- **Trigger**: Received when the peer changes language or on `editor-join` restore.
- **Action**: Synchronizes the selected language and editor values.

### 12. `question-updated` (Listen)
- **Trigger**: Received when the interviewer attaches a question.
- **Action**: Automatically displays the question details in the sidebar panel.

### 13. `room-updated` (Listen)
- **Trigger**: Received when the room is cancelled or started.
- **Action**: Triggers layout transitions or redirects the user.

### 14. `feedback-submitted` (Listen)
- **Trigger**: Received when the interviewer submits the final feedback.
- **Action**: Loads and displays the feedback results to the candidate.

---

## Troubleshooting & Debugging

- **Reconnection Loops**: Check if the access token is missing or expired, causing the server handshake to fail and triggers repeated reconnection attempts.
- **Duplicate Broadcasts**: Check if event listeners are missing cleanup functions (`socket.off(...)`) in the `useEffect` return blocks, resulting in multiple active listeners.
- **Hanging States**: Ensure `isApplyingRemoteRef.current` is reset to `false` via `setTimeout(..., 0)`. If it remains `true`, it will block local typing events from sending to the server.

---

## Interview Questions & Deep Dives

### Beginner Questions
#### How do components access the client socket instance?
Components access the socket by importing the custom hook `useSocket()`, which consumes the `SocketContext` provider wrapped around the application.

#### What config option forces the socket to establish a new connection?
The client uses `forceNew: true` during initialization to create a new connection instead of reusing an existing socket instance.

---

### Intermediate Questions
#### Why is `autoConnect` configured as `false` in the context options?
Configuring `autoConnect: false` prevents the socket from attempting to connect before event listeners are bound. Instead, `socket.connect()` is called manually after listeners are registered.

#### Why does the socket client pass the token inside the `auth` configuration block?
Browser WebSockets do not support custom headers. The `auth` configuration block passes the token inside the connection handshake payload, which is compatible with WebSocket standards.

---

### Advanced Questions
#### How does `CodeEditor.jsx` prevent infinite edit loops?
The client uses a ref flag (`isApplyingRemoteRef.current`). When a remote `code-update` is received, this flag is set to `true` while the code is updated locally. The editor's change handler ignores edits if this flag is true, preventing the change from being emitted back to the server.

#### Walk through the client-side reconnection strategy.
The client is configured with `reconnection: true` and `reconnectionAttempts: Infinity`. If the connection drops, it retries connecting with exponential backoff, starting with a 1-second delay and capping at 5 seconds.

---

### Staff-Level Questions
#### Critique using React Context for real-time code synchronization updates.
React Context is designed for low-frequency updates. If sockets broadcast code changes 20 times per second, the state updates inside the Context Provider will force the entire consumer tree to re-render, which can lead to input latency in the editor. To optimize this, collaborative editor states should be decoupled from React Context and managed using refs or external stores (e.g. Zustand or Redux) to selectively render only the editor wrapper.

---

## Revision Checklist
- [ ] I can write the Socket.IO client configuration options from memory.
- [ ] I can explain the role of `isApplyingRemoteRef` in preventing feedback loops.
- [ ] I can describe how the client-side reconnection backoff is configured.
- [ ] I can explain how to prevent duplicate socket event listeners in React.
