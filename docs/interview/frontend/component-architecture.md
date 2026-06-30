# Component Architecture

## Why this topic exists in MockMate
MockMate structures its UI into reusable modular components. By segregating pages (routing endpoints) from child components (specialized layout UI components), the platform achieves a separation of concerns. Understanding component composition, parameter passing (Props), and parent-child communication is key to maintaining clean UI layers.

## Where it is implemented
- [pages/](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/pages) — Top-level router page views coordinating hooks and services.
- [components/auth/](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/components/auth) — Forms for credential inputs.
- [components/dashboard/](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/components/dashboard) — Navbars, sidebars, notification dropdowns, and stats grids.
- [components/editor/](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/components/editor) — Code editors, toolbars, outputs, test panels, and language controls.
- [components/rooms/](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/components/rooms) — Workspace layouts, room list cards, attachment modals.
- [components/schedule/](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/components/schedule) — Interactive calendars, booking forms, upcoming session grids.

## UI Flow
Components pass data down via props and bubble events up via callbacks.
User selects code tab in LanguageSelector
↓
LanguageSelector calls `onChange(lang)` callback prop
↓
Parent CodeEditor catches event
↓
State update `setLanguage(lang)` in CodeEditor
↓
Emits socket event `language-change`
↓
Triggers props update in child Monaco component
↓
Re-renders Monaco workspace with new grammar rules

## Components Involved
- Core Page Components: `Dashboard`, `History`, `Landing`, `Login`, `Profile`, `Room`, `Rooms`, `Schedule`, `Settings`, `Signup`, `VerifyEmail`.
- Reusable UI Sub-components: `Navbar`, `Sidebar`, `NotificationDropdown`, `CodeEditor`, `EditorToolbar`, `TestCasePanel`, `QuestionPanel`, `AttachQuestionModal`, `ScheduleForm`, `InterviewCalendar`, `RoomCard`.

## Hooks Used
- Built-in hooks: `useState`, `useEffect`, `useRef`, `useMemo`.
- Custom hooks: `useAuth`, `useSocket`.

## Dependencies Used
- `react`, `lucide-react` (icons library), `framer-motion` (animations builder).

## Related Modules
- [react-architecture.md](react-architecture.md), [routing.md](routing.md), [monaco-editor.md](monaco-editor.md).

## Concepts I MUST Study
⚠️ List only.
- Presentational vs Container components pattern
- Component Composition (children props rendering)
- Controlled vs Uncontrolled components
- Prop types validation and defaults
- React rendering triggers and pure components
- Strict state direction (unidirectional data flow)
- Lifecycle updates in function components
- Conditional rendering mechanisms (ternaries, logic operators)
- SVG and icon optimizations (Lucide React trees)
- Custom event dispatching and handler wiring

## Beginner Interview Questions
- What is the difference between a page and a component in MockMate?
- How do you pass data from a parent component to a child component?
- What are props and are they mutable?
- What is `props.children` and how is it used in React composition?
- Explain the role of key props when rendering arrays of components.

## Intermediate Questions
- How does the `Sidebar` identify which tab is currently active?
- What is a callback prop, and how does the `TestCasePanel` notify its parent of code test results?
- How is conditional rendering used in the `Dashboard` to show upcoming interviews vs empty state grids?
- What are the trade-offs of using component composition over inheritance?
- How does the `AttachQuestionModal` communicate question selections back to the `QuestionPanel`?

## Advanced Questions
- Explain how `Framer Motion` animations are integrated into UI components (like dropdown alerts). What performance considerations exist?
- Why do we pass functions to props? What happens to child components if a parent passes a newly declared inline function prop on every render?
- Walk through how `InterviewWorkspace` coordinates states between `CodeEditor`, `QuestionPanel`, and `TestCasePanel`. How are they positioned responsively?
- If a child component needs to force a re-render of its sibling component, how do you model the state flow in React?
- Discuss the design decision of keeping forms (like `LoginForm`) in the `components` folder while keeping the parent validation wrapper in the `pages` folder.

## Staff-Level Questions
- Design a headless UI component library wrapper for MockMate to support theme styling (Tailwind CSS) and accessibility properties dynamically.
- How would you implement a Virtual List component to optimize performance when rendering a history list containing 10,000 interview logs?
- Discuss strategies for component refactoring to achieve full decoupling, making key workspace widgets (like the Monaco Editor wrapper) reusable across multiple mock platform products.

## Questions About MY Implementation
- Why is `PastSessionModal` separated into the history component folder rather than keeping it as a generic modal?
- Why is the `Logo` component placed in `components/` instead of `assets/`?
- What would break in the workspace if the `ParticipantList` failed to receive socket join events?
- Why are forms split into `LoginForm` vs parent `Login.jsx`? What trade-off was made?
- What assumptions did you make about screen aspect ratios when designing the double-panel workspace layout in `Room.jsx`?

## Follow-up Questions
- Why? What breaks if they are combined into a single file?
- How does React optimize re-renders when a parent component updates but the props of the child remain identical?
- What happens if you omit the `key` prop on `RoomCard` lists?
- How does `framer-motion` react when components dynamically unmount from the DOM tree?

## Code Reading Questions
- In `Room.jsx`, locate the JSX lines where `QuestionPanel` and `CodeEditor` are mounted.
- Find how the `StatsCard` receives its parameters inside `Dashboard.jsx`.
- Trace the lifecycle of the `NotificationDropdown` toggle trigger. Where is the state stored?
- Locate where the custom `useDebounce` hook is imported inside the editor component.

## Debugging Questions
- A list of room cards does not update when a new room is joined, despite the console logging socket updates. Trace the key prop usage.
- Clicking inside the `NotificationDropdown` causes the dropdown to close immediately. Trace propagation bugs.
- You see `Cannot update a component while rendering a different component` in logs. Trace where state updates are executed during rendering phases.
- CSS classes are not applying dynamically to active tabs. Debug the class concatenation logic.

## Edge Cases
- Parent component unmounts mid-animation of a child modal.
- Passing null or undefined objects as props to presentational cards.
- Screen sizes that squeeze sidebar layouts into 200px width.
- A user double-clicks the "Attach Question" trigger button before the modal finishes transition.

## Performance Questions
- Are any child components re-rendering unnecessarily when the user types in Monaco? How do you prevent this (e.g., React.memo)?
- What is the impact of dynamically rendering SVG icons on the CPU frames during animations?

## Accessibility Questions
- Do your form input components link labels to inputs via `htmlFor` properties?
- Are the navigation sidebars navigable via tab key operations?

## Security Questions
- What prevents user input values passed as props from breaking JSX parsing or injecting raw elements?
- Are user avatars validated to prevent load attempts of malicious assets?

## Scalability Questions
- If you need to support 15 different types of questions (code, SQL, design, behavioral), how do you refactor the component layout to keep code maintainable?
- How would you manage component configurations if MockMate needed to support dynamic layout editing?

## Trade-off Questions
- Storing layout values in state (flexible, triggers updates) vs CSS grid classes (static, performant).
- Monolithic workspace page vs highly nested component structures.

## Refactoring Questions
- Refactor the Form input fields to use a unified `<Input />` subcomponent that validates errors dynamically.
- Extract the sidebar navigation list array into a config module to make sidebar layouts metadata-driven.

## Whiteboard Questions
- Draw the component hierarchy of the workspace `Room.jsx` page.
- Write the pseudo JSX design showing how components compose layouts dynamically.

## Practical Coding Exercises
- Implement a reusable `<Modal>` wrapper component that catches keypress escapes and mouse clicks outside boundary.
- Write a unit test that verifies that `<StatsCard>` displays the title and numerical values passed to it.

## Revision Checklist
- [ ] I can draw MockMate's component hierarchy map.
- [ ] I can explain component composition and how `children` props operate.
- [ ] I can describe parent-child callbacks and unidirectional data flows.
- [ ] I can explain the visual animations lifecycle managed by Framer Motion.
- [ ] I can identify key prop mistakes and explain how they cause UI state losses.
