# Smart Trip Budget Estimator

A web-based trip cost estimation application built with React and Vite.
Plan your trip by entering your origin, destination, travel dates, and preferences
to receive a structured cost breakdown including flights, lodging, food, and transport.

---

## Team

- Hamza Habib
- Syed Hussein  
- Patrick Huynh

---

## Tech Stack

- React 18
- Vite
- React Router v6

---

## Getting Started

### 1. Clone the repository

git clone <repo-url>
cd <project-folder>

### 2. Navigate into the Vite project

cd <vite-folder-name>

### 3. Install dependencies

npm install

### 4. Start the development server

npm run dev

### 5. Open in browser

Visit http://localhost:5173

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — trip search form |
| `/results` | Estimated cost breakdown for a trip |
| `/login` | User login |
| `/register` | User registration |
| `/trips` | Saved trips list (requires login) |
| `/trips/:tripId` | Saved trip detail view |
| `/admin` | Admin dashboard |
| `/admin/cities` | Manage supported cities |

---

## Project Structure
```
src/
  components/
    Navbar.jsx        # Site navigation, handles guest/user/admin states
    Footer.jsx        # Site footer
    TripCard.jsx      # Reusable card component for saved trips
  pages/
    Home.jsx          # Trip search form
    Results.jsx       # Cost estimate results
    Login.jsx         # Login form
    Register.jsx      # Registration form
    trips/
      TripList.jsx    # Saved trips list
      TripDetail.jsx  # Individual trip detail
    admin/
      AdminDashboard.jsx  # Admin stats overview
      AdminCities.jsx     # City management
  data/
    mockData.js       # Mock cities, trips, and users for frontend prototype
  index.css           # Global styles and CSS variables
  App.jsx             # Route definitions
  main.jsx            # App entry point
```

---

## Notes

- This is currently a **frontend prototype**. There is no backend or database connected at this stage.
- All trip data is sourced from `src/data/mockData.js` as placeholder data.
- The **Save Trip** button on the Results page is a placeholder — saving functionality will be implemented once the backend is connected.
- To simulate different navigation states, open `src/components/Navbar.jsx` and change the `mockUser` variable:
```js
const mockUser = null              // Guest (default)
const mockUser = { role: 'client' } // Logged in user
const mockUser = { role: 'admin' }  // Admin
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
