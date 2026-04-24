import React from 'react';
import { Upload, Loader2, CheckCircle, FileText, Share2 } from 'lucide-react';

const LibraryView = ({ onUpload, isUploading, uploadStatus }) => {
    return (
        <div style={{ padding: '2rem', height: '100%', overflowY: 'auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>Kütüphanem</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Araştırma makalelerinizi buradan yönetebilir ve yeni dökümanlar ekleyebilirsiniz.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Yukleme Alani */}
                <div className="upload-section" style={{ border: 'none', background: 'transparent', padding: '0' }}>
                    <label className={`upload-card ${isUploading ? 'loading' : ''}`} style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                        <input 
                            type="file" 
                            accept=".pdf" 
                            onChange={(e) => onUpload(e.target.files[0])}
                            style={{ display: 'none' }}
                            disabled={isUploading}
                        />
                        
                        {isUploading ? (
                            <Loader2 size={48} className="animate-spin" color="var(--accent-primary)" />
                        ) : uploadStatus && uploadStatus.includes('Başarı') ? (
                            <CheckCircle size={48} color="var(--success)" />
                        ) : (
                            <Upload size={48} color="var(--accent-primary)" />
                        )}
                        
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                {isUploading ? 'Makale İşleniyor...' : 'Yeni Makale Yükle'}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                {uploadStatus || 'PDF dosyasını buraya sürükleyin veya tıklayın'}
                            </div>
                        </div>
                    </label>
                </div>

                {/* Mevcut Makaleler Ozeti (Gelistirilebilir) */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '4px', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Sistem Durumu</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                            <FileText size={16} color="var(--accent-primary)" />
                            <span>Vektör Veritabanı Aktif</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                            <Share2 size={16} color="var(--accent-primary)" />
                            <span>Neo4j Grafik Bağlantısı Hazır</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LibraryView;
