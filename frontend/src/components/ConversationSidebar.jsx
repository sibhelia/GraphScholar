import { useState } from 'react';
import { History, MessageSquarePlus, PanelLeft, Pencil, Search, Trash2 } from 'lucide-react';

function formatConversationDate(timestamp) {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'short',
    });
}

function buildPreview(messages = []) {
    const firstUser = messages.find((message) => message.role === 'user');
    if (!firstUser?.text) return 'Yeni Araştırma';
    return firstUser.text.length > 64 ? `${firstUser.text.slice(0, 64)}...` : firstUser.text;
}

const ConversationSidebar = ({
    user,
    conversations = [],
    currentConversationId,
    onSelectConversation,
    onCreateConversation,
    onRenameConversation,
    onDeleteConversation,
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredConversations = conversations.filter(conv => {
        const title = conv.title || buildPreview(conv.messages) || '';
        return title.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const orderedConversations = [...filteredConversations].sort(
        (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime(),
    );

    return (
        <aside className="conversation-sidebar">
            <div className="conversation-sidebar-top">
                <div className="conversation-sidebar-brand">
                    <div className="conversation-sidebar-icon">
                        <History size={16} />
                    </div>
                    <div>
                        <strong>Arama Geçmişi</strong>
                        <span>Son sohbetlerin</span>
                    </div>
                </div>

                <button className="conversation-new-btn" onClick={onCreateConversation} type="button">
                    <MessageSquarePlus size={16} />
                    <span>Yeni Sohbet</span>
                </button>
            </div>

            <div className="conversation-sidebar-search">
                <Search size={14} />
                <input 
                    type="text" 
                    placeholder="Konuşmalarda ara..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="sidebar-search-input"
                />
            </div>

            <div className="conversation-list">
                {orderedConversations.length === 0 && (
                    <div className="conversation-empty">
                        <PanelLeft size={18} />
                        <p>{searchTerm ? 'Eşleşen sohbet bulunamadı.' : 'Henüz kayıtlı bir sohbet yok.'}</p>
                    </div>
                )}

                {orderedConversations.map((conversation) => {
                    const displayTitle = conversation.title || buildPreview(conversation.messages);
                    return (
                        <div
                            key={conversation.id}
                            className={`conversation-item ${conversation.id === currentConversationId ? 'active' : ''}`}
                            onClick={() => onSelectConversation(conversation.id)}
                        >
                            <div className="conversation-item-date-row">
                                <span className="conversation-date">{formatConversationDate(conversation.updatedAt)}</span>
                            </div>
                            
                            <div className="conversation-item-title-row">
                                <strong className="conversation-title">{displayTitle}</strong>
                                <button
                                    type="button"
                                    className="conversation-action-btn danger visible"
                                    aria-label="Sohbeti sil"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteConversation?.(conversation.id);
                                    }}
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="sidebar-user-card" style={{ marginTop: 'auto' }}>
                <div className="user-card-avatar">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="user-card-info">
                    <span className="user-card-name" title={user?.username || 'Kullanıcı'}>
                        {user?.username || 'Kullanıcı'}
                    </span>
                    <span className="user-card-role">Araştırmacı</span>
                </div>
                <button 
                    className="user-card-logout"
                    onClick={() => {
                        localStorage.removeItem('graphscholar_token');
                        window.location.reload();
                    }}
                    title="Çıkış Yap"
                >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                </button>
            </div>
        </aside>
    );
};

export default ConversationSidebar;
