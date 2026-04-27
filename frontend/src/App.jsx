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

  const handleSendMessage = async (text) => {
    const newUserMsg = { role: 'user', text };
    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const response = await searchApi.query(text);
      const aiMsg = {
        role: 'assistant',
        text: response.data.answer,
        papers: response.data.relevant_papers,
        chunks_count: response.data.source_chunks_count,
        sources: response.data.sources || [],
      };
      setMessages((prev) => [...prev, aiMsg]);
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

  return (
    <div className="app-shell">
      <div className="workspace-shell">
        <Topbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          libraryStats={libraryStats}
        />

        <main className="workspace-main">
          {activeTab === 'chat' && (
            <ChatView
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              papers={papers}
            />
          )}

          {activeTab === 'workspace' && (
            <WorkspaceView
              papers={papers}
              libraryStats={libraryStats}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'graph' && <GraphView data={graphData} papers={papers} />}

          {activeTab === 'library' && (
            <LibraryView
              onUpload={handleUpload}
              isUploading={isUploading}
              uploadStatus={uploadStatus}
              papers={papers}
              libraryStats={libraryStats}
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
