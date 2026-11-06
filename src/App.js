import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Subjects from './pages/Subjects';
import Questions from './pages/Questions';

// Ảnh minh họa trong đề dùng URL /question/CSD201 (không có chữ s),
// còn phần mô tả dùng /questions/:id -> hỗ trợ cả hai, đều chuyển về /questions/:id.
function QuestionAlias() {
  const { id } = useParams();
  return <Navigate to={`/questions/${id}`} replace />;
}

function App() {
  return (
    <Routes>
      {/* Đề: đường dẫn gốc (/) tự chuyển về /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      {/* Các trang bên dưới phải đăng nhập mới vào được */}
      <Route element={<ProtectedRoute />}>
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/questions/:id" element={<Questions />} />
        <Route path="/question/:id" element={<QuestionAlias />} />
      </Route>

      {/* Đề: mọi đường dẫn không hợp lệ (*) tự chuyển về /login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
