import {
    BookOpen,
    Calendar,
    CheckCircle,
    FileText,
    Loader2,
    Quote,
    Share2,
    ArrowLeft,
    Upload,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useState, useMemo } from 'react';

const LibraryView = ({ onUpload, onAddPaper, isUploading, uploadStatus, papers = [], libraryStats, setActiveTab, previousTab }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    const stats = [
        { label: 'Makale', value: libraryStats?.paper_count ?? 0, icon: FileText, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.05)', desc: 'Korpusunuzdaki belge sayısı' },
        { label: 'Yazar', value: libraryStats?.author_count ?? 0, icon: Share2, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.05)', desc: 'Ağdaki araştırmacı sayısı' },
        { label: 'Kavram', value: libraryStats?.concept_count ?? 0, icon: BookOpen, color: '#10b981', bg: 'rgba(16, 185, 129, 0.05)', desc: 'Tespit edilen anahtar kelime' },
        { label: 'Parça', value: libraryStats?.chunk_count ?? 0, icon: Quote, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.05)', desc: 'Vektörize edilmiş semantik veri' },
    ];

    const hasSuccessStatus = uploadStatus?.toLowerCase().includes('başarı');

    const reversedPapers = useMemo(() => [...papers].reverse(), [papers]);
    const totalPages = Math.ceil(reversedPapers.length / ITEMS_PER_PAGE) || 1;
    const currentPapers = reversedPapers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <section className="page-scroll page-library">
            <div className="page-header library-header-minimal" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
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
                    <div className="eyebrow">BELGE YÖNETİMİ</div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.03em' }}>Kütüphane</h2>
                    <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '6px', lineHeight: '1.5' }}>
                        Yerel PDF'lerinizi yükleyin veya ArXiv'den doğrudan makale ekleyin. Tüm belgeleriniz otomatik olarak analiz edilir.
                    </p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <label className={`upload-dropzone upload-dropzone-hero ${isUploading ? 'loading' : ''}`} style={{ borderRadius: '20px', border: '1px dashed rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.04)' }}>
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => onUpload(e.target.files[0])}
                        className="hidden-file-input"
                        disabled={isUploading}
                    />

                    <div className="upload-icon-wrap" style={{ background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        {isUploading ? (
                            <Loader2 size={28} className="animate-spin" />
                        ) : hasSuccessStatus ? (
                            <CheckCircle size={28} />
                        ) : (
                            <Upload size={28} />
                        )}
                    </div>

                    <div className="upload-copy">
                        <strong style={{ fontSize: '1.05rem', color: '#064e3b' }}>{isUploading ? 'Yükleniyor...' : 'PDF Yükle'}</strong>
                        <span style={{ color: '#047857' }}>{uploadStatus || 'Sürükle bırak veya seç'}</span>
                    </div>
                </label>

                <div style={{ borderRadius: '20px', border: '1px dashed rgba(59, 130, 246, 0.4)', background: 'rgba(59, 130, 246, 0.04)', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fff', color: '#3b82f6', display: 'grid', placeItems: 'center', marginBottom: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <BookOpen size={24} />
                    </div>
                    <strong style={{ fontSize: '1.05rem', color: '#1e3a8a', marginBottom: '4px' }}>ArXiv'den İndir</strong>
                    <span style={{ fontSize: '0.8rem', color: '#3b82f6', marginBottom: '16px' }}>Makale başlığını girerek anında ekleyin</span>
                    
                    <div style={{ display: 'flex', gap: '8px', width: '80%', maxWidth: '300px' }}>
                        <input 
                            type="text" 
                            id="hero-quick-add"
                            placeholder="Makale başlığı..." 
                            style={{ flex: 1, padding: '10px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.85rem', outline: 'none', background: '#f8fafc' }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.target.value) {
                                    onAddPaper(e.target.value);
                                    e.target.value = '';
                                    setCurrentPage(1);
                                }
                            }}
                        />
                        <button 
                            onClick={() => {
                                const input = document.getElementById('hero-quick-add');
                                if (input.value) {
                                    onAddPaper(input.value);
                                    input.value = '';
                                    setCurrentPage(1);
                                }
                            }}
                            style={{ background: '#0f172a', color: '#fff', padding: '10px 16px', borderRadius: '12px', display: 'grid', placeItems: 'center', cursor: 'pointer', border: 'none', fontWeight: '600' }}
                        >
                            Ekle
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                {stats.map((stat) => (
                    <article key={stat.label} style={{ background: stat.bg, padding: '20px', borderRadius: '16px', border: `1px solid ${stat.color}33`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fff', color: stat.color, display: 'grid', placeItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                            <stat.icon size={16} />
                        </div>
                        <div style={{ marginTop: '4px' }}>
                            <strong style={{ fontSize: '1.6rem', color: '#0f172a', fontWeight: '800', lineHeight: '1.2', display: 'block' }}>{stat.value}</strong>
                            <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: '700', display: 'block', marginBottom: '2px' }}>{stat.label} Sayısı</span>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.3' }}>{stat.desc}</span>
                        </div>
                    </article>
                ))}
            </div>

            <section className="surface-card library-collection-card">
                <div className="section-head library-section-head">
                    <div>
                        <div className="eyebrow">Koleksiyon</div>
                        <h3>{papers.length} kayıt</h3>
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
