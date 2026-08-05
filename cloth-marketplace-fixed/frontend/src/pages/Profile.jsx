import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, postAPI, getMediaUrl } from '../services/api';
import Header from '../components/Header';
import PostCard from '../components/PostCard';
import { FaMapMarkerAlt, FaPhone, FaCamera } from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadProfile();
    setPreviewImage(null);
  }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const userResponse = await userAPI.getUser(userId);
      setProfileUser(userResponse.data);
      const postsResponse = await postAPI.getUserPosts(userId);
      setPosts(postsResponse.data);
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfileUser(null);
    } finally {
      setLoading(false);
    }
  };

  const isOwnProfile = currentUser?.userId === parseInt(userId, 10);

  // ✅ Delete handler — sahi jagah (function ke andar, return ke bahar)
  const handlePostDeleted = (deletedPostId) => {
    setPosts(prev => prev.filter(p => p.id !== deletedPostId));
  };

  const handleAvatarClick = () => {
    if (isOwnProfile && !uploadingImage) {
      fileInputRef.current?.click();
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreviewImage(URL.createObjectURL(file));
    setUploadingImage(true);

    try {
      const response = await userAPI.updateProfileImage(userId, file);
      const updatedUser = response.data;
      setProfileUser(updatedUser);
      if (isOwnProfile) {
        updateUser({ profileImage: updatedUser.profileImage });
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      alert('Failed to upload profile picture. Please try again.');
      setPreviewImage(null);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <Header />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="profile-page">
        <Header />
        <div className="error-container">
          <h2>User not found</h2>
        </div>
      </div>
    );
  }

  const avatarSrc = previewImage
    ? previewImage
    : profileUser.profileImage
    ? getMediaUrl(profileUser.profileImage)
    : null;

  return (
    <div className="profile-page">
      <Header />

      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-cover"></div>

          <div className="profile-info">
            <div className="profile-avatar-wrapper">
              <div
                className={`profile-avatar ${isOwnProfile ? 'editable' : ''}`}
                onClick={handleAvatarClick}
                title={isOwnProfile ? 'Change profile photo' : ''}
              >
                {avatarSrc ? (
                  <img src={avatarSrc} alt={profileUser.name} />
                ) : (
                  <div className="avatar-placeholder-large">
                    {profileUser.name?.charAt(0).toUpperCase()}
                  </div>
                )}

                {isOwnProfile && (
                  <div className="avatar-overlay">
                    {uploadingImage ? (
                      <span className="avatar-spinner"></span>
                    ) : (
                      <FaCamera />
                    )}
                  </div>
                )}
              </div>

              {isOwnProfile && (
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              )}
            </div>

            <div className="profile-details">
              <h1 className="profile-name">{profileUser.name}</h1>
              <div className="profile-meta">
                {profileUser.location && (
                  <div className="meta-item">
                    <FaMapMarkerAlt />
                    <span>{profileUser.location}</span>
                  </div>
                )}
                {profileUser.mobile && isOwnProfile && (
                  <div className="meta-item">
                    <FaPhone />
                    <span>{profileUser.mobile}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="profile-posts">
          <h2 className="section-title">
            {isOwnProfile ? 'My Posts' : 'Posts'} ({posts.length})
          </h2>

          {posts.length === 0 ? (
            <div className="empty-posts">
              <div className="empty-icon">📦</div>
              <h3>No posts yet</h3>
              <p>
                {isOwnProfile
                  ? 'Start sharing your cloth products!'
                  : "This user hasn't posted anything yet."}
              </p>
            </div>
          ) : (
            <div className="posts-grid">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  showDelete={isOwnProfile}
                  onPostDeleted={handlePostDeleted}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;