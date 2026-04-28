import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, BookOpen, Bot, BotMessageSquare, Compass, Filter, Globe, Loader2, Lock, Send, User, Database, Network, FileText, Zap, Cpu } from 'lucide-react';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

const ChatView = ({ onSendMessage, onAddPaper, messages, isLoading, papers = [] }) => {
    const [input, setInput] = useState('');
    const [mode, setMode] = useState('discovery');
    const [source, setSource] = useState('private');
    const scrollRef = useRef(null);
    const [stats, setStats] = useState({ papers: papers.length, chunk_count: 0, nodes: 0, edges: 0 });

    useEffect(() => {
        fetch('http://localhost:8000/library/overview')
            .then(res => res.json())
            .then(data => {
                if (data.stats) {
                    setStats(prev => ({ ...prev, ...data.stats }));
                }
            })
            .catch(err => console.error("Stats API error:", err));
    }, [papers]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!input.trim() || isLoading) return;
        console.log("Mesaj gönderiliyor. Mod:", mode, "Kaynak:", source);
        onSendMessage(input, { mode, source });
        setInput('');
    };

    return (
        <section className="page-chat">
            <div className="chat-header-shell">
                <div>
                    <div className="eyebrow">Hibrit RAG Arama</div>
                    <h2>Araştırma Asistanı</h2>
                    <p>Kütüphanenizdeki makaleler, yazar ağları ve kavramlar arasında semantik bağlar kurarak analiz yapın.</p>
                </div>

                <div className="chat-mode-bar">
                    <div className="mode-switch">
                        <button
                            className={`mode-btn ${mode === 'discovery' ? 'active' : ''}`}
                            onClick={() => setMode('discovery')}
                        >
                            <Compass size={14} />
                            Literatür Keşfi
                        </button>
                        <button
                            className={`mode-btn ${mode === 'deep_read' ? 'active' : ''}`}
                            onClick={() => setMode('deep_read')}
                        >
                            <BookOpen size={14} />
                            Derinlemesine Analiz
                        </button>
                    </div>

                    <button
                        className="source-toggle-shell"
                        onClick={() => setSource(source === 'private' ? 'global' : 'private')}
                    >
                        <span className={source === 'private' ? 'active' : ''}>
                            <Lock size={12} />
                            Yerel Kütüphane
                        </span>
                        <span className={source === 'global' ? 'active' : ''}>
                            <Globe size={12} />
                            ArXiv (Global)
                        </span>
                    </button>
                </div>
            </div>

            <div className="chat-layout">
                <div className="chat-shell">
                    <div className="chat-container modern" ref={scrollRef}>
                        {messages.length === 0 && (
                            <div className="chat-empty-state" style={{ height: '100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div className="chat-empty-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'none', width: '64px', height: '64px' }}>
                                    <BotMessageSquare size={36} />
                                </div>
                                <h3 style={{ marginTop: '16px', color: '#0f172a' }}>Akıllı Araştırma Asistanına Hoş Geldiniz</h3>
                                <p style={{ maxWidth: '600px', margin: '10px auto 24px', color: '#64748b', lineHeight: '1.6' }}>
                                    Ben sizin kişisel akademik yapay zekanızım. Kütüphanenize yüklediğiniz makaleleri okuyabilir, analiz edebilir ve kendi aralarında bağ kurabilirim.<br/><br/>
                                    <strong>Neler yapabiliriz?</strong> Makaleler arası yöntemleri karşılaştırabiliriz, çelişen bulguları tespit edebiliriz, karmaşık kavramları sadeleştirebiliriz veya belirli bir makaleden doğrudan kaynak/pasaj çekebiliriz. 
                                </p>
                                <div className="prompt-list" style={{ justifyContent: 'center' }}>
                                    <button className="prompt-chip" onClick={() => setInput('Mevcut makaleler arasındaki en temel metodolojik farklılıklar nelerdir?')}>
                                        Metodoloji Karşılaştır
                                    </button>
                                    <button className="prompt-chip" onClick={() => setInput('Kütüphanemdeki makalelerin ana bulgularını bir paragrafta özetle.')}>
                                        Literatür Özeti
                                    </button>
                                    <button className="prompt-chip" onClick={() => setInput('En çok atıf yapılan kavramlar hangileri ve neden?')}>
                                        Kavram Analizi
                                    </button>
                                </div>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`message-row ${msg.role === 'user' ? 'user' : 'assistant'}`}>
                                <div className="avatar" style={msg.role === 'user' ? { background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0'} : { background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', border: 'none' }}>
                                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>

                                <div className="message-bubble" style={msg.role === 'user' ? { background: '#f1f5f9', color: '#0f172a', border: '1px solid #e2e8f0'} : { background: '#ffffff', color: '#334155', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'}}>
                                    {msg.hasContradiction && (
                                        <div className="contradiction-alert">
                                            <AlertTriangle size={16} />
                                            <span>
                                                <strong>Olası çelişki tespit edildi:</strong> Bulunan kaynak metinler, farklı metodolojik pozisyonlara veya zıt sonuçlara işaret ediyor.
                                            </span>
                                        </div>
                                    )}

                                    <div className="markdown-content" dangerouslySetInnerHTML={{ __html: md.render(msg.text) }} />

                                    {msg.papers && msg.papers.length > 0 && (
                                        <div className="sources-box" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', border: 'none' }}>
                                            <strong>Bağlantılı Makaleler:</strong> {msg.papers.join(' • ')}
                                        </div>
                                    )}

                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className="source-card-stack">
                                            {msg.sources.map((sourceItem, sourceIdx) => (
                                                <div
                                                    key={`${sourceItem.paper_id || sourceItem.title}-${sourceIdx}`}
                                                    className="source-card"
                                                    style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}
                                                >
                                                    <div className="source-card-head">
                                                        <strong style={{ color: '#0f172a' }}>{sourceItem.title}</strong>
                                                        <span style={{ color: '#64748b' }}>
                                                            {sourceItem.year || 'Bilinmiyor'}
                                                            {sourceItem.score ? ` | Güven Skoru: ${sourceItem.score}` : ''}
                                                        </span>
                                                    </div>
                                                    <p style={{ color: '#475569' }}>"{sourceItem.excerpt}"</p>
                                                    {sourceItem.canAdd && (
                                                        <button 
                                                            className="btn-add-library"
                                                            onClick={() => onAddPaper(sourceItem.title)}
                                                            style={{ background: '#ffffff', color: '#2563eb', borderColor: '#bfdbfe' }}
                                                        >
                                                            Kütüphaneye Çek
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="message-row assistant">
                                <div className="avatar" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', border: 'none' }}>
                                    <Loader2 size={16} className="animate-spin" />
                                </div>
                                <div className="message-bubble loading-bubble" style={{ background: 'transparent', border: 'none', color: '#64748b' }}>
                                    {mode === 'discovery'
                                        ? 'Vektör veri tabanında kaynak metinler ve Neo4j grafiği üzerinden kavramsal bağlar taranıyor...'
                                        : 'Akademik dokümanlar analiz ediliyor, iddialar doğrulanıyor...'}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="chat-input-area modern" style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
                        <div className="chat-input-wrap">
                            <Filter size={16} className="chat-input-icon" style={{ color: '#94a3b8' }} />
                            <input
                                type="text"
                                className="chat-input"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder={
                                    mode === 'discovery'
                                        ? 'Yöntemleri karşılaştır, kavramsal bağları sor veya literatürü analiz et...'
                                        : 'Belirli bir iddiayı, sonucu veya hipotezi sorgula...'
                                }
                                disabled={isLoading}
                                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a' }}
                            />
                        </div>
                        <button className="btn-primary btn-send" onClick={handleSend} disabled={isLoading || !input.trim()} style={{ background: '#2563eb', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)' }}>
                            <Send size={18} />
                        </button>
                    </div>
                </div>

                <aside className="chat-context-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px' }}>
                    <div className="surface-card compact-pad" style={{ background: '#ffffff', borderColor: '#e2e8f0', flex: 1.5, display: 'flex', flexDirection: 'column' }}>
                        <div className="eyebrow" style={{ color: '#64748b' }}>KÜTÜPHANE DURUMU</div>
                        <h3 style={{ color: '#0f172a', fontSize: '1.1rem', marginBottom: '8px' }}>{stats.papers || papers.length} Makale Analizi Tamam</h3>
                        
                        <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: '1.5', flex: 1 }}>
                            <p style={{ marginBottom: '8px' }}>
                                Sistemimiz kütüphanenizi <strong>{stats.chunk_count || 0}</strong> bilgi parçasına ayırarak akıllı hafızasına aldı.
                            </p>
                            <p style={{ marginBottom: '8px' }}>
                                Literatürünüzden <strong>{stats.nodes || 0}</strong> kritik kavram ve <strong>{stats.edges || 0}</strong> stratejik bağ tanımlandı.
                            </p>
                            <p>
                                Artık tüm dokümanlarınız üzerinden derinlemesine analiz yapmaya hazırdır.
                            </p>
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                            <button 
                                className="btn-secondary" 
                                style={{ 
                                    width: '100%', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    gap: '8px', 
                                    fontSize: '0.75rem',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    background: '#f1f5f9',
                                    border: '1px solid #e2e8f0',
                                    color: '#475569',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onClick={() => window.location.hash = '#/library'}
                                onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
                            >
                                <Database size={13} /> Kütüphaneyi Yönet
                            </button>
                        </div>
                    </div>
                    
                    <div className="surface-card compact-pad" style={{ background: '#ffffff', borderColor: '#e2e8f0', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div className="eyebrow" style={{ color: '#64748b' }}>SİSTEM YETENEKLERİ</div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, justifyContent: 'center' }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div> Hibrit Arama (Vektör + Grafik)</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' }}></div> Kaynak Metin (Pasaj) Getirme</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }}></div> Çelişki Tespiti</li>
                        </ul>
                    </div>
                </aside>
            </div>
        </section>
    );
};

export default ChatView;
