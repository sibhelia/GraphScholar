import React from 'react';
import { Search, Upload, Download, FolderPlus, Database, Share2, FileText, Activity } from 'lucide-react';

const DashboardView = ({ onSearch, setActiveTab }) => {
    const stats = [
        { label: 'İşlenen Makale', value: '1,240', icon: FileText, color: '#3b82f6' },
        { label: 'Grafik Düğümü', value: '45,802', icon: Share2, color: '#8b5cf6' },
        { label: 'Çıkarılan İlişki', value: '128K', icon: Activity, color: '#10b981' },
        { label: 'Vektör Boyutu', value: '1.2 GB', icon: Database, color: '#f59e0b' },
    ];

    return (
        <div style={{ padding: '3rem 2rem', height: '100%', overflowY: 'auto', backgroundColor: '#fff' }}>
            {/* 1. Merkezi Arama Alani */}
            <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 4rem auto' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.5rem', letterSpacing: '-1px' }}>
                    Literatürde neyi merak ediyorsun?
                </h1>
                <div style={{ position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', borderRadius: '50px' }}>
                    <Search size={24} style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input 
                        type="text" 
                        placeholder="Makale, kavram veya araştırma sorusu yazın..." 
                        style={{
                            width: '100%',
                            padding: '1.25rem 1.5rem 1.25rem 4rem',
                            fontSize: '1.1rem',
                            border: '1px solid var(--border-color)',
                            borderRadius: '50px',
                            outline: 'none',
                            backgroundColor: '#fff',
                            transition: 'all 0.3s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                    />
                </div>
            </div>

            {/* 2. Hizli Eylemler ve Grafik Onizleme */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', maxWidth: '1100px', margin: '0 auto 3rem auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="quick-action-card" onClick={() => setActiveTab('library')} style={actionCardStyle}>
                        <Upload size={24} color="var(--accent-primary)" />
                        <div>
                            <div style={{ fontWeight: '600' }}>PDF Yükle</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Yerel dökümanları işle</div>
                        </div>
                    </div>
                    <div className="quick-action-card" style={actionCardStyle}>
                        <Download size={24} color="#3b82f6" />
                        <div>
                            <div style={{ fontWeight: '600' }}>ArXiv'den Çek</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>ID ile makale getir</div>
                        </div>
                    </div>
                    <div className="quick-action-card" style={actionCardStyle}>
                        <FolderPlus size={24} color="#10b981" />
                        <div>
                            <div style={{ fontWeight: '600' }}>Yeni Çalışma Alanı</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Konuları gruplandır</div>
                        </div>
                    </div>
                    <div className="quick-action-card" style={actionCardStyle}>
                        <Database size={24} color="#f59e0b" />
                        <div>
                            <div style={{ fontWeight: '600' }}>Veri Kaynakları</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>API ve entegrasyonlar</div>
                        </div>
                    </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-main)', borderRadius: '12px', padding: '1rem', position: 'relative', border: '1px solid var(--border-color)', minHeight: '200px', cursor: 'pointer' }} onClick={() => setActiveTab('graph')}>
                    <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Share2 size={14} color="var(--accent-primary)" /> Grafik Önizleme
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '140px', color: 'var(--text-secondary)', fontSize: '11px' }}>
                        [ Son etkileşimli grafik haritası ]
                    </div>
                </div>
            </div>

            {/* 3. Istatistik Paneli */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
                {stats.map((stat, i) => (
                    <div key={i} style={{ backgroundColor: '#fff', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ backgroundColor: stat.color + '15', padding: '10px', borderRadius: '8px' }}>
                            <stat.icon size={20} color={stat.color} />
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '500' }}>{stat.label}</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .quick-action-card {
                    background: #fff;
                    border: 1px solid var(--border-color);
                    padding: 1.25rem;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .quick-action-card:hover {
                    border-color: var(--accent-primary);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                    transform: translateY(-2px);
                }
            `}</style>
        </div>
    );
};

const actionCardStyle = {
    // Stiller CSS icine tasindi
};

export default DashboardView;
