import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../services/authService';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const { name, email, phone, password, confirmPassword } = formData;
    if (!name.trim()) newErrors.name = 'Full name is required';
    else if (name.trim().length < 3) newErrors.name = 'Name must be at least 3 characters';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) newErrors.email = 'Email is required';
    else if (!emailRegex.test(email)) newErrors.email = 'Enter a valid email address';
    const phoneRegex = /^09[0-9]{8}$/;
    if (!phone) newErrors.phone = 'Phone number is required';
    else if (!phoneRegex.test(phone)) newErrors.phone = 'Phone must be 10 digits and start with 09 (e.g., 0912345678)';
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!password) newErrors.password = 'Password is required';
    else if (!passwordRegex.test(password)) {
      newErrors.password = 'Password must be at least 8 characters, include a letter, a number, and a symbol (@$!%*#?&)';
    }
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setSuccessMessage('');
    try {
      await register(formData.name, formData.email, formData.phone, formData.password, formData.confirmPassword);
      setSuccessMessage('Registration successful! Your account is pending nurse approval. You will be notified when approved.');
      setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 70px)', background: 'linear-gradient(135deg, #f0f4f8 0%, #d8e6fb 100%)', padding: '40px 0' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-6">
            
            {/* Back to Home */}
            <Link to="/" className="btn btn-outline-primary btn-sm mb-3">← Back to Home</Link>

            <div className="card border-0 shadow-lg" style={{ borderRadius: '20px', overflow: 'hidden' }}>
              
              {/* Header - BLUE gradient matching Login */}
              <div className="text-center py-4" style={{ background: 'linear-gradient(135deg, #1e5fbb 0%, #13458a 100%)' }}>
                <div className="mb-2">
                  <span style={{ fontSize: '48px' }}>👨‍👩‍👧</span>
                </div>
                <h4 className="text-white fw-bold mb-1">Parent Registration</h4>
                <p className="text-white-50 mb-0 small">Create an account to manage your child's vaccinations</p>
              </div>

              {/* Form */}
              <div className="card-body p-4">
                {errors.general && (
                  <div className="alert alert-danger alert-dismissible fade show py-2 small" role="alert">
                    {errors.general}
                    <button type="button" className="btn-close btn-close-sm" onClick={() => setErrors({})}></button>
                  </div>
                )}
                {successMessage && (
                  <div className="alert alert-success alert-dismissible fade show py-2 small" role="alert">
                    {successMessage}
                    <button type="button" className="btn-close btn-close-sm" onClick={() => setSuccessMessage('')}></button>
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label fw-semibold small">Full Name *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      id="name"
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                    {errors.name && <div className="invalid-feedback small">{errors.name}</div>}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold small">Email Address *</label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    {errors.email && <div className="invalid-feedback small">{errors.email}</div>}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label fw-semibold small">Phone Number *</label>
                    <input
                      type="tel"
                      className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      id="phone"
                      name="phone"
                      placeholder="09xxxxxxxx"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                    {errors.phone && <div className="invalid-feedback small">{errors.phone}</div>}
                    <div className="form-text small">Ethiopian phone number (10 digits, starts with 09)</div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-semibold small">Password *</label>
                    <div className="input-group">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        id="password"
                        name="password"
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                      {errors.password && <div className="invalid-feedback small">{errors.password}</div>}
                    </div>
                    <div className="form-text small">Minimum 8 characters, at least one letter, one number, and one symbol (@$!%*#?&)</div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label fw-semibold small">Confirm Password *</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                    {errors.confirmPassword && <div className="invalid-feedback small">{errors.confirmPassword}</div>}
                  </div>

                  <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-primary btn-lg py-2 fw-bold" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Registering...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </div>
                </form>
                <hr className="my-4" />
                <div className="text-center">
                  <span className="small">Already have an account? <Link to="/login" className="fw-bold">Sign In</Link></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;