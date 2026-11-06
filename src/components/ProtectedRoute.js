import { Navigate, Outlet } from 'react-router-dom';
import { getSession } from '../auth';

// Bảo vệ các trang cần đăng nhập: chưa có session thì đẩy về /login.
// Có session thì <Outlet /> hiển thị trang con bên trong.
export default function ProtectedRoute() {
  return getSession() ? <Outlet /> : <Navigate to="/login" replace />;
}
