A full-stack real-time chat application built with React.js, Node.js, Express.js, Socket.io and SQLite.

## 🚀 Features

- 🔐 User Authentication with JWT tokens and bcrypt password hashing
- 💬 Real-time messaging using Socket.io WebSockets
- 🏠 Multiple Chat Rooms — General, Random, Tech
- 🟢 Online/Offline User Status Tracking
- 📜 Message History stored in SQLite Database
- ⌨️ Typing Indicators
- 😊 Emoji Picker
- 👍 Message Likes and Reactions
- 🌙 Dark Mode
- 🚪 Logout

## 🛠️ Tech Stack

### Frontend
- React.js
- CSS
- Socket.io-client
- UUID
- Emoji Picker React

### Backend
- Node.js
- Express.js
- Socket.io
- JWT (jsonwebtoken)
- bcryptjs

### Database
- SQLite (better-sqlite3)

## 📁 Project Structure
ChatApp-Real-time-Chat-Application/

├── chat-app/                  # React Frontend

│   ├── src/

│   │   ├── App.js

│   │   ├── App.css

│   │   └── components/

│   │       ├── ChatInput/

│   │       ├── MessageList/

│   │       ├── MessageItem/

│   │       ├── MessageReactions/

│   │       └── Sidebar/

│   └── package.json

└── server/                    # Node.js Backend

├── index.js

└── package.json

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/sravanthi-04p/ChatApp-Real-time-Chat-Application.git
cd ChatApp-Real-time-Chat-Application
```

### 2. Setup Backend
```bash
cd server
npm install
node index.js
```
Server runs on `http://localhost:3001`

### 3. Setup Frontend
```bash
cd chat-app
npm install
npm start
```
App runs on `http://localhost:3000`
