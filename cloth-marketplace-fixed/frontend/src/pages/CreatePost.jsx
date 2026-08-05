import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postAPI } from '../services/api';
import Header from '../components/Header';
import { FaImage, FaVideo, FaTimes } from 'react-icons/fa';
import './CreatePost.css';

const CreatePost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    description: '',
    price: '',
    quantity: '',
    clothType: '',
  });
  
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      
      // Determine media type
      if (file.type.startsWith('image/')) {
        setMediaType('image');
      } else if (file.type.startsWith('video/')) {
        setMediaType('video');
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const postData = {
        description: formData.description,
        price: formData.price ? parseFloat(formData.price) : null,
        quantity: formData.quantity ? parseInt(formData.quantity) : null,
        clothType: formData.clothType || null,
      };

      await postAPI.createPost(postData, mediaFile);
      navigate('/');
    } catch (err) {
      setError('Failed to create post. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-page">
      <Header />
      
      <div className="create-post-container">
        <div className="create-post-card">
          <h1 className="create-post-title">Create New Post</h1>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="create-post-form">
            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                placeholder="Tell buyers about your cloth product..."
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Cloth Type</label>
                <input
                  type="text"
                  name="clothType"
                  placeholder="e.g., Cotton, Silk, Linen"
                  value={formData.clothType}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Price(₹)/unit </label>
                <input
                  type="number"
                  name="price"
                  placeholder="Price per unit"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Available Quantity (units)</label>
              <input
                type="number"
                name="quantity"
                placeholder="Available quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Add Photo or Video</label>
              
              {!mediaPreview ? (
                <div className="media-upload-area">
                  <input
                    type="file"
                    id="media-input"
                    accept="image/*,video/*"
                    onChange={handleMediaChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="media-input" className="media-upload-label">
                    <FaImage className="upload-icon" />
                    <FaVideo className="upload-icon" />
                    <p>Click to upload image or video</p>
                    <span>JPG, PNG, MP4, WEBM (Max 50MB)</span>
                  </label>
                </div>
              ) : (
                <div className="media-preview">
                  <button
                    type="button"
                    className="remove-media-btn"
                    onClick={handleRemoveMedia}
                  >
                    <FaTimes />
                  </button>
                  {mediaType === 'image' ? (
                    <img src={mediaPreview} alt="Preview" />
                  ) : (
                    <video src={mediaPreview} controls />
                  )}
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-outline"
                onClick={() => navigate('/')}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
