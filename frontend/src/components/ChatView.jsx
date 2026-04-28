import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, BookOpen, Bot, Compass, Filter, Globe, Loader2, Lock, Send, User } from 'lucide-react';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

const ChatView = ({ onSendMessage, onAddPaper, messages, isLoading, papers = [] }) => {
    const [input, setInput] = useState('');
    const [mode, setMode] = useState('discovery');
    const [source, setSource] = useState('private');
    const scrollRef = useRef(null);

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
                    <div className="eyebrow">Kanıtla cevapla</div>
                    <h2>Araştırma Asistanı</h2>
                    <p>Kütüphanendeki makaleler ve akademik literatür arasında bağ kurarak derinlemesine analiz yap.</p>
                </div>

                <div className="chat-mode-bar">
                    <div className="mode-switch">
                        <button
                            className={`mode-btn ${mode === 'discovery' ? 'active' : ''}`}
                            onClick={() => setMode('discovery')}
                        >
                            <Compass size={14} />
                            Keşif
                        </button>
                        <button
                            className={`mode-btn ${mode === 'deep_read' ? 'active' : ''}`}
                            onClick={() => setMode('deep_read')}
                        >
                            <BookOpen size={14} />
                            Derin okuma
                        </button>
                    </div>

                    <button
                        className="source-toggle-shell"
                        onClick={() => setSource(source === 'private' ? 'global' : 'private')}
                    >
                        <span className={source === 'private' ? 'active' : ''}>
                            <Lock size={12} />
                            Kütüphane
                        </span>
                        <span className={source === 'global' ? 'active' : ''}>
                            <Globe size={12} />
                            Arşiv
                        </span>
                    </button>
                </div>
            </div>

            <div className="chat-layout">
                <div className="chat-shell">
                    <div className="chat-container modern" ref={scrollRef}>
                        {messages.length === 0 && (
                            <div className="chat-empty-state">
                                <div className="chat-empty-icon">
                                    <Bot size={26} />
                                </div>
                                <h3>Makalelerine dayalı bir soru sor</h3>
                                <p>
                                    Yöntem karşılaştırmayı, atıf bağlamı sormayı veya yüklenen
                                    korpusta kanıt bulmayı dene.
                                </p>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`message-row ${msg.role === 'user' ? 'user' : 'assistant'}`}>
                                <div className="avatar">
                                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>

                                <div className="message-bubble">
                                    {msg.hasContradiction && (
                                        <div className="contradiction-alert">
                                            <AlertTriangle size={16} />
                                            <span>
                                                <strong>Olası çelişki:</strong> kaynak pasajlar farklı
                                                metodolojik pozisyonlara işaret ediyor.
                                            </span>
                                        </div>
                                    )}

                                    <div className="markdown-content" dangerouslySetInnerHTML={{ __html: md.render(msg.text) }} />

                                    {msg.papers && msg.papers.length > 0 && (
                                        <div className="sources-box">
                                            <strong>İlgili makaleler:</strong> {msg.papers.join(' | ')}
                                        </div>
                                    )}

                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className="source-card-stack">
                                            {msg.sources.map((sourceItem, sourceIdx) => (
                                                <div
                                                    key={`${sourceItem.paper_id || sourceItem.title}-${sourceIdx}`}
                                                    className="source-card"
                                                >
                                                    <div className="source-card-head">
                                                        <strong>{sourceItem.title}</strong>
                                                        <span>
                                                            {sourceItem.year || 'yok'}
                                                            {sourceItem.score ? ` | ${sourceItem.score}` : ''}
                                                        </span>
                                                    </div>
                                                    <p>{sourceItem.excerpt}</p>
                                                    {sourceItem.canAdd && (
                                                        <button 
                                                            className="btn-add-library"
                                                            onClick={() => onAddPaper(sourceItem.title)}
                                                        >
                                                            Kütüphaneye Ekle
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
                                <div className="avatar">
                                    <Loader2 size={16} className="animate-spin" />
                                </div>
                                <div className="message-bubble loading-bubble">
                                    {mode === 'discovery'
                                        ? 'Pasajlar, kavramlar ve grafik bağları taranıyor...'
                                        : 'Belge düzeyindeki iddialar ve destekleyici metin inceleniyor...'}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="chat-input-area modern">
                        <div className="chat-input-wrap">
                            <Filter size={16} className="chat-input-icon" />
                            <input
                                type="text"
                                className="chat-input"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder={
                                    mode === 'discovery'
                                        ? 'Yöntemler, trendler veya makaleler arası bağlar hakkında sor...'
                                        : 'Bir iddiayı, sonucu veya pasajı sorgula...'
                                }
                                disabled={isLoading}
                            />
                        </div>
                        <button className="btn-primary btn-send" onClick={handleSend} disabled={isLoading || !input.trim()}>
                            <Send size={18} />
                        </button>
                    </div>
                </div>

                <aside className="chat-context-panel">
                    <div className="surface-card compact-pad">
                        <div className="eyebrow">Korpus durumu</div>
                        <h3>{papers.length} makale hazır</h3>
                        <p>
                            En iyi sonuçlar, yüklenen materyaldeki yöntemler, iddialar,
                            atıflar veya isimlendirilmiş kavramlara bağlı spesifik sorulardan gelir.
                        </p>
                    </div>
                    <div className="surface-card compact-pad">
                        <div className="eyebrow">Yönlendirmeler</div>
                        <p className="small-text">
                            Bir makale ekleyerek başlayabilir veya literatür taraması yapabilirsin.
                        </p>
                    </div>
                </aside>
            </div>
        </section>
    );
};

export default ChatView;
