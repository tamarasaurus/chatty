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

  function setUsername (event) {
    const value = $('.intro input').val()
    $('.intro').hide()
    $('.chat').show()
    $('.chat input').focus()

    username = value
    socket.send(`${username} joined`)
  }

  $('.intro input').on('keyup', event => {
    const value = $('.intro input').val()

    if (
      event.keyCode === 13 &&
        value.length > 0
    ) {
      setUsername(event)
    }
  })

  $('.intro button').on('click', setUsername)

  $('.chat input').on('keyup', event => {
    const el = $(event.currentTarget)

    if (event.keyCode === 13) {
      socket.send('\n')
      return el.val('')
    }

    socket.send(`${username}: ${el.val()}`)
  })

  $('.intro input').focus()
})
