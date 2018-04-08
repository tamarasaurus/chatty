const express = require('express')
const uuid = require('uuid')
const http = require('http')
const WebSocket = require('ws')
const app = express()

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })
app.use(express.static('client'))

let clients = []
const messages = {}

wss.on('connection', ws => {
  ws.id = uuid.v4()
  clients.push(ws)

  ws.on('message', message => {
    if (message === '\n') ws.id = uuid.v4()
    messages[ws.id] = {
      id: ws.id,
      message,
      date: new Date()
    }

    clients = clients.filter(client => client.readyState === 1)

    clients.forEach(client => {
      client.send(JSON.stringify(messages))
    })
  })
})

server.listen(8080, function listening () {
  console.log('Listening on %d', server.address().port)
})
