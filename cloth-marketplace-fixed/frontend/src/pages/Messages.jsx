import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { messageAPI, getMediaUrl } from '../services/api';
import Header from '../components/Header';
import './Messages.css';

const formatChatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
};

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inbox, setInbox] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInbox();
    // Recent messages/unread badges refresh karte rehna, WhatsApp jaisa feel ke liye
    const interval = setInterval(loadInbox, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadInbox = async () => {
    try {
      const response = await messageAPI.getInbox(user.userId);
      setInbox(response.data);
    } catch (error) {
      console.error('Error loading inbox:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = (chatUserId) => {
    navigate(`/chat/${chatUserId}`);
  };

  if (loading) {
    return (
      <div className="messages-page">
        <Header />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-page">
      <Header />

      <div className="messages-container">
        <div className="messages-header">
          <h1>Messages</h1>
        </div>

        {inbox.length === 0 ? (
          <div className="empty-chats">
            <div className="empty-icon">💬</div>
            <h2>No conversations yet</h2>
            <p>Start chatting by clicking "Connect" on any post!</p>
          </div>
        ) : (
          <div className="chat-list">
            {inbox.map((item) => (
              <div
                key={item.user.id}
                className={`chat-item ${item.unreadCount > 0 ? 'has-unread' : ''}`}
                onClick={() => handleChatClick(item.user.id)}
              >
                <div className="chat-avatar">
                  {item.user.profileImage ? (
                    <img src={getMediaUrl(item.user.profileImage)} alt={item.user.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {item.user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="chat-info">
                  <div className="chat-info-top">
                    <h3 className="chat-name">{item.user.name}</h3>
                    <span className="chat-time">{formatChatTime(item.lastMessageTime)}</span>
                  </div>
                  <div className="chat-info-bottom">
                    <p className="chat-last-message">
                      {item.lastMessageMine && <span className="you-prefix">You: </span>}
                      {item.lastMessageType === 'voice' ? '🎤 Voice message' : item.lastMessage}
                    </p>
                    {item.unreadCount > 0 && (
                      <span className="unread-badge">{item.unreadCount}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;