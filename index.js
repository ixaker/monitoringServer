require('dotenv').config();

const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const express = require('express');
const path = require('path');
// const proxy = require('./proxy');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const envFilePath = path.join(__dirname, '.env');

const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

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

nextApp.prepare().then(() => {
    httpApp.get('*', (req, res) => {
        return handle(req, res);
    });

    app.get('*', (req, res) => {
        return handle(req, res);
    });

    httpApp.use((req, res, next) => {
        console.log('redirecting to HTTPS');
        res.redirect('https://' + req.headers.host + req.url);
    });
    
    httpServer.listen(80, () => {
        console.log('HTTP server is running on port 80');
    });

    httpsServer.listen(443, () => {
        console.log('Secure server is running on port 443');
    });
});



// Підключення middleware проксі
// proxy(app);

// httpServer.listen(80, () => {
//     console.log('HTTP server is running on port 80');
// });

// httpsServer.listen(443, () => {
//     console.log('Secure server is running on port 443');
// });

