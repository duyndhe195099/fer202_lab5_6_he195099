import { useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../api';
import { saveSession } from '../auth';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); // chặn trình duyệt tải lại trang khi submit form
    setError('');

    if (!email.trim() || !password) {
      setError('Vui lòng nhập email và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      // Tìm tài khoản theo email trong bảng accounts của mock API
      const { data } = await api.get('/accounts', { params: { email: email.trim() } });
      const account = data.find((a) => a.password === password);

      if (!account) {
        setError('Email hoặc mật khẩu không đúng');
        return;
      }

      // Tài khoản bị khóa: từ chối hoàn toàn. So sánh không phân biệt hoa/thường
      // vì dữ liệu có cả "Inactive" lẫn "active".
      if (String(account.status).toLowerCase() === 'inactive') {
        setError('Tài khoản đã bị khóa');
        return;
      }

      // Đăng nhập thành công: lưu session (không lưu mật khẩu) rồi sang trang môn học
      saveSession({
        id: account.id,
        email: account.email,
        role: account.role,
        status: account.status,
      });
      navigate('/subjects', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <Card style={{ width: 380 }} className="shadow-sm">
        <Card.Body className="p-4">
          <h3 className="text-center mb-4">Sign In</h3>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Control
                type="text"
                placeholder="email of student or lecture"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              {/* type="password": ký tự hiển thị dạng dấu chấm */}
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </Form.Group>

            {/* Thông báo lỗi màu đỏ (text-danger) */}
            {error && <p className="text-danger mb-3">{error}</p>}

            <Button type="submit" variant="primary" className="w-100" disabled={loading}>
              Login
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
