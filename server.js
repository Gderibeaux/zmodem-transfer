

// Include necessary modules
const express = require('express'); // Express framework for handling HTTP requests
const http = require('http'); // HTTP module to create an HTTP server
const socketIO = require('socket.io'); // Socket.IO for real-time bidirectional event-based communication
const { spawn } = require('child_process'); // Child process module to spawn subprocesses
const fs = require('fs'); // File system module for handling file operations
const path = require('path'); // Path module for handling file paths


// const SerialPort = require('serialport');
const { SerialPort } = require('serialport');
const port = new SerialPort({
path: '/dev/ttyS2',
baudRate: 9600,
dataBits: 8,
stopBits: 1,
parity: 'none',
});
const { ReadlineParser } = require('@serialport/parser-readline');


// const port = new SerialPort('COM2', { baudRate: 115200 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

parser.on('data', line => {
    console.log(`> ${line}`);
    // Handle incoming data here
});


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
        const receivedFilePath = path.join(filesDirectory, 'received_file.txt');

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
