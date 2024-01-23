

// // Include necessary modules
// const express = require('express'); // Express framework for handling HTTP requests
// const http = require('http'); // HTTP module to create an HTTP server
// const socketIO = require('socket.io'); // Socket.IO for real-time bidirectional event-based communication
// const { spawn } = require('child_process'); // Child process module to spawn subprocesses
// const fs = require('fs'); // File system module for handling file operations
// const path = require('path'); // Path module for handling file paths

// // Requesting a port and opening a connection
// async function initializeSerialPort() {
//   // Requesting a port and opening a connection
//   const port = await navigator.serial.requestPort();
//   await port.open({ baudRate: 115200 }); // Set the baud rate to match the Onion device
// }

// // Initialize Express application
// const app = express();
// app.use(express.static('Public')); // Serve static files from the 'Public' directory

// // Create an HTTP server and integrate it with the Express app
// const server = http.createServer(app);

// // Attach Socket.IO to the server
// const io = socketIO(server);

// // Define the directory to store or read files from
// const filesDirectory = path.join(__dirname, 'zmodem_files'); // Construct the path to 'zmodem_files' directory

// // Check if the files directory exists, create it if it doesn't
// if (!fs.existsSync(filesDirectory)) {
//   fs.mkdirSync(filesDirectory, { recursive: true }); // 'recursive: true' allows creating nested directories
// }

// // Set up a connection event listener for new Socket.IO connections
// io.on('connection', (socket) => {
//     console.log('A client connected'); // Log when a new client connects

//     // Event listener for 'requestLastFile' event
//     socket.on('requestLastFile', () => {
//         console.log('Last file request received'); // Log the file request

//         // Read the contents of the files directory
//         fs.readdir(filesDirectory, (err, files) => {
//             if (err) {
//                 console.error('Error reading the files directory:', err); // Log errors if directory reading fails
//                 return;
//             }
//             if (files.length === 0) {
//                 console.log('No files found'); // Log if no files are found
//                 return;
//             }

//             // Sort files by modification time
//             const sortedFiles = files.map(fileName => ({
//                 name: fileName,
//                 time: fs.statSync(path.join(filesDirectory, fileName)).mtime.getTime()
//             }))
//             .sort((a, b) => b.time - a.time);

//             // Get the most recent file
//             const mostRecentFile = sortedFiles[0].name;
//             console.log('Most recent file:', mostRecentFile); // Log the name of the most recent file

//             // Read and send the content of the most recent file
//             fs.readFile(path.join(filesDirectory, mostRecentFile), 'utf8', (err, data) => {
//                 if (err) {
//                     console.error('Error reading file:', err); // Log errors if file reading fails
//                     return;
//                 }
//                 socket.emit('fileData', data); // Emit the file data to the client
//             });
//         });
//     });

//     // Event listener to start Zmodem transfer
//     socket.on('startZmodemTransfer', () => {
//         console.log('Start Zmodem Transfer event received');

//         // Set the path to save the received file
//         const receivedFilePath = path.join(filesDirectory, 'zmodem_files');

//         // Spawn the 'rz' process for Zmodem transfer
//         const rz = spawn('/usr/bin/rz', ['-y', '-E', '-b'], {
//             cwd: filesDirectory, // Set the working directory for the 'rz' process
//         });

//         // Log data received from the 'rz' process's stdout
//         rz.stdout.on('data', (data) => {
//             console.log(`[rz] stdout: ${data}`);
//         });

//         // Log errors from the 'rz' process's stderr
//         rz.stderr.on('data', (data) => {
//             console.error(`[rz] stderr: ${data}`);
//         });

//         // Handle the closure of the 'rz' process
//         rz.on('close', (code) => {
//             console.log(`[rz] process exited with code ${code}`);
//             if (code === 0) {
//                 // Read and emit the content of the received file
//                 fs.readFile(receivedFilePath, 'utf8', (err, data) => {
//                     if (err) {
//                         console.error('Error reading received file:', err); // Log errors if file reading fails
//                         return;
//                     }
//                     socket.emit('fileData', data); // Emit the file data to the client
//                 });
//             }
//         });

//         // Handle incoming Zmodem data from the client and write it to the 'rz' process
//         socket.on('zmodemData', (data) => {
//             rz.stdin.write(data);
//         });
//     });

//     // Log when a client disconnects
//     socket.on('disconnect', () => {
//         console.log('User disconnected');
//     });
// });

// // Start the server listening on port 3000
// server.listen(3000, () => {
//     console.log('Server listening on port 3000');
// });

// initializeSerialPort()
//     .then(() => {
//         console.log('Serial port initialized successfully');
//     })
//     .catch((error) => {
//         console.error('Error initializing serial port:', error);
//     });








// Include necessary modules
const express = require('express'); // Express framework for handling HTTP requests
const http = require('http'); // HTTP module to create an HTTP server
const socketIO = require('socket.io'); // Socket.IO for real-time bidirectional event-based communication
const { exec } = require('child_process');
const fs = require('fs'); // File system module for handling file operations
const path = require('path'); // Path module for handling file paths
const { SerialPort } = require('serialport'); // Serialport library for serial communication
const { Client } = require('ssh2');

// Initialize Express application
const app = express();
app.use(express.static('Public')); // Serve static files from the 'Public' directory

// Create an HTTP server and integrate it with the Express app
const server = http.createServer(app);

// Attach Socket.IO to the server
const io = socketIO(server);

// Define the directory to store or read files from
const filesDirectory = path.join(__dirname, 'zmodem_file'); // Construct the path to 'zmodem_files' directory

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
  const receivedFilePath = path.join(filesDirectory, 'zmodem_files');
  
  // Declare the rz variable outside of the setTimeout function
  let rz;

  // Delay before starting Tera Term (e.g., 5 seconds)
  setTimeout(() => {
      // Execute the Tera Term command for Zmodem transfer
      const pathToTeraTerm = `"C:\\Program Files (x86)\\teraterm5\\ttermpro.exe"`
      // const command = `${pathToTeraTerm} /ssh /user=root /passwd=onioneer /T=1 /M=ZMODEM 192.168.3.1`;
      rz = exec(pathToTeraTerm, {
          cwd: filesDirectory,
          windowsHide: false,
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
                      console.error('Error reading received file:', err);
                      return;
                  }
                  socket.emit('fileData', data);
              });
          }
      });
  }, 5000); // 5000 milliseconds delay

  // Handle incoming Zmodem data from the client and write it to the 'rz' process
  // This event listener should probably be outside the 'startZmodemTransfer' event listener
  socket.on('zmodemData', (data) => {
      if (rz) {
          rz.stdin.write(data);
      }
  });
});
    // Log when a client disconnects
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const executeZmodemTransfer = () => {
  const command = 'lrzsz_command_here';
  exec(command, (error, stdout, stderr) => {
      if (error) {
          console.error(`Error: ${error}`);
          return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
  });
};

// Initialize the serial port
async function initializeSerialPort() {
    try {
        // Open a serial port
        const port = new SerialPort({
          path: 'COM2',
          baudRate: 115200,
          dataBits: 8,
          stopBits: 1,
          parity: 'none',
          });

        // Handle data received from the serial port
        port.on('data', (data) => {
            console.log('Data received from serial port:', data.toString());
            // You can handle the received data here
        });

        console.log('Serial port initialized successfully');
    } catch (error) {
        console.error('Error initializing serial port:', error);
    }
}



// Start the server listening on port 3000
server.listen(3000, () => {
    console.log('Server listening on port 3000');
});

// Initialize the serial port when the server starts
initializeSerialPort();
executeZmodemTransfer();













// const express = require('express');
// const http = require('http');
// const socketIO = require('socket.io');
// const { Client } = require('ssh2'); // Import the 'ssh2' library for SSH connections
// const fs = require('fs');
// const path = require('path');
// const { SerialPort } = require('serialport');

// const app = express();
// app.use(express.static('Public'));

// const server = http.createServer(app);
// const io = socketIO(server);

// const filesDirectory = path.join(__dirname, 'zmodem_files');

// if (!fs.existsSync(filesDirectory)) {
//   fs.mkdirSync(filesDirectory, { recursive: true });
// }

// io.on('connection', (socket) => {
//   console.log('A client connected');

//   // Variable to store the SSH connection
//   let sshConnection = null;

//   socket.on('requestLastFile', () => {
//     // ... (previous code)
//   });

// // Event listener to start SSH transfer with a specified filename
// socket.on('startSshTransfer', (filename) => {
//   console.log('Start SSH Transfer event received');

//   if (!sshConnection) {
//     console.error('SSH connection not established. Please connect to SSH first.');
//     return;
//   }

//   // Specify the SSH command to send the specified file using 'sz'
//   const sshCommand = `sz ${filename}`;

//   sshConnection.exec(sshCommand, (err, stream) => {
//     if (err) throw err;
//     stream
//       .on('data', (data) => {
//         console.log('SSH STDOUT: ' + data);
//       })
//       .on('close', (code, signal) => {
//         console.log('SSH stream closed with code ' + code);
//       });
//   });
// });

//   socket.on('disconnect', () => {
//     console.log('User disconnected');
//   });

//   // Handle SSH connection and disconnection
//   socket.on('connectSsh', () => {
//     console.log('Connecting to SSH server...');
    
//     // SSH connection parameters
//     const sshConfig = {
//       host: 'omega-8279.local',
//       port: 22, // SSH port (default is 22)
//       username: 'root',
//       password: 'onioneer', // OR privateKey: fs.readFileSync('path_to_private_key')
//     };

//     sshConnection = new Client();

//     sshConnection.on('ready', () => {
//       console.log('SSH connection established');
//     });

//     sshConnection.on('error', (err) => {
//       console.error('SSH connection error:', err);
//     });

//     // Connect to the SSH server
//     sshConnection.connect(sshConfig);
//   });

//   socket.on('disconnectSsh', () => {
//     console.log('Disconnecting from SSH server...');
    
//     if (sshConnection) {
//       sshConnection.end();
//       sshConnection = null;
//       console.log('SSH connection closed');
//     }
//   });
// });

// server.listen(3000, () => {
//   console.log('Server listening on port 3000');
// });


