import { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import { inventoryAPI } from '../services/api';

export default function InventoryPage() {
  const [ingredients, setIngredients] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [tab, setTab] = useState('ingredients');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ tenNL: '', tonKho: '', donVi: 'g' });
  const [voucherForm, setVoucherForm] = useState({ loaiPhieu: 'NHAP', maNCC: '', items: [{ maNguyenLieu: '', soLuongThucTe: '', donGia: '' }] });

  const fetchData = async () => {
    const [ing, vou] = await Promise.all([inventoryAPI.getIngredients(), inventoryAPI.getVouchers()]);
    setIngredients(ing.data);
    setVouchers(vou.data);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveIngredient = async () => {
    if (modal?.ingredient) await inventoryAPI.updateIngredient(modal.ingredient.maNguyenLieu, form);
    else await inventoryAPI.createIngredient(form);
    setModal(null);
    fetchData();
  };

  const addVoucherItem = () => setVoucherForm(prev => ({ ...prev, items: [...prev.items, { maNguyenLieu: '', soLuongThucTe: '', donGia: '' }] }));

  const updateVoucherItem = (i, field, val) => {
    setVoucherForm(prev => {
      const items = [...prev.items];
      items[i] = { ...items[i], [field]: val };
      return { ...prev, items };
    });
  };

  const handleCreateVoucher = async () => {
    await inventoryAPI.createVoucher({
      ...voucherForm,
      items: voucherForm.items.map(i => ({ ...i, soLuongThucTe: Number(i.soLuongThucTe), donGia: Number(i.donGia) }))
    });
    setModal(null);
    fetchData();
  };

  const lowStock = ingredients.filter(i => i.tonKho <= 10);

  return (
    <div className="flex h-screen overflow-hidden bg-cream-100">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-cream-300 px-6 py-4">
          <h1 className="font-display text-2xl text-coffee-900">Quản lý kho nguyên liệu</h1>
        </div>

        {/* Low stock alert */}
        {lowStock.length > 0 && (
          <div className="mx-6 mt-4 bg-amber-50 border border-amber-300 rounded-xl p-4">
            <p className="font-medium text-amber-800 text-sm">⚠️ Cảnh báo tồn kho thấp ({lowStock.length} nguyên liệu)</p>
            <p className="text-amber-700 text-xs mt-1">{lowStock.map(i => `${i.tenNL} (${i.tonKho}${i.donVi})`).join(' · ')}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="px-6 pt-4 flex gap-3">
          {['ingredients', 'vouchers'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-coffee-600 text-white' : 'bg-white text-coffee-700 border border-cream-300 hover:bg-cream-100'}`}>
              {t === 'ingredients' ? '📦 Nguyên liệu' : '📄 Phiếu kho'}
            </button>
          ))}
          <div className="flex-1" />
          {tab === 'ingredients' && (
            <button onClick={() => { setForm({ tenNL: '', tonKho: '', donVi: 'g' }); setModal({ mode: 'add' }); }} className="btn-primary text-sm">
              + Thêm nguyên liệu
            </button>
          )}
          {tab === 'vouchers' && (
            <button onClick={() => setModal({ mode: 'voucher' })} className="btn-primary text-sm">
              + Tạo phiếu kho
            </button>
          )}
        </div>

        {/* Ingredients table */}
        {tab === 'ingredients' && (
          <div className="p-6">
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-cream-100 border-b border-cream-300">
                  <tr>
                    {['Nguyên liệu', 'Tồn kho', 'Đơn vị', 'Trạng thái', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-coffee-700 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map(ing => (
                    <tr key={ing.maNguyenLieu} className="border-b border-cream-100 hover:bg-cream-50">
                      <td className="px-4 py-3 font-medium text-coffee-900">{ing.tenNL}</td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${ing.tonKho <= 10 ? 'text-red-600' : ing.tonKho <= 30 ? 'text-amber-600' : 'text-green-600'}`}>
                          {ing.tonKho}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-coffee-600">{ing.donVi}</td>
                      <td className="px-4 py-3">
                        {ing.tonKho <= 10 ? <span className="badge-status-wait">⚠️ Thấp</span> :
                         ing.tonKho <= 30 ? <span className="badge-status-making">Vừa đủ</span> :
                         <span className="badge-status-done">Đủ hàng</span>}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => { setForm({ tenNL: ing.tenNL, tonKho: ing.tonKho, donVi: ing.donVi }); setModal({ mode: 'edit', ingredient: ing }); }}
                          className="text-coffee-500 hover:text-coffee-800 text-xs underline">Sửa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Vouchers list */}
        {tab === 'vouchers' && (
          <div className="p-6 space-y-3">
            {vouchers.map(v => (
              <div key={v.maPhieu} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      v.loaiPhieu === 'NHAP' ? 'bg-green-100 text-green-800' :
                      v.loaiPhieu === 'XUAT' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {v.loaiPhieu === 'NHAP' ? '📥 Nhập kho' : v.loaiPhieu === 'XUAT' ? '📤 Xuất kho' : '🗑️ Hủy hàng'}
                    </span>
                    <span className="font-medium text-coffee-900 text-sm">#{v.maPhieu.slice(-8)}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-coffee-900">{Number(v.tongGiaTri).toLocaleString('vi-VN')}đ</p>
                    <p className="text-xs text-coffee-500">{new Date(v.thoiGianLap).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
                <div className="text-xs text-coffee-500">
                  NV: {v.nhanVien?.nguoiDung?.hoTen} · {v.chiTiet?.length} mặt hàng
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit ingredient modal */}
      {modal?.mode !== 'voucher' && modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 w-96 shadow-2xl">
            <h3 className="font-display text-lg text-coffee-900 mb-4">
              {modal.mode === 'add' ? 'Thêm nguyên liệu' : 'Sửa nguyên liệu'}
            </h3>
            <div className="space-y-3">
              <div><label className="block text-sm text-coffee-700 mb-1">Tên nguyên liệu</label>
                <input className="input-field" value={form.tenNL} onChange={e => setForm({...form, tenNL: e.target.value})} /></div>
              <div><label className="block text-sm text-coffee-700 mb-1">Tồn kho</label>
                <input className="input-field" type="number" value={form.tonKho} onChange={e => setForm({...form, tonKho: e.target.value})} /></div>
              <div><label className="block text-sm text-coffee-700 mb-1">Đơn vị</label>
                <select className="input-field" value={form.donVi} onChange={e => setForm({...form, donVi: e.target.value})}>
                  {['g', 'kg', 'ml', 'l', 'gói', 'hộp', 'chai'].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(null)} className="btn-secondary flex-1">Hủy</button>
              <button onClick={handleSaveIngredient} className="btn-primary flex-1">Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* Create voucher modal */}
      {modal?.mode === 'voucher' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-lg text-coffee-900 mb-4">Tạo phiếu kho</h3>
            <div className="space-y-3 mb-4">
              <div><label className="block text-sm text-coffee-700 mb-1">Loại phiếu</label>
                <select className="input-field" value={voucherForm.loaiPhieu} onChange={e => setVoucherForm({...voucherForm, loaiPhieu: e.target.value})}>
                  <option value="NHAP">Nhập kho</option>
                  <option value="XUAT">Xuất kho</option>
                  <option value="HUY">Hủy hàng</option>
                </select>
              </div>
              <div><label className="block text-sm text-coffee-700 mb-1">Mã nhà cung cấp</label>
                <input className="input-field" value={voucherForm.maNCC} onChange={e => setVoucherForm({...voucherForm, maNCC: e.target.value})} /></div>
            </div>
            <p className="text-sm font-medium text-coffee-700 mb-2">Danh sách nguyên liệu</p>
            {voucherForm.items.map((item, i) => (
              <div key={i} className="grid grid-cols-3 gap-2 mb-2">
                <select className="input-field text-xs" value={item.maNguyenLieu} onChange={e => updateVoucherItem(i, 'maNguyenLieu', e.target.value)}>
                  <option value="">Chọn NL</option>
                  {ingredients.map(ing => <option key={ing.maNguyenLieu} value={ing.maNguyenLieu}>{ing.tenNL}</option>)}
                </select>
                <input className="input-field text-xs" type="number" placeholder="Số lượng" value={item.soLuongThucTe} onChange={e => updateVoucherItem(i, 'soLuongThucTe', e.target.value)} />
                <input className="input-field text-xs" type="number" placeholder="Đơn giá" value={item.donGia} onChange={e => updateVoucherItem(i, 'donGia', e.target.value)} />
              </div>
            ))}
            <button onClick={addVoucherItem} className="btn-secondary text-xs w-full mb-4">+ Thêm dòng</button>
            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="btn-secondary flex-1">Hủy</button>
              <button onClick={handleCreateVoucher} className="btn-primary flex-1">Tạo phiếu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
