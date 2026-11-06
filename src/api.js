import axios from 'axios';

// Mock API chạy bằng: json-server --watch database.json --port 9000
export const API_URL = 'http://localhost:9000';

// Tạo 1 axios instance dùng chung: các nơi khác chỉ cần api.get('/subjects')...
const api = axios.create({ baseURL: API_URL });

// Đổi lỗi của axios thành câu thông báo dễ hiểu để hiển thị cho người dùng
export function getErrorMessage(error) {
  if (error.response) {
    return `Lỗi từ máy chủ (${error.response.status}).`;
  }
  if (error.request) {
    return `Không kết nối được API (${API_URL}). Hãy chạy: npm run server`;
  }
  return error.message;
}

export default api;
