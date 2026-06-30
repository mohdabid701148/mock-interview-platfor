# Custom Hooks

## Why this topic exists in MockMate
Custom hooks allow React developers to extract component state logic into reusable functions. In MockMate, custom hooks abstract context retrieval validations (`useAuth`, `useSocket`) and delay high-frequency state updates (`useDebounce`), cleaning up component code and ensuring DRY (Don't Repeat Yourself) design principles.

## Where it is implemented
- [useAuth.js](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/hooks/useAuth.js) — Accesses `AuthContext` and asserts that calls are made within a valid provider.
- [useSocket.js](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/hooks/useSocket.js) — Accesses `SocketContext` and asserts that calls are made within a valid provider.
- [useDebounce.js](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/hooks/useDebounce.js) — Debounces high-frequency state updates (like search filter modifications or code editor inputs).

## UI Flow
A custom hook manages local state and timing transitions.
User types character in search box
↓
Search component state `searchTerm` changes
↓
Component calls custom hook `useDebounce(searchTerm, 500)`
↓
`useDebounce` detects dependency array `[value, delay]` change
↓
Clears previous timeout timer
↓
Sets new `setTimeout` timer for 500ms
↓
Time expires → updates inner state `debouncedValue`
↓
Custom hook returns new value to search component
↓
Search component executes API fetch using debounced value
↓
Results render

## Components Involved
- Components using custom hooks: `Dashboard`, `Rooms`, `Room`, `TestCasePanel`, forms, search bars.

## Hooks Used
- Built-in hooks: `useState`, `useEffect`, `useContext`.

## Dependencies Used
- `react`.

## Related Modules
- [react-architecture.md](react-architecture.md), [context-api.md](context-api.md), [performance.md](performance.md).

## Concepts I MUST Study
⚠️ List only.
- Rules of Hooks (React Hooks lifecycle constraints)
- Custom Hooks design patterns (Separation of concerns)
- Context validation guards in hooks
- Debouncing vs Throttling
- Cleanup functions in `useEffect` (preventing memory leaks)
- Stale closures in React hooks
- Functional state updates
- Custom hook unit testing methodologies
- Custom hooks dependency management

## Beginner Interview Questions
- What is a custom hook in React and why do we write them?
- What are the basic Rules of Hooks?
- What does the `useAuth` hook return?
- What parameters does the `useDebounce` hook accept?
- How do you implement a hook that reads from a React Context?

## Intermediate Questions
- Why do both `useAuth` and `useSocket` check if the context value is null? What error do they throw?
- Walk through how `useDebounce` cleans up its internal timeout timer. What happens if the input value changes before the timer expires?
- Can you call hooks conditionally inside a component? Why or why not?
- How does the React engine distinguish custom hooks from standard JavaScript functions?
- What is a stale closure inside a hook? How does it occur?

## Advanced Questions
- Explain how React tracks hook calls order internally. Why must hooks always run in the exact same order on every render?
- If `useDebounce` is used to throttle search queries, how does it optimize render cycles compared to manual `setTimeout` calls inside component event handlers?
- How would you test a custom hook like `useDebounce`? What testing libraries or mock timer utilities would you use?
- If a custom hook returns a function, how do you prevent consumer components from recreating that function on every render cycle?
- Walk through how to design a custom hook `useLocalStorage` that syncs a state variable with localStorage dynamically.

## Staff-Level Questions
- Design a custom hook `useWebSocket` that handles connection, event listener mappings, auto-reconnection, and message queuing without relying on a React Context wrapper.
- How would you optimize custom hooks to scale when managing complex animation sequences, ensuring they do not trigger parent repaints?
- Compare the architectural patterns of using custom hooks for state management vs utilizing store libraries like Zustand or Recoil.

## Questions About MY Implementation
- Why is `useDebounce` declared inside `hooks` and also duplicated in `components/editor/`? Is there a difference in their imports?
- What would break in the application if a page called `useSocket` outside the `<SocketProvider>` wrapper?
- Why do `useAuth` and `useSocket` throw errors instead of returning undefined when the provider is missing?
- What assumptions were made about the delay defaults in `useDebounce`?
- Why aren't Mongoose API services wrapped inside custom hooks (like `useQuery` patterns)?

## Follow-up Questions
- Why? What breaks if we don't clear the timeout?
- What if the delay parameter changes dynamically? Does the timer reset?
- How does the component check if the returned value of `useAuth` has changed?
- What happens if a component renders two instances of `useDebounce`? Are their timer IDs isolated?

## Code Reading Questions
- Locate the `useDebounce.js` file and trace the return value.
- Trace where `useAuth` is called in `ProtectedRoute.jsx` and explain how it gates rendering.
- Find how the cleanup return block is formatted in `useDebounce.js`.
- Trace the import path of `useSocket` inside the workspace `Room.jsx` page.

## Debugging Questions
- A search input is firing API calls on every keystroke despite being passed through `useDebounce`. Trace where the debounce output was ignored.
- You see `Rendered more hooks than during the previous render` in terminal logs. Locate which component violated the rules of hooks.
- A component is reading stale context values from `useAuth` after a profile update. Trace the dependency array.
- The `useDebounce` hook keeps returning the initial value and never updates. Trace if the timer callback is firing.

## Edge Cases
- Passing an object instead of a string to `useDebounce`, causing infinite timer loops due to object reference changes.
- Loading the page while localStorage is full, blocking context updates in hooks.
- Component containing a hook unmounts while the debounce timer is active.
- Unmounting the socket provider while a hook is waiting on a connection event.

## Performance Questions
- How does the memory footprint scale when 10 components invoke `useDebounce` simultaneously?
- Does using `useAuth` in 20 different components cause 20 re-renders when the user state updates?

## Accessibility Questions
- Does debouncing search inputs introduce accessibility lag warnings for screen readers?
- How do you notify users with visual impairments that a debounced list is fetching updates?

## Security Questions
- Are values debounced in custom hooks sanitized before being used in axios calls?
- Is there any risk of token exfiltration when hooks expose access tokens to the component tree?

## Scalability Questions
- How would you structure custom hooks if the application needed to support multi-step workspace wizard workflows?
- How would you manage hooks dependencies if they require dynamic inputs from multiple context stores?

## Trade-off Questions
- Custom hooks (logic reuse, keeps states isolated) vs Context (keeps states shared, triggers re-renders).
- Debouncing (delayed updates, fewer calls) vs Throttling (regular updates, immediate starts).

## Refactoring Questions
- Refactor the code editor synchronization logic to use a custom hook `useRoomSocket` that handles all room and editor event bindings.
- Extract form input tracking logic into a reusable custom hook `useForm`.

## Whiteboard Questions
- Draw the state mapping chart showing how value updates propagate inside `useDebounce` from dependency trigger to state output.
- Write a pseudocode hook `useThrottle` from memory.

## Practical Coding Exercises
- Implement a custom hook `useWindowSize` that listens to window resize events and returns width/height, cleaning up listeners on unmount.
- Write a unit test using `@testing-library/react-hooks` to assert that `useDebounce` delays updating its output.

## Revision Checklist
- [ ] I can write the `useDebounce` hook from memory.
- [ ] I can explain the rules of hooks and how React tracks state arrays.
- [ ] I can detail why context verification guards are added to custom hooks.
- [ ] I can identify stale closure issues and describe how to solve them.
- [ ] I can explain the cleanup phase of effect hooks inside custom functions.
