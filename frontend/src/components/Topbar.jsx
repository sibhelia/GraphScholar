import {
    Bell,
    BookMarked,
    BookOpen,
    FolderKanban,
    MessageSquare,
    Orbit,
    Share2,
    TrendingUp,
    User,
} from 'lucide-react';

const TAB_TITLES = {
    chat: 'Araştırma Asistanı',
    workspace: 'Çalışma Alanı',
    graph: 'Bilgi Grafiği',
    library: 'Kütüphane',
    analytics: 'Analitik',
};

const NAV_ITEMS = [
    { id: 'chat', icon: MessageSquare, label: 'Araştırma' },
    { id: 'workspace', icon: FolderKanban, label: 'Çalışma Alanı' },
    { id: 'graph', icon: Share2, label: 'Grafik' },
    { id: 'library', icon: BookOpen, label: 'Kütüphane' },
    { id: 'analytics', icon: TrendingUp, label: 'Analitik' },
];

const Topbar = ({ activeTab, setActiveTab, libraryStats }) => {
    return (
        <header className="topbar-shell topbar-shell-nav enterprise-topbar">
            <div className="topbar-primary-row enterprise-topbar-row">
                <button
                    className="topbar-brand-identity"
                    onClick={() => setActiveTab('workspace')}
                    aria-label="Çalışma Alanı'na dön"
                >
                    <img src="/logo.png" alt="GraphScholar" className="brand-logo topbar-brand-logo" />
                    <div className="topbar-brand-copy">
                        <strong>GraphScholar</strong>
                        <span>Akademik araştırma çalışma alanı</span>
                    </div>
                </button>

                <div className="topbar-actions enterprise-topbar-actions">
                    <div className="topbar-chip enterprise-chip">
                        <Orbit size={14} />
                        <span>{libraryStats?.concept_count ?? 0} kavram</span>
                    </div>
                    <div className="topbar-chip enterprise-chip">
                        <BookMarked size={14} />
                        <span>{libraryStats?.paper_count ?? 0} makale</span>
                    </div>
                    <button
                        className="topbar-icon-btn enterprise-icon-btn"
                        type="button"
                        aria-label="Bildirimler"
                    >
                        <Bell size={16} />
                    </button>
                    <div className="topbar-profile enterprise-profile">
                        <div className="topbar-profile-copy">
                            <strong>Araştırmacı</strong>
                            <span>Kişisel alan</span>
                        </div>
                        <div className="topbar-avatar">
                            <User size={15} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="topbar-secondary-row enterprise-topbar-row">
                <div className="topbar-page-indicator" aria-live="polite">
                    <span>Aktif sayfa</span>
                    <strong>{TAB_TITLES[activeTab] || 'Çalışma Alanı'}</strong>
                </div>

                <nav className="top-nav-menu enterprise-top-nav" aria-label="Ana gezinme">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            className={`top-nav-item enterprise-top-nav-item ${
                                activeTab === item.id ? 'active' : ''
                            }`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <item.icon size={15} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
        </header>
    );
};

export default Topbar;
