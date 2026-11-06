import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Container, Form, Modal, Spinner, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../api';
import { clearSession, getSession } from '../auth';

export default function Subjects() {
  const navigate = useNavigate();
  const user = getSession(); // chắc chắn có vì trang này nằm trong ProtectedRoute

  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [infoSubject, setInfoSubject] = useState(null); // môn đang xem ở nút "Thông tin"

  // Gọi 2 API cùng lúc khi trang vừa hiện ra
  useEffect(() => {
    let ignore = false; // tránh setState khi component đã bị gỡ (cleanup của useEffect)
    Promise.all([api.get('/subjects'), api.get('/questions')])
      .then(([subjectRes, questionRes]) => {
        if (ignore) return;
        setSubjects(subjectRes.data);
        setQuestions(questionRes.data);
      })
      .catch((err) => !ignore && setError(getErrorMessage(err)))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, []);

  // Đề: số lượng câu hỏi TỰ TÍNH từ mảng questions thực tế,
  // không dùng trường questionsCount trong subjects (trường này có thể đã cũ).
  const countBySubject = useMemo(() => {
    const counts = {};
    questions.forEach((q) => {
      counts[q.subjectId] = (counts[q.subjectId] || 0) + 1;
    });
    return counts;
  }, [questions]);

  // Đề: lọc môn học theo Mã môn hoặc Tên môn học (không phân biệt hoa/thường)
  const filteredSubjects = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return subjects.filter(
      (s) => s.id.toLowerCase().includes(kw) || s.name.toLowerCase().includes(kw)
    );
  }, [subjects, keyword]);

  // Đề: Logout xóa session và quay về /login
  const handleLogout = () => {
    clearSession();
    navigate('/login', { replace: true });
  };

  return (
    <Container className="py-4">
      {/* Thanh chào: "Hello [Email] ([Role])" + nút Logout đỏ ở góc phải */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          Hello {user.email} ({user.role})
        </div>
        <Button variant="danger" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <h3 className="mb-3">Danh sách môn học</h3>

      <Form.Control
        type="text"
        className="mb-3"
        placeholder="Tìm kiếm môn học..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <Table striped hover responsive>
          <thead>
            <tr>
              <th>Mã môn</th>
              <th>Tên môn học</th>
              <th>Số lượng câu hỏi</th>
              <th>Tools</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubjects.map((s) => (
              <tr key={s.id}>
                <td>
                  <strong>{s.id}</strong>
                </td>
                <td>{s.name}</td>
                <td>{countBySubject[s.id] || 0}</td>
                <td>
                  {/* Đề: nút xanh dẫn tới trang quản lý câu hỏi /questions/:id */}
                  <Button
                    variant="primary"
                    size="sm"
                    className="me-2"
                    onClick={() => navigate(`/questions/${s.id}`)}
                  >
                    Truy cập bộ câu hỏi
                  </Button>
                  {/* Đề: nút xám "Thông tin" -> mở hộp thoại thông tin môn học */}
                  <Button variant="secondary" size="sm" onClick={() => setInfoSubject(s)}>
                    Thông tin
                  </Button>
                </td>
              </tr>
            ))}
            {filteredSubjects.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-muted">
                  Không tìm thấy môn học
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      <Modal show={infoSubject !== null} onHide={() => setInfoSubject(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Thông tin môn học</Modal.Title>
        </Modal.Header>
        {infoSubject && (
          <Modal.Body>
            <p className="mb-1">
              <strong>Mã môn:</strong> {infoSubject.id}
            </p>
            <p className="mb-1">
              <strong>Tên môn học:</strong> {infoSubject.name}
            </p>
            <p className="mb-0">
              <strong>Số lượng câu hỏi:</strong> {countBySubject[infoSubject.id] || 0}
            </p>
          </Modal.Body>
        )}
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setInfoSubject(null)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
