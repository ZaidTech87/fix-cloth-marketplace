# 🧵 ClothMarket — Digital Textile Marketplace

**ClothMarket** is a full-stack social marketplace platform designed for **local cloth sellers, textile businesses, and buyers**.

The platform digitizes the way local textile sellers showcase their products and connect directly with buyers through **social feeds, real-time messaging, voice messages, and WebRTC voice/video calls**.

It combines e-commerce-style product discovery with social networking and real-time communication to create a complete digital marketplace for the textile industry.

---

## 🚀 Live Demo

🔗 **Live Application:**
http://lighthearted-zabaione-eb6215.netlify.app/

---

## 💡 Problem Statement

Many local cloth sellers and weavers still depend on traditional methods such as physical shops, personal contacts, and offline communication to showcase their products and find buyers.

This can make it difficult to:

* Reach customers beyond the local market
* Showcase products digitally
* Communicate with buyers instantly
* Share product details remotely
* Build an online presence
* Conduct discussions before closing a deal

**ClothMarket** addresses these problems by providing a centralized digital platform where sellers can showcase textile products and communicate directly with potential buyers.

---

## ✨ Features

### 🔐 Secure Authentication

* User registration and login
* JWT-based authentication
* BCrypt password hashing
* Protected API endpoints
* Secure session management

### 📱 Social Product Feed

* Sellers can create product posts
* Upload product images and videos
* Add product price and quantity
* Infinite-scroll feed
* Buyers can browse available products
* Product-focused social marketplace experience

### 💬 Real-Time Chat

* Real-time one-to-one messaging
* WebSocket-based communication
* STOMP over SockJS
* Text messages
* Voice messages
* Instant buyer-seller communication

### 📞 Voice & Video Calling

* Real-time voice calls
* Real-time video calls
* WebRTC-based peer-to-peer communication
* Direct buyer-seller communication
* Remote discussion before closing deals

### 🤖 AI Textile Chatbot

An AI-powered chatbot designed specifically for the platform.

It can help users with:

* Textile-related questions
* Cloth and fabric knowledge
* Website-related assistance
* Platform feature guidance
* General textile marketplace queries

Powered by **Groq API with Llama 3.3**.

### 🛡️ AI Content Moderation

User-uploaded images are automatically checked for unsafe content using **Sightengine**.

The system:

1. Receives an uploaded image
2. Sends it for content analysis
3. Checks for NSFW/nudity-related content
4. Blocks unsafe content
5. Saves approved content only

This helps maintain a safer marketplace environment.

### ☁️ Cloud Media Storage

Product images and videos are stored using **Cloudinary** instead of relying on local server storage.

Benefits include:

* Persistent media storage
* Image and video hosting
* CDN-based delivery
* Better scalability

### 🔍 User Search

* Search for other users
* Real-time search-as-you-type
* Quickly find sellers and buyers
* Connect with users through profiles

### 👤 User Profiles

Users can:

* Edit profile information
* Upload profile pictures
* Add location
* View their posts
* Explore other users
* Connect with potential buyers/sellers

### ⚡ Rate Limiting

**Bucket4j** is used to control API request rates and help protect backend services from excessive requests.

---

# 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │        Users         │
                         │  Buyers / Sellers    │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   React + Vite       │
                         │      Frontend        │
                         └──────────┬───────────┘
                                    │
                    ┌───────────────┼────────────────┐
                    │               │                │
                    ▼               ▼                ▼
               REST APIs       WebSocket          WebRTC
                    │               │                │
                    ▼               ▼                ▼
             ┌────────────┐  ┌─────────────┐  ┌─────────────┐
             │ Spring Boot│  │ STOMP/SockJS│  │ Voice/Video │
             │  Backend   │  │    Chat     │  │    Calls    │
             └─────┬──────┘  └─────────────┘  └─────────────┘
                   │
          ┌────────┼───────────────┐
          │        │               │
          ▼        ▼               ▼
       MySQL   Cloudinary       Groq API
       Aiven    Media Storage    AI Chatbot
          │
          ▼
    User & Product Data
```

---

# 🛠️ Tech Stack

## Backend

* **Java 21**
* **Spring Boot 3.2**
* Spring Security
* Spring Data JPA
* Hibernate
* JWT (`jjwt`)
* BCrypt
* Spring WebSocket
* STOMP
* Bucket4j
* MySQL

## Frontend

* **React 18**
* **Vite**
* React Router
* Axios
* SockJS
* StompJS
* WebRTC

## AI & Security

* **Groq API**
* **Llama 3.3 70B**
* **Sightengine**
* JWT Authentication
* BCrypt Password Hashing
* Bucket4j Rate Limiting

## Infrastructure

* **Aiven** — MySQL database
* **Render** — Spring Boot backend hosting
* **Netlify** — React frontend hosting
* **Cloudinary** — Image/video storage

---

# 📁 Project Structure

```text
ClothMarket/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   ├── pom.xml
│   └── ...
│
├── README.md
└── ...
```

---

# 🔄 Core User Flow

```text
User Registration
       ↓
     Login
       ↓
   JWT Token
       ↓
 ┌───────────────┐
 │   Marketplace │
 └───────┬───────┘
         │
    ┌────┴─────┐
    ▼          ▼
 Browse      Create
 Products    Product Post
    │          │
    └────┬─────┘
         ▼
   Contact Seller
         │
    ┌────┴────────────┐
    ▼                 ▼
 Real-Time Chat   Voice/Video Call
    │                 │
    └────────┬────────┘
             ▼
       Deal Discussion
```

---

# 💬 Real-Time Communication

ClothMarket uses **Spring WebSocket with STOMP over SockJS** for real-time messaging.

Users can communicate through:

* Text messages
* Voice messages
* Real-time chat

For audio/video communication, the application uses **WebRTC**, enabling direct peer-to-peer communication between users.

This allows buyers and sellers to discuss products without depending entirely on external communication platforms.

---

# 🤖 AI-Powered Chatbot

The platform integrates **Groq API with Llama 3.3 70B** to provide an AI assistant.

The chatbot is designed around two primary areas:

### Textile Knowledge

Users can ask questions related to:

* Fabrics
* Textile products
* Cloth-related terminology
* General textile knowledge

### Platform Assistance

The chatbot can help users understand:

* How to use the marketplace
* Platform features
* Product-related workflows
* General website assistance

---

# 🛡️ Content Moderation Pipeline

To prevent unsafe images from being uploaded to the marketplace:

```text
User Uploads Image
        ↓
   Backend Receives
        ↓
    Sightengine
        ↓
   Content Analysis
        ↓
 ┌──────┴───────┐
 ▼              ▼
Unsafe         Safe
 ▼              ▼
Reject       Continue
                ↓
          Cloudinary
                ↓
          Save Post
```

This provides an additional safety layer before user-generated media becomes publicly available.

---

# 🔐 Security

The application implements multiple security mechanisms:

### JWT Authentication

JWT tokens are used to authenticate users and protect private API endpoints.

### BCrypt

Passwords are securely hashed using BCrypt before being stored.

### Rate Limiting

Bucket4j helps limit excessive API requests.

### Content Moderation

Sightengine is integrated to detect potentially unsafe uploaded images.

### Protected Resources

Authentication is required for operations such as creating posts, messaging, and accessing protected user functionality.

---

# ☁️ Deployment

The application uses cloud infrastructure for production deployment.

| Component          | Technology  |
| ------------------ | ----------- |
| Frontend           | Netlify     |
| Backend            | Render      |
| Database           | Aiven MySQL |
| Media Storage      | Cloudinary  |
| AI                 | Groq API    |
| Content Moderation | Sightengine |

### Production Flow

```text
React Frontend
     │
     ▼
   Netlify
     │
     ▼
Spring Boot Backend
     │
 ┌───┼─────────────┐
 ▼   ▼             ▼
MySQL Cloudinary  Groq
 │       │          │
Aiven   Media      AI
```

---

# ⚙️ Local Development

## Prerequisites

Make sure you have:

* Java 21+
* Node.js
* MySQL
* Maven
* Git

You will also need API credentials for:

* Cloudinary
* Groq
* Sightengine

---

## Backend Setup

Clone the repository:

```bash
git clone <your-github-repository-url>
```

Navigate to the backend:

```bash
cd backend
```

Configure the required environment variables.

Then run:

```bash
mvn spring-boot:run
```

---

## Frontend Setup

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will then be available through the Vite development server.

---

# 🔑 Environment Variables

The application requires environment variables for sensitive configuration such as:

```env
DATABASE_URL=your_database_url
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password

JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

GROQ_API_KEY=your_groq_api_key

SIGHTENGINE_API_USER=your_api_user
SIGHTENGINE_API_SECRET=your_api_secret
```

> ⚠️ Never commit API keys, database passwords, JWT secrets, or `.env` files to GitHub.

---

# 🎯 Real-World Impact

ClothMarket was built around a **real-world problem observed in the local textile/cloth-selling ecosystem**.

Instead of being only a conventional e-commerce application, the platform combines:

* Social networking
* Marketplace functionality
* Real-time communication
* Voice/video calling
* AI assistance
* Content moderation
* Cloud media storage

This creates a more interactive environment for local sellers and buyers to discover products and communicate directly.

---

# 🚀 Future Improvements

Possible future improvements include:

* 💳 Online payments
* 📦 Order and inventory management
* ⭐ Product reviews and ratings
* 🔔 Push notifications
* 🛒 Shopping cart
* 📍 Location-based seller discovery
* 📈 Seller analytics dashboard
* 🏪 Dedicated business pages
* 🔎 Advanced product search and filters
* 🤖 More advanced AI recommendations
* 🌐 Multi-language support
* 📱 Dedicated Android/iOS application

---

# 📊 Key Highlights

* Full-stack marketplace built with **React + Spring Boot**
* Real-time communication using **WebSocket/STOMP**
* Voice and video calling using **WebRTC**
* AI chatbot powered by **Groq Llama 3.3**
* AI-based image content moderation using **Sightengine**
* Cloud-based image/video storage using **Cloudinary**
* JWT authentication with BCrypt password hashing
* MySQL database hosted on Aiven
* Responsive frontend deployed on Netlify
* Spring Boot backend deployed on Render

---

# 👨‍💻 Author

## Mohd Zaid

Computer Science & Engineering Student

Interested in:

* Full-Stack Development
* Java & Spring Boot
* AI/ML
* Generative AI
* Real-Time Applications

---

# ⭐ Support

If you find **ClothMarket** interesting or useful, consider giving the repository a ⭐ on GitHub.

## 🔗 Project

**Live Demo:**
http://lighthearted-zabaione-eb6215.netlify.app/
