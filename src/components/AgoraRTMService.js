import AgoraRTM from 'agora-rn-rtm';

const APP_ID = '23d05a957ce04112a2c083854e577cde'; 

class AgoraRTMService {
  constructor() {
    this._agoraRTM = AgoraRTM.createInstance(APP_ID);
    this._loggedIn = false;
    this._listeners = [];
  }

  async login(uid) {
    try {
      await this._agoraRTM.login({uid});
      this._loggedIn = true;
    } catch (error) {
      console.error('Failed to log in:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await this._agoraRTM.logout();
      this._loggedIn = false;
    } catch (error) {
      console.error('Failed to log out:', error);
      throw error;
    }
  }

  async sendMessage(peerId, text) {
    try {
      await this._agoraRTM.sendMessageToPeer({text}, peerId);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  addListener(event, listener) {
    const existing = this._listeners.find(
      l => l.event === event && l.listener === listener,
    );
    if (!existing) {
      this._listeners.push({event, listener});
      this._agoraRTM.on(event, listener);
    }
  }

  removeListener(event, listener) {
    this._listeners = this._listeners.filter(
      l => !(l.event === event && l.listener === listener),
    );
    this._agoraRTM.off(event, listener);
  }
}

export default new AgoraRTMService();
