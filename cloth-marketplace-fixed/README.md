# 🧵 Cloth Marketplace - Social Platform for Cloth Producers & Buyers

A full-stack web application connecting cloth producers and buyers through a social marketplace platform. Built with React, Spring Boot, and MySQL.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Screenshots & Usage](#screenshots--usage)
- [Troubleshooting](#troubleshooting)

## ✨ Features

### User Management
- 📝 Sign up with name, location, mobile number, and password
- 🔐 Secure login with JWT authentication
- 👤 User profiles with profile pictures
- 📍 Location-based user information

### Post System
- 📸 Create posts with images/videos
- 📝 Add product descriptions, price, quantity, and cloth type
- 🔄 Infinite scroll feed (Facebook/Instagram style)
- 👁️ View all posts from specific users
- 💰 Display pricing and product details

### Chat System
- 💬 One-on-one text messaging
- 🎤 Voice message recording and playback
- 🔔 Real-time message updates
- 📱 Chat history with all conversations
- 🔗 Direct "Connect" button on posts

### UI/UX
- 📱 Fully responsive design
- 🎨 Modern, clean interface
- ⚡ Smooth scrolling experience
- 🌐 Mobile-first approach

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Icons** - Icon library
- **Vite** - Build tool

### Backend
- **Java 17** - Programming language
- **Spring Boot 3.2** - Framework
- **Spring Data JPA** - ORM
- **MySQL** - Database
- **JWT** - Authentication
- **BCrypt** - Password encryption
- **WebSocket** - Real-time features

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Java Development Kit (JDK) 17 or higher**
  - Download: https://adoptium.net/
  - Verify: `java -version`

- **Maven 3.6 or higher**
  - Download: https://maven.apache.org/download.cgi
  - Verify: `mvn -version`

- **MySQL 8.0 or higher**
  - Download: https://dev.mysql.com/downloads/mysql/
  - Verify: `mysql --version`

- **Node.js 18 or higher**
  - Download: https://nodejs.org/
  - Verify: `node -v` and `npm -v`

## 🚀 Installation

### 1. Clone or Download the Project

```bash
# If you have the project files, navigate to the directory
cd cloth-marketplace
```

### 2. Database Setup

**Step 1:** Start MySQL server

**Step 2:** Create the database and tables

```bash
# Login to MySQL
mysql -u root -p

# Run the schema script
source database-schema.sql

# Or manually:
CREATE DATABASE cloth_marketplace;
```

**Step 3:** Update database credentials if needed

Edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/cloth_marketplace
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies and build
mvn clean install

# This will download all required dependencies
```

### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install
```

## 🎯 Running the Application

### Start Backend (Spring Boot)

**Option 1: Using Maven**
```bash
cd backend
mvn spring-boot:run
```

**Option 2: Using Java**
```bash
cd backend
mvn clean package
java -jar target/cloth-marketplace-1.0.0.jar
```

Backend will start on: **http://localhost:8080**

### Start Frontend (React)

Open a new terminal:

```bash
cd frontend
npm run dev
```

Frontend will start on: **http://localhost:3000**

### Access the Application

Open your browser and navigate to: **http://localhost:3000**

## 📁 Project Structure

```
cloth-marketplace/
│
├── backend/                          # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/clothmarket/
│   │   │   │   ├── model/           # Entity models (User, Post, Message)
│   │   │   │   ├── repository/      # JPA repositories
│   │   │   │   ├── service/         # Business logic
│   │   │   │   ├── controller/      # REST API controllers
│   │   │   │   ├── config/          # Configuration classes
│   │   │   │   ├── dto/             # Data Transfer Objects
│   │   │   │   ├── security/        # JWT utilities
│   │   │   │   └── ClothMarketplaceApplication.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   └── pom.xml                      # Maven dependencies
│
├── frontend/                         # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/              # Reusable components
│   │   │   ├── Header.jsx
│   │   │   └── PostCard.jsx
│   │   ├── pages/                   # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── SignUp.jsx
│   │   │   ├── Feed.jsx
│   │   │   ├── CreatePost.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Messages.jsx
│   │   │   └── Chat.jsx
│   │   ├── context/                 # React Context
│   │   │   └── AuthContext.jsx
│   │   ├── services/                # API services
│   │   │   └── api.js
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Global styles
│   ├── package.json
│   └── vite.config.js
│
└── database-schema.sql               # MySQL schema
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/{userId}` - Get user by ID
- `GET /api/users/mobile/{mobile}` - Get user by mobile
- `POST /api/users/{userId}/profile-image` - Update profile image

### Posts
- `POST /api/posts/create` - Create new post
- `GET /api/posts/feed?page={page}&size={size}` - Get paginated feed
- `GET /api/posts/user/{userId}` - Get user's posts
- `GET /api/posts/{postId}` - Get specific post

### Messages
- `POST /api/messages/send/text` - Send text message
- `POST /api/messages/send/voice` - Send voice message
- `GET /api/messages/chat?userId1={id1}&userId2={id2}` - Get chat history
- `GET /api/messages/chat-users/{userId}` - Get all chat users

## 📸 Screenshots & Usage

### 1. Sign Up
- Navigate to http://localhost:3000/signup
- Enter: Name, Location, Mobile Number, Password
- Click "Sign Up"

### 2. Login
- Navigate to http://localhost:3000/login
- Enter: Mobile Number, Password
- Click "Login"

### 3. Home Feed
- View all posts in infinite scroll format
- Click "Connect" to start chatting with a user

### 4. Create Post
- Click "Post" in navigation
- Add description, price, quantity, cloth type
- Upload image or video
- Click "Post"

### 5. Profile
- Click on user name or profile icon
- View user details and all their posts

### 6. Messages
- Click "Messages" in navigation
- View all ongoing conversations
- Click on a user to open chat

### 7. Chat
- Send text messages
- Click microphone icon to record voice message
- Click stop to send voice message

## 🔧 Troubleshooting

### Backend Issues

**Problem: Port 8080 already in use**
```bash
# Find process using port 8080
# Windows:
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac:
lsof -i :8080
kill -9 <PID>
```

**Problem: Database connection failed**
- Ensure MySQL server is running
- Verify credentials in `application.properties`
- Check if database `cloth_marketplace` exists

**Problem: Maven build fails**
- Ensure Java 17+ is installed: `java -version`
- Clear Maven cache: `mvn clean`
- Try: `mvn clean install -U`

### Frontend Issues

**Problem: Port 3000 already in use**
- Edit `vite.config.js` and change port to 3001
- Or kill the process using port 3000

**Problem: API calls failing (CORS errors)**
- Ensure backend is running on port 8080
- Check browser console for errors
- Verify `application.properties` has correct CORS settings

**Problem: Images/videos not displaying**
- Ensure backend `uploads/` directory has proper permissions
- Check that media files are being saved correctly
- Verify file paths in database

### File Upload Issues

**Problem: File upload fails**
- Check file size (max 50MB by default)
- Ensure `uploads/` directory exists in backend root
- Verify backend file permissions

## 🔑 Default Test Account

If you ran the sample data script:

**Mobile:** 9876543210  
**Password:** password123

## 📝 Development Notes

### Key Features Implemented
✅ JWT-based authentication  
✅ BCrypt password encryption  
✅ File upload (images/videos)  
✅ Infinite scroll pagination  
✅ Real-time chat (polling-based)  
✅ Voice message recording  
✅ Responsive design  
✅ Profile management  

### Future Enhancements
- [ ] WebSocket for real-time chat (currently using polling)
- [ ] Push notifications
- [ ] Image compression
- [ ] Search functionality
- [ ] Filter posts by cloth type/price
- [ ] User verification
- [ ] Admin dashboard

## 📄 License

This project is created for educational purposes.

## 👥 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review API endpoints documentation
3. Verify all prerequisites are installed correctly

---

**Happy Coding! 🚀**
