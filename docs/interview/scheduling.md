# Interview Scheduling and Calendar

## Why this topic exists in MockMate
MockMate includes a scheduling system to allow interviewers and candidates to coordinate future interview dates, set durations, outline agendas, and log sessions in a calendar view. The scheduling engine validates time conflicts for both participants and tracks status transitions (scheduled → completed/cancelled/missed).

## Where it is implemented
- [Schedule.model.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/models/Schedule.model.js) — Mongoose schedule schema, status constraints, and compound indexes.
- [schedule.controller.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/controllers/schedule.controller.js) — Controllers for creating schedules, conflict checking, updating status, fetching calendar lists, and canceling.
- [schedule.routes.js](file:///c:/padhai/mockmate/mock-interview-platfor/backend/src/routes/schedule.routes.js) — Route registration, JWT guards, and validation middleware.
- [Schedule.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/pages/Schedule.jsx) — Page view integrating calendar views, booking forms, and schedules list.
- [InterviewCalendar.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/components/schedule/InterviewCalendar.jsx) / [ScheduleForm.jsx](file:///c:/padhai/mockmate/mock-interview-platfor/frontend/src/components/schedule/ScheduleForm.jsx) — Frontend interactive calendar cells and schedule booking inputs.

## Code Flow
1. **Request**: Interviewer fills booking form → client submits payload (room ID, scheduled time, duration, agenda) to `/api/v1/schedule/create` -> validation schema asserts date format, duration ranges (30, 45, 60, 90, 120), and parameter completeness.
2. **Conflict Check**: Controller fetches the room details to ensure candidate has joined, then queries Mongoose for any scheduled interviews that overlap with the proposed timeslot for either the interviewer or the interviewee.
3. **Execution**: If conflicts are absent, creates the Schedule document, updates the target Room status to `scheduled`, fires real-time Socket.IO notifications to both users, and returns the populated schedule.
4. **Status Lifecycle**: When room is started or completed, room controller updates the schedule status accordingly. A cron/check script could mark past uncompleted events as `missed`.

## Components involved
- Schedule Mongoose schema, conflict-checking logic, routing endpoints, React booking calendar, and real-time notification integration.

## Dependencies involved
- `mongoose`, `express`, date parsing APIs.

## Related modules
- [rooms.md](rooms.md) (schedule maps to a Room), [sockets.md](sockets.md) (notifies users on booking), [error-handling.md](error-handling.md) (manages validation exceptions).

## Concepts I MUST Study
⚠️ Do not explain — only list.
- Date and Time management in programming (UTC vs Timezones, ISO 8601)
- Date overlapping logic (mathematical checks for intervals: `startA < endB && endA > startB`)
- Mongoose compound indexing for range queries
- Scheduling Cron jobs / background tasks in Node.js
- ACID transaction locks for scheduling resources
- Calendar UI layout algorithms (Grid mapping, events rendering)
- System Notifications (in-app vs push vs email alerts)
- Conflict resolution algorithms

## Beginner Interview Questions
- What is the purpose of the scheduling system in MockMate?
- What validation checks are run when creating a new schedule?
- What interview durations are currently allowed in MockMate?
- How does the UI represent scheduled interviews on the calendar?
- What happens if you try to schedule an interview in the past?

## Intermediate Questions
- Explain how the conflict-checking function `hasTimeConflict` works mathematically.
- What status changes occur to a schedule when the interviewer cancels the corresponding room?
- How does the database index scheduled interviews to speed up calendar checks?
- Why is it required that the interviewee joins the room before a schedule can be created?
- Can a candidate initiate the scheduling of an interview? Why or why not?

## Advanced Questions
- What happens if the database timezone differs from the client browser's timezone? How is this resolved in MockMate?
- Explain the query structure used to find overlapping schedules. How is it optimized with Mongoose operators?
- Walk through a potential race condition where two interviewers try to schedule the same candidate at the same time. How does MockMate defend against this?
- How would you implement an automated email reminder to fire exactly 10 minutes before a scheduled interview?
- What updates are made to the database when a user cancels a scheduled interview? Are both the Room and Schedule collections updated?

## Staff-Level Questions
- Design a high-capacity calendar service that integrates with Google Calendar API, handling oauth token refreshes and webhook syncs.
- How would you scale the scheduling engine to check conflicts across 100,000 interviewers in real-time under high write-throughput?
- Outline how you would design a system to handle recurring interviews (e.g., weekly syncs) in the database schema.

## Questions About MY Implementation
- Why are the allowed interview durations limited to `[30, 45, 60, 90, 120]`?
- What would happen to the calendar if a scheduled date was saved without time details (00:00:00)?
- Why are there separate indexes for `interviewer + scheduledAt` and `interviewee + scheduledAt` in `Schedule.model.js`?
- What would happen if a schedule status is changed to `missed` but the room status remains `waiting`?
- What assumptions were made about rescheduling an interview?

## Follow-up Questions
- What breaks if we don't index the `scheduledAt` field?
- Why does the schedule form require selecting a Room instead of creating the Room automatically during scheduling?
- How does it fail if a user changes their system clock time before booking?
- What if the candidate is deleted from the user base while they have a pending scheduled interview?

## Code Reading Questions
- Locate `hasTimeConflict` in `schedule.controller.js` and trace the duration multiplier.
- Trace how `selectedRoomId` is assigned from the request body in `createSchedule`.
- In `schedule.routes.js`, trace the middleware chain for `POST /create`.
- Find the calendar render loops in `InterviewCalendar.jsx` and locate how it maps days to events.

## Debugging Questions
- A user reports they can book overlapping interviews. What parameters would you inspect in the conflict checking logic?
- Calendar loading returns empty lists in production but works locally. What timezone issues could cause this?
- You see `ValidationError: Scheduled time is required`. Trace which validation middleware threw this error.
- A scheduled interview is stuck in `scheduled` even though the interview was completed. Trace the room completion lifecycle.

## Edge Cases
- Scheduling a room across the Daylight Saving Time (DST) shift boundary.
- A user books an interview for 23:30 PM with a duration of 120 minutes, crossing into the next calendar day.
- Interviewer schedules a session, and immediately deletes their account before the interview starts.
- Conflict check returns false but database fails to save due to an unrelated connection drop.

## Security Questions
- How does the route check that the requester has the authority to schedule the room?
- How do you prevent a candidate from reading the details of an interviewer's private schedule list?
- What input sanitization is applied to the `agenda` text field to prevent script injection?

## Performance Questions
- How many DB calls are made during a single schedule creation? Can this be optimized?
- What is the impact of populating multiple user fields (`username`, `email`, `avatar`) on dashboard load times?

## Scalability Questions
- If a user has 10,000 historic schedules, how does that affect dashboard load times? How would you implement pagination?
- How would you use Redis caches to store active days for quick rendering of the calendar month grid?

## Trade-off Questions
- Storing schedule states separately from the Room document vs embedding schedule data inside the Room document: discuss.
- Dynamic duration options (any minute value) vs enum restrictions: trace client convenience vs conflict calculation simplicity.

## Refactoring Questions
- Refactor the conflict checking logic to be a static method on the Mongoose Schedule schema.
- Decouple the notification generator into an event listener model.

## Whiteboard Questions
- Write the database schema for a multi-tenant calendar booking system.
- Write a pseudocode function that checks if a list of dates contains any overlaps.

## Practical Coding Exercises
- Implement a route `/api/v1/schedule/reschedule/:id` that updates a schedule's time and recalculates conflicts.
- Write a test suite verifying that overlapping bookings are rejected, covering border alignments (one starts exactly when another ends).

## Revision Checklist
- [ ] I can explain the mathematical logic used to check for overlapping intervals.
- [ ] I can describe the side-effects of scheduling/canceling sessions on the Room collection.
- [ ] I can detail why indexing dates is critical for calendar operations.
- [ ] I can explain why timezone alignment (UTC) is necessary in database engines.
- [ ] I can identify all rejection scenarios in the schedule creation controller.
