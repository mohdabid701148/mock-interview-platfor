# Middleware

## Why this topic exists in MockMate
Express middleware is the backbone of the request pipeline: security headers, body parsing, CORS, rate limiting, auth, validation, and centralized error handling all run as ordered middleware.

## Where it is implemented
- `backend/src/app.js` — helmet, json/urlencoded, cookie-parser, cors, limiters, 404, error handler
- `backend/src/middlewares/auth.middleware.js` — `verifyJWT`
- `backend/src/middlewares/validation.middleware.js` — `validate(schema)` factory
- `backend/src/middlewares/rateLimiter.middleware.js` — multiple limiters
- `backend/src/middlewares/error.middleware.js` — error handling
- `backend/src/utils/asyncHandler.js` — async error forwarding

## Code Flow
1. Global chain in `app.js`: `trust proxy` → helmet → body parsers → cookie-parser → cors → `generalLimiter` → routes (with route-specific limiters) → 404 → error handler.
2. Per route: `verifyJWT` → `validate(schema)` → controller (wrapped by `asyncHandler`).
3. Any thrown `ApiError` propagates to the final `(err, req, res, next)` handler.

## Components involved
- Security, parsing, CORS, rate limiters, auth, validation, error handler, `asyncHandler`.

## Dependencies involved
- `express`, `helmet`, `cors`, `cookie-parser`, `express-rate-limit`.

## Related modules
- [express-api-design.md](express-api-design.md), [validation.md](validation.md), [rate-limiting.md](rate-limiting.md), [error-handling.md](error-handling.md), [security.md](security.md)

## Concepts I MUST Study
⚠️ List only.
- Middleware signature `(req, res, next)` and `(err, req, res, next)`
- Middleware ordering and short-circuiting
- Application-level vs router-level vs error middleware
- Higher-order middleware (factory pattern)
- `next(err)` propagation
- Async error handling in Express 5
- Wrapping controllers (`asyncHandler`)
- Idempotent vs side-effecting middleware

## Beginner Interview Questions
- What is middleware in Express?
- What does `next()` do?
- Name three middlewares in your global chain.

## Intermediate Questions
- Why does middleware order matter? Give an example from your `app.js`.
- How does `validate(schema)` use the factory pattern?
- What does `asyncHandler` solve?

## Advanced Questions
- How does an error thrown in an async controller reach your error handler?
- Why is the 404 handler placed after all routes but before the error handler?
- How does the error-handling middleware differ in signature from normal middleware?

## Staff-Level Questions
- How would you guarantee a security middleware can never be skipped on a new route?
- How would you add request-scoped context (trace IDs) cleanly via middleware?
- How would you order middleware to minimize wasted work under attack (e.g., rate limit before auth)?

## Questions About MY Implementation
- Why is `generalLimiter` global but `authLimiter` route-scoped?
- Why is `cookieParser` placed before CORS, and does order matter here?
- Why wrap controllers in `asyncHandler` instead of try/catch in each?
- What would break if `verifyJWT` ran after `validate`?

## Follow-up Questions
- Why? Why this order?
- What if a middleware forgets to call `next()`?
- How does it fail if the error handler is registered before routes?

## Code Reading Questions
- Trace the exact middleware order for `POST /api/v1/auth/login`.
- What does `asyncHandler` return and how does it forward errors?

## Debugging Questions
- A route hangs forever — which middleware bug causes that?
- Errors return HTML stack traces instead of JSON — what's missing?

## Edge Cases
- Middleware throws synchronously vs rejects asynchronously.
- Two error handlers registered.
- Body parser limit exceeded.

## Security Questions
- Why run helmet first?
- Should rate limiting run before or after auth, and why?

## Performance Questions
- Which middlewares run on every request and what's their cost?
- Does parsing a 150kb body on every request matter?

## Scalability Questions
- Are any middlewares stateful in a way that breaks across instances (e.g., rate limiter store)?
- How would you externalize rate-limit state?

## Trade-off Questions
- Inline auth checks vs authorization middleware.
- Global vs per-route limiters.

## Refactoring Questions
- Extract a route-builder that always applies `verifyJWT` + `validate`.
- Replace the custom `validate` with a schema library — what changes?

## Whiteboard Questions
- Draw the full middleware pipeline with branch points.
- Implement `asyncHandler` from scratch.

## Practical Coding Exercises
*(Do not solve.)*
- Add a request-logging middleware with timing.
- Add a correlation-id middleware threaded into error responses.

## Revision Checklist
- [ ] I can recite the global middleware order and justify it.
- [ ] I can explain `asyncHandler` and async error propagation in Express 5.
- [ ] I can explain the factory pattern in `validate`.
- [ ] I can explain why the error/404 handlers are last.
