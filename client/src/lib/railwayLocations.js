// Comprehensive Indian Railway Locations, Stations, Junctions & Leaflet GPS Data
// Grounded in Indian Railways Official Network (NR, NCR, CR, WR, ER, SER, SR, SCR, SWR, ECR, WCR, NWR)

export const RAILWAY_STATIONS = [
  // Delhi - Agra & NCR Corridor Hubs
  {
    name: 'New Delhi Railway Station (NDLS)',
    code: 'NDLS',
    division: 'Northern Railway — Delhi Division (DLI)',
    corridor: 'Delhi - Agra Semi High-Speed Corridor (Sec 4)',
    lat: 28.6139,
    lng: 77.2090,
    defaultKm: 'KM 0.0',
    state: 'Delhi',
    supportedLines: ['Up Main Line', 'Down Main Line', '3rd Line (Freight)', '4th Line (High Speed)', 'Up Loop / Platform 1', 'Down Loop / Platform 2', 'Yard Reception Line']
  },
  {
    name: 'Hazrat Nizamuddin (NZM)',
    code: 'NZM',
    division: 'Northern Railway — Delhi Division (DLI)',
    corridor: 'Delhi - Agra Semi High-Speed Corridor (Sec 4)',
    lat: 28.5888,
    lng: 77.2533,
    defaultKm: 'KM 7.2',
    state: 'Delhi',
    supportedLines: ['Up Main Line', 'Down Main Line', '3rd Line (Freight)', 'Up Loop / Platform Line', 'Down Loop / Platform Line']
  },
  {
    name: 'Faridabad (FDB)',
    code: 'FDB',
    division: 'Northern Railway — Delhi Division (DLI)',
    corridor: 'Delhi - Agra Semi High-Speed Corridor (Sec 4)',
    lat: 28.4089,
    lng: 77.3178,
    defaultKm: 'KM 28.5',
    state: 'Haryana',
    supportedLines: ['Up Main Line', 'Down Main Line', '3rd Line (Freight)', '4th Line (High Speed)', 'Up Loop / Platform Line']
  },
  {
    name: 'Palwal Junction (PWL)',
    code: 'PWL',
    division: 'Northern Railway — Delhi Division (DLI)',
    corridor: 'Delhi - Agra Semi High-Speed Corridor (Sec 4)',
    lat: 28.1406,
    lng: 77.3278,
    defaultKm: 'KM 60.1',
    state: 'Haryana',
    supportedLines: ['Up Main Line', 'Down Main Line', '3rd Line (Freight)', '4th Line (Freight Bypass)', 'Yard Reception Line', 'Both Lines (Curfew)']
  },
  {
    name: 'Kosi Kalan (KSV)',
    code: 'KSV',
    division: 'North Central Railway — Agra Division (AGC)',
    corridor: 'Delhi - Agra Semi High-Speed Corridor (Sec 4)',
    lat: 27.7944,
    lng: 77.4333,
    defaultKm: 'KM 102.8',
    state: 'Uttar Pradesh',
    supportedLines: ['Up Main Line', 'Down Main Line', 'Up Loop Line', 'Down Loop Line']
  },
  {
    name: 'Mathura Junction (MTJ)',
    code: 'MTJ',
    division: 'North Central Railway — Agra Division (AGC)',
    corridor: 'Delhi - Agra Semi High-Speed Corridor (Sec 4)',
    lat: 27.4924,
    lng: 77.6737,
    defaultKm: 'KM 141.2',
    state: 'Uttar Pradesh',
    supportedLines: ['Up Main Line', 'Down Main Line', '3rd Line (Freight)', '4th Line (High Speed)', 'Up Loop / Platform 1', 'Down Loop / Platform 2', 'Yard / Crossover Line', 'Both Lines (Curfew)']
  },
  {
    name: 'Raja Ki Mandi (RKM)',
    code: 'RKM',
    division: 'North Central Railway — Agra Division (AGC)',
    corridor: 'Delhi - Agra Semi High-Speed Corridor (Sec 4)',
    lat: 27.1989,
    lng: 77.9942,
    defaultKm: 'KM 192.4',
    state: 'Uttar Pradesh',
    supportedLines: ['Up Main Line', 'Down Main Line', 'Up Loop Line']
  },
  {
    name: 'Agra Cantt Railway Station (AGC)',
    code: 'AGC',
    division: 'North Central Railway — Agra Division (AGC)',
    corridor: 'Delhi - Agra Semi High-Speed Corridor (Sec 4)',
    lat: 27.1583,
    lng: 78.0081,
    defaultKm: 'KM 198.8',
    state: 'Uttar Pradesh',
    supportedLines: ['Up Main Line', 'Down Main Line', '3rd Line (Freight)', 'Up Loop / Platform 1', 'Down Loop / Platform 2', 'Yard Reception Line', 'Both Lines (Curfew)']
  },

  // Central Railway (Mumbai - Pune)
  {
    name: 'Mumbai CSMT (CSMT)',
    code: 'CSMT',
    division: 'Central Railway — Mumbai CR Division (CSMT)',
    corridor: 'Mumbai - Pune Expressway Section (Sec 12)',
    lat: 18.9400,
    lng: 72.8354,
    defaultKm: 'KM 0.0',
    state: 'Maharashtra',
    supportedLines: ['Up Fast Line', 'Down Fast Line', 'Up Slow Line', 'Down Slow Line', 'Platform Line 1-18', 'Yard Reception Line']
  },
  {
    name: 'Dadar Central (DR)',
    code: 'DR',
    division: 'Central Railway — Mumbai CR Division (CSMT)',
    corridor: 'Mumbai - Pune Expressway Section (Sec 12)',
    lat: 19.0178,
    lng: 72.8478,
    defaultKm: 'KM 9.0',
    state: 'Maharashtra',
    supportedLines: ['Up Fast Line', 'Down Fast Line', 'Up Slow Line', 'Down Slow Line']
  },
  {
    name: 'Thane Junction (TNA)',
    code: 'TNA',
    division: 'Central Railway — Mumbai CR Division (CSMT)',
    corridor: 'Mumbai - Pune Expressway Section (Sec 12)',
    lat: 19.1860,
    lng: 73.0560,
    defaultKm: 'KM 33.2',
    state: 'Maharashtra',
    supportedLines: ['Up Fast Line', 'Down Fast Line', '5th & 6th Line (Freight)', 'Up Loop Line']
  },
  {
    name: 'Kalyan Junction (KYN)',
    code: 'KYN',
    division: 'Central Railway — Mumbai CR Division (CSMT)',
    corridor: 'Mumbai - Pune Expressway Section (Sec 12)',
    lat: 19.2437,
    lng: 73.1355,
    defaultKm: 'KM 53.8',
    state: 'Maharashtra',
    supportedLines: ['Up Main Line', 'Down Main Line', 'Southeast Line (Karjat/Pune)', 'Northeast Line (Kasara/Nashik)', 'Yard Lines']
  },
  {
    name: 'Lonavala (LNL)',
    code: 'LNL',
    division: 'Central Railway — Pune Division (PUNE)',
    corridor: 'Mumbai - Pune Expressway Section (Sec 12)',
    lat: 18.7500,
    lng: 73.4000,
    defaultKm: 'KM 128.0',
    state: 'Maharashtra',
    supportedLines: ['Up Main Line', 'Down Main Line', 'Bhor Ghat Catch Siding', 'Both Lines (Curfew)']
  },
  {
    name: 'Pune Junction (PUNE)',
    code: 'PUNE',
    division: 'Central Railway — Pune Division (PUNE)',
    corridor: 'Mumbai - Pune Expressway Section (Sec 12)',
    lat: 18.5284,
    lng: 73.8743,
    defaultKm: 'KM 192.0',
    state: 'Maharashtra',
    supportedLines: ['Up Main Line', 'Down Main Line', 'Up Loop / Platform 1', 'Down Loop / Platform 2', 'Yard Reception Line']
  },

  // Eastern & South Eastern Railway (Howrah - Kharagpur)
  {
    name: 'Howrah Junction (HWH)',
    code: 'HWH',
    division: 'Eastern Railway — Howrah Division (HWH)',
    corridor: 'Howrah - Kharagpur Trunk Route (Sec 2)',
    lat: 22.5839,
    lng: 88.3426,
    defaultKm: 'KM 0.0',
    state: 'West Bengal',
    supportedLines: ['Up Main Line', 'Down Main Line', '3rd Line', 'South Eastern Chord', 'Platform Line 1-23', 'Yard Line']
  },
  {
    name: 'Santragachi Junction (SRC)',
    code: 'SRC',
    division: 'South Eastern Railway — Kharagpur Division (KGP)',
    corridor: 'Howrah - Kharagpur Trunk Route (Sec 2)',
    lat: 22.5819,
    lng: 88.2831,
    defaultKm: 'KM 7.5',
    state: 'West Bengal',
    supportedLines: ['Up Main Line', 'Down Main Line', '3rd Line', 'Coaching Yard Siding']
  },
  {
    name: 'Uluberia (ULB)',
    code: 'ULB',
    division: 'South Eastern Railway — Kharagpur Division (KGP)',
    corridor: 'Howrah - Kharagpur Trunk Route (Sec 2)',
    lat: 22.4667,
    lng: 88.1000,
    defaultKm: 'KM 32.1',
    state: 'West Bengal',
    supportedLines: ['Up Main Line', 'Down Main Line', '3rd Line (Freight)', 'Up Loop Line']
  },
  {
    name: 'Mecheda (MCA)',
    code: 'MCA',
    division: 'South Eastern Railway — Kharagpur Division (KGP)',
    corridor: 'Howrah - Kharagpur Trunk Route (Sec 2)',
    lat: 22.4048,
    lng: 87.9895,
    defaultKm: 'KM 58.4',
    state: 'West Bengal',
    supportedLines: ['Up Main Line', 'Down Main Line', '3rd Line (Freight)', 'Yard / Siding Line']
  },
  {
    name: 'Kharagpur Junction (KGP)',
    code: 'KGP',
    division: 'South Eastern Railway — Kharagpur Division (KGP)',
    corridor: 'Howrah - Kharagpur Trunk Route (Sec 2)',
    lat: 22.3303,
    lng: 87.3271,
    defaultKm: 'KM 115.6',
    state: 'West Bengal',
    supportedLines: ['Up Main Line', 'Down Main Line', '3rd Line (Freight)', 'Platform 1 (Main)', 'Platform 2', 'Yard Reception Line', 'Both Lines (Curfew)']
  },

  // Southern Railway (Chennai - Arakkonam)
  {
    name: 'Chennai Central (MAS)',
    code: 'MAS',
    division: 'Southern Railway — Chennai Division (MAS)',
    corridor: 'Chennai - Arakkonam Fast Line (Sec 9)',
    lat: 13.0827,
    lng: 80.2757,
    defaultKm: 'KM 0.0',
    state: 'Tamil Nadu',
    supportedLines: ['Up Fast Line', 'Down Fast Line', 'Up Suburban Line', 'Down Suburban Line', 'Platform Line 1-12', 'Yard Lines']
  },
  {
    name: 'Avadi (AVD)',
    code: 'AVD',
    division: 'Southern Railway — Chennai Division (MAS)',
    corridor: 'Chennai - Arakkonam Fast Line (Sec 9)',
    lat: 13.1100,
    lng: 80.1000,
    defaultKm: 'KM 21.3',
    state: 'Tamil Nadu',
    supportedLines: ['Up Fast Line', 'Down Fast Line', 'Up Slow Line', 'Down Slow Line']
  },
  {
    name: 'Tiruvallur (TRL)',
    code: 'TRL',
    division: 'Southern Railway — Chennai Division (MAS)',
    corridor: 'Chennai - Arakkonam Fast Line (Sec 9)',
    lat: 13.1439,
    lng: 79.9083,
    defaultKm: 'KM 41.8',
    state: 'Tamil Nadu',
    supportedLines: ['Up Fast Line', 'Down Fast Line', '3rd & 4th Line', 'Up Loop Line']
  },
  {
    name: 'Arakkonam Junction (AJJ)',
    code: 'AJJ',
    division: 'Southern Railway — Chennai Division (MAS)',
    corridor: 'Chennai - Arakkonam Fast Line (Sec 9)',
    lat: 13.0820,
    lng: 79.6677,
    defaultKm: 'KM 68.5',
    state: 'Tamil Nadu',
    supportedLines: ['Up Main Line', 'Down Main Line', 'Renigunta Line', 'Katpadi Line', 'Yard Reception Line', 'Both Lines (Curfew)']
  },

  // South Western Railway (Bengaluru - Mysuru)
  {
    name: 'KSR Bengaluru City (SBC)',
    code: 'SBC',
    division: 'South Western Railway — Bengaluru Division (SBC)',
    corridor: 'Bengaluru - Mysuru Double Line Section',
    lat: 12.9784,
    lng: 77.5683,
    defaultKm: 'KM 0.0',
    state: 'Karnataka',
    supportedLines: ['Up Main Line', 'Down Main Line', 'Platform Line 1-10', 'Yard Line']
  },
  {
    name: 'Kengeri (KGI)',
    code: 'KGI',
    division: 'South Western Railway — Bengaluru Division (SBC)',
    corridor: 'Bengaluru - Mysuru Double Line Section',
    lat: 12.9125,
    lng: 77.4833,
    defaultKm: 'KM 12.2',
    state: 'Karnataka',
    supportedLines: ['Up Main Line', 'Down Main Line', 'Up Loop Line']
  },
  {
    name: 'Mandya (MYA)',
    code: 'MYA',
    division: 'South Western Railway — Bengaluru Division (SBC)',
    corridor: 'Bengaluru - Mysuru Double Line Section',
    lat: 12.5200,
    lng: 76.9000,
    defaultKm: 'KM 93.4',
    state: 'Karnataka',
    supportedLines: ['Up Main Line', 'Down Main Line', 'Up Loop Line', 'Down Loop Line']
  },
  {
    name: 'Mysuru Junction (MYS)',
    code: 'MYS',
    division: 'South Western Railway — Bengaluru Division (SBC)',
    corridor: 'Bengaluru - Mysuru Double Line Section',
    lat: 12.3168,
    lng: 76.6496,
    defaultKm: 'KM 137.5',
    state: 'Karnataka',
    supportedLines: ['Up Main Line', 'Down Main Line', 'Platform Line 1-6', 'Yard Line', 'Both Lines (Curfew)']
  },

  // North Central & Northern Trunk
  {
    name: 'Kanpur Central (CNB)',
    code: 'CNB',
    division: 'North Central Railway — Prayagraj Division (PRYJ)',
    corridor: 'New Delhi - Kanpur - Prayagraj Main Line',
    lat: 26.4547,
    lng: 80.3507,
    defaultKm: 'KM 435.0',
    state: 'Uttar Pradesh',
    supportedLines: ['Up Main Line', 'Down Main Line', '3rd Line (Freight)', '4th Line (Freight)', 'Platform 1-10', 'Yard Lines']
  },
  {
    name: 'Prayagraj Junction (PRYJ)',
    code: 'PRYJ',
    division: 'North Central Railway — Prayagraj Division (PRYJ)',
    corridor: 'New Delhi - Kanpur - Prayagraj Main Line',
    lat: 25.4526,
    lng: 81.8349,
    defaultKm: 'KM 628.0',
    state: 'Uttar Pradesh',
    supportedLines: ['Up Main Line', 'Down Main Line', '3rd Line (Freight)', 'Platform 1-10', 'Subedarganj Yard', 'Both Lines (Curfew)']
  },
  {
    name: 'Varanasi Junction (BSB)',
    code: 'BSB',
    division: 'Northern Railway — Delhi Division (DLI)',
    corridor: 'Delhi - Varanasi High Speed Trunk',
    lat: 25.3283,
    lng: 82.9866,
    defaultKm: 'KM 754.0',
    state: 'Uttar Pradesh',
    supportedLines: ['Up Main Line', 'Down Main Line', 'Chord Line', 'Platform Line 1-9']
  },
  {
    name: 'Lucknow Charbagh (LKO)',
    code: 'LKO',
    division: 'Northern Railway — Delhi Division (DLI)',
    corridor: 'Lucknow - Kanpur High Density Route',
    lat: 26.8315,
    lng: 80.9242,
    defaultKm: 'KM 488.0',
    state: 'Uttar Pradesh',
    supportedLines: ['Up Main Line', 'Down Main Line', 'Loop Line 1', 'Loop Line 2', 'Yard Lines']
  },
  {
    name: 'Gwalior Junction (GWL)',
    code: 'GWL',
    division: 'North Central Railway — Jhansi Division (JHS)',
    corridor: 'Mathura - Jhansi - Bhopal Trunk Route',
    lat: 26.2167,
    lng: 78.1833,
    defaultKm: 'KM 318.0',
    state: 'Madhya Pradesh',
    supportedLines: ['Up Main Line', 'Down Main Line', '3rd Line (Freight)', 'Platform 1-4', 'Yard Line']
  },
  {
    name: 'Jhansi Junction / VGLB (VGLJ)',
    code: 'VGLJ',
    division: 'North Central Railway — Jhansi Division (JHS)',
    corridor: 'Mathura - Jhansi - Bhopal Trunk Route',
    lat: 25.4484,
    lng: 78.5685,
    defaultKm: 'KM 411.0',
    state: 'Uttar Pradesh',
    supportedLines: ['Up Main Line', 'Down Main Line', '3rd Line (Freight)', 'Platform 1-8', 'Yard Lines', 'Both Lines (Curfew)']
  },
  {
    name: 'Bhopal Junction (BPL)',
    code: 'BPL',
    division: 'West Central Railway — Bhopal Division (BPL)',
    corridor: 'Bhopal - Itarsi High Speed Route',
    lat: 23.2676,
    lng: 77.4126,
    defaultKm: 'KM 702.0',
    state: 'Madhya Pradesh',
    supportedLines: ['Up Main Line', 'Down Main Line', '3rd Line', 'Platform Line 1-6', 'Yard Line']
  },

  // Western Trunk
  {
    name: 'Surat (ST)',
    code: 'ST',
    division: 'Western Railway — Mumbai WR Division (MMCT)',
    corridor: 'Surat - Vadodara - Ahmedabad High Speed',
    lat: 21.2052,
    lng: 72.8407,
    defaultKm: 'KM 263.0',
    state: 'Gujarat',
    supportedLines: ['Up Main Line', 'Down Main Line', '3rd Line (Freight)', 'Platform Line 1-4']
  },
  {
    name: 'Vadodara Junction (BRC)',
    code: 'BRC',
    division: 'Western Railway — Vadodara Division (BRC)',
    corridor: 'Surat - Vadodara - Ahmedabad High Speed',
    lat: 22.3107,
    lng: 73.1812,
    defaultKm: 'KM 392.0',
    state: 'Gujarat',
    supportedLines: ['Up Main Line', 'Down Main Line', '3rd Line (Freight)', 'Platform 1-7', 'Yard Lines', 'Both Lines (Curfew)']
  },
  {
    name: 'Ahmedabad Junction (ADI)',
    code: 'ADI',
    division: 'Western Railway — Vadodara Division (BRC)',
    corridor: 'Surat - Vadodara - Ahmedabad High Speed',
    lat: 23.0270,
    lng: 72.6012,
    defaultKm: 'KM 491.0',
    state: 'Gujarat',
    supportedLines: ['Up Main Line', 'Down Main Line', 'Sabarmati Yard Line', 'Platform Line 1-12']
  },
  {
    name: 'Jaipur Junction (JP)',
    code: 'JP',
    division: 'North Western Railway — Jaipur Division (JP)',
    corridor: 'Delhi - Jaipur - Ajmer Main Line',
    lat: 26.9196,
    lng: 75.7878,
    defaultKm: 'KM 308.0',
    state: 'Rajasthan',
    supportedLines: ['Up Main Line', 'Down Main Line', 'Up Loop Line', 'Platform Line 1-8']
  },
  {
    name: 'Secunderabad Junction (SC)',
    code: 'SC',
    division: 'South Central Railway — Secunderabad Division (SC)',
    corridor: 'Secunderabad - Kazipet Fast Corridor',
    lat: 17.4344,
    lng: 78.5015,
    defaultKm: 'KM 0.0',
    state: 'Telangana',
    supportedLines: ['Up Main Line', 'Down Main Line', 'Kazipet Chord', 'Platform 1-10', 'Yard Line', 'Both Lines (Curfew)']
  }
]

// All Standard Railway Track Lines for Selection
export const ALL_TRACK_LINES = [
  { id: 'up_main', name: 'Up Main Line', badge: 'Primary Fast', type: 'fast' },
  { id: 'down_main', name: 'Down Main Line', badge: 'Primary Fast', type: 'fast' },
  { id: 'third_line', name: '3rd Line (Freight Dedicated)', badge: 'Heavy Haul', type: 'freight' },
  { id: 'fourth_line', name: '4th Line (High-Density Passenger)', badge: 'EMU / Fast', type: 'passenger' },
  { id: 'up_loop', name: 'Up Loop / Platform Line 1', badge: 'Loop Track', type: 'loop' },
  { id: 'down_loop', name: 'Down Loop / Platform Line 2', badge: 'Loop Track', type: 'loop' },
  { id: 'platform_3_4', name: 'Platform Line 3 / 4', badge: 'Station Berthing', type: 'platform' },
  { id: 'yard_reception', name: 'Yard Reception & Marshalling Line', badge: 'Operations', type: 'yard' },
  { id: 'shunting_siding', name: 'Shunting Neck / Siding Track', badge: 'Depot / Siding', type: 'siding' },
  { id: 'both_main', name: 'Both Main Lines (Bidirectional Curfew)', badge: 'Full Curfew', type: 'critical' }
]

// Instant Offline Search + Fallback to Nominatim OpenStreetMap
export async function searchRailwayLocations(query) {
  if (!query || query.trim().length === 0) {
    return RAILWAY_STATIONS.slice(0, 6)
  }

  const clean = query.trim().toLowerCase()

  // 1. Instant match in official Indian Railways station hubs
  const matched = RAILWAY_STATIONS.filter(s =>
    s.name.toLowerCase().includes(clean) ||
    s.code.toLowerCase().includes(clean) ||
    s.division.toLowerCase().includes(clean) ||
    s.corridor.toLowerCase().includes(clean) ||
    s.state.toLowerCase().includes(clean)
  )

  if (matched.length >= 3) {
    return matched.slice(0, 8)
  }

  // 2. Query Leaflet OpenStreetMap Nominatim for exact Indian Railway Geocoding
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query.trim() + ' railway station india')}&countrycodes=in&limit=4`,
      { headers: { 'Accept-Language': 'en' } }
    )
    if (res.ok) {
      const data = await res.json()
      const geoResults = data.map(d => ({
        name: `${d.name || d.display_name.split(',')[0]} (OSM Geocoded)`,
        code: 'GEO',
        division: 'Indian Railways Jurisdiction',
        corridor: 'National Railway Route',
        lat: parseFloat(d.lat),
        lng: parseFloat(d.lon),
        defaultKm: 'KM ---',
        state: d.display_name.split(',').slice(-3, -2)[0]?.trim() || 'India',
        supportedLines: ['Up Main Line', 'Down Main Line', 'Both Lines (Curfew)'],
        isGeocoded: true
      }))
      return [...matched, ...geoResults].slice(0, 8)
    }
  } catch {
    // Return whatever matched locally
  }

  return matched.slice(0, 8)
}

export const DEFAULT_RAILWAY_CORRIDORS = [
  {
    id: 'CORR-NDLS-AGC',
    name: 'Delhi - Agra Semi High-Speed Corridor (Sec 4)',
    division: 'Northern Railway — Delhi Division (DLI)',
    color: '#e4a4bd',
    points: [[28.6139, 77.2090], [28.4089, 77.3178], [28.1406, 77.3278], [27.7944, 77.4333], [27.4924, 77.6737], [27.1583, 78.0081]]
  },
  {
    id: 'CORR-CSTM-PUNE',
    name: 'Mumbai - Pune Expressway Section (Sec 12)',
    division: 'Central Railway — Mumbai CR Division (CSMT)',
    color: '#6db87b',
    points: [[18.9400, 72.8354], [19.0434, 72.8633], [19.1860, 72.9756], [19.0222, 73.0900], [18.7500, 73.3500], [18.5284, 73.8743]]
  },
  {
    id: 'CORR-HWH-KGP',
    name: 'Howrah - Kharagpur Trunk Route (Sec 2)',
    division: 'South Eastern Railway — Kharagpur Division (KGP)',
    color: '#d4a057',
    points: [[22.5839, 88.3426], [22.4800, 88.1200], [22.4048, 87.9895], [22.3303, 87.3271]]
  },
  {
    id: 'CORR-MAS-AJJ',
    name: 'Chennai - Arakkonam Fast Line (Sec 9)',
    division: 'Southern Railway — Chennai Division (MAS)',
    color: '#7ec4cf',
    points: [[13.0827, 80.2757], [13.1100, 80.1200], [13.1067, 80.0987], [13.0820, 79.6677]]
  },
  {
    id: 'CORR-NDLS-PRYJ',
    name: 'New Delhi - Kanpur - Prayagraj Main Line',
    division: 'North Central Railway — Prayagraj Division (PRYJ)',
    color: '#e4a4bd',
    points: [[28.6139, 77.2090], [27.8974, 78.0880], [26.4547, 80.3507], [25.4526, 81.8349]]
  }
]

// Find nearest station from coordinates (within Indian Railways hubs)
export function findNearestStation(lat, lng) {
  if (!lat || !lng) return RAILWAY_STATIONS[0]
  let nearest = RAILWAY_STATIONS[0]
  let minDistance = Infinity

  for (const s of RAILWAY_STATIONS) {
    const dLat = s.lat - lat
    const dLng = s.lng - lng
    const distSq = dLat * dLat + dLng * dLng
    if (distSq < minDistance) {
      minDistance = distSq
      nearest = s
    }
  }

  return nearest
}

// Find nearest corridor from coordinates
export function findNearestCorridor(lat, lng) {
  if (!lat || !lng) return DEFAULT_RAILWAY_CORRIDORS[0]
  let bestCorr = DEFAULT_RAILWAY_CORRIDORS[0]
  let minDistance = Infinity

  for (const corr of DEFAULT_RAILWAY_CORRIDORS) {
    if (!corr.points) continue
    for (const pt of corr.points) {
      const d = Math.pow(pt[0] - lat, 2) + Math.pow(pt[1] - lng, 2)
      if (d < minDistance) {
        minDistance = d
        bestCorr = corr
      }
    }
  }

  return bestCorr
}
