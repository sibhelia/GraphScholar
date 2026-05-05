import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import AnalyticsView from './components/AnalyticsView';
import ChatView from './components/ChatView';
import ConversationSidebar from './components/ConversationSidebar';
import Footer from './components/Footer';
import GraphView from './components/GraphView';
import LibraryView from './components/LibraryView';
import Topbar from './components/Topbar';
import WorkspaceView from './components/WorkspaceView';
import { searchApi, conversationApi } from './services/api';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthView from './components/AuthView';
import { Loader2 } from 'lucide-react';



function buildConversationTitle(text) {
  const trimmed = text.trim();
  if (!trimmed) return 'Yeni sohbet';
  return trimmed.length > 42 ? `${trimmed.slice(0, 42)}...` : trimmed;
}

function AppInner() {
  const navigate = useNavigate();
  const location = useLocation();

  const pathToTab = {
    '/chat': 'chat',
    '/workspace': 'workspace',
    '/graph': 'graph',
    '/library': 'library',
    '/analytics': 'analytics',
  };
  const activeTab = pathToTab[location.pathname] || 'chat';
  const [previousTab, setPreviousTab] = useState('chat');

  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [papers, setPapers] = useState([]);
  const [libraryStats, setLibraryStats] = useState(null);

  const currentConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === currentConversationId) || conversations[0],
    [conversations, currentConversationId],
  );
  const messages = currentConversation?.messages || [];

  const { user, logout } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);

  // Sohbetleri veritabanından yükle
  useEffect(() => {
    const initConversations = async () => {
      if (!user) {
        setIsInitializing(false);
        return;
      }
      
      try {
        setIsInitializing(true);
        const res = await conversationApi.list();
        const data = res.data;
        
        if (data.length === 0) {
          const r = await conversationApi.create('');
          setConversations([r.data]);
          setCurrentConversationId(r.data.id);
        } else {
          setConversations(data);
          setCurrentConversationId(data[0].id);
        }
      } catch (err) {
        console.error('Sohbetler yüklenemedi:', err);
      } finally {
        setIsInitializing(false);
      }
    };

    initConversations();
  }, [user]);

  const loadWorkspaceData = async () => {
    try {
      const [papersResponse, overviewResponse, graphResponse] = await Promise.all([
        searchApi.getPapers(),
        searchApi.getLibraryOverview(),
        searchApi.getGraph(),
      ]);
      setPapers(papersResponse.data.papers || []);
      setLibraryStats(overviewResponse.data.stats || null);
      setGraphData(graphResponse.data || { nodes: [], edges: [] });
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadWorkspaceData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (isInitializing) {
    return (
      <div className="auth-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <img src="/graphscholar-logo.png" alt="Logo" style={{ width: '120px', marginBottom: '20px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--green)' }}>
            <Loader2 className="spin" size={24} />
            <span style={{ fontWeight: '500' }}>Sistem Hazırlanıyor...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <AuthView />;

  const handleTabChange = (tab) => {
    setPreviousTab(activeTab);
    navigate(`/${tab}`);
  };

  const updateCurrentConversation = (updater) => {
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === currentConversationId ? updater(conversation) : conversation,
      ),
    );
  };

  const createNewConversation = async () => {
    try {
      const res = await conversationApi.create('');
      setConversations((prev) => [res.data, ...prev]);
      setCurrentConversationId(res.data.id);
      navigate('/chat');
    } catch (err) {
      console.error('Yeni sohbet oluşturulamadı:', err);
    }
  };

  const deleteConversation = async (conversationId) => {
    const confirmed = window.confirm('Bu sohbeti silmek istediğinize emin misiniz?');
    if (!confirmed) return;
    try {
      await conversationApi.delete(conversationId);
      const remaining = conversations.filter((c) => c.id !== conversationId);
      if (remaining.length === 0) {
        const res = await conversationApi.create('');
        setConversations([res.data]);
        setCurrentConversationId(res.data.id);
      } else {
        setConversations(remaining);
        if (currentConversationId === conversationId) {
          setCurrentConversationId(remaining[0].id);
        }
      }
      navigate('/chat');
    } catch (err) {
      console.error('Sohbet silinemedi:', err);
    }
  };

  const selectConversation = async (conversationId) => {
    setCurrentConversationId(conversationId);
    navigate('/chat');
    
    // Arka planda tam detayını çekip state'i güncelle
    try {
      const res = await conversationApi.get(conversationId);
      setConversations((prev) => 
        prev.map((c) => (c.id === conversationId ? res.data : c))
      );
    } catch (error) {
      console.error('Sohbet detayı alınamadı:', error);
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    setUploadStatus(`Yükleniyor: ${file.name}...`);
    try {
      await searchApi.analyzePdf(file);
      await loadWorkspaceData();
      setUploadStatus('Başarıyla yüklendi ve işlendi.');
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (error) {
      console.error('Yükleme hatası:', error);
      setUploadStatus('Yükleme sırasında hata oluştu.');
      setTimeout(() => setUploadStatus(''), 4000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async (text, options = {}) => {
    const { source = 'private' } = options;
    const convId = currentConversationId;
    const userMessage = { role: 'user', text };
    
    // Eğer başlık boşsa veya "Yeni Araştırma" ise ilk mesajın bir kısmını başlık yap
    const isFirst = !currentConversation?.title || currentConversation?.title === 'Yeni Araştırma' || (currentConversation?.messages || []).length === 0;
    const newTitle = isFirst ? buildConversationTitle(text) : null;

    // UI'yi hemen güncelle (optimistic)
    updateCurrentConversation((conversation) => ({
      ...conversation,
      title: newTitle || conversation.title,
      updatedAt: new Date().toISOString(),
      messages: [...conversation.messages, userMessage],
    }));

    // Kullanıcı mesajını veritabanına kaydet
    try {
      await conversationApi.addMessage(convId, 'user', text);
      if (newTitle) await conversationApi.rename(convId, newTitle);
    } catch (e) {
      console.warn('Mesaj kaydedilemedi (user):', e);
    }

    setIsLoading(true);
    try {
      let assistantMessage;

      if (source === 'global') {
        const response = await searchApi.searchArxiv(text);
        const results = response.data.results;
        assistantMessage =
          results.length === 0
            ? { role: 'assistant', text: `ArXiv'de "${text}" ile ilgili makale bulamadım.` }
            : {
                role: 'assistant',
                text: `"${text}" konusuyla ilgili ArXiv'de şu makaleleri buldum:`,
                isSearchResult: true,
                sources: results.map((r) => ({
                  title: r.title,
                  excerpt: r.summary,
                  year: r.published,
                  paper_id: r.arxiv_id,
                  authors: r.authors,
                  canAdd: true,
                })),
              };
      } else {
        const nextHistory = [...messages, userMessage]
          .slice(-10)
          .map((message) => ({ role: message.role, text: message.text }));

        const response = await searchApi.query(text, nextHistory);
        assistantMessage = {
          role: 'assistant',
          text: response.data.answer,
          papers: response.data.relevant_papers,
          chunks_count: response.data.source_chunks_count,
          sources: response.data.sources || [],
        };
      }

      updateCurrentConversation((conversation) => ({
        ...conversation,
        updatedAt: new Date().toISOString(),
        messages: [...conversation.messages, assistantMessage],
      }));

      // Asistan cevabını veritabanına kaydet
      try {
        await conversationApi.addMessage(convId, 'assistant', assistantMessage.text);
      } catch (e) {
        console.warn('Mesaj kaydedilemedi (assistant):', e);
      }
    } catch (error) {
      console.error('Sorgu hatası:', error);
      updateCurrentConversation((conversation) => ({
        ...conversation,
        updatedAt: new Date().toISOString(),
        messages: [...conversation.messages, { role: 'assistant', text: 'Üzgünüm, bir hata oluştu.' }],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPaper = async (title) => {
    try {
      setUploadStatus(`Makale ekleniyor: ${title}...`);
      setIsUploading(true);
      await searchApi.addPaperFromArxiv(title);
      await loadWorkspaceData();
      setUploadStatus(`"${title}" kütüphaneye eklendi!`);
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (error) {
      console.error('Makale ekleme hatası:', error);
      setUploadStatus('Makale eklenirken bir hata oluştu.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSeed = async () => {
    setUploadStatus('Demo veriler ekleniyor...');
    setIsUploading(true);
    try {
      const response = await searchApi.seedDemo();
      const data = response.data;
      if (data.status === 'success') {
        await loadWorkspaceData();
        setUploadStatus(data.message);
        setTimeout(() => setUploadStatus(''), 4000);
      } else {
        setUploadStatus(`Hata: ${data.detail || 'Bilinmeyen hata'}`);
      }
    } catch (error) {
      console.error('Seed hatası:', error);
      setUploadStatus('Bağlantı hatası. Docker çalışıyor mu?');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="app-shell app-shell-with-sidebar">
      <ConversationSidebar
        user={user}
        conversations={conversations}
        currentConversationId={currentConversation?.id}
        onSelectConversation={selectConversation}
        onCreateConversation={createNewConversation}
        onDeleteConversation={deleteConversation}
      />

      <div className={`workspace-shell${activeTab === 'graph' || activeTab === 'analytics' ? ' shell-fullwidth' : ''}`}>
        <Topbar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          libraryStats={libraryStats}
          uploadStatus={uploadStatus}
          isUploading={isUploading}
          user={user}
          onLogout={logout}
        />

        <main className="workspace-main">
          <Routes>
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route
              path="/chat"
              element={
                <ChatView
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  onAddPaper={handleAddPaper}
                  isLoading={isLoading}
                  papers={papers}
                  setActiveTab={handleTabChange}
                />
              }
            />
            <Route
              path="/workspace"
              element={<WorkspaceView papers={papers} libraryStats={libraryStats} setActiveTab={handleTabChange} onSeed={handleSeed} />}
            />
            <Route path="/graph" element={<GraphView data={graphData} papers={papers} onSeed={handleSeed} isSeeding={isUploading} />} />
            <Route
              path="/library"
              element={
                <LibraryView
                  onUpload={handleUpload}
                  onAddPaper={handleAddPaper}
                  isUploading={isUploading}
                  uploadStatus={uploadStatus}
                  papers={papers}
                  libraryStats={libraryStats}
                  setActiveTab={handleTabChange}
                  previousTab={previousTab}
                />
              }
            />
            <Route path="/analytics" element={<AnalyticsView papers={papers} libraryStats={libraryStats} graphData={graphData} />} />
            <Route path="*" element={<Navigate to="/chat" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
