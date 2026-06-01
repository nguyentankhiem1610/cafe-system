import { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import { staffAPI } from '../services/api';

const ROLES = ['Quản lý', 'Thu ngân', 'Pha chế'];

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [tab, setTab] = useState('staff');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ hoTen: '', email: '', soDienThoai: '', matKhau: '', maVaiTro: '' });

  useEffect(() => {
    staffAPI.list().then(r => setStaff(r.data));
    staffAPI.getShifts().then(r => setShifts(r.data));
  }, []);

  const handleCreate = async () => {
    await staffAPI.create(form);
    setModal(false);
    staffAPI.list().then(r => setStaff(r.data));
  };

  const formatShiftTime = (t) => t ? new Date(t).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—';
  const calcHours = (start, end) => {
    if (!end) return 'Đang làm';
    const diff = (new Date(end) - new Date(start)) / 3600000;
    return `${diff.toFixed(1)}h`;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-cream-100">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-cream-300 px-6 py-4 flex items-center justify-between">
          <h1 className="font-display text-2xl text-coffee-900">Quản lý nhân sự</h1>
          {tab === 'staff' && <button onClick={() => setModal(true)} className="btn-primary">+ Thêm nhân viên</button>}
        </div>

        <div className="px-6 pt-4 flex gap-3">
          {['staff', 'shifts'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-coffee-600 text-white' : 'bg-white text-coffee-700 border border-cream-300 hover:bg-cream-100'}`}>
              {t === 'staff' ? '👥 Nhân viên' : '⏰ Ca làm việc'}
            </button>
          ))}
        </div>

        {tab === 'staff' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {staff.map(nv => (
                <div key={nv.maNhanVien} className="card p-4 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-coffee-100 flex items-center justify-center text-xl font-bold text-coffee-700 shrink-0">
                    {nv.nguoiDung?.hoTen?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-coffee-900">{nv.nguoiDung?.hoTen}</p>
                    <p className="text-sm text-coffee-500">{nv.nguoiDung?.email}</p>
                    <p className="text-sm text-coffee-500">{nv.nguoiDung?.soDienThoai}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        nv.vaiTro?.tenVaiTro === 'Quản lý' ? 'bg-purple-100 text-purple-700' :
                        nv.vaiTro?.tenVaiTro === 'Thu ngân' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {nv.vaiTro?.tenVaiTro}
                      </span>
                      <span className="text-xs text-coffee-400">
                        Từ {new Date(nv.hireDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'shifts' && (
          <div className="p-6">
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-cream-100 border-b border-cream-300">
                  <tr>
                    {['Nhân viên', 'Ca', 'Vào ca', 'Ra ca', 'Số giờ', 'Ngày'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-coffee-700 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shifts.map(s => (
                    <tr key={s.maCa} className="border-b border-cream-100 hover:bg-cream-50">
                      <td className="px-4 py-3 font-medium text-coffee-900">{s.nhanVien?.nguoiDung?.hoTen}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          s.loaiCa === 'SANG' ? 'bg-amber-100 text-amber-700' :
                          s.loaiCa === 'CHIEU' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>{s.loaiCa}</span>
                      </td>
                      <td className="px-4 py-3 text-coffee-600">{formatShiftTime(s.thoiGianVaoCa)}</td>
                      <td className="px-4 py-3 text-coffee-600">{formatShiftTime(s.thoiGianRaCa)}</td>
                      <td className="px-4 py-3 font-medium">{calcHours(s.thoiGianVaoCa, s.thoiGianRaCa)}</td>
                      <td className="px-4 py-3 text-coffee-500 text-xs">{new Date(s.thoiGianVaoCa).toLocaleDateString('vi-VN')}</td>
                    </tr>
                  ))}
                  {shifts.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-8 text-coffee-400">Không có dữ liệu</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 w-96 shadow-2xl">
            <h3 className="font-display text-lg text-coffee-900 mb-4">Thêm nhân viên</h3>
            <div className="space-y-3">
              {[
                { label: 'Họ tên', key: 'hoTen', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
                { label: 'Số điện thoại', key: 'soDienThoai', type: 'tel' },
                { label: 'Mật khẩu', key: 'matKhau', type: 'password' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-sm text-coffee-700 mb-1">{label}</label>
                  <input className="input-field" type={type} value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} />
                </div>
              ))}
              <div>
                <label className="block text-sm text-coffee-700 mb-1">Vai trò</label>
                <select className="input-field" value={form.maVaiTro} onChange={e => setForm({...form, maVaiTro: e.target.value})}>
                  <option value="">Chọn vai trò</option>
                  <option value="quan-ly">Quản lý</option>
                  <option value="thu-ngan">Thu ngân</option>
                  <option value="pha-che">Pha chế</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(false)} className="btn-secondary flex-1">Hủy</button>
              <button onClick={handleCreate} className="btn-primary flex-1">Tạo tài khoản</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
