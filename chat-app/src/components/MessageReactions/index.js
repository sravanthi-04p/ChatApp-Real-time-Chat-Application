import {useState} from 'react'
import './index.css'

const REACTIONS = [ '❤️', '😂', '😮', '😢']

const MessageReactions = ({messageId, onReact}) => {
  const [showPicker, setShowPicker] = useState(false)

  return (
    <div className="reactions-container">
      <button 
        className="reaction-trigger"
        onClick={() => setShowPicker(!showPicker)}
      >
        😊
      </button>
      {showPicker && (
        <div className="reaction-picker">
          {REACTIONS.map(emoji => (
            <button
              key={emoji}
              className="reaction-btn"
              onClick={() => {
                onReact(messageId, emoji)
                setShowPicker(false)
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default MessageReactions