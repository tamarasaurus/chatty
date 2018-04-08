const express = require('express')
const uuid = require('uuid')
const http = require('http')
const WebSocket = require('ws')
const app = express()
const _ = require('lodash')

const redis = require('redis')
const redisClient = redis.createClient(process.env.REDIS_URL)
const { promisify } = require('util')
const getAsync = promisify(redisClient.get).bind(redisClient)

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })
app.use(express.static('client'))

let clients = []

const colors = [
  '#00ff66',
  '#FF55FF',
  '#5555FF',
  '#0000AA',
  '#00AA00',
  '#00AAAA',
  '#AA00AA',
  '#AA5500'
]

let colorMap = {}

/**
 * Set message expiry to 5 mins
 */
function getExpiryDate () {
  const date = new Date()
  date.setMinutes(date.getMinutes() + 5)
  return date.getTime()
}

/**
 * Returns true if the expiry date is before the current date
 * @param {Number} date
 */
function isExpired (date) {
  return new Date().getTime() > new Date(date).getTime()
}

/**
 * Clean up messages by expiry date
 * @param {Object} messages
 */
function cleanupMessages (messages) {
  const cleanedMessages = _.pickBy(messages, message => {
    return isExpired(message.expiry) === false
  })

  redisClient.set('messages', JSON.stringify(messages))

  return cleanedMessages
}

function setColor (message) {
  const colorIsSet = colorMap.hasOwnProperty(message.user)

  if (colorIsSet === false) {
    colorMap[message.user] = _.sample(colors)
  }

  return colorMap[message.user]
}

/**
 * Broadcast a message to all clients
 * @param {Object} data
 */
function broadCast (data) {
  clients.forEach(client => {
    client.send(JSON.stringify(data))
  })
}

/**
 * Grab stored messages from redis
 */
function getMessages () {
  return new Promise((resolve, reject) => {
    return getAsync('messages').then((messages) => {
      resolve(cleanupMessages(JSON.parse(messages) || {}))
    })
  })
}

/**
 * When a new client connects set up the events send and receive messages
 */
wss.on('connection', ws => {
  ws.id = uuid.v4()

  clients = clients.filter(client => client.readyState === 1)

  /** If there are too many connected clients don't allow more to connect */
  if (clients.length === 20) {
    return ws.send(JSON.stringify([{
      message: 'Too many users, sorry mate :(',
      date: new Date().getTime()
    }]))
  }

  clients.push(ws)

  ws.on('message', message => {
    /**
     * On each message clean up the expired ones and broadcast them
     */
    getMessages().then(messages => {
      message = JSON.parse(message || '{}')

      if (message.text === '\n') ws.id = uuid.v4()
      messages[ws.id] = {
        id: ws.id,
        message: message.text,
        date: new Date().getTime(),
        expiry: getExpiryDate(),
        user: message.user,
        color: setColor(message)
      }

      redisClient.set('messages', JSON.stringify(messages))
      broadCast(messages)
    })
  })
})

/**
 * Start the server
 */
server.listen(process.env.PORT, function listening () {
  console.log('Listening on %d', process.env.PORT)
})
