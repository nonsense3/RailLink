import { useState, useMemo, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup, CircleMarker, useMap } from 'react-leaflet'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import RevealWrapper from '../components/layout/RevealWrapper'
import api from '../lib/api'
import {
  Layers,
  Globe,
  AlertTriangle,
  CheckCircle,
  Clock,
  Navigation,
  Filter,
  Search,
  ZoomIn,
  CloudRain,
  Wind,
  Thermometer,
  Activity,
  Database,
  Loader2,
  RefreshCw,
  MapPin,
  Sparkles,
  Train,
  ArrowRight,
  Eye,
  Sliders,
  Compass,
  Check,
  X
} from 'lucide-react'
import { RAILWAY_STATIONS, ALL_TRACK_LINES, searchRailwayLocations } from '../lib/railwayLocations'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default marker icon issue in React
import L from 'leaflet'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom Radar Search Pin Icon for Live Location Focusing
const searchPinIcon = L.divIcon({
  className: 'search-location-pin',
  html: `
    <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; transform: translate(-22px, -22px);">
      <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(228, 164, 189, 0.45); animation: leafletPinPulse 1.6s ease-out infinite;"></div>
      <div style="position: relative; z-index: 2; width: 34px; height: 34px; border-radius: 50%; background: #c94f4f; border: 3px solid #ffffff; box-shadow: 0 4px 14px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: #ffffff;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [0, 0],
  popupAnchor: [0, -28]
})

// Major Indian Railway Hubs & Stations for Instant Offline Zero-Latency Location Focus
const MAJOR_RAILWAY_HUBS = [
  { name: 'New Delhi Railway Station (NDLS)', lat: 28.6139, lng: 77.2090, division: 'Northern Railway', state: 'Delhi' },
  { name: 'Agra Cantt Railway Station (AGC)', lat: 27.1583, lng: 78.0081, division: 'North Central Railway', state: 'Uttar Pradesh' },
  { name: 'Mumbai Chhatrapati Shivaji Maharaj Terminus (CSMT)', lat: 18.9400, lng: 72.8354, division: 'Central Railway', state: 'Maharashtra' },
  { name: 'Pune Junction (PUNE)', lat: 18.5284, lng: 73.8743, division: 'Central Railway', state: 'Maharashtra' },
  { name: 'Howrah Junction (HWH)', lat: 22.5839, lng: 88.3426, division: 'Eastern / SE Railway', state: 'West Bengal' },
  { name: 'Kharagpur Junction (KGP)', lat: 22.3303, lng: 87.3271, division: 'South Eastern Railway', state: 'West Bengal' },
  { name: 'Chennai Central (MAS)', lat: 13.0827, lng: 80.2757, division: 'Southern Railway', state: 'Tamil Nadu' },
  { name: 'Arakkonam Junction (AJJ)', lat: 13.0820, lng: 79.6677, division: 'Southern Railway', state: 'Tamil Nadu' },
  { name: 'Bengaluru City / KSR Bengaluru (SBC)', lat: 12.9784, lng: 77.5683, division: 'South Western Railway', state: 'Karnataka' },
  { name: 'Mysuru Junction (MYS)', lat: 12.3168, lng: 76.6496, division: 'South Western Railway', state: 'Karnataka' },
  { name: 'Lucknow Charbagh (LKO)', lat: 26.8315, lng: 80.9242, division: 'Northern Railway', state: 'Uttar Pradesh' },
  { name: 'Varanasi Junction (BSB)', lat: 25.3283, lng: 82.9866, division: 'Northern Railway', state: 'Uttar Pradesh' },
  { name: 'Kanpur Central (CNB)', lat: 26.4547, lng: 80.3507, division: 'North Central Railway', state: 'Uttar Pradesh' },
  { name: 'Jaipur Junction (JP)', lat: 26.9196, lng: 75.7878, division: 'North Western Railway', state: 'Rajasthan' },
  { name: 'Ahmedabad Junction (ADI)', lat: 23.0270, lng: 72.6012, division: 'Western Railway', state: 'Gujarat' },
  { name: 'Bhopal Junction (BPL)', lat: 23.2676, lng: 77.4126, division: 'West Central Railway', state: 'Madhya Pradesh' },
  { name: 'Nagpur Junction (NGP)', lat: 21.1524, lng: 79.0882, division: 'Central Railway', state: 'Maharashtra' },
  { name: 'Patna Junction (PNBE)', lat: 25.6022, lng: 85.1376, division: 'East Central Railway', state: 'Bihar' },
  { name: 'Secunderabad Junction (SC)', lat: 17.4344, lng: 78.5015, division: 'South Central Railway', state: 'Telangana' },
  { name: 'Guwahati Junction (GHY)', lat: 26.1806, lng: 91.7539, division: 'Northeast Frontier Railway', state: 'Assam' },
  { name: 'Chandigarh Junction (CDG)', lat: 30.7027, lng: 76.8229, division: 'Northern Railway', state: 'Punjab / Haryana' },
  { name: 'Gwalior Junction (GWL)', lat: 26.2167, lng: 78.1833, division: 'North Central Railway', state: 'Madhya Pradesh' },
  { name: 'Jhansi Junction / VGLJ', lat: 25.4484, lng: 78.5685, division: 'North Central Railway', state: 'Uttar Pradesh' },
  { name: 'Surat (ST)', lat: 21.2052, lng: 72.8407, division: 'Western Railway', state: 'Gujarat' },
  { name: 'Vadodara Junction (BRC)', lat: 22.3107, lng: 73.1812, division: 'Western Railway', state: 'Gujarat' },
  { name: 'Prayagraj Junction (PRYJ)', lat: 25.4526, lng: 81.8349, division: 'North Central Railway', state: 'Uttar Pradesh' },
  { name: 'Gorakhpur Junction (GKP)', lat: 26.7588, lng: 83.3813, division: 'North Eastern Railway', state: 'Uttar Pradesh' },
  { name: 'Amritsar Junction (ASR)', lat: 31.6340, lng: 74.8723, division: 'Northern Railway', state: 'Punjab' },
  { name: 'Kolkata Sealdah (SDAH)', lat: 22.5675, lng: 88.3713, division: 'Eastern Railway', state: 'West Bengal' },
  { name: 'Hyderabad Deccan (HYB)', lat: 17.3920, lng: 78.4680, division: 'South Central Railway', state: 'Telangana' }
]

// Custom Map Controller to smoothly fly, pan, and zoom like Google Maps
function MapCameraController({ targetPoints, focusedPoint }) {
  const map = useMap()

  // When a specific location/station/defect is focused, fly and zoom into it (level 14-15)
  useEffect(() => {
    if (focusedPoint && focusedPoint.lat && focusedPoint.lng) {
      map.flyTo([focusedPoint.lat, focusedPoint.lng], focusedPoint.zoom || 14, {
        duration: 1.6,
        easeLinearity: 0.25
      })
    }
  }, [focusedPoint, map])

  // When corridor route changes and no specific pinpoint is focused, fit the corridor bounds
  useEffect(() => {
    if (!focusedPoint && targetPoints && targetPoints.length > 0) {
      if (targetPoints.length === 1) {
        map.flyTo(targetPoints[0], 11, { duration: 1.4 })
      } else {
        const bounds = L.latLngBounds(targetPoints)
        map.fitBounds(bounds, { padding: [70, 70], maxZoom: 12, duration: 1.4 })
      }
    }
  }, [targetPoints, focusedPoint, map])

  return null
}

const getCorridorColor = (status) => {
  switch (status) {
    case 'healthy': return '#6db87b'
    case 'active_block': return '#d4a057'
    case 'due': return '#e4a4bd'
    case 'overdue': return '#c94f4f'
    default: return '#7ec4cf'
  }
}

const getSeverityColor = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'critical': return '#c94f4f'
    case 'high': return '#d4a057'
    case 'medium': return '#d4a057'
    case 'low': return '#7ec4cf'
    default: return '#e4a4bd'
  }
}

const getSeverityRadius = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'critical': return 10
    case 'high': return 8
    case 'medium': return 6
    case 'low': return 5
    default: return 6
  }
}

// Coordinate parser helper
const parseCoordinates = (pts) => {
  if (!pts || !Array.isArray(pts)) return []
  return pts.map(p => {
    if (Array.isArray(p)) return [Number(p[0]), Number(p[1])]
    if (typeof p === 'string') {
      const parts = p.trim().split(/[\s,]+/)
      return [Number(parts[0]), Number(parts[1])]
    }
    return [0, 0]
  }).filter(p => !isNaN(p[0]) && !isNaN(p[1]) && p[0] !== 0)
}

// Default Fallback Corridors for Indian Railways Network
const defaultCorridors = [
  {
    id: 'CORR-NDLS-AGC',
    name: 'Delhi - Agra Semi High-Speed Corridor',
    division: 'Northern Railway',
    status: 'active_block',
    health: 76,
    defects: 4,
    typicalSpeedLimit: 160,
    dailyTrainDensity: 142,
    points: [[28.6139, 77.2090], [28.1406, 77.3278], [27.8974, 77.5450], [27.1767, 78.0081]]
  },
  {
    id: 'CORR-CSTM-PUNE',
    name: 'Mumbai - Pune Expressway Route',
    division: 'Central Railway',
    status: 'healthy',
    health: 88,
    defects: 2,
    typicalSpeedLimit: 120,
    dailyTrainDensity: 118,
    points: [[19.0760, 72.8777], [19.1860, 73.0560], [18.9388, 73.2311], [18.7500, 73.4000], [18.5204, 73.8567]]
  },
  {
    id: 'CORR-HWH-KGP',
    name: 'Howrah - Kharagpur Trunk Section',
    division: 'South Eastern Railway',
    status: 'overdue',
    health: 62,
    defects: 6,
    typicalSpeedLimit: 130,
    dailyTrainDensity: 165,
    points: [[22.5726, 88.3639], [22.4800, 88.1200], [22.4048, 87.9895], [22.3303, 87.3271]]
  },
  {
    id: 'CORR-MAS-AJJ',
    name: 'Chennai - Arakkonam Fast Line',
    division: 'Southern Railway',
    status: 'healthy',
    health: 85,
    defects: 1,
    typicalSpeedLimit: 110,
    dailyTrainDensity: 94,
    points: [[13.0827, 80.2707], [13.1100, 80.1200], [13.1067, 80.0987], [13.1523, 79.7035]]
  },
  {
    id: 'CORR-SBC-MYS',
    name: 'Bangalore - Mysore High Density Corridor',
    division: 'South Western Railway',
    status: 'due',
    health: 79,
    defects: 3,
    typicalSpeedLimit: 130,
    dailyTrainDensity: 82,
    points: [[12.9716, 77.5946], [12.7200, 77.2800], [12.5200, 76.9000], [12.2958, 76.6394]]
  },
  {
    id: 'CORR-LKO-BSB',
    name: 'Lucknow - Varanasi Intercity Corridor',
    division: 'Northern Railway',
    status: 'healthy',
    health: 91,
    defects: 2,
    typicalSpeedLimit: 130,
    dailyTrainDensity: 110,
    points: [[26.8467, 80.9462], [26.2600, 81.5800], [25.8000, 82.2000], [25.3176, 82.9739]]
  }
]

export default function MapPage() {
  const [corridors, setCorridors] = useState(defaultCorridors)
  const [defectMarkers, setDefectMarkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [dataSource, setDataSource] = useState('RailLink Live DB')
  const [selectedCorridor, setSelectedCorridor] = useState(defaultCorridors[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [geocodedSuggestions, setGeocodedSuggestions] = useState([])
  const [focusedPoint, setFocusedPoint] = useState(null)
  const [selectedTrackLine, setSelectedTrackLine] = useState('Up Main Line')
  const [isSearchingGeocode, setIsSearchingGeocode] = useState(false)
  const mapContainerRef = useRef(null)
  const searchContainerRef = useRef(null)

  const [weather, setWeather] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(false)

  // Leaflet Map Tiles Provider: 'satellite' (High-Res ESRI Satellite) | 'osm' (OpenStreetMap) | 'topo' (Terrain Topo)
  const [mapStyle, setMapStyle] = useState('satellite')
  const [showRailwayOverlay, setShowRailwayOverlay] = useState(true)

  const [filters, setFilters] = useState({
    showCorridors: true,
    showDefects: true,
    statusFilter: 'all',
  })

  // Load live corridors and defects from backend APIs
  const loadMapData = async () => {
    try {
      setRefreshing(true)
      const [secRes, defRes] = await Promise.all([
        api.get('/sections').catch(() => null),
        api.get('/defects').catch(() => null)
      ])

      let loadedCorridors = defaultCorridors
      if (secRes?.corridors?.length > 0) {
        loadedCorridors = secRes.corridors.map(c => ({
          ...c,
          id: c.corridorId || c.id,
          points: parseCoordinates(c.points).length > 0 ? parseCoordinates(c.points) : defaultCorridors[0].points
        }))
        setCorridors(loadedCorridors)
        setSelectedCorridor(prev => prev ? loadedCorridors.find(c => c.id === prev.id) || loadedCorridors[0] : loadedCorridors[0])
        setDataSource(secRes.source || 'RailLink Live DB')
      }

      if (defRes?.defects?.length > 0) {
        const markers = defRes.defects.map((d, i) => {
          const matchedCorr = loadedCorridors.find(c =>
            c.id === d.corridorId || c.corridorId === d.corridorId ||
            (c.name && d.corridorName && c.name.toLowerCase().includes(d.corridorName.toLowerCase().split(' ')[0]))
          ) || loadedCorridors[i % loadedCorridors.length]

          let lat = 28.6139, lng = 77.209
          if (matchedCorr && matchedCorr.points && matchedCorr.points.length >= 2) {
            const p1 = matchedCorr.points[0]
            const p2 = matchedCorr.points[matchedCorr.points.length - 1]
            const frac = 0.15 + ((i * 0.27) % 0.7)
            lat = Math.round((p1[0] + (p2[0] - p1[0]) * frac) * 10000) / 10000
            lng = Math.round((p1[1] + (p2[1] - p1[1]) * frac) * 10000) / 10000
          }

          return {
            id: d.id,
            lat,
            lng,
            type: d.department || d.sourceSystem || 'Engineering',
            severity: d.severity || 'Medium',
            desc: d.defectCategory || d.description || 'Track asset inspection note',
            corridorName: d.corridorName || matchedCorr?.name || 'Corridor'
          }
        })
        setDefectMarkers(markers)
      } else {
        // Fallback default markers
        setDefectMarkers([
          { id: 'TMS-DF-101', lat: 28.1406, lng: 77.3278, type: 'Engineering', severity: 'High', desc: 'Rail wear and surface micro-crack on Up Line KM 112.5', corridorName: 'Delhi - Agra Semi High-Speed Corridor' },
          { id: 'SMMS-SG-204', lat: 27.8974, lng: 77.5450, type: 'Signal & Telecom', severity: 'Critical', desc: 'Axle Counter drift and MSDAC intermittent pulse drop', corridorName: 'Delhi - Agra Semi High-Speed Corridor' },
          { id: 'TDMS-OHE-308', lat: 18.9388, lng: 73.2311, type: 'Traction Distribution', severity: 'High', desc: 'OHE section insulator flashover & dropper slack', corridorName: 'Mumbai - Pune Expressway Route' },
          { id: 'TMS-DF-109', lat: 22.4048, lng: 87.9895, type: 'Engineering', severity: 'Critical', desc: 'Ballast deficiency and track settlement KM 48.0', corridorName: 'Howrah - Kharagpur Trunk Section' },
          { id: 'SMMS-SG-211', lat: 13.1100, lng: 80.1200, type: 'Signal & Telecom', severity: 'Medium', desc: 'Point machine detector slide obstruction', corridorName: 'Chennai - Arakkonam Fast Line' },
        ])
      }
    } catch (err) {
      console.error('Failed to load map data:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadMapData()
  }, [])

  // Fetch live Open-Meteo weather whenever corridor changes
  useEffect(() => {
    const target = selectedCorridor || corridors[0]
    if (target && target.points && target.points.length > 0) {
      const [lat, lon] = target.points[0]
      setWeatherLoading(true)

      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m`)
        .then(r => r.json())
        .then(data => {
          const cur = data.current || {}
          const amb = cur.temperature_2m ?? 28
          const wind = cur.wind_speed_10m ?? 12
          const precip = cur.precipitation ?? 0
          setWeather({
            ambientTempC: amb,
            estimatedRailTempC: Math.round((amb * 1.25) * 10) / 10,
            windSpeedKmH: wind,
            relativeHumidity: cur.relative_humidity_2m || 62,
            precipitationMm: precip,
            safetyAssessment: {
              oheSwayRisk: wind > 40 ? 'Elevated (Wire Sway Alert)' : 'Normal',
              railBucklingRisk: amb > 42 ? 'High (Track Buckling Risk)' : amb < 5 ? 'High (Rail Fracture)' : 'Normal',
              tractionCondition: precip > 3 ? 'Wet Track (Reduced Adhesion)' : 'Dry Track'
            },
            source: 'Open-Meteo Satellite Feed'
          })
        })
        .catch(() => {
          setWeather({
            ambientTempC: 29.4,
            estimatedRailTempC: 36.8,
            windSpeedKmH: 14,
            relativeHumidity: 58,
            precipitationMm: 0,
            safetyAssessment: {
              oheSwayRisk: 'Normal',
              railBucklingRisk: 'Normal',
              tractionCondition: 'Dry Track'
            },
            source: 'Offline Regional Climatic Model'
          })
        })
        .finally(() => setWeatherLoading(false))
    }
  }, [selectedCorridor, corridors])

  // Filtered corridors based on search and status
  const filteredCorridors = useMemo(() => {
    return corridors.filter(c => {
      const matchesStatus = filters.statusFilter === 'all' || c.status === filters.statusFilter
      const matchesSearch = !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.division && c.division.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesStatus && matchesSearch
    })
  }, [corridors, filters.statusFilter, searchQuery])

  // Filtered defects based on search and status
  const filteredDefects = useMemo(() => {
    return defectMarkers.filter(d => {
      const matchesSearch = !searchQuery ||
        d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.corridorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.type.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [defectMarkers, searchQuery])

  // Close search suggestions on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  // Live debounce geocoder for OpenStreetMap Nominatim across India
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setGeocodedSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingGeocode(true)
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.trim())}&countrycodes=in&limit=4`,
          { headers: { 'Accept-Language': 'en' } }
        )
        if (res.ok) {
          const data = await res.json()
          const items = data.map(d => ({
            id: `geo-${d.place_id}`,
            title: d.name || d.display_name.split(',')[0],
            subtitle: d.display_name,
            lat: parseFloat(d.lat),
            lng: parseFloat(d.lon),
            zoom: 14,
            type: 'location',
            badge: 'Location'
          }))
          setGeocodedSuggestions(items)
        }
      } catch (err) {
        // Fallback gracefully
      } finally {
        setIsSearchingGeocode(false)
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Unified Smart Search Autocomplete (Corridors, Major Hubs, Defects, Geocoded Locations)
  const searchSuggestions = useMemo(() => {
    if (!searchQuery || searchQuery.trim().length < 1) return []
    const q = searchQuery.toLowerCase().trim()

    // 1. Corridors
    const matchedCorridors = corridors
      .filter(c => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || (c.division && c.division.toLowerCase().includes(q)))
      .slice(0, 3)
      .map(c => ({
        id: c.id,
        title: c.name,
        subtitle: `${c.division} • ${c.health}% Health • ${c.points.length} GIS Points`,
        lat: c.points[0]?.[0],
        lng: c.points[0]?.[1],
        corridorObj: c,
        type: 'corridor',
        badge: 'Corridor'
      }))

    // 2. Comprehensive Indian Railway Stations & Junctions Hubs
    const matchedHubs = RAILWAY_STATIONS
      .filter(h =>
        h.name.toLowerCase().includes(q) ||
        (h.code && h.code.toLowerCase().includes(q)) ||
        h.division.toLowerCase().includes(q) ||
        h.corridor.toLowerCase().includes(q) ||
        h.state.toLowerCase().includes(q)
      )
      .slice(0, 5)
      .map(h => ({
        id: `hub-${h.code || h.name}`,
        title: h.name,
        subtitle: `${h.division} • ${h.corridor}`,
        code: h.code,
        division: h.division,
        corridor: h.corridor,
        defaultKm: h.defaultKm,
        supportedLines: h.supportedLines || ALL_TRACK_LINES.map(l => l.name),
        lat: h.lat,
        lng: h.lng,
        zoom: 15,
        type: 'station',
        badge: h.code ? `Station (${h.code})` : 'Station'
      }))

    // 3. Defects
    const matchedDefects = defectMarkers
      .filter(d => d.id.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q) || d.type.toLowerCase().includes(q) || d.corridorName.toLowerCase().includes(q))
      .slice(0, 3)
      .map(d => ({
        id: d.id,
        title: `${d.id} - ${d.desc}`,
        subtitle: `${d.corridorName} • ${d.severity} Severity`,
        lat: d.lat,
        lng: d.lng,
        zoom: 15,
        type: 'defect',
        badge: 'Track Defect'
      }))

    return [...matchedCorridors, ...matchedHubs, ...matchedDefects, ...geocodedSuggestions].slice(0, 8)
  }, [searchQuery, corridors, defectMarkers, geocodedSuggestions])

  // Select Search Item -> Point & Zoom like Google Maps
  const selectSearchResult = (item) => {
    setIsSearchOpen(false)
    setSearchQuery(item.title)

    if (item.type === 'corridor') {
      setSelectedCorridor(item.corridorObj)
      setFocusedPoint(null)
    } else {
      const initialLine = item.supportedLines?.[0] || 'Up Main Line'
      setSelectedTrackLine(initialLine)
      setFocusedPoint({
        lat: item.lat,
        lng: item.lng,
        zoom: item.zoom || 15,
        title: item.title,
        subtitle: item.subtitle,
        code: item.code,
        division: item.division,
        corridor: item.corridor,
        defaultKm: item.defaultKm,
        supportedLines: item.supportedLines || ALL_TRACK_LINES.map(l => l.name),
        type: item.type
      })
    }

    // Smoothly scroll page so the Leaflet map is front and center
    setTimeout(() => {
      mapContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 120)
  }

  // Handle Enter key for instant direct search
  const handleSearchKeyDown = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (searchSuggestions.length > 0) {
        selectSearchResult(searchSuggestions[0])
      } else if (searchQuery.trim().length > 1) {
        try {
          setIsSearchingGeocode(true)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.trim())}&countrycodes=in&limit=1`,
            { headers: { 'Accept-Language': 'en' } }
          )
          if (res.ok) {
            const data = await res.json()
            if (data.length > 0) {
              selectSearchResult({
                id: `geo-${data[0].place_id}`,
                title: data[0].name || data[0].display_name.split(',')[0],
                subtitle: data[0].display_name,
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
                zoom: 14,
                type: 'location',
                badge: 'Location'
              })
            }
          }
        } catch (err) {
          console.error(err)
        } finally {
          setIsSearchingGeocode(false)
        }
      }
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setIsSearchOpen(false)
    setFocusedPoint(null)
  }

  // Leaflet Tile Layer Configurations (100% Free, High-Resolution Satellite & Open Data, No API Key / Watermarks)
  const tileConfig = useMemo(() => {
    if (mapStyle === 'satellite') {
      return {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19
      }
    }
    if (mapStyle === 'topo') {
      return {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
        maxZoom: 19
      }
    }
    // Default: Leaflet standard OpenStreetMap (100% free, no watermarks)
    return {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }
  }, [mapStyle])

  return (
    <div className="map-page-wrapper">
      
      {/* Header Banner */}
      <RevealWrapper>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <span className="badge" style={{ background: 'rgba(228, 164, 189, 0.15)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
                LEAFLET GEOSPATIAL NETWORK
              </span>
              <span className="badge" style={{ background: 'rgba(109, 184, 123, 0.15)', color: 'var(--status-healthy)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <Database size={11} /> {dataSource}
              </span>
              <span className="badge" style={{ background: 'rgba(38, 38, 38, 0.05)', color: 'var(--text-secondary)' }}>
                Open-Meteo Satellite Feed
              </span>
            </div>
            <h1 className="map-page-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Corridor <span style={{ color: 'var(--accent)' }}>Map</span>
            </h1>
            <p className="map-page-desc" style={{ color: 'var(--text-muted)', maxWidth: '750px', marginTop: '4px', fontSize: '0.9rem', lineHeight: 1.4 }}>
              Live GIS tracking of Indian Railways high-speed trunks, section health indexes, track defect locations, and micro-climatic rail temperature monitoring.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', alignItems: 'center', width: '100%', maxWidth: '360px' }}>
            <button
              onClick={loadMapData}
              disabled={refreshing}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '10px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Syncing...' : 'Sync GPS'}</span>
            </button>
            <Link
              to="/plans"
              className="btn btn-primary"
              style={{ flex: 1, padding: '10px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}
            >
              <Train size={15} />
              <span>View Plans</span>
            </Link>
          </div>
        </div>
      </RevealWrapper>

      {/* SEARCH & "WHAT TO CHOOSE" CONTROLS TOOLBAR */}
      <RevealWrapper delay={0.05}>
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-card)',
          padding: '12px 16px',
          marginBottom: 'var(--space-md)',
          border: '1px solid var(--border)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          
          {/* SEARCH BOX: Find any location, station, corridor, or defect */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 260px', width: '100%', position: 'relative' }} ref={searchContainerRef}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search any location, station, city, defect (e.g. Kanpur, Delhi, DEF-001)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setIsSearchOpen(true)
                }}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => setIsSearchOpen(true)}
                style={{
                  width: '100%',
                  padding: '9px 42px 9px 38px',
                  borderRadius: 'var(--radius-card)',
                  border: isSearchOpen ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxShadow: isSearchOpen ? '0 4px 18px rgba(0,0,0,0.08)' : 'none'
                }}
              />
              <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isSearchingGeocode && (
                  <Loader2 size={14} className="spin" style={{ color: 'var(--accent)' }} />
                )}
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2px'
                    }}
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Smart Search Autocomplete Results Popover */}
            {isSearchOpen && searchSuggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                right: 0,
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-card)',
                boxShadow: '0 16px 36px rgba(0,0,0,0.18)',
                zIndex: 1000,
                maxHeight: '340px',
                overflowY: 'auto',
                padding: '6px'
              }}>
                <div style={{ padding: '6px 10px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                  Press Enter or Click to Point & Zoom Map
                </div>
                {searchSuggestions.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    onClick={() => selectSearchResult(item)}
                    style={{
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-card)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'background 0.15s ease',
                      borderBottom: idx < searchSuggestions.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: 'var(--radius-card)',
                      background: item.type === 'corridor' ? 'rgba(109, 184, 123, 0.15)' : item.type === 'defect' ? 'rgba(201, 79, 79, 0.15)' : 'rgba(228, 164, 189, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {item.type === 'corridor' ? (
                        <Train size={15} color="var(--status-healthy)" />
                      ) : item.type === 'defect' ? (
                        <AlertTriangle size={15} color="var(--status-overdue)" />
                      ) : (
                        <MapPin size={15} color="var(--accent)" />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.subtitle}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      color: item.type === 'corridor' ? 'var(--status-healthy)' : item.type === 'defect' ? 'var(--status-overdue)' : 'var(--accent)',
                      background: 'rgba(0,0,0,0.03)',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-xs)'
                    }}>
                      {item.badge}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* WHAT TO CHOOSE: Corridor Selector Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 240px', width: '100%', minWidth: 0 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              Corridor:
            </label>
            <select
              value={selectedCorridor?.id || ''}
              onChange={(e) => {
                const found = corridors.find(c => c.id === e.target.value)
                if (found) setSelectedCorridor(found)
              }}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-card)',
                border: '1px solid var(--border)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                width: '100%',
                minWidth: 0,
                flex: 1
              }}
            >
              {corridors.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.health}% Health)
                </option>
              ))}
            </select>
          </div>

          {/* Map Base Tile Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-primary)', padding: '3px', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)', width: '100%', maxWidth: '340px' }}>
            <button
              onClick={() => setMapStyle('satellite')}
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: 'var(--radius-card)',
                border: 'none',
                background: mapStyle === 'satellite' ? 'var(--text-primary)' : 'transparent',
                color: mapStyle === 'satellite' ? 'var(--bg-primary)' : 'var(--text-primary)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}
            >
              <Globe size={13} />
              Satellite
            </button>
            <button
              onClick={() => setMapStyle('osm')}
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: 'var(--radius-card)',
                border: 'none',
                background: mapStyle === 'osm' ? 'var(--text-primary)' : 'transparent',
                color: mapStyle === 'osm' ? 'var(--bg-primary)' : 'var(--text-primary)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}
            >
              <Layers size={13} />
              Leaflet OSM
            </button>
            <button
              onClick={() => setMapStyle('topo')}
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: 'var(--radius-card)',
                border: 'none',
                background: mapStyle === 'topo' ? 'var(--text-primary)' : 'transparent',
                color: mapStyle === 'topo' ? 'var(--bg-primary)' : 'var(--text-primary)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}
            >
              <Compass size={13} />
              Terrain Topo
            </button>
          </div>
        </div>

        {/* QUICK SELECT PILLS: 1-Click Corridor Jumping */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: 'var(--space-md)', width: '100%', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <Navigation size={12} /> Quick Jump:
          </span>
          {corridors.map(c => {
            const isSelected = selectedCorridor?.id === c.id
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCorridor(c)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-card)',
                  border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: isSelected ? 'var(--text-primary)' : 'var(--bg-secondary)',
                  color: isSelected ? 'var(--bg-primary)' : 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: getCorridorColor(c.status) }} />
                <span>{c.name.split(' ')[0]}</span>
                <span style={{ opacity: 0.7, fontSize: '10px' }}>{c.health}%</span>
              </button>
            )
          })}
        </div>
      </RevealWrapper>

      {/* MAIN MAP LAYOUT (Leaflet Map + Sidebar Details) */}
      <div className="map-layout-grid">
        
        {/* LEAFLET MAP CONTAINER */}
        <RevealWrapper>
          <div ref={mapContainerRef} className="map-container" style={{
            height: 'calc(100vh - 280px)',
            minHeight: '560px',
            position: 'relative',
            borderRadius: 'var(--radius-card)',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid var(--border)'
          }}>
            
            {/* Overlay Map Badge */}
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              zIndex: 999,
              background: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(8px)',
              padding: '8px 14px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.78rem',
              fontWeight: 800,
              boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {focusedPoint ? (
                <>
                  <MapPin size={14} color="var(--accent)" />
                  <span>Focused: {focusedPoint.title} ({focusedPoint.lat.toFixed(3)}, {focusedPoint.lng.toFixed(3)})</span>
                  <button
                    onClick={() => {
                      setFocusedPoint(null)
                      setSearchQuery('')
                    }}
                    style={{
                      marginLeft: '6px',
                      background: 'rgba(201, 79, 79, 0.12)',
                      border: 'none',
                      borderRadius: 'var(--radius-pill)',
                      padding: '2px 8px',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: 'var(--status-overdue)',
                      cursor: 'pointer'
                    }}
                  >
                    Reset Pin
                  </button>
                </>
              ) : (
                <>
                  <Compass size={14} color="var(--accent)" />
                  <span>Viewing: {selectedCorridor ? selectedCorridor.name : 'All Corridors'}</span>
                </>
              )}
            </div>

            {/* Layer Filter Overlay Buttons */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '16px',
              zIndex: 999,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)',
              padding: '8px 14px',
              borderRadius: 'var(--radius-card)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
              display: 'flex',
              gap: '12px',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filters.showCorridors}
                  onChange={e => setFilters(f => ({ ...f, showCorridors: e.target.checked }))}
                  style={{ accentColor: 'var(--accent)' }}
                />
                <span>Corridor Lines ({filteredCorridors.length})</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filters.showDefects}
                  onChange={e => setFilters(f => ({ ...f, showDefects: e.target.checked }))}
                  style={{ accentColor: 'var(--dept-conflict)' }}
                />
                <span>Defect Points ({filteredDefects.length})</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showRailwayOverlay}
                  onChange={e => setShowRailwayOverlay(e.target.checked)}
                  style={{ accentColor: 'var(--dept-snt)' }}
                />
                <span>Railway Tracks</span>
              </label>
            </div>

            {/* REACT-LEAFLET MAP */}
            <MapContainer
              center={[22.5, 79.0]}
              zoom={5}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              {/* Primary Base Map TileLayer */}
              <TileLayer
                key={tileConfig.url}
                attribution={tileConfig.attribution}
                url={tileConfig.url}
                maxZoom={tileConfig.maxZoom || 19}
              />

              {/* Optional OpenRailwayMap Track Overlay */}
              {showRailwayOverlay && (
                <TileLayer
                  url="https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openrailwaymap.org">OpenRailwayMap</a>'
                  maxZoom={19}
                  opacity={0.7}
                />
              )}

              {/* Fly, Pan & Zoom like Google Maps */}
              <MapCameraController
                targetPoints={selectedCorridor?.points}
                focusedPoint={focusedPoint}
              />

              {/* Searched GPS Target Pin (Pulsing Radar Pin) */}
              {focusedPoint && (
                <Marker
                  position={[focusedPoint.lat, focusedPoint.lng]}
                  icon={searchPinIcon}
                  eventHandlers={{
                    add: (e) => {
                      setTimeout(() => e.target.openPopup(), 400)
                    }
                  }}
                >
                  <Popup autoClose={false} closeOnClick={false}>
                    <div style={{ fontFamily: 'var(--font-family)', minWidth: '260px', padding: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '6px' }}>
                        <span className="badge" style={{
                          background: focusedPoint.type === 'station' ? 'rgba(109, 184, 123, 0.2)' : focusedPoint.type === 'defect' ? 'rgba(201, 79, 79, 0.2)' : 'rgba(228, 164, 189, 0.25)',
                          color: focusedPoint.type === 'station' ? 'var(--status-healthy)' : focusedPoint.type === 'defect' ? 'var(--status-overdue)' : 'var(--accent)',
                          fontSize: '10px'
                        }}>
                          {focusedPoint.code ? `STATION (${focusedPoint.code})` : focusedPoint.type === 'defect' ? 'TRACK DEFECT' : 'GPS LOCATION'}
                        </span>
                        {focusedPoint.defaultKm && (
                          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)' }}>
                            {focusedPoint.defaultKm}
                          </span>
                        )}
                      </div>

                      <div style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.25 }}>
                        {focusedPoint.title}
                      </div>
                      {focusedPoint.subtitle && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '3px', lineHeight: 1.35 }}>
                          {focusedPoint.subtitle}
                        </div>
                      )}

                      {/* Track Line Selector in Leaflet Map Popup */}
                      <div style={{ marginTop: '10px', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Select Track Line:</span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent)' }}>{selectedTrackLine}</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                          {(focusedPoint.supportedLines || ['Up Main Line', 'Down Main Line', '3rd Line (Freight)', 'Both Lines (Curfew)']).map(line => (
                            <button
                              key={line}
                              type="button"
                              onClick={() => setSelectedTrackLine(line)}
                              style={{
                                background: selectedTrackLine === line ? 'var(--accent)' : 'var(--bg-secondary)',
                                color: selectedTrackLine === line ? 'var(--text-primary)' : 'var(--text-secondary)',
                                border: `1px solid ${selectedTrackLine === line ? 'var(--accent)' : 'var(--border)'}`,
                                borderRadius: 'var(--radius-card)',
                                padding: '3px 8px',
                                fontSize: '10px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {line}
                            </button>
                          ))}
                        </div>

                        {/* Line Specs Strip */}
                        <div style={{ background: 'var(--bg-secondary)', padding: '6px 8px', borderRadius: 'var(--radius-card)', fontSize: '0.7rem', color: 'var(--text-muted)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '8px' }}>
                          <div>Gauge: <strong>1676mm BG</strong></div>
                          <div>OHE: <strong>25kV AC 50Hz</strong></div>
                          <div>Max Speed: <strong>130 km/h</strong></div>
                          <div>Signaling: <strong>Auto Block</strong></div>
                        </div>

                        <Link
                          to="/plans"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            width: '100%',
                            padding: '6px 10px',
                            background: 'var(--accent)',
                            color: 'var(--text-primary)',
                            borderRadius: 'var(--radius-card)',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            textDecoration: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <Sparkles size={13} />
                          <span>Schedule Block on {selectedTrackLine.split(' ')[0]} Line</span>
                        </Link>
                      </div>

                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>GPS: {focusedPoint.lat.toFixed(4)}°N, {focusedPoint.lng.toFixed(4)}°E</span>
                        <span>Indian Railways Network</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Corridors Polylines */}
              {filters.showCorridors && filteredCorridors.map((corridor) => {
                const isSelected = selectedCorridor?.id === corridor.id
                return (
                  <Polyline
                    key={corridor.id}
                    positions={corridor.points}
                    pathOptions={{
                      color: getCorridorColor(corridor.status),
                      weight: isSelected ? 7 : 4,
                      opacity: isSelected ? 1 : 0.65,
                      dashArray: corridor.status === 'active_block' ? '12 6' : undefined,
                    }}
                    eventHandlers={{
                      click: () => setSelectedCorridor(corridor),
                    }}
                  >
                    <Popup>
                      <div style={{ fontFamily: 'var(--font-family)', minWidth: '220px', padding: '4px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.15em', color: getCorridorColor(corridor.status), textTransform: 'uppercase' }}>
                          {corridor.status.replace('_', ' ')}
                        </span>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '4px 0 2px' }}>{corridor.name}</h4>
                        <p style={{ fontSize: '0.75rem', color: '#666', marginBottom: '8px' }}>{corridor.division}</p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.8rem', background: '#f5f0eb', padding: '8px', borderRadius: '8px' }}>
                          <div>Health: <strong>{corridor.health}%</strong></div>
                          <div>Defects: <strong>{corridor.defects || 0}</strong></div>
                          <div>Speed Limit: <strong>{corridor.typicalSpeedLimit || 130} km/h</strong></div>
                          <div>Daily Trains: <strong>{corridor.dailyTrainDensity || 100}</strong></div>
                        </div>

                        <button
                          onClick={() => setSelectedCorridor(corridor)}
                          style={{
                            marginTop: '8px',
                            width: '100%',
                            padding: '6px',
                            background: 'var(--accent)',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          Focus Corridor Insights
                        </button>
                      </div>
                    </Popup>
                  </Polyline>
                )
              })}

              {/* Defect Point Markers */}
              {filters.showDefects && filteredDefects.map((defect) => (
                <CircleMarker
                  key={defect.id}
                  center={[defect.lat, defect.lng]}
                  radius={getSeverityRadius(defect.severity)}
                  pathOptions={{
                    color: getSeverityColor(defect.severity),
                    fillColor: getSeverityColor(defect.severity),
                    fillOpacity: 0.85,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div style={{ fontFamily: 'var(--font-family)', minWidth: '200px', padding: '4px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', color: getSeverityColor(defect.severity), textTransform: 'uppercase' }}>
                        {defect.severity} SEVERITY • {defect.type}
                      </span>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '4px 0 2px' }}>{defect.id}</h4>
                      <p style={{ fontSize: '0.75rem', color: '#666', marginBottom: '6px' }}>{defect.corridorName}</p>
                      <p style={{ fontSize: '0.82rem', background: '#f5f0eb', padding: '6px 8px', borderRadius: '6px', margin: 0 }}>{defect.desc}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </RevealWrapper>

        {/* SIDEBAR: SELECTED CORRIDOR & SATELLITE CLIMATIC TELEMETRY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          
          {/* Selected Corridor Overview Card */}
          <RevealWrapper delay={0.1}>
            <div className="card" style={{ padding: 'var(--space-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  ACTIVE INSPECTION FOCUS
                </span>
                <span className="badge" style={{
                  background: selectedCorridor ? `${getCorridorColor(selectedCorridor.status)}22` : 'rgba(0,0,0,0.05)',
                  color: selectedCorridor ? getCorridorColor(selectedCorridor.status) : 'var(--text-primary)',
                  fontWeight: 800,
                  fontSize: '11px'
                }}>
                  {selectedCorridor?.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '2px', lineHeight: 1.2 }}>
                {selectedCorridor?.name}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>
                {selectedCorridor?.division} • ID: {selectedCorridor?.id}
              </p>

              {/* Health Score Bar */}
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800, marginBottom: '4px' }}>
                  <span>Asset Health Index</span>
                  <span style={{ color: getCorridorColor(selectedCorridor?.status) }}>{selectedCorridor?.health}%</span>
                </div>
                <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
                  <div style={{
                    width: `${selectedCorridor?.health}%`,
                    height: '100%',
                    background: getCorridorColor(selectedCorridor?.status),
                    borderRadius: 'var(--radius-card)'
                  }} />
                </div>
              </div>

              {/* Metric stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: 'var(--space-md)' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: 'var(--radius-card)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Typical Max Speed</span>
                  <p style={{ fontSize: '1.05rem', fontWeight: 900, margin: 0 }}>{selectedCorridor?.typicalSpeedLimit || 130} km/h</p>
                </div>
                <div style={{ background: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: 'var(--radius-card)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Daily Train Density</span>
                  <p style={{ fontSize: '1.05rem', fontWeight: 900, margin: 0 }}>{selectedCorridor?.dailyTrainDensity || 110} Rakes</p>
                </div>
              </div>

              {/* Corridor & Station Track Line Selector */}
              <div style={{ marginBottom: 'var(--space-md)', background: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Selected Track Line:</span>
                  <span className="badge" style={{ background: 'var(--accent)', color: 'var(--text-primary)', fontWeight: 800, fontSize: '10px' }}>
                    {selectedTrackLine}
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {(focusedPoint?.supportedLines || ALL_TRACK_LINES.slice(0, 5).map(l => l.name)).map(line => (
                    <button
                      key={line}
                      type="button"
                      onClick={() => setSelectedTrackLine(line)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-card)',
                        border: `1px solid ${selectedTrackLine === line ? 'var(--accent)' : 'var(--border)'}`,
                        background: selectedTrackLine === line ? 'var(--accent)' : 'var(--bg-primary)',
                        color: selectedTrackLine === line ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {line}
                    </button>
                  ))}
                </div>
              </div>

              <Link
                to="/plans"
                className="btn btn-secondary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.82rem', textDecoration: 'none', padding: '10px' }}
              >
                <span>View Scheduled Curfews for Corridor</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </RevealWrapper>

          {/* Open-Meteo Climatic & Rail Safety Telemetry */}
          <RevealWrapper delay={0.15}>
            <div className="card" style={{ padding: 'var(--space-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                <span className="text-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CloudRain size={12} color="var(--accent)" /> RAIL SAFETY CLIMATE
                </span>
                {weatherLoading && <Loader2 size={12} className="animate-spin" color="var(--accent)" />}
              </div>

              {weather ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                    <div style={{ background: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: 'var(--radius-card)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        <Thermometer size={12} /> Ambient Temp
                      </div>
                      <p style={{ fontSize: '1.25rem', fontWeight: 900, margin: '2px 0 0' }}>
                        {weather.ambientTempC}°C
                      </p>
                    </div>

                    <div style={{ background: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: 'var(--radius-card)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        <Thermometer size={12} color="var(--accent)" /> Rail Temp (Est)
                      </div>
                      <p style={{ fontSize: '1.25rem', fontWeight: 900, margin: '2px 0 0', color: 'var(--accent)' }}>
                        {weather.estimatedRailTempC}°C
                      </p>
                    </div>

                    <div style={{ background: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: 'var(--radius-card)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        <Wind size={12} /> Wind Speed
                      </div>
                      <p style={{ fontSize: '1.05rem', fontWeight: 900, margin: '2px 0 0' }}>
                        {weather.windSpeedKmH} km/h
                      </p>
                    </div>

                    <div style={{ background: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: 'var(--radius-card)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        <CloudRain size={12} /> Precipitation
                      </div>
                      <p style={{ fontSize: '1.05rem', fontWeight: 900, margin: '2px 0 0' }}>
                        {weather.precipitationMm} mm
                      </p>
                    </div>
                  </div>

                  {/* Safety Warnings */}
                  <div style={{ background: 'rgba(0,0,0,0.03)', padding: '10px 12px', borderRadius: 'var(--radius-card)', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>OHE Contact Wire Sway:</span>
                      <strong style={{ color: weather.safetyAssessment?.oheSwayRisk.includes('Alert') ? 'var(--dept-conflict)' : 'var(--status-healthy)' }}>
                        {weather.safetyAssessment?.oheSwayRisk}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Rail Buckling Risk:</span>
                      <strong style={{ color: weather.safetyAssessment?.railBucklingRisk.includes('High') ? 'var(--dept-conflict)' : 'var(--status-healthy)' }}>
                        {weather.safetyAssessment?.railBucklingRisk}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Track Adhesion:</span>
                      <strong>{weather.safetyAssessment?.tractionCondition}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 'var(--space-md)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Loading climatic telemetry...
                </div>
              )}
            </div>
          </RevealWrapper>

          {/* Corridor Status Legend */}
          <RevealWrapper delay={0.2}>
            <div className="card" style={{ padding: 'var(--space-md) var(--space-lg)' }}>
              <span className="text-label" style={{ marginBottom: '8px', display: 'block' }}>CORRIDOR STATUS LEGEND</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  { label: 'Healthy', color: '#6db87b', count: corridors.filter(c => c.status === 'healthy').length },
                  { label: 'Active Block', color: '#d4a057', count: corridors.filter(c => c.status === 'active_block').length },
                  { label: 'Due Maint.', color: '#e4a4bd', count: corridors.filter(c => c.status === 'due').length },
                  { label: 'Overdue', color: '#c94f4f', count: corridors.filter(c => c.status === 'overdue').length },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setFilters(f => ({ ...f, statusFilter: f.statusFilter === item.label.toLowerCase().replace(/ /g, '_') ? 'all' : item.label.toLowerCase().replace(/ /g, '_') }))}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 8px',
                      borderRadius: '8px',
                      background: filters.statusFilter === item.label.toLowerCase().replace(/ /g, '_') ? 'rgba(0,0,0,0.06)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 700
                    }}
                  >
                    <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: item.color }} />
                    <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{item.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </RevealWrapper>
        </div>
      </div>
    </div>
  )
}
