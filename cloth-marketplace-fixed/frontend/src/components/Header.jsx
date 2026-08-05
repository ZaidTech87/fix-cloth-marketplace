import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaHome,
  FaUser,
  FaComments,
  FaPlus,
  FaSignOutAlt,
  FaSearch,
  FaTimes
} from 'react-icons/fa';
// import { userAPI } from '../services/api';
import { userAPI, getMediaUrl } from '../services/api';
import { messageAPI } from '../services/api';

import './Header.css';

const Header = () => {

  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchBoxRef = useRef(null);

 const confirmLogout = () => {
   logout();
   navigate('/login');
 };

  const handleFeedClick = (e) => {
    e.preventDefault();
    // navigate() se location.key change hoti hai
    // Feed.jsx usse detect karke automatically refresh ho jaata hai
    navigate('/');
  };

  useEffect(() => {
    if (!user?.userId) return;

    const loadUnread = async () => {
      try {
        const res = await messageAPI.getUnreadCount(user.userId);
        setUnreadCount(res.data.count || 0);
      } catch (error) {
        console.error("Error loading unread count:", error);
      }
    };

    loadUnread();

    const interval = setInterval(loadUnread, 5000);

    return () => clearInterval(interval);
  }, [user?.userId]);

// Debounced search-as-you-type
useEffect(() => {
  const query = searchQuery.trim();

  if (query.length === 0) {
    setSuggestions([]);
    setSearching(false);
    return;
  }

  setSearching(true);

  const timer = setTimeout(async () => {
    try {
      const response = await userAPI.searchUsers(query);
      setSuggestions(response.data || []);
    } catch (error) {
      console.error("User search failed:", error);
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  }, 350);

  return () => clearTimeout(timer);
}, [searchQuery]);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      searchBoxRef.current &&
      !searchBoxRef.current.contains(event.target)
    ) {
      setShowSuggestions(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () =>
    document.removeEventListener("mousedown", handleClickOutside);
}, []);

  const handleSelectUser = (selectedUser) => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    navigate(`/profile/${selectedUser.id}`);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
  };

  return (
     <>
    <header className="header">

      <div className="header-container">

        <div className="header-left">

          <Link to="/" className="logo">

            <span className="logo-icon">
              🧵
            </span>

            <span className="logo-text">
              ClothMarket
            </span>

          </Link>

        </div>

        <nav className="header-nav">

          <Link
            to="/"
            className={`nav-item ${location.pathname === "/" ? "active" : ""}`}
            onClick={handleFeedClick}
          >
            <FaHome />
            <span>Feed</span>
          </Link>

          <Link
            to="/create-post"
            className={`nav-item ${location.pathname === "/create-post" ? "active" : ""}`}
          >
            <FaPlus />
            <span>Post</span>
          </Link>

          <Link
            to="/messages"
            className={`nav-item ${location.pathname === "/messages" ? "active" : ""}`}
          >
            <span className="nav-icon-wrap">
              <FaComments />
              {unreadCount > 0 && (
                <span className="nav-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </span>
            <span>Messages</span>
          </Link>

          <Link
            to={`/profile/${user?.userId}`}
            className={`nav-item ${location.pathname.includes("/profile") ? "active" : ""}`}
          >
            <FaUser />
            <span>Profile</span>
          </Link>

        </nav>

        <div className="header-right">

          <div className="user-info">

            <span className="user-name">
              {user?.name}
            </span>

            <span className="user-location">
              {user?.location}
            </span>

          </div>

         <button
           onClick={() => setShowLogoutConfirm(true)}
           className="logout-btn"
         >
           <FaSignOutAlt />
         </button>

        </div>

      </div>

      <div className="header-search-row">
        <div className="search-box" ref={searchBoxRef}>
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search users by name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={clearSearch} type="button">
              <FaTimes />
            </button>
          )}

          {showSuggestions && searchQuery.trim().length > 0 && (
            <div className="search-suggestions">
              {searching && (
                <div className="search-suggestion-empty">Searching...</div>
              )}

              {!searching && suggestions.length === 0 && (
                <div className="search-suggestion-empty">No users found</div>
              )}

              {!searching && suggestions.map((suggestedUser) => (
                <div
                  key={suggestedUser.id}
                  className="search-suggestion-item"
                  onClick={() => handleSelectUser(suggestedUser)}
                >
                  {suggestedUser.profileImage ? (
                   <img
                     src={getMediaUrl(suggestedUser.profileImage)}
                     alt={suggestedUser.name}
                     className="search-suggestion-avatar"
                   />
                  ) : (
                    <div className="search-suggestion-avatar search-suggestion-avatar-placeholder">
                      <FaUser />
                    </div>
                  )}
                  <div className="search-suggestion-info">
                    <span className="search-suggestion-name">{suggestedUser.name}</span>
                    <span className="search-suggestion-location">{suggestedUser.location}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </header>
    {showLogoutConfirm && (
      <div className="logout-confirm-overlay">
        <div className="logout-confirm-box">
          <h3>Log out?</h3>
          <p>Are you sure you want to log out of your account?</p>
          <div className="logout-confirm-actions">
            <button
              className="logout-confirm-cancel"
              onClick={() => setShowLogoutConfirm(false)}
            >
              Cancel
            </button>
            <button
              className="logout-confirm-ok"
              onClick={confirmLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    )}
 </>
  );
};

export default Header;