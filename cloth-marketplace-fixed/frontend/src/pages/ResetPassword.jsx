import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Auth.css';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const mobileFromState = location.state?.mobile || '';

  const [mobile, setMobile] = useState(mobileFromState);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const resetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authAPI.resetPassword({ mobile, otp, newPassword: password });
      alert('Password updated successfully');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Reset Password</h1>
          <p>Enter the OTP and your new password</p>
        </div>

        <form onSubmit={resetPassword} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <input
              type="tel"
              placeholder="Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Updating...' : 'Reset Password'}
          </button>
        </form>

        <div className="auth-footer">
          <p><Link to="/login">Back to Login</Link></p>
        </div>
      </div>
    </div>
  );
}
