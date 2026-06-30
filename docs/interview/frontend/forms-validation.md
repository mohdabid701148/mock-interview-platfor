# Forms & Validation

## Why this topic exists in MockMate
MockMate collects and validates user inputs across several critical features: login credentials authentication, register signup parameters, email verification codes, interview schedules creation, and feedback reports. To prevent invalid inputs from reaching backend servers, MockMate implements React form controllers, validation schemes, regex check helpers, and custom UI error notifications.

## Where it is implemented
- [LoginForm.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/components/auth/LoginForm.jsx) — Login input controller and authentication checks.
- [RegisterForm.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/components/auth/RegisterForm.jsx) — Registers input variables validation.
- [VerifyEmail.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/pages/VerifyEmail.jsx) — Validates 6-digit verification codes.
- [ScheduleForm.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/components/schedule/ScheduleForm.jsx) — Validates scheduling calendars inputs, duration ranges, and dates conflicts.

## UI Flow
User interacts with input forms.
User types email address in Login input field
↓
Input onChange event updates local component state `email`
↓
User clicks "Login" button submitting form
↓
`handleSubmit` intercepts submit event -> calls `event.preventDefault()`
↓
Runs frontend validation checks (validates email regex format, password length)
↓
If invalid: Updates local component state `error` → UI renders alert box
↓
If valid: Sets button state `loading = true` (disables input)
↓
Axios executes authentication endpoint POST `/auth/login`
↓
Server returns response → resolves promise / throws error
↓
Updates UI loading states → routes to dashboard / logs error

## Components Involved
- Form Components: `LoginForm`, `RegisterForm`, `ScheduleForm`, Page Components: `Login`, `Signup`, `VerifyEmail`, `Schedule`.

## Hooks Used
- Built-in hooks: `useState`, `useEffect`.
- Custom hooks: `useAuth` (submits credentials).

## Dependencies Used
- `react`, `lucide-react` (form icons).

## Related Modules
- [authentication-flow.md](authentication.md) (auth backend integration), [error-handling-forms.md](error-handling.md) (error classes).

## Concepts I MUST Study
⚠️ List only.
- Controlled vs Uncontrolled form elements in React
- React synthetic event handling (`event.preventDefault()`, propagation control)
- Client-side validation vs Server-side validation boundaries
- Regex (Regular Expressions) for email and string matches
- Managing loading and disabled states in HTML form fields
- Accessibility in forms (ARIA labels, focus management, screen readers)
- Input sanitization (XSS and SQLi prevention at user input level)
- Custom Form State management libraries vs native React state hooks
- Validating dates and times (ISO, timezone conversion checks)

## Beginner Interview Questions
- What is a controlled component in React?
- Why do we call `e.preventDefault()` inside form submit handlers?
- How is error feedback shown to a user when a form validation fails?
- What happens when a user clicks the register button with a password under 6 characters?
- How is the email input value synchronized with React state?

## Intermediate Questions
- How does the `VerifyEmail` component ensure that only 6-digit values are accepted for verification codes?
- Walk through how `ScheduleForm` validates that scheduled interview dates are not in the past.
- Why is it important to disable input fields and submit buttons while an API request is in progress?
- Explain the regex pattern used to validate email address formatting.
- How does the form state get cleared when a user switches between the login and signup page?

## Advanced Questions
- Walk through how MockMate manages validation error arrays returned from the backend. How are they formatted in the UI?
- If we want to implement asynchronous, real-time validation (e.g. check if a username is already taken as the user types), how would you design this flow?
- What are the pros and cons of using native React state for form inputs vs using a library like React Hook Form or Formik in a large application?
- How does `ScheduleForm` ensure that selected durations conform to allowed range intervals (30, 45, 60, 90, 120 minutes)?
- Discuss the security risks of performing input validations only on the frontend client.

## Staff-Level Questions
- Design a dynamic form builder component for MockMate that loads input schemas, validation rules, and layout structures from a backend JSON configuration dynamically.
- Explain how you would implement a secure client-side form encryption system for sensitive data fields (like API keys) using asymmetric cryptosystems.

## Questions About MY Implementation
- Why does `LoginForm` use simple native states for tracking email and password instead of a form library?
- Why are forms split into dedicated subcomponents (like `RegisterForm`) instead of being embedded directly inside page layout templates?
- What would break in the scheduling system if a client bypassed form date validations via browser inspector modifications?
- Why is the resend verification email trigger not wrapped in a formal form container?
- What assumptions were made about the user's local timezone when selecting dates in `ScheduleForm`?

## Follow-up Questions
- Why? What breaks if you use a direct uncontrolled input?
- How does React optimize keypress rendering when a form contains 20 distinct input fields?
- What if a user submits a form, closes the modal, and reopens it? Is the previous form state preserved?
- How does the UI indicate validation warnings on individual inputs vs overall form errors?

## Code Reading Questions
- In `LoginForm.jsx`, trace the state hooks managing input errors.
- Trace how the `handleSubmit` event executes the `login` function.
- Locate the date validation block inside `ScheduleForm.jsx`.
- In `VerifyEmail.jsx`, trace the `handleVerify` submit pipeline.

## Debugging Questions
- Typing inside the password field causes the focus to jump out of the input box on every character. Trace the key rendering issue.
- Submitting the login form triggers a page refresh, clearing all console logs. Identify the missing event preventDefault call.
- You see `Warning: A component is changing an uncontrolled input to be controlled` in the console. Trace where value props initialized to undefined.
- Validation warnings show in the console, but the error message div does not render in the UI. Trace the conditional rendering state.

## Edge Cases
- Candidate submits a form with all spaces in fields, bypassing simple length checks.
- User selects a date that falls on a system clock change boundary (Daylight Saving Time shift).
- Fast double-clicking of the submit button triggers two concurrent API requests.
- Autofill values loaded by browsers do not fire state change handlers, causing fields to submit empty.

## Security Questions
- How do you prevent DOM injection when rendering user inputs back into error message headers?
- What mechanisms block automated scripts from spamming the registration form endpoints?

## Performance Questions
- How does typing in a controlled input field impact parent component render cycles? How would you optimize?
- Is there any performance gain of using refs instead of state hooks to read form values on submit?

## Accessibility Questions
- Do input fields have corresponding `<label>` tags with matching identifiers for accessibility?
- How does the screen reader notify visually impaired users that an input validation warning has appeared?

## Scalability Questions
- If MockMate adds 10 new input forms, how would you standardize styling and validation schemas to avoid code churn?
- How do you scale localized form error messages if the platform adds support for multi-language layouts?

## Trade-off Questions
- Native React state forms (simple, zero dependencies) vs React Hook Form (optimized renders, schema validations libraries, heavy package weights).
- Real-time validation as user types vs Validation on submit: discuss.

## Refactoring Questions
- Refactor `RegisterForm.jsx` to use a validation scheme (like Zod or Joi schemas) to validate inputs.
- Create a custom hook `useForm` that handles values tracking, submits, error lists, and loading indicators.

## Whiteboard Questions
- Write the pseudo code of a form submit controller showing validators, API calls, loading states, and exception catch blocks.
- Draw the component data flow diagram when a user fills a form field and hits submit.

## Practical Coding Exercises
- Implement a custom `<TextInput>` component that renders labels, input tags, and error alert nodes based on props configurations.
- Write a unit test that verifies the login submit button is disabled when inputs are empty.

## Revision Checklist
- [ ] I can describe the difference between controlled and uncontrolled components.
- [ ] I can explain the validation pipeline for user signups.
- [ ] I can detail why date validations require timezone handling.
- [ ] I can explain how to prevent double submit actions in forms.
- [ ] I can justify the choice of native states over form libraries in MockMate.
