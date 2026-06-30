# Routing

## Why this topic exists in MockMate
MockMate is a Single Page Application (SPA). To navigate between the landing screen, login portals, dashboard grids, interview rooms, and history files, MockMate integrates **React Router Dom (v7)**. React Router intercepts browser address transitions and mounts the corresponding page components locally, keeping page load states fluid and fast.

## Where it is implemented
- [App.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/App.jsx) — Core router paths mapping, navigation definitions, public/private groupings, and background modal routings.
- [main.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/main.jsx) — Wraps App in `BrowserRouter` scope.
- [ProtectedRoute.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/routes/ProtectedRoute.jsx) — Gated path validation wrapper.
- [Navbar.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/components/dashboard/Navbar.jsx) / [Sidebar.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/components/dashboard/Sidebar.jsx) — Dynamic link elements triggers.

## UI Flow
User triggers a route switch.
User clicks Dashboard link in Sidebar
↓
Sidebar invokes React Router `<Link to="/dashboard">`
↓
React Router catches click event -> blocks browser default GET request
↓
Evaluates destination path `/dashboard` against App.jsx route configurations
↓
Matches `/dashboard` inside `ProtectedRoute` scope
↓
ProtectedRoute evaluates `user` state and mounts `<Dashboard />` via `<Outlet />`
↓
URL bar changes to `/dashboard`
↓
Page contents render without full refresh

## Components Involved
- Root Wrappers: `BrowserRouter`, `Routes`, `Route`, `Navigate`.
- Router Navigation links: `Link`, `NavLink`.
- Gated checks: `ProtectedRoute`.
- Router Layout targets: `Outlet`.

## Hooks Used
- Third-party router hooks: `useLocation`, `useNavigate`, `useParams`.
- Custom hooks: `useAuth`.

## Dependencies Used
- `react`, `react-router-dom`.

## Related Modules
- [react-architecture.md](react-architecture.md), [protected-routes.md](protected-routes.md), [context-api.md](context-api.md).

## Concepts I MUST Study
⚠️ List only.
- Client-side routing vs Server-side routing
- History API (pushState, replaceState) in browsers
- Route parameters and dynamic segment matching
- React Router Outlet composition structure
- Modal routing using location background states
- Path redirection rules (declaring fallbacks)
- Navigation lifecycle, cancellation, and blocks
- Nested routing and Layout grouping
- Base URL configs and routing sub-directories

## Beginner Interview Questions
- What is client-side routing?
- How is routing configured inside `App.jsx`?
- What is the difference between `<Link>` and `<a href="...">` in React Router?
- How do you redirect a user to another page programmatically?
- What does the `*` path segment represent in a route configuration?

## Intermediate Questions
- Explain what `location.state` does in React Router. How is it used to manage modals?
- What does the setting `replace: true` accomplish inside a navigation transition?
- How does the `useParams` hook extract dynamic segments like `roomCode` from the URL?
- Why do we wrap the app inside `BrowserRouter` in `main.jsx` rather than inside `App.jsx`?
- How does nested routing operate in React Router? Explain the role of `<Outlet />`.

## Advanced Questions
- Walk through the background modal routing pattern implemented in `App.jsx` (`backgroundLocation`). How does it preserve the state of the background page when a modal route is visited?
- If you navigate to `/profile` directly by pasting the URL in the browser, how does the background location state behave? What does the UI render?
- Explain the difference between `useNavigate()` and `<Navigate />`. When would you use each?
- How do you configure React Router to support query parameters (e.g., `/dashboard?tab=history`)?
- What server-side configurations are required (e.g., in Vercel or Nginx) to support SPA routing when a user refreshes a nested route?

## Staff-Level Questions
- Design a dynamic routing architecture for MockMate that loads route configurations and page modules asynchronously based on user roles and feature flags.
- Discuss how you would implement scroll restoration behavior across page transitions in a complex collaborative layout.
- Compare the routing models of React Router Dom (v7) vs Next.js App Router (file-system based, server-first routing).

## Questions About MY Implementation
- Why is `VerifyEmail` registered as a public route inside `App.jsx` instead of being nested in the protected route scope?
- Why did you use `BrowserRouter` instead of `HashRouter` for MockMate? What server requirements does this introduce?
- What would break in navigation if `location.state` was cleared during a modal route overlay?
- Why does the wildcard route `*` redirect to `/dashboard` or `/login` depending on authentication state rather than rendering a static 404 page?
- What assumptions were made about the back-button behavior when closing settings/profile modals?

## Follow-up Questions
- Why? What breaks if you use a standard link inside the workspace?
- What happens if the browser history stack hits its limit?
- How does React Router optimize component mounting during dynamic path updates?
- What if you refresh the browser page while the profile modal is open? How does the URL change?

## Code Reading Questions
- In `App.jsx`, locate the conditional block that checks `backgroundLocation`.
- Find how `useLocation()` is initialized at the top of `App`.
- Trace how the `roomCode` parameter is read inside the workspace page `Room.jsx`.
- In `Sidebar.jsx`, locate the navigation Link configurations.

## Debugging Questions
- Pagenavigations result in a 404 error when running on the deployed Vercel URL. Trace the vercel config rewrite rules.
- Opening the profile modal overlays a blank page instead of the dashboard. Trace the `backgroundLocation` matching code.
- You see `useLocation() may be used only in the context of a <Router> component` error. Trace which component is placed incorrectly.
- Clicking the back button in browser history keeps the modal open. Trace navigation state updates.

## Edge Cases
- Client navigates to a nested route that does not match any config segment.
- A user double-clicks a link, firing two pushState transitions in close succession.
- A dynamic route parameter contains special characters or directory traversal strings.
- Navigating back while an active WebSocket session is sending execution logs.

## Security Questions
- How do you verify that dynamic segments (like `roomCode`) are validated before the component mounts or makes API requests?
- Can a user access admin pages by modifying route structures in the browser developer console?

## Performance Questions
- How does loading all page imports synchronously inside `App.jsx` affect initial bundle sizes and parse times?
- Does changing routing states trigger re-renders of components that are not targets of the route transition?

## Accessibility Questions
- Does page navigation update the document title and shift focus to the top of the viewport?
- Are screen readers notified that a new route page has mounted?

## Scalability Questions
- If MockMate grows to 100 pages, how do you keep the router configuration file maintainable?
- How would you manage route translation (i.e. localized URLs) using the current structure?

## Trade-off Questions
- HashRouter (no server config required, ugly URLs) vs BrowserRouter (clean URLs, requires redirects mapping).
- Programmatic redirection (`navigate()`) vs declarative links (`<Link>`).

## Refactoring Questions
- Refactor the routes config in `App.jsx` into a metadata-driven array schema mapping.
- Extract the route protection logic into a custom navigation hook.

## Whiteboard Questions
- Draw the flow chart showing how React Router maps a URL string to a page view.
- Design a diagram demonstrating the state flow when a modal route is opened with background location.

## Practical Coding Exercises
- Implement a route guard wrapper component that checks if a user has completed email verification before granting access.
- Write a unit test using `MemoryRouter` that asserts the wildcard path redirects unauthenticated users to `/login`.

## Revision Checklist
- [ ] I can explain the background modal routing pattern end-to-end.
- [ ] I can detail the difference between BrowserRouter and HashRouter.
- [ ] I can describe how dynamic route parameters are matched and extracted.
- [ ] I can justify the routing configurations in App.jsx.
- [ ] I can trace the redirection flow of wildcard routes.
