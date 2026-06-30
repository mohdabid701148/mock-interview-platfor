# Monaco Editor

## Why this topic exists in MockMate
MockMate provides a coding environment inside its interview workspace page. To give candidates a full-fledged IDE experience (syntax highlighting, bracket matching, automatic indentation, multi-cursor support), MockMate integrates the **Monaco Editor** using the `@monaco-editor/react` library. Monaco acts as a high-fidelity input wrapper, linking to real-time synchronization channels (Sockets) and compilers (Judge0).

## Where it is implemented
- [CodeEditor.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/components/editor/CodeEditor.jsx) — Controls Editor mounting configurations, theme bindings, input change debouncing, and execution dispatchers.
- [cppDriver.js](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/utils/cppDriver.js) — Utility converting LeetCode-style C++ class text from Monaco into fully compilable programs on the fly.
- [LanguageSelector.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/components/editor/LanguageSelector.jsx) — Dropdown menu allowing selection of javascript, typescript, python, java, or cpp.
- [EditorToolbar.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/components/editor/EditorToolbar.jsx) — Controls console expansions and execution triggers.
- [TestCasePanel.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/components/editor/TestCasePanel.jsx) — Receives current Monaco values to run tests against expected results.

## UI Flow
Monaco mounts and listens to coding inputs.
Component imports `<Editor />` component from `@monaco-editor/react`
↓
Vite loads Monaco static assets from CDN (`jsdelivr`/`cdnjs` whitelisted in Helmet CSP)
↓
Monaco mounts in workspace container, triggering `onMount()` handler
↓
Candidate types character
↓
Monaco onChange callback fires
↓
`handleCodeChange` in CodeEditor catches text value
↓
Checks if change is remote-driven (`isApplyingRemoteRef` is true)
├─ Yes: Aborts (prevents infinite echo loops)
└─ No: Sets refs, schedules 350ms socket debounce timer
    ↓
    Emits `code-change` socket updates to peer
    ↓
    User triggers "Run Code"
    ↓
    `getRunnableCode()` compiles C++ helper wrappers if needed
    ↓
    Axios submits compiled code block to Judge0

## Components Involved
- Monaco Editor React Wrapper (`Editor`), Page Layout: `Room`, Workspace Components: `CodeEditor`, `LanguageSelector`, `EditorToolbar`, `CodeOutputPanel`.

## Hooks Used
- Built-in hooks: `useState`, `useEffect`, `useRef`.
- Custom hooks: `useSocket`.

## Dependencies Used
- `@monaco-editor/react` (editor wrapper), `lucide-react` (toolbar icons).

## Related Modules
- [sockets.md](file:///c:/padhai/mockmate/mock-interview-platfor/docs/interview/sockets.md), [code-execution.md](file:///c:/padhai/mockmate/mock-interview-platfor/docs/interview/code-execution.md), [performance.md](performance.md).

## Concepts I MUST Study
⚠️ List only.
- Monaco Editor architecture and web worker models
- Synchronizing text state updates safely (debouncing writes)
- Loop back prevention strategies in real-time interfaces
- Custom language service configuration (VSC models)
- Local storage caching for editor code settings
- C++ class text-parsing and entry-point generation (C++ drivers)
- Content Security Policy (CSP) whitelisting for third-party scripts (workerSrc, blob:)
- Virtual layout resizing (reflowing Monaco layout metrics)
- Asynchronous editor assets bootstrapping

## Beginner Interview Questions
- What library does MockMate use to build the coding workspace?
- How is the language syntax highlighting toggled dynamically in the editor?
- What are the starting templates provided for each programming language?
- How does the candidate toggle the editor's stdin console pane?
- What happens when a user clicks the "Run Code" button?

## Intermediate Questions
- Why does the `CodeEditor` use a 350ms timeout debounce timer inside `handleCodeChange`?
- What are the properties of Monaco's default editor options (e.g., `minimap`, `fontSize`, `automaticLayout`) configured in MockMate?
- Explain how `isApplyingRemoteRef` prevents recursive echo loops when socket updates are received from a peer.
- How does the editor prefill its custom stdin field when a question with examples is attached to the room?
- How does Monaco handle resizing when the workspace split-panel divider is dragged?

## Advanced Questions
- Walk through the C++ driver generation logic inside `cppDriver.js`. How does it parse a `class Solution` and output a runnable C++ `main` block?
- Why does `CodeEditor.jsx` keep values inside React refs (`codeRef`, `languageRef`, `codeByLanguageRef`) alongside standard state variables? What stale closure bugs does this prevent?
- How does the Helmet middleware in the backend account for Monaco loading its static script workers from external CDNs (like `https://cdn.jsdelivr.net`)?
- What occurs if a user switches languages in the editor? How is the local code state for the old language preserved?
- If the socket connection drops and re-establishes, how is the Monaco editor state reconciled with the server cache?

## Staff-Level Questions
- Design a collaborative coding workspace that supports line-by-line change authorship tracking (like Google Docs or Git Blame) and highlights peer cursor coordinates in real-time.
- Discuss how you would load Monaco as a local asset bundle via Vite configurations to eliminate the CDN dependency and support offline operations.
- Outline how you would implement code autocompletion (IntelliSense) for custom user classes inside MockMate.

## Questions About MY Implementation
- Why is the debouncing timer set to 350ms specifically on the client, while the server autosave debounce is set to 3 seconds?
- Why did you choose `@monaco-editor/react` instead of CodeMirror or Ace Editor?
- What would break in Monaco rendering if `automaticLayout: true` was removed from options?
- Why does the editor code check `/\bint\s+main\s*\(/.test(src)` before triggering C++ code wrapping?
- What assumptions were made about the layout heights when implementing the drag-to-resize panel divider?

## Follow-up Questions
- Why? What breaks if automatic layouts are disabled?
- What if the user types faster than the 350ms debounce? Are updates lost?
- How does Monaco handle copying and pasting large blocks of text?
- How does it fail if a candidate changes their Java class name inside the editor?

## Code Reading Questions
- In `CodeEditor.jsx`, locate where `Editor` component properties are set.
- Trace the `updateLocalState` function. What variables does it synchronize?
- In `cppDriver.js`, find the regular expression that matches the class methods.
- Trace the mouse move and mouse up event registration for the panel resize drag handles.

## Debugging Questions
- When typing, the cursor jumps to the end of the line on every keypress. Trace how state updates are bound to Monaco's value props.
- Monaco fails to load, throwing `Refused to execute script from ... because of Content Security Policy`. Trace the CSP settings.
- The resize drag handle is sticky, and keeps resizing the console even after releasing the mouse. Trace where the mouseup event listener was lost.
- Swapping languages resets all code states to defaults instead of preserving edits. Trace `codeByLanguageRef`.

## Edge Cases
- Candidate types code containing binary or non-UTF-8 characters.
- Attacker pastes a 5MB source file into Monaco, exceeding payload limits.
- Closing the room workspace page while a compilation request is pending.
- Running code without selecting a language, triggering undefined properties checks.

## Security Questions
- How does MockMate verify that candidates cannot use code editing inputs to inject scripts that execute on the interviewer's browser?
- Why is it critical to filter input test case parameters before executing code?

## Performance Questions
- How does enabling `automaticLayout` impact CPU utilization when resizing browser windows?
- What is the frame-rate cost of reloading Monaco instances when the user navigates between dashboard tabs?

## Scalability Questions
- How would you manage editor state mapping if MockMate allowed 5 concurrent users to code in the same workspace?
- How do you sync workspace configurations (e.g. keybindings like Vim/Emacs) across devices?

## Trade-off Questions
- Loading Monaco from CDN (fast deployment, external dependencies, CSP updates needed) vs local asset build (heavy build bundles, offline-capable).
- Inline code execution (fast, secure RCE threat) vs remote Judge0 execution (slow network hop, fully isolated).

## Refactoring Questions
- Refactor the code resize panel logic to use CSS resize properties instead of custom JavaScript mouse move event listeners.
- Decouple the C++ driver class parser into a clean parser service.

## Whiteboard Questions
- Draw the event flow chart when a user edits code, showing loops prevention filters, debouncers, sockets, and DOM repaints.
- Write the pseudo code of a debounce function.

## Practical Coding Exercises
- Implement a theme toggle button that switches Monaco between `vs-dark` and `light` themes dynamically.
- Write a unit test that validates `splitTopLevel` parses C++ parameter types accurately.

## Revision Checklist
- [ ] I can explain why ref variables are used alongside states in CodeEditor.
- [ ] I can describe the loop-back prevention logic when receiving socket edits.
- [ ] I can detail how Monaco resizes and why layout options are configured.
- [ ] I can explain the C++ class parser mechanics and driver structure.
- [ ] I can identify all whitelisted CSP domains for Monaco CDN resources.
