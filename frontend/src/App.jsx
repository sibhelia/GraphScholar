import { useEffect, useState } from 'react';
import Topbar from './components/Topbar';
import Footer from './components/Footer';
import GraphView from './components/GraphView';
import ChatView from './components/ChatView';
import LibraryView from './components/LibraryView';
import AnalyticsView from './components/AnalyticsView';
import WorkspaceView from './components/WorkspaceView';
import { searchApi } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [previousTab, setPreviousTab] = useState('chat');

  const handleTabChange = (tab) => {
    if (tab !== activeTab) {
      setPreviousTab(activeTab);
      setActiveTab(tab);
    }
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
    const timer = setTimeout(() => {
      void loadWorkspaceData();
    }, 0);

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
    const { mode = 'discovery', source = 'private' } = options;
    const newUserMsg = { role: 'user', text };
    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      if (source === 'global') {
        // ArXiv Araması Yap
        const response = await searchApi.searchArxiv(text);
        const results = response.data.results;

        if (results.length === 0) {
          setMessages((prev) => [...prev, {
            role: 'assistant',
            text: `ArXiv'de "${text}" ile ilgili makale bulamadım. Farklı anahtar kelimeler deneyebilirsin.`
          }]);
        } else {
          const aiMsg = {
            role: 'assistant',
            text: `"${text}" konusuyla ilgili ArXiv'de şu makaleleri buldum:`,
            isSearchResult: true,
            sources: results.map(r => ({
              title: r.title,
              excerpt: r.summary,
              year: r.published,
              paper_id: r.arxiv_id,
              authors: r.authors,
              canAdd: true
            }))
          };
          setMessages((prev) => [...prev, aiMsg]);
        }
      } else {
        // Mevcut Kütüphanede Hibrit Arama Yap (RAG)
        const response = await searchApi.query(text);
        const aiMsg = {
          role: 'assistant',
          text: response.data.answer,
          papers: response.data.relevant_papers,
          chunks_count: response.data.source_chunks_count,
          sources: response.data.sources || [],
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (error) {
      console.error('Sorgu hatası:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Üzgünüm, isteğinizi işlerken bir hata oluştu.' },
      ]);
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
          {activeTab === 'chat' && (
            <ChatView
              messages={messages}
              onSendMessage={handleSendMessage}
              onAddPaper={handleAddPaper}
              isLoading={isLoading}
              papers={papers}
              setActiveTab={handleTabChange}
            />
          )}

          {activeTab === 'workspace' && (
            <WorkspaceView
              papers={papers}
              libraryStats={libraryStats}
              setActiveTab={handleTabChange}
              onSeed={handleSeed}
            />
          )}

          {activeTab === 'graph' && <GraphView data={graphData} papers={papers} onSeed={handleSeed} isSeeding={isUploading} />}

          {activeTab === 'library' && (
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
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView papers={papers} libraryStats={libraryStats} graphData={graphData} />
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;
