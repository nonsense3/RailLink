import React, { useState, useEffect, useRef } from 'react'
import { MapPin, Navigation, Compass, Check, Search, Loader2 } from 'lucide-react'
import { searchRailwayLocations, ALL_TRACK_LINES } from '../../lib/railwayLocations'

export default function LocationAutocomplete({
  value = '',
  onChange,
  onSelectStation,
  placeholder = 'Type station, junction, yard, or location (e.g. Mathura, Palwal, Delhi)...',
  selectedLine = '',
  onSelectLine,
  showLineSelector = true,
  required = false,
  className = ''
}) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedStation, setSelectedStation] = useState(null)
  const containerRef = useRef(null)

  // Keep internal query in sync if parent changes value externally
  useEffect(() => {
    setQuery(value || '')
  }, [value])

  // Handle outside click to close popover
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  // Debounced search
  useEffect(() => {
    if (!isOpen) return

    setIsLoading(true)
    const timer = setTimeout(async () => {
      try {
        const results = await searchRailwayLocations(query)
        setSuggestions(results)
      } catch (err) {
        console.error('Location search failed:', err)
      } finally {
        setIsLoading(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [query, isOpen])

  const handleInputChange = (e) => {
    const val = e.target.value
    setQuery(val)
    if (onChange) onChange(val)
    setIsOpen(true)
  }

  const handleSelect = (station) => {
    setQuery(station.name)
    setSelectedStation(station)
    setIsOpen(false)

    if (onChange) onChange(station.name)
    if (onSelectStation) {
      onSelectStation(station)
    }

    // Auto-select first line if no line currently selected
    if (onSelectLine && (!selectedLine || selectedLine.trim() === '')) {
      const defaultLine = station.supportedLines?.[0] || 'Up Main Line'
      onSelectLine(defaultLine)
    }
  }

  const availableLines = selectedStation?.supportedLines || ALL_TRACK_LINES.map(l => l.name)

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }} className={className}>
      {/* Search Input Box */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          className="input form-input"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          required={required}
          style={{
            paddingLeft: '38px',
            paddingRight: isLoading ? '38px' : '14px'
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
        {isLoading && (
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

      {/* Autocomplete Dropdown Popover */}
      {isOpen && (
        <div className="location-autocomplete-popover">
          <div style={{ padding: '6px 10px', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>INDIAN RAILWAYS GPS LOCATIONS</span>
            {suggestions.length > 0 && <span>{suggestions.length} matched</span>}
          </div>

          {suggestions.length === 0 && !isLoading && (
            <div style={{ padding: '16px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              No exact stations found. Press Enter to use "{query}" or check spelling.
            </div>
          )}

          {suggestions.map((station, idx) => (
            <div
              key={`${station.code || station.name}-${idx}`}
              className="location-item-row"
              onClick={() => handleSelect(station)}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-card)', background: 'rgba(228, 164, 189, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Navigation size={16} color="var(--accent)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    {station.name}
                  </span>
                  {station.code && (
                    <span style={{ fontSize: '0.68rem', fontWeight: 900, background: 'var(--accent)', color: 'var(--text-primary)', padding: '1px 6px', borderRadius: '4px' }}>
                      {station.code}
                    </span>
                  )}
                  {station.isGeocoded && (
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', padding: '1px 5px', borderRadius: '4px' }}>
                      OSM GPS
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {station.division} • {station.corridor}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)' }}>
                  {station.defaultKm || 'KM ---'}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {station.lat.toFixed(2)}°N, {station.lng.toFixed(2)}°E
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Track Line Selector Pills (if enabled and station selected) */}
      {showLineSelector && onSelectLine && (
        <div style={{ marginTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Selected Track Line:
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent)' }}>
              {selectedLine || 'Select Line Below'}
            </span>
          </div>
          <div className="track-chips-grid">
            {availableLines.map((line) => {
              const isCurrent = selectedLine === line
              return (
                <button
                  key={line}
                  type="button"
                  onClick={() => onSelectLine(line)}
                  className={`track-chip ${isCurrent ? 'active' : ''}`}
                  style={{
                    borderColor: isCurrent ? 'var(--accent)' : 'var(--border)',
                    background: isCurrent ? 'var(--accent)' : 'var(--bg-secondary)',
                    color: isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)'
                  }}
                >
                  {isCurrent && <Check size={12} strokeWidth={3} />}
                  <span>{line}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
