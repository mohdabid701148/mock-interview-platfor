# React Architecture

## Why this topic exists in MockMate
MockMate is built as a single-page application (SPA) using React 19 to provide a smooth, desktop-like user experience. React manages the component tree, state synchronization, local caching, collaborative views, and dynamic transitions. Understanding this core architecture is critical to explain how rendering updates coordinate and how data maps through the frontend client.

## Where it is implemented
- [main.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/main.jsx) — Entry point bootstrap wrapping the DOM render node.
- [App.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/App.jsx) — Route tree configuration, providers stack, and background location overlay modal registrations.
- [index.css](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/index.css) — Styling definitions and CSS variables root.
- [vite.config.js](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/vite.config.js) — Build configuration and plugins.

## UI Flow
User interaction triggers visual state transitions.
User Enters URL / Clicks Link
↓
React Router intercept
↓
App.jsx routes match
↓
Protected Route evaluation
↓
Auth Context verify (if protected)
↓
Page Component mounts
↓
Axios fetch (e.g. getUserRooms) / Socket connect
↓
Response updates Local State
↓
React Virtual DOM diffing
↓
DOM repaints
↓
Component updates complete

## Components Involved
- Root components (`App`, `main`), Page views (`Landing`, `Login`, `Signup`, `Dashboard`, `Rooms`, `Room`, `Schedule`, `Profile`, `Settings`, `History`, `VerifyEmail`), Layout sidebars/navbars.

## Hooks Used
- Built-in hooks: `useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`, `useLocation`, `useNavigate`.
- Custom hooks: `useAuth`, `useSocket`, `useDebounce`.

## Dependencies Used
- `react`, `react-dom`, `react-router-dom`, `vite`.

## Related Modules
- [component-architecture.md](component-architecture.md), [routing.md](routing.md), [context-api.md](context-api.md).

## Concepts I MUST Study
⚠️ List only.
- Virtual DOM vs Real DOM
- React Fiber Reconciler
- Concurrent Rendering features in React 19
- React 19 compiler changes (automatic memoization)
- Component mount, update, and unmount lifecycles
- State batching and asynchronous schedules
- Synthetic events and Event Delegation
- Props-drilling vs centralized state managers
- StrictMode execution double-mounting side-effects
- Declarative vs Imperative UI patterns

## Beginner Interview Questions
- What is a Single Page Application (SPA)?
- What is React 19 and what are its key features?
- How is the React app mounted to the HTML file?
- Explain the role of the `App` component.
- What is the difference between declarative and imperative programming in React?

## Intermediate Questions
- Why does MockMate wrap its root component with `StrictMode` in `main.jsx`?
- What are the main folders in `frontend/src` and what is the design decision behind this layout?
- How does React 19 handle DOM rendering compared to older React versions?
- Explain how a user reloading the page keeps their application state. Where is the boot check run?
- What triggers a React component to re-render?

## Advanced Questions
- Walk through the React reconciliation algorithm. How does it handle diffing arrays using keys?
- Explain the background modal rendering pattern implemented in `App.jsx`. How does it allow modals to overlay standard routes?
- How does the concurrent scheduler determine route prioritizations during asset loading?
- What is React Fiber and how does it prevent blocking the main user interface thread?
- If you notice input lag inside the app, how would you use React Profiler to analyze rendering bottlenecks?

## Staff-Level Questions
- Design a micro-frontend architecture to scale MockMate if the editor workspace and scheduling system were developed by separate engineering teams.
- How would you implement Server-Side Rendering (SSR) or Static Site Generation (SSG) for the landing page of MockMate without rewrite of the authentication React SPA?
- Discuss the architectural impact of the React 19 compiler on state optimizations and custom memoizations in a real-time collaborative tool.

## Questions About MY Implementation
- Why is the frontend structured into `components`, `context`, `hooks`, `pages`, `routes`, and `services`?
- Why did you choose React 19 instead of Next.js or Remix for MockMate?
- What would break in the application flow if the `main.jsx` was loaded asynchronously in the HTML body?
- Why does `App.jsx` load all pages synchronously instead of using code-split lazy routes?
- What trade-offs did you make by nesting `SocketProvider` inside `AuthProvider` at the root of `App.jsx`?

## Follow-up Questions
- Why load all components synchronously? What does that do to the initial bundle size?
- What breaks if you navigate to `/profile` directly in the browser when it is configured as a background modal?
- How does the UI handle a cold start delay from the hosted backend on Render?
- What if a page fails to fetch initial data? Does it crash the component tree?

## Code Reading Questions
- In `App.jsx`, trace the exact route paths that map to modals.
- Trace how `location.state` is accessed to set `backgroundLocation`.
- In `main.jsx`, trace the Mongoose/HTML element ID the React root attaches to.
- Trace where the context providers are wrapped around `<App />`.

## Debugging Questions
- A route transition results in a blank white screen. How do you isolate the error?
- React's `StrictMode` runs a `useEffect` fetch call twice on mount, causing duplicate database entries. How do you resolve this?
- You see `Warning: Each child in a list should have a unique "key" prop` in the console on the Rooms page. Trace where it happens.
- Modals on settings page render underneath the sidebar. What CSS stacking context bug occurred?

## Edge Cases
- Client loses network connectivity mid-route transition.
- User opens multiple tabs, logs out on tab A, and attempts to interact with React state on tab B.
- A user goes back in browser history during an active interview session.
- A route path parameter contains malicious encoded symbols.

## Performance Questions
- How does loading all scripts synchronously impact the Time to Interactive (TTI) metric?
- Are there unnecessary re-renders happening at the provider root during auth changes? How would you verify?

## Accessibility Questions
- Does the global layout support keyboard navigation (tab indexing) for dashboard tabs?
- Are screen readers notified when a modal overlays the background page?

## Security Questions
- What prevents a malicious user from modifying the route states in client memory to access the dashboard?
- Are sensitive keys stored in the compiled React bundles? How do you audit?

## Scalability Questions
- If MockMate adds 50 new features, how would you structure page imports to prevent memory bloat?
- How would you handle state scale if rooms needed to support complex collaborative state machines?

## Trade-off Questions
- Single SPA bundle (fast page transitions, slow initial load) vs Code splitting (slow page transitions, fast initial load).
- Context providers at the root (easy setup, global re-renders) vs component-level state stores.

## Refactoring Questions
- Refactor `App.jsx` to load routes lazily using `React.lazy` and `<Suspense>`.
- Extract modal routing routes into a dedicated modal layout component.

## Whiteboard Questions
- Draw the rendering tree showing provider scopes and route trees.
- Design the lifecycle flow of a route update in MockMate.

## Practical Coding Exercises
- Implement an Error Boundary component that wraps `<App />` and renders a fallback UI when a component crash occurs.
- Write a unit test using React Testing Library to verify that the app shows "Loading..." while the authentication state is initializing.

## Revision Checklist
- [ ] I can draw MockMate's route tree and explain how modal routes work.
- [ ] I can detail why StrictMode is registered and how it affects mounting.
- [ ] I can explain the Virtual DOM lifecycle.
- [ ] I can justify the folder structure and page import design.
- [ ] I can identify the provider hierarchy and explain its ordering.
