import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { changePassword, saveGithubToken } from '../../api/api.js';
import './SettingsPage.css';

const SettingsPage = () => {
  const { user } = useAuth();

  // Password change
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // GitHub token
  const [tokenInput, setTokenInput] = useState('');
  const [tokenMsg, setTokenMsg] = useState({ type: '', text: '' });
  const [tokenLoading, setTokenLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (passwordForm.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(passwordForm);
      setPasswordMsg({ type: 'success', text: 'Password updated successfully' });
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update password' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleTokenSave = async (e) => {
    e.preventDefault();
    setTokenMsg({ type: '', text: '' });

    if (!tokenInput.trim()) {
      setTokenMsg({ type: 'error', text: 'Please enter a token' });
      return;
    }

    setTokenLoading(true);
    try {
      await saveGithubToken({ token: tokenInput });
      setTokenMsg({ type: 'success', text: 'GitHub token saved! Your rate limit is now 5000 req/hr.' });
      setTokenInput('');
    } catch (err) {
      setTokenMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save token' });
    } finally {
      setTokenLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header animate-fade-in-up">
          <h1>Settings</h1>
          <p>Manage your account preferences</p>
        </div>

        <div className="settings-grid">
          {/* Profile Card */}
          <section className="settings-card glass-card animate-fade-in-up" id="profile-section">
            <h2 className="settings-card-title">👤 Profile</h2>
            <div className="profile-info">
              <div className="input-group">
                <label>Name</label>
                <input type="text" className="input" value={user?.name || ''} disabled />
              </div>
              <div className="input-group">
                <label>Email</label>
                <input type="email" className="input" value={user?.email || ''} disabled />
              </div>
            </div>
          </section>

          {/* Change Password Card */}
          <section className="settings-card glass-card animate-fade-in-up" id="password-section">
            <h2 className="settings-card-title">🔒 Change Password</h2>
            <form onSubmit={handlePasswordChange} className="settings-form">
              {passwordMsg.text && (
                <div className={`alert alert-${passwordMsg.type}`}>{passwordMsg.text}</div>
              )}
              <div className="input-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  className="input"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  className="input"
                  placeholder="Min 6 characters"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={passwordLoading} id="change-password-btn">
                {passwordLoading ? <div className="spinner"></div> : 'Update Password'}
              </button>
            </form>
          </section>

          {/* GitHub Token Card */}
          <section className="settings-card glass-card animate-fade-in-up" id="token-section">
            <h2 className="settings-card-title">🔑 GitHub Personal Token</h2>
            <p className="settings-card-desc">
              Add a personal access token to increase your API rate limit from 60 to 5,000 requests/hour.
              Your token is encrypted and never displayed again after saving.
            </p>
            <form onSubmit={handleTokenSave} className="settings-form">
              {tokenMsg.text && (
                <div className={`alert alert-${tokenMsg.type}`}>{tokenMsg.text}</div>
              )}
              <div className="input-group">
                <label htmlFor="github-token">Token</label>
                <input
                  type="password"
                  id="github-token"
                  className="input"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={tokenLoading} id="save-token-btn">
                {tokenLoading ? <div className="spinner"></div> : 'Save Token'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
