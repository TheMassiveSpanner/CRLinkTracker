// Simple Link Tracker + Redirector
// Run: node server.js
// Test: http://<your-server-ip>:3000/r/abc

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 🗺️ Map of short IDs to real URLs
// Add or edit your tracked links here
const linkMap = {
    snReading: "https://www.guildofstudents.com/login/?redirect=%2fents%2fevent%2f11466%2f%3fcode%3d3OB15K"
};

// 🧾 Function to log each click
const AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: 'eu-west-2' }); // use your region
const BUCKET = 'link-tracker-logs-yourname';

async function logClick(data) {
    const params = {
        Bucket: BUCKET,
        Key: `clicks/${Date.now()}-${data.id}.json`,
        Body: JSON.stringify(data),
        ContentType: 'application/json'
    };

    try {
        await s3.putObject(params).promise();
        console.log(`Logged click to S3: ${params.Key}`);
    } catch (err) {
        console.error('S3 log failed', err);
    }
}

// 🎯 Redirect route
app.get('/r/:id', (req, res) => {
    const { id } = req.params;
    const target = linkMap[id];

    if (!target) {
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

    // Save to log
    logClick(logData);

    console.log(`Redirected ${req.ip} -> ${target}`);

    // Redirect user
    res.redirect(302, target);
});

// 🩺 Health check (optional)
app.get('/', (req, res) => {
    res.send('Link tracker is running');
});

// 🚀 Start the server
app.listen(PORT, () => {
    console.log(`Redirect tracker running on port ${PORT}`);
});
