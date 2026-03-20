// C:\api\studentattendanceapi\src\utils\geo.util.js

/**
 * calculateDistance(lat1, lon1, lat2, lon2)
 * Returns distance in meters (Number, rounded to 2 decimal places)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  // 1. Basic type and existence validation
  const nums = [lat1, lon1, lat2, lon2];
  if (nums.some((n) => n === undefined || n === null || typeof n !== 'number' || Number.isNaN(n))) {
    throw new Error('Invalid coordinates: All inputs must be valid numbers.');
  }

  // 2. "Null Island" Check
  // Prevents successful (but fake) syncs if both coordinates are exactly 0
  if ((lat1 === 0 && lon1 === 0) || (lat2 === 0 && lon2 === 0)) {
    throw new Error('GPS Signal Lost: Location coordinates cannot be zero.');
  }

  const toRadians = (deg) => deg * (Math.PI / 180);

  const R = 6371000; // Earth radius in meters
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  // Haversine Formula
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Round to 2 decimals for the Registry logs
  return Math.round(distance * 100) / 100;
}

module.exports = { calculateDistance };