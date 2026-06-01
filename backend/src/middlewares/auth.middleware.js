const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');

const JWT_SECRET = process.env.JWT_SECRET || 'cafe_secret_2024';

// ─── Verify JWT Token ──────────────────────────────────────
const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.nguoiDung.findUnique({
      where: { maNguoiDung: decoded.id },
      include: { nhanVien: { include: { vaiTro: true } } }
    });
    if (!user || user.isDeleted) {
      return res.status(401).json({ message: 'Tài khoản không tồn tại' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

// ─── Optional auth (for guest+member routes) ───────────────
const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();
  try {
    const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
    req.user = await prisma.nguoiDung.findUnique({ where: { maNguoiDung: decoded.id } });
  } catch (_) {}
  next();
};

// ─── RBAC: check role ──────────────────────────────────────
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Chưa đăng nhập' });
  const userRole = req.user.nhanVien?.vaiTro?.tenVaiTro;
  if (!userRole || !roles.includes(userRole)) {
    return res.status(403).json({ message: 'Không có quyền truy cập' });
  }
  next();
};

// ─── RBAC: check permission string ────────────────────────
const requirePermission = (permission) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Chưa đăng nhập' });
  const perms = req.user.nhanVien?.vaiTro?.danhSachQuyen || '';
  if (!perms.includes(permission)) {
    return res.status(403).json({ message: 'Không có quyền thực hiện' });
  }
  next();
};

// ─── Generate tokens ──────────────────────────────────────
const generateTokens = (userId) => {
  const access = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '8h' });
  const refresh = jwt.sign({ id: userId }, JWT_SECRET + '_refresh', { expiresIn: '30d' });
  return { access, refresh };
};

module.exports = { authenticate, optionalAuth, requireRole, requirePermission, generateTokens };
