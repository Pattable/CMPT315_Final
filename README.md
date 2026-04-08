# Smart Trip Budget Estimator

Hamza Habib, Syed Hussein, Patrick Huynh

---

## Setup Instructions

### 1. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside the `server/` folder:

```
PORT=5001
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=any_random_string
CURRENCY_API_KEY=your_exchangerate_api_key
```

Seed the database (adds cities and lodging data):

```bash
node seed.js
```

Start the backend server:

```bash
node server.js
```

Backend runs on: http://localhost:5001

---

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend runs on: http://localhost:5173 (or 5174)

If the frontend runs on a different port, update the `cors` origin in `server/server.js`.

---

## User Accounts

- Users can register through the application using the Register page.
- New accounts are created with the **client** role by default.

### Admin Access

- Admin accounts are not created automatically.
- To make a user an admin:
  1. Go to your MongoDB database (MongoDB Atlas).
  2. Open the `users` collection.
  3. Find the user document.
  4. Change the `role` field from `"client"` to `"admin"`.

Admins have access to:
- Admin dashboard
- City management (add, edit, delete cities and lodging options)

---

## External APIs

- Open-Meteo — weather data (no API key required)
- ExchangeRate API — currency conversion (requires API key)

---

## Notes

- Make sure to create a `.env` file before running the backend.
- Run `npm install` in both `client/` and `server/` before starting.
