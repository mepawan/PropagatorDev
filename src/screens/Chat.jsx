import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, Button, StyleSheet} from 'react-native';
import {RtcEngine} from 'react-native-agora';

const Chat = () => {
  const [appId, setAppId] = useState('50a7e52bf3324615ba40e309ffbadeca');
  const [channelName, setChannelName] = useState('test');
  const [joinSucceed, setJoinSucceed] = useState(false);
  const [peerIds, setPeerIds] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const initAgora = async () => {
      const engine = await RtcEngine.create(appId);

      // Enable video and set up listeners
      await engine.enableVideo();
      engine.addListener('UserJoined', (uid, elapsed) => {
        setPeerIds([...peerIds, uid]);
      });
      engine.addListener('UserOffline', (uid, reason) => {
        setPeerIds(peerIds.filter(id => id !== uid));
      });

      try {
        // Join the channel
        await engine.joinChannel(null, channelName, null, 0);
        setJoinSucceed(true);
        engine.startPreview();
      } catch (error) {
        console.log('Failed to join channel:', error);
      }
    };

    initAgora();

    return () => {
      // RtcEngine.destroy();
    };
  }, []);

  const sendMessage = () => {
    if (inputMessage.trim() !== '') {
      setMessages([...messages, inputMessage]);
      setInputMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.chatContainer}>
        <Text style={styles.heading}>Chat</Text>
        <View style={styles.messagesContainer}>
          {messages.map((msg, index) => (
            <Text key={index} style={styles.message}>
              {msg}
            </Text>
          ))}
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Type your message..."
            placeholderTextColor="grey"
          />
          <Button title="Send" onPress={sendMessage} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subHeading: {
    fontSize: 16,
    marginBottom: 10,
    color: '#000',
  },
  fullView: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoView: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: 'black',
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 10,
  },
  message: {
    marginBottom: 5,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    color: 'grey',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    marginRight: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    color: '#000',
  },
});

export default Chat;
