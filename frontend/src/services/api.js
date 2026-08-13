import axios from 'axios';

// withCredentials: true - can thiet de trinh duyet tu gui kem cookie httpOnly
// (chua token) o moi request, thay vi tu doc token roi gan header Authorization
// nhu truoc (khong con lam duoc nua vi cookie httpOnly JS khong doc duoc).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

export default api;
