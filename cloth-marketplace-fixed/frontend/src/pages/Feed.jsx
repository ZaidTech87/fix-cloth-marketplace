
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { postAPI } from '../services/api';
import PostCard from '../components/PostCard';
import Header from '../components/Header';
import './Feed.css';

const Feed = () => {
  const location = useLocation();

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Ref se latest loading/hasMore/page track karo bina stale closure ke
  const stateRef = useRef({ loading: false, hasMore: true, page: 0 });

  const loadPosts = useCallback(async (reset = false) => {
    if (stateRef.current.loading) return;
    if (!reset && !stateRef.current.hasMore) return;

    const currentPage = reset ? 0 : stateRef.current.page;

    stateRef.current.loading = true;
    setLoading(true);

    try {
      const response = await postAPI.getFeed(currentPage, 10);
      const newPosts = response.data.content || [];

      if (newPosts.length === 0) {
        stateRef.current.hasMore = false;
        setHasMore(false);
      } else {
        if (reset) {
          setPosts(newPosts);
        } else {
          setPosts(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            return [...prev, ...newPosts.filter(p => !existingIds.has(p.id))];
          });
        }
        stateRef.current.page = currentPage + 1;
        stateRef.current.hasMore = true;
        setPage(currentPage + 1);
        setHasMore(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      stateRef.current.loading = false;
      setLoading(false);
    }
  }, []);

  // ---- FEED HEADER CLICK PE REFRESH ----
  // location.key har baar change hoti hai jab Feed link click ho
  useEffect(() => {
    stateRef.current = { loading: false, hasMore: true, page: 0 };
    setPosts([]);
    setPage(0);
    setHasMore(true);
    loadPosts(true);
  }, [location.key]);

  // ---- INFINITE SCROLL ----
  useEffect(() => {
    const handleScroll = () => {
      const nearBottom =
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100;

      if (nearBottom && !stateRef.current.loading && stateRef.current.hasMore) {
        loadPosts(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadPosts]);

  return (
    <div className="feed-page">
      <Header />
      <div className="feed-container">
        <div className="feed-content">
          {posts.length === 0 && !loading && (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h2>No posts yet</h2>
              <p>Be the first to share your cloth products!</p>
            </div>
          )}

          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {loading && (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading posts...</p>
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <div className="end-message">
              <p>You've seen all posts! 🎉</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;