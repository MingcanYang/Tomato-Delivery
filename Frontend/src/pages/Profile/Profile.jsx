import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import './Profile.css';

const Profile = () => {
  const { token, url, logout } = useContext(StoreContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('personal');

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const [profileResponse, messageResponse] = await Promise.all([
          fetch(`${url}/api/user/profile`, {
            method: 'GET',
            headers: { token },
          }),
          fetch(`${url}/api/message/mine`, {
            method: 'GET',
            headers: { token },
          }),
        ]);

        const profileResult = await profileResponse.json();
        const messageResult = await messageResponse.json();

        if (!profileResult.success) {
          throw new Error(profileResult.message || 'Unable to load profile.');
        }

        setProfile(profileResult.data);
        setMessages(messageResult.success ? messageResult.data || [] : []);
      } catch (loadError) {
        setError(loadError.message || 'Unable to load profile.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token, url]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!token) {
    return (
      <div className="profile-shell">
        <div className="profile-empty-state">
          <h1>Please sign in</h1>
          <p>You need an account to view your personal profile.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="profile-shell"><div className="profile-empty-state">Loading profile...</div></div>;
  }

  if (error) {
    return <div className="profile-shell"><div className="profile-empty-state error">{error}</div></div>;
  }

  return (
    <div className="profile-shell">
      <div className="profile-header">
        <p className="profile-kicker">Profile</p>
        <h1>Account center</h1>
        <p className="profile-description">Review your personal info, messages sent to support, and sign out from one place.</p>
      </div>

      <div className="profile-sections">
        <div className="profile-tab-bar" role="tablist" aria-label="Profile sections">
          <button
            type="button"
            className={`profile-tab-button ${activeSection === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveSection('personal')}
          >
            <p className="profile-tab-label">Personal info</p>
          </button>
          <button
            type="button"
            className={`profile-tab-button ${activeSection === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveSection('messages')}
          >
            <p className="profile-tab-label">Messages</p>
            <p className="profile-tab-count">{messages.length}</p>
          </button>
        </div>

        {activeSection === 'personal' ? (
          <section className="profile-card">
            <div className="profile-card-head">
              <h2>Personal info</h2>
            </div>
            <div className="profile-info-list">
              <div className="profile-info-row">
                <span>Name</span>
                <strong>{profile?.name || 'N/A'}</strong>
              </div>
              <div className="profile-info-row">
                <span>Email</span>
                <strong>{profile?.email || 'N/A'}</strong>
              </div>
            </div>
          </section>
        ) : (
          <section className="profile-card">
            <div className="profile-card-head">
              <h2>Messages</h2>
              <span>{messages.length}</span>
            </div>
            {messages.length ? (
              <div className="profile-message-list">
                {messages.map((message) => (
                  <article key={message._id} className="profile-message-item">
                    <div className="profile-message-meta">
                      <strong>Admin reply</strong>
                      <span>{new Date(message.repliedAt || message.date).toLocaleString()}</span>
                    </div>
                    <p className="profile-message-text">{message.adminReply}</p>
                    <div className="profile-message-origin">
                      <span>Your original message</span>
                      <p>{message.message}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="profile-empty-inline">No admin replies yet.</div>
            )}
          </section>
        )}
      </div>

      <section className="profile-card profile-logout-card">
        <div className="profile-card-head">
          <h2>Logout</h2>
        </div>
        <p>Sign out from this device and clear the current session.</p>
        <button type="button" onClick={handleLogout}><p>Logout</p></button>
      </section>
    </div>
  );
};

export default Profile;
