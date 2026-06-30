# Interview Rooms and Workspace

## Why this topic exists in MockMate
The interview room is the core workspace where the collaborative interview occurs. A room manages the participants (limited to 1 interviewer and 1 interviewee), coordinate coding languages, hold the code state, maintain attachments (like coding questions), and direct the state transitions (waiting → scheduled → active → completed/cancelled) of the session.

## Where it is implemented
- [room.model.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/models/room.model.js) — Room mongoose schema, compound indexes, participant structure, status enum, and custom validation.
- [Room.controller.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/controllers/Room.controller.js) — Controllers for creating rooms, joining, leaving, starting, completing, fetching user-associated sessions, and loading details.
- [room.routes.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/routes/room.routes.js) — Authentication routing guards, request validators for IDs, titles, and join requests.
- [Room.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/pages/Room.jsx) — Live page workspace loading socket loops, participant lists, editor layout, meeting links, and controller panels.
- [CreateRoomForm.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/components/rooms/CreateRoomForm.jsx) / [JoinRoomForm.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/components/rooms/JoinRoomForm.jsx) — Form components for creating or joining sessions by unique codes.

## Code Flow
1. **Creation**: User registers a room with title/language → server generates unique uppercase 6-letter room code (collision-checked against database) → creates Room document setting creator/interviewer as `req.user._id` and status as `waiting`.
2. **Joining**: Candidate submits room code → server locates room, validates it's not full, active, completed, or cancelled → updates `interviewee` to candidate ID and pushes candidate details to the `participants` subdocument array → emits `room-updated` and notifies socket peer.
3. **Workspace Loading**: User navigates to `/room/:roomCode` → gets room details → launches Socket.IO connections joining the room context → loads saved `codeState` from MongoDB if absent in memory.
4. **Execution Lifecycle**: Interviewer starts room → state shifts to `active` → interviewer completes room → fetches in-memory editor states -> saves final code state to Mongoose document -> changes status to `completed` → schedules database commits and notifications inside a transaction block.

## Components involved
- Room schemas, unique code generator, controllers for state transitions, socket updates, React workspace page, and control components.

## Dependencies involved
- `mongoose`, `express`, `socket.io` (server side state sync).

## Related modules
- [sockets.md](sockets.md) (syncs editor and room state), [scheduling.md](scheduling.md) (binds scheduled sessions), [authorization.md](authorization.md) (guards participant actions).

## Concepts I MUST Study
⚠️ Do not explain — only list.
- Finite State Machines (FSM) for business workflows
- ACID properties and database transactions in application logic
- Race conditions during resource allocations (concurrency checks)
- In-memory state synchronization vs database persistence
- Custom schema validations in Mongoose
- Unique code generation collision mechanics
- Cascade status updates and side-effect management (e.g., cancelling related schedules)
- Soft delete vs hard delete patterns
- React route-protection and workspace redirection layouts

## Beginner Interview Questions
- What is a MockMate "room" and what are the roles in it?
- How is the 6-letter unique `roomCode` generated and verified?
- What are the possible statuses a room can transition through?
- How does a candidate join an existing interview room?
- Who is allowed to start or complete an interview session?

## Intermediate Questions
- What is the difference between the `createdBy` user and the `interviewer`? Can they differ?
- How does the `leaveRoom` controller handle the case where the interviewer leaves versus the interviewee leaving?
- Why do we populate user details like username and email during room details retrieval?
- How does the database enforce that no more than two participants are in a room?
- What happen to associated schedules when a room status transitions to `cancelled` or `completed`?

## Advanced Questions
- Walk through the concurrency scenario where two candidates attempt to join the same room code simultaneously. What prevents a race condition?
- Why does `completeRoom` pull the active code state from `getEditorState()` memory instead of reading it directly from Mongoose?
- Explain how the Mongoose transaction in `completeRoom` ensures notification delivery and schedule status updates happen atomically.
- If an active room loses connection, how does it recover the code from memory vs database? Explain the caching priority.
- What happens if the interviewer attempts to delete a room during an active session? What guards block this?

## Staff-Level Questions
- Design a room scalability strategy that supports "Spectator Mode" (multiple observers watching the interview) without degrading the latency of the active coder.
- If we want to allow interview rooms to support multiple interviewers (e.g., panel interviews), outline the DB schema and controller refactor needed.
- How would you implement a distributed lock pattern (using Redis Redlock) to manage room joins across multiple stateless server nodes?

## Questions About MY Implementation
- Why is the `roomCode` generated via a `do-while` loop checking `Room.findOne({ roomCode })`? What is the collision probability?
- Why is `maxParticipants` marked as `immutable: true` in the Room schema?
- What would break in the frontend workspace page if the `room.participants.user` field failed to populate?
- Why does leaving a room as an interviewer cancel the entire session, whereas an interviewee leaving shifts it back to `waiting`?
- What assumptions were made about reusing room codes after an interview is completed?

## Follow-up Questions
- What breaks if we remove the transaction scope from `completeRoom`?
- Why doesn't MockMate allow an interviewer to join as the interviewee?
- What happens to the saved code if the server crashes while a room is `active`?
- How does the frontend dynamically hide the "Start Interview" button from the candidate?

## Code Reading Questions
- Find the `isRoomParticipant` helper function in `Room.controller.js` and trace how it works.
- In `room.model.js`, locate the index definitions. Why are compound indexes defined on `interviewer`, `status`, and `createdAt`?
- Trace the sequence of checks at the beginning of `startRoom`. List all conditions that throw an error.
- Locate the code that limits example inputs in `question-attached` socket event. How many examples are allowed?

## Debugging Questions
- A user joins a room but the UI doesn't transition to the active editor state. How do you trace if this is a route status error or a socket emission failure?
- The backend throws `TransactionAbortedError`. Trace what caused the abort in `completeRoom`.
- In production, you notice duplicate room codes are being generated. How would you diagnose the generator logic?
- The error `Only waiting or scheduled interview sessions can be scheduled` is thrown. Trace what database query was run.

## Edge Cases
- A user closes their browser during an active interview, and their partner clicks "Complete Interview".
- The interviewee tries to join the room code of a room that is already cancelled or completed.
- Interviewer clicks "Complete" at the exact moment the interviewee is typing a character, causing a database write conflict.
- Both participants lose connection simultaneously, leaving the room status stuck in `active`.

## Security Questions
- How do you verify that a non-participant cannot query the details of a private room?
- What blocks a user from spoofing room status modifications via POST requests directly to `/api/v1/rooms/:roomId/complete`?
- Can a candidate read the questions attached to the room before the interviewer explicitly clicks "Attach Question"? Trace the database fields.

## Performance Questions
- How does index selection affect the speed of the user dashboard query `/my-rooms`?
- What are the performance costs of running `Room.findOne` inside a loop during room code generation?

## Scalability Questions
- If there are 50,000 active interview rooms, how does the memory footprint of `editorStates` scale on a single instance?
- How would you move active room metadata out of Mongoose into Redis to handle scaling?

## Trade-off Questions
- Storing participants as a nested schema array vs a separate `RoomMembers` relation collection: trace the tradeoffs.
- Single interviewer design vs multi-interviewer flexibility in the model design.

## Refactoring Questions
- Refactor the room status transitions to use a clean State Pattern class framework.
- Decouple the room code generator into a separate microservice.

## Whiteboard Questions
- Draw the state diagram for a MockMate room session, marking the events that trigger each transition.
- Design the API endpoints and JSON payload specs required to support live interview room coordination.

## Practical Coding Exercises
- Write a mongoose pre-validate hook that checks if interviewer and interviewee IDs are identical and rejects the save.
- Implement a route `/api/v1/rooms/:roomId/reopen` that allows an interviewer to move a completed room back to active, specifying the validations needed.

## Revision Checklist
- [ ] I can describe every status transition of a room and what triggers it.
- [ ] I can explain the validation logic that prevents unauthorized users from accessing room details.
- [ ] I can detail how code state is captured and persisted when an interview completes.
- [ ] I can identify all indexes on the Room model and justify their components.
- [ ] I can trace the lifecycle of a Mongoose session transaction inside the room controllers.
