import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Topbar from './components/Topbar';
import Footer from './components/Footer';
import GraphView from './components/GraphView';
import ChatView from './components/ChatView';
import LibraryView from './components/LibraryView';
import AnalyticsView from './components/AnalyticsView';
import WorkspaceView from './components/WorkspaceView';
import { searchApi } from './services/api';

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

  const handleTabChange = (tab) => {
    setPreviousTab(activeTab);
    navigate('/' + tab);
  };

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [papers, setPapers] = useState([]);
  const [libraryStats, setLibraryStats] = useState(null);

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
    const timer = setTimeout(() => { void loadWorkspaceData(); }, 0);
    return () => clearTimeout(timer);
  }, []);

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
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setIsLoading(true);
    try {
      if (source === 'global') {
        const response = await searchApi.searchArxiv(text);
        const results = response.data.results;
        if (results.length === 0) {
          setMessages((prev) => [...prev, { role: 'assistant', text: `ArXiv'de "${text}" ile ilgili makale bulamadım.` }]);
        } else {
          setMessages((prev) => [...prev, {
            role: 'assistant',
            text: `"${text}" konusuyla ilgili ArXiv'de şu makaleleri buldum:`,
            isSearchResult: true,
            sources: results.map(r => ({ title: r.title, excerpt: r.summary, year: r.published, paper_id: r.arxiv_id, authors: r.authors, canAdd: true }))
          }]);
        }
      } else {
        const response = await searchApi.query(text);
        setMessages((prev) => [...prev, {
          role: 'assistant',
          text: response.data.answer,
          papers: response.data.relevant_papers,
          chunks_count: response.data.source_chunks_count,
          sources: response.data.sources || [],
        }]);
      }
    } catch (error) {
      console.error('Sorgu hatası:', error);
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Üzgünüm, bir hata oluştu.' }]);
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
    setUploadStatus("Demo veriler ekleniyor...");
    setIsUploading(true);
    try {
      const response = await fetch('http://localhost:8080/seed-demo', { method: 'POST' });
      const data = await response.json();
      if (data.status === 'success') {
        await loadWorkspaceData();
        setUploadStatus(data.message);
        setTimeout(() => setUploadStatus(""), 4000);
      } else {
        setUploadStatus("Hata: " + (data.detail || "Bilinmeyen hata"));
      }
    } catch (error) {
      console.error("Seed hatası:", error);
      setUploadStatus("Bağlantı hatası. Docker çalışıyor mu?");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="workspace-shell">
        <Topbar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          libraryStats={libraryStats}
          uploadStatus={uploadStatus}
          isUploading={isUploading}
        />

        <main className="workspace-main">
          <Routes>
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route path="/chat" element={
              <ChatView messages={messages} onSendMessage={handleSendMessage} onAddPaper={handleAddPaper} isLoading={isLoading} papers={papers} setActiveTab={handleTabChange} />
            } />
            <Route path="/workspace" element={
              <WorkspaceView papers={papers} libraryStats={libraryStats} setActiveTab={handleTabChange} onSeed={handleSeed} />
            } />
            <Route path="/graph" element={
              <GraphView data={graphData} papers={papers} onSeed={handleSeed} isSeeding={isUploading} />
            } />
            <Route path="/library" element={
              <LibraryView onUpload={handleUpload} onAddPaper={handleAddPaper} isUploading={isUploading} uploadStatus={uploadStatus} papers={papers} libraryStats={libraryStats} setActiveTab={handleTabChange} previousTab={previousTab} />
            } />
            <Route path="/analytics" element={
              <AnalyticsView papers={papers} libraryStats={libraryStats} graphData={graphData} />
            } />
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
      <AppInner />
    </BrowserRouter>
  );
}

export default App;
