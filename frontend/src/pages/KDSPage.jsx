import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/common/Sidebar';
import { kdsAPI } from '../services/api';
import { connectSocket } from '../services/api';

const STATUS = { CHO_XAC_NHAN: 'CHỜ PHA CHẾ', DANG_PHA_CHE: 'ĐANG PHA CHẾ', HOAN_THANH: 'HOÀN THÀNH' };
const STATUS_COLOR = {
  CHO_XAC_NHAN: 'border-amber-400 bg-amber-50',
  DANG_PHA_CHE: 'border-blue-400 bg-blue-50',
  HOAN_THANH: 'border-green-400 bg-green-50',
};
const HEADER_COLOR = {
  CHO_XAC_NHAN: 'bg-amber-400',
  DANG_PHA_CHE: 'bg-blue-500',
  HOAN_THANH: 'bg-green-500',
};

const formatTime = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (diff < 1) return 'Vừa xong';
  if (diff < 60) return `${diff} phút trước`;
  return `${Math.floor(diff/60)}h${diff%60}m`;
};

const OrderCard = ({ order, onAccept, onComplete }) => {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(order.thoiGianTao)) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [order.thoiGianTao]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const isUrgent = mins >= 10 && order.trangThai !== 'HOAN_THANH';

  return (
    <div className={`order-card-enter border-2 rounded-xl p-4 ${STATUS_COLOR[order.trangThai]} ${isUrgent ? 'animate-pulse' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="font-bold text-coffee-900 text-base">#{order.maDonHang.slice(-6)}</span>
          {order.ban && <span className="ml-2 text-xs bg-coffee-100 text-coffee-700 px-2 py-0.5 rounded-full font-medium">Bàn {order.ban.soBan}</span>}
          {order.soTheRung && <span className="ml-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">🔔 {order.soTheRung}</span>}
        </div>
        <div className={`text-sm font-mono font-bold ${isUrgent ? 'text-red-600' : 'text-coffee-600'}`}>
          ⏱ {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
        </div>
      </div>

      {/* Order type badge */}
      <div className="mb-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          order.loaiDonHang === 'GRAB' ? 'bg-green-100 text-green-800' :
          order.loaiDonHang === 'SHOPEE' ? 'bg-orange-100 text-orange-800' :
          'bg-gray-100 text-gray-700'
        }`}>
          {order.loaiDonHang === 'GRAB' ? '🟢 GrabFood' :
           order.loaiDonHang === 'SHOPEE' ? '🟠 ShopeeFood' :
           order.loaiDonHang === 'TAI_QUAN' ? '🪑 Tại quán' :
           order.loaiDonHang === 'MANG_VE' ? '🛍️ Mang về' : order.loaiDonHang}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-1 mb-3">
        {order.chiTiet?.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold text-coffee-800 border border-cream-300">
              {item.soLuong}
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-coffee-900">{item.mon?.tenMon}</p>
              {item.tuyChon?.length > 0 && (
                <p className="text-xs text-coffee-500">{item.tuyChon.map(t => t.tenTuyChon).join(', ')}</p>
              )}
              {item.ghiChu && <p className="text-xs text-amber-700 italic">⚠️ {item.ghiChu}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Note */}
      {order.ghiChu && (
        <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
          📝 {order.ghiChu}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {order.trangThai === 'CHO_XAC_NHAN' && (
          <button onClick={() => onAccept(order.maDonHang)}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 rounded-lg transition-all active:scale-95">
            ▶ Bắt đầu pha chế
          </button>
        )}
        {order.trangThai === 'DANG_PHA_CHE' && (
          <button onClick={() => onComplete(order.maDonHang)}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2 rounded-lg transition-all active:scale-95">
            ✓ Hoàn thành
          </button>
        )}
        {order.trangThai === 'HOAN_THANH' && (
          <div className="flex-1 text-center text-green-600 font-medium text-sm py-2">✅ Đã xong</div>
        )}
      </div>
    </div>
  );
};

export default function KDSPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await kdsAPI.getOrders();
      setOrders(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchOrders();

    // Socket.IO realtime
    const socket = connectSocket(['kds']);
    socket.on('order:new', (order) => {
      setOrders(prev => [order, ...prev]);
      setAlert({ msg: `Đơn mới: #${order.maDonHang?.slice(-6)}`, type: 'new' });
      setTimeout(() => setAlert(null), 4000);
    });
    socket.on('order:updated', (order) => {
      setOrders(prev => prev.map(o => o.maDonHang === order.maDonHang ? order : o));
    });
    socket.on('order:complete', (data) => {
      setOrders(prev => prev.filter(o => o.maDonHang !== data.maDonHang));
    });

    // Polling fallback every 30s
    const interval = setInterval(fetchOrders, 30000);
    return () => { socket.off('order:new'); socket.off('order:updated'); socket.off('order:complete'); clearInterval(interval); };
  }, [fetchOrders]);

  const handleAccept = async (id) => {
    await kdsAPI.accept(id);
    setOrders(prev => prev.map(o => o.maDonHang === id ? { ...o, trangThai: 'DANG_PHA_CHE' } : o));
  };

  const handleComplete = async (id) => {
    await kdsAPI.complete(id);
    setOrders(prev => prev.filter(o => o.maDonHang !== id));
    setAlert({ msg: 'Đã hoàn thành đơn — gọi thẻ rung!', type: 'done' });
    setTimeout(() => setAlert(null), 4000);
  };

  const cols = {
    CHO_XAC_NHAN: orders.filter(o => o.trangThai === 'CHO_XAC_NHAN'),
    DANG_PHA_CHE: orders.filter(o => o.trangThai === 'DANG_PHA_CHE'),
    HOAN_THANH: orders.filter(o => o.trangThai === 'HOAN_THANH'),
  };

  return (
    <div className="flex h-screen overflow-hidden bg-cream-100">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-coffee-900 text-cream-100 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👨‍🍳</span>
            <div>
              <h1 className="font-display text-xl font-bold">Kitchen Display System</h1>
              <p className="text-cream-400 text-xs">{orders.length} đơn đang xử lý</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-3 text-sm">
              {Object.entries(cols).map(([status, list]) => (
                <div key={status} className="text-center">
                  <span className="block font-bold text-xl text-cream-100">{list.length}</span>
                  <span className="text-cream-400 text-xs">{STATUS[status]?.split(' ')[0]}</span>
                </div>
              ))}
            </div>
            <button onClick={fetchOrders} className="btn-secondary text-sm">🔄 Refresh</button>
          </div>
        </div>

        {/* Alert toast */}
        {alert && (
          <div className={`mx-6 mt-3 px-4 py-3 rounded-lg text-sm font-medium ${
            alert.type === 'new' ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-green-100 text-green-800 border border-green-300'
          }`}>
            {alert.type === 'new' ? '🆕 ' : '✅ '}{alert.msg}
          </div>
        )}

        {/* KDS columns */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-coffee-400 text-lg">Đang tải đơn hàng...</p>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-3 gap-4 p-4 overflow-hidden">
            {Object.entries(cols).map(([status, list]) => (
              <div key={status} className="flex flex-col overflow-hidden rounded-xl border border-cream-300 bg-white">
                {/* Column header */}
                <div className={`${HEADER_COLOR[status]} text-white px-4 py-3 flex items-center justify-between shrink-0`}>
                  <h2 className="font-bold text-sm">{STATUS[status]}</h2>
                  <span className="bg-white/30 text-white text-xs font-bold px-2 py-0.5 rounded-full">{list.length}</span>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {list.length === 0 && (
                    <div className="text-center py-8 text-cream-400">
                      <p className="text-2xl mb-1">😴</p>
                      <p className="text-xs">Không có đơn</p>
                    </div>
                  )}
                  {list.map(order => (
                    <OrderCard
                      key={order.maDonHang}
                      order={order}
                      onAccept={handleAccept}
                      onComplete={handleComplete}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
