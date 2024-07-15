import React, { useState, useEffect,useRef,FormEvent, KeyboardEvent} from 'react';
import { List, ListItem, ListItemText,Typography, Paper, Box, Grid, Button,TextField} from '@mui/material';

const Chat = ({ user,currUser, socket }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const messageEndRef = useRef(null);
  
  useEffect(() => {
    if (!socket) {
      console.log('no socket found');
      return;
    }
    console.log(user);
    socket.on('chat-message', (data) => {
      console.log('received chat message');
      console.log(data.data);
      //console.log(data.data.from_uid);
     // console.log(data.data.to_uid);
     if(data.data.from_uid == currUser.uid || data.data.to_uid == currUser.uid){
      setMessages((prevMessages) => [...prevMessages, data.data]);
     }
      
    });

    return () => {
      socket.off('chat-message');
    };
  }, [socket]);

  const sendMessage = (e) => {
    if (e) e.preventDefault();
    console.log(user);
    if(message !== ""){
      let msg = { to_uid: user.uid,from_uid:currUser.uid, message: message };
      socket.emit('chat-message', msg);
      //setMessages((prevMessages) => [...prevMessages, msg]);
      console.log('message sent to: ' + user.uid);
      setMessage('');
    }
    
  };
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [message]);

  //useEffect(() => {
    //if (messageEndRef.current) {
    //  messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
   // }
  //}, [messages]);


  return (

  <Paper elevation={6} style={{ padding: '20px', marginTop: '20px', maxHeight: '500px', overflow: 'auto' }}>
    <Box display="flex" flexDirection="column" justifyContent="space-between" height="100%">
      <Box flexGrow={1} style={{ overflowY: 'auto', marginBottom: '20px' }}>
        {messages.map((message, index) => (
          <Box key={index} display="flex" justifyContent={message.from_uid === currUser.uid ? 'flex-end' : 'flex-start'}>
            <Box
              component="div"
              bgcolor={message.from_uid === currUser.uid ? 'primary.main' : 'grey.300'}
              color={message.from_uid === currUser.uid ? 'white' : 'black'}
              borderRadius={message.from_uid === currUser.uid ? '15px 15px 0 15px' : '15px 15px 15px 0'}
              padding="10px"
              margin="5px"
              maxWidth="60%"
            >
              <Typography variant="body2">{message.message}</Typography>
            </Box>
          </Box>
        ))}
        <div ref={messageEndRef} />
      </Box>
      <form onSubmit={sendMessage} style={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          variant="outlined"
          placeholder="Type a message"
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button type="submit" variant="contained" color="primary" style={{ marginLeft: '10px' }}>
          Send
        </Button>
      </form>
    </Box>
  </Paper>

  );
};

export default Chat;
