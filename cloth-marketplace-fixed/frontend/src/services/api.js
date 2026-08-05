import axios from 'axios';

// STEP 4 FIX: hardcoded localhost ki jagah env var se URL, taaki production
// build me sahi backend domain use ho (Vite: VITE_API_BASE_URL in .env)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
// STEP 4 FIX: WebSocket endpoint bhi ab env se, hardcoded localhost nahi
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || `${API_BASE_URL}/ws`;

export const getMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url; // Cloudinary URLs are already absolute
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// STEP 1/2 FIX (frontend side): pehle token localStorage me save toh hota
// tha, lekin kisi bhi API request ke saath bheja hi nahi jaata tha - isliye
// backend ka naya JWT-verification kaam nahi karega jab tak yeh interceptor
// har request par "Authorization: Bearer <token>" header na jode.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Agar token expire/invalid ho gaya (401), user ko login page pe bhej do.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ================= AUTH APIs =================

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (mobile) =>
    api.post('/auth/forgot-password', { mobile }),
  resetPassword: (data) =>
    api.post('/auth/reset-password', data),
};

// ================= USER APIs =================

export const userAPI = {
  getUser: (userId) => api.get(`/users/${userId}`),

  getUserByMobile: (mobile) =>
    api.get(`/users/mobile/${mobile}`),

  searchUsers: (name) =>
    api.get('/users/search', { params: { name } }),

  updateProfileImage: (userId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post(
      `/users/${userId}/profile-image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },
};

// ================= POST APIs =================

export const postAPI = {

  // STEP 2 FIX: userId ab bhejna zaroori nahi - backend JWT token se
  // khud pehchan leta hai ki post kis user ka hai.
  createPost: (postData, file) => {
    const formData = new FormData();

    formData.append(
      'postData',
      JSON.stringify(postData)
    );

    if (file) {
      formData.append('file', file);
    }

    return api.post(
      '/posts/create',
      formData,
      {
        headers: {
          'Content-Type':
            'multipart/form-data',
        },
      }
    );
  },

  getFeed: (
    page = 0,
    size = 10
  ) =>
    api.get(
      `/posts/feed?page=${page}&size=${size}`
    ),

  getUserPosts: (userId) =>
    api.get(`/posts/user/${userId}`),

  getPost: (postId) =>
    api.get(`/posts/${postId}`),

  // STEP 2 FIX: userId ab query param me nahi - backend token se hi
  // verify karta hai ki yeh post tumhari hi hai.
  deletePost: (postId) =>
    api.delete(`/posts/${postId}`),
};

// ================= MESSAGE APIs =================

export const messageAPI = {

  // STEP 2 FIX: senderId ab bhejna zaroori nahi (backend token se leta hai)
  sendTextMessage: (
    receiverId,
    message
  ) =>
    api.post(
      '/messages/send/text',
      null,
      {
        params: {
          receiverId,
          message,
        },
      }
    ),

  sendVoiceMessage: (
    receiverId,
    voiceFile
  ) => {

    const formData = new FormData();

    formData.append(
      'receiverId',
      receiverId
    );

    formData.append(
      'file',
      voiceFile
    );

    return api.post(
      '/messages/send/voice',
      formData,
      {
        headers: {
          'Content-Type':
            'multipart/form-data',
        },
      }
    );
  },

  // STEP 2 FIX: sirf otherUserId bhejo - "main kaun hoon" token se pata chalta hai
  getChatMessages: (
    otherUserId
  ) =>
    api.get('/messages/chat', {
      params: {
        otherUserId,
      },
    }),

  getChatUsers: (userId) =>
    api.get(
      `/messages/chat-users/${userId}`
    ),
    getInbox: (userId) =>
        api.get(`/messages/inbox/${userId}`),

      getUnreadCount: (userId) =>
        api.get(`/messages/unread-count/${userId}`),

      // STEP 2 FIX: toUserId hamesha main khud hoon - backend token se le leta hai
      markAsRead: (fromUserId) =>
        api.post('/messages/mark-read', null, {
          params: { fromUserId },
        }),
};
// ================= CHATBOT API =================

export const chatbotAPI = {
  ask: (message, history) =>
    api.post('/chatbot/ask', { message, history }),
};

export default api;
