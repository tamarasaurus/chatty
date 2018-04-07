const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');

const app = express();
app.use(express.static('client'))

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = [];
const events = [];

wss.on('connection', ws => {
    clients.push(ws);

    clients.forEach(client => client.send('Let\'s chat!'));

    ws.on('message', message => {
        clients.forEach(client => client.send(message));
    });
});

server.listen(8080, function listening() {
  console.log('Listening on %d', server.address().port);
});