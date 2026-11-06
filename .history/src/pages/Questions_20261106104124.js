import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Container, Spinner, Table } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../api';
import QuestionModal from '../components/QuestionModal';

export default function Questions() {
  const { id } = useParams(); // mã môn lấy từ URL /questions/:id
  const navigate = useNavigate();

  const [subject, setSubject] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  // modal: show = đang mở hay không; question = null (thêm mới) hoặc câu hỏi đang sửa
  const [modal, setModal] = useState({ show: false, question: null });

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setNotFound(false);
    setError('');
    Promise.all([
      api.get(`/subjects/${id}`),
      api.get('/questions', { params: { subjectId: id } }), // chỉ lấy câu hỏi của môn này
    ])
      .then(([subjectRes, questionRes]) => {
        if (ignore) return;
        setSubject(subjectRes.data);
        setQuestions(questionRes.data);
      })
      .catch((err) => {
        if (ignore) return;
        if (err.response && err.response.status === 404) setNotFound(true);
        else setError(getErrorMessage(err));
      })
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [id]);

  const closeModal = useCallback(() => setModal({ show: false, question: null }), []);

  // THÊM mới (POST) hoặc SỬA (PUT) tùy modal.question có giá trị hay không
  const handleSave = async (data) => {
    if (modal.question) {
      const { data: updated } = await api.put(`/questions/${modal.question.id}`, {
        ...modal.question,
        ...data,
      });
      setQuestions((list) => list.map((q) => (q.id === updated.id ? updated : q)));
    } else {
      const { data: created } = await api.post('/questions', { subjectId: id, ...data });
      setQuestions((list) => [...list, created]);
    }
    closeModal();
  };

  // Đề: Xóa phải hỏi window.confirm trước khi xóa khỏi database
  const handleDelete = async (question) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này không?')) return;
    try {
      await api.delete(`/questions/${question.id}`);
      setQuestions((list) => list.filter((q) => q.id !== question.id));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (notFound) {
    return (
      <Container className="py-4">
        <Alert variant="warning">Không tìm thấy môn học có mã “{id}”.</Alert>
        <Button variant="secondary" onClick={() => navigate('/subjects')}>
          Quay lại danh sách môn
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          {/* Đề: tiêu đề có mã môn + tổng số câu hỏi hiện tại */}
          <h3 className="mb-1">
            Bộ câu hỏi môn: {subject ? subject.name : ''} ({id})
          </h3>
          <small className="text-muted">Tổng số câu hỏi: {questions.length}</small>
        </div>
        <div>
          <Button
            variant="success"
            className="me-2"
            onClick={() => setModal({ show: true, question: null })}
          >
            + Thêm câu hỏi mới
          </Button>
          <Button variant="secondary" onClick={() => navigate('/subjects')}>
            Quay lại danh sách môn
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Table bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th style={{ width: 50 }}>#</th>
            <th>Nội dung câu hỏi</th>
            <th>Các đáp án</th>
            <th>Đáp án đúng</th>
            <th style={{ width: 140 }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q, index) => (
            <tr key={q.id}>
              {/* Đề: đánh số thứ tự liên tục (1, 2, 3...) */}
              <td>{index + 1}</td>
              <td>{q.content}</td>
              <td>{Array.isArray(q.options) ? q.options.join(', ') : ''}</td>
              {/* Đề: đáp án đúng hiển thị chữ màu xanh lá */}
              <td className="text-success fw-semibold">{q.correctAnswer}</td>
              <td>
                {/* Đề: Sửa (vàng), Xóa (đỏ) */}
                <Button
                  variant="warning"
                  size="sm"
                  className="me-2"
                  onClick={() => setModal({ show: true, question: q })}
                >
                  Sửa
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(q)}>
                  Xóa
                </Button>
              </td>
            </tr>
          ))}
          {questions.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center text-muted">
                Chưa có câu hỏi nào
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <QuestionModal
        show={modal.show}
        question={modal.question}
        onSave={handleSave}
        onClose={closeModal}
      />
    </Container>
  );
}
