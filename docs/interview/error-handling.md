# Error Handling, Logging, & Validation

## Why this topic exists in MockMate
A professional API must respond with structured error messages, run complete input validations before querying databases, prevent runtime crashes, and log diagnostic events. MockMate uses a centralized Express error middleware, a custom schema-based validator builder, structured response wrappers (`ApiError`, `ApiResponse`), and custom promise handlers (`asyncHandler`) to build a robust system.

## Where it is implemented
- [ApiError.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/utils/ApiError.js) — Custom error wrapper inheriting from the native JavaScript `Error` class, capturing HTTP status codes, trace stacks, and validation arrays.
- [ApiResponse.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/utils/ApiResponse.js) — Standard JSON response format.
- [asyncHandler.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/utils/asyncHandler.js) — High-order function wrapping async route handlers to automatically catch rejections and delegate them to `next()`.
- [error.middleware.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/middlewares/error.middleware.js) — Centralized Express error handler formatting error JSON payloads and managing stack traces.
- [validation.middleware.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/middlewares/validation.middleware.js) — A custom, lightweight validation middleware validating params, body, and query schemas.
- [app.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/app.js) — Unmatched route handler (404 wrapper) and error middleware registration.

## Code Flow
1. **Request Intake**: Client makes a request → route-specific validation middleware `validate(schema)` executes.
2. **Schema Checking**: Custom validation factory checks URL params, body fields, types, enum boundaries, size rules, and calls custom validator functions (`validateFn`).
3. **Validation Outcome**:
   - If fields fail checks, validator instantiates `new ApiError(400, "Validation failed", errors)` and passes it to `next(err)`.
   - If fields pass, invokes `next()` forwarding execution to the controller.
4. **Controller Run**: Controller (wrapped by `asyncHandler`) executes → if DB or service rejects, Promise catch block intercepts the error and calls `next(err)`.
5. **Centralized Format**: Centralized error middleware intercepts all `next(err)` calls → reads `statusCode` (defaults to 500) and outputs a standardized response object containing success status, message, and error details.

## Components involved
- Custom error wrappers, standardized responses, higher-order controllers wrapper, request field validator, 404 router, and centralized exception handler.

## Dependencies involved
- `express` (routing wrapper), Mongoose validators.

## Related modules
- [middleware.md](middleware.md) (complements middleware flows), [api-design.md](api-design.md) (routes layout).

## Concepts I MUST Study
⚠️ Do not explain — only list.
- Centralized Error Handling pattern in Express
- JavaScript Error object inheritance and custom stack traces (`Error.captureStackTrace`)
- Higher-Order Functions (HOF) in JavaScript
- Schema-based validation vs manual validation blocks
- Express 5 async error forwarding changes vs Express 4 manual catch requirements
- Input sanitization vs Input validation
- Exception management in asynchronous loops
- Standardized API response design (JSON API patterns)
- Node.js process-level exceptions (`uncaughtException`, `unhandledRejection`)
- Security implications of logging stack traces in production

## Beginner Interview Questions
- What is `ApiError` and how is it used in MockMate?
- What does the `asyncHandler` utility solve?
- What happens when a user attempts to call a route that does not exist?
- Where are all controller errors ultimately caught and formatted?
- How does the frontend know if an API request failed due to validation or a database error?

## Intermediate Questions
- Why write a custom validator in `validation.middleware.js` instead of using external libraries like Joi, Yup, or Zod?
- How does `Error.captureStackTrace` work in `ApiError`? Why is it useful for debugging?
- What is the difference in middleware signature between a standard Express middleware and an error-handling middleware?
- In `validation.middleware.js`, how does the validator validate URL parameters vs request body parameters?
- What happens if an error is thrown inside a middleware that runs *before* the routes are loaded?

## Advanced Questions
- Explain how `asyncHandler` acts as a decorator pattern. Write it from memory.
- If a route controller throws a Mongoose cast error (invalid ObjectId), how does your centralized error middleware format it?
- Walk through what happens if the database connection falls offline mid-request. Trace the exception flow from the driver to the user.
- Why is it insecure to output the raw `err.stack` trace in production JSON responses? How does MockMate handle this between environments?
- What occurs when a Promise rejects and there is no catch handler in the route? How do you prevent the Node.js process from exiting?

## Staff-Level Questions
- Design a real-time error aggregation and alerting pipeline for MockMate (e.g., Sentry, Winston, Elasticsearch) that alerts developers of anomalies without degrading request processing times.
- How would you refactor `validation.middleware.js` to support nested object validation, async validation checks (e.g., querying database uniqueness inline), and custom sanitizers?
- Describe how you would build a fault-tolerant React Error Boundary hierarchy on the frontend that isolates page crashes and reports client telemetry back to the server.

## Questions About MY Implementation
- Why is `ApiResponse` structured to have fields `statusCode`, `data`, and `message`?
- How does `validation.middleware.js` check if a field is a valid MongoDB ObjectId?
- What would happen to an async controller error if the `asyncHandler` wrapper was omitted from a route?
- Why is the 404 handler registered *before* the error middleware? What happens if they are swapped?
- What assumptions were made about error logging levels in development?

## Follow-up Questions
- What breaks if you call `next()` with an argument that is not an instance of `Error`?
- How does the client's axios instance catch API validation errors? Trace the error model.
- Why does `asyncHandler` use `Promise.resolve(fn(...)).catch(next)` instead of try/catch block?
- How does Mongoose schema-level validation errors interact with your request validator middleware?

## Code Reading Questions
- Locate the code in `validation.middleware.js` that checks for custom validator functions (`validateFn`).
- Trace how `ApiError` captures the `errors` array in its constructor.
- Locate the centralized error-handling middleware block in `app.js` and trace what properties it sends in the response.
- In `validation.middleware.js`, locate how it checks type arrays (`rule.type === 'array'`).

## Debugging Questions
- An API endpoint returns `Internal Server Error` (500) but logs no stack trace. How do you trace where the exception occurred?
- The validation middleware throws a validation error for a missing field, even though the client sent the parameter in the body. Trace the payload parser check.
- You see `Cannot set headers after they are sent to the client` in the console. Trace the double-response bug.
- Validation checks are skipped completely on a route. What registration error occurred in the route wiring?

## Edge Cases
- Client sends a request body that is not valid JSON, causing the JSON parser middleware to throw an error before your validator runs.
- The validation schema defines a type check for `number`, but the client sends a numeric string (e.g., `"123"`).
- An error occurs inside the centralized error middleware itself.
- A request is aborted by the client mid-execution, causing database operations to throw write errors.

## Security Questions
- How do you prevent path traversal attacks in custom file validation rules?
- Why is validating input length limits critical in preventing Denial of Service (DoS) buffer attacks?
- What are the risks of exposing raw SQL/NoSQL driver exception messages to users?

## Performance Questions
- How does allocating new `Error` objects and stack traces on validation failures affect performance under heavy load?
- Is there any memory impact of holding stack traces in memory logs?

## Scalability Questions
- How would you handle centralized logging across 20 server instances? Outline a log shipping strategy.
- How would you implement a circuit breaker pattern to prevent cascading failures when third-party services fail?

## Trade-off Questions
- Custom schema validator (no dependencies, lightweight, manual maintenance) vs Zod library (heavy dependencies, robust validation, typescript support): discuss.
- Throwing exceptions (Express handles lifecycle) vs returning error objects in responses (no stack unwinding overheads).

## Refactoring Questions
- Refactor the validation schema structure to make it fully compatible with OpenAPI/Swagger specifications.
- Refactor the error middleware to translate mongoose unique constraint violations into clean 400 validation API errors.

## Whiteboard Questions
- Write the `asyncHandler` higher-order function.
- Draw a diagram showing the request-response lifecycle when a validation error occurs.

## Practical Coding Exercises
- Write a validation schema for a `/reset-password` endpoint that asserts both passwords match using a `validateFn`.
- Implement a logging middleware that logs request times, method, and status codes to a local log file, handling errors if the write fails.

## Revision Checklist
- [ ] I can write the `asyncHandler` wrapper from memory.
- [ ] I can describe the difference between normal Express middleware and error handling middleware.
- [ ] I can trace a validation error from validation schema check to JSON output.
- [ ] I can explain how stack traces are filtered depending on the `NODE_ENV` configuration.
- [ ] I can identify Mongoose validations vs application validation middleware.
