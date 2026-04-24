import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Footer from './components/Footer';
import GraphView from './components/GraphView';
import ChatView from './components/ChatView';
import LibraryView from './components/LibraryView';
import { searchApi } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });

  const handleUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    setUploadStatus(`Yükleniyor: ${file.name}...`);
    
    try {
      const response = await searchApi.analyzePdf(file);
      setUploadStatus('Başarıyla yüklendi ve işlendi!');
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (error) {
      console.error("Yükleme hatası:", error);
      setUploadStatus('Yükleme sırasında hata oluştu.');
      setTimeout(() => setUploadStatus(''), 4000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async (text) => {
    const newUserMsg = { role: 'user', text };
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const response = await searchApi.query(text);
      const aiMsg = {
        role: 'assistant',
        text: response.data.answer,
        papers: response.data.relevant_papers,
        chunks_count: response.data.source_chunks_count
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Sorgu hatası:", error);
      setMessages(prev => [...prev, { role: 'assistant', text: "Üzgünüm, isteğinizi işlerken bir hata oluştu." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      
      <div className="content-wrapper">
        <Topbar />
        
        <main className="main-content">
          {activeTab === 'chat' && (
            <ChatView 
              messages={messages} 
              onSendMessage={handleSendMessage} 
              isLoading={isLoading} 
            />
          )}
          
          {activeTab === 'graph' && (
            <GraphView data={graphData} />
          )}

          {activeTab === 'library' && (
              <LibraryView 
                  onUpload={handleUpload}
                  isUploading={isUploading}
                  uploadStatus={uploadStatus}
              />
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;
