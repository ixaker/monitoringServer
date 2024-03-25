require('dotenv').config();

const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const express = require('express');
const path = require('path');
const proxy = require('./proxy');

const envFilePath = path.join(__dirname, '.env');

if (!fs.existsSync(envFilePath)) {
    const defaultEnvData = `secret=my-secret-key
    domian=monitoring.qpart.com.ua
    botToken=5963182008:AAEAaqku-cJbC6Er7GHgYtVOZuR-8QO1fps
    chatId=672754822`;
  
    fs.writeFileSync(envFilePath, defaultEnvData);
}

const domian = process.env.domian;

const ssl_key = path.join("/etc/letsencrypt/live", domian, 'privkey.pem');
const ssl_cert = path.join("/etc/letsencrypt/live", domian, 'fullchain.pem');

const httpApp = express();
const app = express();

console.log(ssl_key)
console.log(ssl_cert)

const httpServer = http.createServer(httpApp);
const httpsServer = https.createServer({ key: fs.readFileSync(ssl_key), cert: fs.readFileSync(ssl_cert)}, app);


httpApp.use((req, res, next) => {
    // Перенаправлення на HTTPS
    console.log('redirecting to HTTPS');
    res.redirect('https://' + req.headers.host + req.url);
});

// Підключення middleware проксі
proxy(app);

httpServer.listen(80, () => {
    console.log('HTTP server is running on port 80');
});

httpsServer.listen(443, () => {
    console.log('Secure server is running on port 443');
});

