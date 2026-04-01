const axios = require('axios');

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

async function getOSRMRoute(originLat, originLng, destLat, destLng) {
  try {
    const url = `http://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`;
    const response = await axios.get(url, { timeout: 8000 });
    const route = response.data.routes[0];
    return {
      distance_km: Math.round(route.distance / 1000 * 10) / 10,
      duration_minutes: Math.round(route.duration / 60),
      geometry: route.geometry,
      source: 'osrm'
    };
  } catch (err) {
    const distance = haversine(originLat, originLng, destLat, destLng);
    const duration = Math.round(distance / 45 * 60);
    return {
      distance_km: Math.round(distance * 10) / 10,
      duration_minutes: duration,
      geometry: null,
      source: 'fallback_haversine'
    };
  }
}

function calculateDepartureWindow(routeResult, furnaceTime, bufferMinutes = 45) {
  const furnace = new Date(furnaceTime);
  const travelMs = routeResult.duration_minutes * 60 * 1000;
  const bufferMs = bufferMinutes * 60 * 1000;
  const departBy = new Date(furnace.getTime() - travelMs - bufferMs);
  const eta = new Date(furnace.getTime() - bufferMs);
  return { depart_by: departBy, eta: eta };
}

function calculateCurrentETA(currentLat, currentLng, destLat, destLng, speedKmh) {
  const remainingKm = haversine(currentLat, currentLng, destLat, destLng);
  const speed = speedKmh > 5 ? speedKmh : 45;
  const hoursRemaining = remainingKm / speed;
  const etaMs = Date.now() + hoursRemaining * 3600 * 1000;
  return { eta: new Date(etaMs), remaining_km: Math.round(remainingKm * 10) / 10 };
}

function scoreDriversForTrip(requiredCapacityKg, pickupLat, pickupLng, availableDrivers) {
  return availableDrivers
    .filter(d => d.truck_capacity >= requiredCapacityKg)
    .map(d => {
      const distanceScore = Math.max(0, 40 - haversine(d.current_lat || pickupLat, d.current_lng || pickupLng, pickupLat, pickupLng));
      const reliabilityScore = (d.reliability_score / 100) * 40;
      const capacityScore = d.truck_capacity >= requiredCapacityKg ? 20 : 0;
      return { ...d, total_score: Math.round(distanceScore + reliabilityScore + capacityScore) };
    })
    .sort((a, b) => b.total_score - a.total_score);
}

function checkDeviation(currentLat, currentLng, routeGeometry, thresholdKm = 5) {
  if (!routeGeometry) return { deviated: false };
  const coords = routeGeometry.coordinates;
  let minDistance = Infinity;
  for (const [lng, lat] of coords) {
    const d = haversine(currentLat, currentLng, lat, lng);
    if (d < minDistance) minDistance = d;
  }
  return { deviated: minDistance > thresholdKm, deviation_km: Math.round(minDistance * 10) / 10 };
}

module.exports = { haversine, getOSRMRoute, calculateDepartureWindow, calculateCurrentETA, scoreDriversForTrip, checkDeviation };
