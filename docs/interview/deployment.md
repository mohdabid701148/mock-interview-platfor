# Deployment, CORS, & Environments

## Why this topic exists in MockMate
Deployment, environment configuration, and Cross-Origin Resource Sharing (CORS) setup bridge development code and production systems. MockMate splits its layout across host providers (Vercel for React frontend, Render for Express/Socket.IO backend), requiring robust CORS handshakes, secure cookie routing, trust proxies, and environmental secret parameters.

## Where it is implemented
- [app.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/app.js) — Trust proxy initialization, Helmet CSP options, CORS origin limits, and cookie settings.
- [socket.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/config/socket.js) — Allowed origins extractor mapping CORS to Socket.IO.
- [axios.js](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/api/axios.js) — Production vs development backend base URL mappings.
- [vercel.json](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/vercel.json) — Frontend deployment routes overrides, headers, and SPA redirect rules.
- [.env.example](file:///c:/padhai/mockmate/mock-interview-platfor/backend/.env.example) / [frontend/.env.example](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/.env.example) — Blueprints for environmental configuration parameters.

## Code Flow
1. **Bootstrap Check**: During startup, backend reads environment variables (`PORT`, `MONGODB_URI`, `CORS_ORIGIN`, etc.) via `dotenv`.
2. **CORS Validation**: Browser makes a preflight `OPTIONS` request to backend → Express CORS middleware checks `req.header('Origin')` against `process.env.CORS_ORIGIN` → if valid, returns matching `Access-Control-Allow-Origin` and `Access-Control-Allow-Credentials: true` headers.
3. **Socket Origin Extraction**: Socket.IO initializer parses comma-separated allowed origins → configures its own CORS configurations -> accepts/rejects WebSockets handshakes accordingly.
4. **Proxy Forwarding**: Render routing servers forward incoming traffic to the Node.js process → `app.set("trust proxy", 1)` configures Express to trust the `X-Forwarded-For` and `X-Forwarded-Proto` proxy headers, validating secure cookies and rate limits.

## Components involved
- Environment loader, Express proxy config, CORS headers validator, Socket.IO CORS configuration, Helmet security configurations, Vercel SPA router config.

## Dependencies involved
- `cors` (CORS headers), `dotenv` (env loader), `helmet` (security headers), `express`.

## Related modules
- [cookies-and-token-storage.md](cookies-and-token-storage.md) (secure proxy cookies), [sockets.md](sockets.md) (socket origins), [security.md](security.md) (helmet CSP).

## Concepts I MUST Study
⚠️ Do not explain — only list.
- Cross-Origin Resource Sharing (CORS) preflight request cycle (`OPTIONS`)
- CORS credentials and credential sharing constraints
- Forward and Reverse Proxy routing (Render / AWS ALBs)
- SPA routing fallback rules (`vercel.json` rewrites)
- Environment variable separation and at-rest encryption
- HTTPS handshake, SSL termination, and headers (`X-Forwarded-Proto`, `X-Forwarded-For`)
- Content Security Policy (CSP) options and constraints
- Cold Start latency on serverless/free-tier PaaS environments
- Infrastructure-as-Code (IaC) vs deployment dashboards
- CI/CD pipelines and deployment previews

## Beginner Interview Questions
- Where is the frontend hosted vs the backend hosted in MockMate?
- What are environment variables and why do we use `.env` files?
- What is CORS? Why does the browser block requests without proper CORS headers?
- What happens if the `CORS_ORIGIN` environment variable is missing on the server?
- Why is it unsafe to commit `.env` files to Git?

## Intermediate Questions
- Why does `app.js` call `app.set("trust proxy", 1)`? What breaks if this is missing on Render?
- What does the setting `credentials: true` accomplish in the CORS middleware options?
- Why does Vercel require a `vercel.json` file with rewrites mapping to `index.html`?
- How does Socket.IO's CORS setup extract allowed origins in `socket.js`?
- What is a Render cold start? How does it affect initial database or API queries?

## Advanced Questions
- Explain how Helmet's `contentSecurityPolicy` parameters are customized in `app.js` to ensure compatibility with Monaco Editor CDN resources and Socket.IO connections.
- If CORS origin allows multiple domains, why can't we use wildcard `Access-Control-Allow-Origin: *` when `Access-Control-Allow-Credentials` is set to `true`? How does MockMate solve this?
- How would you secure cookies across subdomain architectures (e.g., frontend on `app.domain.com` and backend on `api.domain.com`)?
- Walk through what happens when a preflight `OPTIONS` request fails. What headers are missing, and how do you trace it?
- How does the application detect if it is running in development vs production modes? Detail the environment overrides.

## Staff-Level Questions
- Design a CI/CD build pipeline for MockMate using GitHub Actions that automates linting, testing, Docker image building, and blue-green deployments to AWS ECS.
- How would you configure a Cloudflare CDN layer in front of the Vercel app and Render API, detailing custom page rules for WebSockets and DDoS protections?
- Outline how you would set up a multi-region active-active deployment for the MockMate API, explaining database replications and WebSocket session bindings.

## Questions About MY Implementation
- Why is `process.env.CORS_ORIGIN` split and mapped to multiple origins in `socket.js`?
- Why does `axios.js` check `import.meta.env.VITE_API_URL` to determine the API base URL?
- What would happen if a deployment had mismatching Access Token secrets between the backend and Socket.IO handshakes?
- Why does the Helmet configuration disable `crossOriginEmbedderPolicy`?
- What assumptions were made about the URL format when parsing allowed origins?

## Follow-up Questions
- What breaks if Render changes the backend instance IP address? Does DNS routing update automatically?
- Why is Vercel's default routing behavior a problem for React Router SPA routes?
- How does it fail if `NODE_ENV` is set to development in a production container?
- What happens if an API call is made to HTTP instead of HTTPS in production?

## Code Reading Questions
- Locate the CORS origin configurations in `app.js`.
- In `vercel.json`, identify the exact rewrite block that forwards all requests to `/index.html`.
- Trace the `getAllowedOrigins` function in `socket.js`. What fallback does it use?
- Locate where Helmet is registered in `app.js` and trace the `connectSrc` whitelist.

## Debugging Questions
- A user receives a console error: `Access to XMLHttpRequest at 'api' from origin 'frontend' has been blocked by CORS policy`. What lines in the backend do you debug?
- The backend logs `express-rate-limit` keying every request to the proxy's IP instead of the client's. What setting is missing?
- React page reloads show a Vercel 404 page. Trace what went wrong in `vercel.json`.
- Environment variables set in Render dashboard aren't loaded. What code block could have failed?

## Edge Cases
- Client connects from a browser behind a strict corporate proxy that strips custom headers.
- Multiple CORS domains are configured, but one contains a trailing slash, breaking origin matches.
- Deploying the app on a domain that uses non-standard ports (e.g., `app.domain.com:8443`).
- Render terminates the Node instance mid-transaction due to resource threshold violations.

## Security Questions
- How do you protect environment variables from being exfiltrated via diagnostic logs?
- Why is the Content Security Policy (CSP) critical in preventing XSS injections from CDNs?
- Is it secure to set CORS origins to reflect the incoming request origin directly? Trace the risks.

## Performance Questions
- How does the preflight CORS cache `Access-Control-Max-Age` optimize network request speeds?
- What is the CPU impact of running rate-limiting middleware globally vs route-specific?

## Scalability Questions
- If we migrate from Render to Kubernetes, how do we manage routing configurations, secrets, and environment variables?
- How would you manage CORS origins dynamically if MockMate allows white-labeled custom domains for enterprise customers?

## Trade-off Questions
- Host-level separation (Vercel + Render) vs monolithic deployment (serving frontend static files from Express backend): trace the tradeoffs.
- Strict CSP configurations (safer, breaks third-party assets) vs lax rules (vulnerable, easy integrations).

## Refactoring Questions
- Refactor the backend configuration to use a unified configuration class that validates all environment variables on boot.
- Add a script that validates Vercel and Render deploy configurations before pushing commits.

## Whiteboard Questions
- Draw the deployment architecture diagram of MockMate, detailing load balancers, proxies, hosting platforms, and DB instances.
- Write the HTTP headers exchange showing a successful CORS preflight check.

## Practical Coding Exercises
- Write a node script that checks if all keys in `.env.example` exist in the local `.env` file, throwing an error if any are missing.
- Configure a Github workflow configuration file that runs ESLint and Vite build checks on pull requests.

## Revision Checklist
- [ ] I can explain the CORS preflight OPTIONS request sequence and headers.
- [ ] I can describe the purpose of `trust proxy` and how proxies affect rate-limiting and cookies.
- [ ] I can justify the deployment split between Vercel and Render.
- [ ] I can detail how Helmet is configured and why it is critical for SPAs.
- [ ] I can explain how environment variables are set and validated across platforms.
