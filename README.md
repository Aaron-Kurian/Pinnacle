# Real Time Transport Tracking for Small Cities

A complete college-demo web project built with **HTML, CSS, and JavaScript** (no frameworks).

## 1) Working Model (What You Can Show)

This project is a working simulation model of a small-city transport tracking system:

- Search bus route by route number (`101`, `202`, `303`)
- View live vehicle details (bus number, route, location, next stop, ETA, status)
- See ordered route stops with current stop highlighted
- Watch real-time movement simulation every few seconds
- Use admin controls to set `On Time`/`Delayed` and manually update location
- View live route on an interactive map with moving bus marker
- Get notifications when vehicle is near final stop and when it arrives
- Responsive, professional UI with a blue-white card-based design

## 2) File Structure

- `index.html` -> page structure and UI sections
- `style.css` -> responsive styles, colors, cards, status badges
- `script.js` -> dummy data, search logic, simulation engine, admin controls

## 3) Models Included

### A) Data Model

Each route contains:

- `busNumber`
- `start`
- `destination`
- `stops` (ordered array)
- `etaMinutes`
- `status`

Example:

```js
{
  "101": {
    busNumber: "BUS-101A",
    start: "Central Market",
    destination: "City Hospital",
    stops: ["Central Market", "River Bridge", "Town Hall", "Library Junction", "City Hospital"],
    etaMinutes: 20,
    status: "On Time"
  }
}
```

### B) System Model

Flow:

1. User enters route number and clicks `Search`
2. App loads route data from in-memory dataset
3. UI renders vehicle details + stops
4. `setInterval` simulates movement between stops
5. Admin panel can override status/location at any time

### C) Simulation Model

- Timer ticks every 5 seconds
- On each tick:
  - Current stop index moves forward by 1
  - ETA decreases
  - UI updates current location and next stop
- At final stop:
  - Status becomes `Arrived`
  - Timer stops

## 4) How to Run

### Option 1 (Simplest)

1. Open the project folder.
2. Double-click `index.html`.
3. Use the app directly in your browser.

### Option 2 (VS Code / Live Server)

1. Open folder in editor.
2. Start Live Server on `index.html`.
3. Interact with the app.

## 5) Demo Script for Teacher (2-3 Minutes)

1. Open app and explain navigation + card UI.
2. Search route `101`.
3. Show details and highlighted current stop.
4. Wait one simulation cycle (5 sec) to show live movement.
5. Click `Set Delayed` and show status/ETA change.
6. Use manual location update.
7. Show near-final-stop and arrival notifications.

## 6) Notes

- This is a frontend simulation (no backend/database required).
- Internet connection is needed to load OpenStreetMap tiles for the map view.
- Designed to be beginner-friendly with clear comments and modular JS functions.
- Easy to extend with real GPS APIs later.
