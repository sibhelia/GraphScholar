import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

const ChatView = ({ onSendMessage, messages, isLoading }) => {
    const [input, setInput] = useState('');
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!input.trim() || isLoading) return;
        onSendMessage(input);
        setInput('');
    };

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="header">
                <Bot size={24} color="var(--accent-primary)" />
                <span>Akademik İçgörü Asistanı</span>
            </div>

            <div className="chat-container" ref={scrollRef}>
                {messages.length === 0 && (
                    <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-secondary)' }}>
                        <p>Yüklediğiniz araştırma makaleleri hakkında soru sorun...</p>
                        <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', opacity: 0.7 }}>Örn: Bu makalenin temel hipotezi nedir?</p>
                    </div>
                )}
                
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message-row ${msg.role === 'user' ? 'user' : 'assistant'}`}>
                        <div className="avatar">
                            {msg.role === 'user' ? <User size={20} /> : <Bot size={20} color="var(--accent-primary)" />}
                        </div>
                        
                        <div className="message-bubble">
                            <div className="markdown-content" dangerouslySetInnerHTML={{ __html: md.render(msg.text) }} />
                            
                            {msg.papers && msg.papers.length > 0 && (
                                <div className="sources-box">
                                    <strong style={{ color: 'var(--accent-primary)' }}>Kaynaklar:</strong> {msg.papers.join(', ')} 
                                    <span style={{ opacity: 0.7, marginLeft: '5px' }}>(Parçalar: {msg.chunks_count})</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="message-row assistant">
                        <div className="avatar">
                            <Loader2 size={20} className="animate-spin" color="var(--accent-primary)" />
                        </div>
                        <div style={{ padding: '1rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            Hibrit bilgi tabanı analiz ediliyor...
                        </div>
                    </div>
                )}
            </div>

            <div className="chat-input-area">
                <input 
                    type="text"
                    className="chat-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Akademik sorgunuzu buraya yazın..."
                    disabled={isLoading}
                />
                <button 
                    className="btn-primary"
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
};

export default ChatView;
