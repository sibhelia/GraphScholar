import { ArrowRight, BookOpen, Database, GitBranch, MessageSquareText, Upload } from 'lucide-react';

const DashboardView = ({ setActiveTab, papers = [], libraryStats, graphData }) => {
    const stats = [
        { label: 'Makale', value: libraryStats?.paper_count ?? 0, helper: 'indekslenen belge' },
        { label: 'Kavram', value: libraryStats?.concept_count ?? 0, helper: 'tespit edilen varlık' },
        { label: 'Atıf', value: libraryStats?.citation_edges ?? 0, helper: 'grafik bağlantısı' },
        { label: 'Parça', value: libraryStats?.chunk_count ?? 0, helper: 'arama birimi' },
    ];

    const quickActions = [
        {
            title: 'Makale ekle',
            description: 'PDF yükle, metadata çıkar ve grafiği kavramlarla zenginleştir.',
            icon: Upload,
            action: () => setActiveTab('library'),
        },
        {
            title: 'Asistana sor',
            description: 'Kendi korpusunda arama yap ve destekleyici kaynak metinleri incele.',
            icon: MessageSquareText,
            action: () => setActiveTab('chat'),
        },
        {
            title: 'Grafiği incele',
            description: 'Makaleler, kavramlar ve atıflar nasıl bağlanıyor gör.',
            icon: GitBranch,
            action: () => setActiveTab('graph'),
        },
    ];

    const recentPapers = papers.slice(0, 4);
    const graphNodeCount = graphData?.nodes?.length ?? 0;
    const graphEdgeCount = graphData?.edges?.length ?? 0;

    return (
        <section className="page-scroll page-dashboard">
            <div className="hero-grid">
                <div className="hero-card hero-card-main">
                    <div className="eyebrow">Araştırma işletim sistemi</div>
                    <h2>Dağınık makaleleri sorgulanabilir bir akademik çalışma alanına dönüştür.</h2>
                    <p>
                        GraphScholar yüklediğin makaleleri indeksler, kavramları çıkarır,
                        atıf yapısını haritalar ve soru-cevap sırasında kaynak metinleri görünür tutar.
                    </p>
                    <div className="hero-actions">
                        <button className="btn-primary btn-lg" onClick={() => setActiveTab('library')}>
                            <Upload size={16} />
                            Makale yükle
                        </button>
                        <button className="btn-secondary btn-lg" onClick={() => setActiveTab('chat')}>
                            <MessageSquareText size={16} />
                            Soru sormaya başla
                        </button>
                    </div>
                </div>

                <div className="hero-card hero-card-side">
                    <div className="eyebrow">Grafik özeti</div>
                    <div className="hero-metric-block">
                        <div>
                            <strong>{graphNodeCount}</strong>
                            <span>görünür düğüm</span>
                        </div>
                        <div>
                            <strong>{graphEdgeCount}</strong>
                            <span>görünür kenar</span>
                        </div>
                    </div>
                    <div className="hero-mini-map">
                        {(graphData?.nodes || []).slice(0, 8).map((node) => (
                            <span key={node.id} className={`mini-pill ${node.group || 'paper'}`}>
                                {node.label}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="stats-grid">
                {stats.map((stat) => (
                    <article key={stat.label} className="stat-card">
                        <span>{stat.label}</span>
                        <strong>{stat.value}</strong>
                        <small>{stat.helper}</small>
                    </article>
                ))}
            </div>

            <div className="dashboard-grid">
                <section className="surface-card">
                    <div className="section-head">
                        <div>
                            <div className="eyebrow">Aksiyonlar</div>
                            <h3>Sıradaki adım ne olsun?</h3>
                        </div>
                    </div>
                    <div className="action-list">
                        {quickActions.map((item) => (
                            <button key={item.title} className="action-card" onClick={item.action}>
                                <div className="action-card-icon">
                                    <item.icon size={18} />
                                </div>
                                <div className="action-card-copy">
                                    <strong>{item.title}</strong>
                                    <span>{item.description}</span>
                                </div>
                                <ArrowRight size={16} />
                            </button>
                        ))}
                    </div>
                </section>

                <section className="surface-card">
                    <div className="section-head">
                        <div>
                            <div className="eyebrow">Son eklenenler</div>
                            <h3>Yeni indekslenen makaleler</h3>
                        </div>
                        <button className="text-link" onClick={() => setActiveTab('library')}>
                            Kütüphaneyi aç
                        </button>
                    </div>

                    <div className="paper-stack">
                        {recentPapers.length === 0 && (
                            <div className="empty-card">
                                <BookOpen size={18} />
                                <span>Henüz makale yok. Çalışma alanını başlatmak için PDF yükle.</span>
                            </div>
                        )}

                        {recentPapers.map((paper) => (
                            <article key={paper.id} className="paper-row-card">
                                <div className="paper-row-main">
                                    <strong>{paper.title}</strong>
                                    <span>{(paper.authors || []).slice(0, 3).join(', ') || 'yazar bilgisi yok'}</span>
                                </div>
                                <div className="paper-row-meta">
                                    <span>{paper.year || 'yok'}</span>
                                    <span>{paper.citation_count} atıf</span>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>

            <div className="dashboard-grid">
                <section className="surface-card">
                    <div className="section-head">
                        <div>
                            <div className="eyebrow">Sistem durumu</div>
                            <h3>Arama omurgası</h3>
                        </div>
                    </div>
                    <div className="signal-grid">
                        <div className="signal-card">
                            <Database size={18} />
                            <strong>Vektör arama</strong>
                            <span>İşlenmiş kaynak metinler anlamsal arama ve kaynak gösterimi için hazır.</span>
                        </div>
                        <div className="signal-card">
                            <GitBranch size={18} />
                            <strong>Grafik akıl yürütme</strong>
                            <span>Makale ve kavram bağları yalnızca embedding ötesinde yapısal bağlam sağlar.</span>
                        </div>
                    </div>
                </section>
            </div>
        </section>
    );
};

export default DashboardView;
