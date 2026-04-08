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

Seed the database:

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

## Test Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@test.com | password123 | Admin |
| client@test.com | password123 | Client |

---

## External APIs

- Open-Meteo (weather data, no API key required)
- ExchangeRate API (currency conversion, requires API key)

---

## Notes

- Make sure to create a `.env` file before running the backend.
- Run `npm install` in both `client/` and `server/` before starting.
