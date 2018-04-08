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
    const lines = _.filter(sortedMessages, message => message.message !== '\n')
    const list = $('ul')
    list.empty()

    const currentlyEditingIndex = _.findLastIndex(lines, message => message.user === username)

    _.each(lines, (line, index) => {
      let className = ''
      let background = 'none'
      let color = line.color

      if (index === currentlyEditingIndex) {
        className = 'current'
        background = line.color
        color = 'white'
      }

      list.append(`<li style="color: ${color}; background: ${background};" class="${className}">${line.message}</li>`)
    })

    scrollToBottom()
  }

  function setUsername (event) {
    const value = $('.intro input').val()

    if (value.trim().length === 0) return

    $('.intro').hide()
    $('.chat').show()
    $('.chat input').focus()

    username = value
    socket.send(JSON.stringify({text: `${username} joined`, user: username}))
  }

  function scrollToBottom () {
    const scrollHeight = $('ul').get(0).scrollHeight
    $('ul').scrollTop(scrollHeight)
  }

  $('.intro input').on('keyup', event => {
    scrollToBottom()

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
    scrollToBottom()

    const el = $(event.currentTarget)

    if (event.keyCode === 13) {
      socket.send(JSON.stringify({text: '\n', user: username}))
      el.val('').trigger('keyup')
      return $('input.current').removeClass('current')
    }

    return socket.send(JSON.stringify({text: `${username}: ${el.val()}`, user: username}))
  })

  $('.intro input').focus()
})
