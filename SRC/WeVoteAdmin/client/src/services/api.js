import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Backend base URL
});

export const login = (credentials) => API.post('/auth/login', credentials);
export const fetchPolls = () => API.get('/polls');
export const fetchUsers = () => API.get('/users');
// Add more API calls here...
