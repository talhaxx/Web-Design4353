/**
 * Route Monitoring Middleware
 * Integrates the route monitor utility into Express
 */

const { routeMonitor, logRequestStats } = require('../utils/routeMonitor');

// Configure statistics logging
const STATS_INTERVAL = 15 * 60 * 1000; // 15 minutes

// Setup periodic stats logging
let statsInterval = null;

/**
 * Initialize the route monitoring system
 * @param {Object} app - Express app instance
 * @param {Object} options - Configuration options
 */
function initRouteMonitoring(app, options = {}) {
  // Apply route monitoring middleware
  app.use(routeMonitor);
  
  // Start periodic stats logging if enabled
  if (options.logStats !== false) {
    if (statsInterval) {
      clearInterval(statsInterval);
    }
    
    const interval = options.statsInterval || STATS_INTERVAL;
    statsInterval = setInterval(logRequestStats, interval);
    
    // Log initial message
    console.log(`Route monitoring enabled. Stats will be logged every ${interval/60000} minutes.`);
  }
  
  // Handle cleanup on app shutdown
  process.on('SIGINT', () => {
    if (statsInterval) {
      clearInterval(statsInterval);
      console.log('Route monitoring stopped');
    }
    process.exit(0);
  });
}

module.exports = {
  initRouteMonitoring
}; 