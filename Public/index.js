// const socket = io.connect('http://localhost:3000')

// socket.on('connected', () => {
//   console.log('Socket Connected')
// })
// socket.on('disconnect', () => {
//   console.log('Socket Disconnected')
// })

//   // we listening for client click events
//   // and sending this data to server
// // add these lines
// socket.on('data', data => {
//   console.log('hello', data)
//   const outputElement = document.getElementById('output'); // Make sure you have an element with this ID in your HTML
//   outputElement.textContent += data + '\n'; // Append the received data
// });

const socket = io.connect('http://localhost:3000');

socket.on('connected', () => {
  console.log('Socket Connected');
});

socket.on('fileData', data => {
  console.log('Received file data:', data);
  const outputElement = document.getElementById('output');
  outputElement.textContent = data; // Display the file data
});

socket.on('disconnect', () => {
  console.log('Socket Disconnected');
});
