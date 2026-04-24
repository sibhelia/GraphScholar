import React from 'react';
import { User, Bell, HelpCircle } from 'lucide-react';

const Topbar = () => {
    return (
        <header className="topbar">
            <div className="system-status">
                <div className="status-dot"></div>
                <span>Sistem Çevrimiçi - Hibrit Veritabanı Aktif</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                    <Bell size={18} style={{ cursor: 'pointer' }} />
                    <HelpCircle size={18} style={{ cursor: 'pointer' }} />
                </div>
                <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-color)' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', textAlign: 'right' }}>
                        <div>Akademik Araştırmacı</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>GraphScholar Pro</div>
                    </div>
                    <div className="avatar">
                        <User size={16} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
