import {
    BookOpen,
    Calendar,
    CheckCircle,
    FileText,
    Loader2,
    Quote,
    Share2,
    Sparkles,
    ArrowLeft,
    Upload,
    UserCheck,
} from 'lucide-react';

const LibraryView = ({ onUpload, onAddPaper, isUploading, uploadStatus, papers = [], libraryStats, setActiveTab, previousTab }) => {
    const stats = [
        { label: 'Makale', value: libraryStats?.paper_count ?? 0, icon: FileText },
        { label: 'Yazar', value: libraryStats?.author_count ?? 0, icon: Share2 },
        { label: 'Kavram', value: libraryStats?.concept_count ?? 0, icon: BookOpen },
        { label: 'Parça', value: libraryStats?.chunk_count ?? 0, icon: Quote },
    ];

    const hasSuccessStatus = uploadStatus?.toLowerCase().includes('başarı');

    return (
        <section className="page-scroll page-library">
            <div className="page-header library-header-minimal" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <button 
                    className="btn-back"
                    onClick={() => setActiveTab(previousTab || 'chat')}
                    style={{ 
                        background: '#f1f5f9', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '10px', 
                        width: '40px', 
                        height: '40px', 
                        display: 'grid', 
                        placeItems: 'center', 
                        color: '#475569',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <div className="eyebrow">Kişisel korpus</div>
                    <h2>Kütüphane</h2>
                </div>
            </div>

            <section className="library-hero-card library-hero-card-minimal">
                <label className={`upload-dropzone upload-dropzone-hero ${isUploading ? 'loading' : ''}`}>
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => onUpload(e.target.files[0])}
                        className="hidden-file-input"
                        disabled={isUploading}
                    />

                    <div className="upload-icon-wrap">
                        {isUploading ? (
                            <Loader2 size={28} className="animate-spin" />
                        ) : hasSuccessStatus ? (
                            <CheckCircle size={28} />
                        ) : (
                            <Upload size={28} />
                        )}
                    </div>

                    <div className="upload-copy">
                        <strong>{isUploading ? 'Yükleniyor' : 'PDF yükle'}</strong>
                        <span>{uploadStatus || 'Dosya seç veya sürükle bırak'}</span>
                    </div>
                </label>

                {/* Quick Add by Title */}
                <div style={{ padding: '24px', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center', background: '#f8fafc' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Hızlı Makale Ekle</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                            type="text" 
                            id="quick-add-input"
                            placeholder="Makale başlığı girin..." 
                            style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.85rem', width: '220px', outline: 'none', background: '#fff' }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.target.value) {
                                    onAddPaper(e.target.value);
                                    e.target.value = '';
                                }
                            }}
                        />
                        <button 
                            onClick={() => {
                                const input = document.getElementById('quick-add-input');
                                if (input.value) {
                                    onAddPaper(input.value);
                                    input.value = '';
                                }
                            }}
                            style={{ background: '#0f172a', color: '#fff', padding: '10px', borderRadius: '10px', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
                        >
                            <Sparkles size={16} />
                        </button>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ArXiv veritabanından anında çeker.</span>
                </div>

                <div className="library-visual-panel">
                    <div className="library-hero-badge">
                        <Sparkles size={16} />
                        <span>Düzenli görünüm</span>
                    </div>

                    <div className="library-visual-grid">
                        {stats.map((stat) => (
                            <article key={stat.label} className="library-visual-card">
                                <div className="stat-icon">
                                    <stat.icon size={16} />
                                </div>
                                <strong>{stat.value}</strong>
                                <span>{stat.label}</span>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="surface-card library-collection-card">
                <div className="section-head library-section-head">
                    <div>
                        <div className="eyebrow">Koleksiyon</div>
                        <h3>{papers.length} kayıt</h3>
                    </div>
                    <button
                        title="Mevcut makalelerin yazar bilgisini ArXiv'den güncelle"
                        onClick={async () => {
                            try {
                                const res = await fetch('http://localhost:8080/enrich-authors', { method: 'POST' });
                                const data = await res.json();
                                alert(data.message || 'Yazar zenginleştirme başladı.');
                            } catch (e) {
                                alert('Bağlantı hatası.');
                            }
                        }}
                        style={{
                            display: 'grid', placeItems: 'center',
                            width: '36px', height: '36px',
                            borderRadius: '10px', cursor: 'pointer',
                            background: '#f5f3ff', color: '#7c3aed',
                            border: '1px solid #ede9fe',
                            flexShrink: 0
                        }}
                    >
                        <UserCheck size={16} />
                    </button>
                </div>

                <div className="library-paper-grid">
                    {papers.length === 0 && (
                        <div className="empty-card library-empty-card">
                            <BookOpen size={18} />
                            <span>Henüz makale yok</span>
                        </div>
                    )}

                    {papers.map((paper) => (
                        <article key={paper.id} className="library-paper-card library-paper-card-visual">
                            <div className="library-paper-topline">
                                <div className="library-paper-year">
                                    <Calendar size={14} />
                                    <span>{paper.year || 'Yıl yok'}</span>
                                </div>
                                <span className="info-chip strong">{paper.citation_count ?? 0} atıf</span>
                            </div>

                            <div className="library-paper-mainicon">
                                <BookOpen size={20} />
                            </div>

                            <div className="library-paper-head">
                                <div className="library-paper-title-block">
                                    <h4>{paper.title}</h4>
                                    <p>
                                        {(paper.authors || []).slice(0, 3).join(', ') ||
                                            'Yazar bilgisi yok'}
                                    </p>
                                </div>
                            </div>

                            <div className="library-paper-footer">
                                <div className="chip-row">
                                    {(paper.concepts || []).slice(0, 3).map((concept) => (
                                        <span key={concept} className="info-chip">
                                            {concept}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </section>
    );
};

export default LibraryView;
