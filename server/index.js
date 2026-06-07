const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Database = require('better-sqlite3')

const app = express()
app.use(cors())
app.use(express.json())

// ─── SQLite DB ─────────────────────────────────────────────
const db = new Database('./chat.sqlite')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room TEXT NOT NULL,
    username TEXT NOT NULL,
    text TEXT NOT NULL,
    time TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS user_status (
    username TEXT PRIMARY KEY,
    is_online INTEGER DEFAULT 0,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`)

const SECRET = 'chat_secret_123'

// ─── Auth Routes ───────────────────────────────────────────
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body
  try {
    const hash = await bcrypt.hash(password, 10)
    db.prepare(`INSERT INTO users (username, password) VALUES (?, ?)`).run(username, hash)
    db.prepare(`INSERT OR IGNORE INTO user_status (username) VALUES (?)`).run(username)
    res.json({ message: 'Registered!' })
  } catch (err) {
    res.status(400).json({ error: 'Username already taken' })
  }
})

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body
  const user = db.prepare(`SELECT * FROM users WHERE username = ?`).get(username)
  if (!user) return res.status(404).json({ error: 'User not found' })
  const match = await bcrypt.compare(password, user.password)
  if (!match) return res.status(401).json({ error: 'Wrong password' })
  const token = jwt.sign({ username: user.username }, SECRET, { expiresIn: '7d' })
  res.json({ token, username: user.username })
})

// ─── Messages History ──────────────────────────────────────
app.get('/api/messages/:room', (req, res) => {
  const messages = db.prepare(`
    SELECT * FROM messages WHERE room = ?
    ORDER BY timestamp ASC LIMIT 50
  `).all(req.params.room)
  res.json(messages)
})

// ─── Online Users ──────────────────────────────────────────
app.get('/api/online-users', (req, res) => {
  const users = db.prepare(
    `SELECT username FROM user_status WHERE is_online = 1`
  ).all()
  res.json(users)
})

// ─── Socket.io ─────────────────────────────────────────────
const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: 'http://localhost:3000', methods: ['GET', 'POST'] }
})

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('join_room', ({ username, room }) => {
    socket.join(room)
    socket.username = username
    socket.room = room

    db.prepare(`
      INSERT INTO user_status (username, is_online)
      VALUES (?, 1)
      ON CONFLICT(username) DO UPDATE SET is_online = 1
    `).run(username)

    const onlineUsers = db.prepare(
      `SELECT username FROM user_status WHERE is_online = 1`
    ).all()
    io.emit('online_users', onlineUsers.map(u => u.username))
    io.to(room).emit('user_joined', `${username} joined #${room}`)
  })

  socket.on('send_message', (data) => {
    // Save to DB
    db.prepare(`
      INSERT INTO messages (room, username, text, time)
      VALUES (?, ?, ?, ?)
    `).run(data.room || 'general', data.username, data.text, data.time)

    io.to(data.room || 'general').emit('receive_message', data)
  })

  // Keep your existing typing events exactly as before
  socket.on('typing', (data) => {
    socket.broadcast.emit('user_typing', data)
  })

  socket.on('stop_typing', () => {
    socket.broadcast.emit('user_stop_typing')
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
    if (socket.username) {
      db.prepare(`
        UPDATE user_status
        SET is_online = 0, last_seen = CURRENT_TIMESTAMP
        WHERE username = ?
      `).run(socket.username)

      const onlineUsers = db.prepare(
        `SELECT username FROM user_status WHERE is_online = 1`
      ).all()
      io.emit('online_users', onlineUsers.map(u => u.username))
    }
  })
})

server.listen(3001, () => console.log('Server running on port 3001'))