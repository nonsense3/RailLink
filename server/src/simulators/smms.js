// Simulated Signal Maintenance & Management System (SMMS)
export const smmsFailures = [
  {
    id: 'SMMS-FL-501',
    corridorId: 'CORR-NDLS-AGC',
    corridorName: 'Delhi - Agra Semi High-Speed Corridor',
    sectionId: 'SEC-04',
    kmMarker: 145.0,
    assetType: 'Axle Counter Multi-Section (MSDAC)',
    failureCategory: 'High Frequency Sensor Interference',
    severity: 'Medium',
    overdueDays: 0,
    reportedAt: '2025-09-07T16:00:00Z',
    workRequired: 'Axle counter sensor realignment & oscillator tuning',
    estimatedDurationMin: 90,
    requiresPowerDisconnection: true,
    status: 'Ready for Shadow Block'
  },
  {
    id: 'SMMS-FL-502',
    corridorId: 'CORR-CSTM-PUNE',
    corridorName: 'Mumbai - Pune Expressway Section',
    sectionId: 'SEC-12',
    kmMarker: 35.8,
    assetType: 'Electric Point Machine (IRS 143mm)',
    failureCategory: 'Obstruction Test Failure (>5mm gap)',
    severity: 'Critical',
    overdueDays: 2,
    reportedAt: '2025-09-05T18:45:00Z',
    workRequired: 'Lock bar adjustment, detector contact cleaning, gear grease flush',
    estimatedDurationMin: 120,
    requiresPowerDisconnection: true,
    status: 'Block Requested'
  },
  {
    id: 'SMMS-FL-503',
    corridorId: 'CORR-HWH-KGP',
    corridorName: 'Howrah - Kharagpur Trunk Route',
    sectionId: 'SEC-02',
    kmMarker: 70.2,
    assetType: 'Solid State Interlocking (Electronic Interlocking)',
    failureCategory: 'Standby CPU Redundancy Communication Timeout',
    severity: 'High',
    overdueDays: 0,
    reportedAt: '2025-09-06T12:10:00Z',
    workRequired: 'Replace VME bus comms card & execute cold-restart loop',
    estimatedDurationMin: 180,
    requiresPowerDisconnection: false,
    status: 'Pending Non-Traffic Disconnection'
  },
  {
    id: 'SMMS-FL-504',
    corridorId: 'CORR-MAS-AJJ',
    corridorName: 'Chennai Central - Arakkonam Fast Line',
    sectionId: 'SEC-09',
    kmMarker: 46.5,
    assetType: 'LED Signal Aspect Unit (Green/Yellow)',
    failureCategory: 'Current Regulator Low Lux Output',
    severity: 'Low',
    overdueDays: 0,
    reportedAt: '2025-09-07T06:00:00Z',
    workRequired: 'Replace LED cluster module and current regulator transformer',
    estimatedDurationMin: 45,
    requiresPowerDisconnection: false,
    status: 'Scheduled'
  }
]

export const getSmmsFailures = () => smmsFailures
