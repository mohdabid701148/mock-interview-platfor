# Performance Optimization

## Why this topic exists in MockMate
MockMate is a real-time collaborative platform. Under high traffic, the app processes frequent WebSocket packets (live typing updates, language swaps, mouse events) and updates complex workspaces. Without performance optimizations, these tasks can saturate the CPU, block the main user thread, and degrade input responsiveness. MockMate implements event debouncers, layout cleanups, and caching structures to keep interactions responsive.

## Where it is implemented
- [CodeEditor.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/components/editor/CodeEditor.jsx) — Client-side typing debouncers (350ms) and refs-based state tracking to avoid excessive React render triggers.
- [SocketContext.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/context/SocketContext.jsx) — Explicit cleanup of WebSocket event listeners and connection heartbeats to prevent memory leaks.
- [useDebounce.js](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/hooks/useDebounce.js) — Abstracted timeout handlers for input filters.
- [axios.js](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/api/axios.js) — Request caching and queueing mechanisms.

## UI Flow
Rendering cycles are optimized via debouncers and listeners cleanups.
Candidate types code in Monaco Editor panel
↓
Monaco onChange event catches text string
↓
CodeEditor intercepts typing input
↓
Clears previous timeout timer Ref
↓
Sets new 350ms setTimeout timer Ref
↓
Timer expires → Emits code update socket event
↓
Axios execute REST calls wrapped in Promise queues
↓
Component cleanups clear event listeners on page unmount
↓
Memory usage remains low and stable

## Components Involved
- Core Workspace layouts: `Room`, `CodeEditor`, `TestCasePanel`, `ParticipantList`, Dashboard elements: `Dashboard`, sidebars, navigation feeds.

## Hooks Used
- Built-in hooks: `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`.
- Custom hooks: `useDebounce`, `useSocket`, `useAuth`.

## Dependencies Used
- `react`, `socket.io-client`, `axios`.

## Related Modules
- [react-architecture.md](react-architecture.md), [custom-hooks.md](custom-hooks.md), [socket-client.md](socket-client.md), [monaco-editor.md](monaco-editor.md).

## Concepts I MUST Study
⚠️ List only.
- React Rendering engine and Virtual DOM reconciliation
- Reference equality checks in component props
- Stale closures and dependency arrays in effect hooks
- Debouncing vs Throttling execution paths
- Memory leaks and listener cleanup bindings in single-page apps
- Garbage collection cycles in JavaScript engines
- GPU compositing and CSS paint repaints (layout reflows)
- React 19 automatic rendering compiler optimizations
- Code splitting and route-based code bundling (React.lazy, Suspense)
- Asset minification, tree shaking, and code compression (Vite compile optimization)

## Beginner Interview Questions
- What causes a React component to re-render?
- What is a memory leak and how does it happen in React?
- Why do we clean up event listeners inside `useEffect` return functions?
- What is the difference between debouncing and throttling?
- How does debouncing improve performance on user input fields?

## Intermediate Questions
- Why does `CodeEditor.jsx` use React refs (`codeRef`, `languageRef`, `codeByLanguageRef`) instead of depending solely on state updates? How does this minimize rendering triggers?
- What happens if the `socket.off()` cleanups are omitted from the workspace component unmount hooks?
- How does Vite's tree shaking optimize the production JavaScript bundle?
- Why is it a bad practice to declare functions inline inside component props (e.g. `onClick={() => setVal(true)}`)? How does it affect child renders?
- What is a reflow in browser layouts, and how does dragging the split divider handle in `Room.jsx` optimize layouts calculation?

## Advanced Questions
- Walk through how React 19 compiles state updates. How does the new compiler optimize memoizations automatically compared to manually wrapping components in `React.memo` or hooks in `useCallback`?
- Analyze the performance trade-offs of storing the editor state in-memory (`editorStates` on the server) vs writing changes directly to MongoDB on every keystroke.
- How does the Axios `failedQueue` concurrency manager optimize network calls when multiple API requests trigger token refreshes at the same time?
- Explain the GC (Garbage Collection) implications of registering high-frequency event listeners (like mouse movements during pane resizing) on the window object.
- How would you profile a memory leak in a React SPA using Chrome DevTools Memory tab?

## Staff-Level Questions
- Design a real-time cursor tracking system for MockMate that supports 100 concurrent observers. How do you throttle cursor position updates to prevent UI stutter?
- Compare the rendering performance profiles of React Context API vs a specialized global state manager (like Zustand or Recoil) in an app with high-frequency data streams.
- Outline a complete bundle optimization strategy for MockMate using Vite to achieve a Lighthouse score above 95.

## Questions About MY Implementation
- Why is the client typing debouncer set to 350ms specifically inside `CodeEditor.jsx`?
- What would happen to CPU utilization if the resizable panel listener did not call `window.removeEventListener("mousemove", onMove)`?
- Why are page layouts (like `Rooms.jsx` or `Schedule.jsx`) loaded synchronously instead of using route-split bundles?
- Why does the `useDebounce` hook return a single debounced value instead of a debounced function wrapper?
- What assumptions were made about network speeds when defining the 15-second email request timeout?

## Follow-up Questions
- Why? What breaks if you use a shorter debounce time (e.g. 50ms)?
- What if a page contains 1,000 active interview cards? How does that affect DOM node counts?
- How does React optimize list diffing when using indices as keys compared to database object IDs?
- What happens to the socket thread when a user tab is placed in the background by the browser?

## Code Reading Questions
- In `CodeEditor.jsx`, locate the debounce timeout setter block in `handleCodeChange`.
- Locate where event listeners are added and removed on the window object in `cppDriver.js` or `CodeEditor.jsx`.
- In `useDebounce.js`, trace the `useEffect` cleanup hook.
- Trace the Axios queue array processing in `axios.js`.

## Debugging Questions
- A user reports that the editor lag increases the longer they type. Trace where memory leaks are allocating states.
- The console throws `Cannot update a component while rendering a different component` warnings. Trace state changes in rendering pipelines.
- An input field updates with a delay, making typing feel sluggish. Trace if the input is controlled via a debounced state.
- Dragging panels freezes the browser. Trace if the mouse event handler is performing layout calculation without throttle hooks.

## Edge Cases
- Candidate pastes a 10MB JSON document into Monaco.
- Clicking the run button 20 times in rapid succession, bypassing the execution rate limiters.
- Switching between tabs while a resize drag is active.
- Browser throttling JavaScript execution threads when system enters low power mode.

## Security Questions
- How does throttling client code runs defend against DDoS attempts on Judge0 servers?
- Is there any risk of token leakage when holding large state histories in React memory?

## Performance Questions
- How does the Cumulative Layout Shift (CLS) score change when the Monaco editor dynamically mounts?
- Does using CSS variables in Tailwind v4 degrade rendering speeds compared to inline Tailwind values?

## Scalability Questions
- How do you optimize state structures if MockMate adds support for multi-file workspace workspaces?
- How would you handle client-side data syncing if the candidate has a low-bandwidth network connection?

## Trade-off Questions
- High-fidelity typing sync (real-time, high CPU/network loads) vs debounced sync (delayed, highly performant).
- CDN assets loading (uncached first load, fast CDN latency) vs local asset bundling (heavy initial assets bundle, fast subsequent loads).

## Refactoring Questions
- Refactor the resize handles drag logic to use CSS resize properties to prevent JavaScript mouse listener overheads.
- Decouple the local code state into a lightweight, non-rendering class instance to prevent workspace re-renders.

## Whiteboard Questions
- Write the pseudo code of a throttle helper function.
- Draw a diagram showing how the browser executes layout, paint, and composition phases, marking where animations can trigger bottlenecks.

## Practical Coding Exercises
- Implement a custom hook `useThrottle` that limits events callback frequencies to once every 100ms.
- Write a unit test using Jest that asserts a debounced input field only triggers an API handler once after continuous typings.

## Revision Checklist
- [ ] I can describe the debounce mechanism in CodeEditor.
- [ ] I can explain how to detect and resolve memory leaks using Chrome DevTools.
- [ ] I can detail why refs are used to track variables inside asynchronous loops.
- [ ] I can justify the use of synchronous page imports in MockMate.
- [ ] I can explain the performance impact of dynamic asset loads.
