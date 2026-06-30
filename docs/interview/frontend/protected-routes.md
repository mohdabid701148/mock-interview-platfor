# Protected Routes

## Why this topic exists in MockMate
MockMate contains sensitive features (such as user dashboards, active interview workspaces, booking calendars, feedback reports) that require valid, verified session credentials. The `ProtectedRoute` component acts as a client-side route guard, checking user session states before mounting layouts. This prevents unauthenticated users from accessing private routes and blocks "flashing" of private layout grids during credentials checks.

## Where it is implemented
- [ProtectedRoute.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/routes/ProtectedRoute.jsx) — Route validation guard intercepting route requests.
- [App.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/App.jsx) — Hooks private routes underneath the ProtectedRoute wrapper scope.

## UI Flow
Client requests access to a protected path.
User enters `/dashboard` URL / navigates to dashboard
↓
React Router evaluates routing hierarchy
↓
Locates path inside `<Route element={<ProtectedRoute />}>`
↓
ProtectedRoute executes custom hook `useAuth()`
↓
Auth Context yields `user` state and `loading` boolean
↓
Is `loading` true?
├─ Yes: Mounts full-screen loading spinner (blocks rendering)
└─ No: Evaluates `user` state
    ├─ User authenticated: Mounts child layouts via `<Outlet />`
    └─ User unauthenticated: Triggers `<Navigate to="/login" replace />`

## Components Involved
- Gating controller: `ProtectedRoute`.
- Router targets: `Outlet`, `Navigate`.
- Context loader: `AuthProvider`.

## Hooks Used
- Custom hooks: `useAuth` (retrieves session state).

## Dependencies Used
- `react`, `react-router-dom`.

## Related Modules
- [routing.md](routing.md), [authentication-flow.md](authentication-flow.md) (wait, let's keep it [authentication.md](authentication.md) if we reference the backend topic, or auth flow), [context-api.md](context-api.md).

## Concepts I MUST Study
⚠️ List only.
- Client-side security vs Server-side security limits
- Route guards and lifecycle gating
- Resolving state checks latency (preventing screen flashes)
- Layout layout composition via Outlet rendering
- HTTP authentication state indicators
- Browser session persistence
- Programmatic replacements during redirection

## Beginner Interview Questions
- What is a protected route and why do we need one in MockMate?
- What happens when an unauthenticated user tries to visit the `/dashboard` route?
- What does the `loading` flag do inside `ProtectedRoute`?
- What does the component render if a user is authenticated?
- How is the `ProtectedRoute` registered inside `App.jsx`?

## Intermediate Questions
- Why does `ProtectedRoute` return a full-screen loading page when `loading` is true? What would happen if this check was omitted?
- Explain the role of the `<Outlet />` component inside the return block of `ProtectedRoute`.
- What is the difference between client-side route protection and server-side route protection? Can client-side route guards prevent database access?
- How is the route guard updated if a user gets logged out by the database (e.g., when a token expires)?
- What is the purpose of setting `replace` to true inside the login redirection `<Navigate />`?

## Advanced Questions
- Walk through how `ProtectedRoute` coordinates with the Axios interceptor. If a request returns a `401 Unauthorized` and triggers a redirect, how does the route guard react?
- How does `App.jsx` prevent layout flashing when checking the in-memory session state (via the silent refresh bootstrap) on page load?
- If we want to restrict certain paths (like `/rooms/create`) only to users with the role of "interviewer", how would you refactor `ProtectedRoute` to support role-based access control (RBAC)?
- What happens if the backend profile check takes 5 seconds to load due to server cold starts? How does `ProtectedRoute` handle this delay?
- Discuss why client-side route guards are not a replacement for server-side middleware authorizations.

## Staff-Level Questions
- Design a scalable route guarding framework that checks permissions dynamically based on localized claim schemas fetched from user session tokens.
- Discuss how you would handle route transitions when a user is offline. How does the route guard identify if connection drops vs if authentication fails?

## Questions About MY Implementation
- Why is `VerifyEmail` page left public instead of being placed under `ProtectedRoute`?
- What would break in the workspace if the route guard did not evaluate the `loading` parameter?
- Why did you use nesting in `App.jsx` (`<Route element={<ProtectedRoute />}>`) instead of wrapping every page view component manually?
- What assumptions were made about the duration of the authentication initialization check?
- What trade-offs were made by rendering a simple "Loading..." text screen during auth checks?

## Follow-up Questions
- Why? What breaks if we don't redirect to login?
- What if the user gets deleted from the database but their browser session state persists in local memory?
- How does React Router optimize layout animations when wrapping pages inside a protected guard?
- What happens if you try to pass custom parameters directly to the `ProtectedRoute` component?

## Code Reading Questions
- In `ProtectedRoute.jsx`, locate the return line that mounts the child components.
- Trace how `useAuth` is imported and destructured inside the component.
- Find the parent route block wrapping `/dashboard`, `/rooms`, and `/schedule` in `App.jsx`.
- Locate where the custom CSS classes are applied to the loading spinner container.

## Debugging Questions
- A user logs in successfully, but navigating to the dashboard redirects them back to login instantly. Trace the authentication state synchronization in `ProtectedRoute`.
- Page reloading causes the dashboard grid to load for a split second before redirecting to login. Debug the initial `loading` state assignment.
- The loading page stays mounted forever. Trace why `loading` never gets set to false inside `AuthProvider`.
- You see `Warning: React limits the number of renders to prevent an infinite loop` when visiting protected routes. Trace redirect loop triggers.

## Edge Cases
- Session tokens expire exactly at the moment a route transition occurs.
- The user is logged in, but their email verification status is changed to unverified mid-session.
- Rapidly switching between protected pages while the `/current-user` verification request is in progress.
- Browsing in private mode where session storage is disabled, causing states to lose values.

## Security Questions
- How does MockMate verify that an attacker cannot bypass `ProtectedRoute` by manually altering React state variables in dev tools?
- Why is it insecure to store user credential properties in clear text inside the DOM?

## Performance Questions
- How does mounting a global loading spinner affect the Cumulative Layout Shift (CLS) performance metrics?
- Does wrapping multiple route subsegments inside a single guard increase render execution times?

## Scalability Questions
- How would you manage route guards if MockMate needed to support 10 levels of user permissions?
- How would you design the route guard to dynamically request step-up authentication (e.g. MFA verification) when visiting sensitive paths?

## Trade-off Questions
- Centralized guard wrapper (consistent, less code) vs Per-page guard components (customized loaders, granular control).
- Automatic silent redirects vs warning modals before redirecting.

## Refactoring Questions
- Refactor the `ProtectedRoute` to support a fallback component passed as a prop, making the loading UI configurable.
- Implement a custom route guard component `<RoleRoute>` that extends `ProtectedRoute` to support user group filters.

## Whiteboard Questions
- Draw the state flowchart of the `ProtectedRoute` lifecycle from route click to layout mount or redirection.
- Design a block diagram showing how React Router's Outlet mounts children components underneath protected layouts.

## Practical Coding Exercises
- Implement a protected route guard that checks if a user is online, redirecting them to an `/offline` route if the connection is down.
- Write a unit test using Jest to verify that `<ProtectedRoute>` redirects to `/login` when the mock auth context returns a null user.

## Revision Checklist
- [ ] I can write the `ProtectedRoute` component from memory.
- [ ] I can explain the role of `loading` flags in preventing route flashes.
- [ ] I can detail how nested paths are rendered using `<Outlet />`.
- [ ] I can justify why client-side route guards require duplicate server-side validation checks.
- [ ] I can describe how redirections manage the browser navigation history stack.
