# StudyNook — Server

The backend API for **StudyNook**, a library study-room booking platform. Built with Express and MongoDB, it handles authentication, room CRUD, search/filtering, and booking with server-side conflict detection.

## Purpose

This API serves the StudyNook client. It owns all authorization and business-rule enforcement (ownership checks, booking overlap detection, password hashing) — the frontend never trusts its own state for anything security-relevant.

## Technologies

- Node.js / Express.js
- MongoDB / Mongoose
- JWT (HTTP-only cookie sessions)
- bcryptjs
- cookie-parser, cors, dotenv

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```
PORT=5000
MONGO_URI=<your MongoDB connection string>
JWT_SECRET=<a long random string>
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

## Installation

```bash
npm install
```

## Seed demo data

```bash
npm run seed
```

Creates a demo user (`demo@studynook.com` / `Demo123!`) and 10 sample rooms.

## Start

```bash
npm run dev     # nodemon, local development
npm start       # production
```

## API Endpoints

### Auth
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | — | Register with name/email/password |
| POST | /api/auth/login | — | Login, sets HTTP-only cookie |
| POST | /api/auth/google | — | Sync/login a Google (Firebase) user |
| POST | /api/auth/logout | — | Clears auth cookie |
| GET | /api/auth/me | ✓ | Returns current user (for auth persistence) |

### Rooms
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | /api/rooms | — | List rooms; supports `search`, `amenities`, `minRate`, `maxRate`, `floor`, `latest` |
| GET | /api/rooms/mine | ✓ | Rooms owned by current user |
| GET | /api/rooms/:id | — | Room details |
| POST | /api/rooms | ✓ | Create room |
| PUT | /api/rooms/:id | ✓ (owner) | Update room |
| DELETE | /api/rooms/:id | ✓ (owner) | Delete room + its bookings |

### Bookings
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | /api/bookings | ✓ | Create booking (409 on time overlap) |
| GET | /api/bookings/my | ✓ | Current user's bookings |
| PATCH | /api/bookings/:id/cancel | ✓ (owner of booking) | Cancel a booking |

## Authentication Architecture

- On login/register/Google sync, the server signs a JWT (`{ userId }`) and sets it as an `httpOnly` cookie (`secure` in production, `sameSite: strict`).
- `authMiddleware` reads `req.cookies.token`, verifies it, and attaches `req.user = { id }`. Missing/invalid/expired tokens return `401`.
- `GET /api/auth/me` lets the client resolve auth state on page load/refresh (no localStorage involved).
- Logout clears the cookie with matching options.
- Room/booking ownership is always re-verified server-side (`req.user.id === resource.owner`) — the frontend's claims about ownership or `userId` are never trusted.

## Deployment (Render)

1. Push this folder to its own GitHub repo (`studynook-server`).
2. Create a new Render "Web Service" from that repo.
3. Build command: `npm install`. Start command: `npm start`.
4. Add the environment variables from `.env.example` in Render's dashboard (`MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` set to your deployed Vercel URL, `NODE_ENV=production`). Render sets `PORT` automatically — `server.js` already reads `process.env.PORT` and binds `0.0.0.0`.
5. If your Vercel client and Render server end up on different domains, remember the `sameSite: "strict"` cookie caveat noted in `src/utils/token.js` — switch it to `"none"` (with `secure: true`) for cross-site cookies to work.

## Notes on Google Auth

`POST /api/auth/google` currently trusts the profile fields the client sends after a successful Firebase sign-in. For a genuinely production-hardened deployment, verify the Firebase ID token server-side with `firebase-admin` before creating/trusting the user record.
