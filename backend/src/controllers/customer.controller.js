const prisma = require("../prisma/client");
const { asyncHandler } = require("../middlewares/error.middleware");

// GET /api/customer/points
const getPoints = asyncHandler(async (req, res) => {
  const userId = req.user.maNguoiDung;
  const kh = await prisma.khachHang.findFirst({
    where: { maKhachHang: userId },
    include: { khachThanhVien: true },
  });
  const points = kh?.khachThanhVien?.diemThuong || 0;
  const hangThanhVien = kh?.khachThanhVien?.hangThanhVien || "Đồng";
  res.json({ points, hangThanhVien });
});

// GET /api/customer/leaderboard
const getLeaderboard = asyncHandler(async (req, res) => {
  const userId = req.user?.maNguoiDung;
  
  const allMembers = await prisma.khachThanhVien.findMany({
    include: { khachHang: { include: { nguoiDung: { select: { hoTen: true } } } } },
    orderBy: { diemThuong: "desc" },
  });

  const leaderboard = allMembers.map((m, index) => ({
    rank: index + 1,
    maKhachHang: m.maKhachHang,
    hoTen: m.khachHang?.nguoiDung?.hoTen || "Thành viên ẩn danh",
    diemThuong: m.diemThuong,
    hangThanhVien: m.hangThanhVien || "Đồng"
  }));

  const top10 = leaderboard.slice(0, 10);
  const myRank = leaderboard.find(m => m.maKhachHang === userId) || null;

  res.json({ top: top10, myRank });
});

// POST /api/customer/redeem — redeem points (simple decrement)
const redeemPoints = asyncHandler(async (req, res) => {
  const userId = req.user.maNguoiDung;
  const { points } = req.body;
  if (!points || points <= 0)
    return res.status(400).json({ message: "Số điểm không hợp lệ" });

  const kt = await prisma.khachThanhVien.findUnique({
    where: { maKhachHang: userId },
  });
  if (!kt)
    return res.status(404).json({ message: "Không phải khách thành viên" });
  if (kt.diemThuong < points)
    return res.status(400).json({ message: "Không đủ điểm" });

  const updated = await prisma.khachThanhVien.update({
    where: { maKhachHang: userId },
    data: { diemThuong: { decrement: points } },
  });
  res.json({ message: "Đổi điểm thành công", points: updated.diemThuong, hangThanhVien: updated.hangThanhVien });
});

module.exports = { getPoints, getLeaderboard, redeemPoints };
