import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, BookOpen, Bot, BotMessageSquare, Compass, Filter, Globe, Loader2, Lock, Send, User, Database, FileText } from 'lucide-react';
import MarkdownIt from 'markdown-it';
import { searchApi } from '../services/api';

const md = new MarkdownIt();

const ChatView = ({ onSendMessage, onAddPaper, messages, isLoading, papers = [], setActiveTab }) => {
    const [input, setInput] = useState('');
    const [mode, setMode] = useState('discovery');
    const [source, setSource] = useState('private');
    const scrollRef = useRef(null);
    const [stats, setStats] = useState({ papers: papers.length, chunk_count: 0, nodes: 0, edges: 0 });

    useEffect(() => {
        searchApi.getLibraryOverview()
            .then((response) => {
                if (response.data?.stats) {
                    setStats((prev) => ({ ...prev, ...response.data.stats }));
                }
            })
            .catch((err) => console.error('Stats API error:', err));
    }, [papers]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

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
                    <div className="eyebrow">AKILLI ASİSTAN</div>
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
                                <div className="chat-empty-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'none', width: 'calc(40px + 1vw)', height: 'calc(40px + 1vw)' }}>
                                    <BotMessageSquare size={24} />
                                </div>
                                <h3 style={{ marginTop: 'calc(8px + 0.3vw)', color: '#0f172a', fontSize: 'calc(0.9rem + 0.2vw)' }}>Akıllı Araştırma Asistanına Hoş Geldiniz</h3>
                                <p style={{ maxWidth: '600px', margin: 'calc(6px + 0.2vw) auto calc(12px + 0.4vw)', color: '#64748b', lineHeight: '1.5', fontSize: 'calc(0.75rem + 0.15vw)' }}>
                                    Ben sizin kişisel akademik yapay zekanızım. Kütüphanenize yüklediğiniz makaleleri okuyabilir, analiz edebilir ve kendi aralarında bağ kurabilirim.
                                    <br/><strong>Neler yapabiliriz?</strong> Makaleler arası yöntemleri karşılaştırabiliriz, çelişen bulguları tespit edebiliriz, karmaşık kavramları sadeleştirebiliriz veya belirli bir makaleden doğrudan kaynak/pasaj çekebiliriz. 
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
                                <div className={`avatar${msg.role === 'assistant' ? ' assistant-avatar' : ''}`} style={msg.role === 'user' ? { background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0'} : {}}>
                                    {msg.role === 'user' ? <User size={18} /> : <Bot size={28} />}
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
                                <div className="avatar assistant-avatar" style={{ border: 'none' }}>
                                    <Loader2 size={24} className="animate-spin" />
                                </div>
                                <div className="message-bubble loading-bubble" style={{ background: 'transparent', border: 'none', color: '#64748b' }}>
                                    {mode === 'discovery'
                                        ? 'Vektör veri tabanında kaynak metinler ve Neo4j grafiği üzerinden kavramsal bağlar taranıyor...'
                                        : 'Akademik dokümanlar analiz ediliyor, iddialar doğrulanıyor...'}
                                </div>
                            </div>
                        )}
                        <div />
                    </div>

                    <div className="chat-input-area modern">
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
                        <button 
                            className="btn-primary btn-send" 
                            onClick={handleSend} 
                            disabled={isLoading || !input.trim()} 
                            style={{ background: '#10b981', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)', borderRadius: '14px', width: '52px', height: '52px', minWidth: '52px', minHeight: '52px' }}
                        >
                            <Send size={26} strokeWidth={2.4} />
                        </button>
                    </div>
                </div>

                <aside className="chat-context-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '8px' }}>
                    <div className="surface-card chat-side-card" style={{ background: '#ffffff', borderColor: '#e2e8f0', display: 'flex', flexDirection: 'column', padding: '14px 16px', gap: '10px', flex: '1 1 0', minHeight: 0 }}>
                        <div className="eyebrow" style={{ color: '#64748b', fontSize: '0.62rem', marginBottom: '2px' }}>KÜTÜPHANE DURUMU</div>
                        
                        <div style={{ fontSize: '0.76rem', color: '#475569', lineHeight: '1.42', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <h3 style={{ color: '#0f172a', fontSize: '0.95rem', margin: '0 0 10px', lineHeight: 1.25 }}>
                                Akademik Kütüphaneniz
                            </h3>
                            <p style={{ marginBottom: '6px' }}>
                                Kütüphanenizde <strong>{stats.paper_count || papers.length} makale</strong>, <strong>{stats.chunk_count || 0}</strong> parça halinde işlendi.
                            </p>
                            <p style={{ marginBottom: '6px' }}>
                                <strong>{stats.concept_count || 0}</strong> kavram ve <strong>{stats.citation_edges || 0}</strong> ilişki haritalandı.
                            </p>
                            <p className="library-status-copy library-status-copy-compact">
                                Sistem sorularınıza kanıtlı yanıtlar üretmeye hazır.
                            </p>
                            <p className="library-status-copy library-status-copy-expanded">
                                Sistem, kütüphanenizdeki makaleleri kavramsal bağlantılar, yazar ilişkileri ve işlenmiş metin parçaları üzerinden birlikte değerlendirerek daha güçlü, daha tutarlı ve kaynağa dayalı akademik yanıtlar üretmeye hazır.
                            </p>
                        </div>

                        <div style={{ marginTop: 'auto' }}>
                            <button 
                                className="btn-secondary" 
                                style={{ 
                                    width: '100%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '6px', 
                                fontSize: '0.76rem',
                                padding: '9px 10px',
                                borderRadius: '9px',
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                color: '#059669',
                                fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onClick={() => setActiveTab && setActiveTab('library')}
                                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'; }}
                            >
                                <Database size={14} /> Kütüphaneyi Yönet
                            </button>
                        </div>
                    </div>
                    
                    <div className="surface-card chat-side-card" style={{ background: '#ffffff', borderColor: '#e2e8f0', display: 'flex', flexDirection: 'column', padding: '14px 16px', gap: '10px', flex: '1 1 0', minHeight: 0 }}>
                        <div className="eyebrow" style={{ color: '#64748b', fontSize: '0.62rem', marginBottom: '2px' }}>SİSTEM YETENEKLERİ</div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.76rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, justifyContent: 'center' }}>
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                <Compass size={17} style={{ color: '#10b981', marginTop: '2px', flexShrink: 0 }} />
                                <span>Vektör veritabanındaki anlamsal eşleşmeleri ve bilgi grafındaki ilişkileri birlikte tarayarak daha bağlamsal sonuçlar üretir.</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                <FileText size={17} style={{ color: '#3b82f6', marginTop: '2px', flexShrink: 0 }} />
                                <span>Verdiği yanıtları makalelerden çıkan pasajlar, özetler ve eşleşen kaynaklarla destekleyerek daha denetlenebilir hale getirir.</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                <AlertTriangle size={17} style={{ color: '#f59e0b', marginTop: '2px', flexShrink: 0 }} />
                                <span>Farklı makalelerdeki metodolojik ayrışmaları, çelişen bulguları ve yorum farklarını fark edip kullanıcıya karşılaştırmalı bakış sunar.</span>
                            </li>
                        </ul>
                    </div>
                </aside>
            </div>
        </section>
    );
};

export default ChatView;
