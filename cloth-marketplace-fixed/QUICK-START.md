# ⚡ QUICK START GUIDE

## 🎯 Get Running in 5 Minutes

### Prerequisites Check
```bash
java -version    # Should be 17+
mvn -version     # Should be 3.6+
mysql --version  # Should be 8.0+
node -v          # Should be 18+
npm -v           # Should be 9+
```

### Step 1: Database Setup (2 minutes)
```bash
# Start MySQL and login
mysql -u root -p

# Create database
CREATE DATABASE cloth_marketplace;

# Exit MySQL
exit;
```

### Step 2: Backend Setup (1 minute)
```bash
# Navigate to backend
cd backend

# Update MySQL password in src/main/resources/application.properties
# Change: spring.datasource.password=YOUR_PASSWORD

# Start backend
mvn spring-boot:run
```

Wait for: "Cloth Marketplace API is running!" message

### Step 3: Frontend Setup (1 minute)
```bash
# Open NEW terminal
cd frontend

# Install and start
npm install && npm run dev
```

### Step 4: Access Application (1 minute)
1. Open browser: http://localhost:3000
2. Click "Sign Up"
3. Create account:
   - Name: Test User
   - Location: Mumbai, India
   - Mobile: 1234567890
   - Password: password123
4. Start using! ✨

---

## 🎨 First Steps After Login

1. **Create a Post**
   - Click "Post" in navigation
   - Add description: "Premium cotton fabric"
   - Set price: 500
   - Upload an image
   - Click "Post"

2. **Browse Feed**
   - Click "Feed" to see all posts
   - Scroll down for infinite loading

3. **Start Chatting**
   - Click "Connect" on any post
   - Send a text message
   - Try voice message (click microphone icon)

4. **View Profile**
   - Click your name in header
   - See all your posts

---

## 🔑 Test Credentials (if you loaded sample data)

**Mobile:** 9876543210  
**Password:** password123

---

## 🆘 Quick Troubleshooting

**Backend won't start?**
- Check MySQL is running: `mysql -u root -p`
- Verify port 8080 is free: `netstat -an | grep 8080`

**Frontend won't start?**
- Delete node_modules: `rm -rf node_modules`
- Reinstall: `npm install`

**Can't upload images?**
- Create uploads folder in backend directory
- Restart backend

---

## 📱 Features to Try

✅ Sign up new users  
✅ Create posts with images/videos  
✅ Infinite scroll feed  
✅ Connect and chat  
✅ Send voice messages  
✅ View user profiles  
✅ Browse user's posts  

---

**That's it! You're ready to go! 🚀**
