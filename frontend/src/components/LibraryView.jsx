import {
    BookOpen,
    Calendar,
    CheckCircle,
    FileText,
    Loader2,
    Quote,
    Share2,
    Sparkles,
    Upload,
} from 'lucide-react';

const LibraryView = ({ onUpload, isUploading, uploadStatus, papers = [], libraryStats }) => {
    const stats = [
        { label: 'Makale', value: libraryStats?.paper_count ?? 0, icon: FileText },
        { label: 'Yazar', value: libraryStats?.author_count ?? 0, icon: Share2 },
        { label: 'Kavram', value: libraryStats?.concept_count ?? 0, icon: BookOpen },
        { label: 'Parça', value: libraryStats?.chunk_count ?? 0, icon: Quote },
    ];

    const hasSuccessStatus = uploadStatus?.toLowerCase().includes('başarı');

    return (
        <section className="page-scroll page-library">
            <div className="page-header library-header-minimal">
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
