// Comprehensive Indian Railway Locations, Stations, Junctions & Leaflet GPS Data
// Official Indian Railways Network: ER, SER, NWR, NR, NCR, CR, WR, SR, SCR, SWR, ECR, WCR, MR

export const RAILWAY_STATIONS = [
  // ==========================================
  // EASTERN RAILWAY — SEALDAH DIVISION (SDAH) [Kolkata]
  // ==========================================
  {
    name: 'Sealdah Railway Station (SDAH)',
    code: 'SDAH',
    division: 'Eastern Railway — Sealdah Division (SDAH)',
    corridor: 'Sealdah - Dum Dum - Naihati - Ranaghat Main Line',
    lat: 22.5670,
    lng: 88.3712,
    defaultKm: 'KM 0.0',
    state: 'West Bengal',
    supportedLines: [
      'Platform Line 1 - 5 (Sealdah North Suburban EMU)',
      'Platform Line 6 - 11 (Main Line Mail / Express)',
      'Platform Line 12 - 21 (Sealdah South Suburban)',
      'Up Suburban Fast Line',
      'Down Suburban Fast Line',
      'Up Main Line',
      'Down Main Line',
      'Sealdah Coaching Yard & Loco Siding',
      'Both Lines (Bidirectional Curfew)'
    ]
  },
  {
    name: 'Bidhan Nagar Road (BNR)',
    code: 'BNR',
    division: 'Eastern Railway — Sealdah Division (SDAH)',
    corridor: 'Sealdah - Dum Dum - Naihati - Ranaghat Main Line',
    lat: 22.5850,
    lng: 88.3890,
    defaultKm: 'KM 3.8',
    state: 'West Bengal',
    supportedLines: [
      'Platform Line 1 (Up Suburban Fast)',
      'Platform Line 2 (Down Suburban Fast)',
      'Up Main Line',
      'Down Main Line'
    ]
  },
  {
    name: 'Dum Dum Junction (DDJ)',
    code: 'DDJ',
    division: 'Eastern Railway — Sealdah Division (SDAH)',
    corridor: 'Sealdah - Dum Dum - Naihati - Ranaghat Main Line',
    lat: 22.6223,
    lng: 88.3949,
    defaultKm: 'KM 6.9',
    state: 'West Bengal',
    supportedLines: [
      'Platform Line 1 & 2 (Main / Ranaghat Line)',
      'Platform Line 3 & 4 (Bangaon / Hasnabad Line)',
      'Platform Line 5 (Circular Railway Chord)',
      'Metro Interchange Line',
      'Up Main Line',
      'Down Main Line'
    ]
  },
  {
    name: 'Kolkata Terminal / Chitpur (KOAA)',
    code: 'KOAA',
    division: 'Eastern Railway — Sealdah Division (SDAH)',
    corridor: 'Sealdah - Dum Dum - Naihati - Ranaghat Main Line',
    lat: 22.6025,
    lng: 88.3742,
    defaultKm: 'KM 4.5',
    state: 'West Bengal',
    supportedLines: [
      'Platform Line 1 & 2 (Terminal Express)',
      'Platform Line 3 - 5 (Long-Distance Berthing)',
      'Chitpur Yard Line & Siding',
      'Up Main Line',
      'Down Main Line'
    ]
  },
  {
    name: 'Barrackpore (BP)',
    code: 'BP',
    division: 'Eastern Railway — Sealdah Division (SDAH)',
    corridor: 'Sealdah - Dum Dum - Naihati - Ranaghat Main Line',
    lat: 22.7634,
    lng: 88.3739,
    defaultKm: 'KM 22.4',
    state: 'West Bengal',
    supportedLines: [
      'Platform Line 1 (Up Main Line)',
      'Platform Line 2 (Down Main Line)',
      'Platform Line 3 (Up Loop / EMU Local)',
      'Platform Line 4 (Down Loop Line)',
      'Up Main Line',
      'Down Main Line'
    ]
  },
  {
    name: 'Naihati Junction (NH)',
    code: 'NH',
    division: 'Eastern Railway — Sealdah Division (SDAH)',
    corridor: 'Sealdah - Dum Dum - Naihati - Ranaghat Main Line',
    lat: 22.8940,
    lng: 88.4230,
    defaultKm: 'KM 37.8',
    state: 'West Bengal',
    supportedLines: [
      'Platform Line 1 & 2 (Up/Down Main Line)',
      'Platform Line 3 & 4 (Bandel Link Line)',
      'Platform Line 5 (Loop / EMU Stabling)',
      'Naihati Goods Marshalling Yard',
      'Both Lines (Bidirectional Curfew)'
    ]
  },
  {
    name: 'Ranaghat Junction (RHA)',
    code: 'RHA',
    division: 'Eastern Railway — Sealdah Division (SDAH)',
    corridor: 'Sealdah - Dum Dum - Naihati - Ranaghat Main Line',
    lat: 23.1800,
    lng: 88.5800,
    defaultKm: 'KM 73.6',
    state: 'West Bengal',
    supportedLines: [
      'Platform Line 1 & 2 (Gede / Krishnanagar Main)',
      'Platform Line 3 & 4 (Lalgola / Bangaon Branch)',
      'Ranaghat EMU Car Shed Siding',
      'Up Main Line',
      'Down Main Line'
    ]
  },
  {
    name: 'Ballygunge Junction (BLN)',
    code: 'BLN',
    division: 'Eastern Railway — Sealdah Division (SDAH)',
    corridor: 'Sealdah South Suburban (Sonarpur - Baruipur)',
    lat: 22.5280,
    lng: 88.3680,
    defaultKm: 'KM 5.2',
    state: 'West Bengal',
    supportedLines: [
      'Platform Line 1 & 2 (South Main Line)',
      'Platform Line 3 & 4 (Budge Budge Branch)',
      'Up Suburban Fast Line',
      'Down Suburban Fast Line'
    ]
  },
  {
    name: 'Sonarpur Junction (SPR)',
    code: 'SPR',
    division: 'Eastern Railway — Sealdah Division (SDAH)',
    corridor: 'Sealdah South Suburban (Sonarpur - Baruipur)',
    lat: 22.4410,
    lng: 88.4280,
    defaultKm: 'KM 16.8',
    state: 'West Bengal',
    supportedLines: [
      'Platform Line 1 (Up South Main)',
      'Platform Line 2 (Down South Main)',
      'Platform Line 3 & 4 (Canning Branch Line)',
      'Sonarpur Yard & EMU Siding'
    ]
  },
  {
    name: 'Baruipur Junction (BRP)',
    code: 'BRP',
    division: 'Eastern Railway — Sealdah Division (SDAH)',
    corridor: 'Sealdah South Suburban (Sonarpur - Baruipur)',
    lat: 22.3650,
    lng: 88.4350,
    defaultKm: 'KM 25.1',
    state: 'West Bengal',
    supportedLines: [
      'Platform Line 1 (Diamond Harbour Main)',
      'Platform Line 2 (Down Main)',
      'Platform Line 3 & 4 (Kakdwip / Namkhana Branch)',
      'Up Main Line',
      'Down Main Line'
    ]
  },

  // ==========================================
  // EASTERN RAILWAY — HOWRAH DIVISION (HWH) [Kolkata]
  // ==========================================
  {
    name: 'Howrah Junction (HWH)',
    code: 'HWH',
    division: 'Eastern Railway — Howrah Division (HWH)',
    corridor: 'Howrah - Bardhaman Chord Line',
    lat: 22.5839,
    lng: 88.3426,
    defaultKm: 'KM 0.0',
    state: 'West Bengal',
    supportedLines: [
      'Platform Line 1 - 15 (Old Complex Main)',
      'Platform Line 16 - 23 (New Complex South)',
      'Up Main Line',
      'Down Main Line',
      'Up Chord Line',
      'Down Chord Line',
      'Tikiapara Coaching Yard Line',
      'Both Lines (Bidirectional Curfew)'
    ]
  },
  {
    name: 'Bally (BLY)',
    code: 'BLY',
    division: 'Eastern Railway — Howrah Division (HWH)',
    corridor: 'Howrah - Bardhaman Chord Line',
    lat: 22.6500,
    lng: 88.3430,
    defaultKm: 'KM 9.6',
    state: 'West Bengal',
    supportedLines: [
      'Platform Line 1 (Up Main Line)',
      'Platform Line 2 (Down Main Line)',
      'Bally Chord Flyover Line',
      'Up Main Line',
      'Down Main Line'
    ]
  },
  {
    name: 'Serampore (SRP)',
    code: 'SRP',
    division: 'Eastern Railway — Howrah Division (HWH)',
    corridor: 'Howrah - Bandel Main Line Section',
    lat: 22.7520,
    lng: 88.3430,
    defaultKm: 'KM 19.5',
    state: 'West Bengal',
    supportedLines: [
      'Platform Line 1 (Up Main Line)',
      'Platform Line 2 (Down Main Line)',
      'Platform Line 3 & 4 (EMU Reversible Line)',
      'Up Main Line',
      'Down Main Line'
    ]
  },
  {
    name: 'Chandannagar (CGR)',
    code: 'CGR',
    division: 'Eastern Railway — Howrah Division (HWH)',
    corridor: 'Howrah - Bandel Main Line Section',
    lat: 22.8680,
    lng: 88.3650,
    defaultKm: 'KM 33.1',
    state: 'West Bengal',
    supportedLines: [
      'Platform Line 1 (Up Main Line)',
      'Platform Line 2 (Down Main Line)',
      'Platform Line 3 (Loop Line)'
    ]
  },
  {
    name: 'Bandel Junction (BDC)',
    code: 'BDC',
    division: 'Eastern Railway — Howrah Division (HWH)',
    corridor: 'Howrah - Bandel Main Line Section',
    lat: 22.9240,
    lng: 88.3770,
    defaultKm: 'KM 39.4',
    state: 'West Bengal',
    supportedLines: [
      'Platform Line 1 & 2 (Main Line)',
      'Platform Line 3 & 4 (Katwa / Naihati Branch)',
      'Platform Line 5 & 6 (EMU Turnback Line)',
      'Bandel Yard & Stabling Siding',
      'Both Lines (Bidirectional Curfew)'
    ]
  },
  {
    name: 'Bardhaman Junction (BWN)',
    code: 'BWN',
    division: 'Eastern Railway — Howrah Division (HWH)',
    corridor: 'Howrah - Bardhaman Chord Line',
    lat: 23.2500,
    lng: 87.8600,
    defaultKm: 'KM 106.8',
    state: 'West Bengal',
    supportedLines: [
      'Platform Line 1 & 2 (Main Line)',
      'Platform Line 3 - 5 (Chord Line & Loop)',
      'Platform Line 6 - 8 (Katwa / Asansol Fast)',
      'Bardhaman Electric Loco Shed Yard',
      'Both Lines (Bidirectional Curfew)'
    ]
  },

  // ==========================================
  // EASTERN RAILWAY — ASANSOL DIVISION (ASN)
  // ==========================================
  {
    name: 'Asansol Junction (ASN)',
    code: 'ASN',
    division: 'Eastern Railway — Asansol Division (ASN)',
    corridor: 'Bardhaman - Asansol - Dhanbad Main Line',
    lat: 23.6833,
    lng: 86.9833,
    defaultKm: 'KM 213.0',
    state: 'West Bengal',
    supportedLines: [
      'Platform Line 1 - 7 (Grand Chord Fast)',
      'Up Main Line',
      'Down Main Line',
      'Asansol Marshalling Yard',
      'Electric Loco Shed Siding'
    ]
  },
  {
    name: 'Durgapur (DGR)',
    code: 'DGR',
    division: 'Eastern Railway — Asansol Division (ASN)',
    corridor: 'Bardhaman - Asansol - Dhanbad Main Line',
    lat: 23.5000,
    lng: 87.3167,
    defaultKm: 'KM 171.0',
    state: 'West Bengal',
    supportedLines: [
      'Platform Line 1 - 5 (Main Line & Steel Siding)',
      'Up Main Line',
      'Down Main Line',
      'Durgapur Steel Plant Exchange Yard'
    ]
  },

  // ==========================================
  // SOUTH EASTERN RAILWAY — KHARAGPUR DIVISION (KGP) [Kolkata]
  // ==========================================
  {
    name: 'Shalimar Terminal (SHM)',
    code: 'SHM',
    division: 'South Eastern Railway — Kharagpur Division (KGP)',
    corridor: 'Shalimar - Santragachi Freight & Coaching Corridor',
    lat: 22.5570,
    lng: 88.3210,
    defaultKm: 'KM 0.0',
    state: 'West Bengal',
    supportedLines: [
      'Platform Line 1 - 5 (SER Express Terminal)',
      'Shalimar Container Depot Siding',
      'Up Main Line',
      'Down Main Line'
    ]
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
    supportedLines: [
      'Platform Line 1 & 2 (Up/Down Main Line)',
      'Platform Line 3 & 4 (Fast Loop Line)',
      'Santragachi EMU Car Shed & Yard Siding',
      'Up Main Line',
      'Down Main Line'
    ]
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
    supportedLines: [
      'Platform Line 1 (Up Main Line)',
      'Platform Line 2 (Down Main Line)',
      '3rd Line (Freight Dedicated)',
      'Up Loop Line'
    ]
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
    supportedLines: [
      'Platform Line 1 & 2 (Up/Down Main Line)',
      'Platform Line 3 (EMU Local Turnback)',
      '3rd Line (Freight Dedicated)'
    ]
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
    supportedLines: [
      'Platform Line 1 (Longest Main Platform - 1,072m)',
      'Platform Line 2 & 3 (Main Fast Line)',
      'Platform Line 4 - 8 (Midnapore / Adra Branch)',
      '3rd Line (Freight Dedicated)',
      'Kharagpur Yard & Loco Workshop',
      'Both Lines (Bidirectional Curfew)'
    ]
  },

  // ==========================================
  // METRO RAILWAY KOLKATA — METRO DIVISION (KMR)
  // ==========================================
  {
    name: 'Kolkata Metro - Esplanade Interchange (ESPL)',
    code: 'ESPL',
    division: 'Metro Railway Kolkata — Metro Division (KMR)',
    corridor: 'Kolkata Metro Blue & Green Line Network',
    lat: 22.5645,
    lng: 88.3522,
    defaultKm: 'KM 0.0',
    state: 'West Bengal',
    supportedLines: [
      'Platform Line 1 (Blue Line Northbound)',
      'Platform Line 2 (Blue Line Southbound)',
      'Platform Line 3 (Green Line Underwater / Howrah)',
      'Platform Line 4 (Green Line Salt Lake Sector V)'
    ]
  },
  {
    name: 'Kolkata Metro - Salt Lake Sector V (SEC5)',
    code: 'SEC5',
    division: 'Metro Railway Kolkata — Metro Division (KMR)',
    corridor: 'Kolkata Metro Blue & Green Line Network',
    lat: 22.5800,
    lng: 88.4350,
    defaultKm: 'KM 12.0',
    state: 'West Bengal',
    supportedLines: [
      'Platform Line 1 (Green Line Westbound)',
      'Platform Line 2 (Green Line Eastbound)',
      'Central Park Depot Siding'
    ]
  },

  // ==========================================
  // NORTH WESTERN RAILWAY — JAIPUR DIVISION (JP)
  // ==========================================
  {
    name: 'Jaipur Junction (JP)',
    code: 'JP',
    division: 'North Western Railway — Jaipur Division (JP)',
    corridor: 'Delhi - Jaipur - Ajmer Main Line',
    lat: 26.9196,
    lng: 75.7878,
    defaultKm: 'KM 308.0',
    state: 'Rajasthan',
    supportedLines: [
      'Platform Line 1 (Main Broad Gauge)',
      'Platform Line 2 & 3 (Island Platform - Fast)',
      'Platform Line 4 & 5 (Through Passenger Line)',
      'Platform Line 6 - 8 (Branch / Loop Line)',
      'Up Main Line',
      'Down Main Line',
      'Jaipur Marshalling Yard & Siding',
      'Both Lines (Bidirectional Curfew)'
    ]
  },
  {
    name: 'Gandhinagar Jaipur (GADJ)',
    code: 'GADJ',
    division: 'North Western Railway — Jaipur Division (JP)',
    corridor: 'Delhi - Jaipur - Ajmer Main Line',
    lat: 26.8830,
    lng: 75.8010,
    defaultKm: 'KM 302.5',
    state: 'Rajasthan',
    supportedLines: [
      'Platform Line 1 (Up Main Line)',
      'Platform Line 2 (Down Main Line)',
      'Up Main Line',
      'Down Main Line'
    ]
  },
  {
    name: 'Phulera Junction (FL)',
    code: 'FL',
    division: 'North Western Railway — Jaipur Division (JP)',
    corridor: 'Jaipur - Phulera Junction Section',
    lat: 26.8720,
    lng: 75.2410,
    defaultKm: 'KM 362.4',
    state: 'Rajasthan',
    supportedLines: [
      'Platform Line 1 - 5 (Jodhpur / Ajmer Chord)',
      'Phulera Yard Line',
      'Up Main Line',
      'Down Main Line',
      'Both Lines (Bidirectional Curfew)'
    ]
  },
  {
    name: 'Ajmer Junction (AII)',
    code: 'AII',
    division: 'North Western Railway — Jaipur Division (JP)',
    corridor: 'Delhi - Jaipur - Ajmer Main Line',
    lat: 26.4520,
    lng: 74.6390,
    defaultKm: 'KM 443.0',
    state: 'Rajasthan',
    supportedLines: [
      'Platform Line 1 - 5 (Main Line & Workshop Line)',
      'Ajmer Carriage & Wagon Yard',
      'Up Main Line',
      'Down Main Line',
      'Both Lines (Bidirectional Curfew)'
    ]
  },
  {
    name: 'Bandikui Junction (BKI)',
    code: 'BKI',
    division: 'North Western Railway — Jaipur Division (JP)',
    corridor: 'Delhi - Jaipur - Ajmer Main Line',
    lat: 27.0500,
    lng: 76.5700,
    defaultKm: 'KM 217.8',
    state: 'Rajasthan',
    supportedLines: [
      'Platform Line 1 - 6 (Agra - Jaipur Chord)',
      'Up Main Line',
      'Down Main Line'
    ]
  },

  // ==========================================
  // NORTHERN RAILWAY — DELHI DIVISION (DLI)
  // ==========================================
  {
    name: 'New Delhi Railway Station (NDLS)',
    code: 'NDLS',
    division: 'Northern Railway — Delhi Division (DLI)',
    corridor: 'Delhi - Agra Semi High-Speed Corridor (Sec 4)',
    lat: 28.6139,
    lng: 77.2090,
    defaultKm: 'KM 0.0',
    state: 'Delhi',
    supportedLines: [
      'Platform Line 1 - 16 (Paharganj / Ajmeri Gate)',
      'Up Main Line',
      'Down Main Line',
      '3rd Line (Freight Dedicated)',
      '4th Line (High Speed Corridor)',
      'Yard Reception Line',
      'Both Lines (Bidirectional Curfew)'
    ]
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
    supportedLines: [
      'Platform Line 1 - 7 (Terminal Berthing)',
      'Up Main Line',
      'Down Main Line',
      '3rd Line (Freight)',
      'Up Loop Line'
    ]
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
    supportedLines: [
      'Platform Line 1 - 4 (Main & EMU)',
      'Up Main Line',
      'Down Main Line',
      '3rd Line (Freight)'
    ]
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
    supportedLines: [
      'Platform Line 1 - 5 (NCR Quad Junction)',
      'Up Main Line',
      'Down Main Line',
      '3rd & 4th Line (Freight Dedicated)',
      'Both Lines (Bidirectional Curfew)'
    ]
  },

  // ==========================================
  // NORTH CENTRAL RAILWAY — AGRA DIVISION (AGC)
  // ==========================================
  {
    name: 'Mathura Junction (MTJ)',
    code: 'MTJ',
    division: 'North Central Railway — Agra Division (AGC)',
    corridor: 'Delhi - Agra Semi High-Speed Corridor (Sec 4)',
    lat: 27.4924,
    lng: 77.6737,
    defaultKm: 'KM 141.2',
    state: 'Uttar Pradesh',
    supportedLines: [
      'Platform Line 1 - 10 (Junction Hub)',
      'Up Main Line',
      'Down Main Line',
      '3rd Line (Freight)',
      '4th Line (Semi High Speed)',
      'Both Lines (Bidirectional Curfew)'
    ]
  },
  {
    name: 'Agra Cantt (AGC)',
    code: 'AGC',
    division: 'North Central Railway — Agra Division (AGC)',
    corridor: 'Delhi - Agra Semi High-Speed Corridor (Sec 4)',
    lat: 27.1583,
    lng: 78.0081,
    defaultKm: 'KM 198.8',
    state: 'Uttar Pradesh',
    supportedLines: [
      'Platform Line 1 - 6 (High Speed Berthing)',
      'Up Main Line',
      'Down Main Line',
      '3rd Line (Freight)',
      'Both Lines (Bidirectional Curfew)'
    ]
  },

  // ==========================================
  // CENTRAL RAILWAY — MUMBAI CR DIVISION (CSMT)
  // ==========================================
  {
    name: 'Mumbai CSMT (CSMT)',
    code: 'CSMT',
    division: 'Central Railway — Mumbai CR Division (CSMT)',
    corridor: 'Mumbai - Pune Expressway Section (Sec 12)',
    lat: 18.9400,
    lng: 72.8354,
    defaultKm: 'KM 0.0',
    state: 'Maharashtra',
    supportedLines: [
      'Platform Line 1 - 7 (Suburban Local)',
      'Platform Line 8 - 18 (Long Distance Mail/Exp)',
      'Up Fast Line',
      'Down Fast Line',
      'Up Slow Line',
      'Down Slow Line',
      'Wadi Bunder Coaching Yard Siding',
      'Both Lines (Bidirectional Curfew)'
    ]
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
    supportedLines: [
      'Platform Line 1 - 8 (Suburban Interchange)',
      'Up Fast Line',
      'Down Fast Line',
      'Up Slow Line',
      'Down Slow Line'
    ]
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
    supportedLines: [
      'Platform Line 1 - 7 (Southeast / Northeast Split)',
      'Up Main Line',
      'Down Main Line',
      'Southeast Line (Karjat/Pune)',
      'Northeast Line (Kasara/Nashik)',
      'Both Lines (Bidirectional Curfew)'
    ]
  },

  // ==========================================
  // CENTRAL RAILWAY — PUNE DIVISION (PUNE)
  // ==========================================
  {
    name: 'Pune Junction (PUNE)',
    code: 'PUNE',
    division: 'Central Railway — Pune Division (PUNE)',
    corridor: 'Mumbai - Pune Expressway Section (Sec 12)',
    lat: 18.5284,
    lng: 73.8743,
    defaultKm: 'KM 192.0',
    state: 'Maharashtra',
    supportedLines: [
      'Platform Line 1 - 6 (Mail/Express Terminal)',
      'Up Main Line',
      'Down Main Line',
      'Ghorpadi Yard & Diesel Depot',
      'Both Lines (Bidirectional Curfew)'
    ]
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
    supportedLines: [
      'Platform Line 1 - 3 (Ghat Section Top)',
      'Up Main Line',
      'Down Main Line',
      'Bhor Ghat Catch Siding',
      'Both Lines (Bidirectional Curfew)'
    ]
  },

  // ==========================================
  // WESTERN RAILWAY — MUMBAI WR DIVISION (MMCT)
  // ==========================================
  {
    name: 'Mumbai Central (MMCT)',
    code: 'MMCT',
    division: 'Western Railway — Mumbai WR Division (MMCT)',
    corridor: 'Mumbai Suburban - Ahmedabad Corridor',
    lat: 18.9690,
    lng: 72.8190,
    defaultKm: 'KM 0.0',
    state: 'Maharashtra',
    supportedLines: [
      'Platform Line 1 - 5 (Main Line Terminal)',
      'Up Fast Line',
      'Down Fast Line',
      'Up Slow Line',
      'Down Slow Line',
      'Mumbai Central Car Shed'
    ]
  },
  {
    name: 'Borivali (BVI)',
    code: 'BVI',
    division: 'Western Railway — Mumbai WR Division (MMCT)',
    corridor: 'Mumbai Suburban - Ahmedabad Corridor',
    lat: 19.2290,
    lng: 72.8570,
    defaultKm: 'KM 34.2',
    state: 'Maharashtra',
    supportedLines: [
      'Platform Line 1 - 8 (Suburban High-Density)',
      'Up Fast Line',
      'Down Fast Line',
      '5th & 6th Line (Fast Freight Bypass)'
    ]
  },

  // ==========================================
  // WESTERN RAILWAY — VADODARA DIVISION (BRC)
  // ==========================================
  {
    name: 'Vadodara Junction (BRC)',
    code: 'BRC',
    division: 'Western Railway — Vadodara Division (BRC)',
    corridor: 'Surat - Vadodara - Ahmedabad High Speed',
    lat: 22.3107,
    lng: 73.1812,
    defaultKm: 'KM 392.0',
    state: 'Gujarat',
    supportedLines: [
      'Platform Line 1 - 7 (Delhi - Mumbai Main)',
      'Up Main Line',
      'Down Main Line',
      '3rd Line (Freight Dedicated)',
      'Both Lines (Bidirectional Curfew)'
    ]
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
    supportedLines: [
      'Platform Line 1 - 12 (Kalupur Terminal)',
      'Up Main Line',
      'Down Main Line',
      'Sabarmati Yard Line',
      'Both Lines (Bidirectional Curfew)'
    ]
  },
  {
    name: 'Surat (ST)',
    code: 'ST',
    division: 'Western Railway — Vadodara Division (BRC)',
    corridor: 'Surat - Vadodara - Ahmedabad High Speed',
    lat: 21.2052,
    lng: 72.8407,
    defaultKm: 'KM 263.0',
    state: 'Gujarat',
    supportedLines: [
      'Platform Line 1 - 4 (Trunk Route Hub)',
      'Up Main Line',
      'Down Main Line',
      '3rd Line (Freight Dedicated)'
    ]
  },

  // ==========================================
  // SOUTHERN RAILWAY — CHENNAI DIVISION (MAS)
  // ==========================================
  {
    name: 'Chennai Central (MAS)',
    code: 'MAS',
    division: 'Southern Railway — Chennai Division (MAS)',
    corridor: 'Chennai - Arakkonam Fast Line (Sec 9)',
    lat: 13.0827,
    lng: 80.2757,
    defaultKm: 'KM 0.0',
    state: 'Tamil Nadu',
    supportedLines: [
      'Platform Line 1 - 12 (Main Line Terminal)',
      'Up Fast Line',
      'Down Fast Line',
      'Up Suburban Line',
      'Down Suburban Line',
      'Basin Bridge Coaching Yard Siding',
      'Both Lines (Bidirectional Curfew)'
    ]
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
    supportedLines: [
      'Platform Line 1 - 5 (Quad Fast Junction)',
      'Up Main Line',
      'Down Main Line',
      'Renigunta Chord Line',
      'Both Lines (Bidirectional Curfew)'
    ]
  },

  // ==========================================
  // SOUTH WESTERN RAILWAY — BENGALURU DIVISION (SBC)
  // ==========================================
  {
    name: 'KSR Bengaluru City (SBC)',
    code: 'SBC',
    division: 'South Western Railway — Bengaluru Division (SBC)',
    corridor: 'Bengaluru - Mysuru Double Line Section',
    lat: 12.9784,
    lng: 77.5683,
    defaultKm: 'KM 0.0',
    state: 'Karnataka',
    supportedLines: [
      'Platform Line 1 - 10 (Main Terminal)',
      'Up Main Line',
      'Down Main Line',
      'SBC Yard & Coaching Depot',
      'Both Lines (Bidirectional Curfew)'
    ]
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
    supportedLines: [
      'Platform Line 1 - 6 (Double Line Hub)',
      'Up Main Line',
      'Down Main Line',
      'Mysuru Railway Workshop Siding'
    ]
  },

  // ==========================================
  // SOUTH CENTRAL RAILWAY — SECUNDERABAD DIVISION (SC)
  // ==========================================
  {
    name: 'Secunderabad Junction (SC)',
    code: 'SC',
    division: 'South Central Railway — Secunderabad Division (SC)',
    corridor: 'Secunderabad - Kazipet Fast Corridor',
    lat: 17.4344,
    lng: 78.5015,
    defaultKm: 'KM 0.0',
    state: 'Telangana',
    supportedLines: [
      'Platform Line 1 - 10 (South Central Hub)',
      'Up Main Line',
      'Down Main Line',
      'Kazipet Chord Line',
      'Both Lines (Bidirectional Curfew)'
    ]
  },

  // ==========================================
  // NORTH CENTRAL RAILWAY — PRAYAGRAJ DIVISION (PRYJ)
  // ==========================================
  {
    name: 'Kanpur Central (CNB)',
    code: 'CNB',
    division: 'North Central Railway — Prayagraj Division (PRYJ)',
    corridor: 'New Delhi - Kanpur - Prayagraj Main Line',
    lat: 26.4547,
    lng: 80.3507,
    defaultKm: 'KM 435.0',
    state: 'Uttar Pradesh',
    supportedLines: [
      'Platform Line 1 - 10 (Grand Trunk Junction)',
      'Up Main Line',
      'Down Main Line',
      '3rd & 4th Line (Freight Dedicated)',
      'Both Lines (Bidirectional Curfew)'
    ]
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
    supportedLines: [
      'Platform Line 1 - 10 (Grand Trunk Hub)',
      'Up Main Line',
      'Down Main Line',
      'Subedarganj Yard Line',
      'Both Lines (Bidirectional Curfew)'
    ]
  },

  // ==========================================
  // EAST CENTRAL RAILWAY — DANAPUR DIVISION (DNR)
  // ==========================================
  {
    name: 'Patna Junction (PNBE)',
    code: 'PNBE',
    division: 'East Central Railway — Danapur Division (DNR)',
    corridor: 'Pt. Deen Dayal Upadhyaya - Danapur Quad',
    lat: 25.6022,
    lng: 85.1376,
    defaultKm: 'KM 548.0',
    state: 'Bihar',
    supportedLines: [
      'Platform Line 1 - 10 (Main Line Terminal)',
      'Up Main Line',
      'Down Main Line',
      'Danapur Yard Siding'
    ]
  },

  // ==========================================
  // WEST CENTRAL RAILWAY — BHOPAL DIVISION (BPL)
  // ==========================================
  {
    name: 'Bhopal Junction (BPL)',
    code: 'BPL',
    division: 'West Central Railway — Bhopal Division (BPL)',
    corridor: 'Bhopal - Itarsi High Speed Route',
    lat: 23.2676,
    lng: 77.4126,
    defaultKm: 'KM 702.0',
    state: 'Madhya Pradesh',
    supportedLines: [
      'Platform Line 1 - 6 (Grand Trunk Fast)',
      'Up Main Line',
      'Down Main Line',
      '3rd Line (Freight Dedicated)',
      'Both Lines (Bidirectional Curfew)'
    ]
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

// All Railway Corridors explicitly tagged with their respective Railway Division
export const DEFAULT_RAILWAY_CORRIDORS = [
  // Eastern Railway — Sealdah Division (SDAH)
  {
    id: 'CORR-ER-SDAH-MAIN',
    name: 'Sealdah - Dum Dum - Naihati - Ranaghat Main Line',
    division: 'Eastern Railway — Sealdah Division (SDAH)',
    color: '#e4a4bd',
    points: [[22.5670, 88.3712], [22.5850, 88.3890], [22.6223, 88.3949], [22.7634, 88.3739], [22.8940, 88.4230], [23.1800, 88.5800]]
  },
  {
    id: 'CORR-ER-SDAH-SOUTH',
    name: 'Sealdah South Suburban (Sonarpur - Baruipur)',
    division: 'Eastern Railway — Sealdah Division (SDAH)',
    color: '#6db87b',
    points: [[22.5670, 88.3712], [22.5280, 88.3680], [22.4410, 88.4280], [22.3650, 88.4350]]
  },

  // Eastern Railway — Howrah Division (HWH)
  {
    id: 'CORR-ER-HWH-CHORD',
    name: 'Howrah - Bardhaman Chord Line',
    division: 'Eastern Railway — Howrah Division (HWH)',
    color: '#d4a057',
    points: [[22.5839, 88.3426], [22.6500, 88.3430], [22.6840, 88.2970], [23.2500, 87.8600]]
  },
  {
    id: 'CORR-ER-HWH-MAIN',
    name: 'Howrah - Bandel Main Line Section',
    division: 'Eastern Railway — Howrah Division (HWH)',
    color: '#e4a4bd',
    points: [[22.5839, 88.3426], [22.7520, 88.3430], [22.8680, 88.3650], [22.9240, 88.3770]]
  },

  // Eastern Railway — Asansol Division (ASN)
  {
    id: 'CORR-ER-ASN-MAIN',
    name: 'Bardhaman - Asansol - Dhanbad Main Line',
    division: 'Eastern Railway — Asansol Division (ASN)',
    color: '#7ec4cf',
    points: [[23.2500, 87.8600], [23.5000, 87.3167], [23.6833, 86.9833]]
  },

  // South Eastern Railway — Kharagpur Division (KGP)
  {
    id: 'CORR-HWH-KGP',
    name: 'Howrah - Kharagpur Trunk Route (Sec 2)',
    division: 'South Eastern Railway — Kharagpur Division (KGP)',
    color: '#7ec4cf',
    points: [[22.5839, 88.3426], [22.5819, 88.2831], [22.4667, 88.1000], [22.4048, 87.9895], [22.3303, 87.3271]]
  },
  {
    id: 'CORR-SHM-SRC',
    name: 'Shalimar - Santragachi Freight & Coaching Corridor',
    division: 'South Eastern Railway — Kharagpur Division (KGP)',
    color: '#d4a057',
    points: [[22.5570, 88.3210], [22.5819, 88.2831]]
  },

  // Metro Railway Kolkata — Metro Division (KMR)
  {
    id: 'CORR-METRO-KOL',
    name: 'Kolkata Metro Blue & Green Line Network',
    division: 'Metro Railway Kolkata — Metro Division (KMR)',
    color: '#38bdf8',
    points: [[22.5645, 88.3522], [22.5800, 88.4350]]
  },

  // North Western Railway — Jaipur Division (JP)
  {
    id: 'CORR-NWR-JP-MAIN',
    name: 'Delhi - Jaipur - Ajmer Main Line',
    division: 'North Western Railway — Jaipur Division (JP)',
    color: '#e4a4bd',
    points: [[27.0500, 76.5700], [26.8830, 75.8010], [26.9196, 75.7878], [26.8720, 75.2410], [26.4520, 74.6390]]
  },
  {
    id: 'CORR-NWR-JP-FL',
    name: 'Jaipur - Phulera Junction Section',
    division: 'North Western Railway — Jaipur Division (JP)',
    color: '#6db87b',
    points: [[26.9196, 75.7878], [26.8720, 75.2410]]
  },

  // Northern Railway — Delhi Division (DLI)
  {
    id: 'CORR-NDLS-AGC',
    name: 'Delhi - Agra Semi High-Speed Corridor (Sec 4)',
    division: 'Northern Railway — Delhi Division (DLI)',
    color: '#e4a4bd',
    points: [[28.6139, 77.2090], [28.4089, 77.3178], [28.1406, 77.3278], [27.7944, 77.4333], [27.4924, 77.6737], [27.1583, 78.0081]]
  },

  // North Central Railway — Agra Division (AGC)
  {
    id: 'CORR-NCR-AGC',
    name: 'Delhi - Agra Semi High-Speed Corridor (Sec 4)',
    division: 'North Central Railway — Agra Division (AGC)',
    color: '#e4a4bd',
    points: [[28.1406, 77.3278], [27.7944, 77.4333], [27.4924, 77.6737], [27.1583, 78.0081]]
  },

  // Central Railway — Mumbai CR Division (CSMT)
  {
    id: 'CORR-CSTM-PUNE',
    name: 'Mumbai - Pune Expressway Section (Sec 12)',
    division: 'Central Railway — Mumbai CR Division (CSMT)',
    color: '#6db87b',
    points: [[18.9400, 72.8354], [19.0178, 72.8478], [19.2437, 73.1355], [18.7500, 73.4000], [18.5284, 73.8743]]
  },

  // Central Railway — Pune Division (PUNE)
  {
    id: 'CORR-PUNE-LNL',
    name: 'Mumbai - Pune Expressway Section (Sec 12)',
    division: 'Central Railway — Pune Division (PUNE)',
    color: '#6db87b',
    points: [[18.7500, 73.4000], [18.5284, 73.8743]]
  },

  // Western Railway — Mumbai WR Division (MMCT)
  {
    id: 'CORR-WR-MUMBAI',
    name: 'Mumbai Suburban - Ahmedabad Corridor',
    division: 'Western Railway — Mumbai WR Division (MMCT)',
    color: '#d4a057',
    points: [[18.9690, 72.8190], [19.2290, 72.8570], [21.2052, 72.8407]]
  },

  // Western Railway — Vadodara Division (BRC)
  {
    id: 'CORR-WR-BRC',
    name: 'Surat - Vadodara - Ahmedabad High Speed',
    division: 'Western Railway — Vadodara Division (BRC)',
    color: '#e4a4bd',
    points: [[21.2052, 72.8407], [22.3107, 73.1812], [23.0270, 72.6012]]
  },

  // Southern Railway — Chennai Division (MAS)
  {
    id: 'CORR-MAS-AJJ',
    name: 'Chennai - Arakkonam Fast Line (Sec 9)',
    division: 'Southern Railway — Chennai Division (MAS)',
    color: '#7ec4cf',
    points: [[13.0827, 80.2757], [13.1100, 80.1200], [13.0820, 79.6677]]
  },

  // South Western Railway — Bengaluru Division (SBC)
  {
    id: 'CORR-SWR-SBC',
    name: 'Bengaluru - Mysuru Double Line Section',
    division: 'South Western Railway — Bengaluru Division (SBC)',
    color: '#6db87b',
    points: [[12.9784, 77.5683], [12.3168, 76.6496]]
  },

  // South Central Railway — Secunderabad Division (SC)
  {
    id: 'CORR-SCR-SC',
    name: 'Secunderabad - Kazipet Fast Corridor',
    division: 'South Central Railway — Secunderabad Division (SC)',
    color: '#d4a057',
    points: [[17.4344, 78.5015], [17.9700, 79.5200]]
  },

  // North Central Railway — Prayagraj Division (PRYJ)
  {
    id: 'CORR-NDLS-PRYJ',
    name: 'New Delhi - Kanpur - Prayagraj Main Line',
    division: 'North Central Railway — Prayagraj Division (PRYJ)',
    color: '#e4a4bd',
    points: [[26.4547, 80.3507], [25.4526, 81.8349]]
  }
]

// Scoped Nearest Station Finder (searches within preferred division first if provided)
export function findNearestStation(lat, lng, preferredDivision) {
  if (!lat || !lng) return RAILWAY_STATIONS[0]
  const candidateList = preferredDivision
    ? RAILWAY_STATIONS.filter(s => s.division === preferredDivision)
    : RAILWAY_STATIONS
  const pool = candidateList.length > 0 ? candidateList : RAILWAY_STATIONS

  let nearest = pool[0]
  let minDistance = Infinity

  for (const s of pool) {
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

// Scoped Nearest Corridor Finder (searches within preferred division first if provided)
export function findNearestCorridor(lat, lng, preferredDivision) {
  if (!lat || !lng) return DEFAULT_RAILWAY_CORRIDORS[0]
  const candidateList = preferredDivision
    ? DEFAULT_RAILWAY_CORRIDORS.filter(c => c.division === preferredDivision)
    : DEFAULT_RAILWAY_CORRIDORS
  const pool = candidateList.length > 0 ? candidateList : DEFAULT_RAILWAY_CORRIDORS

  let bestCorr = pool[0]
  let minDistance = Infinity

  for (const corr of pool) {
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

// Scoped Station Search: prioritizes and filters stations matching preferredDivision
export async function searchRailwayLocations(query, preferredDivision) {
  const stationPool = preferredDivision
    ? RAILWAY_STATIONS.filter(s => s.division === preferredDivision)
    : RAILWAY_STATIONS
  const pool = stationPool.length > 0 ? stationPool : RAILWAY_STATIONS

  if (!query || query.trim().length === 0) {
    return pool.slice(0, 8)
  }

  const clean = query.trim().toLowerCase()

  // 1. Match within the pool
  const matched = pool.filter(s =>
    s.name.toLowerCase().includes(clean) ||
    s.code.toLowerCase().includes(clean) ||
    s.division.toLowerCase().includes(clean) ||
    s.corridor.toLowerCase().includes(clean) ||
    s.state.toLowerCase().includes(clean)
  )

  if (matched.length >= 2) {
    return matched.slice(0, 8)
  }

  // Fallback to searching all stations if preferred division had no match
  if (preferredDivision && pool !== RAILWAY_STATIONS) {
    const broadMatched = RAILWAY_STATIONS.filter(s =>
      s.name.toLowerCase().includes(clean) ||
      s.code.toLowerCase().includes(clean) ||
      s.division.toLowerCase().includes(clean)
    )
    if (broadMatched.length > 0) {
      return [...matched, ...broadMatched].slice(0, 8)
    }
  }

  // OpenStreetMap Nominatim Geocoding fallback
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
        division: preferredDivision || 'Indian Railways Jurisdiction',
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
    // Fallback
  }

  return matched.slice(0, 8)
}
