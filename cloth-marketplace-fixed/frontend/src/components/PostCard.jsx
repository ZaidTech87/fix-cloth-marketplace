import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postAPI } from '../services/api';
import { FaMapMarkerAlt, FaTrash } from 'react-icons/fa';
import './PostCard.css';
import { postAPI, getMediaUrl } from '../services/api';
// ===== FB STYLE DATE =====
const getTimeAgo = (dateInput) => {
  if (!dateInput) return '';

  let postDate;

  if (Array.isArray(dateInput)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateInput;
    postDate = new Date(year, month - 1, day, hour, minute, second);
  } else {
    postDate = new Date(dateInput);
  }

  if (isNaN(postDate.getTime())) return '';

  const now         = new Date();
  const diffMs      = now - postDate;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours   = Math.floor(diffMinutes / 60);
  const diffDays    = Math.floor(diffHours / 24);
  const diffWeeks   = Math.floor(diffDays / 7);
  const diffMonths  = Math.floor(diffDays / 30);
  const diffYears   = Math.floor(diffDays / 365);

  const timeStr = postDate.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true
  });

  if (diffSeconds < 60)  return 'Just now';
  if (diffMinutes < 60)  return `${diffMinutes}m ago`;
  if (diffHours < 24)    return `${diffHours}h ago`;
  if (diffDays === 1)    return `Yesterday at ${timeStr}`;
  if (diffDays < 7) {
    const day = postDate.toLocaleDateString('en-IN', { weekday: 'long' });
    return `${day} at ${timeStr}`;
  }
  if (diffWeeks < 4)     return `${diffWeeks}w ago`;
  if (diffMonths < 12)   return `${diffMonths}mo ago`;
  return `${diffYears}y ago`;
};


// ✅ Title ke liye alag helper — crash nahi karega
const getFullDate = (dateInput) => {
  if (!dateInput) return '';
  try {
    let d;
    if (Array.isArray(dateInput)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = dateInput;
      d = new Date(year, month - 1, day, hour, minute, second);
    } else {
      d = new Date(dateInput);
    }
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString('en-IN');
  } catch {
    return '';
  }
};

const MAX_LENGTH = 120;

const PostCard = ({ post, onPostDeleted, showDelete = false }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [previewMedia, setPreviewMedia] = useState(null);

  const userName         = post.userName         || 'Unknown';
  const userLocation     = post.userLocation     || '';
  const userProfileImage = post.userProfileImage || null;
  const userId           = post.userId;

  const description = post.description || '';
  const isLong      = description.length > MAX_LENGTH;
  const displayText = expanded
    ? description
    : description.slice(0, MAX_LENGTH);

  const isOwnPost = Number(currentUser?.userId) === Number(userId);

  const handleDelete = async () => {
    setDeleting(true);

    try {
      await postAPI.deletePost(post.id);

      if (onPostDeleted) {
        onPostDeleted(post.id);
      }

      setShowDeleteModal(false);
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete post. Please try again.");
    } finally {
      setDeleting(false);
    }
  };
  return (

    <div className="post-card">

      {/* ===== HEADER ===== */}
      <div className="post-header">
        <div
          className="post-user-info"
          onClick={() => navigate(`/profile/${userId}`)}
          style={{ cursor: 'pointer' }}
        >
          {/* Avatar */}
          <div className="post-avatar">
            {userProfileImage ? (
              <img
              src={getMediaUrl(x)}
                alt={userName}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="avatar-placeholder"
              style={{ display: userProfileImage ? 'none' : 'flex' }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Name + Location + Date */}
          <div className="post-user-details">
            <span className="post-username">{userName}</span>
            <span className="post-meta">
              {userLocation && (
                <>
                  <FaMapMarkerAlt style={{ fontSize: '10px' }} />
                  <span>{userLocation}</span>
                  <span className="meta-dot"> • </span>
                </>
              )}

              <span
                className="post-date"
                title={getFullDate(post.createdAt)}
              >
                {getTimeAgo(post.createdAt)}
              </span>
            </span>
          </div>
        </div>


        {showDelete && isOwnPost && (
        <button
          className="delete-icon-btn"
          onClick={() => setShowDeleteModal(true)}
          disabled={deleting}
          title="Delete post"
        >
          <FaTrash />
        </button>
        )}
      </div>

      {/* ===== DESCRIPTION ===== */}
      {description && (
        <div className="post-description">
          <p>
            {displayText}
            {isLong && !expanded && '... '}
            {isLong && (
              <span
                className="see-more"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? 'See less' : 'See more'}
              </span>
            )}
          </p>
        </div>
      )}

      {/* ===== MEDIA ===== */}
      {post.mediaUrl && (
        <div className="post-media">
          {post.mediaType === 'video' ? (
           <video
             src={getMediaUrl(e.mediaUrl)}
               controls
               className="post-video"
               onClick={() => setPreviewMedia("video")}
           />
          ) : (
            <img
                src={getMediaUrl(e.mediaUrl)}
                alt="Post media"
                className="post-image"
                onClick={() => setPreviewMedia("image")}
                style={{ cursor: "zoom-in" }}
            />
          )}
        </div>
      )}

      {/* ===== PRODUCT INFO ===== */}
      <div className="post-product-info">
        {post.clothType && (
          <span>Type: <strong>{post.clothType}</strong></span>
        )}
        {post.price && (
          <span>Price: <strong>₹{post.price}</strong></span>
        )}
        {post.quantity && (
          <span>Quantity: <strong>{post.quantity} units</strong></span>
        )}
      </div>

      {/* ===== CONNECT BUTTON ===== */}
      {(!showDelete || !isOwnPost) && (
        <button
          className="connect-btn"
          onClick={() => navigate(`/chat/${userId}`)}
        >
          Connect
        </button>
      )}

{showDeleteModal && (
  <div
    className="delete-modal-overlay"
    onClick={() => setShowDeleteModal(false)}
  >

{previewMedia && (
  <div
    className="media-preview-overlay"
    onClick={() => setPreviewMedia(null)}
  >
    <button
      className="close-preview"
      onClick={() => setPreviewMedia(null)}
    >
      ✕
    </button>

    {previewMedia === "image" ? (
      <img
       src={getMediaUrl(e.mediaUrl)}
        className="preview-image"
        onClick={(e) => e.stopPropagation()}
        alt="Preview"
      />
    ) : (
      <video
        src={getMediaUrl(e.mediaUrl)}
        controls
        autoPlay
        className="preview-video"
        onClick={(e) => e.stopPropagation()}
      />
    )}
  </div>
)}

    <div
      className="delete-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <h3>Delete Post</h3>

      <p>Are you sure you want to delete this post?</p>

      <div className="delete-modal-buttons">
        <button
          className="cancel-btn"
          onClick={() => setShowDeleteModal(false)}
        >
          Cancel
        </button>

        <button
          className="confirm-delete-btn"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default PostCard;