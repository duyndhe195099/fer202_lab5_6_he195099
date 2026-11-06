import { useEffect, useState } from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import { getErrorMessage } from '../api';

const MIN_OPTION_INPUTS = 4;


export function normalizeOptions(options) {
  const list = Array.isArray(options) ? options : [];
  if (list.length === 1 && String(list[0]).includes(';')) {
    return String(list[0])
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return list.map(String);
}


function toForm(question) {
  if (!question) {
    return { content: '', options: Array(MIN_OPTION_INPUTS).fill(''), correctIndex: -1 };
  }
  const options = normalizeOptions(question.options);
  const correctIndex = options.findIndex((o) => o === question.correctAnswer);
  while (options.length < MIN_OPTION_INPUTS) options.push('');
  return { content: question.content, options, correctIndex };
}


export default function QuestionModal({ show, question, onSave, onClose }) {
  const [form, setForm] = useState(() => toForm(question));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);


  useEffect(() => {
    if (show) {
      setForm(toForm(question));
      setError('');
    }
  }, [show, question]);

  const setOption = (index, value) => {
    setForm((f) => ({ ...f, options: f.options.map((o, i) => (i === index ? value : o)) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const content = form.content.trim();
    const options = form.options.map((o) => o.trim()).filter(Boolean);
    const correctAnswer = (form.options[form.correctIndex] || '').trim();

   
    if (!content) return setError('Vui lòng nhập nội dung câu hỏi');
    if (options.length < 2) return setError('Cần nhập ít nhất 2 đáp án');
    if (new Set(options).size !== options.length) return setError('Các đáp án không được trùng nhau');
    if (!correctAnswer) return setError('Vui lòng chọn đáp án đúng (một đáp án đã nhập)');

    setSaving(true);
    try {
      await onSave({ content, options, correctAnswer });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{question ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới'}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3" controlId="q-content">
            <Form.Label>Nội dung câu hỏi</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            />
          </Form.Group>

          <Form.Label>Các đáp án (chọn nút tròn ở đáp án đúng)</Form.Label>
          {form.options.map((option, index) => (
            <div className="d-flex align-items-center mb-2" key={index}>
              <Form.Check
                type="radio"
                name="correct"
                className="me-2"
                aria-label={`Đáp án đúng là đáp án ${index + 1}`}
                checked={form.correctIndex === index}
                onChange={() => setForm((f) => ({ ...f, correctIndex: index }))}
              />
              <Form.Control
                type="text"
                placeholder={`Đáp án ${index + 1}`}
                value={option}
                onChange={(e) => setOption(index, e.target.value)}
              />
            </div>
          ))}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            Lưu
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
