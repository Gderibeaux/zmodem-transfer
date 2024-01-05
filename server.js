const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
// Import the SerialPort class from the serialport package
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');




const app = express();
app.use(express.static('Public'));
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

  parser.on('data', line => {
    io.emit('data', line);
});

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

