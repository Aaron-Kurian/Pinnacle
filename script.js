// ------------------------------------------------------------
// CityTrack - Multi Route Live Tracking
// This script handles:
// 1) Route search by text input
// 2) Route load by dropdown
// 3) Dynamic dashboard updates for selected route
// 4) Leaflet map drawing (polyline, stop markers, bus marker)
// 5) Admin simulation controls
// ------------------------------------------------------------

// All sample route data is stored in one object for easy reuse.
const routesData = {
  "101": {
    busNumber: "MH-01-1014",
    routeName: "Kurla West to BKC",
    start: "Kurla West",
    destination: "BKC",
    distance: "~6.5 km",
    time: "12 mins",
    firstBus: "6:00 AM",
    lastBus: "11:00 PM",
    frequency: "8-10 mins",
    etaMinutes: 12,
    status: "On Time",
    stops: [
      { name: "Kurla West Start", coordinates: [19.088, 72.8787] },
      { name: "Kurla Station", coordinates: [19.0726, 72.8797] },
      { name: "Kurla Bus Depot", coordinates: [19.0675, 72.8815] },
      { name: "Phoenix Marketcity", coordinates: [19.0864, 72.8897] },
      { name: "BKC Destination", coordinates: [19.06, 72.869] }
    ]
  },
  "202": {
    busNumber: "MH-01-2021",
    routeName: "Kurla Station to Andheri",
    start: "Kurla Station",
    destination: "Andheri",
    distance: "~8.2 km",
    time: "18 mins",
    firstBus: "5:45 AM",
    lastBus: "10:30 PM",
    frequency: "10-12 mins",
    etaMinutes: 18,
    status: "On Time",
    stops: [
      { name: "Kurla Station", coordinates: [19.0726, 72.8797] },
      { name: "Saki Naka", coordinates: [19.0995, 72.8867] },
      { name: "Marol Naka", coordinates: [19.1081, 72.8796] },
      { name: "JB Nagar", coordinates: [19.1136, 72.8697] },
      { name: "Andheri Station", coordinates: [19.1197, 72.8464] }
    ]
  },
  "303": {
    busNumber: "MH-01-3035",
    routeName: "Kurla Bus Depot to Ghatkopar",
    start: "Kurla Bus Depot",
    destination: "Ghatkopar",
    distance: "~5.8 km",
    time: "15 mins",
    firstBus: "6:15 AM",
    lastBus: "10:45 PM",
    frequency: "7-9 mins",
    etaMinutes: 15,
    status: "On Time",
    stops: [
      { name: "Kurla Bus Depot", coordinates: [19.0675, 72.8815] },
      { name: "Vidyavihar", coordinates: [19.0807, 72.8964] },
      { name: "Asalpha", coordinates: [19.0915, 72.9011] },
      { name: "Pant Nagar", coordinates: [19.0856, 72.908] },
      { name: "Ghatkopar Station", coordinates: [19.085, 72.9081] }
    ]
  },
  "404": {
    busNumber: "MH-01-4048",
    routeName: "Kurla West to Chembur",
    start: "Kurla West",
    destination: "Chembur",
    distance: "~7.4 km",
    time: "17 mins",
    firstBus: "6:00 AM",
    lastBus: "10:15 PM",
    frequency: "9-11 mins",
    etaMinutes: 17,
    status: "On Time",
    stops: [
      { name: "Kurla West", coordinates: [19.088, 72.8787] },
      { name: "Chunabhatti", coordinates: [19.0515, 72.8695] },
      { name: "Tilak Nagar", coordinates: [19.0695, 72.8972] },
      { name: "Chembur Naka", coordinates: [19.0522, 72.9005] },
      { name: "Chembur Station", coordinates: [19.0623, 72.9005] }
    ]
  },
  "505": {
    busNumber: "MH-01-5052",
    routeName: "Kurla Station to Sion",
    start: "Kurla Station",
    destination: "Sion",
    distance: "~6.1 km",
    time: "14 mins",
    firstBus: "5:50 AM",
    lastBus: "10:00 PM",
    frequency: "8-10 mins",
    etaMinutes: 14,
    status: "On Time",
    stops: [
      { name: "Kurla Station", coordinates: [19.0726, 72.8797] },
      { name: "Dharavi T-Junction", coordinates: [19.042, 72.8586] },
      { name: "Sion Hospital", coordinates: [19.0434, 72.8649] },
      { name: "Sion Circle", coordinates: [19.0398, 72.8619] },
      { name: "Sion Station", coordinates: [19.0433, 72.8647] }
    ]
  }
};

let currentRouteId = null;
let currentStopIndex = 0;
let liveEtaMinutes = 0;
let simulationTimer = null;
let map = null;
let routePolyline = null;
let busMarker = null;
let stopMarkers = [];
let busIcon = null;

const routeInput = document.getElementById("routeInput");
const routeSelect = document.getElementById("routeSelect");
const searchBtn = document.getElementById("searchBtn");
const searchMessage = document.getElementById("searchMessage");
const availableRoutesListEl = document.getElementById("availableRoutesList");
const busNumberEl = document.getElementById("busNumber");
const routeNameEl = document.getElementById("routeName");
const currentLocationEl = document.getElementById("currentLocation");
const nextStopEl = document.getElementById("nextStop");
const etaEl = document.getElementById("eta");
const statusEl = document.getElementById("status");
const routeDistanceEl = document.getElementById("routeDistance");
const routeTimeEl = document.getElementById("routeTime");
const firstBusEl = document.getElementById("firstBus");
const lastBusEl = document.getElementById("lastBus");
const routeFrequencyEl = document.getElementById("routeFrequency");
const stopsListEl = document.getElementById("stopsList");
const onTimeBtn = document.getElementById("onTimeBtn");
const delayedBtn = document.getElementById("delayedBtn");
const manualLocationInput = document.getElementById("manualLocation");
const updateLocationBtn = document.getElementById("updateLocationBtn");
const mapLocationText = document.getElementById("mapLocationText");
const notificationEl = document.getElementById("notification");

// Build dropdown options and available-routes panel from routesData.
function renderRouteChoices() {
  const routeIds = Object.keys(routesData);
  routeSelect.innerHTML = '<option value="">Select route</option>';
  availableRoutesListEl.innerHTML = "";

  routeIds.forEach((routeId) => {
    const route = routesData[routeId];

    const option = document.createElement("option");
    option.value = routeId;
    option.textContent = `${routeId} - ${route.routeName}`;
    routeSelect.appendChild(option);

    const listItem = document.createElement("li");
    listItem.textContent = `${routeId}: ${route.routeName}`;
    availableRoutesListEl.appendChild(listItem);
  });
}

function initializeMap() {
  if (map) return;

  map = L.map("map").setView([19.088, 72.8787], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  busIcon = L.divIcon({
    className: "bus-marker",
    html: '<span class="bus-marker-dot" aria-hidden="true"></span>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14]
  });
}

function showNotification(message) {
  notificationEl.textContent = message;
  notificationEl.classList.remove("hidden");
  setTimeout(() => {
    notificationEl.classList.add("hidden");
  }, 3500);
}

function applyStatusStyle(status) {
  statusEl.classList.remove("status-on-time", "status-delayed", "status-arrived");
  if (status === "Delayed") statusEl.classList.add("status-delayed");
  else if (status === "Arrived") statusEl.classList.add("status-arrived");
  else statusEl.classList.add("status-on-time");
}

function renderStops(stops, activeIndex) {
  stopsListEl.innerHTML = "";
  stops.forEach((stop, index) => {
    const listItem = document.createElement("li");
    listItem.textContent = `${index + 1}. ${stop.name}`;
    if (index === activeIndex) listItem.classList.add("current-stop");
    stopsListEl.appendChild(listItem);
  });
}

// Update all data cards for the selected route.
function updateDashboard(route) {
  const isLastStop = currentStopIndex >= route.stops.length - 1;
  const currentLocation = route.stops[currentStopIndex].name;
  const nextStop = isLastStop ? "Final Stop Reached" : route.stops[currentStopIndex + 1].name;

  busNumberEl.textContent = route.busNumber;
  routeNameEl.textContent = route.routeName;
  currentLocationEl.textContent = currentLocation;
  nextStopEl.textContent = nextStop;
  etaEl.textContent = isLastStop ? "0 min" : `${Math.max(liveEtaMinutes, 0)} min`;
  statusEl.textContent = route.status;

  routeDistanceEl.textContent = route.distance;
  routeTimeEl.textContent = route.time;
  firstBusEl.textContent = route.firstBus;
  lastBusEl.textContent = route.lastBus;
  routeFrequencyEl.textContent = route.frequency;
  mapLocationText.textContent = `Location: ${currentLocation}`;

  applyStatusStyle(route.status);
  renderStops(route.stops, currentStopIndex);
  updateMapForCurrentState(route);
}

// Clear old map layers and redraw with selected route details.
function updateMapForCurrentState(route) {
  if (!map || !route.stops || route.stops.length === 0) return;

  const routeCoordinates = route.stops.map((stop) => stop.coordinates);

  if (routePolyline) map.removeLayer(routePolyline);
  if (busMarker) map.removeLayer(busMarker);
  stopMarkers.forEach((marker) => map.removeLayer(marker));
  stopMarkers = [];

  routePolyline = L.polyline(routeCoordinates, {
    color: "#1f6feb",
    weight: 6,
    opacity: 0.9
  }).addTo(map);

  route.stops.forEach((stop) => {
    const stopMarker = L.marker(stop.coordinates).addTo(map);
    stopMarker.bindPopup(stop.name);
    stopMarkers.push(stopMarker);
  });

  const activeCoordinate = route.stops[currentStopIndex].coordinates;
  busMarker = L.marker(activeCoordinate, { icon: busIcon }).addTo(map);
  busMarker.bindPopup("Current Bus Location").openPopup();
  map.fitBounds(routePolyline.getBounds(), { padding: [30, 30] });
}

function startSimulation(routeId) {
  const route = routesData[routeId];
  if (!route) return;

  if (simulationTimer) clearInterval(simulationTimer);

  simulationTimer = setInterval(() => {
    if (currentStopIndex < route.stops.length - 1) {
      currentStopIndex += 1;
      liveEtaMinutes = Math.max(0, liveEtaMinutes - 3);

      if (currentStopIndex === route.stops.length - 2) {
        showNotification(`Route ${routeId} bus is nearing final stop.`);
      }
    } else {
      route.status = "Arrived";
      clearInterval(simulationTimer);
      simulationTimer = null;
      showNotification(`Route ${routeId} bus reached destination.`);
    }

    updateDashboard(route);
  }, 5000);
}

function loadRoute(routeId) {
  const route = routesData[routeId];
  if (!route) {
    alert("Route not available");
    searchMessage.textContent = "Route not available";
    return;
  }

  currentRouteId = routeId;
  currentStopIndex = 0;
  liveEtaMinutes = route.etaMinutes;
  route.status = "On Time";

  routeInput.value = routeId;
  routeSelect.value = routeId;
  searchMessage.textContent = `Tracking route ${routeId} - ${route.routeName}`;

  initializeMap();
  updateDashboard(route);
  startSimulation(routeId);
}

// Search button supports typed route or dropdown selection.
function handleSearch() {
  const typedRoute = routeInput.value.trim();
  const selectedRoute = routeSelect.value;
  const routeId = typedRoute || selectedRoute;
  loadRoute(routeId);
}

function markOnTime() {
  if (!currentRouteId) return;
  routesData[currentRouteId].status = "On Time";
  updateDashboard(routesData[currentRouteId]);
}

function markDelayed() {
  if (!currentRouteId) return;
  routesData[currentRouteId].status = "Delayed";
  liveEtaMinutes += 5;
  updateDashboard(routesData[currentRouteId]);
}

function updateManualLocation() {
  if (!currentRouteId) return;
  const customLocation = manualLocationInput.value.trim();
  if (!customLocation) return;

  const coordinateParts = customLocation.split(",").map((part) => Number(part.trim()));
  const isValidCoordinate =
    coordinateParts.length === 2 &&
    !Number.isNaN(coordinateParts[0]) &&
    !Number.isNaN(coordinateParts[1]);

  if (isValidCoordinate && map && busMarker) {
    const [lat, lng] = coordinateParts;
    busMarker.setLatLng([lat, lng]).bindPopup("Current Bus Location").openPopup();
    map.panTo([lat, lng]);
    mapLocationText.textContent = `Location: ${lat}, ${lng}`;
    currentLocationEl.textContent = `Manual Coordinates (${lat}, ${lng})`;
    showNotification("Map marker updated with manual coordinates.");
  } else {
    currentLocationEl.textContent = customLocation;
    mapLocationText.textContent = `Location: ${customLocation}`;
    showNotification("Location text updated. Tip: use lat,lng to move marker.");
  }

  manualLocationInput.value = "";
}

searchBtn.addEventListener("click", handleSearch);
routeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") handleSearch();
});

// Dropdown auto-loads route as soon as user chooses one.
routeSelect.addEventListener("change", () => {
  if (!routeSelect.value) return;
  loadRoute(routeSelect.value);
});

onTimeBtn.addEventListener("click", markOnTime);
delayedBtn.addEventListener("click", markDelayed);
updateLocationBtn.addEventListener("click", updateManualLocation);

renderRouteChoices();
searchMessage.textContent =
  "Tip: Type 101/202/303/404/505 or choose a route from the dropdown.";
