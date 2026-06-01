import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { login, role } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', matKhau: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const user = await login(form);
      const r = user?.nhanVien?.vaiTro?.tenVaiTro;
      if (r === 'Quản lý') navigate('/dashboard');
      else if (r === 'Thu ngân') navigate('/pos');
      else if (r === 'Pha chế') navigate('/kds');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4a2209 0%, #8c4516 50%, #d4813a 100%)' }}>
      <div className="w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cream-100 mb-4 shadow-lg">
            <span className="text-4xl">☕</span>
          </div>
          <h1 className="font-display text-3xl text-cream-100 font-bold">Cafe System</h1>
          <p className="text-cream-300 mt-1 text-sm">Hệ thống quản lý quán cà phê</p>
        </div>

        <div className="card p-8 shadow-2xl">
          <h2 className="font-display text-xl text-coffee-800 mb-6 text-center">Đăng nhập</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-1">Email hoặc SĐT</label>
              <input
                className="input-field" type="text" placeholder="email@cafe.vn"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-1">Mật khẩu</label>
              <input
                className="input-field" type="password" placeholder="••••••••"
                value={form.matKhau} onChange={e => setForm({...form, matKhau: e.target.value})} required
              />
            </div>
            <button type="submit" className="btn-primary w-full py-3 text-base" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <a href="/" className="text-coffee-500 text-sm hover:text-coffee-700">← Về trang menu</a>
          </div>

          <div className="mt-6 pt-4 border-t border-cream-200">
            <p className="text-xs text-coffee-400 text-center">Demo accounts:</p>
            <div className="mt-2 space-y-1 text-xs text-coffee-500 text-center">
              <p>Quản lý: manager@cafe.vn / 123456</p>
              <p>Thu ngân: cashier@cafe.vn / 123456</p>
              <p>Pha chế: barista@cafe.vn / 123456</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
