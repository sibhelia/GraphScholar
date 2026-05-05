import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, KeyRound, Loader2, Network, User } from 'lucide-react';

const AuthView = () => {
    const { login, register } = useAuth();
    const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            setError('Kullanıcı adı ve şifre gereklidir.');
            return;
        }

        setError('');
        setLoading(true);

        try {
            if (activeTab === 'login') {
                await login(username, password);
            } else {
                await register(username, password);
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-left-pane">
                <div className="auth-hero-content" style={{ color: 'white' }}>
                    <div className="auth-hero-logo" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <img 
                            src="/graphscholar-logo.png" 
                            alt="GraphScholar Logo" 
                            style={{ width: '80px', height: 'auto', filter: 'brightness(0) invert(1)' }} 
                        />
                        <span style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1px' }}>GraphScholar</span>
                    </div>
                    <h2 style={{ color: 'white', fontWeight: '700' }}>Akademik araştırmalarınızın<br/>yeni merkezi.</h2>
                    <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Makaleleri analiz edin, bilgi grafları oluşturun ve yapay zeka ile literatürü daha derinlemesine keşfedin.</p>
                </div>
                <div className="auth-hero-pattern"></div>
                {/* Wavy Divider */}
                <svg className="auth-wave" viewBox="0 0 200 100" preserveAspectRatio="none" style={{
                    position: 'absolute',
                    right: '-1px',
                    top: 0,
                    bottom: 0,
                    height: '100%',
                    width: '250px',
                    fill: 'var(--bg)'
                }}>
                    <path d="M200,0 L200,100 L100,100 C0,75 200,25 100,0 Z"></path>
                </svg>
            </div>

            <div className="auth-right-pane">
                <div className="auth-card-modern">
                    <div className="auth-mobile-header">
                        <img src="/graphscholar-logo.png" alt="GraphScholar Logo" style={{ width: '150px' }} />
                    </div>

                    <div className="auth-tabs">
                        <button 
                            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('login'); setError(''); }}
                        >
                            Giriş Yap
                        </button>
                        <button 
                            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('register'); setError(''); }}
                        >
                            Hesap Oluştur
                        </button>
                    </div>

                    <div className="auth-form-container">
                        <h3>{activeTab === 'login' ? 'Tekrar Hoş Geldiniz' : 'Aramıza Katılın'}</h3>
                        <p className="auth-subtitle">
                            {activeTab === 'login' 
                                ? 'Araştırmalarınıza kaldığınız yerden devam edin.' 
                                : 'Ücretsiz bir hesap oluşturarak platformu keşfetmeye başlayın.'}
                        </p>

                        <form onSubmit={handleSubmit} className="auth-form-modern">
                            {error && (
                                <div className="auth-error-banner">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                    <span>{error}</span>
                                </div>
                            )}
                            
                            <div className="form-group-modern">
                                <label>Kullanıcı Adı</label>
                                <div className="input-wrapper-modern">
                                    <User size={18} />
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Araştırmacı adınız"
                                    />
                                </div>
                            </div>

                            <div className="form-group-modern">
                                <label>Şifre</label>
                                <div className="input-wrapper-modern">
                                    <KeyRound size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button type="submit" className="auth-submit-btn-modern" disabled={loading}>
                                {loading ? <Loader2 className="spin" size={20} /> : (activeTab === 'login' ? 'Giriş Yap' : 'Kayıt Ol')}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthView;
