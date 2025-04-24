/**
 * Route Monitor Utility
 * Logs all route accesses and redirects to assist in troubleshooting routing issues
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Configure logging
const LOG_DIR = path.join(__dirname, 'logs');
const LOG_FILE = path.join(LOG_DIR, 'route-access.log');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Track request statistics
const requestStats = {
  total: 0,
  redirects: 0,
  errors: 0,
  startTime: Date.now(),
  routes: {}
};

/**
 * Logs request information to file and console
 * 
 * @param {Object} req - Express request object
 * @param {number} status - HTTP status code
 * @param {string} type - Log type (info, redirect, error)
 * @param {string} detail - Additional details
 */
function logRequest(req, status, type = 'info', detail = '') {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  // Update statistics
  requestStats.total++;
  
  if (type === 'redirect') {
    requestStats.redirects++;
  } else if (type === 'error' || status >= 400) {
    requestStats.errors++;
  }
  
  // Track route usage
  if (!requestStats.routes[url]) {
    requestStats.routes[url] = { count: 0, errors: 0, redirects: 0 };
  }
  requestStats.routes[url].count++;
  
  if (type === 'redirect') {
    requestStats.routes[url].redirects++;
  } else if (type === 'error' || status >= 400) {
    requestStats.routes[url].errors++;
  }
  
  // Format log message
  const logMessage = `[${timestamp}] ${method} ${url} ${status} ${ip} "${userAgent}" ${detail}`;
  
  // Write to log file
  fs.appendFile(LOG_FILE, logMessage + '\n', (err) => {
    if (err) console.error('Error writing to route log:', err);
  });
  
  // Console output with color
  let coloredMessage;
  if (type === 'info') {
    coloredMessage = chalk.blue(`[${timestamp}] `) + 
                     chalk.green(`${method} `) + 
                     url + ' ' + 
                     chalk.yellow(`${status}`);
  } else if (type === 'redirect') {
    coloredMessage = chalk.blue(`[${timestamp}] `) + 
                     chalk.green(`${method} `) + 
                     url + ' ' + 
                     chalk.yellow(`${status}`) + ' ' + 
                     chalk.magenta(`→ ${detail}`);
  } else if (type === 'error') {
    coloredMessage = chalk.blue(`[${timestamp}] `) + 
                     chalk.green(`${method} `) + 
                     url + ' ' + 
                     chalk.red(`${status} ${detail}`);
  }
  
  console.log(coloredMessage);
}

/**
 * Express middleware to monitor routes
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function routeMonitor(req, res, next) {
  // Store original methods to be overridden
  const originalSend = res.send;
  const originalJson = res.json;
  const originalRedirect = res.redirect;
  
  // Override res.send to log response
  res.send = function(body) {
    logRequest(req, res.statusCode);
    return originalSend.apply(res, arguments);
  };
  
  // Override res.json to log response
  res.json = function(body) {
    logRequest(req, res.statusCode);
    return originalJson.apply(res, arguments);
  };
  
  // Override res.redirect to log redirects
  res.redirect = function(statusOrUrl, url) {
    const status = typeof statusOrUrl === 'number' ? statusOrUrl : 302;
    const redirectUrl = typeof statusOrUrl === 'string' ? statusOrUrl : url;
    
    logRequest(req, status, 'redirect', redirectUrl);
    return originalRedirect.apply(res, arguments);
  };
  
  // Log errors
  res.on('finish', () => {
    if (res.statusCode >= 400) {
      logRequest(req, res.statusCode, 'error');
    }
  });
  
  next();
}

/**
 * Logs request statistics for the monitoring period
 */
function logRequestStats() {
  const now = Date.now();
  const duration = (now - requestStats.startTime) / 60000; // minutes
  const formattedDuration = duration.toFixed(2);
  
  console.log(chalk.cyan.bold('\n===== ROUTE MONITOR STATISTICS ====='));
  console.log(chalk.cyan(`Period: Last ${formattedDuration} minutes`));
  console.log(chalk.cyan(`Total Requests: ${requestStats.total}`));
  console.log(chalk.cyan(`Redirects: ${requestStats.redirects}`));
  console.log(chalk.cyan(`Errors: ${requestStats.errors}`));
  
  // Log most accessed routes
  console.log(chalk.cyan.bold('\nTop Routes:'));
  const sortedRoutes = Object.entries(requestStats.routes)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);
  
  sortedRoutes.forEach(([route, stats]) => {
    console.log(chalk.cyan(`${route}: ${stats.count} requests, ${stats.redirects} redirects, ${stats.errors} errors`));
  });
  
  console.log(chalk.cyan.bold('====================================\n'));
  
  // Reset stats for next period
  requestStats.total = 0;
  requestStats.redirects = 0;
  requestStats.errors = 0;
  requestStats.startTime = now;
  requestStats.routes = {};
}

module.exports = {
  routeMonitor,
  logRequest,
  logRequestStats
}; 