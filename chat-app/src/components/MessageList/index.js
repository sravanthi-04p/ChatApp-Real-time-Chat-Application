import {useEffect, useRef} from 'react'
import './index.css'
import MessageItem from '../MessageItem'

const MessageList = ({messages, onLike, onReact}) => {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({behavior: 'smooth'})
  }, [messages])

  return (
    <ul className="message-list">
      {messages.map((msg) => (
        <MessageItem 
          key={msg.id} 
          message={msg} 
          onLike={onLike}
          onReact={onReact}
        />
      ))}
      <div ref={bottomRef} />
    </ul>
  )
}

export default MessageList