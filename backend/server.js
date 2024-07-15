const express = require('express');
var fs = require('fs');
const http = require('http');
var https = require('https');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const cors = require('cors');

var privateKey  = fs.readFileSync('/var/www/ssl/private.key', 'utf8');
var certificate = fs.readFileSync('/var/www/ssl/certificate.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};

const app = express();
const server = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

/*
const io = socketIo(server,{
    cors: {
      origin: '*',
    }
});
*/
const io = socketIo(httpsServer,{
  cors: {
    origin: '*',
  }
});

connectDB();

app.use(cors());
app.use(express.json({ extended: false }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes')); // Ensure this line is present

var clients = [];
// Socket.io connection


io.on('connection', (socket) => {
  socket.on('message', (data) => {
    console.log('message received on server');
    io.emit('message', data);
  });

  
  socket.on('join_room', (data) => {
    clients[data.uid] = data.socketId;
    socket.emit('join_room',{clients});
  })
  socket.on('call-user', (data) => {
    console.log('call request');
    console.log(data.to_uid);
    console.log(data.from_uid);
    //io.to(data.to).emit('call-user', { from: socket.id });
    //io.to(clients[data.to_uid]).emit('call-user', { data });
    io.emit('call-user', { data });
  });
  // Handle accept-call event
  socket.on('accept-call', (data) => {
    //const { signalData, to } = data;
    //io.to(to).emit('call-accepted', { signal: signalData });
    io.emit('call-accepted', { data });
  });
  socket.on('candidate', (data) => {
    io.emit('candidate', data);
  });

  // Handle end-call event
  socket.on('end-call', (data) => {
    const { to } = data;
    //io.to(to).emit('end-call');
    io.emit('end-call',{ data });
  });
  socket.on('chat-message', (data) => {
    console.log('chat message server');
    console.log(data);
    //io.to(data.to).emit('chat-message', { from: socket.id, message: data.message });
    //io.to(clients[data.to_uid]).emit('chat-message', { data });
    io.emit('chat-message', { data });
  });

  socket.on('disconnect', () => {
    console.log(' disconnected : ' + socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
httpsServer.listen(5001, () => console.log(`https Server started on port 5001`));
