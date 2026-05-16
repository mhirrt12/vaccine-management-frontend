import React, { useEffect } from 'react';

const LanguageSwitcher = () => {

  useEffect(() => {
    // Small delay to let Google Translate initialize
    const timer = setTimeout(() => {
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        // Move the Google Translate select into our navbar
        const container = document.getElementById('language-switcher-container');
        if (container && select.parentElement) {
          container.appendChild(select.parentElement);
          select.style.display = 'block';
          select.style.padding = '4px 8px';
          select.style.borderRadius = '6px';
          select.style.border = '1px solid #dce3ea';
          select.style.fontSize = '14px';
        }
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div id="language-switcher-container" style={{ display: 'inline-block', minWidth: '140px' }}>
      <span className="text-white-50 small">Loading translator...</span>
    </div>
  );
};

export default LanguageSwitcher;