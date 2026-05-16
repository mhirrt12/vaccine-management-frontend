import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <div className="hero-section text-white" style={{
        background: 'linear-gradient(135deg, #1e5fbb 0%, #13458a 100%)',
        padding: '80px 0 100px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <span className="badge bg-light text-primary mb-3 px-3 py-2" style={{ fontSize: '14px' }}>
                🏥 Ethiopian Ministry of Health
              </span>
              <h1 className="display-4 fw-bold mb-4" style={{ lineHeight: '1.2' }}>
                Vaccine Management<br />System
              </h1>
              <p className="lead mb-4" style={{ opacity: '0.9', fontSize: '1.2rem' }}>
                A comprehensive digital platform for managing childhood immunizations 
                following the Ethiopian Federal Ministry of Health EPI schedule.
              </p>
              <div className="d-flex gap-3 mt-4">
                <Link to="/login" className="btn btn-light btn-lg px-4 fw-bold shadow">
                  🔐 Login
                </Link>
                <Link to="/register" className="btn btn-outline-light btn-lg px-4 fw-bold">
                  📝 Register as Parent
                </Link>
              </div>
              <div className="mt-4 d-flex gap-4">
                <div>
                  <h3 className="fw-bold mb-0">3</h3>
                  <small style={{ opacity: '0.8' }}>User Roles</small>
                </div>
                <div>
                  <h3 className="fw-bold mb-0">16</h3>
                  <small style={{ opacity: '0.8' }}>EPI Vaccines</small>
                </div>
                <div>
                  <h3 className="fw-bold mb-0">5</h3>
                  <small style={{ opacity: '0.8' }}>Health Centers</small>
                </div>
              </div>
            </div>
            <div className="col-lg-5 d-none d-lg-block">
              <div className="text-center">
                <div style={{
                  width: '350px',
                  height: '350px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  border: '3px solid rgba(255,255,255,0.2)'
                }}>
                  <span style={{ fontSize: '120px' }}>💉</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Wave divider */}
        <div style={{
          position: 'absolute',
          bottom: '-2px',
          left: 0,
          width: '100%',
          overflow: 'hidden',
          lineHeight: 0
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" fill="#f0f4f8">
            <path d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,74.7C1120,75,1280,53,1360,42.7L1440,32L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z" />
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section py-5" style={{ background: '#f0f4f8' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3">How It Works</h2>
            <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
              A complete solution for managing childhood vaccinations from birth to 5 years
            </p>
          </div>
          
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '16px', transition: 'transform 0.3s' }}>
                <div className="card-body text-center p-4">
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: '#d8e6fb',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px'
                  }}>
                    <span style={{ fontSize: '36px' }}>👨‍👩‍👧</span>
                  </div>
                  <h5 className="fw-bold mb-3">Parent Registration</h5>
                  <p className="text-muted" style={{ fontSize: '0.95rem' }}>
                    Parents register with their phone number, add children, and track vaccination schedules automatically calculated from the child's date of birth.
                  </p>
                  <small className="text-primary fw-bold">→ View next appointment dates</small>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                <div className="card-body text-center p-4">
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: '#d4f0df',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px'
                  }}>
                    <span style={{ fontSize: '36px' }}>👩‍⚕️</span>
                  </div>
                  <h5 className="fw-bold mb-3">Nurse Management</h5>
                  <p className="text-muted" style={{ fontSize: '0.95rem' }}>
                    Nurses verify parent registrations, record vaccinations, manage appointments, generate reports, and approve vaccination certificates.
                  </p>
                  <small className="text-success fw-bold">→ Auto nurse assignment</small>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                <div className="card-body text-center p-4">
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: '#fef2d0',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px'
                  }}>
                    <span style={{ fontSize: '36px' }}>📊</span>
                  </div>
                  <h5 className="fw-bold mb-3">Admin Dashboard</h5>
                  <p className="text-muted" style={{ fontSize: '0.95rem' }}>
                    Complete oversight with real-time statistics, vaccine inventory tracking, expiry alerts, nurse management, and detailed reporting.
                  </p>
                  <small className="text-warning fw-bold">→ Low stock & expiry alerts</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section py-5 bg-white">
        <div className="container">
          <div className="row text-center g-4">
            <div className="col-md-3">
              <div className="p-4">
                <h2 className="display-5 fw-bold text-primary">16</h2>
                <p className="text-muted">EPI Vaccines Tracked</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-4">
                <h2 className="display-5 fw-bold text-success">3</h2>
                <p className="text-muted">User Roles</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-4">
                <h2 className="display-5 fw-bold text-info">24/7</h2>
                <p className="text-muted">Access Available</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-4">
                <h2 className="display-5 fw-bold text-warning">100%</h2>
                <p className="text-muted">Digital Records</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vaccine Schedule Info */}
      <div className="schedule-section py-5" style={{ background: '#f0f4f8' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <h3 className="fw-bold mb-3">Ethiopian EPI Schedule</h3>
              <p className="text-muted mb-4" style={{ fontSize: '1.05rem' }}>
                Our system automatically calculates vaccination dates based on the 
                Ethiopian Federal Ministry of Health's EPI schedule:
              </p>
              <div className="row g-3">
                <div className="col-6">
                  <div className="bg-white p-3 rounded-3 shadow-sm">
                    <strong>At Birth</strong>
                    <p className="mb-0 text-muted small">BCG, OPV-0</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="bg-white p-3 rounded-3 shadow-sm">
                    <strong>6 Weeks</strong>
                    <p className="mb-0 text-muted small">OPV-1, Penta-1, PCV-1, Rota-1</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="bg-white p-3 rounded-3 shadow-sm">
                    <strong>10 Weeks</strong>
                    <p className="mb-0 text-muted small">OPV-2, Penta-2, PCV-2, Rota-2</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="bg-white p-3 rounded-3 shadow-sm">
                    <strong>14 Weeks</strong>
                    <p className="mb-0 text-muted small">OPV-3, Penta-3, PCV-3, IPV</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="bg-white p-3 rounded-3 shadow-sm">
                    <strong>9 Months</strong>
                    <p className="mb-0 text-muted small">MCV1 (Measles)</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="bg-white p-3 rounded-3 shadow-sm">
                    <strong>15 Months</strong>
                    <p className="mb-0 text-muted small">MCV2 (Measles)</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 text-center">
              <div className="bg-white p-4 rounded-4 shadow-sm">
                <h5 className="fw-bold mb-3">✨ Key Features</h5>
                <ul className="list-unstyled text-start mb-0">
                  <li className="mb-2">✅ Automatic appointment scheduling</li>
                  <li className="mb-2">✅ Email & SMS reminders</li>
                  <li className="mb-2">✅ Digital vaccination certificates</li>
                  <li className="mb-2">✅ QR code verification</li>
                  <li className="mb-2">✅ Vaccine inventory tracking</li>
                  <li className="mb-2">✅ Expiry & low stock alerts</li>
                  <li className="mb-2">✅ Detailed reports for admin</li>
                  <li className="mb-2">✅ Nurse auto-assignment</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="cta-section py-5 text-white text-center" style={{
        background: 'linear-gradient(135deg, #13458a 0%, #1e5fbb 100%)'
      }}>
        <div className="container">
          <h2 className="fw-bold mb-3">Ready to Get Started?</h2>
          <p className="lead mb-4" style={{ opacity: '0.9', maxWidth: '600px', margin: '0 auto' }}>
            Join thousands of parents and health professionals managing childhood vaccinations digitally.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/login" className="btn btn-light btn-lg px-5 fw-bold shadow">
              🔐 Login
            </Link>
            <Link to="/register" className="btn btn-outline-light btn-lg px-5 fw-bold">
              📝 Register
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="footer-info py-4 bg-white text-center border-top">
        <div className="container">
          <p className="text-muted mb-1">
            © 2026 Ethiopian Vaccine Management System. All rights reserved.
          </p>
          <p className="text-muted small mb-0">
            Powered by the Federal Ministry of Health, Ethiopia | Developed by Kalkidan Tamene
          </p>
          <p className="text-muted small mb-0 mt-1">
            Debre Birhan, Menatabiya, Kebele 04 | 📞 0936279621
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;