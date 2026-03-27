import axios from 'axios';

const api = axios.create({
  baseURL: 'http://3.26.150.11:5000/api',
});

export default api;
