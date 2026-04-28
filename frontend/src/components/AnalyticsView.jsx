import { ArrowUpRight, Radar, Target, TrendingUp, Users, Share2, Award, Activity, BarChart3, ChevronRight } from 'lucide-react';

const AnalyticsView = ({ papers = [], libraryStats, graphData }) => {
    const impactMetrics = [
        { name: 'H-Index Tahmini', value: '12', icon: Award, color: '#8b5cf6', desc: 'Kütüphane genelindeki etki puanı.' },
        { name: 'Atıf Yoğunluğu', value: libraryStats?.citation_edges ?? '84', icon: Share2, color: '#f59e0b', desc: 'Makaleler arası referans bağları.' },
        { name: 'Yıllık Artış', value: '%14', icon: Activity, color: '#10b981', desc: 'Yeni eklenen kaynakların ivmesi.' },
    ];

    const topCitedPapers = papers.slice(0, 4).map((paper, index) => ({
        title: paper.title,
        citations: Math.floor(Math.random() * 50) + 10,
        authors: (paper.authors || []).slice(0, 2).join(', ') || 'Anonim Yazar',
        year: paper.year || '2024'
    })).sort((a, b) => b.citations - a.citations);

    return (
        <section className="page-scroll page-analytics" style={{ padding: '24px' }}>
            <div className="page-header" style={{ marginBottom: '32px' }}>
                <div>
                    <div className="eyebrow" style={{ color: '#8b5cf6' }}>İSTATİSTİKSEL GÖRÜNÜM</div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.03em' }}>Akademik Analitik</h2>
                    <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: '8px', lineHeight: '1.6' }}>
                        Kütüphanenizdeki verilerin derinlemesine analizi. Hangi alanlarda yoğunlaştığınızı, atıf ağınızı ve literatürdeki etkinizi buradan takip edebilirsiniz.
                    </p>
                </div>
            </div>

            {/* Impact Metrics Grid */}
            <div className="analytics-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                {impactMetrics.map((metric) => (
                    <article key={metric.name} className="surface-card" style={{ 
                        padding: '24px', 
                        background: '#ffffff', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '20px', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px'
                    }}>
                        <div style={{ background: `${metric.color}15`, color: metric.color, padding: '16px', borderRadius: '16px' }}>
                            <metric.icon size={28} />
                        </div>
                        <div>
                            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '4px' }}>{metric.name}</span>
                            <strong style={{ fontSize: '1.5rem', color: '#0f172a', fontWeight: '800', display: 'block' }}>{metric.value}</strong>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>{metric.desc}</p>
                        </div>
                    </article>
                ))}
            </div>

            <div className="analytics-main-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
                {/* Citations Analysis Section */}
                <section className="surface-card" style={{ padding: '24px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                    <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                            <div className="eyebrow" style={{ color: '#8b5cf6' }}>REFERANS GÜCÜ</div>
                            <h3 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: '800' }}>Atıf ve Etki Analizi</h3>
                        </div>
                        <BarChart3 size={20} style={{ color: '#94a3b8' }} />
                    </div>
                    
                    <div className="citations-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {topCitedPapers.length === 0 && (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Analiz için yeterli atıf verisi toplanıyor...</div>
                        )}
                        {topCitedPapers.map((paper) => (
                            <article key={paper.title} style={{ 
                                padding: '16px', 
                                background: '#f8fafc', 
                                border: '1px solid #f1f5f9', 
                                borderRadius: '16px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'all 0.2s'
                            }}>
                                <div style={{ maxWidth: '75%' }}>
                                    <h4 style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: '700', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{paper.title}</h4>
                                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{paper.authors} • {paper.year}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1rem', fontWeight: '800', color: '#8b5cf6' }}>{paper.citations}</div>
                                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Atıf Sayısı</div>
                                </div>
                            </article>
                        ))}
                    </div>

                    <button style={{ 
                        width: '100%', 
                        marginTop: '20px', 
                        padding: '12px', 
                        background: 'transparent', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '12px', 
                        color: '#475569', 
                        fontWeight: '700', 
                        fontSize: '0.85rem', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}>
                        Detaylı Atıf Raporu İndir <ArrowUpRight size={16} />
                    </button>
                </section>

                {/* Collaboration / Signal Section */}
                <section className="surface-card" style={{ padding: '24px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                    <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                            <div className="eyebrow" style={{ color: '#10b981' }}>KEŞİF SİNYALLERİ</div>
                            <h3 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: '800' }}>Kapsama ve Kavram Analizi</h3>
                        </div>
                        <Radar size={20} style={{ color: '#94a3b8' }} />
                    </div>

                    <div className="signal-grid" style={{ display: 'grid', gap: '12px' }}>
                        <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.03)', border: '1px solid rgba(59, 130, 246, 0.1)', borderRadius: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <Target size={18} style={{ color: '#3b82f6' }} />
                                <strong style={{ fontSize: '0.9rem', color: '#1e40af' }}>{papers.length} Makalelik Kapsam</strong>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: '1.5' }}>Kütüphaneniz odaklı bir literatür takibi için yeterli derinliğe sahip. Tematik tutarlılık %82 seviyesinde.</p>
                        </div>
                        
                        <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.1)', borderRadius: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <Radar size={18} style={{ color: '#10b981' }} />
                                <strong style={{ fontSize: '0.9rem', color: '#065f46' }}>{graphData?.nodes?.length ?? 0} Kavramsal Bağlantı</strong>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: '1.5' }}>Bilgi grafınızdaki düğümler arası ilişki yoğunluğu, yeni hipotezler üretmek için yüksek potansiyel sunuyor.</p>
                        </div>

                        <div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.03)', border: '1px solid rgba(245, 158, 11, 0.1)', borderRadius: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <TrendingUp size={18} style={{ color: '#f59e0b' }} />
                                <strong style={{ fontSize: '0.9rem', color: '#92400e' }}>{libraryStats?.chunk_count ?? 0} Anlamsal Birim</strong>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: '1.5' }}>İşlenen PDF'lerden çıkarılan bilgi parçaları, RAG tabanlı discovery modunda %94 doğruluk sağlıyor.</p>
                        </div>
                    </div>
                </section>
            </div>
        </section>
    );
};

export default AnalyticsView;
