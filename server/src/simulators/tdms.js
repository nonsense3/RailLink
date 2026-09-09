// Simulated Traction Distribution Management System (TDMS)
export const tdmsLogs = [
  {
    id: 'TDMS-OHE-801',
    corridorId: 'CORR-NDLS-AGC',
    corridorName: 'Delhi - Agra Semi High-Speed Corridor',
    sectionId: 'SEC-04',
    location: 'KM 144/12 - 146/18 Mast Up Line',
    assetType: '25kV AC Catenary & Contact Wire',
    conditionIssue: 'Contact Wire Diameter Worn to 8.4mm (Threshold 8.0mm)',
    severity: 'High',
    overdueDays: 1,
    reportedAt: '2025-09-05T20:00:00Z',
    workRequired: 'Catenary dropper tuning, splice insertion, height-stagger adjustment',
    requiresPowerBlock: true,
    estimatedDurationMin: 180,
    status: 'Block Requested'
  },
  {
    id: 'TDMS-OHE-802',
    corridorId: 'CORR-CSTM-PUNE',
    corridorName: 'Mumbai - Pune Expressway Section',
    sectionId: 'SEC-12',
    location: 'KM 34/20 Mast 18 (Thane Sub-station Feed)',
    assetType: 'Section Insulator & Isolator Switch',
    conditionIssue: 'Flashover carbonization on porcelain insulator bracket',
    severity: 'Critical',
    overdueDays: 0,
    reportedAt: '2025-09-07T04:15:00Z',
    workRequired: 'Replace 25kV composite insulator and clean arc horns',
    requiresPowerBlock: true,
    estimatedDurationMin: 150,
    status: 'Block Requested'
  },
  {
    id: 'TDMS-OHE-803',
    corridorId: 'CORR-HWH-KGP',
    corridorName: 'Howrah - Kharagpur Trunk Route',
    sectionId: 'SEC-02',
    location: 'KM 69/08 Neutral Section (PTFE type)',
    assetType: 'Short Neutral Section Assembly',
    conditionIssue: 'Skid runner abrasion > 3mm',
    severity: 'Medium',
    overdueDays: 0,
    reportedAt: '2025-09-06T09:40:00Z',
    workRequired: 'Replace PTFE glide bars and check automatic power cutoff magnets',
    requiresPowerBlock: true,
    estimatedDurationMin: 120,
    status: 'Scheduled'
  }
]

export const getTdmsLogs = () => tdmsLogs
