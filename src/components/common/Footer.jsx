import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-section" style={{ background: '#ffffff', color: '#1f2a3e', marginTop: 'auto', borderTop: '1px solid #dce3ea' }}>
      {/* Main Footer */}
      <div className="container py-5">
        <div className="row g-4">
          {/* Brand */}
          <div className="col-lg-5 col-md-12 mb-3">
            <h5 className="fw-bold mb-3" style={{ color: '#1e5fbb', fontSize: '1.1rem' }}>
              🏥 Vaccine Management System
            </h5>
            <p style={{ color: '#5b677b', fontSize: '0.9rem', lineHeight: '1.7' }}>
              A digital solution for childhood immunizations in Ethiopia, following the 
              Federal Ministry of Health EPI schedule. Ensuring timely vaccinations for children 0-5 years.
            </p>
            <p className="small mt-3" style={{ color: '#8896ab' }}>
              📍 Debre Birhan, Menatabiya, Kebele 04
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-lg-3 col-md-6 mb-3">
            <h6 className="fw-bold mb-3" style={{ color: '#1e5fbb', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Quick Links
            </h6>
            <ul className="list-unstyled">
              <li className="mb-2"><a href="/about" style={{ color: '#5b677b', textDecoration: 'none', fontSize: '0.9rem' }}>📖 About Us</a></li>
              <li className="mb-2"><a href="/contact" style={{ color: '#5b677b', textDecoration: 'none', fontSize: '0.9rem' }}>📞 Contact</a></li>
              <li className="mb-2"><a href="/privacy" style={{ color: '#5b677b', textDecoration: 'none', fontSize: '0.9rem' }}>🔒 Privacy Policy</a></li>
              <li className="mb-2"><a href="/terms" style={{ color: '#5b677b', textDecoration: 'none', fontSize: '0.9rem' }}>📋 Terms of Use</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-lg-4 col-md-6 mb-3">
            <h6 className="fw-bold mb-3" style={{ color: '#1e5fbb', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Contact Us
            </h6>
            <ul className="list-unstyled" style={{ fontSize: '0.9rem', color: '#5b677b' }}>
              <li className="mb-2">📞 +251 93 627 9621</li>
              <li className="mb-2">✉️ kaletamene90@gmail.com</li>
              <li className="mb-2">🌐 www.vaccine-ms.com</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="text-center py-3" style={{ background: '#1e5fbb', color: '#ffffff', fontSize: '0.85rem' }}>
        <p className="mb-1">© {currentYear} Ethiopian Vaccine Management System. All rights reserved.</p>
        <p className="mb-0 small" style={{ opacity: '0.85' }}>
          Powered by the Federal Ministry of Health, Ethiopia | Developed by Kalkidan Tamene
        </p>
      </div>
    </footer>
  );
};

export default Footer;