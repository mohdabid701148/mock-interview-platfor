# Authorization

## Why this topic exists in MockMate
Authentication proves identity; authorization decides what that identity may do. MockMate enforces role rules (interviewer vs interviewee), room membership, and resource ownership across REST and sockets.

## Where it is implemented
- `backend/src/controllers/Room.controller.js` — interviewer-only `start`/`complete`, participant checks, join rules
- `backend/src/sockets/room.socket.js` — interviewer-only `question-attached`
- `backend/src/sockets/editor.socket.js` — participant check on `editor-join`, cached `authorizedRooms`
- `backend/src/models/User.model.js` — `role` enum (`user`/`admin`)
- `backend/src/models/room.model.js` — `interviewer`, `interviewee`, `participants[]`

## Code Flow
1. `verifyJWT` attaches `req.user` (authentication).
2. Controllers compare `req.user._id` against `room.interviewer` / `room.interviewee` / `participants`.
3. Sockets re-check membership on join and cache `socket.authorizedRooms`; subsequent editor events check that cache.
4. Status guards (waiting/active/completed/cancelled) further restrict allowed actions.

## Components involved
- Room controller guards, socket authorization checks, participant helper `isRoomParticipant`.

## Dependencies involved
- `mongoose` (ownership lookups), Socket.IO.

## Related modules
- [authentication.md](authentication.md), [rooms-interview-workflow.md](rooms-interview-workflow.md), [socketio-realtime.md](socketio-realtime.md)

## Concepts I MUST Study
⚠️ List only.
- Authentication vs authorization
- RBAC vs ABAC
- Resource ownership checks
- Principle of least privilege
- Broken object-level authorization (BOLA/IDOR)
- Defense in depth (REST + socket re-checks)
- Caching authorization decisions (staleness risk)
- State-machine-based permissions

## Beginner Interview Questions
- What is the difference between authentication and authorization?
- Who is allowed to start an interview in your app?
- How do you know a user belongs to a room?

## Intermediate Questions
- Where do you check that only the interviewer can attach a question?
- How does the editor socket verify a user may edit a room?
- What is `socket.authorizedRooms` and why cache it?

## Advanced Questions
- What is IDOR and where could it appear in your room endpoints?
- Why re-check authorization on the socket if REST already authorized the user?
- What staleness risk does caching `authorizedRooms` introduce?

## Staff-Level Questions
- Design a general RBAC/ABAC layer to replace ad-hoc `if` checks.
- How would you centralize authorization to avoid missing a check on a new endpoint?
- How would you audit authorization decisions across REST and sockets?

## Questions About MY Implementation
- Why is authorization done inline in controllers rather than in middleware?
- Why does `role` exist on User but barely get used — what was the intent?
- What would break if you removed the participant check in `getRoomDetails`?
- What assumptions did you make about who can read a room by code?

## Follow-up Questions
- Why? Why not middleware-based authorization?
- What if a participant is removed mid-session but their socket cache still allows edits?
- How does it fail if `interviewee` is null?

## Code Reading Questions
- In `editor-join`, what three conditions can grant access?
- In `joinRoom`, list every rejection branch in order.

## Debugging Questions
- A valid participant gets "Unauthorized room operation" on edit — what do you check?
- The interviewer can't complete a room — trace the guard chain.

## Edge Cases
- Interviewer tries to join their own room as interviewee.
- User leaves room but socket still cached as authorized.
- Action attempted on a completed/cancelled room.
- Two users race to become the interviewee.

## Security Questions
- How do you prevent a non-participant from reading room code/state?
- How do you prevent privilege escalation to interviewer actions?
- Is the cached socket authorization revoked on leave?

## Performance Questions
- How many DB reads do socket authorization checks add per join?
- Does caching `authorizedRooms` meaningfully reduce load?

## Scalability Questions
- Socket auth cache lives on the socket instance — what happens with multiple nodes?
- How would centralized authorization scale vs inline checks?

## Trade-off Questions
- Inline checks (simple, scattered) vs centralized policy (consistent, complex).
- Caching authorization (fast, can go stale) vs re-checking every event.

## Refactoring Questions
- Extract a `requireInterviewer(roomId)` guard reused across REST + sockets.
- Add a policy module mapping (action, status, role) → allowed.

## Whiteboard Questions
- Draw the permission matrix for room actions by role and status.
- Design middleware that authorizes any room-scoped REST route.

## Practical Coding Exercises
*(Do not solve.)*
- Build reusable `authorizeRoomAction` middleware.
- Add socket-side revocation when a user leaves a room.

## Revision Checklist
- [ ] I can list every interviewer-only action and where it's enforced.
- [ ] I can explain socket re-authorization and its cache staleness risk.
- [ ] I can identify IDOR risks and how membership checks prevent them.
- [ ] I can explain how status gates permissions.
