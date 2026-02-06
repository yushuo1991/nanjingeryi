const NodeCache = require('node-cache');

// Initialize cache with 5-minute TTL (300 seconds)
const cache = new NodeCache({
  stdTTL: 300, // 5 minutes
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false, // Don't clone objects for better performance
});

/**
 * Clear all patient-related cache entries
 * Call this whenever patient data is modified (POST/PUT/DELETE)
 */
function clearPatientsCache() {
  const keys = cache.keys();
  const patientKeys = keys.filter(key => key.startsWith('patients:'));

  if (patientKeys.length > 0) {
    cache.del(patientKeys);
    console.log(`[Cache] Cleared ${patientKeys.length} patient cache entries`);
  }
}

/**
 * Get a value from cache
 */
function get(key) {
  return cache.get(key);
}

/**
 * Set a value in cache
 */
function set(key, value, ttl) {
  return cache.set(key, value, ttl);
}

/**
 * Delete a specific key from cache
 */
function del(key) {
  return cache.del(key);
}

/**
 * Get cache statistics
 */
function getStats() {
  return cache.getStats();
}

module.exports = {
  cache,
  clearPatientsCache,
  get,
  set,
  del,
  getStats,
};
