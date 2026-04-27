import { BookOpen, Share2, MessageSquare, TrendingUp, LayoutGrid } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, papers = [] }) => {
    const menuItems = [
        { id: 'dashboard', icon: LayoutGrid, label: 'Genel Bakış', note: 'çalışma alanı özeti' },
        { id: 'chat', icon: MessageSquare, label: 'Araştırma Asistanı', note: 'sor ve incele' },
        { id: 'graph', icon: Share2, label: 'Bilgi Grafiği', note: 'makale ilişkileri' },
        { id: 'library', icon: BookOpen, label: 'Kütüphane', note: 'belgeler ve kavramlar' },
        { id: 'analytics', icon: TrendingUp, label: 'Analitik', note: 'sinyaller ve boşluklar' },
    ];

    const recentPapers = papers.slice(0, 3);

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

            <div className="sidebar-section sidebar-card">
                <div className="sidebar-kicker">Çalışma Alanı</div>
                <div className="sidebar-metric">
                    <strong>{papers.length}</strong>
                    <span>indekslenen makale</span>
                </div>
                <div className="sidebar-mini-list">
                    {recentPapers.length === 0 && (
                        <div className="sidebar-mini-empty">
                            Grafiği oluşturmak için ilk makaleni yükle.
                        </div>
                    )}
                    {recentPapers.map((paper) => (
                        <button
                            key={paper.id}
                            className="sidebar-mini-item"
                            onClick={() => setActiveTab('library')}
                        >
                            <span>{paper.title}</span>
                            <small>{paper.year || 'yıl yok'}</small>
                        </button>
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
