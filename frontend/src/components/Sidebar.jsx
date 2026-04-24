import React from 'react';
import { BookOpen, Share2, MessageSquare, Search, TrendingUp, LayoutGrid } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const menuItems = [
        { id: 'dashboard', icon: LayoutGrid, label: 'Ana Panel' },
        { id: 'chat', icon: MessageSquare, label: 'Komuta Merkezi' },
        { id: 'graph', icon: Share2, label: 'Grafik Keşfi' },
        { id: 'library', icon: BookOpen, label: 'Kütüphanem' },
        { id: 'analytics', icon: TrendingUp, label: 'Analiz & Dashboard' },
    ];

    return (
        <aside className="sidebar">
            <div 
                className="brand" 
                style={{ padding: '0', justifyContent: 'center', height: '120px', backgroundColor: '#fff', borderBottom: 'none', cursor: 'pointer' }}
                onClick={() => setActiveTab('dashboard')}
            >
                <img 
                    src="/logo.png" 
                    alt="GraphScholar" 
                    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px' }} 
                />
            </div>

            {/* Yeni Search Bar - Daha belirgin ve etkilesimli */}
            <div style={{ padding: '1.25rem 1rem 1rem 1rem' }}>
                <div style={{ position: 'relative', width: '100%' }}>
                    <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input 
                        type="text" 
                        className="search-input"
                        placeholder="Hızlı arama..." 
                    />
                </div>
            </div>

            <nav className="nav-menu">
                {menuItems.map((item) => (
                    <div 
                        key={item.id}
                        className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.id)}
                    >
                        <item.icon size={16} />
                        <span>{item.label}</span>
                    </div>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
