import React from 'react';
import { TrendingUp, Users, Target, Zap, ArrowRight } from 'lucide-react';

const AnalyticsView = () => {
    const trends = [
        { name: 'LLM Reasoning', growth: '+45%', color: '#8b5cf6' },
        { name: 'Graph Neural Networks', growth: '+32%', color: '#3b82f6' },
        { name: 'Hybrid RAG', growth: '+28%', color: '#10b981' },
        { name: 'Knowledge Graphs', growth: '+15%', color: '#f59e0b' },
    ];

    const collaborations = [
        { p1: 'Dr. Ahmet Yılmaz (AI)', p2: 'Dr. Selin Demir (Tıp)', topic: 'Tanısal Graf Analizi' },
        { p1: 'Prof. Can Berk (Veri)', p2: 'Dr. Ece Kaya (Sosyal)', topic: 'Dijital Antropoloji' },
    ];

    return (
        <div style={{ padding: '2rem', height: '100%', overflowY: 'auto', backgroundColor: 'var(--bg-main)' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>Kurumsal Dashborad</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Üniversite geneli akademik yetkinlik ve stratejik işbirliği analizi.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', color: 'var(--accent-primary)' }}>
                        <Target size={20} />
                        <span style={{ fontWeight: '600' }}>Yetkinlik Haritası</span>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '700' }}>%78 Savunma</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Yapay Zeka & Siber Güvenlik odaklı</div>
                </div>
                <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', color: '#10b981' }}>
                        <Zap size={20} />
                        <span style={{ fontWeight: '600' }}>Aktif Projeler</span>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '700' }}>124 Yayın</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Son 30 günde eklenen veriler</div>
                </div>
                <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', color: '#3b82f6' }}>
                        <TrendingUp size={20} />
                        <span style={{ fontWeight: '600' }}>Trend Yakalama</span>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '700' }}>Yüksek</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Global literatürle uyum skoru</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Trend Paneli */}
                <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingUp size={18} /> Yükselen Kavramlar
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {trends.map((t, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: t.color }} />
                                    <span style={{ fontSize: '13px' }}>{t.name}</span>
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: '600', color: '#10b981' }}>{t.growth}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Isbirligi Paneli */}
                <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={18} /> Potansiyel İşbirlikleri
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {collaborations.map((c, i) => (
                            <div key={i} style={{ padding: '10px', backgroundColor: 'var(--bg-main)', borderRadius: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: '600' }}>{c.p1} + {c.p2}</span>
                                    <ArrowRight size={14} />
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Konu: {c.topic}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsView;
