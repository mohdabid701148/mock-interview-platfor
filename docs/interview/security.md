# Security, Encryption, & Rate Limiting

## Why this topic exists in MockMate
As an online interview platform, MockMate must secure user data, prevent execution of malicious code, guard endpoints against brute-force/DDoS attempts, and protect sessions from interception. It employs hashing algorithms (bcrypt, SHA-256), rate limiters keyed by IP or user parameters, cross-site scripting (XSS) filters, secure cookie options, and token scopes.

## Where it is implemented
- [User.model.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/models/User.model.js) — Bcrypt password hashing pre-save hooks, SHA-256 hashing for email verification tokens, and verification code expiry limits.
- [rateLimiter.middleware.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/middlewares/rateLimiter.middleware.js) — Limiters for global traffic (`generalLimiter`), auth paths (`authLimiter`), room/schedules (`roomScheduleLimiter`), code submissions (`codeExecutionLimiter`), email resends (`resendVerificationLimiter`), and code entries (`verifyCodeLimiter`).
- [app.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/app.js) — Helmet CSP headers configuration, CORS limits, trust proxy settings, and JSON body limits (150KB maximum size to block buffer overflows).
- [rehype-sanitize](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/package.json) — Frontend HTML sanitization library preventing XSS during markdown question rendering.

## Code Flow
1. **Hashing (Bcrypt)**: Register/Update → Mongoose detects password modification → pre-save hook invokes `bcrypt.hash` with 10 salt rounds → stores hash.
2. **Token Security (SHA-256)**: Resend/Verify Email → server generates random 6-digit integer code → hashes code using Node's `crypto` SHA-256 engine → stores SHA-256 hash in DB → sends raw code via Brevo. Verification matches SHA-256 of candidate input against DB hash.
3. **Traffic Shielding**: Request hits backend proxy → Express Rate Limit middleware evaluates rate parameters:
   - `authLimiter` limits IP attempts on registration/login paths.
   - `resendVerificationLimiter` limits attempts keyed by lowercase target email address (not IP) to block spamming third parties.
   - `codeExecutionLimiter` blocks DDoS runs on Judge0 APIs.
4. **XSS Protection**: Frontend fetches interview question markdown -> parses markdown with `react-markdown` -> filters tags using `rehype-sanitize` to drop malicious scripts.

## Components involved
- Bcrypt hash comparing, crypto hashing, Helmet configuration, rate-limit builders, request size monitors, and XSS sanitizers.

## Dependencies involved
- `bcrypt` (password hashing), `crypto` (native SHA-256), `express-rate-limit` (middleware), `rehype-sanitize` (markdown filter), `helmet` (HTTP headers).

## Related modules
- [authentication.md](authentication.md) (auth pathways), [cookies-and-token-storage.md](cookies-and-token-storage.md) (cookie attributes), [code-execution.md](code-execution.md) (executor limits).

## Concepts I MUST Study
⚠️ Do not explain — only list.
- Bcrypt adaptive hashing, salt rounds, and side-channel timing defenses
- Cryptographic hash functions vs passwords hashing (SHA-256 vs Bcrypt)
- Cross-Site Scripting (XSS) and Content Security Policy (CSP) headers
- Cross-Site Request Forgery (CSRF) and SameSite cookie options
- Rate limiting algorithms (Token bucket, Sliding window logs)
- IP-based rate limiting vs parameter-based (e.g., email-keyed limits)
- Denial of Service (DoS) and Distributed DoS mitigation strategies
- Input validation, SQL/NoSQL injection, and request payload controls
- Broken Object-Level Authorization (BOLA/IDOR) protection models
- Hashing at Rest vs Encryption in Transit

## Beginner Interview Questions
- How are passwords encrypted before saving to the database?
- What is rate limiting and why does MockMate implement it?
- Why do we restrict JSON requests to a maximum size of 150KB?
- What security headers are added to backend responses by default?
- How is the email verification code protected in the database?

## Intermediate Questions
- Why is it better to rate limit the `resend-verification` endpoint by email rather than by IP address?
- What is the difference in security properties between SHA-256 and Bcrypt? When do you use each?
- How does `rehype-sanitize` protect the workspace if an interviewer attaches a question with malicious `<script>` tags?
- How does `express-rate-limit` calculate rate allocations when the server is deployed behind a proxy like Cloudflare or Render?
- What is a timing attack, and how does bcrypt defend against it during password comparisons?

## Advanced Questions
- What happens if the `authLimiter` is keying by IP and multiple users connect from the same NAT (e.g., a university campus or corporate office)? How do you prevent blocking legitimate traffic?
- Walk through how storing the access token in-memory and refresh token in a cookie affects CSRF. Why does the `/refresh-token` endpoint require credentials sharing, and what CSRF exposures exist on it?
- Explain the CSP rules set in your Helmet config. Why is `'unsafe-eval'` required for Monaco Editor to run inside the React page? What risks does this introduce?
- If an attacker compromises the Mongoose database, what prevents them from brute-forcing the SHA-256 verification codes to verify dummy accounts?
- How does the application prevent NoSQL injection if a user submits a query dictionary parameter instead of a string email?

## Staff-Level Questions
- Design a real-time, distributed rate-limiting infrastructure for MockMate using Redis sliding window logs to synchronize request limits across 10 API nodes.
- How would you implement a Web Application Firewall (WAF) rule matrix to protect MockMate from OWASP Top 10 vulnerabilities (SQLi, XSS, CSRF, BOLA) at the gateway layer?
- Describe how you would build a secure sandboxing pipeline for user-submitted code executions that blocks network egress, disk rights, and excessive CPU allocations.

## Questions About MY Implementation
- Why is the bcrypt cost factor set to 10? Why not 12 or 14? What is the server performance impact?
- Why is `verifyCodeLimiter` limited to 10 attempts per 15 minutes, while `resendVerificationLimiter` is limited to 3 per hour?
- What would happen to password checks if the pre-save hook ran `bcrypt.hash` every time `user.save()` was called, regardless of password changes?
- Why does the `authLimiter` bypass check paths `/current-user` and `/refresh-token`?
- What assumptions were made about the security level of the email delivery service (Brevo)?

## Follow-up Questions
- What breaks if we disable Helmet middleware entirely in development?
- Why does Mongoose use `bcryptjs` as a fallback in package dependencies? What are the speed differences?
- How does the system handle password resets? Is the reset token hashed similarly?
- How does it fail if a user tries to run a brute-force script on the `/verify-email` endpoint?

## Code Reading Questions
- In `User.model.js`, locate where bcrypt hashes the password.
- Trace the `keyGenerator` options defined for `resendVerificationLimiter` in `rateLimiter.middleware.js`.
- In `app.js`, trace the `express.json` parser middleware configuration and locate its size restriction.
- Find the `isPasswordCorrect` method on the user schema.

## Debugging Questions
- Users on a corporate network report getting `429 Too Many Requests` on their first login attempt. Where do you start debugging?
- A penetration tester reports that your registration page is vulnerable to account enumeration. What code changes must you apply?
- You see `ValidationError: password validation failed` on user save, but the string is 8 characters long. Trace the Mongoose validator.
- Sockets throw auth exceptions in production. What CORS, WebSocket protocol, or SSL configuration mismatches occurred?

## Edge Cases
- Attacker registers a user with a password that is 10,000 characters long to cause CPU exhaust during bcrypt hashing.
- Same email address requests verification code resends from multiple IPs simultaneously.
- Code execution is triggered by a client who has bypassed rate limiters via proxy header spoofing.
- The system time drifts on the server, causing verification code expirations to trigger prematurely.

## Security Questions
- How does MockMate defend against Broken Object Level Authorization (BOLA/IDOR) in the feedback retrieval routes?
- Why is it insecure to use `md5` or `sha1` for password hashing?
- Are JWT secrets encrypted at rest in the deployment environment? What is the impact if they leak?

## Performance Questions
- How does the computational overhead of Bcrypt comparisons affect API latency under concurrent login attempts?
- What is the memory footprint of storing rate limit keys in Node's RAM compared to Redis?

## Scalability Questions
- If MockMate scale to millions of accounts, how do we handle bcrypt overhead during logins without overloading API servers?
- How would we handle DDOS mitigation if the rate-limit database becomes a single point of failure?

## Trade-off Questions
- Native Bcrypt (fast, requires node-gyp compilation) vs BcryptJS (pure JS, slow, highly portable): discuss the choice.
- Strict rate limits (protects server, blocks heavy users) vs loose limits (bad protection, good UX).

## Refactoring Questions
- Refactor the rate limiters to dynamically adjust thresholds based on server load averages.
- Implement a hashing helper service that abstracts bcrypt and SHA-256 calls.

## Whiteboard Questions
- Write the rate limiting middleware function from scratch using an in-memory token bucket algorithm.
- Draw a schematic showing how XSS scripts exploit the DOM and how sanitization blocks them.

## Practical Coding Exercises
- Implement a middleware that checks if incoming requests contain NoSQL injection patterns (like `$` operators) and filters them.
- Write a test script that attempts to guess a user's password 50 times and verifies that the `authLimiter` blocks the requests after the 30th attempt.

## Revision Checklist
- [ ] I can explain why bcrypt is preferred for passwords and trace its cost parameters.
- [ ] I can describe why email verification tokens must be hashed in the database.
- [ ] I can detail how rate limiters are configured, keyed, and bypassed in MockMate.
- [ ] I can explain how to prevent NAT blocking when using IP-based rate limiting.
- [ ] I can justify the JSON body limits and trust proxy configurations.
 mayoral actions.
