import { useState, useEffect } from "react";
import Sidebar from "../components/common/Sidebar";
import { orderAPI } from "../services/api";

const STATUS_LABEL = {
  CHO_XAC_NHAN: { label: "Chờ xác nhận", cls: "badge-status-wait" },
  DANG_PHA_CHE: { label: "Đang pha chế", cls: "badge-status-making" },
  HOAN_THANH: { label: "Hoàn thành", cls: "badge-status-done" },
  HUY: { label: "Đã hủy", cls: "badge-status-cancelled" },
};

const ORDER_TYPE = {
  TAI_QUAN: "🪑 Tại quán",
  MANG_VE: "🛍️ Mang về",
  ONLINE: "📱 Online",
  GRAB: "🟢 GrabFood",
  SHOPEE: "🟠 ShopeeFood",
};

const CUSTOMER_TYPE = {
  MEMBER: "Thành viên",
  WALK_IN: "Vãng lai",
};

const formatVND = (n) => Number(n).toLocaleString("vi-VN") + "đ";

const getCustomerInfo = (order) => {
  const customer = order.khachHang;
  if (customer?.khachThanhVien) {
    return {
      type: CUSTOMER_TYPE.MEMBER,
      name: customer.hoTen || "",
    };
  }

  return {
    type: CUSTOMER_TYPE.WALK_IN,
    name: "",
  };
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState({ trangThai: "", date: "" });
  const [selected, setSelected] = useState(null);

  const fetchOrders = async () => {
    const res = await orderAPI.list({ ...filter, page, limit: 15 });
    setOrders(res.data.orders);
    setTotal(res.data.total);
  };

  useEffect(() => {
    fetchOrders();
  }, [page, filter]);

  const handleCancel = async (id) => {
    if (!confirm("Hủy đơn hàng này?")) return;
    await orderAPI.updateStatus(id, "HUY");
    fetchOrders();
  };

  const totalPages = Math.ceil(total / 15);

  return (
    <div className="flex h-screen overflow-hidden bg-cream-100">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-cream-300 px-6 py-4">
          <h1 className="font-display text-2xl text-coffee-900">
            Danh sách đơn hàng
          </h1>
          <p className="text-coffee-500 text-sm">{total} đơn hàng</p>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 flex gap-3 flex-wrap">
          <select
            className="input-field w-40"
            value={filter.trangThai}
            onChange={(e) =>
              setFilter({ ...filter, trangThai: e.target.value })
            }
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
          <input
            className="input-field w-40"
            type="date"
            value={filter.date}
            onChange={(e) => setFilter({ ...filter, date: e.target.value })}
          />
          <button
            onClick={() => setFilter({ trangThai: "", date: "" })}
            className="btn-secondary text-sm"
          >
            Xóa lọc
          </button>
        </div>

        {/* Table */}
        <div className="px-6 pb-6">
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream-100 border-b border-cream-300">
                <tr>
                  {[
                    "Mã đơn",
                    "Thời gian",
                    "Loại khách hàng",
                    "Tên khách hàng",
                    "Loại",
                    "Món",
                    "Tổng",
                    "Trạng thái",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-coffee-700 font-medium"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const st = STATUS_LABEL[order.trangThai] || {
                    label: order.trangThai,
                    cls: "",
                  };
                  const customerInfo = getCustomerInfo(order);
                  return (
                    <tr
                      key={order.maDonHang}
                      className="border-b border-cream-100 hover:bg-cream-50 cursor-pointer"
                      onClick={() => setSelected(order)}
                    >
                      <td className="px-4 py-3 font-mono text-coffee-700 font-medium">
                        #{order.maDonHang.slice(-8)}
                      </td>
                      <td className="px-4 py-3 text-coffee-500 text-xs">
                        {new Date(order.thoiGianTao).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span
                          className={
                            customerInfo.type === CUSTOMER_TYPE.MEMBER
                              ? "badge-status-done"
                              : "badge-status-wait"
                          }
                        >
                          {customerInfo.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-coffee-700 text-sm">
                        {customerInfo.name}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {ORDER_TYPE[order.loaiDonHang] || order.loaiDonHang}
                      </td>
                      <td className="px-4 py-3 text-coffee-600">
                        {order.chiTiet?.length || 0} món
                      </td>
                      <td className="px-4 py-3 font-bold text-coffee-900">
                        {formatVND(order.tongThanhToan || 0)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={st.cls}>{st.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        {!["HOAN_THANH", "HUY"].includes(order.trangThai) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancel(order.maDonHang);
                            }}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            Hủy
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {orders.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center py-10 text-coffee-400"
                    >
                      Không có đơn hàng
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary text-sm px-3 py-1 disabled:opacity-40"
              >
                ‹
              </button>
              {Array.from(
                { length: Math.min(5, totalPages) },
                (_, i) => i + 1,
              ).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`text-sm px-3 py-1 rounded-lg ${page === p ? "bg-coffee-600 text-white" : "btn-secondary"}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary text-sm px-3 py-1 disabled:opacity-40"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-cream-200 flex justify-between items-center">
              <h3 className="font-display text-lg text-coffee-900">
                Chi tiết đơn #{selected.maDonHang.slice(-8)}
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="text-coffee-400 hover:text-coffee-700 text-xl"
              >
                ×
              </button>
            </div>
            <div className="p-5 space-y-4">
              {(() => {
                const customerInfo = getCustomerInfo(selected);
                return (
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-coffee-500">Loại khách hàng:</span>{" "}
                      <strong>{customerInfo.type}</strong>
                    </div>
                    <div>
                      <span className="text-coffee-500">Tên khách hàng:</span>{" "}
                      <strong>{customerInfo.name}</strong>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-coffee-500">Loại:</span>{" "}
                  <strong>{ORDER_TYPE[selected.loaiDonHang]}</strong>
                </div>
                <div>
                  <span className="text-coffee-500">Bàn:</span>{" "}
                  <strong>{selected.ban?.soBan || "—"}</strong>
                </div>
                <div>
                  <span className="text-coffee-500">Trạng thái:</span>{" "}
                  <span className={STATUS_LABEL[selected.trangThai]?.cls}>
                    {STATUS_LABEL[selected.trangThai]?.label}
                  </span>
                </div>
                <div>
                  <span className="text-coffee-500">Thanh toán:</span>{" "}
                  <strong>{selected.thanhToan?.phuongThuc || "—"}</strong>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-coffee-700 mb-2">
                  Danh sách món
                </p>
                <div className="space-y-2">
                  {selected.chiTiet?.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-coffee-800">
                        {item.soLuong}× {item.mon?.tenMon}
                      </span>
                      <span className="font-medium">
                        {formatVND(item.donGiaThoiDiemBan * item.soLuong)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-cream-200 pt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-coffee-500">Tạm tính</span>
                  <span>{formatVND(selected.tongTien || 0)}</span>
                </div>
                {selected.tienGiamGia > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá</span>
                    <span>-{formatVND(selected.tienGiamGia)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base">
                  <span>Tổng thanh toán</span>
                  <span>{formatVND(selected.tongThanhToan || 0)}</span>
                </div>
              </div>

              {selected.ghiChu && (
                <p className="text-sm text-amber-700 bg-amber-50 p-2 rounded">
                  📝 {selected.ghiChu}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
