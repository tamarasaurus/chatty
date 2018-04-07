$(function() {
    const socket = new WebSocket('ws://192.168.1.99:8080');

    socket.addEventListener('open', function (event) {
        socket.send('Hello Server!');
    });

    socket.addEventListener('message', function (event) {
        console.log('Message from server', event.data);
        $('ul').append(`<li>${event.data}</li>`)
    });

    // Set a timeout, gather events and then re-render the whole list
    $('input').on('keypress', (event) => {
        socket.send($(event.currentTarget).val());
    })
});


