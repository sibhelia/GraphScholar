import { Bell, BookMarked, Orbit, User } from 'lucide-react';

const TAB_TITLES = {
    dashboard: 'Genel Bakış',
    chat: 'Araştırma Asistanı',
    workspace: 'Çalışma Alanı',
    graph: 'Bilgi Grafiği',
    library: 'Kütüphane',
    analytics: 'Analitik',
};

const Topbar = ({ activeTab, libraryStats }) => {
    return (
        <header className="topbar-shell">
            <div className="topbar-copy">
                <div className="topbar-eyebrow">GraphScholar çalışma alanı</div>
                <h1>{TAB_TITLES[activeTab] || 'Çalışma Alanı'}</h1>
            </div>

            <div className="topbar-actions">
                <div className="topbar-chip">
                    <Orbit size={14} />
                    <span>{libraryStats?.concept_count ?? 0} kavram bağlı</span>
                </div>
                <div className="topbar-chip">
                    <BookMarked size={14} />
                    <span>{libraryStats?.paper_count ?? 0} makale indekslendi</span>
                </div>
                <button className="topbar-icon-btn" type="button" aria-label="Bildirimler">
                    <Bell size={16} />
                </button>
                <div className="topbar-profile">
                    <div className="topbar-profile-copy">
                        <strong>Araştırmacı</strong>
                        <span>kişisel çalışma alanı</span>
                    </div>
                    <div className="topbar-avatar">
                        <User size={15} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
