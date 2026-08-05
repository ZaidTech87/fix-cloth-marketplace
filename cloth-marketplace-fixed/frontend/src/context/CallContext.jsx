import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { useAuth } from './AuthContext';

const CallContext = createContext(null);

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within CallProvider');
  }
  return context;
};

import { WS_BASE_URL } from '../services/api';

// Note: server.servlet.context-path=/api hai, isliye /ws bhi /api ke andar hi hai
const WS_URL = WS_BASE_URL;

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const CallProvider = ({ children }) => {
  const { user } = useAuth();

  // idle | outgoing | incoming | connected
  const [callStatus, setCallStatus] = useState('idle');
  const [callType, setCallType] = useState(null); // 'audio' | 'video'
  const [peerInfo, setPeerInfo] = useState(null); // { id, name, profileImage }
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  const stompRef = useRef(null);
  const pcRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const incomingOfferRef = useRef(null);
  const callStatusRef = useRef('idle');

  useEffect(() => {
    callStatusRef.current = callStatus;
  }, [callStatus]);

  const sendSignal = (signal) => {
    if (stompRef.current && stompRef.current.connected) {
      stompRef.current.send('/app/call/signal', {}, JSON.stringify(signal));
    }
  };

  const cleanupCall = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    setLocalStream((prev) => {
      if (prev) prev.getTracks().forEach((t) => t.stop());
      return null;
    });
    setRemoteStream(null);
    setPeerInfo(null);
    setCallType(null);
    setCallStatus('idle');
    setMuted(false);
    setCameraOff(false);
    pendingCandidatesRef.current = [];
    incomingOfferRef.current = null;
  };

  const createPeerConnection = (targetUserId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({
          type: 'ice-candidate',
          fromUserId: user.userId,
          toUserId: targetUserId,
          payload: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    pcRef.current = pc;
    return pc;
  };

  const getMedia = async (isVideo) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: isVideo ? { width: 480, height: 360 } : false,
    });
    setLocalStream(stream);
    return stream;
  };

  // ---- Server se aane wale signaling messages handle karo ----
  const handleSignal = async (signal) => {
    switch (signal.type) {
      case 'call-invite': {
        if (callStatusRef.current !== 'idle') {
          // Pehle se kisi call pe hain, dusri call auto-reject kar do
          sendSignal({ type: 'call-reject', fromUserId: user.userId, toUserId: signal.fromUserId });
          return;
        }
        incomingOfferRef.current = signal.payload;
        setCallType(signal.callType);
        setPeerInfo({ id: signal.fromUserId, name: signal.fromUserName });
        setCallStatus('incoming');
        break;
      }
      case 'call-answer': {
        if (pcRef.current) {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(signal.payload));
          pendingCandidatesRef.current.forEach((c) => pcRef.current.addIceCandidate(new RTCIceCandidate(c)));
          pendingCandidatesRef.current = [];
        }
        setCallStatus('connected');
        break;
      }
      case 'ice-candidate': {
        if (pcRef.current && pcRef.current.remoteDescription) {
          try {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(signal.payload));
          } catch (e) {
            console.error('ICE candidate error:', e);
          }
        } else {
          pendingCandidatesRef.current.push(signal.payload);
        }
        break;
      }
      case 'call-reject': {
        cleanupCall();
        break;
      }
      case 'call-end': {
        cleanupCall();
        break;
      }
      default:
        break;
    }
  };

  // Stale closure se bachne ke liye ref se latest handler call karte hain
  const handleSignalRef = useRef(handleSignal);
  useEffect(() => {
    handleSignalRef.current = handleSignal;
  });

  // ---- Signaling socket se connect (ek baar, login hote hi) ----
  useEffect(() => {
    if (!user) return;

    const socket = new SockJS(WS_URL);
    const stompClient = Stomp.over(socket);
    stompClient.debug = null;

    stompClient.connect({}, () => {
      stompClient.subscribe(`/topic/call/${user.userId}`, (message) => {
        const signal = JSON.parse(message.body);
        handleSignalRef.current(signal);
      });
    });

    stompRef.current = stompClient;

    return () => {
      try {
        stompClient.disconnect();
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  const startCall = async (peer, type) => {
    try {
      setCallType(type);
      setPeerInfo(peer);
      setCallStatus('outgoing');

      const stream = await getMedia(type === 'video');
      const pc = createPeerConnection(peer.id);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      sendSignal({
        type: 'call-invite',
        fromUserId: user.userId,
        toUserId: peer.id,
        fromUserName: user.name,
        callType: type,
        payload: offer,
      });
    } catch (err) {
      console.error('Error starting call:', err);
      alert('Camera/microphone access nahi mila. Permissions check karo.');
      cleanupCall();
    }
  };

  const acceptCall = async () => {
    try {
      const isVideo = callType === 'video';
      const stream = await getMedia(isVideo);
      const pc = createPeerConnection(peerInfo.id);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(incomingOfferRef.current));
      pendingCandidatesRef.current.forEach((c) => pc.addIceCandidate(new RTCIceCandidate(c)));
      pendingCandidatesRef.current = [];

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      sendSignal({
        type: 'call-answer',
        fromUserId: user.userId,
        toUserId: peerInfo.id,
        payload: answer,
      });

      setCallStatus('connected');
    } catch (err) {
      console.error('Error accepting call:', err);
      alert('Camera/microphone access nahi mila. Permissions check karo.');
      rejectCall();
    }
  };

  const rejectCall = () => {
    if (peerInfo) {
      sendSignal({ type: 'call-reject', fromUserId: user.userId, toUserId: peerInfo.id });
    }
    cleanupCall();
  };

  const endCall = () => {
    if (peerInfo) {
      sendSignal({ type: 'call-end', fromUserId: user.userId, toUserId: peerInfo.id });
    }
    cleanupCall();
  };

  const toggleMute = () => {
    if (localStream) {
      const newMuted = !muted;
      localStream.getAudioTracks().forEach((t) => (t.enabled = !newMuted));
      setMuted(newMuted);
    }
  };
console.log("WebSocket Connected");
  const toggleCamera = () => {
    if (localStream) {
      const newCameraOff = !cameraOff;
      localStream.getVideoTracks().forEach((t) => (t.enabled = !newCameraOff));
      setCameraOff(newCameraOff);
    }
  };

  return (
    <CallContext.Provider
      value={{
        callStatus,
        callType,
        peerInfo,
        localStream,
        remoteStream,
        muted,
        cameraOff,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleCamera,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};