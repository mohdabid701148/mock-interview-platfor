# MongoDB & Mongoose

## Why this topic exists in MockMate
MockMate relies on MongoDB as its primary datastore to persist user profiles, interview rooms, calendar schedules, feedback reports, and notifications. Mongoose acts as the ODM (Object Data Modeling) library, enforcing schemas, modeling relationships, running pre-save lifecycle hooks, creating performance indexes, and coordinating multi-document ACID transactions.

## Where it is implemented
- [db.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/config/db.js) — Connection lifecycle listeners, pool sizing, and timeout settings.
- [User.model.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/models/User.model.js) — User schema, password hashing pre-save hook, email verification hashing, and custom schema methods.
- [room.model.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/models/room.model.js) — Room schema, nested participant array, indexing, and validation.
- [Schedule.model.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/models/Schedule.model.js) — Schedule schema, state tracking, and composite query indexing.
- [Feedback.model.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/models/Feedback.model.js) — Feedback schema, score ranges, and unique constraint mapping.
- [notification.model.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/models/notification.model.js) — Notification schema, status tracking, and TTL-based expiration.
- [Room.controller.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/controllers/Room.controller.js) — Room completion transaction handling.
- [feedback.controller.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/controllers/feedback.controller.js) — Feedback submission transaction handling.

## Code Flow
1. **Server Initialization**: `server.js` calls `db_connect()` before booting the Express app or Socket.IO server.
2. **Connection Execution**: `db_connect` validates `MONGODB_URI` → invokes `mongoose.connect` with timeout settings (10s Atlas timeout) and connection pooling (maxPoolSize: 10) → binds listeners to MongoDB disconnection, reconnection, and error events.
3. **Transaction Execution (e.g., completeRoom)**: Controller invokes `mongoose.startSession()` → starts transaction on the session → executes queries (updates Room status to completed, fetches/saves room codeState, updates Schedule status to completed, creates interviewer/interviewee notifications) passing the `{ session }` option → calls `session.commitTransaction()` or aborts on error → ends the session.

## Components involved
- Connection manager (`db_connect`), Schemas (User, Room, Schedule, Feedback, Notification), Model controllers, and transaction sessions.

## Dependencies involved
- `mongoose` (ODM), `mongodb` (native driver).

## Related modules
- [authentication.md](authentication.md) (uses User model hooks), [authorization.md](authorization.md) (checks IDs), [rooms.md](rooms.md) (Room state), [scheduling.md](scheduling.md) (Schedule state).

## Concepts I MUST Study
⚠️ Do not explain — only list.
- MongoDB document model vs relational tables
- Mongoose ODM middleware hooks (pre, post)
- Connection pooling and socket timeouts in Node-MongoDB drivers
- MongoDB indexes (Single, Compound, Multikey, TTL)
- Index selectiveness and query optimization
- MongoDB Transaction mechanics (Session, startTransaction, commitTransaction, abortTransaction)
- Write Concerns and Read Preferences
- Virtual fields and schema methods
- Subdocuments vs referenced documents
- Populate mechanism ($lookup abstraction) and performance costs
- Free-tier MongoDB Atlas drops, driver reconnect loops, and socket stability
- Mongoose validation hooks vs application-level request validators

## Beginner Interview Questions
- What is MongoDB and how does it differ from SQL databases?
- What is Mongoose and why do we use it in a Node project?
- How does MockMate connect to MongoDB on startup?
- What models exist in MockMate and what are their relationships?
- Where are the timestamps (`createdAt`, `updatedAt`) defined in your models?

## Intermediate Questions
- Why does your connection logic listen to Mongoose connection events like `disconnected` and `reconnected`?
- What are MongoDB indexes, and which indexes are created on the Room model?
- Why is `maxPoolSize` set to 10 in the Mongoose connection options?
- How is the 6-digit email verification token stored in the database?
- How does Mongoose prevent you from submitting more than one feedback report per room?

## Advanced Questions
- Walk through the transaction implementation in `completeRoom`. Why is a transaction necessary here?
- How does the `participants` subdocument validation enforce the rule of maximum 2 participants in a room?
- Why do we use compound indexes on the Schedule model? What specific queries do they optimize?
- What happens to MongoDB connections during a cold start or scale down on PaaS providers like Render?
- How does Mongoose populate referenced fields under the hood? What are the network and query overheads?

## Staff-Level Questions
- Design a high-throughput, horizontally scaled database architecture for MockMate. Where do write conflicts occur during concurrent socket updates?
- How would you handle transactions in a sharded MongoDB database? What are the limitations?
- If we hit the max connections limit on Atlas under heavy traffic, how would you optimize connection management and pools?
- Design a schema migration plan to split the `participants` subdocument out of the `Room` collection without downtime.

## Questions About MY Implementation
- Why is the `roomCode` field in Room indexed and marked as uppercase/unique?
- Why does `User.model.js` define indexes on `emailVerificationToken`?
- Why did you use a Mongoose transaction in `submitFeedback` but not in `createRoom` or `joinRoom`?
- What would happen to the database connection if `db_connect` fails to select a server in 10 seconds?
- Why is the code state in Room stored as a `Map` of strings instead of a nested object schema?

## Follow-up Questions
- What breaks if we don't pass `{ session }` to `save()` or `findOneAndUpdate()` inside a transaction block?
- How does `schema.index` compare to manual index creation in MongoDB shell?
- What happens if the Mongoose transaction aborts? Does it rollback memory states in the application?
- Why not use Redis for fast-changing states like socket registries instead of Mongoose maps?

## Code Reading Questions
- Locate where the compound indexes on `Schedule` are defined in `Schedule.model.js`.
- Trace the exact fields excluded using `.select("-password -refreshToken")` when a user profile is fetched.
- In `completeRoom`, identify the Mongoose helper function that starts the transaction session.
- Find the validator function for `participants` in `room.model.js` and explain what it returns.

## Debugging Questions
- A query on `Schedule` is executing very slowly. What command would you use to verify if it is using an index?
- The server throws `MongoServerError: Transaction numbers are only allowed on a replica set member or mongos`. What is the cause?
- Mongoose throws `ValidationError: Only two participants are allowed...` during `joinRoom`. How do you verify the current array size?
- A disconnection log `MongoDB disconnected — driver will attempt to reconnect` fires in production. What steps do you take to diagnose Atlas status?

## Edge Cases
- Two users try to join a room concurrently, causing a race condition on the `participants` array size.
- A transaction fails midway due to a connection drop during `completeRoom`.
- A user changes their password, but the pre-save hook is not triggered because they used `findOneAndUpdate` instead of `save()`.
- An invalid ObjectId is passed to a param, causing Mongoose to throw a cast error before validation middleware runs.

## Security Questions
- How do you prevent NoSQL injection attacks in your Express routes?
- Why is it critical that `emailVerificationToken` is indexed and hashed rather than stored in plain text?
- What are the security risks of sending Mongoose document models directly to the client without filtering?

## Performance Questions
- Why is it better to project fields using `.select()` rather than fetching the whole document?
- What is the performance difference between storing codes in an in-memory Map vs querying MongoDB on every keystroke?
- How does the `maxPoolSize` affect database latency under high concurrency?

## Scalability Questions
- How does MongoDB's document model scale horizontally compared to relational databases?
- If MockMate receives 10,000 requests/sec, how do you scale reads vs writes on MongoDB?

## Trade-off Questions
- Storing code state as a `Map` in Room vs in a separate historical `CodeVersions` collection: what did you trade off?
- Using Mongoose (heavyweight, ODM validation) vs native MongoDB driver (lightweight, raw speeds) in this codebase.

## Refactoring Questions
- Refactor the transaction wrapper logic in `completeRoom` into a reusable helper utility.
- Add a soft-delete feature to the Room model using Mongoose query middleware.

## Whiteboard Questions
- Draw the entity relationship diagram (ERD) for MockMate's database schema.
- Write a pseudocode function to handle a Mongoose transaction that transfers a room's ownership.

## Practical Coding Exercises
- Implement a TTL index on a new `SessionLog` model that automatically deletes entries after 24 hours.
- Write a script using Mongoose to clean up orphaned schedules where the associated room no longer exists.

## Revision Checklist
- [ ] I can explain the difference between a single key and compound index in Mongoose.
- [ ] I can describe the lifecycle of a Mongoose transaction and trace it in MockMate.
- [ ] I can detail why and how connection pool parameters are configured.
- [ ] I can explain what database queries trigger password hashing pre-save hooks and what queries bypass them.
- [ ] I can identify all index definitions in MockMate and explain their purpose.
