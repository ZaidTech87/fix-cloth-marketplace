import React, { useState, useRef, useEffect } from 'react';
import { FaComments, FaTimes, FaPaperPlane } from 'react-icons/fa';
import { chatbotAPI } from '../services/api';
import './ChatbotWidget.css';

function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Namaste! Main aapki website use karne ya textile se related kisi bhi sawal me madad kar sakta hoon. Kya poochna chahenge?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage = { role: 'user', content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      // Sirf last 10 messages history bhejo (context ke liye, zyada tokens/cost bachane ke liye)
      const history = updatedMessages
        .slice(-10)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await chatbotAPI.ask(trimmed, history.slice(0, -1));
      const reply = response.data.reply;

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, abhi jawab nahi de pa raha. Thodi der baad try karein.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>

      {/* Floating icon button */}
      {!isOpen && (
        <div className="chatbot-floating">
          <div className="chatbot-label">Ask Me</div>

          <button
            className="chatbot-toggle-btn"
            onClick={() => setIsOpen(true)}
          >
            <FaComments size={24} />
          </button>
        </div>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <span>Assistant</span>
            <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>
              <FaTimes />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chatbot-message ${msg.role === 'user' ? 'chatbot-message-user' : 'chatbot-message-bot'}`}
              >
                {msg.content}
              </div>
            ))}
            {loading && (
              <div className="chatbot-message chatbot-message-bot chatbot-typing">
                Typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Apna sawal likhein..."
              disabled={loading}
            />
            <button onClick={handleSend} disabled={loading || !input.trim()}>
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatbotWidget;