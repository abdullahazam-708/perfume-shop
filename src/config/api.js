export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getStaticUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

export default API_BASE_URL;

