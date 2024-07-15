import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button , Text, Container, List, ListItem, ListItemText, ListItemSecondaryAction, Avatar, IconButton, Typography, Box } from '@mui/material';
import OnlineIcon from '@mui/icons-material/FiberManualRecord';
import OfflineIcon from '@mui/icons-material/DoNotDisturb';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const[currUser, setCurrUser] = useState({token:"",uid:"", username:""});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let token = localStorage.getItem('token');
        

        if (!token) {
          throw new Error('No token found');
        }
        let uid = localStorage.getItem('uid');
        let username = localStorage.getItem('username');
        setCurrUser({token:token,uid:uid,username:username});

        const config = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        };
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users`, config);
        setUsers(res.data);
      } catch (err) {
        console.error(err.message || err.response.data);
      }
    };

    fetchUsers();
  }, []);

  const handleUserClick = (userId) => {
    navigate(`/user/${userId}`);
  };
  const handleLogout = () => {
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
          User Dashboard
        </Typography>
        <List>
          {users.map((user) => (
            user._id != currUser.uid ? 
            <ListItem key={user._id} onClick={() => handleUserClick(user._id)}>
              <Avatar>{user.username.charAt(0)} </Avatar>
              <ListItemText primary={user.username} />
              <ListItemSecondaryAction>
                <IconButton edge="end" disabled>
                  {user.onlineStatus ? <OnlineIcon color="success" /> : <OfflineIcon color="disabled" />}
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            : ''
          ))}
        </List>
      </Box>
    </Container>

  );
};


export default Dashboard;
