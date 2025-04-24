require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const { routeMonitor } = require('./utils/routeMonitor');

const app = express();
const PORT = process.env.PORT || 5001;

// Enhanced security with helmet
app.use(helmet());

// Route monitoring middleware
app.use(routeMonitor);

// Logging middleware
app.use(morgan('dev'));

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    allowedHeaders: "Content-Type, Authorization"
}));

app.use(bodyParser.json());

// Simple route to check if the server is running
app.get('/', (req, res) => {
    res.send('Volunteer Management API is running');
});

// Temporary redirect middleware for legacy /auth/* paths
app.use('/auth/*', (req, res, next) => {
    console.log('Redirecting from /auth/* to /api/auth/*');
    req.url = '/api' + req.url;
    next('route');
});

// Import API routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const matchRoutes = require('./routes/matchRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const stateRoutes = require('./routes/stateRoutes');

// Register API Routes
console.log('Registering API routes...');
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);

// Log match routes
console.log('Match Routes available:');
if (matchRoutes.stack) {
    matchRoutes.stack.forEach((layer) => {
        if (layer.route) {
            const path = layer.route.path;
            const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase()).join(',');
            console.log(`${methods} /api/match${path}`);
        }
    });
}
app.use('/api/match', matchRoutes); // ✅ mount match routes correctly

app.use('/api/notifications', notificationRoutes);
app.use('/api/states', stateRoutes);
console.log('API routes registered successfully');

// 🔁 404 route should remain at the very end
app.use((req, res, next) => {
    console.log(`404 Not Found: ${req.method} ${req.originalUrl}`);

    // Match-specific debug
    if (req.originalUrl.includes('/match/assign')) {
        console.log('Requested match/assign route but not found!');
        console.log('Available match routes:', Object.keys(matchRoutes.stack || {}).map(key => matchRoutes.stack[key]?.route?.path).filter(Boolean));
    }

    res.status(404).json({
        message: 'Route not found',
        requested: {
            method: req.method,
            path: req.originalUrl
        },
        suggestion: "If trying to access authentication routes, make sure to use the /api prefix."
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at: http://localhost:${PORT}/api`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
