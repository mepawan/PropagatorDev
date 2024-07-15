import React, { useState, useEffect, useRef } from 'react';
import SimplePeer from 'simple-peer';
import { Box, Button, Typography, Paper } from '@mui/material';

const VideoCall = ({ user,currUser, socket }) => {
  const [incomingCall, setIncomingCall] = useState(false);
  const [outgoingCall, setOutgoingCall] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [caller, setCaller] = useState('');

  const userVideoRef = useRef();
  const partnerVideoRef = useRef();
  const [partnerSignal, setPartnerSignal] = useState(null); // Define partnerSignal state
  const peerRef = useRef();
    

  useEffect(() => {
    if (!socket) return;

    socket.on('call-user', (data) => {
        console.log('on call user');
        
      if(data.data.to_uid == currUser.uid){
        setPartnerSignal(data.data.signalData);
        setRemoteStream(data.data.signalData);
        setIncomingCall(true);
      }
      
    });

    socket.on('call-accepted', (data) => {
        console.log('on call accepted');
      setCallAccepted(true);
      peerRef.current.signal(data.data.signalData);
    });

    socket.on('end-call', (data) => {
        console.log('on call end');
        console.log(currUser);
        console.log(data);
        if(currUser.uid !== data.data.uid){
          console.log('broadcasting end call');
          endCall('no');
        }
        
    });

    return () => {
      socket.off('call-user');
      socket.off('call-accepted');
      socket.off('end-call');
    };
  }, [socket]);

  const callUser = () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((myStream) => {
        setStream(myStream);
        userVideoRef.current.srcObject = myStream;
        setOutgoingCall(true);
        const peer = new SimplePeer({ initiator: true, trickle: false, stream: myStream });
        peerRef.current = peer;

        peer.on('signal', (data) => {
          socket.emit('call-user', { from_uid:currUser.uid, to_uid:user.uid, signalData: data });
        });

        peer.on('stream', (stream) => {
          partnerVideoRef.current.srcObject = stream;
        });

        peer.on('close', () => {
          console.log('on close');
          endCall();
        });
      })
      .catch((err) => console.error('Error accessing media devices:', err));
  };

  const acceptCall = () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((myStream) => {
        setStream(myStream);
        userVideoRef.current.srcObject = myStream;

        const peer = new SimplePeer({ initiator: false, trickle: false, stream: myStream });
        peerRef.current = peer;

        peer.on('signal', (data) => {
          socket.emit('accept-call', { signalData: data, from_uid:currUser.uid, to_uid:user.uid });
        });

        peer.on('stream', (stream) => {
          partnerVideoRef.current.srcObject = stream;
        });

        peer.signal(partnerSignal);

        peer.on('close', () => {
          console.log('on close 2');
          endCall();
        });

        setCallAccepted(true);
      })
      .catch((err) => console.error('Error accessing media devices:', err));
  };

  const endCall = (emit) => {
      console.log('end call: ');
      console.log(emit);
      if(emit !== 'no'){
        socket.emit('end-call', { uid:currUser.uid });
      }
      
      stopBothVideoAndAudio(stream);
    
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    setCallAccepted(false);
    setIncomingCall(false);
    setOutgoingCall(false);

    setStream(null);
    setPartnerSignal(null);
    userVideoRef.current.srcObject = null;
    partnerVideoRef.current.srcObject = null;
  };
  function stopBothVideoAndAudio(strm) {
    try{
      strm.getTracks().forEach((track) => {
          if (track.readyState == 'live') {
              track.stop();
          }
      });
    } catch(e){
      console.log(e);
    }
      
  } 
  return (

    <Paper style={{ padding: '16px', marginTop: '16px' }}>
      <Box display="flex" flexDirection="column" alignItems="center" style={{position:'relative'}}>
        
        {callAccepted && (
          <Button variant="contained" color="secondary" onClick={endCall} style={{ marginTop: '16px' }}>
            End Call
          </Button>
        )}
        {!callAccepted && !incomingCall && !outgoingCall && (
          <Button variant="contained" color="secondary" onClick={callUser} style={{ marginTop: '16px' }}>
            Call User
          </Button>
        )}
        {incomingCall && !callAccepted && (
          <Box display="flex" flexDirection="column" alignItems="center">
            <p>Incoming call from {incomingCall}</p>
            <Button variant="contained" color="secondary" onClick={acceptCall} style={{ marginTop: '16px' }}>
              Accept
            </Button>
            <Button variant="contained" color="secondary" onClick={endCall} style={{ marginTop: '16px' }}>
               Decline
            </Button>
          </Box>
        )}
        <video ref={userVideoRef} autoPlay muted style={{ width: '30%', position: 'absolute', right: '16px', top: '16px' }} />
        <video ref={partnerVideoRef} autoPlay style={{ width: '100%' }} />

      </Box>
    </Paper>


  );
};

export default VideoCall;
