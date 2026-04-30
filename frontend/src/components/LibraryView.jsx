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
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useState, useMemo } from 'react';

const LibraryView = ({ onUpload, onAddPaper, isUploading, uploadStatus, papers = [], libraryStats, setActiveTab, previousTab }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    const stats = [
        { label: 'Makale', value: libraryStats?.paper_count ?? 0, icon: FileText },
        { label: 'Yazar', value: libraryStats?.author_count ?? 0, icon: Share2 },
        { label: 'Kavram', value: libraryStats?.concept_count ?? 0, icon: BookOpen },
        { label: 'Parça', value: libraryStats?.chunk_count ?? 0, icon: Quote },
    ];

    const hasSuccessStatus = uploadStatus?.toLowerCase().includes('başarı');

    const reversedPapers = useMemo(() => [...papers].reverse(), [papers]);
    const totalPages = Math.ceil(reversedPapers.length / ITEMS_PER_PAGE) || 1;
    const currentPapers = reversedPapers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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

                <div style={{ display: 'none' }}></div>

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
                    
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input 
                                type="text" 
                                id="quick-add-input"
                                placeholder="Makale başlığı ile ArXiv'den ekle..." 
                                style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.8rem', width: '240px', outline: 'none', background: '#fff' }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.target.value) {
                                        onAddPaper(e.target.value);
                                        e.target.value = '';
                                        setCurrentPage(1); // Reset to first page
                                    }
                                }}
                            />
                            <button 
                                onClick={() => {
                                    const input = document.getElementById('quick-add-input');
                                    if (input.value) {
                                        onAddPaper(input.value);
                                        input.value = '';
                                        setCurrentPage(1);
                                    }
                                }}
                                style={{ background: '#10b981', color: '#fff', padding: '8px', borderRadius: '10px', display: 'grid', placeItems: 'center', cursor: 'pointer', border: 'none' }}
                                title="ArXiv'den İndir"
                            >
                                <Sparkles size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="library-paper-grid">
                    {papers.length === 0 && (
                        <div className="empty-card library-empty-card">
                            <BookOpen size={18} />
                            <span>Henüz makale yok</span>
                        </div>
                    )}

                    {currentPapers.map((paper) => (
                        <article key={paper.id} className="library-paper-card library-paper-card-visual">
                            <div className="library-paper-topline">
                                {paper.year && (
                                    <div className="library-paper-year">
                                        <Calendar size={14} />
                                        <span>{paper.year}</span>
                                    </div>
                                )}
                                {(paper.citation_count > 0) && (
                                    <span className="info-chip strong">{paper.citation_count} atıf</span>
                                )}
                            </div>

                            <div className="library-paper-mainicon">
                                <BookOpen size={20} />
                            </div>

                            <div className="library-paper-head">
                                <div className="library-paper-title-block">
                                    <h4 title={paper.title} style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{paper.title}</h4>
                                    {paper.authors && paper.authors.length > 0 && (
                                        <p>
                                            {paper.authors.slice(0, 3).join(', ')}
                                        </p>
                                    )}
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

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: currentPage === 1 ? '#f8fafc' : '#fff', color: currentPage === 1 ? '#cbd5e1' : '#475569', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>
                            Sayfa {currentPage} / {totalPages}
                        </span>
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: currentPage === totalPages ? '#f8fafc' : '#fff', color: currentPage === totalPages ? '#cbd5e1' : '#475569', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </section>
        </section>
    );
};

export default LibraryView;
