import React, { useState, useRef, useEffect } from 'react';
import { sendChatbotMessage } from '../services/api';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: 'Hello! I\'m here to help you find colleges across India. You can ask me questions like:\n\n• "Which colleges offer AI/ML in Mumbai?"\n• "Show IT colleges in Maharashtra"\n• "Colleges offering Cybersecurity in India"\n\nWhat would you like to know?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || loading) {
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Add user message
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await sendChatbotMessage(userMessage);
      
      if (response.success) {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: response.data.botResponse 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: 'Sorry, I encountered an error processing your request. Please try again.' 
        }]);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="chatbot-section">
      <div className="chatbot-header">
        <h3>College Assistant</h3>
        <p>Ask me about colleges across India</p>
      </div>

      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            {message.content}
          </div>
        ))}
        
        {loading && (
          <div className="message bot">
            <em>Searching colleges...</em>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chatbot-input">
        <form onSubmit={handleSendMessage}>
          <div className="input-group">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about colleges..."
              disabled={loading}
              maxLength={1000}
            />
            <button type="submit" disabled={loading || !inputMessage.trim()}>
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;