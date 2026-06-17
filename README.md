# University Club Management Portal

A full-stack, role-based web application for managing university student clubs, memberships, and events. Built as a graduation project for the Computer Engineering department at Istanbul Arel University.

## Table of Contents

- [Overview](#overview)
- [The Problem](#the-problem)
- [Tech Stack](#tech-stack)
- [Why This Stack](#why-this-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [User Roles](#user-roles)
- [Project Structure](#project-structure)
- [Backend Walkthrough](#backend-walkthrough)
- [Frontend Walkthrough](#frontend-walkthrough)
- [Setup Instructions](#setup-instructions)
- [Known Limitations](#known-limitations)
- [Future Work](#future-work)

## Overview

University clubs at Istanbul Arel University currently manage their operations through informal tools — WhatsApp groups for announcements, Google Forms for attendance, and spreadsheets for membership tracking. This creates real problems: announcements get missed, organizers have no reliable headcount before an event, and the university has no centralized way to oversee what clubs are actually doing.

This project replaces that fragmented workflow with a single, structured platform. It has three distinct user roles — Student, Club Admin, and Super Admin — each with their own interface and capabilities, all enforced at the server level rather than just suggested by the UI.

## The Problem

Specifically, the informal approach fails in these ways:

- **No enforcement.** A club admin can ask people to RSVP by a certain date, but nothing stops someone from registering late or cancelling at the last minute.
- **No capacity tracking.** If an event has 30 seats, there's no automatic way to stop the 31st person from showing up expecting a spot.
- **No oversight.** The university has no single place to see all clubs, all events, or all memberships — everything lives in scattered group chats and spreadsheets.
- **No notification trail.** If an event's time or location changes, there's no guarantee everyone who said they'd attend actually sees the update.

This project solves all four by moving the rules into the backend, where they're enforced regardless of how someone tries to use the system.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | PostgreSQL |
| Authentication | JWT (JSON Web Tokens) + bcrypt |
| CI/CD | GitHub Actions (ESLint on every push) |

## Why This Stack

This section explains the actual reasoning behind each choice — not just what was used, but why, and what the alternatives were.

### Why React (and not Vue or Angular)

React was chosen for its component-based architecture, which made it straightforward to build three distinct role-based UIs (Student, Club Admin, Super Admin) while still sharing common patterns like the navbar and authentication checks. Vue.js offers similar benefits and was a real alternative, but React's significantly larger ecosystem, more abundant documentation, and wider industry adoption made it the more practical choice for a project where most learning resources and Stack Overflow answers are React-specific. Angular was ruled out early — it's a much heavier, more opinionated framework with a steep learning curve, and its scale didn't match the size of this project.

### Why Node.js + Express (and not Django, Spring Boot, or Laravel)

Node.js was chosen primarily because it allowed JavaScript to be used across both the frontend and backend, eliminating the need to context-switch between languages and making it easy to reason about data shapes consistently from the browser all the way to the database. Express.js specifically (rather than a heavier Node framework) was chosen because it imposes very little structure — it's just a thin routing and middleware layer, which suited a project where the developer wanted full control over folder structure and request handling rather than following a rigid framework convention. Django (Python) and Spring Boot (Java) are both excellent, mature frameworks, but they would have introduced a second language into the stack and came with more built-in structure (ORMs, admin panels, dependency injection) than this project's scope required. Laravel (PHP) was considered but ruled out for the same reason — introducing a third language ecosystem with no clear benefit over staying in JavaScript.

### Why PostgreSQL (and not MySQL or MongoDB)

This is the most important technology decision in the project, and it's worth explaining in depth.

The data in this system is fundamentally **relational**: a student can belong to many clubs, a club can have many members, a club hosts many events, an event can have many RSVPs. These are classic one-to-many and many-to-many relationships that need to be enforced with foreign keys — for example, an RSVP must reference a real event and a real user, and if either is deleted, the RSVP should be cleaned up automatically (cascade deletion).

**Why not MongoDB?** MongoDB is a document-oriented (NoSQL) database, which excels when data is loosely structured, doesn't have strict relationships, or needs to scale horizontally across many servers with flexible schemas. None of those properties describe this project's data. Modeling clubs, events, and RSVPs in MongoDB would mean either embedding documents inside each other (which breaks down quickly when an event needs to reference both a club and many users) or manually managing reference IDs without the database ever enforcing that those references are valid. PostgreSQL enforces this automatically through foreign key constraints — the database itself guarantees that an RSVP can never point to an event that doesn't exist.

**Why not MySQL?** MySQL was a closer alternative since it's also a relational database, but PostgreSQL was chosen for a few concrete reasons specific to this project: native UUID generation (`gen_random_uuid()`) was used for all primary keys instead of auto-incrementing integers, specifically to prevent enumeration attacks where someone could guess valid record IDs by incrementing a number. PostgreSQL has cleaner native support for this. PostgreSQL is also generally considered to have stricter standards compliance and more robust handling of complex queries and constraints, which matched the project's emphasis on enforcing business rules at the database level.

### Why JWT (and not server-side sessions)

JWT (JSON Web Tokens) were chosen because they're stateless — the server doesn't need to store any session data anywhere. When a user logs in, the server signs a token containing their user ID and role, and on every subsequent request, the server simply verifies the token's signature without needing to look anything up in a session store. This fits naturally with a REST API architecture, where each request is expected to be independent and self-contained. Server-side sessions are a real and valid alternative, but they require maintaining a session store (in memory or in a separate database/cache like Redis) and looking it up on every request, which adds infrastructure complexity that wasn't necessary for a project of this scale.

### Why Tailwind CSS (and not Bootstrap or plain CSS)

Tailwind's utility-first approach means styling happens directly in the markup through className combinations, rather than writing and maintaining separate CSS files. This was especially useful for quickly building three visually distinct role-based interfaces (blue for student, purple for club admin, yellow for super admin) without needing to maintain three separate stylesheets. Bootstrap was considered but rejected because its pre-built components come with their own visual identity that would need to be heavily overridden to achieve a custom look, effectively fighting the framework rather than using it. Writing plain CSS from scratch was also considered but would have taken significantly more development time for a solo project with a fixed deadline.

## Architecture

The application follows a standard three-tier client-server architecture:

```
React Client  →  Express.js API  →  PostgreSQL Database
```

The frontend never communicates with the database directly. Every request goes through the Express API, which is responsible for:

1. **Authentication** — verifying the JWT token on every protected request
2. **Authorization** — checking that the user's role is permitted to access the requested route
3. **Validation** — checking business rules (capacity limits, deadlines, email domain) before touching the database
4. **Data access** — running parameterized SQL queries against PostgreSQL

This separation means the same backend could, in theory, serve a completely different frontend (a mobile app, for example) without any changes, since all the real logic lives in the API layer.

## Database Schema

The database has seven tables:

| Table | Purpose |
|---|---|
| `users` | All accounts — students, club admins, and the super admin — with role stored as a column |
| `clubs` | Club name, description, and image URL |
| `club_admins` | Maps a user to the single club they administer |
| `club_members` | Maps users to the clubs they've joined (many-to-many) |
| `events` | Event details including date, end_date, rsvp_deadline, capacity, and members_only flag |
| `rsvps` | Maps users to the events they've registered for (many-to-many) |
| `notifications` | Activity feed entries — club joins, RSVPs, and event update alerts |

All primary keys are UUIDs rather than sequential integers, specifically to prevent enumeration attacks. Foreign keys use `ON DELETE CASCADE` where appropriate (e.g. deleting a club removes its events, members, and admin assignment automatically) and `ON DELETE SET NULL` for `created_by` columns, so historical records survive even if the creating user is later deleted.

## User Roles

### Student
The default role for anyone who registers with a valid `@istanbularel.edu.tr` email. Students can browse and join clubs, RSVP to events, and track their activity on a personalized dashboard with a calendar view.

### Club Admin
Cannot self-register — a student is promoted to club admin by the Super Admin for a specific club. Club admins manage their own club's events (create, edit, delete), view RSVP lists, and manage club membership. Promoting a user to club admin automatically adds them to that club's membership list, so they can RSVP to their own club's members-only events.

### Super Admin
A single account, seeded directly into the database rather than created through the UI (since there's no safe way to let someone grant themselves this role through registration). The Super Admin can create, edit, and delete any club; promote or demote club admins; view and manage every event across every club; and view platform-wide statistics.

## Project Structure

```
/client                          ← React frontend
  /src/pages/
    Login.jsx, Register.jsx
    Dashboard.jsx                ← Student home: clubs, RSVPs, calendar, activity
    Clubs.jsx, Events.jsx        ← Browse pages
    ClubDetail.jsx, EventDetail.jsx
    /clubadmin/                  ← Purple-themed club admin panel
    /superadmin/                 ← Yellow-themed super admin panel

/server                          ← Node.js backend
  app.js                         ← Entry point
  /config/
    db.js                        ← PostgreSQL connection pool
    schema.sql                   ← All table definitions
    notify.js                    ← Shared notification helper
  /middleware/
    auth.js                      ← authenticate + authorize functions
  /routes/
    auth.js, clubs.js, events.js, rsvps.js, notifications.js, admin.js, clubAdmin.js

/docs
  er-diagram.md                  ← Mermaid ER diagram (renders on GitHub)
```

## Backend Walkthrough

### Authentication (`routes/auth.js`)

Registration validates that the email ends in `@istanbularel.edu.tr`, hashes the password with bcrypt (10 rounds), and inserts a new user with the default `student` role. Login compares the submitted password against the stored hash using `bcrypt.compare()`, and on success signs a JWT containing the user's ID and role with a 7-day expiration.

### Middleware (`middleware/auth.js`)

Two functions guard every protected route:

- `authenticate` extracts the JWT from the `Authorization` header, verifies its signature, and attaches the decoded payload to `req.user`. If the token is missing or invalid, it returns 401 Unauthorized.
- `authorize(...roles)` checks that `req.user.role` is one of the permitted roles for that route. If not, it returns 403 Forbidden.

These compose on each route — for example, `authenticate, authorize('club_admin')` ensures only a logged-in club admin can hit that endpoint.

### RSVP Logic (`routes/rsvps.js`)

The RSVP route runs through several checks in order before inserting a record: whether the RSVP deadline has passed, whether the event is at capacity, and (for members-only events) whether the requesting user is actually a member of the hosting club or an admin of it. Cancellation is also blocked after the deadline, on the reasoning that event organizers may have already committed to fixed costs (like a headcount-based catering order) that can't be walked back at the last minute.

### Notifications (`config/notify.js`)

A single shared helper, `notify(userId, type, message)`, inserts a row into the `notifications` table. It's called from multiple places: when a student joins a club, RSVPs to an event, cancels an RSVP, or when a club admin edits an event — in which case the route queries all RSVPs for that event and calls `notify()` once per registered student.

## Frontend Walkthrough

### Role-Based Routing

Each protected page checks `localStorage` for a stored user object on mount. If none exists, it redirects to `/login`. If a user is present but their role doesn't match the page's intended audience, the page either hides certain UI elements or redirects entirely. For example, the Super Admin viewing a club's detail page (which is otherwise a student-facing page) sees the join button hidden, the main navbar links replaced with a "Viewing as Super Admin" label, and the RSVP button hidden entirely on the event detail page — preventing the Super Admin from accidentally taking student-only actions while still letting them inspect the page's content.

### The Calendar Component (`Dashboard.jsx`)

The student dashboard includes a hand-built monthly calendar (no external calendar library). It calculates the weekday offset for the 1st of the displayed month, renders a 7-column grid, and highlights any day that has an RSVPd event with a colored chip showing the event's truncated title. Clicking a day updates a `selectedDate` state variable, which the event-preview panel on the left reads to show that day's events.

### Event State Calculation

Rather than trusting a static `status` column from the database (which never changes once an event is created), every page that displays an event's status calculates it live with a `getEventState()` function:

```javascript
const getEventState = (event) => {
  const now = new Date()
  const start = new Date(event.date)
  const end = event.end_date ? new Date(event.end_date) : start
  if (end < now) return 'past'
  if (start <= now && now <= end) return 'ongoing'
  return 'upcoming'
}
```

This correctly handles multi-day events — an event that started yesterday and ends tomorrow shows as "ongoing," not "past," because the function checks the full date range rather than just the start date.

## Setup Instructions

1. Clone the repository
2. Set up PostgreSQL and run `server/config/schema.sql` to create all tables
3. In `/server`, run `npm install`, create a `.env` file with your database credentials and a `JWT_SECRET`, then run `node app.js`
4. In `/client`, run `npm install` then `npm run dev`
5. Visit `http://localhost:5173`

A super admin account must be seeded directly into the database — there's no registration path for this role by design.

## Known Limitations

- The system has not been deployed to a public server; all testing was conducted locally
- Club and event images are provided as URLs rather than uploaded files, so availability depends on external hosting
- There is no event approval workflow — club admins can publish events without Super Admin review
- If a Super Admin promotes or demotes a user who is currently logged in, that user's frontend UI won't reflect the change until they log out and back in (though the backend correctly enforces their new role immediately on every request — this is a frontend caching gap, not a security issue)

## Future Work

- **Event approval workflow** — Super Admin reviews events before they go live to students
- **Club membership request system** — selective clubs gate membership behind an application form
- **Cloud deployment** — Railway for backend and database, Vercel for frontend
- **Cloudinary image upload** — replacing the current URL-based image input
- **Mobile application**
- **Event-linking notifications** — a button on update notifications that navigates directly to the affected event (currently deferred, as it requires adding an `event_id` column to the `notifications` table)
- **Password strength requirements**

---

Built by Ehab Saleh Gaafar Noor (220303915) — Computer Engineering, Istanbul Arel University. Supervised by Tuğberk Kocatekin.
