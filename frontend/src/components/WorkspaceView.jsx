import { ArrowUpRight, BookOpen, Clock3, Files, Quote } from 'lucide-react';

const WorkspaceView = ({ papers = [], libraryStats, setActiveTab }) => {
    const recentPapers = papers.slice(0, 6);

    return (
        <section className="page-scroll page-workspace">
            <div className="page-header">
                <div>
                    <div className="eyebrow">Çalışma alanı</div>
                    <h2>Çalışma Alanı</h2>
                    <p>Kayıtlarını tek yerde gör, son eklenenleri takip et ve kütüphaneye hızlıca geç.</p>
                </div>
            </div>

            <div className="stats-grid workspace-stats-grid">
                <article className="stat-card tone-lilac">
                    <div className="stat-icon">
                        <Files size={16} />
                    </div>
                    <span>Makale</span>
                    <strong>{papers.length}</strong>
                </article>
                <article className="stat-card tone-soft">
                    <div className="stat-icon">
                        <BookOpen size={16} />
                    </div>
                    <span>Kavram</span>
                    <strong>{libraryStats?.concept_count ?? 0}</strong>
                </article>
                <article className="stat-card tone-soft">
                    <div className="stat-icon">
                        <Quote size={16} />
                    </div>
                    <span>Parça</span>
                    <strong>{libraryStats?.chunk_count ?? 0}</strong>
                </article>
            </div>

            <section className="surface-card workspace-surface-card">
                <div className="section-head">
                    <div>
                        <div className="eyebrow">Son eklenenler</div>
                        <h3>Yakın kayıtlar</h3>
                    </div>
                    <button className="text-link workspace-link" onClick={() => setActiveTab('library')}>
                        Kütüphaneye git
                        <ArrowUpRight size={14} />
                    </button>
                </div>

                <div className="workspace-paper-grid">
                    {recentPapers.length === 0 && (
                        <div className="empty-card library-empty-card">
                            <BookOpen size={18} />
                            <span>Henüz kayıt yok</span>
                        </div>
                    )}

                    {recentPapers.map((paper) => (
                        <article key={paper.id} className="workspace-paper-card">
                            <div className="workspace-paper-top">
                                <div className="workspace-paper-icon">
                                    <Clock3 size={16} />
                                </div>
                                <span className="library-paper-year">{paper.year || 'Yıl yok'}</span>
                            </div>
                            <strong>{paper.title}</strong>
                            <p>{(paper.authors || []).slice(0, 3).join(', ') || 'Yazar bilgisi yok'}</p>
                        </article>
                    ))}
                </div>
            </section>
        </section>
    );
};

export default WorkspaceView;
