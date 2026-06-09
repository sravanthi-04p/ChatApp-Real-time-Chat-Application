import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import io from 'socket.io-client'
import ChatInput from './components/ChatInput'
import MessageList from './components/MessageList'
import Sidebar from './components/Sidebar'
import './App.css'

const BACKEND_URL = 'https://chatapp-real-time-chat-application.onrender.com'
const socket = io(BACKEND_URL)

const ROOMS = ['general', 'random', 'tech']

const App = () => {
  const [messages, setMessages] = useState([])
  const [typingUser, setTypingUser] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [currentRoom, setCurrentRoom] = useState('general')
  const [onlineUsers, setOnlineUsers] = useState([])
  const [username, setUsername] = useState(localStorage.getItem('username') || '')
  const [showLogin, setShowLogin] = useState(!localStorage.getItem('token'))
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ username: '', password: '' })
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    if (!username) return
    fetch(`${BACKEND_URL}/api/messages/${currentRoom}`)
      .then(res => res.json())
      .then(data => setMessages(data.map(m => ({
        id: m.id,
        username: m.username,
        text: m.text,
        time: m.time,
        likes: 0,
        reactions: {}
      }))))
    socket.emit('join_room', { username, room: currentRoom })
  }, [currentRoom, username])

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessages(prev => [...prev, { ...data, likes: data.likes || 0, reactions: data.reactions || {} }])
    })
    socket.on('user_typing', (data) => setTypingUser(data.username))
    socket.on('user_stop_typing', () => setTypingUser(''))
    socket.on('user_joined', (msg) => {
      setMessages(prev => [...prev, {
        id: uuidv4(), username: 'System',
        text: msg, time: '', likes: 0, reactions: {}
      }])
    })
    socket.on('online_users', (users) => setOnlineUsers(users))

    return () => {
      socket.off('receive_message')
      socket.off('user_typing')
      socket.off('user_stop_typing')
      socket.off('user_joined')
      socket.off('online_users')
    }
  }, [])

  const addMessage = (text) => {
    const newMessage = {
      id: uuidv4(),
      username,
      text,
      room: currentRoom,
      likes: 0,
      reactions: {},
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    socket.emit('send_message', newMessage)
  }

  const handleLike = (id) => {
    setMessages(messages.map(msg =>
      msg.id === id ? { ...msg, likes: msg.likes + 1 } : msg
    ))
  }

  const handleReact = (id, emoji) => {
    setMessages(messages.map(msg =>
      msg.id === id ? {
        ...msg,
        reactions: { ...msg.reactions, [emoji]: (msg.reactions?.[emoji] || 0) + 1 }
      } : msg
    ))
  }

  const handleAuth = async () => {
    setAuthError('')
    try {
      const res = await fetch(`${BACKEND_URL}/api/${authMode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      })
      const data = await res.json()
      if (!res.ok) return setAuthError(data.error)

      if (authMode === 'login') {
        localStorage.setItem('token', data.token)
        localStorage.setItem('username', data.username)
        setUsername(data.username)
        setAuthForm({ username: '', password: '' })  // ← clear BEFORE setShowLogin
        setAuthError('')
        setShowLogin(false)
        socket.emit('join_room', { username: data.username, room: 'general' })
      } else {
        setAuthForm({ username: '', password: '' })  // ← clear fields
        setAuthError('✅ Registered! Please login.')
        setAuthMode('login')
      }
    } catch {
      setAuthError('Something went wrong')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    setAuthForm({ username: '', password: '' })  // ← clear on logout too
    setShowLogin(true)
    setUsername('')
    setMessages([])
  }

  const switchRoom = (room) => {
    setCurrentRoom(room)
    setMessages([])
  }

  if (showLogin) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', background: '#1a1a2e', flexDirection: 'column'
      }}>
        <div style={{
          background: '#fff', padding: '36px', borderRadius: '16px',
          width: '320px', display: 'flex', flexDirection: 'column', gap: '12px'
        }}>
          <h2 style={{ margin: 0, textAlign: 'center' }}>
            {authMode === 'login' ? '🔐 Login' : '📝 Register'}
          </h2>
          {authError && (
            <p style={{
              color: authError.includes('✅') ? 'green' : 'red',
              fontSize: '13px', margin: 0
            }}>
              {authError}
            </p>
          )}
          <input
            placeholder="Username"
            value={authForm.username}
            onChange={e => setAuthForm({ ...authForm, username: e.target.value })}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
          />
          <input
            placeholder="Password"
            type="password"
            value={authForm.password}
            onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
            onKeyPress={e => e.key === 'Enter' && handleAuth()}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
          />
          <button
            onClick={handleAuth}
            style={{
              padding: '10px', background: '#667eea', color: '#fff',
              border: 'none', borderRadius: '8px', fontSize: '15px', cursor: 'pointer'
            }}
          >
            {authMode === 'login' ? 'Login' : 'Register'}
          </button>
          <p style={{ textAlign: 'center', fontSize: '13px', margin: 0 }}>
            {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <span
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login')
                setAuthError('')
                setAuthForm({ username: '', password: '' })
              }}
              style={{ color: '#667eea', cursor: 'pointer', fontWeight: '500' }}
            >
              {authMode === 'login' ? 'Register' : 'Login'}
            </span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`main-container ${darkMode ? 'dark' : ''}`}>
      <Sidebar
        onlineUsers={onlineUsers}
        currentRoom={currentRoom}
        rooms={ROOMS}
        onSwitchRoom={switchRoom}
        onLogout={handleLogout}
        username={username}
      />
      <div className="app-container">
        <div className="chat-header">
          <div className="header-left">
            <div className="header-avatar">💬</div>
            <div className="header-info">
              <h1>#{currentRoom}</h1>
              <p>🟢 {onlineUsers.length} online • {messages.length} messages</p>
            </div>
          </div>
          <div className="header-icons">
            <button onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
        <MessageList messages={messages} onLike={handleLike} onReact={handleReact} />
        {typingUser && (
          <div className="typing-indicator">
            <span>{typingUser} is typing</span>
            <span className="dots"><span>.</span><span>.</span><span>.</span></span>
          </div>
        )}
        <ChatInput onSend={addMessage} socket={socket} username={username} />
      </div>
    </div>
  )
}

export default App