
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
    startZmodemReception();
  });

  async function startZmodemReception() {
    if ('serial' in navigator) {
      try {
        
        const port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });

        const textDecoder = new TextDecoderStream();
        port.readable.pipeTo(textDecoder.writable);
        const reader = textDecoder.readable.getReader();

        // const zmodemReceive = new ZmodemReceive(); // Placeholder for Zmodem logic

        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            reader.releaseLock();
            break;
          }

          zmodemReceive.onDataReceived(value); // Process received data with Zmodem logic

          if (zmodemReceive.isTransferComplete()) {
            const receivedFile = zmodemReceive.getFile();
            // Handle the received file (e.g., display or save it)
            break;
          }
        }
      } catch (error) {
        console.error('Error accessing serial port:', error);
      }
    } else {
      console.log('Web Serial API not supported.');
    }
  }


  function updateOutput(data) {
    console.log("Received Data: ", data);
    const outputElement = document.getElementById('output');
    outputElement.innerHTML += data + '<br>';
  }
});
