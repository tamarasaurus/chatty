/* global ReconnectingWebSocket, _, $ */

$(function () {
  let username = null

  const socket = new ReconnectingWebSocket('ws://192.168.1.99:8080')

  socket.onopen = function (e) {
    console.log('WebSocketClient connected:', e)
  }

  socket.onmessage = function (event, flags, number) {
    const messageGroups = JSON.parse(event.data)
    const sortedMessages = _.sortBy(messageGroups, 'date')
    const messageContents = _.map(sortedMessages, 'message')
    const lines = _.without(messageContents, '\n')
    const list = $('ul')
    list.empty()

    _.each(lines, line => list.append(`<li>${line}</li>`))
  }

  $('.chat input').on('keyup', event => {
    const el = $(event.currentTarget)

    if (event.keyCode === 13) {
      socket.send('\n')
      return el.val('')
    }

    socket.send(`${username}: ${el.val()}`)
  })

  $('.intro button').on('click', event => {
    const value = $('.intro input').val()
    $('.intro').hide()
    $('.chat').show()

    username = value
    socket.send(`${username} joined`)
  })
})
