# Deployment & Environment Variables

## Why this topic exists in MockMate
Deployment and environment configuration manage how the frontend React client builds and runs across multiple staging/production domains. MockMate uses **Vite** as its build engine, parses variables using specific meta environments, runs styling compilers, and deploys to **Vercel** with custom routing rules to support client-side Single Page Application (SPA) routing.

## Where it is implemented
- [vite.config.js](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/vite.config.js) — Vite build pipeline, React plugin registration, and Tailwind compiler bindings.
- [vercel.json](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/vercel.json) — Routing rewrites mapping all SPA paths to `index.html` to prevent Vercel 404 errors.
- [.env.example](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/.env.example) — Blueprint for client environment settings.
- [axios.js](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/api/axios.js) — Reads environment variables dynamically to target APIs.
- [SocketContext.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/context/SocketContext.jsx) — Reads variables to target Socket servers.

## UI Flow
Vite compiles and registers environment variables before deploying static assets.
Vite compile process starts `npm run build`
↓
Parses local `.env` variables prefixed with `VITE_`
↓
Injects variables into build bundles using `import.meta.env`
↓
Vercel pulls build static files (JS, CSS, HTML)
↓
Client loads app in browser
↓
Axios reads `import.meta.env.VITE_API_URL` to target backend APIs
↓
If user reloads `/dashboard` route, Vercel router checks `vercel.json` rewrite rules
↓
Vercel server returns `/index.html` instead of a 404 error
↓
React Router parses path locally and mounts page dashboard layout

## Components Involved
- Root pages, Axios services, Socket.IO context wrapper, Vercel hosting rules.

## Hooks Used
- Built-in hooks: `useEffect`.

## Dependencies Used
- `vite` (build engine), `@vitejs/plugin-react` (React plugin).

## Related Modules
- [react-architecture.md](react-architecture.md), [routing.md](routing.md), [deployment.md](file:///c:/padhai/mockmate/mock-interview-platfor/docs/interview/deployment.md) (backend deployment configurations).

## Concepts I MUST Study
⚠️ List only.
- Client-side build compiling vs Server-side runtime environments
- SPA routing fallback mechanisms on server hosts
- Environment variable injection rules in Vite (`VITE_` prefix security checks)
- Tree shaking and assets minification
- Cache control and assets hashing in production builds
- CORS (Cross-Origin Resource Sharing) origins from the frontend perspective
- SSL/TLS handshakes and routing protocols (HTTPS vs WebSockets)
- Vercel routing configuration parameters (rewrites, headers, redirects)
- Content Delivery Network (CDN) caching optimization strategies

## Beginner Interview Questions
- Where is the MockMate React frontend deployed?
- What tool does MockMate use to bundle and compile its frontend assets?
- How do you declare environment variables in a Vite project?
- What prefix must be prepended to environment variables in Vite? Why?
- How is the API URL configured dynamically for local vs production environments?

## Intermediate Questions
- Why does MockMate need a `vercel.json` file? What problem does it solve when a user refreshes the page on `/rooms`?
- What is the difference between `import.meta.env` in Vite and `process.env` in Create React App (CRA)?
- Explain what happens to your environment variables when the React application is built for production. Are they hidden from the client?
- Why do frontend assets built by Vite have hashes in their filenames (e.g. `index-a1b2c3d4.js`)?
- How does the frontend handle connecting to Socket.IO using different URLs in local development vs staging deployments?

## Advanced Questions
- Walk through how you would configure Vercel to support separate environment deployments for preview branches (pull requests) vs production commits.
- If a client-side environment variable is modified in production, does it update dynamically or does the frontend require a rebuild? Explain the build-time injection process.
- What headers would you configure inside `vercel.json` to enforce strict Security Headers (like HSTS, X-Frame-Options, X-Content-Type-Options) on frontend assets?
- How does Vite's assets chunking work? How would you configure `vite.config.js` to split Monaco Editor assets into a separate JavaScript bundle?
- Discuss the security risks of putting sensitive API keys (like email provider secrets) in the frontend `.env` configuration file.

## Staff-Level Questions
- Design a zero-downtime, canary deployment pipeline for MockMate using Vercel routing configurations and feature flags to roll out UI features incrementally.
- How would you manage environment variable injections if MockMate was deployed as a containerized Docker asset serving static files via Nginx?

## Questions About MY Implementation
- Why did you choose Vite instead of Create React App (CRA) or Webpack for MockMate?
- What would break in the application if `VITE_API_URL` was registered without the `VITE_` prefix?
- Why is `vercel.json` configured with `source: "/(.*)"` and `destination: "/index.html"`? Trace what paths this rewrites.
- Why is the development server configured to run on port `5173` by default?
- What assumptions were made about the protocol headers (HTTP vs HTTPS) when reading the API URL environment setting?

## Follow-up Questions
- Why? What breaks if Vercel attempts to load `/rooms/:roomCode` as a direct server directory?
- What happens if the backend CORS configuration does not match the Vercel app domain name?
- How does Vite optimize development build times using ES modules?
- What happens to environmental settings if you compile the app locally and upload the dist folder manually?

## Code Reading Questions
- In `vite.config.js`, locate the plugins configuration list.
- Locate the `vercel.json` file and trace the rewrites settings block.
- Trace how `import.meta.env.VITE_API_URL` is parsed inside `axios.js`.
- Trace the `SOCKET_URL` evaluation inside `SocketContext.jsx`.

## Debugging Questions
- Visiting the production URL works, but reloading the page shows a Vercel 404 page. Trace the missing `vercel.json` rewrite settings.
- The console logs `VITE_API_URL is undefined` in production. Trace if the Vercel dashboard environment variables are missing.
- The build fails in CI with out of memory errors. Trace how to configure Vite chunk limits.
- Backend calls fail due to mixed content warnings. Identify if the API URL was configured as HTTP while the frontend is HTTPS.

## Edge Cases
- Deployed frontend attempts to make requests to a local API URL because the environment file failed to compile correctly.
- Vercel experiences a DNS routing issue, blocking scripts from loading.
- Client browser caches an old version of the JavaScript index bundle, mismatching newer socket event payloads.
- Environment keys contain spaces or invalid characters.

## Security Questions
- How do you prevent sensitive environment variables from leaking into production public Git commit history?
- Why is it critical to ensure that CORS requests do not accept wildcards when credentials sharing is enabled?

## Performance Questions
- How does the Gzip compression option in Vercel optimize page loading speeds for candidates?
- What is the bundle size impact of importing the entire `lucide-react` icon library vs importing specific icons?

## Scalability Questions
- How do you manage frontend routing redirects when scaling to support dynamic, custom domain mappings?
- How would you structure the Vite configuration if the frontend workspace was split into separate sub-apps?

## Trade-off Questions
- Serverless static hosting (Vercel, simple, fast) vs Custom Nginx servers (fully customizable, routing control, maintenance overhead).
- Environment variables in code files (accessible, insecure) vs fetching client configurations via API endpoints (secure, network latency overhead).

## Refactoring Questions
- Refactor the Vite configuration to compile separate production bundles for mobile views vs desktop views.
- Write a pre-build shell script that asserts all keys in `.env.example` are defined in the deployment environment.

## Whiteboard Questions
- Draw the build and deployment pipeline showing how code commits travel to Vercel and how environment settings inject.
- Design the network headers routing pathway when a user requests a path under a reverse proxy.

## Practical Coding Exercises
- Implement a Vercel routing configuration rule that redirects all old `/session/:id` paths to the new `/rooms/:id` routes.
- Write a configuration module `config.js` that exports environmental variables with type checking and default fallbacks.

## Revision Checklist
- [ ] I can explain why Vercel requires routing rewrites for SPA apps.
- [ ] I can describe the build-time injection process of environment variables.
- [ ] I can detail why the `VITE_` prefix is required by the Vite compiler.
- [ ] I can justify the choice of Vite over Webpack.
- [ ] I can trace API URLs from environment variables to Axios instances.
