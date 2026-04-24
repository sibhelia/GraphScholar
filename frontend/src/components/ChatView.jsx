import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Compass, BookOpen, Globe, Lock, Filter, AlertTriangle } from 'lucide-react';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

const ChatView = ({ onSendMessage, messages, isLoading }) => {
    const [input, setInput] = useState('');
    const [mode, setMode] = useState('discovery'); // discovery | deep_read
    const [source, setSource] = useState('private'); // private | global
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!input.trim() || isLoading) return;
        onSendMessage(input, { mode, source });
        setInput('');
    };

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#fff' }}>
            {/* Üst Komuta Paneli: Mod Seçiciler ve Kaynak Anahtarı */}
            <div className="mode-selector">
                <div style={{ display: 'flex', gap: '4px' }}>
                    <button 
                        className={`mode-btn ${mode === 'discovery' ? 'active' : ''}`}
                        onClick={() => setMode('discovery')}
                    >
                        <Compass size={14} style={{ marginRight: '6px' }} />
                        Keşif Modu
                    </button>
                    <button 
                        className={`mode-btn ${mode === 'deep_read' ? 'active' : ''}`}
                        onClick={() => setMode('deep_read')}
                    >
                        <BookOpen size={14} style={{ marginRight: '6px' }} />
                        Derin Okuma
                    </button>
                </div>

                <div className="source-toggle">
                    <span style={{ color: source === 'private' ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                        <Lock size={12} style={{ marginRight: '4px' }} />
                        Kütüphanem
                    </span>
                    <div 
                        onClick={() => setSource(source === 'private' ? 'global' : 'private')}
                        style={{
                            width: '32px',
                            height: '16px',
                            backgroundColor: 'var(--border-color)',
                            borderRadius: '10px',
                            position: 'relative',
                            cursor: 'pointer',
                            transition: '0.3s'
                        }}
                    >
                        <div style={{
                            width: '12px',
                            height: '12px',
                            backgroundColor: 'var(--accent-primary)',
                            borderRadius: '50%',
                            position: 'absolute',
                            top: '2px',
                            left: source === 'private' ? '2px' : '18px',
                            transition: '0.3s'
                        }} />
                    </div>
                    <span style={{ color: source === 'global' ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                        <Globe size={12} style={{ marginRight: '4px' }} />
                        Arşiv
                    </span>
                </div>
            </div>

            {/* Chat Akışı */}
            <div className="chat-container" ref={scrollRef}>
                {messages.length === 0 && (
                    <div style={{ textAlign: 'center', marginTop: '6rem', color: 'var(--text-secondary)' }}>
                        <div style={{ opacity: 0.1, marginBottom: '1rem' }}><Bot size={64} /></div>
                        <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Komuta Merkezi Hazır</h3>
                        <p style={{ fontSize: '0.9rem' }}>Mod seçin ve analize başlayın. Hibrit sorgulama aktif.</p>
                    </div>
                )}
                
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message-row ${msg.role === 'user' ? 'user' : 'assistant'}`}>
                        <div className="avatar">
                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} color="var(--accent-primary)" />}
                        </div>
                        
                        <div className="message-bubble">
                            {/* Örnek Çelişki Uyarısı (Eğer veri gelseydi burada render edilirdi) */}
                            {msg.hasContradiction && (
                                <div className="contradiction-alert">
                                    <AlertTriangle size={16} />
                                    <span><strong>Çelişki Tespit Edildi:</strong> Makale A ile Makale B arasında metodolojik farklar var.</span>
                                </div>
                            )}

                            <div className="markdown-content" dangerouslySetInnerHTML={{ __html: md.render(msg.text) }} />
                            
                            {msg.papers && msg.papers.length > 0 && (
                                <div className="sources-box">
                                    <strong>İlgili Kaynaklar:</strong> {msg.papers.join(' • ')}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="message-row assistant">
                        <div className="avatar">
                            <Loader2 size={16} className="animate-spin" color="var(--accent-primary)" />
                        </div>
                        <div style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                            {mode === 'discovery' ? 'Grafik haritası ve literatür taranıyor...' : 'Döküman içi iddialar analiz ediliyor...'}
                        </div>
                    </div>
                )}
            </div>

            {/* Input Alanı: Dual-Search Bar */}
            <div className="chat-input-area" style={{ borderTop: 'none', padding: '1rem 1.5rem 1.5rem 1.5rem' }}>
                <div style={{ position: 'relative', flex: 1, display: 'flex', gap: '0.75rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Filter size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', cursor: 'pointer' }} />
                        <input 
                            type="text"
                            className="chat-input"
                            style={{ paddingLeft: '38px', backgroundColor: 'var(--bg-main)', border: '1px solid transparent' }}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={mode === 'discovery' ? "Makaleler arası bağları keşfet..." : "Bu dökümandaki iddiaları sorgula..."}
                            disabled={isLoading}
                        />
                    </div>
                    <button 
                        className="btn-primary"
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        style={{ height: '38px' }}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatView;

