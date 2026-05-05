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
        </aside>
    );
};

export default ConversationSidebar;
