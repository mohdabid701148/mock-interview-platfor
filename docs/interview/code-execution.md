# Code Execution Engine (Judge0 Integration)

## Why this topic exists in MockMate
MockMate allows candidates to run code and execute test cases within the coding workspace. Instead of running untrusted code locally on the server (which is a massive security risk) or inside the user's browser, MockMate integrates with **Judge0 CE (Community Edition)** to securely compile and execute submissions in isolated environments.

## Where it is implemented
- [codeExecution.service.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/services/codeExecution.service.js) — Language mappings, base64 encoding helpers, LeetCode-style code-wrapping templates, submission dispatcher, status parsing, and test-cases runner.
- [codeExecution.controller.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/controllers/codeExecution.controller.js) — Rate-limiting validation, request structure schemas, maximum code size restrictions, and execution routes dispatcher.
- [codeExecution.routes.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/routes/codeExecution.routes.js) — Router registration with JWT validation and execution rate limiters.
- [TestCasePanel.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/components/editor/TestCasePanel.jsx) — Frontend interactive panel for adding, editing, and executing custom test cases.
- [CodeOutputPanel.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/components/editor/CodeOutputPanel.jsx) — Renders output stdout, compile errors, runtime errors, and execution metrics.

## Code Flow
1. **Request Reception**: User clicks "Run" → Axios submits code, language, and custom inputs/test-cases to `/api/v1/code/run` or `/test` → route-specific rate limiter (`codeExecutionLimiter`) checks capacity → `verifyJWT` checks authentication.
2. **Controller Validation**: Controller asserts code size is under 100KB, language is in the allowed list, and test cases count is within limits (max 10) → routes payload to the Service.
3. **Code Wrapping**: Service wraps code if language is Java or C++ (injects a helper `main` wrapper to ensure compilation succeeds without explicit user entry points) → base64-encodes code, stdin, and expected outputs.
4. **Judge0 Submission**: Sends POST request to Judge0 api endpoint `/submissions?base64_encoded=true&wait=true` with base64 payloads and headers -> receives execution status token.
5. **Output Parsing**: Service decodes the base64-encoded output fields (stdout, stderr, compile_output) → maps Judge0 status IDs (3: Success, 6: Compilation Error, 5/14: Timeouts, others: Runtime Error) to clean UI feedback models.

## Components involved
- Code execution controller, code wrapping modules, base64 utility library, Judge0 API integration client, test-cases evaluator, and UI results panel.

## Dependencies involved
- `axios` (API integration client), `express` (routing wrapper).

## Related modules
- [middleware.md](middleware.md) (uses validation/rate limiting), [rooms.md](rooms.md) (runs within room scope), [react-architecture.md](react-architecture.md) (editor workspace UI).

## Concepts I MUST Study
⚠️ Do not explain — only list.
- Remote Code Execution (RCE) vulnerabilities and defenses
- Containerization and sandboxing (e.g., Docker, gVisor, seccomp)
- Judge0 API submission cycle (Synchronous vs Asynchronous requests)
- Base64 encoding/decoding and transport formatting
- Code entry point requirements (C++ and Java wrappers)
- Execution timeouts, memory limits, and thread bounds
- REST timeouts vs asynchronous long-polling loops
- Rate limiting high-cost operations
- Input validation sanitization in system integrations
- Parsing raw stream outputs (stdout vs stderr vs compilation logs)

## Beginner Interview Questions
- What is Judge0 and how is it used in MockMate?
- Why do we base64-encode the source code and inputs before sending them to Judge0?
- What programming languages are currently supported by your execution routes?
- How is the code output presented on the frontend when it contains a compilation error?
- How does the candidate customize inputs for testing?

## Intermediate Questions
- Why do C++ and Java require code wrapping before execution, while JavaScript and Python do not?
- What does the parameter `wait=true` do in the Judge0 URL? What are the trade-offs of using it?
- How does MockMate handle rate-limiting for code executions to prevent server abuse?
- How does the service identify that an execution timed out? What status IDs does it look for?
- Why is there a 100KB size limit on submitted code payloads? How is it checked?

## Advanced Questions
- What happens if the Judge0 third-party API goes down or throttles your requests? How is this handled in the catch blocks?
- Explain the code wrapping logic for Java. What class structure does it output, and what class name does the JVM expect?
- Why is it unsafe to use `wait=true` on Judge0 if execution takes longer than 10 seconds? How would you refactor this to be fully asynchronous?
- Walk through how `executeWithTestCases` maps execution results to determine if a candidate's code passed or failed a test case.
- What security vulnerabilities exist if an attacker submits a massive input payload inside the custom stdin field?

## Staff-Level Questions
- Design a custom, highly secure, in-house code execution engine using Docker and gVisor to replace Judge0.
- How would you implement a queue-based asynchronous execution pool using RabbitMQ or BullMQ to handle thousands of concurrent test-run submissions?
- If we wanted to add support for interactive standard input (stdin) streams (like a live terminal session in the browser), how would you design the architecture using WebSockets and Judge0?

## Questions About MY Implementation
- Why is the `MAX_CODE_SIZE_BYTES` set to 100KB?
- Why are the Judge0 language IDs hardcoded in `LANGUAGE_IDS`?
- What was the reasoning behind setting the Judge0 API request timeout to 30,000ms?
- Why does `wrapCode` check for the presence of `#include` and `using namespace std` before prepending headers to C++ code?
- What would break if a candidate named their Java class something other than `Main`?

## Follow-up Questions
- What happens if a C++ submission uses `int main(int argc, char* argv[])`? Does the wrapper fail?
- Why does the `runTestCases` check limit the number of test cases to 10?
- How does the application prevent cross-site scripting (XSS) when rendering raw stdout outputs from Judge0?
- What breaks if you use a free/shared Judge0 instance that runs out of daily execution credits?

## Code Reading Questions
- Locate the base64-decoding helper `b64decode` and explain how it handles null/undefined inputs.
- In `codeExecution.service.js`, trace the `wrapCode` function for Java. What exact code does it append?
- Trace how `actualOutput` is verified against `expectedOutput` in `executeWithTestCases`.
- Find where the `codeExecutionLimiter` is registered in `rateLimiter.middleware.js` and list its configuration.

## Debugging Questions
- A user runs a Python script that goes into an infinite loop. What does Judge0 return, and how does your application map this status?
- The backend logs `ApiError: Code execution service temporarily unavailable`. What steps do you take to identify if it is a credentials, connection, or service outage?
- A Java file fails to compile, throwing `class Main is public, should be declared in a file named Main.java`. Trace the bug.
- Senders get 413 payloads error. Which limit in `app.js` is triggered?

## Edge Cases
- Code contains Unicode characters that corrupt during base64 encoding/decoding.
- User submits a code payload of exactly 99KB, but with a massive array of test cases.
- Candidate includes multiple classes in a Java submission.
- The expected output of a test case is blank, but the actual output contains trailing whitespace or newlines.

## Security Questions
- What prevents a candidate from writing code that reads local server files or environment variables on the execution server?
- Why is it critical that execution routes require a valid JWT check?
- What mechanisms prevent resource-exhaustion attacks (fork bombs, CPU loops) from crashing the execution containers?

## Performance Questions
- Why do synchronous Judge0 calls (`wait=true`) decrease the throughput of the Node Express application?
- How does Promise.all in `executeWithTestCases` improve execution latency for multiple test runs? What are the server side limits?

## Scalability Questions
- If multiple interview rooms run test cases simultaneously, how does the API handle concurrency bottlenecks?
- How would you cache compilation outcomes for identical, unmodified user code to optimize speed?

## Trade-off Questions
- Synchronous wait (simpler client, high HTTP connection holds) vs Asynchronous polling (complex client, lower resource holds): discuss.
- Auto-wrapping LeetCode style functions vs forcing candidates to write main entry points: trace usability vs parsing errors.

## Refactoring Questions
- Refactor the code execution service to use a builder pattern for compiling multi-file project structures.
- Decouple the code-wrapping logic into a separate utility class with unit tests.

## Whiteboard Questions
- Draw a flowchart showing the state transitions of a code execution request from user click to output rendering.
- Design a schema for tracking historical execution metrics (runtimes, memory, failures) across all users.

## Practical Coding Exercises
- Implement a code executor parser that scans code for banned system commands (like `child_process`, `fs`, `eval`) before sending it to the executor.
- Write a mock server using Express to stub the Judge0 API for unit testing of the backend execution controller.

## Revision Checklist
- [ ] I can trace a code execution request from the frontend to Judge0 and back.
- [ ] I can describe the base64 encoding transport pipeline.
- [ ] I can explain the code wrapping rules for compiled languages like C++ and Java.
- [ ] I can justify the rate-limiting and validation limits applied to code routes.
- [ ] I can explain how Judge0 status IDs are converted to application states.
