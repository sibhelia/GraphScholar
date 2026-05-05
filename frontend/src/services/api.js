import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const searchApi = {
    analyzePdf: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/analyze-pdf', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    query: (question, history = []) => api.post('/query', { question, history }),
    health: () => api.get('/health'),
    getPapers: () => api.get('/papers'),
    getLibraryOverview: () => api.get('/library/overview'),
    getGraph: () => api.get('/graph'),
    getGraphPath: (start, end) => api.get('/graph/path', { params: { start, end } }),
    searchArxiv: (query) => api.get(`/search-arxiv?q=${query}`),
    addPaperFromArxiv: (title) => api.post('/add-from-arxiv', { title }),
    seedDemo: () => api.post('/seed-demo'),
};

export const conversationApi = {
    list: () => api.get('/conversations'),
    get: (id) => api.get(`/conversations/${id}`),
    create: (title = '') => api.post('/conversations', { title }),
    rename: (id, title) => api.patch(`/conversations/${id}`, { title }),
    delete: (id) => api.delete(`/conversations/${id}`),
    addMessage: (conversationId, role, content) =>
        api.post(`/conversations/${conversationId}/messages`, { role, content }),
};

export default api;
