import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cartAPI, orderAPI, paymentAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";

const formatVND = (n) => Number(n).toLocaleString("vi-VN") + "đ";

const getSessionId = () => {
  let s = localStorage.getItem("sessionId");
  if (!s) {
    s = `sess_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem("sessionId", s);
  }
  return s;
};

export default function CartPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [guest, setGuest] = useState({ hoTen: "", soDienThoai: "" });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [tienKhachDua, setTienKhachDua] = useState("");

  const sessionId = getSessionId();

  const load = async () => {
    try {
      const res = await cartAPI.get({ sessionId });
      setCart(res.data);
    } catch (err) {
      setCart(null);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateQty = async (item, qty) => {
    if (qty <= 0) return remove(item.maChiTietGio);
    await cartAPI.addItem({ maMon: item.maMon, soLuong: qty, sessionId });
    await load();
  };

  const remove = async (id) => {
    await cartAPI.removeItem(id);
    await load();
  };

  const checkout = async () => {
    if (!cart || !cart.chiTietGio || cart.chiTietGio.length === 0) return;
    setLoading(true);
    const items = cart.chiTietGio.map((c) => ({
      maMon: c.maMon,
      soLuong: c.soLuong,
    }));
    const payload = {
      items,
      loaiDonHang: "MANG_VE",
      thongTinGuest: JSON.stringify({
        hoTen: guest.hoTen || "Khách vãng lai",
        soDienThoai: guest.soDienThoai || "",
        sessionId,
      }),
    };
    try {
      const orderRes = await orderAPI.create(payload);
      const maDonHang = orderRes.data.maDonHang || orderRes.data.maDonHang;

      // create payment
      const payRes = await paymentAPI.create({
        maDonHang,
        phuongThuc: paymentMethod,
        tienKhachDua: tienKhachDua ? Number(tienKhachDua) : undefined,
      });

      // handle VNPAY redirect
      if (payRes.data?.paymentUrl) {
        window.location.href = payRes.data.paymentUrl;
        return;
      }

      // clear cart
      await cartAPI.clear({ sessionId });
      navigate("/account");
      alert(`Tạo đơn thành công: ${maDonHang}`);
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi tạo đơn");
    } finally {
      setLoading(false);
    }
  };

  const clear = async () => {
    await cartAPI.clear({ sessionId });
    await load();
  };

  const total = (cart?.chiTietGio || []).reduce(
    (s, c) => s + Number(c.mon?.giaBan || 0) * c.soLuong,
    0,
  );

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-coffee-900 text-cream-100 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="text-cream-300">
          ← Quay về menu
        </button>
        <h1 className="font-display text-lg font-bold">Giỏ hàng</h1>
        <div />
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {(cart?.chiTietGio || []).length === 0 ? (
          <div className="text-center py-12 text-coffee-400">
            <p className="text-4xl mb-3">🧺</p>
            <p>Giỏ hàng trống</p>
            <button onClick={() => navigate("/")} className="mt-4 btn-primary">
              Xem thực đơn
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.chiTietGio.map((item) => (
              <div
                key={item.maChiTietGio}
                className="card p-4 flex items-center gap-4"
              >
                <div className="w-16 h-16 bg-cream-100 rounded overflow-hidden flex items-center justify-center">
                  {item.mon?.hinhAnh?.[0] ? (
                    <img
                      src={item.mon.hinhAnh[0].urlAnh}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    "☕"
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-coffee-900">
                        {item.mon?.tenMon}
                      </p>
                      <p className="text-xs text-coffee-500">
                        {formatVND(item.mon?.giaBan || 0)}
                      </p>
                    </div>
                    <button
                      onClick={() => remove(item.maChiTietGio)}
                      className="text-sm text-red-500"
                    >
                      Xóa
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      onClick={() => updateQty(item, item.soLuong - 1)}
                      className="px-3 py-1 bg-white border rounded"
                    >
                      −
                    </button>
                    <div className="px-3">{item.soLuong}</div>
                    <button
                      onClick={() => updateQty(item, item.soLuong + 1)}
                      className="px-3 py-1 bg-white border rounded"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="card p-4">
              <h3 className="font-medium mb-2">Thông tin khách</h3>
              <div className="grid grid-cols-1 gap-3">
                <input
                  className="input-field"
                  placeholder="Họ tên (tuỳ chọn)"
                  value={guest.hoTen}
                  onChange={(e) =>
                    setGuest({ ...guest, hoTen: e.target.value })
                  }
                />
                <input
                  className="input-field"
                  placeholder="Số điện thoại (tuỳ chọn)"
                  value={guest.soDienThoai}
                  onChange={(e) =>
                    setGuest({ ...guest, soDienThoai: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="card p-4">
              <h3 className="font-medium mb-2">Phương thức thanh toán</h3>
              <div className="flex flex-col space-y-2">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="pay"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                  />
                  <span>Tiền mặt khi nhận (COD)</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="pay"
                    value="TIEN_MAT"
                    checked={paymentMethod === "TIEN_MAT"}
                    onChange={() => setPaymentMethod("TIEN_MAT")}
                  />
                  <span>Thanh toán tại quầy (Tiền mặt)</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="pay"
                    value="VNPAY"
                    checked={paymentMethod === "VNPAY"}
                    onChange={() => setPaymentMethod("VNPAY")}
                  />
                  <span>VNPAY (thanh toán trực tuyến)</span>
                </label>

                {(paymentMethod === "TIEN_MAT" || paymentMethod === "COD") && (
                  <input
                    className="input-field"
                    placeholder="Tiền khách đưa (tuỳ chọn)"
                    value={tienKhachDua}
                    onChange={(e) => setTienKhachDua(e.target.value)}
                  />
                )}
              </div>
            </div>

            <div className="card p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-coffee-500">Tổng</p>
                <p className="font-bold text-lg">{formatVND(total)}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={checkout}
                  className="btn-primary px-6 py-3"
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : "Thanh toán"}
                </button>
                <button
                  onClick={clear}
                  className="px-4 py-2 bg-white border rounded"
                >
                  Xóa giỏ hàng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
