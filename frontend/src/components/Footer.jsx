import React from 'react';

const Footer = () => {
    return (
        <footer className="footer">
            <div>
                © 2026 GraphScholar - Akademik Veri ve Analiz Platformu
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <span>Sürüm: v1.0.0-stable</span>
                <span style={{ color: 'var(--accent-primary)', fontWeight: '500' }}>TÜRKİYE</span>
            </div>
        </footer>
    );
};

export default Footer;
