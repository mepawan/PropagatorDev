import React, { useState, useEffect, useRef } from 'react';
import SimplePeer from 'simple-peer';

const VideoCall = ({ user,currUser, socket }) => {
  const [incomingCall, setIncomingCall] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [caller, setCaller] = useState('');

  const userVideoRef = useRef();
  const partnerVideoRef = useRef();
  const [partnerSignal, setPartnerSignal] = useState(null); // Define partnerSignal state

  useEffect(() => {
    
    if (!socket) return;
    //console.log(socket);
    console.log('video call page');
    console.log(user);
    console.log(currUser);

    socket.on('call-user', (data) => {
      console.log('on call-user');
      console.log(data.data);
      setIncomingCall(data.data.from_uid);
    });
    socket.on('accept-call', (data) => {
      console.log('accept call');
    });
    socket.on('call-accepted', (data) => {
      
      console.log('on call-accepted');
      console.log(data.data);
      setCallAccepted(true);
    });

    socket.on('stream', (stream) => {
      console.log('on stream');
      setRemoteStream(stream);
    });

    socket.on('end-call', () => {
      console.log('on end-call');
      setCallAccepted(false);
      setCaller('');
      setRemoteStream(null);
    });

    return () => {
      socket.off('call-user');
      socket.off('call-accepted');
      socket.off('stream');
      socket.off('end-call');
    };
  }, [socket]);

  const callUser = () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((myStream) => {
        setStream(myStream);
        userVideoRef.current.srcObject = myStream;

        const peer = new SimplePeer({ initiator: true, trickle: false, stream: myStream });

        peer.on('signal', (data) => {
          console.log('call user - on signal ');
          socket.emit('call-user', { from_uid:currUser.uid, to_uid:user.uid, signalData: data });
          console.log('called to : ' + user.uid);
        });

        peer.on('stream', (stream) => {
          console.log('call user - on stream ');
          partnerVideoRef.current.srcObject = stream;
        });

        socket.on('call-accepted', () => {
          console.log('call user - on call-accepted ');
          peer.signal(partnerSignal); // Use partnerSignal when call is accepted
          setCallAccepted(true);
        });

        

        peer.on('close', () => {
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

        peer.on('signal', (data) => {
          console.log('accept call - on signal ');

          setPartnerSignal(data); // Store partner's signal
          
          socket.emit('accept-call', {from_uid:currUser.uid, to_uid:user.uid, signalData: data, to: incomingCall });
        });

        peer.on('stream', (stream) => {
          console.log('accept call - on stream ');
          partnerVideoRef.current.srcObject = stream;
        });
        
        peer.signal(partnerSignal); // Signal with partnerSignal

        peer.on('close', () => {
          endCall();
        });
      })
      .catch((err) => console.error('Error accessing media devices:', err));
  };

  const endCall = () => {
    if (socket) {
      socket.emit('end-call', {from_uid:currUser.uid, to_uid:user.uid, to: incomingCall });
    }
    setCallAccepted(false);
    setIncomingCall(null);
    setStream(null);
    userVideoRef.current.srcObject = null;
    partnerVideoRef.current.srcObject = null;
  };

  return (
    <div>
      <video ref={userVideoRef} autoPlay muted style={{ width: '30%',  right: '16px', top: '16px' }}></video>
      <video ref={partnerVideoRef} autoPlay style={{ width: '30%',  right: '16px', top: '16px' }}></video>

      {!callAccepted && !incomingCall && (
        <button onClick={callUser}>Call User</button>
      )}

      {incomingCall && !callAccepted && (
        <div>
          <p>Incoming call from {incomingCall}</p>
          <button onClick={acceptCall}>Accept</button>
          <button onClick={endCall}>Decline</button>
        </div>
      )}

      {callAccepted && (
        <button onClick={endCall}>End Call</button>
      )}
    </div>
  );
};

export default VideoCall;
