import { motion } from 'framer-motion';
import { useState } from 'react';

export const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sent: true }]);
      setInput('');
    }
  };

  return (
    <div className="chat-container">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="chat-header"
      >
        <h2>Chat</h2>
      </motion.div>
      
      <div className="chat-messages">
        {messages.map((message, index) => (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            key={index}
            className={`message ${message.sent ? 'message-sent' : 'message-received'}`}
          >
            {message.text}
          </motion.div>
        ))}
      </div>

      <div className="chat-input-container">
        <input
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="send-button"
          onClick={sendMessage}
        >
          →
        </motion.button>
      </div>
    </div>
  );
};
