import {useState} from 'react'
import EmojiPicker from 'emoji-picker-react'
import './index.css'

const ChatInput = ({onSend, socket, username}) => {
  const [message, setMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const handleChange = e => {
    setMessage(e.target.value)
    socket.emit('typing', {username: username || 'Someone'})
    setTimeout(() => {
      socket.emit('stop_typing')
    }, 1000)
  }

  const handleSend = () => {
    if (message.trim() === '') return
    onSend(message)
    socket.emit('stop_typing')
    setMessage('')
    setShowEmojiPicker(false)
  }

  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      handleSend()
    }
  }

  const onEmojiClick = emojiData => {
    setMessage(prev => prev + emojiData.emoji)
  }

  return (
    <div className="chat-input-wrapper">
      {showEmojiPicker && (
        <div className="emoji-picker-container">
          <EmojiPicker onEmojiClick={onEmojiClick} />
        </div>
      )}
      <div className="chat-input-container">
        <button
          type="button"
          className="emoji-btn"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          😊
        </button>
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
        />
        <button
          type="button"
          className="send-btn"
          onClick={handleSend}
        >
          ➤
        </button>
      </div>
    </div>
  )
}

export default ChatInput