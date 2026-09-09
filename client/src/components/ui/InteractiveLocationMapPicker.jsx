import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { MapContainer, TileLayer, Circle, Polyline, CircleMarker, Popup, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import { MapPin, Navigation, Compass, Layers, Globe, Check, Search, Loader2, Sparkles, Train, Crosshair } from 'lucide-react'
import {
  RAILWAY_STATIONS,
  DEFAULT_RAILWAY_CORRIDORS,
  ALL_TRACK_LINES,
  searchRailwayLocations,
  findNearestStation,
  findNearestCorridor
} from '../../lib/railwayLocations'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Helper component: Listens to map move/drag/moveend events to dynamically select Station Area & Track Area
// Updates LIVE during movement for real-time station/track snapping (like ride-hailing map pickers)
function MapMovementAreaSelector({ onCenterChange, setIsMoving }) {
  const lastUpdateRef = React.useRef(0)
  const map = useMapEvents({
    movestart() {
      setIsMoving(true)
    },
    move() {
      const now = Date.now()
      // Throttle: update every 80ms during drag for smooth HUD without lag
      if (now - lastUpdateRef.current < 80) return
      lastUpdateRef.current = now
      const center = map.getCenter()
      onCenterChange(center.lat, center.lng, false)
    },
    moveend() {
      setIsMoving(false)
      const center = map.getCenter()
      onCenterChange(center.lat, center.lng, true)
    },
    click(e) {
      map.flyTo(e.latlng, map.getZoom(), { duration: 0.5 })
    }
  })
  return null
}

// Controller to fly smoothly to selected station when typed or clicked
function MapCameraController({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 13, { duration: 1.0 })
    }
  }, [center, zoom, map])
  return null
}

export default function InteractiveLocationMapPicker({
  location = '',
  onLocationChange,
  division = '',
  onDivisionChange,
  corridor = '',
  onCorridorChange,
  kmMarker = '',
  onKmMarkerChange,
  trackLine = 'Up Main Line',
  onTrackLineChange,
  className = ''
}) {
  // Initialize with Mathura Junction as default if nothing provided
  const initialStation = useMemo(() => {
    if (location) {
      const matched = RAILWAY_STATIONS.find(s => location.toLowerCase().includes(s.name.toLowerCase()) || (s.code && location.includes(s.code)))
      if (matched) return matched
    }
    return RAILWAY_STATIONS.find(s => s.code === 'MTJ') || RAILWAY_STATIONS[0]
  }, [])

  const [selectedStation, setSelectedStation] = useState(initialStation)
  const [selectedTrack, setSelectedTrack] = useState(trackLine || 'Up Main Line')
  const [currentCoords, setCurrentCoords] = useState([initialStation.lat, initialStation.lng])
  const [flyTarget, setFlyTarget] = useState(null)
  const [mapZoom, setMapZoom] = useState(13)
  const [isMoving, setIsMoving] = useState(false)
  const [searchQuery, setSearchQuery] = useState(location || initialStation.name)
  const [suggestions, setSuggestions] = useState([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [mapStyle, setMapStyle] = useState('satellite') // 'satellite' | 'osm'
  const searchBoxRef = useRef(null)

  // Keep internal states in sync with incoming props
  const lastLocationPropRef = useRef(location)
  const lastDivisionPropRef = useRef(division)

  useEffect(() => {
    if (trackLine && trackLine !== selectedTrack) {
      setSelectedTrack(trackLine)
    }
  }, [trackLine])

  // Sync when parent changes division or corridor (e.g. from dropdown or quick jump)
  useEffect(() => {
    if (division && division !== lastDivisionPropRef.current) {
      lastDivisionPropRef.current = division
      // Find primary station associated with this division
      const matchedStation = RAILWAY_STATIONS.find(s => s.division === division) ||
                             (corridor ? RAILWAY_STATIONS.find(s => s.corridor === corridor) : null)
      if (matchedStation) {
        setSelectedStation(matchedStation)
        setSearchQuery(matchedStation.name)
        lastLocationPropRef.current = matchedStation.name
        setFlyTarget([matchedStation.lat, matchedStation.lng])
        setCurrentCoords([matchedStation.lat, matchedStation.lng])
        setMapZoom(13)

        const supported = matchedStation.supportedLines || []
        if (supported.length > 0 && !supported.includes(selectedTrack)) {
          setSelectedTrack(supported[0])
          if (onTrackLineChange) onTrackLineChange(supported[0])
        }
      }
    }
  }, [division, corridor, selectedTrack, onTrackLineChange])

  // Sync when parent changes location text directly
  useEffect(() => {
    if (location && location !== lastLocationPropRef.current) {
      lastLocationPropRef.current = location
      setSearchQuery(location)

      const matched = RAILWAY_STATIONS.find(s =>
        s.name.toLowerCase() === location.toLowerCase() ||
        location.toLowerCase().includes(s.name.toLowerCase()) ||
        (s.code && location.toUpperCase().includes(s.code))
      )
      if (matched && (matched.lat !== currentCoords[0] || matched.lng !== currentCoords[1])) {
        setSelectedStation(matched)
        setFlyTarget([matched.lat, matched.lng])
        setCurrentCoords([matched.lat, matched.lng])
        if (matched.division) lastDivisionPropRef.current = matched.division
      }
    }
  }, [location, currentCoords])

  // Ensure an initial valid selection is propagated to parent on mount
  useEffect(() => {
    if (!location && initialStation) {
      lastLocationPropRef.current = initialStation.name
      lastDivisionPropRef.current = initialStation.division
      if (onLocationChange) onLocationChange(initialStation.name)
      if (onDivisionChange) onDivisionChange(initialStation.division)
      if (onCorridorChange) onCorridorChange(initialStation.corridor)
      if (onKmMarkerChange) onKmMarkerChange(initialStation.defaultKm || 'KM 104.2')
      if (onTrackLineChange && !trackLine) onTrackLineChange('Up Main Line')
    }
  }, [])

  // Close search suggestions on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  // Search station debouncer
  useEffect(() => {
    if (!isSearchOpen) return
    setIsSearching(true)
    const timer = setTimeout(async () => {
      try {
        const results = await searchRailwayLocations(searchQuery)
        setSuggestions(results)
      } catch (err) {
        console.error('Location search failed:', err)
      } finally {
        setIsSearching(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [searchQuery, isSearchOpen])

  // CORE LOGIC: Dynamic Area Selection as the User Moves the Map
  // Updates HUD live during pan for real-time station/track snapping
  // Only propagates to parent callbacks on moveend (isFinal) for performance
  const handleMapCenterChange = useCallback((lat, lng, isFinal) => {
    setCurrentCoords([lat, lng])

    // Find nearest station and corridor from current map center
    const nearestStn = findNearestStation(lat, lng)
    const nearestCorr = findNearestCorridor(lat, lng)

    if (nearestStn) {
      setSelectedStation(nearestStn)

      // Calculate approximate distance from station center in KM
      const dLat = (lat - nearestStn.lat) * 111
      const dLng = (lng - nearestStn.lng) * 111 * Math.cos((lat * Math.PI) / 180)
      const distFromStationKm = Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 10) / 10

      let areaLocationName = nearestStn.name
      let computedKm = nearestStn.defaultKm || 'KM 100.0'

      if (distFromStationKm <= 1.8) {
        // Within station yard perimeter
        areaLocationName = `${nearestStn.name} Yard`
        computedKm = nearestStn.defaultKm || 'KM ---'
      } else {
        // Along the track / outer block section
        const direction = dLat > 0 ? 'North' : 'South'
        areaLocationName = `${nearestStn.name} (${direction} Block Section, ${distFromStationKm}km)`
        try {
          const baseNum = parseFloat(nearestStn.defaultKm.replace(/[^\d.]/g, '')) || 100
          const offset = dLat > 0 ? distFromStationKm : -distFromStationKm
          computedKm = `KM ${(baseNum + offset).toFixed(1)}`
        } catch {
          computedKm = `${nearestStn.defaultKm} + ${distFromStationKm}km`
        }
      }

      // Always update the visual HUD label during drag (live snapping)
      setSearchQuery(areaLocationName)

      // Keep track line supported — auto-switch if current track isn't available at this station
      if (nearestStn.supportedLines && nearestStn.supportedLines.length > 0) {
        if (!nearestStn.supportedLines.includes(selectedTrack)) {
          const firstLine = nearestStn.supportedLines[0]
          setSelectedTrack(firstLine)
          // Propagate track change to parent immediately since it's a correction
          if (isFinal && onTrackLineChange) onTrackLineChange(firstLine)
        }
      }

      // Only notify parent form components on moveend (final) to avoid excessive re-renders
      if (isFinal) {
        lastLocationPropRef.current = areaLocationName
        const nextDiv = nearestStn.division || nearestCorr?.division
        if (nextDiv) lastDivisionPropRef.current = nextDiv

        if (onLocationChange) onLocationChange(areaLocationName)
        if (nextDiv && onDivisionChange) onDivisionChange(nextDiv)
        if (onCorridorChange) onCorridorChange(nearestStn.corridor || nearestCorr?.name)
        if (onKmMarkerChange) onKmMarkerChange(computedKm)
        if (onTrackLineChange) onTrackLineChange(selectedTrack)
      }
    }
  }, [selectedTrack, onLocationChange, onDivisionChange, onCorridorChange, onKmMarkerChange, onTrackLineChange])

  // Select station from text autocomplete suggestions
  const handleSelectStationFromSearch = (stn) => {
    setSelectedStation(stn)
    setSearchQuery(stn.name)
    setIsSearchOpen(false)
    setFlyTarget([stn.lat, stn.lng])
    setCurrentCoords([stn.lat, stn.lng])
    setMapZoom(14)

    const lineToUse = (stn.supportedLines && stn.supportedLines.length > 0) ? stn.supportedLines[0] : selectedTrack
    setSelectedTrack(lineToUse)

    lastLocationPropRef.current = stn.name
    if (stn.division) lastDivisionPropRef.current = stn.division

    if (onLocationChange) onLocationChange(stn.name)
    if (onDivisionChange) onDivisionChange(stn.division)
    if (onCorridorChange) onCorridorChange(stn.corridor)
    if (onKmMarkerChange) onKmMarkerChange(stn.defaultKm || 'KM ---')
    if (onTrackLineChange) onTrackLineChange(lineToUse)
  }

  // Quick jump to corridor
  const handleCorridorJump = (c) => {
    if (c.points && c.points.length > 0) {
      const midPoint = c.points[Math.floor(c.points.length / 2)]
      setFlyTarget(midPoint)
      setCurrentCoords(midPoint)
      setMapZoom(12)

      const nearestStn = findNearestStation(midPoint[0], midPoint[1])
      if (nearestStn) {
        setSelectedStation(nearestStn)
        setSearchQuery(nearestStn.name)
        lastLocationPropRef.current = nearestStn.name
        if (nearestStn.division) lastDivisionPropRef.current = nearestStn.division

        if (onLocationChange) onLocationChange(nearestStn.name)
        if (onKmMarkerChange) onKmMarkerChange(nearestStn.defaultKm || 'KM ---')
        if (nearestStn.supportedLines && nearestStn.supportedLines.length > 0) {
          setSelectedTrack(nearestStn.supportedLines[0])
          if (onTrackLineChange) onTrackLineChange(nearestStn.supportedLines[0])
        }
      }

      if (onCorridorChange) onCorridorChange(c.name)
      if (c.division) {
        lastDivisionPropRef.current = c.division
        if (onDivisionChange) onDivisionChange(c.division)
      }
    }
  }

  // Change selected track line
  const handleTrackLineSelect = (line) => {
    setSelectedTrack(line)
    if (onTrackLineChange) onTrackLineChange(line)
  }

  const tileUrl = mapStyle === 'satellite'
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

  const activeCorridor = useMemo(() => {
    return findNearestCorridor(currentCoords[0], currentCoords[1])
  }, [currentCoords])

  const availableLines = selectedStation?.supportedLines || ALL_TRACK_LINES.map(l => l.name)

  return (
    <div className={`interactive-map-picker ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      
      {/* Search Input with Autocomplete */}
      <div ref={searchBoxRef} style={{ position: 'relative', width: '100%' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="input form-input"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setIsSearchOpen(true)
              if (onLocationChange) onLocationChange(e.target.value)
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search station or drag map below to select area..."
            style={{
              paddingLeft: '38px',
              paddingRight: isSearching ? '38px' : '14px',
              fontWeight: 700
            }}
          />
          <MapPin
            size={16}
            color="var(--accent)"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none'
            }}
          />
          {isSearching && (
            <Loader2
              size={16}
              className="animate-spin"
              color="var(--accent)"
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none'
              }}
            />
          )}
        </div>

        {/* Autocomplete Dropdown List */}
        {isSearchOpen && (
          <div className="location-autocomplete-popover" style={{ zIndex: 1200 }}>
            <div style={{ padding: '6px 10px', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
              <span>SELECT STATION OR JUNCTION HUB</span>
              {suggestions.length > 0 && <span>{suggestions.length} matched</span>}
            </div>

            {suggestions.map((stn, i) => (
              <div
                key={`${stn.code || stn.name}-${i}`}
                className="location-item-row"
                onClick={() => handleSelectStationFromSearch(stn)}
              >
                <div style={{ width: '30px', height: '30px', borderRadius: 'var(--radius-card)', background: 'rgba(228, 164, 189, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Navigation size={15} color="var(--accent)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      {stn.name}
                    </span>
                    {stn.code && (
                      <span style={{ fontSize: '0.68rem', fontWeight: 900, background: 'var(--accent)', color: 'var(--text-primary)', padding: '1px 5px', borderRadius: '4px' }}>
                        {stn.code}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {stn.division} • {stn.corridor}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent)' }}>
                    {stn.defaultKm || 'KM ---'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Corridors Quick Jump Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', flexShrink: 0 }}>
          Corridor Jump:
        </span>
        {DEFAULT_RAILWAY_CORRIDORS.map(c => {
          const isSelected = corridor && corridor.toLowerCase().includes(c.name.toLowerCase().split(' ')[0])
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => handleCorridorJump(c)}
              style={{
                padding: '3px 8px',
                borderRadius: 'var(--radius-card)',
                border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                background: isSelected ? 'var(--accent)' : 'var(--bg-primary)',
                color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {c.name.split('(')[0].trim()}
            </button>
          )
        })}
      </div>

      {/* INTERACTIVE LEAFLET MAP AREA WITH CENTER PIN RETICLE */}
      <div style={{
        position: 'relative',
        height: '280px',
        width: '100%',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        border: '1.5px solid var(--accent)',
        boxShadow: '0 6px 24px rgba(0,0,0,0.18)'
      }}>
        {/* Floating Top HUD: Always Active Station Area & Track Area */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          right: '80px',
          zIndex: 999,
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap',
          pointerEvents: 'none'
        }}>
          {/* Station Area Indicator */}
          <div style={{
            background: 'rgba(17, 23, 38, 0.92)',
            color: '#ffffff',
            padding: '4px 10px',
            borderRadius: 'var(--radius-card)',
            fontSize: '0.72rem',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(228, 164, 189, 0.35)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            <Navigation size={13} color="var(--accent)" />
            <span>STATION AREA:</span>
            <strong style={{ color: 'var(--accent)' }}>{selectedStation?.code || 'STN'}</strong>
            <span style={{ opacity: 0.85 }}>({selectedStation?.name.split('(')[0].trim()})</span>
          </div>

          {/* Track Area Indicator */}
          <div style={{
            background: 'rgba(17, 23, 38, 0.92)',
            color: '#ffffff',
            padding: '4px 10px',
            borderRadius: 'var(--radius-card)',
            fontSize: '0.72rem',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(228, 164, 189, 0.35)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            <Train size={13} color="var(--accent)" />
            <span>TRACK AREA:</span>
            <strong style={{ color: '#6db87b' }}>{selectedTrack}</strong>
            <span style={{ opacity: 0.85 }}>({kmMarker || selectedStation?.defaultKm || 'KM ---'})</span>
          </div>
        </div>

        {/* Map Base Tile Switcher */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 999,
          display: 'flex',
          gap: '3px',
          background: 'rgba(255,255,255,0.92)',
          padding: '2px',
          borderRadius: 'var(--radius-card)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}>
          <button
            type="button"
            onClick={() => setMapStyle('satellite')}
            style={{
              padding: '3px 8px',
              borderRadius: 'var(--radius-card)',
              border: 'none',
              background: mapStyle === 'satellite' ? '#262626' : 'transparent',
              color: mapStyle === 'satellite' ? '#ffffff' : '#333333',
              fontSize: '0.68rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Satellite
          </button>
          <button
            type="button"
            onClick={() => setMapStyle('osm')}
            style={{
              padding: '3px 8px',
              borderRadius: 'var(--radius-card)',
              border: 'none',
              background: mapStyle === 'osm' ? '#262626' : 'transparent',
              color: mapStyle === 'osm' ? '#ffffff' : '#333333',
              fontSize: '0.68rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            OSM
          </button>
        </div>

        {/* FIXED CENTER TARGET RETICLE (PIN LIFTS WHILE MOVING, DROPS ON MOVEEND) */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: isMoving ? 'translate(-50%, -120%) scale(1.1)' : 'translate(-50%, -100%) scale(1)',
          transition: 'transform 0.16s cubic-bezier(0.34, 1.56, 0.64, 1)',
          zIndex: 1000,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* Station/Track Area Marker Tag */}
          <div style={{
            background: 'var(--accent)',
            color: 'var(--text-primary)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '10px',
            fontWeight: 900,
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            whiteSpace: 'nowrap',
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            border: '1.5px solid #ffffff'
          }}>
            <Crosshair size={11} strokeWidth={3} />
            <span>{selectedStation?.code || 'AREA'} • {selectedTrack.split(' ')[0]}</span>
          </div>

          {/* Pin Head */}
          <div style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: '#e4a4bd',
            border: '3px solid #ffffff',
            boxShadow: '0 0 10px rgba(0,0,0,0.5)'
          }} />
          
          {/* Pin Needle */}
          <div style={{
            width: '3px',
            height: '14px',
            background: '#ffffff',
            borderRadius: '2px',
            marginTop: '-2px'
          }} />

          {/* Map Surface Drop Shadow */}
          <div style={{
            width: isMoving ? '8px' : '16px',
            height: '4px',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.35)',
            marginTop: '2px',
            transition: 'all 0.16s ease'
          }} />
        </div>

        {/* Bottom Instruction Bar */}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 999,
          background: 'rgba(17, 23, 38, 0.88)',
          color: 'var(--text-muted)',
          padding: '3px 12px',
          borderRadius: 'var(--radius-pill)',
          fontSize: '0.65rem',
          fontWeight: 700,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {isMoving ? 'Selecting area...' : 'Drag map area to select track & station area'}
        </div>

        {/* LEAFLET REACT MAP */}
        <MapContainer
          center={currentCoords}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer url={tileUrl} maxZoom={19} />

          <MapCameraController center={flyTarget} zoom={mapZoom} />
          <MapMovementAreaSelector onCenterChange={handleMapCenterChange} setIsMoving={setIsMoving} />

          {/* Active Station Area Possession Boundary Circle */}
          {selectedStation && (
            <Circle
              center={[selectedStation.lat, selectedStation.lng]}
              radius={1800}
              pathOptions={{
                color: 'var(--accent)',
                fillColor: 'var(--accent)',
                fillOpacity: 0.16,
                weight: 2,
                dashArray: '6 6'
              }}
            >
              <Tooltip permanent direction="top" offset={[0, -10]}>
                <span style={{ fontSize: '10px', fontWeight: 800 }}>
                  {selectedStation.name} (Station Yard Boundary)
                </span>
              </Tooltip>
            </Circle>
          )}

          {/* Railway Corridor Polylines */}
          {DEFAULT_RAILWAY_CORRIDORS.map(c => {
            const isMatch = activeCorridor?.id === c.id
            return (
              <Polyline
                key={c.id}
                positions={c.points}
                pathOptions={{
                  color: isMatch ? 'var(--accent)' : '#7ec4cf',
                  weight: isMatch ? 5 : 3,
                  opacity: isMatch ? 0.95 : 0.45,
                  dashArray: isMatch ? undefined : '6 6'
                }}
              />
            )
          })}

          {/* Railway Station Circle Pins along Corridor */}
          {RAILWAY_STATIONS.map((stn, idx) => (
            <CircleMarker
              key={`${stn.code}-${idx}`}
              center={[stn.lat, stn.lng]}
              radius={selectedStation?.code === stn.code ? 7 : 4.5}
              pathOptions={{
                color: '#ffffff',
                fillColor: selectedStation?.code === stn.code ? 'var(--accent)' : '#7ec4cf',
                fillOpacity: 0.95,
                weight: 2
              }}
              eventHandlers={{
                click: () => handleSelectStationFromSearch(stn)
              }}
            >
              <Tooltip>
                <div style={{ fontSize: '11px', fontWeight: 800 }}>
                  {stn.name} ({stn.code})
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Active Station Area & Track Area Summary Pill */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        padding: '10px 14px',
        background: 'rgba(228, 164, 189, 0.12)',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--accent)',
        fontSize: '0.78rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={16} color="var(--accent)" />
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
              Selected Station Area & Landmark:
            </span>
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              {searchQuery || selectedStation?.name}
            </strong>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Train size={16} color="var(--accent)" />
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
              Selected Track Area & KM:
            </span>
            <span className="badge" style={{ background: 'var(--accent)', color: 'var(--text-primary)', fontWeight: 800, fontSize: '11px' }}>
              {selectedTrack} ({kmMarker || selectedStation?.defaultKm || 'KM ---'})
            </span>
          </div>
        </div>
      </div>

      {/* Select Different Lines on Track Area */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Select Line in Track Area:
          </span>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent)' }}>
            Active: {selectedTrack}
          </span>
        </div>
        <div className="track-chips-grid">
          {availableLines.map((line) => {
            const isCurrent = selectedTrack === line
            return (
              <button
                key={line}
                type="button"
                onClick={() => handleTrackLineSelect(line)}
                className={`track-chip ${isCurrent ? 'active' : ''}`}
                style={{
                  borderColor: isCurrent ? 'var(--accent)' : 'var(--border)',
                  background: isCurrent ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontSize: '0.72rem',
                  padding: '4px 10px'
                }}
              >
                {isCurrent && <Check size={12} strokeWidth={3} />}
                <span>{line}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
