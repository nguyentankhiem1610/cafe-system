const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const prisma = require("../prisma/client");
const { generateTokens } = require("../middlewares/auth.middleware");
const { asyncHandler } = require("../middlewares/error.middleware");

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { hoTen, email, soDienThoai, matKhau } = req.body;

  const exists = await prisma.nguoiDung.findFirst({
    where: { OR: [{ email }, { soDienThoai }] },
  });
  if (exists)
    return res.status(400).json({ message: "Email hoặc SĐT đã tồn tại" });

  const hash = await bcrypt.hash(matKhau, 10);
  const user = await prisma.nguoiDung.create({
    data: {
      maNguoiDung: `KH_${uuidv4().substring(0, 8).toUpperCase()}`,
      hoTen,
      email,
      soDienThoai,
      matKhau: hash,
      khachHang: {
        create: {
          hoTen,
          soDienThoai,
          khachThanhVien: {
            create: { ngayDangKy: new Date() },
          },
        },
      },
    },
  });

  const { access, refresh } = generateTokens(user.maNguoiDung);
  res
    .status(201)
    .json({
      message: "Đăng ký thành công",
      token: access,
      refreshToken: refresh,
    });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, soDienThoai, matKhau } = req.body;
  const identifier = email || soDienThoai;

  const user = await prisma.nguoiDung.findFirst({
    where: {
      OR: [{ email: identifier }, { soDienThoai: identifier }],
      isDeleted: false,
    },
    include: { nhanVien: { include: { vaiTro: true } } },
  });

  if (!user || !user.matKhau)
    return res.status(401).json({ message: "Tài khoản không tồn tại" });
  const valid = await bcrypt.compare(matKhau, user.matKhau);
  if (!valid) return res.status(401).json({ message: "Mật khẩu không đúng" });

  const { access, refresh } = generateTokens(user.maNguoiDung);
  const { matKhau: _, ...safeUser } = user;
  res.json({ token: access, refreshToken: refresh, user: safeUser });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const { matKhau: _, ...safeUser } = req.user;
  res.json(safeUser);
});

// PUT /api/auth/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { hoTen, diaChi, ngaySinh, gioiTinh } = req.body;
  await prisma.nguoiDung.update({
    where: { maNguoiDung: req.user.maNguoiDung },
    data: {
      hoTen,
      diaChi,
      ngaySinh: ngaySinh ? new Date(ngaySinh) : undefined,
      gioiTinh,
    },
  });
  res.json({ message: "Cập nhật thành công" });
});

// POST /api/auth/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { matKhauCu, matKhauMoi } = req.body;
  const valid = await bcrypt.compare(matKhauCu, req.user.matKhau);
  if (!valid)
    return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
  const hash = await bcrypt.hash(matKhauMoi, 10);
  await prisma.nguoiDung.update({
    where: { maNguoiDung: req.user.maNguoiDung },
    data: { matKhau: hash },
  });
  res.json({ message: "Đổi mật khẩu thành công" });
});

module.exports = { register, login, getMe, updateProfile, changePassword };
