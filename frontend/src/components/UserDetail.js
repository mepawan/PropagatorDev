import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, Avatar, IconButton, Grid, Paper, TextField, Button } from '@mui/material';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import PhoneIcon from '@mui/icons-material/Phone';
import ChatIcon from '@mui/icons-material/Chat';
import VideoCall from './VideoCall';
import VideoCall2 from './VideoCall2';
import Chat from './Chat';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const UserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState({uid:"",username:""});
  const[currUser, setCurrUser] = useState({token:"",uid:"", username:""});
  const socket = io(process.env.REACT_APP_SOCKET_IO_SERVER);
  
  
  const navigate = useNavigate();

  useEffect(() => {

    socket.on('connect', () => {
      console.log('Connected:', socket.connected);
      socket.emit('join_room',{uid:currUser.uid,socketId:socket.id});
      socket.on('join_room',(data) => {
          console.log('room joined');
          console.log(data);
      });
    });
    
    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });



    let uid = localStorage.getItem('uid');
    let username = localStorage.getItem('username');
    let token = localStorage.getItem('token');
    setCurrUser({token:token,uid:uid,username:username});

    const fetchUser = async () => {
      try {

        const config = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        };

        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/${id}`,config);
        setUser({uid:res.data._id,username:res.data.username,onlineStatus:res.data.onlineStatus});
      } catch (err) {
        console.error(err.response.data);
      }
    };

    fetchUser();
  }, []);


  const handleSendMessage = async () => {
    try {
      //await sendMessage(userId, message);
      //setMessages([...messages, { text: message, sender: 'me' }]);
      //setMessage('');
    } catch (error) {
     // console.error('Error sending message:', error);
    }
  };

  const handleVideoCall = () => {
   // initiateVideoCall(userId);
    //setVideoCall(true);
  };

  const handleLogout = () => {
    console.log('handle logout')
    localStorage.removeItem('token');
    localStorage.removeItem('uid');
    localStorage.removeItem('username');
    navigate('/');
  };

  return (

    <Container>
      <Box my={4}>
        <Box display="flex" justifyContent="flex-end">
          <Typography variant="h6" gutterBottom> {currUser.username} </Typography>
          <Button onClick={() => handleLogout()}> Logout </Button>
        </Box>
        <Typography variant="h4" gutterBottom>
          User Details
        </Typography>


      {user && (
        <>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar>{user.username.charAt(0)}</Avatar>
            <Box ml={2}>
              <Typography variant="h5">{user.username}</Typography>
              <Typography color="textSecondary">{user.onlineStatus ? 'Online' : 'Offline'}</Typography>
            </Box>
          </Box>
          <Box mb={2}>
            <IconButton color="primary" onClick={handleVideoCall}>
              <VideoCallIcon />
            </IconButton>
            <IconButton color="primary">
              <PhoneIcon />
            </IconButton>
            <IconButton color="primary">
              <ChatIcon />
            </IconButton>
          </Box>
          <Paper elevation={3} style={{ padding: '16px', marginBottom: '16px' }}>
            <Typography variant="h6" gutterBottom>Chat</Typography>
            <Chat user={user} currUser={currUser} socket={socket} /> 
          </Paper>
          <Paper elevation={3} style={{ padding: '16px', marginBottom: '16px' }}>
            <Typography variant="h6" gutterBottom>Video Call</Typography>
            <VideoCall2 user={user} currUser={currUser} socket={socket} />
          </Paper>
        </>
      )}
    </Box>
  </Container>


  );
};

export default UserDetail;
