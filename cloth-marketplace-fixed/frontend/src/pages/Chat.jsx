import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { messageAPI, userAPI, getMediaUrl, WS_BASE_URL } from '../services/api';
import { FaArrowLeft, FaPaperPlane, FaMicrophone, FaStop, FaPhone, FaVideo } from 'react-icons/fa';
import { useCall } from '../context/CallContext';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import './Chat.css';

const Chat = () => {
  const { receiverId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { startCall } = useCall();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [receiverUser, setReceiverUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);


  const messagesEndRef = useRef(null);
  const audioRefsMap = useRef({}); // { messageId: <audio> element }

  const audioChunksRef = useRef([]);
  const mediaRecorderRef = useRef(null);


  const stompRef = useRef(null);

  useEffect(() => {
    loadChat();

    // STEP 6 FIX: pehle sirf har 3 second polling se naya message aata tha.
    // Ab WebSocket (STOMP over SockJS) se real-time message milta hai -
    // koi delay nahi, aur server load bhi kam. Polling ab sirf ek slow
    // safety-net ke roop me rakha hai (agar WS connection kabhi drop ho jaye).
    const socket = new SockJS(WS_BASE_URL);
    const stompClient = Stomp.over(socket);
    stompClient.debug = null; // console spam band
    stompRef.current = stompClient;

    stompClient.connect({}, () => {
      stompClient.subscribe(`/topic/messages/${user.userId}`, (frame) => {
        const incoming = JSON.parse(frame.body);
        const isThisConversation =
          String(incoming.senderId) === String(receiverId) ||
          String(incoming.receiverId) === String(receiverId);
        if (isThisConversation) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev;
            return [...prev, incoming];
          });
          if (String(incoming.senderId) === String(receiverId)) {
            messageAPI.markAsRead(receiverId).catch(() => {});
          }
        }
      });
    });

    const fallbackPoll = setInterval(loadMessages, 15000); // slow safety-net poll

    return () => {
      clearInterval(fallbackPoll);
      if (stompRef.current && stompRef.current.connected) {
        stompRef.current.disconnect();
      }
    };
  }, [receiverId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

const handleAudioPlay = (playingMsgId) => {
  Object.entries(audioRefsMap.current).forEach(([msgId, audioEl]) => {
    if (String(msgId) !== String(playingMsgId) && audioEl && !audioEl.paused) {
      audioEl.pause();
    }
  });
};

  const loadChat = async () => {
    try {
      const userResponse = await userAPI.getUser(receiverId);
      setReceiverUser(userResponse.data);
      await loadMessages();
      await messageAPI.markAsRead(receiverId);
    } catch (error) {
      console.error('Error loading chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await messageAPI.getChatMessages(receiverId);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await messageAPI.sendTextMessage(receiverId, newMessage);
      setNewMessage('');
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], 'voice.webm', { type: 'audio/webm' });

        try {
          await messageAPI.sendVoiceMessage(receiverId, audioFile);
          await loadMessages();
        } catch (error) {
          console.error('Error sending voice message:', error);
        }

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Call buttons chat-header-user ke andar nahi hain, isliye ye click
  // profile navigation ko trigger nahi karega — but safety ke liye
  // stopPropagation bhi laga rahe hain.
  const handleCall = (e, type) => {
    e.stopPropagation();
    startCall(
      { id: receiverId, name: receiverUser?.name, profileImage: receiverUser?.profileImage },
      type
    );
  };

  if (loading) {
    return (
      <div className="chat-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      {/* Chat Header */}
      <div className="chat-header">
        <button className="back-btn" onClick={() => navigate('/messages')}>
          <FaArrowLeft />
        </button>

        <div className="chat-header-user" onClick={() => navigate(`/profile/${receiverId}`)}>
          <div className="chat-header-avatar">
            {receiverUser?.profileImage ? (
              <img src={getMediaUrl(receiverUser.profileImage)} alt={receiverUser.name} />
            ) : (
              <div className="avatar-placeholder">
                {receiverUser?.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="chat-header-info">
            <h2>{receiverUser?.name}</h2>
            <p>{receiverUser?.location}</p>
          </div>
        </div>

        <div className="chat-header-actions">
          <button
            type="button"
            className="call-icon-btn"
            onClick={(e) => handleCall(e, 'audio')}
            title="Voice call"
          >
            <FaPhone />
          </button>
          <button
            type="button"
            className="call-icon-btn"
            onClick={(e) => handleCall(e, 'video')}
            title="Video call"
          >
            <FaVideo />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="messages-area">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <p>Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${Number(msg.senderId) === Number(user.userId) ? 'sent' : 'received'}`}
            >
              {msg.messageType === 'text' ? (
                <div className="message-bubble">
                  <p>{msg.message}</p>
                  <span className="message-time">{formatTime(msg.createdAt)}</span>
                </div>
              ) : (
               <div className="message-bubble voice-message">
                 <audio
                   controls
                   src={getMediaUrl(msg.voiceUrl)}
                   ref={(el) => {
                     if (el) audioRefsMap.current[msg.id] = el;
                   }}
                   onPlay={() => handleAudioPlay(msg.id)}
                 />
                 <span className="message-time">{formatTime(msg.createdAt)}</span>
               </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <form onSubmit={handleSendMessage} className="chat-input-form">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending || recording}
          />

          <div className="input-actions">
            {!recording ? (
              <>
                <button
                  type="button"
                  className="voice-btn"
                  onClick={startRecording}
                  disabled={sending}
                >
                  <FaMicrophone />
                </button>
                <button
                  type="submit"
                  className="send-btn"
                  disabled={!newMessage.trim() || sending}
                >
                  <FaPaperPlane />
                </button>
              </>
            ) : (
              <button
                type="button"
                className="stop-btn"
                onClick={stopRecording}
              >
                <FaStop /> Stop Recording
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;