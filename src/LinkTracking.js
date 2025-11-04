// Simple Link Tracker + Redirector
// Run: node server.js
// Test: http://<your-server-ip>:3000/r/snReading

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 🗺️ Map of short IDs to real URLs
const linkMap = {
    snReading: "https://www.guildofstudents.com/login/?redirect=%2fents%2fevent%2f11466%2f%3fcode%3d3OB15K"
};

// 📄 Log file path
const logDir = path.join(__dirname, 'logs');
const logFile = path.join(logDir, 'link-tracker.log');

// Ensure the log directory exists
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// 🪵 Function to log events locally
function logEvent(event) {
    const entry = `[${new Date().toISOString()}] ${event}\n`;
    try {
        fs.appendFileSync(logFile, entry);
    } catch (err) {
        console.error('Failed to write log:', err);
    }
}

// 🎯 Redirect route
app.get('/r/:id', (req, res) => {
    const { id } = req.params;
    const target = linkMap[id];

    if (!target) {
        logEvent(`404 Not Found: ${req.ip} tried to access /r/${id}`);
        return res.status(404).send('Link not found');
    }

    // Gather request info
    const logData = {
        id,
        timestamp: new Date().toISOString(),
        ip: req.ip,
        userAgent: req.get('user-agent'),
        referrer: req.get('referer') || null
    };

    // Save to local file
    logEvent(`CLICK ${JSON.stringify(logData)}`);

    console.log(`Redirected ${req.ip} -> ${target}`);

    // Redirect user
    res.redirect(302, target);
});

// 🩺 Health check
app.get('/', (req, res) => {
    res.send('Link tracker is running');
});

// 🚀 Start server
app.listen(PORT, () => {
    console.log(`Redirect tracker running on port ${PORT}`);
    console.log(`Try: http://localhost:${PORT}/r/snReading`);
});