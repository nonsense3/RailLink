import axios from 'axios'
import { config } from '../config/env.js'

// Fallback live status generator for Indian Railways trains
function generateDynamicTrainStatus(trainNo) {
  const trainNames = {
    '12002': { name: 'Bhopal Shatabdi Express', route: 'NDLS -> BPL', origin: 'New Delhi (NDLS)', dest: 'Rani Kamlapati (RKMP)', currentStation: 'Mathura Jn (MTJ)', delayMin: 4, speedKmH: 130 },
    '22470': { name: 'Vande Bharat Express', route: 'NZM -> RKMP', origin: 'Hazrat Nizamuddin (NZM)', dest: 'Rani Kamlapati (RKMP)', currentStation: 'Agra Cantt (AGC)', delayMin: 0, speedKmH: 155 },
    '12952': { name: 'Mumbai Rajdhani Express', route: 'NDLS -> MMCT', origin: 'New Delhi (NDLS)', dest: 'Mumbai Central (MMCT)', currentStation: 'Kota Jn (KOTA)', delayMin: 8, speedKmH: 125 },
    '12301': { name: 'Howrah Rajdhani Express', route: 'HWH -> NDLS', origin: 'Howrah (HWH)', dest: 'New Delhi (NDLS)', currentStation: 'Prayagraj Jn (PRYJ)', delayMin: 12, speedKmH: 120 },
    '12622': { name: 'Tamil Nadu Express', route: 'NDLS -> MAS', origin: 'New Delhi (NDLS)', dest: 'MGR Chennai Central (MAS)', currentStation: 'Nagpur (NGP)', delayMin: 18, speedKmH: 110 }
  }

  const defaultInfo = trainNames[trainNo] || {
    name: `Train #${trainNo}`,
    route: 'Indian Railways Corridor',
    origin: 'Terminal A',
    dest: 'Terminal B',
    currentStation: 'En Route Sector',
    delayMin: Math.floor(Math.random() * 15),
    speedKmH: 110
  }

  const now = new Date()
  return {
    trainNumber: trainNo,
    trainName: defaultInfo.name,
    route: defaultInfo.route,
    origin: defaultInfo.origin,
    destination: defaultInfo.dest,
    currentStation: defaultInfo.currentStation,
    speedKmH: defaultInfo.speedKmH,
    delayMinutes: defaultInfo.delayMin,
    status: defaultInfo.delayMin === 0 ? 'On Time' : `Delayed by ${defaultInfo.delayMin} mins`,
    lastUpdated: now.toISOString(),
    isLiveFeed: false,
    source: 'RailLink Intelligent Simulator (Configure RAPIDAPI_KEY for direct live satellite feed)'
  }
}

/**
 * Fetch live train status via RapidAPI (or graceful dynamic fallback)
 */
export async function getLiveTrainStatus(trainNo) {
  const apiKey = config.rapidApi?.key

  if (!apiKey) {
    return generateDynamicTrainStatus(trainNo)
  }

  try {
    const host = config.rapidApi.host || 'indian-railway-irctc.p.rapidapi.com'
    const response = await axios.get(`https://${host}/api/v1/liveTrainStatus`, {
      params: { trainNo, startDay: 1 },
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': host
      },
      timeout: 8000
    })

    if (response.data && (response.data.data || response.data.status)) {
      return {
        trainNumber: trainNo,
        isLiveFeed: true,
        source: 'RapidAPI Live IRCTC Feed',
        data: response.data.data || response.data,
        lastUpdated: new Date().toISOString()
      }
    }

    return generateDynamicTrainStatus(trainNo)
  } catch (err) {
    console.warn(`[Railway API Warning]: Live fetch failed for ${trainNo} (${err.message}). Using intelligent fallback.`)
    const fallback = generateDynamicTrainStatus(trainNo)
    fallback.apiNote = `Direct RapidAPI fetch error: ${err.message}`
    return fallback
  }
}

/**
 * Fetch live weather and rail surface condition for corridor GPS points (100% free via Open-Meteo, no key needed)
 */
export async function getCorridorLiveWeather(latitude = 28.6139, longitude = 77.209) {
  try {
    const res = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude,
        longitude,
        current: ['temperature_2m', 'relative_humidity_2m', 'precipitation', 'wind_speed_10m', 'wind_direction_10m'],
        timezone: 'auto'
      },
      timeout: 5000
    })

    const current = res.data.current || {}
    const ambientTemp = current.temperature_2m || 30
    const windSpeed = current.wind_speed_10m || 10
    const precipitation = current.precipitation || 0

    // Estimated rail metal temperature (typically higher than ambient in daytime sun)
    const estimatedRailTemp = Math.round((ambientTemp * 1.25) * 10) / 10

    // Railway safety threshold assessments
    const oheRisk = windSpeed > 45 ? 'High (Catenary Wire Oscillation Risk)' : windSpeed > 30 ? 'Moderate' : 'Normal'
    const railFractureRisk = ambientTemp < 5 ? 'High (Cold Contraction Stress)' : estimatedRailTemp > 55 ? 'High (Rail Buckling Hazard)' : 'Normal'

    return {
      success: true,
      latitude,
      longitude,
      ambientTempC: ambientTemp,
      estimatedRailTempC: estimatedRailTemp,
      relativeHumidity: current.relative_humidity_2m || 50,
      windSpeedKmH: windSpeed,
      precipitationMm: precipitation,
      safetyAssessment: {
        oheSwayRisk: oheRisk,
        railBucklingRisk: railFractureRisk,
        tractionCondition: precipitation > 5 ? 'Wet Track (Reduced Adhesion)' : 'Dry Normal Track'
      },
      source: 'Open-Meteo Live Satellite Grid (Free Realtime API)'
    }
  } catch (err) {
    return {
      success: false,
      error: err.message,
      ambientTempC: 32,
      estimatedRailTempC: 40,
      windSpeedKmH: 14,
      safetyAssessment: {
        oheSwayRisk: 'Normal',
        railBucklingRisk: 'Normal',
        tractionCondition: 'Dry Normal Track'
      }
    }
  }
}
