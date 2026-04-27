import { ArrowUpRight, Radar, Target, TrendingUp, Users } from 'lucide-react';

const AnalyticsView = ({ papers = [], libraryStats, graphData }) => {
    const trends = [
        { name: 'Yöntem örtüşmesi', value: `${Math.min((libraryStats?.paper_count ?? 0) * 8, 82)}%`, tone: 'blue' },
        { name: 'Atıf yoğunluğu', value: `${libraryStats?.citation_edges ?? 0}`, tone: 'amber' },
        { name: 'Kavram yayılımı', value: `${libraryStats?.concept_count ?? 0}`, tone: 'green' },
    ];

    const collaborations = papers.slice(0, 3).map((paper, index) => ({
        title: paper.title,
        authors: (paper.authors || []).slice(0, 2).join(' + ') || `Araştırma çifti ${index + 1}`,
        topic: (paper.concepts || []).slice(0, 2).join(', ') || 'daha fazla metadata gerekli',
    }));

    return (
        <section className="page-scroll page-analytics">
            <div className="page-header">
                <div>
                    <div className="eyebrow">Sinyaller ve fırsatlar</div>
                    <h2>Analitik</h2>
                    <p>Mevcut kütüphanende hangi alanların güçlü, hangilerinin zayıf kaldığını hızlıca gör.</p>
                </div>
            </div>

            <div className="stats-grid">
                {trends.map((trend) => (
                    <article key={trend.name} className={`stat-card tone-${trend.tone}`}>
                        <span>{trend.name}</span>
                        <strong>{trend.value}</strong>
                        <small>mevcut çalışma alanından türetildi</small>
                    </article>
                ))}
            </div>

            <div className="dashboard-grid">
                <section className="surface-card">
                    <div className="section-head">
                        <div>
                            <div className="eyebrow">Kapsama görünümü</div>
                            <h3>Mevcut durum</h3>
                        </div>
                    </div>
                    <div className="signal-grid">
                        <div className="signal-card">
                            <Target size={18} />
                            <strong>{papers.length} makalelik kapsam</strong>
                            <span>Mevcut çalışma alanın hâlâ kompakt; bu da odaklı keşif için iyi.</span>
                        </div>
                        <div className="signal-card">
                            <Radar size={18} />
                            <strong>{graphData?.nodes?.length ?? 0} eşlenen düğüm</strong>
                            <span>Grafik yerel ilişki takibi ve kavram keşfi için şimdiden kullanışlı.</span>
                        </div>
                        <div className="signal-card">
                            <TrendingUp size={18} />
                            <strong>{libraryStats?.chunk_count ?? 0} aranabilir parça</strong>
                            <span>Anlamsal arama kapsamı her indekslenen PDF ile büyür.</span>
                        </div>
                    </div>
                </section>

                <section className="surface-card">
                    <div className="section-head">
                        <div>
                            <div className="eyebrow">Olası eşleşmeler</div>
                            <h3>İlginç yazar veya konu birleşimleri</h3>
                        </div>
                    </div>
                    <div className="paper-stack">
                        {collaborations.length === 0 && (
                            <div className="empty-card">
                                <Users size={18} />
                                <span>İşbirliği veya konu örüntülerini görmek için önce makale ekle.</span>
                            </div>
                        )}
                        {collaborations.map((item) => (
                            <article key={item.title} className="paper-row-card">
                                <div className="paper-row-main">
                                    <strong>{item.authors}</strong>
                                    <span>{item.title}</span>
                                </div>
                                <div className="paper-row-meta">
                                    <span>{item.topic}</span>
                                    <ArrowUpRight size={14} />
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </section>
    );
};

export default AnalyticsView;
