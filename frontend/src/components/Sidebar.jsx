import {
    BookOpen,
    FolderKanban,
    LayoutGrid,
    MessageSquare,
    Share2,
    TrendingUp,
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const menuItems = [
        { id: 'dashboard', icon: LayoutGrid, label: 'Genel Bakış', note: 'özet görünüm' },
        { id: 'chat', icon: MessageSquare, label: 'Araştırma Asistanı', note: 'sor ve incele' },
        { id: 'workspace', icon: FolderKanban, label: 'Çalışma Alanı', note: 'kayıtlar ve düzen' },
        { id: 'graph', icon: Share2, label: 'Bilgi Grafiği', note: 'makale ilişkileri' },
        { id: 'library', icon: BookOpen, label: 'Kütüphane', note: 'belgeler ve kavramlar' },
        { id: 'analytics', icon: TrendingUp, label: 'Analitik', note: 'sinyaller ve boşluklar' },
    ];

    return (
        <aside className="sidebar-shell">
            <button className="brand-panel" onClick={() => setActiveTab('dashboard')}>
                <img src="/logo.png" alt="GraphScholar" className="brand-logo" />
                <div>
                    <div className="brand-title">GraphScholar</div>
                    <div className="brand-subtitle">Akademik araştırma çalışma alanı</div>
                </div>
            </button>

            <div className="sidebar-section">
                <div className="sidebar-kicker">Gezinme</div>
                <nav className="nav-menu">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <div className="nav-icon-wrap">
                                <item.icon size={16} />
                            </div>
                            <div className="nav-copy">
                                <span>{item.label}</span>
                                <small>{item.note}</small>
                            </div>
                        </button>
                    ))}
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;
