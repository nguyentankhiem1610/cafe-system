import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { orderAPI, authAPI } from '../services/api';

const formatVND = (n) => Number(n).toLocaleString('vi-VN') + 'đ';

const STATUS = {
  CHO_XAC_NHAN: { label: 'Chờ xác nhận', color: 'text-amber-600' },
  DANG_PHA_CHE:  { label: 'Đang pha chế', color: 'text-blue-600' },
  HOAN_THANH:    { label: 'Hoàn thành',   color: 'text-green-600' },
  HUY:           { label: 'Đã hủy',       color: 'text-red-500' },
};

export default function CustomerPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('orders');
  const [profile, setProfile] = useState({ hoTen: '', diaChi: '', ngaySinh: '', gioiTinh: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({ hoTen: user.hoTen || '', diaChi: user.diaChi || '', ngaySinh: user.ngaySinh?.split('T')[0] || '', gioiTinh: user.gioiTinh || '' });
      orderAPI.myOrders().then(r => setOrders(r.data));
    }
  }, [user]);

  const handleSaveProfile = async () => {
    await authAPI.updateProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Header */}
      <header className="bg-coffee-900 text-cream-100 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-cream-300 hover:text-cream-100">
          ← Menu
        </button>
        <h1 className="font-display text-lg font-bold">Tài khoản của tôi</h1>
        <button onClick={handleLogout} className="text-sm text-cream-400 hover:text-cream-100">Đăng xuất</button>
      </header>

      {/* Profile hero */}
      <div className="bg-coffee-800 text-cream-100 px-4 py-6 text-center">
        <div className="w-16 h-16 rounded-full bg-coffee-600 flex items-center justify-center text-3xl font-bold mx-auto mb-2">
          {user?.hoTen?.[0] || '?'}
        </div>
        <p className="font-display text-lg font-bold">{user?.hoTen}</p>
        <p className="text-cream-400 text-sm">{user?.email}</p>
        {user?.khachHang?.khachThanhVien && (
          <div className="mt-2 inline-flex items-center gap-2 bg-coffee-700 px-3 py-1 rounded-full">
            <span className="text-amber-400">⭐</span>
            <span className="text-xs font-medium">{user.khachHang.khachThanhVien.diemThuong} điểm tích lũy</span>
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Tabs */}
        <div className="flex gap-3 mb-4">
          {['orders', 'profile'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${tab === t ? 'bg-coffee-600 text-white' : 'bg-white text-coffee-700 border border-cream-300'}`}>
              {t === 'orders' ? '📋 Lịch sử đơn' : '👤 Hồ sơ'}
            </button>
          ))}
        </div>

        {/* Orders */}
        {tab === 'orders' && (
          <div className="space-y-3">
            {orders.length === 0 && (
              <div className="text-center py-12 text-coffee-400">
                <p className="text-4xl mb-2">🛒</p>
                <p>Bạn chưa có đơn hàng nào</p>
                <button onClick={() => navigate('/')} className="mt-3 btn-primary text-sm">Xem thực đơn</button>
              </div>
            )}
            {orders.map(order => (
              <div key={order.maDonHang} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm text-coffee-700">#{order.maDonHang.slice(-8)}</span>
                  <span className={`text-sm font-medium ${STATUS[order.trangThai]?.color}`}>
                    {STATUS[order.trangThai]?.label}
                  </span>
                </div>
                <div className="space-y-1 mb-2">
                  {order.chiTiet?.slice(0, 3).map((item, i) => (
                    <p key={i} className="text-sm text-coffee-700">{item.soLuong}× {item.mon?.tenMon}</p>
                  ))}
                  {order.chiTiet?.length > 3 && (
                    <p className="text-xs text-coffee-400">+{order.chiTiet.length - 3} món khác</p>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-coffee-500">
                  <span>{new Date(order.thoiGianTao).toLocaleString('vi-VN')}</span>
                  <span className="font-bold text-coffee-800">{formatVND(order.tongThanhToan || 0)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Profile */}
        {tab === 'profile' && (
          <div className="card p-5 space-y-4">
            <h2 className="font-display text-lg text-coffee-900">Thông tin cá nhân</h2>
            {[
              { label: 'Họ tên', key: 'hoTen', type: 'text' },
              { label: 'Địa chỉ', key: 'diaChi', type: 'text' },
              { label: 'Ngày sinh', key: 'ngaySinh', type: 'date' },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="block text-sm text-coffee-700 mb-1">{label}</label>
                <input className="input-field" type={type} value={profile[key]}
                  onChange={e => setProfile({...profile, [key]: e.target.value})} />
              </div>
            ))}
            <div>
              <label className="block text-sm text-coffee-700 mb-1">Giới tính</label>
              <select className="input-field" value={profile.gioiTinh} onChange={e => setProfile({...profile, gioiTinh: e.target.value})}>
                <option value="">Chọn</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <button onClick={handleSaveProfile} className="btn-primary w-full py-3">
              {saved ? '✓ Đã lưu!' : 'Lưu thay đổi'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
