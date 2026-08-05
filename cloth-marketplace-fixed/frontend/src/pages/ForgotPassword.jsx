import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Auth.css';

export default function ForgotPassword() {
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authAPI.forgotPassword(mobile);
      alert('OTP sent (check backend console for the code)');
      navigate('/reset-password', { state: { mobile } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Forgot Password</h1>
          <p>Enter your mobile number to receive an OTP</p>
        </div>

        <form onSubmit={sendOtp} className="auth-form">
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

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>

        <div className="auth-footer">
          <p><Link to="/login">Back to Login</Link></p>
        </div>
      </div>
    </div>
  );
}
