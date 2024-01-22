
// const socket = io.connect('http://localhost:3000');

// socket.on('connect', () => {
//   console.log('Socket Connected');
// });

// socket.on('serialData', data => {
//   console.log("Received Data: ", data);
//   updateOutput(data); // Handles received serial data
// });

// socket.on('fileData', (data) => {
//   console.log("Received File Data: ", data);
//   document.getElementById('file-content').textContent = data;
// });

// document.getElementById('get-last-file').addEventListener('click', () => {
//   console.log('Button clicked');
//   socket.emit('requestLastFile'); // Emit an event to request the last file
// });

// document.getElementById('start-transfer').addEventListener('click', () => {
//   console.log('Start transfer button clicked'); // For debugging
//   socket.emit('startZmodemTransfer');
// });

// function updateOutput(data) {
//   console.log("Received Data: ", data);
//   const outputElement = document.getElementById('output');
//   outputElement.innerHTML += data + '<br>';
// }


document.addEventListener('DOMContentLoaded', () => {
  const socket = io.connect('http://localhost:3000');

  socket.on('connect', () => {
    console.log('Socket Connected');
  });

  socket.on('serialData', data => {
    console.log("Received Data: ", data);
    updateOutput(data);
  });

  socket.on('fileData', (data) => {
    console.log("Received File Data: ", data);
    document.getElementById('file-content').textContent = data;
  });

  document.getElementById('get-last-file').addEventListener('click', () => {
    console.log('Button clicked');
    socket.emit('requestLastFile');
  });

  document.getElementById('start-transfer').addEventListener('click', () => {
    console.log('Start transfer button clicked');
    socket.emit('startZmodemTransfer');
  });

document.getElementById('connect').addEventListener('click', async () => {
    if ('serial' in navigator) {
        try {
            // Requesting a port and opening a connection
            const port = await navigator.serial.requestPort();
            await port.open({ baudRate: 9600 });

            // Setting up a text decoder to read incoming data
            const textDecoder = new TextDecoderStream();
            port.readable.pipeTo(textDecoder.writable);
            const reader = textDecoder.readable.getReader();

            // Setting up a text encoder to send data
            const textEncoder = new TextEncoderStream();
            textEncoder.readable.pipeTo(port.writable);
            const writer = textEncoder.writable.getWriter();

            // Reading loop for incoming data
            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    reader.releaseLock();
                    break;
                }
                // Handle received data
                console.log(value);
            }

            // Function to write data to the serial port
            async function writeData(data) {
                await writer.write(data);
            }

            // Add your logic to use writeData function as needed

        } catch (error) {
            // Error handling for serial port access
            console.error('Error accessing serial port:', error);
        }
    } else {
        // If Web Serial API is not supported in the browser
        console.log('Web Serial API not supported.');
    }
});


  function updateOutput(data) {
    console.log("Received Data: ", data);
    const outputElement = document.getElementById('output');
    outputElement.innerHTML += data + '<br>';
  }
});
