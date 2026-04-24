import axios from 'axios';

const API_URL = 'http://localhost:8080';

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
    query: (question) => api.post('/query', { question }),
    health: () => api.get('/health'),
};

export default api;
