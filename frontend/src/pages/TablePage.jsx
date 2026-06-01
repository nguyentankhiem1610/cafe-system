import { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import { tableAPI } from '../services/api';
import { connectSocket } from '../services/api';

const STATUS_CONFIG = {
  TRONG:        { label: 'Trống',          color: 'bg-green-100 border-green-400 text-green-800',  dot: 'bg-green-500' },
  DANG_PHUC_VU: { label: 'Đang phục vụ',  color: 'bg-blue-100 border-blue-400 text-blue-800',    dot: 'bg-blue-500' },
  CHO_DON:      { label: 'Chờ dọn',        color: 'bg-amber-100 border-amber-400 text-amber-800', dot: 'bg-amber-500' },
};

export default function TablePage() {
  const [tables, setTables] = useState([]);
  const [modal, setModal] = useState(null); // { mode: 'add'|'edit', table?: {} }
  const [form, setForm] = useState({ soBan: '', trangThai: 'TRONG' });

  const fetchTables = async () => {
    const res = await tableAPI.list();
    setTables(res.data);
  };

  useEffect(() => {
    fetchTables();
    const socket = connectSocket([]);
    socket.on('table:updated', (updated) => {
      setTables(prev => prev.map(t => t.maBan === updated.maBan ? updated : t));
    });
    return () => socket.off('table:updated');
  }, []);

  const openAdd = () => { setForm({ soBan: '', trangThai: 'TRONG' }); setModal({ mode: 'add' }); };
  const openEdit = (t) => { setForm({ soBan: t.soBan, trangThai: t.trangThai }); setModal({ mode: 'edit', table: t }); };

  const handleSave = async () => {
    if (!form.soBan.trim()) return;
    if (modal.mode === 'add') await tableAPI.create(form);
    else await tableAPI.update(modal.table.maBan, form);
    setModal(null);
    fetchTables();
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa bàn này?')) return;
    await tableAPI.delete(id);
    fetchTables();
  };

  const counts = {
    TRONG: tables.filter(t => t.trangThai === 'TRONG').length,
    DANG_PHUC_VU: tables.filter(t => t.trangThai === 'DANG_PHUC_VU').length,
    CHO_DON: tables.filter(t => t.trangThai === 'CHO_DON').length,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-cream-100">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-cream-300 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl text-coffee-900">Quản lý bàn</h1>
            <p className="text-coffee-500 text-sm">{tables.length} bàn · Cập nhật realtime</p>
          </div>
          <button onClick={openAdd} className="btn-primary">+ Thêm bàn</button>
        </div>

        {/* Summary */}
        <div className="px-6 py-4 grid grid-cols-3 gap-4">
          {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
            <div key={status} className={`card border-2 ${cfg.color} p-4 text-center`}>
              <p className="text-3xl font-display font-bold">{counts[status]}</p>
              <p className="text-sm font-medium mt-1">{cfg.label}</p>
            </div>
          ))}
        </div>

        {/* Table grid */}
        <div className="px-6 pb-6 grid grid-cols-4 md:grid-cols-6 xl:grid-cols-8 gap-4">
          {tables.map(table => {
            const cfg = STATUS_CONFIG[table.trangThai] || STATUS_CONFIG.TRONG;
            return (
              <div key={table.maBan}
                className={`aspect-square rounded-xl border-2 ${cfg.color} flex flex-col items-center justify-center gap-1 cursor-pointer hover:shadow-md transition-all relative group`}
                onClick={() => openEdit(table)}
              >
                <span className="text-2xl">🪑</span>
                <span className="font-bold text-lg">{table.soBan}</span>
                <span className="text-xs text-center leading-tight px-1">{cfg.label}</span>
                <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${cfg.dot} animate-pulse`} />
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(table.maBan); }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 w-80 shadow-2xl">
            <h3 className="font-display text-lg text-coffee-900 mb-4">
              {modal.mode === 'add' ? 'Thêm bàn mới' : `Sửa bàn ${modal.table?.soBan}`}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-coffee-700 mb-1">Số bàn</label>
                <input className="input-field" value={form.soBan} onChange={e => setForm({...form, soBan: e.target.value})} placeholder="VD: A1, B2, VIP1" />
              </div>
              <div>
                <label className="block text-sm text-coffee-700 mb-1">Trạng thái</label>
                <select className="input-field" value={form.trangThai} onChange={e => setForm({...form, trangThai: e.target.value})}>
                  <option value="TRONG">Trống</option>
                  <option value="DANG_PHUC_VU">Đang phục vụ</option>
                  <option value="CHO_DON">Chờ dọn</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(null)} className="btn-secondary flex-1">Hủy</button>
              <button onClick={handleSave} className="btn-primary flex-1">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
