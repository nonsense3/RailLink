// Simulated Control Office Application (COA)
export const coaTimetable = [
  {
    trainNo: '12002',
    name: 'Bhopal Shatabdi Express',
    type: 'Superfast / Premium',
    corridorId: 'CORR-NDLS-AGC',
    departure: '06:00',
    arrival: '07:50',
    sectionPassTime: '06:45 - 07:10',
    priorityRank: 1, // Cannot be regulated
    daysOfOperation: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  {
    trainNo: '22470',
    name: 'Vande Bharat Express',
    type: 'Vande Bharat Premium',
    corridorId: 'CORR-NDLS-AGC',
    departure: '08:20',
    arrival: '10:05',
    sectionPassTime: '08:50 - 09:15',
    priorityRank: 1,
    daysOfOperation: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sun']
  },
  {
    trainNo: '12952',
    name: 'Mumbai Rajdhani Express',
    type: 'Rajdhani Premium',
    corridorId: 'CORR-CSTM-PUNE',
    departure: '16:55',
    arrival: '20:10',
    sectionPassTime: '17:40 - 18:05',
    priorityRank: 1,
    daysOfOperation: ['Daily']
  },
  {
    trainNo: 'DFC-BOXN-902',
    name: 'DFC Container Freight Corridor (Double Stack)',
    type: 'Freight Heavy Haul',
    corridorId: 'CORR-NDLS-AGC',
    departure: '02:30',
    arrival: '05:40',
    sectionPassTime: '03:15 - 04:00',
    priorityRank: 4, // Regulate-able or divertable
    daysOfOperation: ['Daily']
  },
  {
    trainNo: 'FL-9042',
    name: 'Petroleum Tanker BTPN Rake',
    type: 'Freight Liquid Dangerous Goods',
    corridorId: 'CORR-CSTM-PUNE',
    departure: '01:00',
    arrival: '04:30',
    sectionPassTime: '01:45 - 02:40',
    priorityRank: 3,
    daysOfOperation: ['Daily']
  }
]

// Corridor available block curfews (COA official zero-passenger corridors)
export const corridorSlots = [
  {
    corridorId: 'CORR-NDLS-AGC',
    name: 'Delhi - Agra Semi High-Speed Corridor',
    nightWindowStart: '01:30',
    nightWindowEnd: '05:30',
    maxBlockHours: 4.0,
    typicalSpeedLimit: 160,
    dailyTrainDensity: 112
  },
  {
    corridorId: 'CORR-CSTM-PUNE',
    name: 'Mumbai - Pune Expressway Section',
    nightWindowStart: '01:00',
    nightWindowEnd: '05:00',
    maxBlockHours: 4.0,
    typicalSpeedLimit: 110,
    dailyTrainDensity: 145
  },
  {
    corridorId: 'CORR-HWH-KGP',
    name: 'Howrah - Kharagpur Trunk Route',
    nightWindowStart: '00:30',
    nightWindowEnd: '04:30',
    maxBlockHours: 4.0,
    typicalSpeedLimit: 130,
    dailyTrainDensity: 98
  },
  {
    corridorId: 'CORR-MAS-AJJ',
    name: 'Chennai Central - Arakkonam Fast Line',
    nightWindowStart: '01:00',
    nightWindowEnd: '05:30',
    maxBlockHours: 4.5,
    typicalSpeedLimit: 130,
    dailyTrainDensity: 104
  }
]

export const getCoaTimetable = () => coaTimetable
export const getCorridorSlots = () => corridorSlots
