import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { menuAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const formatVND = (n) => Number(n).toLocaleString('vi-VN') + 'đ';

export default function MenuPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    menuAPI.getCategories().then(r => setCategories(r.data));
  }, []);

  useEffect(() => {
    const params = { search, limit: 60 };
    if (activeCat !== 'all') params.category = activeCat;
    menuAPI.getItems(params).then(r => setItems(r.data.items));
  }, [activeCat, search]);

  const addToCart = (item, qty = 1) => {
    setCart(prev => {
      const ex = prev.find(c => c.maMon === item.maMon);
      if (ex) return prev.map(c => c.maMon === item.maMon ? { ...c, qty: c.qty + qty } : c);
      return [...prev, { ...item, qty }];
    });
    setDetail(null);
  };

  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const cartTotal = cart.reduce((s, c) => s + Number(c.giaBan) * c.qty, 0);

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Header */}
      <header className="bg-coffee-900 text-cream-100 sticky top-0 z-40 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">☕</span>
            <div>
              <h1 className="font-display text-lg font-bold">Cafe System</h1>
              <p className="text-cream-400 text-xs">Thực đơn</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              className="bg-coffee-800 border border-coffee-700 rounded-lg px-3 py-1.5 text-sm text-cream-100 placeholder-coffee-400 focus:outline-none focus:border-coffee-500 w-48"
              placeholder="🔍 Tìm món..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-cream-300 text-sm">{user.hoTen}</span>
                <button onClick={() => navigate('/account')} className="text-xs bg-coffee-700 px-3 py-1.5 rounded-lg hover:bg-coffee-600">Tài khoản</button>
              </div>
            ) : (
              <button onClick={() => navigate('/login')} className="text-sm bg-coffee-600 hover:bg-coffee-500 px-4 py-1.5 rounded-lg transition-all">Đăng nhập</button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-r from-coffee-900 via-coffee-800 to-coffee-700 text-cream-100 py-12 px-4 text-center">
        <h2 className="font-display text-4xl font-bold mb-2">Thực đơn của chúng tôi</h2>
        <p className="text-cream-300">Cà phê nguyên chất · Thức uống thủ công · Đặc sản mỗi ngày</p>
      </div>

      {/* Categories */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button onClick={() => setActiveCat('all')}
            className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all ${activeCat === 'all' ? 'bg-coffee-600 text-white' : 'bg-white text-coffee-700 border border-cream-300 hover:bg-cream-100'}`}>
            Tất cả
          </button>
          {categories.map(cat => (
            <button key={cat.maDanhMuc} onClick={() => setActiveCat(cat.maDanhMuc)}
              className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all ${activeCat === cat.maDanhMuc ? 'bg-coffee-600 text-white' : 'bg-white text-coffee-700 border border-cream-300 hover:bg-cream-100'}`}>
              {cat.tenDanhMuc}
              <span className="ml-1 text-xs opacity-60">({cat._count?.mon || 0})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="max-w-6xl mx-auto px-4 pb-32">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map(item => (
            <div key={item.maMon} className="card hover:shadow-md transition-all cursor-pointer group" onClick={() => setDetail(item)}>
              <div className="aspect-square overflow-hidden rounded-t-xl bg-cream-100">
                {item.hinhAnh?.[0] ? (
                  <img src={item.hinhAnh[0].urlAnh} alt={item.tenMon}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">☕</div>
                )}
              </div>
              <div className="p-3">
                {item.isNoiBat && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">⭐ Nổi bật</span>}
                <p className="font-medium text-coffee-900 mt-1 leading-tight line-clamp-2 text-sm">{item.tenMon}</p>
                {item.diemDanhGia > 0 && (
                  <p className="text-xs text-amber-500 mt-0.5">{'★'.repeat(Math.round(item.diemDanhGia))} {item.diemDanhGia.toFixed(1)}</p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-coffee-700">{formatVND(item.giaBan)}</span>
                  <button onClick={e => { e.stopPropagation(); addToCart(item); }}
                    className="w-7 h-7 bg-coffee-600 hover:bg-coffee-700 text-white rounded-full text-lg font-bold flex items-center justify-center transition-all active:scale-90">
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {items.length === 0 && (
          <div className="text-center py-16 text-coffee-400">
            <p className="text-5xl mb-3">🍵</p>
            <p>Không tìm thấy món nào</p>
          </div>
        )}
      </div>

      {/* Cart bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-40">
          <button
            className="w-full max-w-lg mx-auto flex items-center justify-between bg-coffee-800 hover:bg-coffee-900 text-cream-100 rounded-2xl px-5 py-4 shadow-2xl transition-all"
            onClick={() => navigate(user ? '/account' : '/login')}
          >
            <div className="flex items-center gap-3">
              <span className="bg-coffee-600 text-white text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center">{cartCount}</span>
              <span className="font-medium">Xem giỏ hàng</span>
            </div>
            <span className="font-bold">{formatVND(cartTotal)}</span>
          </button>
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md shadow-2xl animate-in slide-in-from-bottom">
            <div className="relative">
              <div className="aspect-video bg-cream-100 rounded-t-xl overflow-hidden">
                {detail.hinhAnh?.[0] ? (
                  <img src={detail.hinhAnh[0].urlAnh} alt={detail.tenMon} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">☕</div>
                )}
              </div>
              <button onClick={() => setDetail(null)} className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-coffee-700 hover:bg-white">×</button>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-display text-xl text-coffee-900 font-bold">{detail.tenMon}</h3>
                <span className="font-bold text-coffee-700 text-lg">{formatVND(detail.giaBan)}</span>
              </div>
              {detail.moTa && <p className="text-coffee-600 text-sm mb-4">{detail.moTa}</p>}
              {detail.danhMuc && <p className="text-xs text-coffee-400 mb-4">{detail.danhMuc.tenDanhMuc}</p>}
              {detail.diemDanhGia > 0 && (
                <p className="text-amber-500 text-sm mb-4">{'★'.repeat(Math.round(detail.diemDanhGia))} {detail.diemDanhGia.toFixed(1)} điểm</p>
              )}
              <button onClick={() => addToCart(detail)} className="btn-primary w-full py-3 text-base">
                + Thêm vào giỏ hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
