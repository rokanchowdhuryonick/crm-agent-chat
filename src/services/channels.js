// src/services/channels.js
export const CHANNELS = {
    CHAT: (sessionId) => `chat.${sessionId}`,
  };
  
  export const EVENTS = {
    MESSAGE_SENT: '.NewMessage',
  };