# Socket.IO & Real-Time Collaboration Architecture

## Why this topic exists in MockMate

MockMate is a real-time peer-to-peer interview platform where candidates and interviewers collaborate. The platform must synchronize code execution, text editing, participant presence, and attachment updates with sub-100ms latency. 

HTTP's request-response paradigm is inherently pull-based, introducing high overhead and polling latency. MockMate uses **Socket.IO** as its real-time event pipeline to establish a persistent, bidirectional, full-duplex TCP connection. This enables instant code broadcasts, concurrent editor locks, live participant counts, and server-side push notifications (e.g. feedback submissions and session cancellations) without polling overhead.

---

## High-Level Architecture

The flow of a real-time event (e.g., candidate typing in the Monaco Editor) propagates through the following layers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENT SIDE                               │
└────────────────────────────────────────────────────────────────────────┘
  [Browser Monaco Editor]
            │ (User types code - fires onChange event)
            ▼
  [React State (CodeEditor.jsx)]
            │ (Client debounces input by 350ms to throttle emission)
            ▼
  [SocketContext.jsx (Socket.IO Client Instance)]
            │ (Serializes payload and wraps in WebSocket protocol frame)
            ▼
┌────────────────────────────────────────────────────────────────────────┐
│                              SERVER SIDE                               │
└────────────────────────────────────────────────────────────────────────┘
  [Socket.IO Server (initializeSocket in socket.js)]
            │ (Receives event, verifies authorization via handshake context)
            ▼
  [Event Routers & Handlers (editor.socket.js / room.socket.js)]
            │
            ├─► Updates [In-Memory State Maps] (editorStates & activeRooms)
            │     │
            │     └─► [3-Second Debounced Autosave (saveRoomCodeToDB)]
            │           │
            │           ▼
            │         [MongoDB (Mongoose Room Document)] (Persists code state)
            │
            └─► [Socket.IO Rooms / Registries]
                  │
                  ▼
              [Other Room Participants] (Emits "code-update" payload)
```

---

## Technical Foundations: WebSockets vs. HTTP

### Why HTTP is Insufficient
HTTP is a stateless, unidirectional protocol. Every transaction requires a client request followed by a server response. Establishing a connection requires a TCP handshake (and TLS handshake in production) for every request, which introduces high latency and header overhead (often >1KB per request). 

### Real-Time Alternatives

| Feature / Protocol | HTTP Polling | HTTP Long Polling | Server-Sent Events (SSE) | WebSockets (Socket.IO) |
| :--- | :--- | :--- | :--- | :--- |
| **Direction** | Unidirectional (Pull) | Unidirectional (Pull) | Unidirectional (Server Push) | Bidirectional (Full Duplex) |
| **Connection** | Ephemeral | Semi-persistent (hangs open) | Persistent (HTTP connection) | Persistent (TCP Upgrade) |
| **Latency** | High (interval-bound) | Medium (handshake delay) | Low | Sub-millisecond |
| **Overhead** | Extremely High | High | Low | Low (2-10 bytes frame header) |

- **Polling**: Client repeatedly hits the server at fixed intervals (e.g., every 2s). Results in empty responses and wasted server resources.
- **Long Polling**: Server holds the request open until new data is available or a timeout is reached. Once resolved, the client immediately initiates a new request. This still incurs overhead from repeatedly establishing connections.
- **Server-Sent Events (SSE)**: Standard HTTP connection kept open using `text/event-stream`. Allows servers to push text data to clients, but does not support upstream communication from client to server over the same connection.
- **WebSockets**: Upgrades an HTTP connection to a persistent TCP stream. Both client and server can send binary or text frames asynchronously over a single connection.

### The Value of Socket.IO
Socket.IO is a wrapper library built on top of Engine.IO. It provides features beyond raw WebSockets:
- **HTTP Long-Polling Fallback**: If firewalls or proxies block WebSockets, Socket.IO falls back to HTTP Long-Polling.
- **Automatic Reconnection**: Re-establishes broken TCP connections with exponential backoff.
- **Connection Heartbeats**: Emits regular ping/pong frames to detect dead connections.
- **Namespaces and Rooms**: Groups sockets logically without requiring manual mapping.
- **Packet Buffering**: Buffers client messages while the socket is offline, emitting them on reconnect.

---

## MockMate Server-Side Implementation Detail

MockMate initializes the Socket.IO server within [server.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/server.js) by passing the Node HTTP server wrapper to `initializeSocket()`.

### 1. Handshake Authentication
Authentication is enforced at the connection gateway in [socket.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/config/socket.js):

```javascript
io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "");
    // JWT verification and User document check
    ...
```

- **Token Sources**: The server checks the `auth.token` parameter from the client handshake, falling back to the `Authorization` header.
- **Verification**: The server decodes the token against `process.env.ACCESS_TOKEN_SECRET`.
- **Database Lookup**: The server loads the user from MongoDB using `User.findById(userId).select("-password -refreshToken")` to attach the user profile directly to `socket.user`. This prevents invalid or deleted users from maintaining connections.

### 2. Multi-Tab Presence Registry (`userSocketRegistry`)
To support users opening multiple tabs or devices simultaneously without duplicate presence messages or premature leaves, MockMate implements `userSocketRegistry`:

- **Data Structure**: A JavaScript `Map` where the key is the stringified `userId`, and the value is a `Set` containing the active `socket.id` strings:
  `userSocketRegistry = Map<userId, Set<socketId>>`
- **Connection Handshake (`connection`)**: 
  When a socket connects, the server checks if the `userId` exists in `userSocketRegistry`. If not, it creates a new `Set`. The new `socket.id` is added to the Set.
- **Disconnection Handler (`disconnect`)**:
  When a socket disconnects, the server removes the `socket.id` from the user's Set. If the Set becomes empty, the user ID is deleted from the `Map`.

### 3. Room Occupancy & Multi-Tab Presence Tracking
Inside [room.socket.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/sockets/room.socket.js), the server tracks active room occupancy inside an in-memory `activeRooms` map:
`activeRooms = Map<roomId, Map<userId, { userId, username, email, socketIds: Set<socketId> }>>`

When a socket emits `join-room` or `leave-room`:
- **Join-Room Logic**:
  1. The server checks if the user already has another active socket registered in `activeRooms` for this room using `roomUsersMap.has(userId)`.
  2. The socket joins the Socket.IO room (`socket.join(roomId)`) and sets `socket.currentRoomId = roomId`.
  3. The socket ID is added to the user's `socketIds` set.
  4. **Only if this was the user's first socket** (i.e. `wasAlreadyInRoom = false`), the server broadcasts `user-joined` to other room participants.
  5. The server broadcasts the updated participant list (`room-users`) to all sockets in the room.
- **Leave-Room Logic**:
  1. The server removes the socket ID from the user's Set in `activeRooms`.
  2. If the user's Set size reaches zero, the user's record is removed from `activeRooms`.
  3. **Only if the user has no remaining sockets** in the room (`isStillInRoom = false`), the server broadcasts `user-left` to other participants.
  4. The server broadcasts the updated participant list (`room-users`).

### 4. Collaborative Editor State & Debounced Autosave
Inside [editor.socket.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/sockets/editor.socket.js):
- **Memory Cache (`editorStates`)**: The server caches the active code state in memory. If a new participant joins and `editorStates` is empty, it restores the code from MongoDB (`room.codeState` and `room.language`), keeping memory sync resilient against server cold starts.
- **Authorization Enforcement**: 
  - On `editor-join`, the server queries the database for the Room. It checks if the `socket.user._id` matches the room's interviewer, interviewee, or exists in the `room.participants` array. 
  - If authorized, it caches this permission on the socket: `socket.authorizedRooms.add(roomId)`.
  - On subsequent `code-change` or `language-change` emissions, the server validates:
    `if (!socket.authorizedRooms.has(roomId)) { reject; }`
    This prevents unauthorized sockets from writing code states to rooms they do not belong to (anti-IDOR).
- **Debounced Autosave Flow**:
  1. On typing events (`code-change`), the server updates the `editorStates` cache and broadcasts `code-update` to the other participant.
  2. It looks up the active debouncer timer in `saveDebounced = Map<roomId, TimeoutHandle>`.
  3. If a timer exists, it clears it via `clearTimeout(timer)`.
  4. It schedules a new timer:
     ```javascript
     saveDebounced.set(roomId, setTimeout(() => {
       saveRoomCodeToDB(roomId, nextState);
       saveDebounced.delete(roomId);
     }, 3000));
     ```
  5. Inside `saveRoomCodeToDB()`, the server checks if `room.status === "active"`. It **only** persists to MongoDB if the room is active. It skips saves for completed or cancelled rooms to preserve the post-interview state.

### 5. Room Question Attachments
When the interviewer attaches a question (`question-attached`):
- **Authorization**: The server checks if `room.interviewer.toString() === socket.user._id.toString()`. If not, it emits a `socket-error`.
- **Status Check**: It blocks attachments if `room.status` is `completed` or `cancelled`.
- **Data Mutation**: Updates `room.attachedQuestion` fields in MongoDB and calls `room.save()`.
- **Broadcast**: Emits the updated question structure to the room via `io.to(roomId).emit("question-updated", { attachedQuestion: room.attachedQuestion })`.

### 6. Cleanups and Graceful Shutdowns
- **Graceful Server Shutdown**:
  When receiving `SIGINT` or `SIGTERM` signals in `server.js`, the process initiates a shutdown sequence:
  1. Closes the Socket.IO server: `io.close()` disconnects active clients and rejects new handshakes.
  2. Closes the Node HTTP server.
  3. Closes Mongoose connections.
- **Client Unmounting**:
  In `Room.jsx` and `CodeEditor.jsx`, the cleanup phase inside React's `useEffect` unbinds specific event listeners using `socket.off(eventName)` and emits `leave-room` to prevent memory leaks in the browser.

---

## Detailed Socket Event Registry

### 1. `join-room`
- **Direction**: Client to Server
- **Payload**: `{ roomId: String }`
- **Validation**: Rejects if `!roomId` (emits `socket-error`).
- **Authorization**: Extracted from handshake user context (`socket.user`).
- **Database Updates**: None (in-memory `activeRooms` map update).
- **Broadcast Target**: Emits `user-joined` to other members in the room; broadcasts `room-users` to the entire room.
- **Performance**: $O(1)$ operations on JavaScript Maps and Sets.

### 2. `user-joined`
- **Direction**: Server to Client
- **Payload**: `{ userId: String, username: String, email: String }`
- **Trigger**: Fired when a user connects their first tab to a room.
- **Broadcast Target**: `socket.to(roomId)` (excludes the joining socket).

### 3. `room-users`
- **Direction**: Server to Client
- **Payload**: `Array<{ userId: String, username: String, email: String }>`
- **Trigger**: Fired on user joins, leaves, and disconnects.
- **Broadcast Target**: `io.to(roomId)` (includes everyone in the room).

### 4. `leave-room`
- **Direction**: Client to Server
- **Payload**: `{ roomId: String }`
- **Database Updates**: None.
- **Broadcast Target**: Emits `user-left` to other sockets in the room; broadcasts updated `room-users` list to the room.

### 5. `user-left`
- **Direction**: Server to Client
- **Payload**: `{ userId: String, username: String, email: String }`
- **Trigger**: Fired when a user closes their final connection tab to a room.
- **Broadcast Target**: `socket.to(roomId)` (excludes the leaving socket).

### 6. `editor-join`
- **Direction**: Client to Server
- **Payload**: `{ roomId: String }`
- **Validation**: Rejects if `!roomId` (emits `socket-error`).
- **Authorization**: Queries MongoDB `Room`. Verifies `socket.user` is a participant. Adds to `socket.authorizedRooms`.
- **Database Updates**: Restores `editorStates` from MongoDB `room.codeState` if not cached in-memory.
- **Broadcast Target**: Emits `language-update` back to the joining socket.

### 7. `code-change`
- **Direction**: Client to Server
- **Payload**: `{ roomId: String, language: String, code: String }`
- **Validation**: Rejects if `!roomId` or `!language`.
- **Authorization**: Validates `socket.authorizedRooms.has(roomId)`.
- **Database Updates**: Writes to Mongoose after 3 seconds of typing inactivity (if room is active).
- **Broadcast Target**: Emits `code-update` to `socket.to(roomId)` (excludes the typing socket).

### 8. `code-update`
- **Direction**: Server to Client
- **Payload**: `{ language: String, code: String }`
- **Trigger**: Fired upon authorized `code-change` events.
- **Broadcast Target**: `socket.to(roomId)` (the other participant's editor).

### 9. `language-change`
- **Direction**: Client to Server
- **Payload**: `{ roomId: String, language: String, codeByLanguage: Object }`
- **Validation**: Rejects if `!roomId` or `!language`.
- **Authorization**: Validates `socket.authorizedRooms.has(roomId)`.
- **Database Updates**: Writes to Mongoose after 3 seconds of typing inactivity.
- **Broadcast Target**: Emits `language-update` to `socket.to(roomId)`.

### 10. `language-update`
- **Direction**: Server to Client
- **Payload**: `{ language: String, codeByLanguage: Object }`
- **Trigger**: Fired upon authorized `language-change` or `editor-join`.
- **Broadcast Target**: Broadcasts updated language and full code states.

### 11. `question-attached`
- **Direction**: Client to Server
- **Payload**: `{ roomId: String, questionData: Object }`
- **Validation**: Rejects if `!roomId` or `!questionData`.
- **Authorization**: Verifies `room.interviewer === socket.user._id` and status is not completed/cancelled.
- **Database Updates**: Writes `room.attachedQuestion` fields to MongoDB and calls `room.save()`.
- **Broadcast Target**: Emits `question-updated` to `io.to(roomId)` (includes everyone).

### 12. `question-updated`
- **Direction**: Server to Client
- **Payload**: `{ attachedQuestion: Object }`
- **Trigger**: Fired when an interviewer successfully attaches a question.
- **Broadcast Target**: `io.to(roomId)`.

### 13. `room-updated`
- **Direction**: Server to Client
- **Payload**: `{ room: Object }`
- **Trigger**: Triggered via REST controller lifecycle hooks (e.g. starting or cancelling a session).
- **Broadcast Target**: `io.to(roomId)`.

### 14. `feedback-submitted`
- **Direction**: Server to Client
- **Payload**: `{ roomId: String }`
- **Trigger**: Fired via REST feedback creation.
- **Broadcast Target**: Interviewee sockets.

### 15. `socket-error`
- **Direction**: Server to Client
- **Payload**: `{ message: String }`
- **Trigger**: Triggered on validation errors, authorization mismatches, or controller failures.
- **Broadcast Target**: Emits to the target socket.

---

## Detailed Communication Workflows

### 1. Connection & Handshake Flow
```
Client (Room.jsx)                       Server (socket.js)            User DB
     │                                        │                          │
     │──► auth: { token: accessToken } ─────►│                          │
     │                                        │──► User.findById() ─────►│
     │                                        │◄── [User profile JSON] ──│
     │                                        │                          │
     │◄── [WS Connection Established] ────────│                          │
     │                                        │                          │
```

### 2. Room Joins and Real-Time Synchronization
```
Client A (Room.jsx)               Client B (Room.jsx)            Server (room.socket.js)
     │                                 │                                    │
     │──► emit: "join-room" ───────────┼───────────────────────────────────►│ (updates activeRooms)
     │                                 │                                    │──► wasAlreadyInRoom = false
     │                                 │◄── emit: "user-joined" ────────────│ (notifies Peer)
     │◄── emit: "room-users" ──────────┼───────────────────────────────────►│ (sends user list)
     │                                 │                                    │
     │                                 │──► emit: "editor-join" ───────────►│ (checks Room DB)
     │                                 │◄── emit: "language-update" ────────│ (sends code states)
```

### 3. Editor Synchronization and Autosave Loop
```
Client A (CodeEditor.jsx)           Client B (CodeEditor.jsx)     Server (editor.socket.js)       Room DB
     │                                   │                                  │                        │
     │──► (Keystroke)                    │                                  │                        │
     │     Wait 350ms (debounce)         │                                  │                        │
     │──► emit: "code-change" ───────────┼─────────────────────────────────►│                        │
     │                                   │◄── emit: "code-update" ──────────│ (Excludes Client A)    │
     │                                   │                                  │                        │
     │                                   │                                  │──► [Autosave Timer]    │
     │                                   │                                  │    Wait 3000ms         │
     │                                   │                                  │──► room.save() ───────►│
```

---

## Security Implementation

### 1. Bearer Token Authentication
Handshakes must include a valid access token decoded against `ACCESS_TOKEN_SECRET`. By passing this in the handshake `auth` object, MockMate avoids transmitting secrets in query strings, which could leak into server access logs.

### 2. Cache-Based Authorization (`socket.authorizedRooms`)
MockMate prevents IDOR (Insecure Direct Object Reference) by running a database ownership check on `editor-join`. If the user is authorized, the server caches this permission inside a Mongoose-safe Set (`socket.authorizedRooms`). Subsequent edits check this local Set, avoiding database queries on every keystroke.

### 3. Verification & Validation
- **Example Throttling**: The server slices attached examples to a maximum of 2, preventing resource exhaustion from large inputs.
- **Escape Bounds**: Code states are stored in Mongoose Schema maps (`codeState`), sanitizing structures to prevent NoSQL injection payloads like `$ne` or `$gt` from bypassing evaluations.

---

## Performance Optimizations

### 1. Client-Side Input Debouncing
The editor emits `code-change` events only after **350ms** of typing inactivity. This reduces network payload emissions:
$$\text{HTTP Requests Reduction Rate} \approx 90\%$$

### 2. Server-Side Memory Caching
Instead of saving to MongoDB on every keystroke, MockMate updates an in-memory `editorStates` registry and schedules a **3-second debounced database write**. 

### 3. Volatile Room Cleanups
When a room is marked completed or cancelled, MockMate calls `clearEditorState(roomId)`. This deletes the in-memory editor states and cancels any pending timeouts, preventing memory leaks on long-running processes.

---

## Horizontal Scalability & Redis

If MockMate scales beyond a single backend node, persistent connections will split across server instances.

```
                  ┌──────────────────────┐
                  │    Load Balancer     │
                  └──────────┬───────────┘
                             │ (Requires Sticky Sessions)
               ┌─────────────┴─────────────┐
               ▼                           ▼
      ┌─────────────────┐         ┌─────────────────┐
      │  Server Node 1  │         │  Server Node 2  │
      └────────┬────────┘         └────────┬────────┘
               │                           │
               └─────────────┬─────────────┘
                             ▼
                  ┌──────────────────────┐
                  │    Redis Adapter     │
                  │ (Pub/Sub Sync Layer) │
                  └──────────────────────┘
```

### 1. Load Balancing and Sticky Sessions
Because Socket.IO starts with an HTTP Handshake and upgrades to a WebSocket, the load balancer must enable **Sticky Sessions** (e.g. cookie-based affinity). If client request 1 hits Node 1 and the upgrade request hits Node 2, the handshake will fail with a `400 Bad Request`.

### 2. The Redis Adapter Pub/Sub Flow
Without a shared message broker, an edit on Node 1 cannot propagate to a user connected to Node 2. By configuring the **Redis Adapter**, Node 1 publishes the socket event to a Redis Pub/Sub channel. Node 2 receives the message and broadcasts it to its local connected sockets in the target room.

---

## Troubleshooting & Debugging

- **Socket Won't Connect (`connect_error`)**: Check if the client environment variable `VITE_SOCKET_URL` matches the backend host. In production, ensure CORS origin controls include the client domain.
- **Unauthorized Socket Connection**: Verify if the access token in `tokenStore.js` is null or expired. If expired, check why the Axios silent refresh did not bootstrap.
- **Desynchronized Code Editor States**: Inspect if `isApplyingRemoteRef.current` is stuck at `true`, which blocks local code changes from emitting to the server.
- **Memory Leaks (Node process out of memory)**: Check if `clearEditorState` is failing to clear the `saveDebounced` timeout loops when rooms close.

---

## Interview Questions & Deep Dives

### Beginner Questions
#### What is Socket.IO and how does it differ from raw WebSockets?
Socket.IO is a framework that uses the WebSocket protocol as its primary transport stream but falls back to HTTP Long-polling if WebSockets are blocked. It also provides built-in reconnection logic, heartbeats, and room abstractions.

#### What database action occurs on logout to invalidate sockets?
The logout controller unsets `user.refreshToken` in MongoDB, and the client calls `setAccessToken(null)`. The `useEffect` inside `SocketContext.jsx` detects this token change, triggers `cleanupSocket()`, and disconnects the WebSocket stream.

---

### Intermediate Questions
#### How does MockMate prevent unauthorized sockets from editing a room?
During `editor-join`, the server queries MongoDB to verify if the user's ID matches the interviewer, interviewee, or exists in the `participants` list. If verified, the server caches this permission on the socket object using `socket.authorizedRooms.add(roomId)`.

#### Explain the role of the 3-second debounced autosave.
The 3-second debouncer prevents writing to MongoDB on every keystroke. When a client types, the server updates an in-memory cache and schedules a write. If the user types again within 3 seconds, the previous write is cancelled, saving database CPU resources.

---

### Advanced Questions
#### How does MockMate handle multiple tabs open in the same room?
MockMate uses `activeRooms = Map<roomId, Map<userId, { socketIds: Set }>>`. A user's presence inside a room is tracked as a Set of socket IDs. The server only emits a `user-left` event when the user's socket Set size becomes zero, preventing premature disconnect messages.

#### What happens to the in-memory editor state if the Node server restarts mid-session?
When a client reconnects, it emits `editor-join`. Since the server's `editorStates` Map is empty after a restart, the server queries the database for the room's `codeState`. It restores this code into memory before broadcasting it back to the client.

---

### Staff-Level Questions
#### Why is a simple state overwrite insufficient for large-scale real-time collaboration?
MockMate uses a simple state overwrite model where the latest typing event overrides the server cache and is broadcast to the peer. In a production system like Google Docs or Figma, this would cause race conditions and overwrite conflicts if two users type simultaneously. To scale, you would need **Operational Transformation (OT)** (using a central server to coordinate operations) or **Conflict-free Replicated Data Types (CRDTs)** (using mathematical laws to merge concurrent modifications deterministically without a central coordinator).

#### Detail how you would implement a distributed presence registry using Redis.
Currently, MockMate uses local JavaScript Maps (`activeRooms`) to track room presence. In a multi-node backend, a user on Node 1 won't see a user on Node 2. To solve this, you can store presence data in Redis using **Sorted Sets (ZSET)** (using user heartbeat timestamps as scores) or **Hashes**, and use Redis Pub/Sub to broadcast joins and leaves across nodes.

---

## Revision Checklist
- [ ] I can trace the socket authentication handshake flow.
- [ ] I can explain how the `userSocketRegistry` maps user IDs to multiple socket IDs.
- [ ] I can describe the 350ms client debounce and 3-second server autosave logic.
- [ ] I can detail how cache-based room authorization prevents unauthorized edits.
- [ ] I can explain the unmounting cleanups used to prevent memory leaks in both React and Node.
