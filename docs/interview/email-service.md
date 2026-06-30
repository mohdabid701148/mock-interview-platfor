# Email Service & Brevo Integration

## Why this topic exists in MockMate
MockMate requires email verification to activate new user registrations and secure accounts. To deliver transaction emails reliably, MockMate uses **Brevo (formerly Sendinblue)** via its **transactional HTTP API**. This choice bypasses outgoing SMTP blockages standard on cloud platforms (like Render), uses an exponential backoff retry loop, and enforces verification limits.

## Where it is implemented
- [email.service.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/services/email.service.js) — Core email service, Brevo HTTPS connection post utility (`postToBrevo`), transient-failure retry configurations, sender parsing, and verification template dispatchers.
- [emailTemplates.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/utils/emailTemplates.js) — Verification template wrapper outputting both HTML and raw text formats.
- [auth.controller.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/controllers/auth.controller.js) — Registration and code-resend flows invoking email service calls.
- [rateLimiter.middleware.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/middlewares/rateLimiter.middleware.js) — Resend limits keyed by email to protect transactional quotas.

## Code Flow
1. **Trigger**: User registers or requests verification code → `auth.controller` calls `sendVerificationEmail` with recipient, username, and 6-digit code.
2. **Setup**: Email service loads environment settings (`BREVO_API_KEY`, `EMAIL_FROM`) → parses sender name/email -> calls templates to generate HTML/text payloads.
3. **HTTP Send Loop**: `postToBrevo` opens a fetch transaction loop (configured for max 2 retries):
   - Sets a 15-second timeout controller (`AbortController`).
   - Dispatches a POST to `https://api.brevo.com/v3/smtp/email` passing payload and headers.
4. **Transient Check**: If fetch yields a transient status (429, 5xx) or times out, the service pauses (500ms * attempt offset) and retries. Permanent failures (4xx) throw immediately.
5. **Completion**: If successful, logs message ID and returns response metrics to controller.

## Components involved
- Transactional API connector, template parsing engine, retry loop controller, email rate controller, and route managers.

## Dependencies involved
- `node-fetch` (or native global `fetch`), Brevo SMTP API, environment variables.

## Related modules
- [authentication.md](authentication.md) (account activation), [security.md](security.md) (rate-limiting send requests), [error-handling.md](error-handling.md) (errors classification).

## Concepts I MUST Study
⚠️ Do not explain — only list.
- HTTP API email delivery vs SMTP transport protocols
- Outbound port blockages (587, 465, 25) in cloud PaaS platforms (Render, Heroku)
- Transient vs Permanent API errors (Status code boundaries)
- Retry strategies: Linear backoff, Exponential backoff, Jitter
- `AbortController` and fetch timeout patterns in Node.js
- HTML email formatting guidelines (Inlined styles, tables, table nesting)
- SPF (Sender Policy Framework), DKIM (DomainKeys Identified Mail), and DMARC verification
- Email rate limits and reputation scores
- Asynchronous queuing vs inline thread blockage for email operations

## Beginner Interview Questions
- Why does MockMate need an email service?
- What external email provider is integrated into MockMate?
- Why do we send emails via an HTTP API instead of SMTP?
- What happens if a user inputs an invalid email format during registration?
- What template format is used for account verification emails?

## Intermediate Questions
- Why is it necessary to have both an HTML version and a plain-text version of the email template?
- Explain the transient error detection logic in `postToBrevo`. What HTTP status codes trigger a retry?
- Why is a timeout of 15 seconds set using `AbortController`? What happens if the API takes longer to respond?
- How is the `EMAIL_FROM` environment variable parsed into name and email properties for Brevo?
- What happens if the `BREVO_API_KEY` is not configured on startup? Does the server crash?

## Advanced Questions
- Walk through the retry logic loop in `postToBrevo`. How does the delay change between retries?
- Why is the resend-verification endpoint rate-limited by email parameter instead of by client IP? What abuse vector does this prevent?
- If the email service throws a `502 Bad Gateway` error, how does the user registration controller respond? Does the user account still get created?
- What DNS records (SPF, DKIM, DMARC) must you configure in your custom domain to prevent MockMate emails from landing in spam folders?
- How does inline request email sending affect API controller latency? How would you optimize this?

## Staff-Level Questions
- Design an asynchronous email worker pipeline using Redis/BullMQ to offload email tasks from the Express request thread.
- How would you implement a multi-provider fallback strategy (e.g., if Brevo fails, send via SendGrid or Mailgun automatically) without duplicate email deliveries?
- Detail how you would track email delivery statuses, open rates, and bounce events using Brevo webhooks and route handlers.

## Questions About MY Implementation
- Why is the maximum number of retries set to 2 in `postToBrevo`? What are the trade-offs?
- Why does the `parseSender` function fall back to `no-reply@mockmate.app`?
- What would break in the email service if the Brevo API URL format changed from `/v3/smtp/email`?
- Why is email sending kept inside the main request block during registration instead of being run asynchronously?
- What assumptions were made about the delivery status in `sendVerificationEmail`?

## Follow-up Questions
- What breaks if we don't clear the `AbortController` timeout timer?
- What happens if the recipient's mail server rejects the incoming email? Does Brevo return a 400 or does it bounce later?
- Why are email templates stored as JavaScript templates instead of raw HTML files?
- How does the resend-verification limiter reset its attempt counts?

## Code Reading Questions
- Locate the `postToBrevo` function in `email.service.js` and trace the retry delay calculation.
- In `emailTemplates.js`, find where the verification code is injected into the HTML.
- Find the `parseSender` regex match block and explain how it separates names from emails.
- In `auth.controller.js`, locate the `resendVerification` call to the email service.

## Debugging Questions
- The console outputs `[email] BREVO_API_KEY not set — email sending is disabled...`. How do users verify their accounts in this state?
- A registration fails because Brevo returns `401 Unauthorized`. Where do you fix this credential error?
- Emails are sending, but some clients receive corrupted HTML. How do you trace template issues?
- The backend logs `AbortError: The user aborted a request`. How do you identify if this is a Brevo network issue or a short timeout?

## Edge Cases
- Candidate registers with an email address that is valid in format but has no active mail server (invalid MX record).
- Two simultaneous registration requests for the same email trigger concurrent email send calls.
- The Brevo API key is rotated while the Express backend is running.
- A user submits a verification request while the database is locked, but the email has already been sent.

## Security Questions
- How do you prevent attackers from using your resend-verification route to bomb a victim's email inbox?
- Why is it critical that the raw verification code is only sent in the email body and not returned in the API response?
- How do you verify that headers injected into email templates do not result in SMTP injection attacks?

## Performance Questions
- How does holding an API connection open for 15 seconds during email attempts affect server resource footprints?
- What is the latency overhead difference between sending emails via transactional template API vs compiling HTML on the server?

## Scalability Questions
- If MockMate needs to send 1,000,000 emails per day, how does the direct fetch API model hold up compared to an SQS queue?
- How do you manage rate limits imposed on your API key by your email provider tier?

## Trade-off Questions
- HTTP API (easy fire-and-forget, platform compatible) vs SMTP (standard, universal integration support): trace the tradeoffs.
- Synchronous email blocks (ensures email is sent before account confirmation) vs Asynchronous queue (immediate UI response, email could fail silently).

## Refactoring Questions
- Refactor the email service to use the official Brevo SDK instead of raw node fetch operations.
- Extract the verification email template code into an external HTML template loading module.

## Whiteboard Questions
- Draw the flow of a user registration transaction, showing the points of contact between Client, Server, DB, and Brevo API.
- Write a pseudocode function that executes a fetch call with retry-backoff logic.

## Practical Coding Exercises
- Implement a route `/api/v1/admin/email-status` that checks the health of the Brevo API connection and reports credentials status.
- Write a test script that stubs the `postToBrevo` function using MSW or Sinon to verify that the registration controller behaves correctly when email delivery fails.

## Revision Checklist
- [ ] I can explain why transactional HTTP APIs are preferred over SMTP on PaaS hosts like Render.
- [ ] I can trace the retry loop and timeout configuration in `postToBrevo`.
- [ ] I can describe SPF, DKIM, and DMARC and explain why they are critical for email delivery.
- [ ] I can justify the resend rate limit settings in `rateLimiter.middleware.js`.
- [ ] I can explain the formatting differences required for HTML email layouts.
