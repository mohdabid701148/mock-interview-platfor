# JWT (JSON Web Tokens)

## Why this topic exists in MockMate
JWTs carry identity statelessly across REST requests and the Socket.IO handshake, so the server can authorize each call without a server-side session store.

## Where it is implemented
- `backend/src/models/User.model.js` — `generateAccessToken`, `generateRefreshToken`
- `backend/src/middlewares/auth.middleware.js` — `jwt.verify` of the access token
- `backend/src/controllers/auth.controller.js` — refresh flow, token issuance
- `backend/src/config/socket.js` — handshake `jwt.verify`
- `frontend/src/api/axios.js` — attaches bearer token; triggers refresh on 401

## Code Flow
1. On login/refresh, `generateAccessToken` signs `{ _id, email, username, role }` with `ACCESS_TOKEN_SECRET` and `ACCESS_TOKEN_EXPIRY`.
2. `generateRefreshToken` signs `{ _id }` only, with `REFRESH_TOKEN_SECRET` and `REFRESH_TOKEN_EXPIRY`.
3. `verifyJWT` verifies the access token signature/expiry, decodes `_id`, loads the user.
4. Socket middleware verifies the same access token from `handshake.auth.token`.

## Components involved
- Token generators (model methods), `verifyJWT`, socket auth middleware, refresh controller.

## Dependencies involved
- `jsonwebtoken`, environment secrets.

## Related modules
- [authentication.md](authentication.md), [refresh-tokens.md](refresh-tokens.md), [cookies-and-token-storage.md](cookies-and-token-storage.md), [socketio-realtime.md](socketio-realtime.md)

## Concepts I MUST Study
⚠️ List only.
- JWT header / payload / signature
- JWS vs JWE (signed vs encrypted)
- HS256 vs RS256 (symmetric vs asymmetric)
- Signature verification
- `exp`, `iat`, `nbf` claims
- Token expiry vs revocation
- Stateless auth limitations
- Secret rotation
- Claims minimization (why refresh token holds only `_id`)
- Replay attacks
- Clock skew

## Beginner Interview Questions
- What is a JWT and what are its three parts?
- Is a JWT encrypted? What does the signature actually protect?
- Where does your access token get verified?
- What claims are inside your access token?

## Intermediate Questions
- Why does the access token include `role` but the refresh token only `_id`?
- What is the difference between `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET`?
- What happens when `jwt.verify` fails — what error and status do you return?
- Why use short expiry on the access token?

## Advanced Questions
- HS256 vs RS256 — which do you use and when would you switch?
- How would you handle secret rotation without invalidating all live tokens at once?
- Why is a stateless JWT hard to revoke immediately?
- What is the risk of putting too much data in the payload?

## Staff-Level Questions
- Design a token-versioning scheme to enable instant global logout.
- How would you support multiple signing keys (key IDs / `kid`) during rotation?
- What are the trade-offs of asymmetric signing for a multi-service architecture?

## Questions About MY Implementation
- Why sign `email`, `username`, `role` into the access token instead of fetching them per request?
- Given you embed `role`, why does `verifyJWT` still re-fetch the user?
- What would break if `ACCESS_TOKEN_EXPIRY` were unset?

## Follow-up Questions
- Why? Why not store less / more in the payload?
- What if the secret leaks?
- How does it fail with clock skew between instances?

## Code Reading Questions
- Which secret verifies the socket handshake token, and is it the access or refresh secret?
- In the refresh controller, which secret verifies the incoming token?

## Debugging Questions
- A valid-looking token returns "Invalid access token" — list possible causes.
- Tokens work locally but fail in production — what environment factors do you check?

## Edge Cases
- Token signed with an old secret after rotation.
- Token expired by one second.
- Payload missing `_id`.
- Token string is literally `"undefined"`.

## Security Questions
- Why minimize refresh token claims?
- What stops a tampered payload from being accepted?
- Why never store secrets in the repo?

## Performance Questions
- Is signature verification CPU-significant at your scale?
- Does embedding `role` save a DB call anywhere today?

## Scalability Questions
- Why is stateless JWT attractive for horizontal scaling?
- What part of your design makes it not fully stateless?

## Trade-off Questions
- Stateless JWT vs server sessions — what did you gain and lose?
- Short access expiry vs UX friction — how did you balance it?

## Refactoring Questions
- How would you centralize sign/verify config in one module?
- How would you add `kid`-based multi-key verification?

## Whiteboard Questions
- Draw the structure of a JWT and how verification works.
- Design instant revocation on top of stateless JWTs.

## Practical Coding Exercises
*(Do not solve.)*
- Add a `tokenVersion` claim and enforce it in `verifyJWT`.
- Switch HS256 → RS256 and verify with a public key.

## Revision Checklist
- [ ] I can explain header/payload/signature and what signing guarantees.
- [ ] I can justify the differing claims in my two tokens.
- [ ] I can explain why my JWT auth is not fully stateless.
- [ ] I can describe secret rotation and revocation strategies.
