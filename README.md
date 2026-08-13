# 🧵 ClothMarket — Cloth Marketplace Platform

A full-stack social marketplace for textile/cloth businesses — sellers post their products with photos/videos, buyers browse the feed and connect directly through real-time chat and voice/video calls.

**Live Demo:** [lighthearted-zabaione-eb6215.netlify.app](  http://lighthearted-zabaione-eb6215.netlify.app/)

---

## ✨ Features

- 🔐 **Secure Authentication** — JWT-based login/signup with BCrypt password hashing
- 📱 **Social Feed** — Infinite-scroll feed of cloth product posts (image/video, price, quantity)
- 💬 **Real-time Chat** — Text + voice messages via WebSocket (STOMP over SockJS)
- 📞 **Voice/Video Calls** — WebRTC-based calling between users
- 🤖 **AI Chatbot** — Domain-specific assistant (website help + textile knowledge) powered by Groq (Llama 3.3)
- 🛡️ **AI Content Moderation** — Automatic NSFW/nudity detection on image uploads via Sightengine, blocking unsafe posts before they're saved
- ☁️ **Cloud Media Storage** — Persistent image/video hosting via Cloudinary
- 🔍 **User Search** — Real-time search-as-you-type for finding other users
- 👤 **Profiles** — Editable profile with photo, location, and post history

---

## 🛠️ Tech Stack

**Backend**
- Java 21, Spring Boot 3.2
- Spring Security + JWT (jjwt)
- Spring Data JPA, MySQL
- Spring WebSocket (STOMP)
- BCrypt password hashing
- Bucket4j (rate limiting)

**Frontend**
- React 18 + Vite
- React Router
- Axios
- SockJS + StompJS (real-time chat)
- WebRTC (voice/video calls)

**Infrastructure**
- MySQL — [Aiven](https://aiven.io)
- Backend hosting — [Render](https://render.com)
- Frontend hosting — [Netlify](https://netlify.com)
- Media storage — [Cloudinary](https://cloudinary.com)
- AI Chatbot — [Groq API](https://groq.com) (Llama 3.3 70B)
- Content Moderation — [Sightengine](https://sightengine.com)

---

## 📁 Project Structure
