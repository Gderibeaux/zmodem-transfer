

// Include necessary modules
const express = require('express'); // Express framework for handling HTTP requests
const http = require('http'); // HTTP module to create an HTTP server
const socketIO = require('socket.io'); // Socket.IO for real-time bidirectional event-based communication
const { spawn } = require('child_process'); // Child process module to spawn subprocesses
const fs = require('fs'); // File system module for handling file operations
const path = require('path'); // Path module for handling file paths


// Initialize Express application
const app = express();
app.use(express.static('Public')); // Serve static files from the 'Public' directory

// Create an HTTP server and integrate it with the Express app
const server = http.createServer(app);

// Attach Socket.IO to the server
const io = socketIO(server);

// Define the directory to store or read files from
const filesDirectory = path.join(__dirname, 'zmodem_files'); // Construct the path to 'zmodem_files' directory

// Check if the files directory exists, create it if it doesn't
if (!fs.existsSync(filesDirectory)) {
  fs.mkdirSync(filesDirectory, { recursive: true }); // 'recursive: true' allows creating nested directories
}

// Set up a connection event listener for new Socket.IO connections
io.on('connection', (socket) => {
    console.log('A client connected'); // Log when a new client connects

    // Event listener for 'requestLastFile' event
    socket.on('requestLastFile', () => {
        console.log('Last file request received'); // Log the file request

        // Read the contents of the files directory
        fs.readdir(filesDirectory, (err, files) => {
            if (err) {
                console.error('Error reading the files directory:', err); // Log errors if directory reading fails
                return;
            }
            if (files.length === 0) {
                console.log('No files found'); // Log if no files are found
                return;
            }

            // Sort files by modification time
            const sortedFiles = files.map(fileName => ({
                name: fileName,
                time: fs.statSync(path.join(filesDirectory, fileName)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time);

            // Get the most recent file
            const mostRecentFile = sortedFiles[0].name;
            console.log('Most recent file:', mostRecentFile); // Log the name of the most recent file

            // Read and send the content of the most recent file
            fs.readFile(path.join(filesDirectory, mostRecentFile), 'utf8', (err, data) => {
                if (err) {
                    console.error('Error reading file:', err); // Log errors if file reading fails
                    return;
                }
                socket.emit('fileData', data); // Emit the file data to the client
            });
        });
    });

    // Event listener to start Zmodem transfer
    socket.on('startZmodemTransfer', () => {
        console.log('Start Zmodem Transfer event received');

        // Set the path to save the received file
        const receivedFilePath = path.join(filesDirectory, 'new_world.txt');

        // Spawn the 'rz' process for Zmodem transfer
        const rz = spawn('rz', ['-y', '-E', '-b'], {
            cwd: filesDirectory, // Set the working directory for the 'rz' process
        });

        // Log data received from the 'rz' process's stdout
        rz.stdout.on('data', (data) => {
            console.log(`[rz] stdout: ${data}`);
        });

        // Log errors from the 'rz' process's stderr
        rz.stderr.on('data', (data) => {
            console.error(`[rz] stderr: ${data}`);
        });

        // Handle the closure of the 'rz' process
        rz.on('close', (code) => {
            console.log(`[rz] process exited with code ${code}`);
            if (code === 0) {
                // Read and emit the content of the received file
                fs.readFile(receivedFilePath, 'utf8', (err, data) => {
                    if (err) {
                        console.error('Error reading received file:', err); // Log errors if file reading fails
                        return;
                    }
                    socket.emit('fileData', data); // Emit the file data to the client
                });
            }
        });

        // Handle incoming Zmodem data from the client and write it to the 'rz' process
        socket.on('zmodemData', (data) => {
            rz.stdin.write(data);
        });
    });

    // Log when a client disconnects
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Start the server listening on port 3000
server.listen(3000, () => {
    console.log('Server listening on port 3000');
});





// const express = require('express');
// const http = require('http');
// const WebSocket = require('ws');
// const fs = require('fs');
// const path = require('path');
// const { SerialPort } = require('serialport'); // Import the SerialPort library

// const app = express();
// const server = http.createServer(app);
// const wss = new WebSocket.Server({ server });

// // Define the path to the serial port of your Onion Omega device

// // Create a SerialPort instance
// const serialPort = new SerialPort({
// path: '/dev/tty.usbserial-0001',
// baudRate: 9600,
// dataBits: 8,
// stopBits: 1,
// parity: 'none',
// });

// // Serve your HTML and other static files here (similar to your previous setup)
// app.use(express.static(path.join(__dirname, 'Public')));

// wss.on('connection', (ws) => {
//     console.log('WebSocket connected');

//     ws.on('message', (message) => {
//         // Handle incoming messages from the client (e.g., file data)
//         // You can save the received data to a file or process it as needed
//         // For simplicity, let's assume you save it to a file:
//         fs.writeFileSync(path.join(__dirname, 'received_file.txt'), message, 'utf8');
//         console.log('Received and saved file data');

//         // Implement serial port logic to send data to Onion Omega device
//         serialPort.write(message, (err) => {
//             if (err) {
//                 console.error('Error sending data to Onion Omega:', err);
//             } else {
//                 console.log('Data sent to Onion Omega');
//             }
//         });
//     });
// });

// server.listen(3000, () => {
//     console.log('Server listening on port 3000');
// });

// // Handle data received from the Onion Omega device via serial port
// serialPort.on('data', (data) => {
//     // Send the received data to all connected WebSocket clients
//     wss.clients.forEach((client) => {
//         if (client.readyState === WebSocket.OPEN) {
//             client.send(data);
//         }
//     });
// });
