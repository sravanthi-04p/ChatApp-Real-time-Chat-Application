import './index.css'
import MessageReactions from '../MessageReactions'

const COLORS = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a']

const MessageItem = ({message, onLike, onReact}) => {
  const colorIndex = message.username.length % COLORS.length
  const avatarColor = COLORS[colorIndex]

  return (
    <li className="message-item">
      <div className="message-avatar" style={{background: avatarColor}}>
        {message.username[0]}
      </div>
      <div className="message-wrapper">
        <span className="username" style={{color: avatarColor}}>
          {message.username}
        </span>
        <div className="message-bubble">
          <span className="message-text">{message.text}</span>
          <div className="message-footer">
            <span className="message-time">{message.time}</span>
            <div className="message-actions">
              <button className="like-btn" onClick={() => onLike(message.id)}>
                👍 {message.likes}
              </button>
              <MessageReactions 
                messageId={message.id}
                onReact={onReact}
              />
            </div>
          </div>
          {message.reactions && (
            <div className="reactions-display">
              {Object.entries(message.reactions).map(([emoji, count]) => (
                <span key={emoji} className="reaction-badge">
                  {emoji} {count}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

export default MessageItem