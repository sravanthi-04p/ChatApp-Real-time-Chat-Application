import './index.css'

const COLORS = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a']

const Sidebar = ({ onlineUsers, currentRoom, rooms, onSwitchRoom, onLogout, username }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>💬 ChatApp</h2>
        <span style={{ fontSize: '12px', color: '#aaa' }}>@{username}</span>
      </div>

      {/* Rooms */}
      <div className="sidebar-section">
        <p className="sidebar-label">ROOMS</p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {rooms.map(room => (
            <li
              key={room}
              onClick={() => onSwitchRoom(room)}
              style={{
                padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                background: currentRoom === room ? '#667eea22' : 'transparent',
                color: currentRoom === room ? '#667eea' : 'inherit',
                fontWeight: currentRoom === room ? '600' : '400',
                marginBottom: '4px'
              }}
            >
              # {room}
            </li>
          ))}
        </ul>
      </div>

      {/* Online Members */}
      <div className="sidebar-section">
        <p className="sidebar-label">ONLINE — {onlineUsers.length}</p>
        <ul className="member-list">
          {onlineUsers.map((user, index) => (
            <li key={user} className="member-item">
              <div className="member-avatar" style={{ background: COLORS[index % COLORS.length] }}>
                {user[0]}
              </div>
              <div className="member-info">
                <span className="member-name">{user}</span>
                <span className="member-status">🟢 online</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        style={{
          margin: '16px', padding: '10px', width: 'calc(100% - 32px)',
          background: '#ff4757', color: '#fff', border: 'none',
          borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
        }}
      >
        🚪 Logout
      </button>
    </div>
  )
}

export default Sidebar