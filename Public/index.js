
const socket = io.connect('http://localhost:3000');

socket.on('connect', () => {
  console.log('Socket Connected');
});

socket.on('serialData', data => {
  console.log("Received Data: ", data);
  updateOutput(data); // Handles received serial data
});

socket.on('fileData', (data) => {
  console.log("Received File Data: ", data);
  document.getElementById('file-content').textContent = data;
});

document.getElementById('get-last-file').addEventListener('click', () => {
  console.log('Button clicked');
  socket.emit('requestLastFile'); // Emit an event to request the last file
});

document.getElementById('start-transfer').addEventListener('click', () => {
  console.log('Start transfer button clicked'); // For debugging
  socket.emit('startZmodemTransfer');
});

function updateOutput(data) {
  console.log("Received Data: ", data);
  const outputElement = document.getElementById('output');
  outputElement.innerHTML += data + '<br>';
}
