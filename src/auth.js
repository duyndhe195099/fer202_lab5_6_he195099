// Quản lý phiên đăng nhập bằng localStorage (đề: "save the user session data into localStorage")
const KEY = 'user';

// Lấy thông tin người dùng đang đăng nhập; chưa đăng nhập thì trả về null
export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(KEY));
  } catch {
    return null;
  }
}

export function saveSession(user) {
  localStorage.setItem(KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(KEY);
}
