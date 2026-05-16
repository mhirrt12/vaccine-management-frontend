import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }
    try {
      const user = await login(email, password);
      switch (user.role) {
        case 'parent': navigate('/parent'); break;
        case 'nurse': navigate('/nurse'); break;
        case 'admin': navigate('/admin'); break;
        default: navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 70px)', background: 'linear-gradient(135deg, #f0f4f8 0%, #d8e6fb 100%)', padding: '40px 0' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            {/* Back to Home */}
            <Link to="/" className="btn btn-outline-primary btn-sm mb-3">← Back to Home</Link>
            
            <div className="card border-0 shadow-lg" style={{ borderRadius: '20px', overflow: 'hidden' }}>
              <div className="text-center py-4" style={{ background: 'linear-gradient(135deg, #1e5fbb 0%, #13458a 100%)' }}>
                <div className="mb-2">
                  <span style={{ fontSize: '48px' }}>💉</span>
                </div>
                <h4 className="text-white fw-bold mb-1">Welcome Back</h4>
                <p className="text-white-50 mb-0 small">Sign in to your account</p>
              </div>
              <div className="card-body p-4">
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show py-2" role="alert">
                    <small>{error}</small>
                    <button type="button" className="btn-close btn-close-sm" onClick={() => setError('')}></button>
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">📧</span>
                      <input type="email" className="form-control border-start-0" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">🔒</span>
                      <input type={showPassword ? 'text' : 'password'} className="form-control border-start-0" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                      <button type="button" className="btn btn-outline-secondary border-start-0" onClick={() => setShowPassword(!showPassword)} tabIndex="-1">
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary w-100 py-2 fw-bold" disabled={loading}>
                    {loading ? <><span className="spinner-border spinner-border-sm me-2" />Signing in...</> : 'Sign In'}
                  </button>
                </form>
                <div className="text-center mt-4">
                  <p className="mb-0 small">
                    Don't have an account? <Link to="/register" className="fw-bold">Register as Parent</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;