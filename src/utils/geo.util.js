// C:\api\studentattendanceapi\src\utils\geo.util.js

/**
 * calculateDistance(lat1, lon1, lat2, lon2)
 * Returns distance in meters (Number, rounded to 2 decimal places)
 * Throws if inputs are invalid.
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  // Basic validation
  const nums = [lat1, lon1, lat2, lon2];
  if (nums.some((n) => n === undefined || n === null || typeof n !== 'number' || Number.isNaN(n))) {
    throw new Error('Invalid coordinates provided to calculateDistance.');
  }

  const toRadians = (deg) => deg * (Math.PI / 180);

  const R = 6371000; // Earth radius in meters
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Round to 2 decimals
  return Math.round(distance * 100) / 100;
}

module.exports = { calculateDistance };