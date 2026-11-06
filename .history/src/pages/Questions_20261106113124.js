import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Container, Spinner, Table } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../api';
import QuestionModal from '../components/QuestionModal';

export default function Questions() {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [subject, setSubject] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  const [modal, setModal] = useState({ show: false, question: null });

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setNotFound(false);
    setError('');
    Promise.all([
      api.get(`/subjects/${id}`),
      api.get('/questions', { params: { subjectId: id } }), 
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


  const handleDelete = async (question) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này không?')) return;
    try {
      await api.delete(`/questions/${question.id}`);
      setQuestions((list) => list.filter((q) => q.id !== question.id));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };



  if (notFound) {
    return (
      <Container className="py-4">
        <Alert variant="warning">Không tìm thấy môn học có mã “{id}”.</Alert>
        <Button style={{ backgroundColor: '#02010f', borderColor: '#000000' }} onClick={() => navigate('/subjects')}>
          Quay lại danh sách môn
        </Button>
      </Container>
    );
  }

  
}
