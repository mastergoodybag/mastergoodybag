// ===== GLOBALS =====
let campusMap, baseLayers = {}, overlayLayers = {}, searchLayer, userLocationMarker;
let currentCampus = 'Ugbowo';
let routingControl = null;
const API_KEY = "5e1e7f2a-37ea-47a5-a38c-9a17897305b8"; // GraphHopper API key

// Campus data (Ugbowo & Ekenwan) – tweak coords as needed
const campuses = {
  Ugbowo: {
    center:[6.4000,5.6180], 
    zoom:16,
    bounds: [[6.38, 5.59], [6.42, 5.63]], // Bounds for Ugbowo campus
    locations:{
      buildings:[
        {id:'admin', name:'Administrative Block', coords:[6.3975,5.6045], type:'administrative', description:'Main administrative offices and registrar'},
        {id:'library', name:'John Harris Library', coords:[6.395656,5.613654], type:'academic', description:'Central university library'},
        {id:'lt1', name:'Lecture Theatre 1', coords:[6.3990,5.6035], type:'academic', description:'Large lecture hall for general courses'},
        {id:'lt2', name:'Lecture Theatre 2', coords:[6.3995,5.6030], type:'academic', description:'Secondary lecture hall'},
        {id:'vc_lodge', name:'Vice Chancellor Lodge', coords:[6.3970,5.6055], type:'administrative', description:'Official residence of the Vice Chancellor'},
        {id:'senate_building', name:'Senate Building', coords:[6.3980,5.6048], type:'administrative', description:'University Senate meeting hall'},
        {id:'student_affairs', name:'Student Affairs Complex', coords:[6.3992,5.6038], type:'administrative', description:'Student services and affairs office'},
        {id:'health_center', name:'University Health Center', coords:[6.3965,5.6025], type:'medical', description:'Campus medical center'},
        {id:'sports_complex', name:'Sports Complex', coords:[6.4010,5.6020], type:'recreational', description:'Main sports and recreation facility'},
        {id:'bookshop', name:'University Bookshop', coords:[6.3988,5.6042], type:'commercial', description:'Official university bookstore'},
        {id:'Auditorium', name:'Akin Deko Auditorium', coords:[6.399767,5.613627], type:'Hall', description:'Auditorium Hall'}
        
      ],
      faculties:[
        {id:'engineering',name:'Faculty of Engineering',coords:[6.401914,5.615652],type:'faculty',description:'Engineering programs and departments'},
        {id:'medicine',name:'College of Medical Sciences',coords:[6.3955,5.6065],type:'faculty',description:'Medical and health sciences programs'},
        {id:'law',name:'Faculty of Law',coords:[6.3998,5.6025],type:'faculty',description:'Legal studies and jurisprudence'},
        {id:'arts',name:'Faculty of Arts',coords:[6.3985,5.6055],type:'faculty',description:'Humanities and liberal arts'},
        {id:'social_sciences',name:'Faculty of Social Sciences',coords:[6.3995,5.6050],type:'faculty',description:'Social sciences and behavioral studies'},
        {id:'education',name:'Faculty of Education',coords:[6.3975,5.6060],type:'faculty',description:'Educational studies and teacher training'},
        {id:'pharmacy',name:'Faculty of Pharmacy',coords:[6.3960,5.6070],type:'pharmaceutical sciences'},
        {id:'agriculture',name:'Faculty of Agriculture',coords:[6.4020,5.6010],type:'faculty',description:'Agricultural sciences and farming'},
        {id:'life_sciences',name:'Faculty of Life Sciences',coords:[6.4000,5.6020],type:'faculty',description:'Biological and life sciences'},
        {id:'physical_sciences',name:'Faculty of Physical Sciences',coords:[6.4010,5.6025],type:'faculty',description:'Physics, chemistry, mathematics, and related fields'},
        {id:'environmental_sciences',name:'Faculty of Environmental Sciences',coords:[6.4015,5.6030],type:'faculty',description:'Environmental studies and sustainability'},
        {id:'clinical_sciences',name:'Faculty of Clinical Sciences',coords:[6.3950,5.6075],type:'faculty',description:'Clinical medical specialties'},
        {id:'basic_medical_sciences',name:'Faculty of Basic Medical Sciences',coords:[6.3945,5.6080],type:'faculty',description:'Basic medical and biomedical sciences'},
        {id:'dentistry',name:'Faculty of Dentistry',coords:[6.3940,5.6085],type:'faculty',description:'Dental medicine and oral health'},
        {id:'management_sciences',name:'Faculty of Management Sciences',coords:[6.3990,5.6045],type:'faculty',description:'Business, accounting, and management studies'}
      ],
      hostels:[
        {id:'lydia_hall',name:'Hall 2 (Lydia Hall)',coords:[6.3960,5.6193],capacity:400,description:'Female undergraduate accommodation'},        {id:'amadu_hall',name:'Hall 3 (Amadu Bello Hall)',coords:[6.3972,5.6190],capacity:500,description:'Male undergraduate accommodation'},
        {id:'new_benin',name:'New Benin Hostel',coords:[6.3920,5.6100],capacity:900,description:'Mixed gender student accommodation'},
        {id:'honours',name:'Honours Hostel',coords:[6.3935,5.6085],capacity:400,description:'Postgraduate student accommodation'},
        {id:'daniel_hall',name:'Daniel Hall',coords:[6.3940,5.6080],capacity:500,description:'Male undergraduate accommodation'},
        {id:'idia_hall',name:'Hall 1(Queen Idia Hostel)',coords:[6.396696,5.618913],capacity:450,description:'Female undergraduate accommodation'},
        {id:'emotan_hall',name:'Emotan Hall',coords:[6.3950,5.6070],capacity:550,description:'Female student accommodation'},
        {id:'akenzua_hall',name:'Akenzua Hall',coords:[6.3955,5.6065],capacity:650,description:'Male student accommodation'}
      ],
      cafeterias:[
        {id:'student_center',name:'Student Centre Cafeteria',coords:[6.3988,5.6043],hours:'7AM - 10PM',description:'Main student dining facility'},
        {id:'faculty_cafe',name:'Faculty Cafeteria',coords:[6.3982,5.6047],hours:'8AM - 6PM',description:'Faculty and staff dining area'},
        {id:'hostel_cafe',name:'Hostel Area Cafeteria',coords:[6.3935,5.6088],hours:'6AM - 11PM',description:'Hostel residents dining facility'},
        {id:'medical_cafe',name:'Medical School Cafeteria',coords:[6.3955,5.6068],hours:'7AM - 9PM',description:'Medical students and staff cafeteria'},
        {id:'engineering_cafe',name:'Engineering Faculty Cafeteria',coords:[6.4005,5.6018],hours:'8AM - 7PM',description:'Engineering faculty dining area'}
      ]
    }
  },
  Ekenwan: {
    center:[6.334783,5.601006], 
    zoom:17,
    locations:{
      buildings:[],
      faculties:[],
      hostels:[],
      cafeterias:[]
    }
  }
};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  showLoader();
  initializeMap();
  setupEventListeners();
  loadCampusData();
  campusMap.whenReady(hideLoader);
});

// ===== LOADER =====
function showLoader() {
  const ld = document.getElementById('loader');
  if (ld) { ld.classList.remove('hidden'); ld.style.display='flex'; }
}
function hideLoader() {
  const ld = document.getElementById('loader');
  if (!ld) return;
  ld.classList.add('hidden');
  ld.addEventListener('transitionend', () => ld.style.display='none', {once:true});
}

// ===== MAP SETUP =====
function initializeMap() {
  const info = campuses[currentCampus];
  campusMap = L.map('map', { 
    center: info.center, 
    zoom: info.zoom, 
    zoomControl: false 
  });
  
  // Base layers
  const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OSM'
  });
  
  const sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: '© Esri'
  });

  // Add default layer
  osm.addTo(campusMap);
  
  // Configure base layers
  baseLayers = {
    "OpenStreetMap": osm,
    "Satellite": sat,
  };

  if (currentCampus === 'Ugbowo') {
    osm.addTo(campusMap);
  }

  // Add controls
  L.control.zoom({ position: 'bottomright' }).addTo(campusMap);
  L.control.scale({ position: 'bottomleft', imperial: false }).addTo(campusMap);
  L.control.layers(baseLayers, {}, {
    position: 'bottomleft',
    collapsed: true
  }).addTo(campusMap);
}

// ===== CAMPUS SWITCH =====
function changeCampus() {
  currentCampus = document.getElementById('campusSelect').value;
  
  // Clear existing layers
  Object.values(overlayLayers).forEach(l => campusMap.removeLayer(l));
  overlayLayers = {};
  
  if (searchLayer) campusMap.removeLayer(searchLayer);
  if (userLocationMarker) campusMap.removeLayer(userLocationMarker);
  clearRoute();
  
  // Remove all base layers
  Object.values(baseLayers).forEach(layer => {
    campusMap.removeLayer(layer);
  });
  
  const info = campuses[currentCampus];
  campusMap.setView(info.center, info.zoom);
  
  // Add appropriate base layers
  baseLayers["OpenStreetMap"].addTo(campusMap);
  if (currentCampus === 'Ugbowo') {
    baseLayers["Drone Imagery"].addTo(campusMap);
  }
  
  loadCampusData();
}

// ===== DATA LOADING =====
function loadCampusData() {
  const locs = campuses[currentCampus].locations;
  loadCategory(locs.buildings, 'building', '#3498db', 'Buildings');
  loadCategory(locs.faculties, 'graduation-cap', '#27ae60', 'Faculties');
  loadCategory(locs.hostels, 'bed', '#e74c3c', 'Hostels');
  loadCategory(locs.cafeterias, 'utensils', '#f39c12', 'Cafeterias');
  setTimeout(setupAutocomplete, 500);
}

function loadCategory(items, iconName, color, layerName) {
  const grp = L.layerGroup();
  
  items.forEach(item => {
    const mk = L.marker(item.coords, { icon: createCustomIcon(iconName, color) })
      .bindPopup(`
        <div class="popup-content">
          <h4><i class="fas fa-${iconName}"></i> ${item.name}</h4>
          ${item.capacity ? `<p><strong>Capacity:</strong> ${item.capacity}</p>` : ''}
          ${item.hours ? `<p><strong>Hours:</strong> ${item.hours}</p>` : ''}
          <p>${item.description || ''}</p>
          <div class="popup-route-options">
            <p>Route Type:</p>
            <label><input type="radio" name="routeType" value="foot" checked> <i class="fas fa-walking"></i> Foot</label>
            <label><input type="radio" name="routeType" value="car"> <i class="fas fa-car"></i> Car</label>
          </div>
          <button onclick="getDirections(${item.coords[0]},${item.coords[1]})" class="popup-btn">
            <i class="fas fa-directions"></i> Get Directions
          </button>
        </div>
      `);
    grp.addLayer(mk);
  });
  
  overlayLayers[layerName] = grp;
  grp.addTo(campusMap);
}

function createCustomIcon(name, color) {
  return L.divIcon({
    html: `<div style="
      background: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
      border: 2px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    "><i class="fas fa-${name}"></i></div>`,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
}

// ===== EVENT BINDING =====
function setupEventListeners() {
  document.getElementById('mobileMenuToggle')
    .addEventListener('click', () => document.getElementById('sidebar').classList.toggle('inactive'));
  
  document.getElementById('searchBtn').addEventListener('click', performSearch);
  document.getElementById('searchInput')
    .addEventListener('input', handleSearchInput);
  document.getElementById('searchInput')
    .addEventListener('keypress', e => { if(e.key === 'Enter') performSearch(); });
  
  document.getElementById('themeToggle')
    .addEventListener('change', toggleTheme);
  document.getElementById('fullscreenBtn')
    .addEventListener('click', toggleFullscreen);
  document.getElementById('clearRouteBtn')
    .addEventListener('click', clearRoute);

  if(window.innerWidth <= 768) {
    campusMap.on('click', () => document.getElementById('sidebar').classList.remove('active'));
  }
}

// ===== SEARCH =====
function handleSearchInput() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const rc = document.getElementById('searchResults');
  
  if(q.length < 2) { 
    rc.style.display = 'none'; 
    return; 
  }

  const all = [
    ...campuses[currentCampus].locations.buildings,
    ...campuses[currentCampus].locations.faculties,
    ...campuses[currentCampus].locations.hostels,
    ...campuses[currentCampus].locations.cafeterias
  ];
  
  const res = all.filter(loc =>
    loc.name.toLowerCase().includes(q) ||
    (loc.type && loc.type.toLowerCase().includes(q)) ||
    (loc.description && loc.description.toLowerCase().includes(q))
  );

  if(!res.length) {
    rc.innerHTML = '<div class="search-result-item">No results found</div>';
    rc.style.display = 'block';
    return;
  }

  rc.innerHTML = res.map(r => `
    <div class="search-result-item" onclick="selectSearchResult('${r.id}',${r.coords[0]},${r.coords[1]})">
      <strong>${r.name}</strong><br><small>${r.description || r.type}</small>
    </div>
  `).join('');
  rc.style.display = 'block';
}

function performSearch() { 
  handleSearchInput(); 
}

function selectSearchResult(id, lat, lng) {
  document.getElementById('searchResults').style.display = 'none';
  
  if(searchLayer) campusMap.removeLayer(searchLayer);
  
  searchLayer = L.circle([lat, lng], {
    radius: 20,
    color: '#f00',
    weight: 3,
    fillOpacity: 0.2
  }).addTo(campusMap);
  
  campusMap.setView([lat, lng], 18);
  document.getElementById('searchInput').value = '';
}

// ===== CATEGORY FOCUS =====
function focusCategory(cat) {
  if(searchLayer) campusMap.removeLayer(searchLayer);
  
  const arr = campuses[currentCampus].locations[cat];
  if(!arr.length) return;
  
  const clr = {
    'buildings': '#3498db',
    'faculties': '#27ae60',
    'hostels': '#e74c3c',
    'cafeterias': '#f39c12'
  }[cat];
  
  const grp = L.featureGroup();
  arr.forEach(loc => 
    L.circle(loc.coords, {
      radius: 25,
      color: clr,
      weight: 3,
      fillOpacity: 0.3
    }).addTo(grp)
  );
  
  searchLayer = grp.addTo(campusMap);
  campusMap.fitBounds(grp.getBounds(), { padding: [20, 20] });
}

// ===== GEOLOCATION =====
function locateUser() {
  if(!navigator.geolocation) { 
    showNotification('Geolocation not supported by your browser.', 'error'); 
    return; 
  }
  
  navigator.geolocation.getCurrentPosition(pos => {
    const [lat, lng] = [pos.coords.latitude, pos.coords.longitude];
    
    if(userLocationMarker) campusMap.removeLayer(userLocationMarker);
    
    userLocationMarker = L.marker([lat, lng], {
      icon: createCustomIcon('location-arrow', '#9b59b6')
    }).bindPopup('Your Location').addTo(campusMap);
    
    campusMap.setView([lat, lng], 17);
    showNotification('Location found!', 'success');
  }, () => showNotification('Unable to get your location. Please enable location services.', 'error'));
}

// ===== THEME & FULLSCREEN =====
function toggleTheme() {
  const cb = document.getElementById('themeToggle');
  if(cb.checked) document.body.setAttribute('data-theme', 'dark');
  else document.body.removeAttribute('data-theme');
}

function toggleFullscreen() {
  const mc = document.getElementById('mapContainer');
  const btn = document.getElementById('fullscreenBtn');
  
  if(!document.fullscreenElement) {
    mc.requestFullscreen().then(() => {
      btn.innerHTML = '<i class="fas fa-compress"></i>';
      btn.title = 'Exit Fullscreen';
    });
  } else {
    document.exitFullscreen().then(() => {
      btn.innerHTML = '<i class="fas fa-expand"></i>';
      btn.title = 'Toggle Fullscreen';
    });
  }
}

// ===== ROUTING FUNCTIONS =====
async function fetchRoute(start, end, routeType) {
  const url = `https://graphhopper.com/api/1/route?point=${start.lat},${start.lng}&point=${end.lat},${end.lng}&profile=${routeType}&locale=en&points_encoded=false&key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.paths && data.paths.length > 0) {
      const routeCoordinates = data.paths[0].points.coordinates;
      const routeTime = data.paths[0].time;
      const routeTimeInMinutes = routeTime / 1000 / 60;
      const distanceKm = (data.paths[0].distance / 1000).toFixed(2);

      return { 
        routeCoordinates, 
        routeTimeInMinutes,
        distanceKm
      };
    } else {
      console.error("No valid path found.");
      return { routeCoordinates: [], routeTimeInMinutes: 0, distanceKm: 0 };
    }
  } catch (error) {
    console.error("Error fetching route:", error);
    return { routeCoordinates: [], routeTimeInMinutes: 0, distanceKm: 0 };
  }
}

// ===== DIRECTIONS & NOTIFICATION =====
async function getDirections(destLat, destLng) {
  if(!userLocationMarker) {
    showNotification('Please locate yourself first using "Locate Me" to get directions.', 'warning');
    return;
  }

  let routeType = 'foot'; // Default to foot
  const activePopup = document.querySelector('.leaflet-popup-content-wrapper');
  if (activePopup) {
    const selectedRadio = activePopup.querySelector('input[name="routeType"]:checked');
    if (selectedRadio) {
      routeType = selectedRadio.value;
    }
  }

  const startCoords = userLocationMarker.getLatLng();
  const endCoords = L.latLng(destLat, destLng);

  clearRoute(); // Clear any previous route

  // Show loading notification
  showNotification('Calculating route...', 'info');

  try {
    // Fetch route from GraphHopper API
    const { routeCoordinates, routeTimeInMinutes, distanceKm } = await fetchRoute(
      { lat: startCoords.lat, lng: startCoords.lng },
      { lat: destLat, lng: destLng },
      routeType
    );

    if (routeCoordinates.length === 0) {
      throw new Error("No route found");
    }

    // Create a GeoJSON line for the route
    const routeLine = L.geoJSON({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: routeCoordinates
      }
    }, {
      style: {
        color: '#0078FF',
        weight: 5,
        opacity: 0.7
      }
    }).addTo(campusMap);

    // Store the route layer for later removal
    routingControl = {
      routeLayer: routeLine,
      routeType: routeType
    };

    // Format time for display
    const minutes = Math.floor(routeTimeInMinutes);
    const seconds = Math.round((routeTimeInMinutes - minutes) * 60);
    let timeString;
    if (minutes > 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      timeString = `${hours}h ${remainingMinutes}m`;
    } else if (minutes > 0) {
      timeString = `${minutes}m ${seconds}s`;
    } else {
      timeString = `${seconds}s`;
    }

    // Show persistent route info
    const icon = routeType === 'car' ? 'car' : 'walking';
    const message = `
      <i class="fas fa-${icon}" style="margin-right: 5px;"></i>
      <strong>${timeString}</strong> (${distanceKm} km)
      <button onclick="document.querySelector('.notification-persistent')?.remove()" 
              style="margin-left: 10px; background: transparent; border: none; color: white; cursor: pointer;">
        <i class="fas fa-times"></i>
      </button>
    `;
    showNotification(message, 'success', 0, true); // Persistent notification

    // Fit the map to show the entire route
    campusMap.fitBounds(routeLine.getBounds(), { padding: [50, 50] });

  } catch (error) {
    console.error("Routing error:", error);
    showNotification('Failed to calculate route. Please try again.', 'error');
  }
}

function clearRoute() {
  if (routingControl && routingControl.routeLayer) {
    campusMap.removeLayer(routingControl.routeLayer);
    routingControl = null;
  }
  // Remove any persistent notification when route is cleared
  document.querySelector('.notification-persistent')?.remove();
}

function showNotification(msg, type='info', duration=3000, persistent=false) {
  // Remove any existing persistent notifications if this is a new persistent one
  if (persistent) {
    const existing = document.querySelector('.notification-persistent');
    if (existing) existing.remove();
  }

  const n = document.createElement('div');
  n.className = `notification notification-${type} ${persistent ? 'notification-persistent' : ''}`;
  n.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    font-size: 14px;
    animation: slideInRight 0.3s ease;
    display: flex;
    align-items: center;
  `;
  n.innerHTML = msg;
  document.body.appendChild(n);
  
  // Only auto-hide if not persistent
  if (!persistent) {
    setTimeout(() => {
      n.style.animation = 'slideOutRight 0.3s ease';
      n.addEventListener('animationend', () => n.remove(), {once: true});
    }, duration);
  }
}

// ===== AUTOCOMPLETE PLACEHOLDER =====
function setupAutocomplete() {
  // If you add jQuery UI, hook up your autocomplete here…
}

// Add animation styles
const styleTag = document.createElement('style');
styleTag.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  .notification {
    transition: all 0.3s ease;
  }
`;
document.head.appendChild(styleTag);