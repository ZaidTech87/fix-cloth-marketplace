import React, { useEffect, useRef } from 'react';
import { useCall } from '../context/CallContext';
import { getMediaUrl } from '../services/api';
import {
  FaPhone,
  FaPhoneSlash,
  FaVideo,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideoSlash,
} from 'react-icons/fa';
import './CallModal.css';

const CallModal = () => {
  const {
    callStatus,
    callType,
    peerInfo,
    localStream,
    remoteStream,
    muted,
    cameraOff,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
  } = useCall();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  if (callStatus === 'idle') return null;

  const isVideo = callType === 'video';

  return (
    <div className="call-overlay">
      {callStatus === 'incoming' && (
        <div className="call-card">
          <div className="call-avatar-ring">
            {peerInfo?.profileImage ? (
              <img src={getMediaUrl(peerInfo.profileImage)} alt={peerInfo.name} />
            ) : (
              <div className="call-avatar-placeholder">
                {peerInfo?.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h2>{peerInfo?.name}</h2>
          <p>Incoming {isVideo ? 'video' : 'voice'} call...</p>
          <div className="call-actions">
            <button className="call-btn reject" onClick={rejectCall}>
              <FaPhoneSlash />
            </button>
            <button className="call-btn accept" onClick={acceptCall}>
              {isVideo ? <FaVideo /> : <FaPhone />}
            </button>
          </div>
        </div>
      )}

      {callStatus === 'outgoing' && (
        <div className="call-card">
          <div className="call-avatar-ring pulsing">
            {peerInfo?.profileImage ? (
              <img src={getMediaUrl(peerInfo.profileImage)} alt={peerInfo.name} />
            ) : (
              <div className="call-avatar-placeholder">
                {peerInfo?.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h2>{peerInfo?.name}</h2>
          <p>Calling...</p>
          <div className="call-actions">
            <button className="call-btn reject" onClick={endCall}>
              <FaPhoneSlash />
            </button>
          </div>
        </div>
      )}

      {callStatus === 'connected' && (
        <div className={`call-connected ${isVideo ? 'video-mode' : 'audio-mode'}`}>
          {isVideo ? (
            <>
              <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
              <video ref={localVideoRef} autoPlay playsInline muted className="local-video" />
            </>
          ) : (
            <>
              <audio ref={remoteAudioRef} autoPlay />
              <div className="call-avatar-ring large">
                {peerInfo?.profileImage ? (
                  <img src={getMediaUrl(peerInfo.profileImage)} alt={peerInfo.name} />
                ) : (
                  <div className="call-avatar-placeholder">
                    {peerInfo?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <h2>{peerInfo?.name}</h2>
              <p>Voice call in progress</p>
            </>
          )}

          <div className="call-controls-bar">
            <button className="call-control-btn" onClick={toggleMute}>
              {muted ? <FaMicrophoneSlash /> : <FaMicrophone />}
            </button>
            {isVideo && (
              <button className="call-control-btn" onClick={toggleCamera}>
                {cameraOff ? <FaVideoSlash /> : <FaVideo />}
              </button>
            )}
            <button className="call-btn reject" onClick={endCall}>
              <FaPhoneSlash />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallModal;