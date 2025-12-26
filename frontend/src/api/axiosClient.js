import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:3000/api', // Địa chỉ Backend của bạn
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cấu hình interceptor (Tùy chọn: để xử lý token sau này)
axiosClient.interceptors.request.use((config) => {
  // Sau này khi có login, bạn sẽ lấy token từ localStorage gắn vào đây
  // const token = localStorage.getItem('token');
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
  return config;
});

export default axiosClient;