// const http = require('http')
// const express = require('express')
// const app = express()

// const Server = http.createServer(app)
// const port = 3000


// // and add lines:
// const io = require('socket.io').listen(Server) // we creating socket object

// app.use(express.static(__dirname + '/public')) 
// // we serving files from "public" directory

// io.on('connection', socket => {
//   console.log('a user connected')
//   socket.emit('connected')
//   socket.on('click', ({ id, x, y }) => {
//     console.log(`socket with id ${id} just clicked on { ${x}, ${y} }`)
//     // print to console event from web page
//     socket.emit('click') // and let page knows it
//   })
// })



const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
// Import the SerialPort class from the serialport package
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');




const app = express();
app.use(express.static('public'));
const server = http.createServer(app);
const io = socketIO(server);

// Replace with your actual Arduino's serial port name
const port = new SerialPort({ path: '/dev/tty.usbmodem1201', baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));


// Serve the HTML page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/Public/index.html');
});

// Handle Socket.IO connection events
io.on('connection', (socket) => {
  console.log('A user connected');

  parser.on('data', line => console.log(`> ${line}`));

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

port.on('error', function(err) {
  console.log('Error: ', err.message);
})

// Start the server
server.listen(3000, () => {
  console.log('Server listening on port 3000');
});

