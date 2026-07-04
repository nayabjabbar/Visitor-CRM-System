# Mini Visitor CRM System

A full-stack internal tool for logging customers and front-desk visitors.

- **Frontend:** Next.js (Pages Router) + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB (via Mongoose)
- **Auth:** JWT, hardcoded/dummy demo credentials (as required by the assignment)

---

## 1. Project structure

```
visitor-crm/
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── middleware/auth.js    # JWT route protection
│   ├── models/                # Customer.js, Visitor.js (Mongoose schemas)
│   ├── routes/                 # auth.js, customers.js, visitors.js
│   ├── seed.js                # inserts sample data
│   ├── server.js              # Express app entry point
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── pages/                  # login.js, dashboard.js, customers.js, visitors.js
    ├── components/            # Layout.js, Modal.js, StatCard.js
    ├── lib/                     # api.js (axios client), auth.js (session helpers)
    ├── styles/globals.css
    ├── .env.local.example
    └── package.json
```

---

## 2. Prerequisites

- Node.js 18+ and npm
- A MongoDB database — either:
  - **Local MongoDB** (install MongoDB Community Server and run `mongod`), or
  - **MongoDB Atlas** (free cloud cluster — recommended, no local install needed): https://www.mongodb.com/cloud/atlas/register

---

## 3. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and set your `MONGO_URI`:

```
# Local Mongo
MONGO_URI="mongodb://127.0.0.1:27017/visitor_crm"

# OR MongoDB Atlas
MONGO_URI="mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/visitor_crm"

JWT_SECRET="replace-this-with-a-long-random-secret"
ADMIN_EMAIL="admin@crm.com"
ADMIN_PASSWORD="Admin@123"
PORT=5000
CLIENT_ORIGIN="http://localhost:3000"
```

Seed a few sample customers/visitors (optional but recommended):

```bash
npm run seed
```

Start the API:

```bash
npm run dev        # with nodemon (auto-restart)
# or
npm start
```

The API will run at **http://localhost:5000**. Check `GET /api/health` to confirm it's up.

---

## 4. Frontend setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
```

`.env.local` should point at your backend:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
```

Open **http://localhost:3000** — you'll be redirected to `/login`.

**Demo login:** `admin@crm.com` / `Admin@123` (matches whatever you set in the backend `.env`).

---

## 5. Features implemented (per assignment spec)

- **Auth:** Login page with email/password validation, dummy hardcoded credentials checked server-side, JWT issued on success, dashboard routes protected (redirect to `/login` if no valid token).
- **Customer Module:** Add, list, search (by name/company), edit, delete. Fields: Name, Email, Phone, Company, Status (Active/Inactive).
- **Visitor Module:** Check-in form, live "checked in" status, checkout button, full searchable/paginated history. Fields: Visitor Name, Phone, Person to Meet, Purpose, Check-In Time.
- **Dashboard:** Total Customers, Active Customers, Visitors Today, Checked-In Visitors — pulled live from the API.
- **Validation:** Email format, phone format, required fields — enforced on both frontend (inline errors) and backend (`express-validator`, proper 400/401/404/409 responses).
- **Bonus implemented:** Dark mode toggle (persisted), pagination on both Customers and Visitor History tables, responsive layout (mobile nav + desktop sidebar).

---

## 6. API Endpoints

All `/api/customers/*` and `/api/visitors/*` routes require:
`Authorization: Bearer <token>` (obtained from `/api/auth/login`).

### Auth
| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/api/auth/login` | `{ email, password }` | Returns `{ token, user }` |

### Customers
| Method | Endpoint | Body / Query | Description |
|---|---|---|---|
| GET | `/api/customers?search=&page=&limit=` | — | List customers, search by name/company, paginated |
| GET | `/api/customers/stats` | — | `{ totalCustomers, activeCustomers }` for dashboard |
| POST | `/api/customers` | `{ name, email, phone, company, status }` | Create customer |
| PUT | `/api/customers/:id` | `{ name, email, phone, company, status }` | Update customer |
| DELETE | `/api/customers/:id` | — | Delete customer |

### Visitors
| Method | Endpoint | Body / Query | Description |
|---|---|---|---|
| POST | `/api/visitors/checkin` | `{ name, phone, personToMeet, purpose }` | Check in a visitor |
| PUT | `/api/visitors/:id/checkout` | — | Check out a visitor |
| GET | `/api/visitors/history?search=&page=&limit=` | — | Visitor history, searchable, paginated |
| GET | `/api/visitors/stats` | — | `{ visitorsToday, checkedInVisitors }` for dashboard |

**Error responses** are consistent JSON, e.g.:
```json
{ "error": "Invalid email or password." }
{ "errors": [ { "path": "email", "msg": "A valid email is required." } ] }
```

---

## 7. Database Schema

### Customer
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| email | String | required, unique |
| phone | String | required |
| company | String | optional |
| status | String | `ACTIVE` \| `INACTIVE`, default `ACTIVE` |
| createdAt / updatedAt | Date | auto (Mongoose timestamps) |

### Visitor
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| phone | String | required |
| personToMeet | String | required |
| purpose | String | required |
| checkInTime | Date | default: now |
| checkOutTime | Date | null until checked out |
| createdAt | Date | auto |

---

## 8. Deployment

### Frontend → Vercel
1. Push this repo to GitHub.
2. Import the repo in Vercel, set the **root directory** to `frontend`.
3. Add environment variable: `NEXT_PUBLIC_API_URL` = your deployed backend URL (e.g. `https://your-api.onrender.com/api`).
4. Deploy.

### Backend → Render / Railway
1. Create a new Web Service, root directory `backend`, build command `npm install`, start command `npm start`.
2. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CLIENT_ORIGIN` (your Vercel URL), `PORT`.
3. Use a MongoDB Atlas connection string for `MONGO_URI` (a local Mongo instance won't be reachable from the cloud).

---

## 9. Notes for the technical interview

- Auth uses JWT (not sessions) so the API stays stateless — the frontend stores the token in `localStorage` and attaches it via an axios interceptor.
- All customer/visitor routes are protected by `middleware/auth.js`, which verifies the JWT before hitting the database.
- Validation runs in two layers: inline checks in React for instant feedback, and `express-validator` on the backend so the API is never trusted to the client alone.
- Search and pagination are done server-side (MongoDB query + `skip`/`limit`) rather than client-side filtering, so the UI stays fast as data grows.
