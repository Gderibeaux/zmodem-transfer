// const express = require('express');
// const http = require('http');
// const socketIO = require('socket.io');
// // Import the SerialPort class from the serialport package
// const { SerialPort } = require('serialport');
// const { ReadlineParser } = require('@serialport/parser-readline');




// const app = express();
// app.use(express.static('Public'));
// const server = http.createServer(app);
// const io = socketIO(server);

// // Replace with your actual Arduino's serial port name
// const port = new SerialPort({ path: 'COM2', baudRate: 9600 });
// const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));


// // Serve the HTML page
// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/Public/index.html');
// });

// // Handle Socket.IO connection events
// io.on('connection', (socket) => {
//   console.log('A user connected');

//   parser.on('data', line => {
//     console.log("HEllo")
//     io.emit('data', line);
// });

//   socket.on('disconnect', () => {
//     console.log('User disconnected');
//   });
// });

// port.on('error', function(err) {
//   console.log('Error: ', err.message);
// })

// // Start the server
// server.listen(3000, () => {
//   console.log('Server listening on port 3000');
// });

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.static('Public'));
const server = http.createServer(app);
const io = socketIO(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/Public/index.html');
});

io.on('connection', (socket) => {
  console.log('A user connected');

  // Read file and emit its contents
  fs.readFile(path.join(__dirname, 'random_numbers.txt'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the file:', err);
      return;
    }
    io.emit('fileData', data);
    console.log("working")
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
