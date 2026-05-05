import { Quote, Database, Share2, Network, FileText, ChevronRight, X, ExternalLink } from 'lucide-react';
import { useState } from 'react';

const WorkspaceView = ({ papers = [], libraryStats, setActiveTab }) => {
    const [activeKpi, setActiveKpi] = useState(null);
    const recentPapers = papers.slice(0, 10);

    const kpiDetails = {
        papers: {
            title: 'TOPLAM MAKALE',
            color: '#e11d48',
            bg: 'linear-gradient(135deg, #fff 0%, #fff1f2 100%)',
            icon: FileText,
            items: papers.slice(0, 5).map(p => ({ title: p.title, subtitle: (p.authors || []).join(', ') })),
            tabName: 'Kütüphane',
            tab: 'library'
        },
        concepts: {
            title: 'SEMANTİK VARLIKLAR',
            color: '#2563eb',
            bg: 'linear-gradient(135deg, #fff 0%, #eff6ff 100%)',
            icon: Network,
            items: [
                { title: 'Transformer Mimarisi', subtitle: 'Makine Öğrenmesi' },
                { title: 'Self-Attention', subtitle: 'NLP' },
                { title: 'Graph Neural Networks', subtitle: 'Graf Analizi' },
                { title: 'Semantik Vektörler', subtitle: 'Bilgi Çıkarımı' },
                { title: 'Knowledge Graphs', subtitle: 'Veri Yapıları' }
            ],
            tabName: 'Semantik Varlıklar',
            tab: 'graph'
        },
        chunks: {
            title: 'BİLGİ PARÇASI',
            color: '#d97706',
            bg: 'linear-gradient(135deg, #fff 0%, #fffbeb 100%)',
            icon: Quote,
            items: [
                { title: 'Metin Analiz Birimi #42', subtitle: 'Özet ve Çıkarım' },
                { title: 'Semantik Segment #12', subtitle: 'Vektör Uzayı' },
                { title: 'Veri Kaynağı Alpha', subtitle: 'Ham Metin İşleme' },
                { title: 'Bağlamsal Çerçeve #9', subtitle: 'RAG Modeli' },
                { title: 'İndeksleme Birimi #5', subtitle: 'Hızlı Erişim' }
            ],
            tabName: 'Analiz Paneli',
            tab: 'analytics'
        },
        citations: {
            title: 'TOPLAM ATIF',
            color: '#8b5cf6',
            bg: 'linear-gradient(135deg, #fff 0%, #f5f3ff 100%)',
            icon: Share2,
            items: [
                { title: 'Deep Learning in Nature', subtitle: 'Atıf Yapan: AI Review 2024' },
                { title: 'Graph Theory Basics', subtitle: 'Atıf Yapan: Tech Journal' },
                { title: 'Neural Networks Overview', subtitle: 'Atıf Yapan: Science Daily' },
                { title: 'Quantum Computing Intro', subtitle: 'Atıf Yapan: Future Tech' },
                { title: 'Data Structures Guide', subtitle: 'Atıf Yapan: Academic Weekly' }
            ],
            tabName: 'Analitik',
            tab: 'analytics'
        }
    };

    return (
        <section className="page-scroll page-workspace" style={{ padding: '24px', position: 'relative' }}>
            {/* KPI Modal */}
            {activeKpi && (
                <div style={{ 
                    position: 'fixed', 
                    top: 0, left: 0, right: 0, bottom: 0, 
                    background: 'rgba(15, 23, 42, 0.4)', 
                    backdropFilter: 'blur(8px)', 
                    zIndex: 1000, 
                    display: 'grid', 
                    placeItems: 'center',
                    padding: '20px'
                }} onClick={() => setActiveKpi(null)}>
                    <div style={{ 
                        background: '#ffffff', 
                        width: '100%', 
                        maxWidth: '600px', 
                        borderRadius: '24px', 
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                        overflow: 'hidden',
                        animation: 'modalSlideIn 0.3s ease-out'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ background: kpiDetails[activeKpi].bg, padding: '20px 24px', borderBottom: '1px solid #f1f5f9', position: 'relative' }}>
                            <button 
                                onClick={() => setActiveKpi(null)}
                                style={{ position: 'absolute', top: '16px', right: '16px', background: '#fff', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', color: '#64748b' }}
                            >
                                <X size={18} />
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ background: kpiDetails[activeKpi].color, color: '#fff', padding: '8px', borderRadius: '10px' }}>
                                    {(() => {
                                        const Icon = kpiDetails[activeKpi].icon;
                                        return <Icon size={20} />;
                                    })()}
                                </div>
                                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: kpiDetails[activeKpi].color, letterSpacing: '0.05em' }}>{kpiDetails[activeKpi].title}</h3>
                            </div>
                        </div>
                        <div style={{ padding: '20px 24px' }}>
                            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '12px', fontWeight: '600' }}>Son Kayıtlar:</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {kpiDetails[activeKpi].items.map((item, i) => (
                                    <div key={i} style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                        <h4 style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: '700', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</h4>
                                        <p style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '500' }}>{item.subtitle}</p>
                                    </div>
                                ))}
                            </div>
                            <button 
                                onClick={() => { setActiveTab(kpiDetails[activeKpi].tab); setActiveKpi(null); }}
                                style={{ 
                                    width: '100%', 
                                    marginTop: '20px', 
                                    padding: '12px', 
                                    background: kpiDetails[activeKpi].color, 
                                    color: '#fff', 
                                    border: 'none', 
                                    borderRadius: '12px', 
                                    fontWeight: '700', 
                                    fontSize: '0.85rem', 
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxShadow: `0 8px 15px -3px ${kpiDetails[activeKpi].color}40`
                                }}
                            >
                                Daha fazlası için {kpiDetails[activeKpi].tabName} kısmına git <ExternalLink size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="page-header" style={{ marginBottom: '32px' }}>
                <div>
                    <div className="eyebrow" style={{ color: '#10b981' }}>GENEL BAKIŞ</div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.03em' }}>Çalışma Alanı</h2>
                    <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: '8px', lineHeight: '1.6' }}>
                        Dijital kütüphanenizin yönetim merkezindesiniz. Burada toplam makale hacminizi, sistem tarafından çıkarılan kavramsal varlıkları ve analiz edilen bilgi parçalarını takip edebilir, son eklediğiniz çalışmalara hızlıca göz atarak araştırmanıza kaldığınız yerden devam edebilirsiniz.
                    </p>
                </div>
            </div>

            <div className="workspace-main-content" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    <article 
                        className="surface-card" 
                        onClick={() => setActiveKpi('papers')}
                        style={{ 
                            padding: '24px', 
                            background: 'linear-gradient(135deg, #fff 0%, #fff1f2 100%)', 
                            border: '1px solid #fecdd3', 
                            borderRadius: '20px', 
                            boxShadow: '0 4px 15px rgba(225, 29, 72, 0.05)',
                            position: 'relative',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(225, 29, 72, 0.03)', borderRadius: '50%' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ background: '#fb7185', color: '#fff', padding: '8px', borderRadius: '10px', display: 'grid', placeItems: 'center' }}>
                                <FileText size={20} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                <strong style={{ fontSize: '1.8rem', color: '#e11d48', fontWeight: '800' }}>{papers.length}</strong>
                                <span style={{ fontSize: '0.85rem', color: '#9f1239', fontWeight: '700', letterSpacing: '0.05em' }}>TOPLAM MAKALE</span>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#be123c', opacity: 0.8, fontWeight: '500' }}>Kütüphanenizdeki işlenmiş doküman hacmi.</p>
                    </article>

                    <article 
                        className="surface-card" 
                        onClick={() => setActiveKpi('concepts')}
                        style={{ 
                            padding: '24px', 
                            background: 'linear-gradient(135deg, #fff 0%, #eff6ff 100%)', 
                            border: '1px solid #bfdbfe', 
                            borderRadius: '20px', 
                            boxShadow: '0 4px 15px rgba(37, 99, 235, 0.05)',
                            position: 'relative',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(37, 99, 235, 0.03)', borderRadius: '50%' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ background: '#60a5fa', color: '#fff', padding: '8px', borderRadius: '10px', display: 'grid', placeItems: 'center' }}>
                                <Network size={20} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                <strong style={{ fontSize: '1.8rem', color: '#2563eb', fontWeight: '800' }}>{libraryStats?.concept_count ?? 0}</strong>
                                <span style={{ fontSize: '0.85rem', color: '#1e40af', fontWeight: '700', letterSpacing: '0.05em' }}>SEMANTİK VARLIKLAR</span>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#1e40af', opacity: 0.8, fontWeight: '500' }}>Graf veritabanındaki semantik düğüm ve kavram sayısı.</p>
                    </article>

                    <article 
                        className="surface-card" 
                        onClick={() => setActiveKpi('chunks')}
                        style={{ 
                            padding: '24px', 
                            background: 'linear-gradient(135deg, #fff 0%, #fffbeb 100%)', 
                            border: '1px solid #fde68a', 
                            borderRadius: '20px', 
                            boxShadow: '0 4px 15px rgba(217, 119, 6, 0.05)',
                            position: 'relative',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(217, 119, 6, 0.03)', borderRadius: '50%' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ background: '#fbbf24', color: '#fff', padding: '8px', borderRadius: '10px', display: 'grid', placeItems: 'center' }}>
                                <Quote size={20} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                <strong style={{ fontSize: '1.8rem', color: '#d97706', fontWeight: '800' }}>{libraryStats?.chunk_count ?? 0}</strong>
                                <span style={{ fontSize: '0.85rem', color: '#92400e', fontWeight: '700', letterSpacing: '0.05em' }}>BİLGİ PARÇASI</span>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#92400e', opacity: 0.8, fontWeight: '500' }}>Vektör uzayına aktarılan analiz birimleri.</p>
                    </article>

                    <article 
                        className="surface-card" 
                        onClick={() => setActiveKpi('citations')}
                        style={{ 
                            padding: '24px', 
                            background: 'linear-gradient(135deg, #fff 0%, #f5f3ff 100%)', 
                            border: '1px solid #ddd6fe', 
                            borderRadius: '20px', 
                            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.05)',
                            position: 'relative',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(139, 92, 246, 0.03)', borderRadius: '50%' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ background: '#8b5cf6', color: '#fff', padding: '8px', borderRadius: '10px', display: 'grid', placeItems: 'center' }}>
                                <Share2 size={20} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                <strong style={{ fontSize: '1.8rem', color: '#7c3aed', fontWeight: '800' }}>{libraryStats?.citation_edges ?? 0}</strong>
                                <span style={{ fontSize: '0.85rem', color: '#5b21b6', fontWeight: '700', letterSpacing: '0.05em' }}>TOPLAM ATIF</span>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#5b21b6', opacity: 0.8, fontWeight: '500' }}>Makalelerinizin akademik etki ve referans gücü.</p>
                    </article>
                </div>

                <section className="surface-card" style={{ 
                    padding: '24px 32px', 
                    background: 'rgba(255, 255, 255, 0.4)', 
                    backdropFilter: 'blur(20px)',
                    border: '1px solid #e2e8f0', 
                    borderRadius: '24px', 
                    boxShadow: '0 4px 24px rgba(0,0,0,0.01)' 
                }}>
                    <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '2px' }}>Son Eklenen Kayıtlar</h3>
                            <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '500' }}>Kütüphanenize en son dahil edilen, analiz edilmeye hazır akademik çalışmalar ve literatür taramaları.</p>
                        </div>
                        <button 
                            className="btn-secondary" 
                            onClick={() => setActiveTab('library')}
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                background: '#ffffff', 
                                border: '1px solid #e2e8f0', 
                                padding: '8px 16px', 
                                borderRadius: '10px',
                                color: '#475569',
                                fontWeight: '600',
                                fontSize: '0.8rem',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                            }}
                        >
                            Tümünü Gör <ChevronRight size={14} />
                        </button>
                    </div>

                    <div className="workspace-paper-grid" style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(5, 1fr)', 
                        gap: '16px',
                        minHeight: '320px' // Ensures space for 10 items (roughly 2 rows)
                    }}>
                        {recentPapers.length === 0 && (
                            <div className="empty-card" style={{ gridColumn: '1/-1', padding: '60px 20px', textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: '20px', background: 'rgba(248, 250, 252, 0.5)' }}>
                                <Database size={40} style={{ marginBottom: '12px', color: '#94a3b8', opacity: 0.5 }} />
                                <h4 style={{ color: '#475569', marginBottom: '6px', fontSize: '0.9rem' }}>Henüz kayıt yok</h4>
                                <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Kütüphaneye ilk makalenizi ekleyerek başlayın.</p>
                            </div>
                        )}

                        {recentPapers.map((paper) => (
                            <article key={paper.id} className="workspace-paper-card" style={{ 
                                padding: '16px', 
                                background: 'rgba(16, 185, 129, 0.04)', 
                                border: '1px solid rgba(16, 185, 129, 0.1)', 
                                borderRadius: '16px',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '140px',
                                justifyContent: 'space-between'
                            }}
                            onMouseOver={(e) => { 
                                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)';
                                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.2)'; 
                                e.currentTarget.style.transform = 'translateY(-3px)'; 
                            }}
                            onMouseOut={(e) => { 
                                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.04)';
                                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.1)'; 
                                e.currentTarget.style.transform = 'translateY(0)'; 
                            }}
                        >
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <div style={{ width: '28px', height: '28px', background: '#ffffff', borderRadius: '8px', display: 'grid', placeItems: 'center', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                            <FileText size={14} />
                                        </div>
                                        <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#10b981', background: '#ffffff', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>{paper.year || '2024'}</span>
                                    </div>
                                    <h4 style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: '700', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {paper.title}
                                    </h4>
                                </div>
                                <p style={{ fontSize: '0.74rem', color: '#64748b', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontWeight: '600' }}>
                                    {(paper.authors || []).join(', ') || 'Yazar belirtilmemiş'}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </section>
    );
};

export default WorkspaceView;
