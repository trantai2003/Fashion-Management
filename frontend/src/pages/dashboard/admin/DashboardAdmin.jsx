import { useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboardService";
import { adminService } from "@/services/adminService";
import { Link } from "react-router-dom";

import {
    Users,
    ShoppingCart,
    DollarSign,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Mail,
    Phone,
    Eye,
    TrendingUp,
    AlertTriangle,
    Clock,
    ShieldAlert,
    BarChart2,
    Boxes,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

/* ══════════════════════════════════════════════════
   STYLES — Ivory / Gold Luxury (matches homepage & login)
══════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

:root {
  --gold:        #b8860b;
  --gold-rich:   #c9960c;
  --gold-light:  #e8b923;
  --gold-pale:   rgba(184,134,11,0.10);
  --gold-dim:    rgba(184,134,11,0.07);
  --ivory:       #faf8f3;
  --ivory-2:     #f5f2ea;
  --ivory-3:     #ede9de;
  --cream:       #f0ead8;
  --sand:        #e8dfc8;
  --text:        #1a1612;
  --text-2:      #3d3529;
  --text-dim:    #7a6e5f;
  --text-muted:  #a89f92;
  --border:      rgba(184,134,11,0.18);
  --border-soft: rgba(184,134,11,0.10);
  --shadow:      0 4px 24px rgba(100,80,30,0.10);
  --shadow-lg:   0 12px 48px rgba(100,80,30,0.15);
}

/* ── Dashboard root ── */
.dash-root {
  min-height: 100vh;
  background: linear-gradient(160deg, #faf8f3 0%, #f5f0e4 55%, #ede9de 100%);
  font-family: 'DM Sans', system-ui, sans-serif;
  color: var(--text);
  position: relative;
}

/* Animated grid bg */
.dash-grid-bg {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image:
    linear-gradient(var(--gold-dim) 1px, transparent 1px),
    linear-gradient(90deg, var(--gold-dim) 1px, transparent 1px);
  background-size: 56px 56px;
  animation: dashGridDrift 40s linear infinite;
}
@keyframes dashGridDrift { to { background-position: 56px 56px; } }

.dash-orb-1 {
  position: fixed; width: 600px; height: 600px; border-radius: 50%;
  background: rgba(184,134,11,0.07); filter: blur(100px);
  top: -200px; right: -150px; pointer-events: none; z-index: 0;
}
.dash-orb-2 {
  position: fixed; width: 400px; height: 400px; border-radius: 50%;
  background: rgba(201,150,12,0.05); filter: blur(90px);
  bottom: -100px; left: -80px; pointer-events: none; z-index: 0;
}

.dash-inner {
  position: relative; z-index: 1;
  max-width: 1400px; margin: 0 auto;
  padding: 32px 32px 48px;
  display: flex; flex-direction: column; gap: 28px;
}

/* ── Section label pill (same as homepage) ── */
.section-label {
  display: inline-flex; align-items: center; gap: 7px;
  font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.2em;
  color: var(--gold-rich); text-transform: uppercase;
  padding: 5px 14px;
  border: 1px solid var(--border);
  border-radius: 99px;
  background: var(--gold-pale);
}

/* ── Page header ── */
.dash-header {
  display: flex; align-items: flex-end; justify-content: space-between;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border-soft);
}
.dash-header-left { display: flex; flex-direction: column; gap: 10px; }
.dash-header-title {
  font-family: 'Playfair Display', serif;
  font-size: 36px; font-weight: 900; letter-spacing: -1px;
  color: var(--text); line-height: 1.05;
}
.dash-header-title span { color: var(--gold); }
.dash-header-subtitle {
  font-size: 14px; color: var(--text-muted);
  font-family: 'DM Sans', sans-serif; line-height: 1.6;
}
.dash-live-badge {
  display: flex; align-items: center; gap: 7px;
  background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.25);
  color: #16a34a; padding: 6px 14px; border-radius: 99px;
  font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.08em;
}
.dash-live-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #22c55e;
  animation: livePulse 2s ease-in-out infinite;
}
@keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }

/* ── Stat cards ── */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
@media (max-width: 1100px) { .stat-grid { grid-template-columns: repeat(2,1fr); } }
@media (max-width: 640px)  { .stat-grid { grid-template-columns: 1fr; } }

.stat-card {
  background: #fff;
  border: 1px solid var(--border-soft);
  border-radius: 20px;
  padding: 22px 24px;
  display: flex; flex-direction: column; gap: 14px;
  box-shadow: var(--shadow);
  position: relative; overflow: hidden;
  transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
}
.stat-card::before {
  content: ''; position: absolute; top: 0; left: 10%; right: 10%; height: 2px;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
  border-radius: 99px;
}
.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  border-color: var(--border);
}
.stat-card-top {
  display: flex; align-items: center; justify-content: space-between;
}
.stat-label {
  font-family: 'DM Mono', monospace; font-size: 10px;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--text-muted);
}
.stat-icon-wrap {
  width: 38px; height: 38px; border-radius: 11px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid;
}
.stat-value {
  font-family: 'Playfair Display', serif;
  font-size: 30px; font-weight: 800; letter-spacing: -0.5px;
  color: var(--text);
}
.stat-trend {
  font-family: 'DM Mono', monospace; font-size: 11px;
  display: flex; align-items: center; gap: 5px;
}

/* ── Main content grid ── */
.dash-main-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 20px;
}
@media (max-width: 1100px) { .dash-main-grid { grid-template-columns: 1fr; } }

/* ── Lux card ── */
.lux-card {
  background: #fff;
  border: 1px solid var(--border-soft);
  border-radius: 22px;
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: box-shadow 0.2s;
}
.lux-card:hover { box-shadow: var(--shadow-lg); }
.lux-card-header {
  padding: 22px 26px 18px;
  border-bottom: 1px solid var(--border-soft);
  display: flex; align-items: flex-start; justify-content: space-between;
  background: linear-gradient(180deg, rgba(184,134,11,0.03) 0%, transparent 100%);
  position: relative;
}
.lux-card-header::after {
  content: ''; position: absolute; top: 0; left: 15%; right: 15%; height: 2px;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
}
.lux-card-title {
  font-family: 'Playfair Display', serif;
  font-size: 18px; font-weight: 800; color: var(--text); letter-spacing: -0.3px;
}
.lux-card-sub {
  font-size: 12px; color: var(--text-muted); margin-top: 3px;
  font-family: 'DM Mono', monospace; letter-spacing: 0.05em;
}
.lux-card-body { padding: 22px 26px; }

/* ── Chart ── */
.chart-wrap {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 10px; height: 140px;
  padding: 16px;
  background: var(--ivory);
  border: 1px solid var(--border-soft);
  border-radius: 14px;
  margin-top: 4px;
}
.chart-col {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px;
}
.chart-tooltip-wrap { position: relative; width: 100%; }
.chart-bar-outer {
  width: 100%; display: flex; align-items: flex-end; justify-content: center;
}
.chart-bar {
  width: 100%; border-radius: 6px 6px 0 0;
  background: linear-gradient(180deg, var(--gold-light), var(--gold));
  transition: all 0.3s; cursor: pointer; min-height: 6px;
}
.chart-bar:hover { filter: brightness(1.15); }
.chart-tooltip {
  position: absolute; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%);
  background: var(--text); color: #fff;
  padding: 4px 8px; border-radius: 7px;
  font-family: 'DM Mono', monospace; font-size: 10px; white-space: nowrap;
  opacity: 0; pointer-events: none; transition: opacity 0.2s;
  z-index: 10;
}
.chart-tooltip-wrap:hover .chart-tooltip { opacity: 1; }
.chart-date {
  font-family: 'DM Mono', monospace; font-size: 10px;
  color: var(--text-muted); text-align: center;
}

/* ── Alert boxes ── */
.alert-list { display: flex; flex-direction: column; gap: 12px; }
.alert-box {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px 16px;
  border-radius: 14px; border: 1px solid;
  transition: transform 0.2s, box-shadow 0.2s;
}
.alert-box:hover { transform: translateX(3px); box-shadow: var(--shadow); }
.alert-icon-wrap {
  width: 32px; height: 32px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.alert-title {
  font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif;
}
.alert-subtitle {
  font-size: 12px; margin-top: 2px;
  font-family: 'DM Mono', monospace; letter-spacing: 0.05em;
}

/* ── User table ── */
.users-section { display: flex; flex-direction: column; gap: 16px; }
.users-header {
  display: flex; align-items: flex-end; justify-content: space-between;
  padding: 0 4px;
}
.users-title {
  font-family: 'Playfair Display', serif;
  font-size: 22px; font-weight: 800; color: var(--text); letter-spacing: -0.5px;
}
.users-subtitle {
  font-size: 13px; color: var(--text-muted); margin-top: 4px;
  font-family: 'DM Sans', sans-serif;
}
.users-link {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; font-weight: 600; color: var(--gold);
  text-decoration: none; font-family: 'DM Sans', sans-serif;
  transition: color 0.2s; padding: 8px 16px;
  border: 1px solid var(--border); border-radius: 10px;
  background: var(--gold-pale);
}
.users-link:hover { color: var(--gold-rich); border-color: var(--gold); background: rgba(184,134,11,0.14); }

/* Table */
.lux-table-wrap {
  background: #fff; border: 1px solid var(--border-soft);
  border-radius: 22px; overflow: hidden;
  box-shadow: var(--shadow);
}
.lux-table { width: 100%; border-collapse: collapse; }
.lux-th {
  padding: 14px 16px; text-align: left;
  font-family: 'DM Mono', monospace; font-size: 10px;
  letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--text-muted);
  background: var(--ivory-2);
  border-bottom: 1px solid var(--border-soft);
  white-space: nowrap;
}
.lux-th.center { text-align: center; }
.lux-tr { transition: background 0.15s; }
.lux-tr:not(:last-child) td { border-bottom: 1px solid rgba(184,134,11,0.06); }
.lux-tr:hover { background: rgba(184,134,11,0.035); }
.lux-td { padding: 14px 16px; vertical-align: middle; }
.lux-td.center { text-align: center; }

/* Username chip */
.td-username {
  font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 500;
  color: var(--gold-rich); letter-spacing: 0.03em;
}

/* Avatar */
.td-avatar {
  width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
  background: linear-gradient(135deg, var(--gold), var(--gold-light));
  display: flex; align-items: center; justify-content: center;
  font-family: 'Playfair Display', serif; font-size: 14px; font-weight: 800; color: #fff;
}

/* Role badge */
.td-role {
  display: inline-flex; align-items: center;
  font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.08em;
  color: var(--gold-rich); font-weight: 500;
  background: var(--gold-pale); border: 1px solid var(--border);
  padding: 3px 10px; border-radius: 99px;
}

/* Contact */
.td-contact { display: flex; flex-direction: column; gap: 4px; }
.td-contact-row {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: var(--text-dim);
  font-family: 'DM Sans', sans-serif;
}

/* Status badge */
.td-status-active {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 500;
  color: #16a34a; background: rgba(34,197,94,0.08);
  border: 1px solid rgba(34,197,94,0.25);
  padding: 4px 12px; border-radius: 99px;
}
.td-status-locked {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 500;
  color: #dc2626; background: rgba(220,38,38,0.06);
  border: 1px solid rgba(220,38,38,0.2);
  padding: 4px 12px; border-radius: 99px;
}
.td-status-dot {
  width: 6px; height: 6px; border-radius: 50%;
}

/* Date */
.td-date {
  font-family: 'DM Mono', monospace; font-size: 12px;
  color: var(--text-muted); white-space: nowrap;
}

/* Action button */
.td-action-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; border-radius: 10px;
  border: 1px solid var(--border); background: var(--ivory);
  color: var(--gold); cursor: pointer;
  transition: all 0.2s; text-decoration: none;
}
.td-action-btn:hover {
  background: var(--gold-pale); border-color: var(--gold);
  transform: scale(1.1); box-shadow: 0 4px 14px rgba(184,134,11,0.25);
}

/* ── Pagination ── */
.pagination-card {
  background: #fff; border: 1px solid var(--border-soft);
  border-radius: 18px; padding: 16px 22px;
  display: flex; flex-direction: column; gap: 0;
  box-shadow: var(--shadow);
}
.pagination-inner {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 14px;
}
.pagination-info {
  font-size: 13px; color: var(--text-dim); font-family: 'DM Sans', sans-serif;
}
.pagination-info strong { color: var(--text); font-weight: 600; }
.pagination-info .gold { color: var(--gold); font-weight: 700; }

/* Page size dropdown override */
.lux-dropdown-btn {
  height: 36px; padding: 0 14px;
  border: 1px solid var(--border) !important;
  border-radius: 10px !important;
  background: var(--ivory) !important;
  font-family: 'DM Mono', monospace !important; font-size: 12px !important;
  color: var(--text-2) !important;
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  min-width: 110px; cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.lux-dropdown-btn:hover { border-color: var(--gold) !important; background: var(--gold-pale) !important; }

/* Pagination buttons */
.pg-btn {
  height: 36px; min-width: 36px; padding: 0 12px;
  border-radius: 10px; border: 1px solid var(--border);
  background: var(--ivory);
  font-family: 'DM Mono', monospace; font-size: 12px; color: var(--text-2);
  cursor: pointer; transition: all 0.2s;
  display: inline-flex; align-items: center; justify-content: center; gap: 4px;
}
.pg-btn:hover:not(:disabled) { border-color: var(--gold); color: var(--gold); background: var(--gold-pale); }
.pg-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.pg-btn.active {
  background: linear-gradient(135deg, #b8860b, #e8b923) !important;
  border-color: transparent !important;
  color: #fff !important;
  box-shadow: 0 4px 14px rgba(184,134,11,0.35);
}
.pg-btns { display: flex; align-items: center; gap: 6px; }
`;

/* ══════════════════════════════════════════════════
   ROLE MAP
══════════════════════════════════════════════════ */
const ROLE_OPTIONS = [
    { value: "ALL", label: "Tất cả" },
    { value: "quan_tri_vien", label: "Quản trị viên" },
    { value: "quan_ly_kho", label: "Quản lý kho" },
    { value: "nhan_vien_kho", label: "Nhân viên kho" },
    { value: "nhan_vien_ban_hang", label: "Nhân viên bán hàng" },
    { value: "nhan_vien_mua_hang", label: "Nhân viên mua hàng" },
    { value: "khach_hang", label: "Khách hàng" },
];
const formatRole = (role) => ROLE_OPTIONS.find((r) => r.value === role)?.label || role;

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
export default function DashboardByAdmin() {
    const [data, setData] = useState(null);
    const [latestUsers, setLatestUsers] = useState([]);
    const [pagination, setPagination] = useState({
        pageNumber: 0,
        pageSize: 5,
        totalPages: 0,
        totalElements: 0,
    });

    const loadUsers = async (page = 0, size = pagination.pageSize) => {
        try {
            const res = await adminService.getUserListByAdmin({ page, size, sort: "ngayTao,desc" });
            const pageData = res.data.data;
            setLatestUsers(pageData.content);
            setPagination({
                pageNumber: pageData.number,
                pageSize: pageData.size,
                totalPages: pageData.totalPages,
                totalElements: pageData.totalElements,
            });
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        dashboardService.getDashboard().then((res) => setData(res.data.data));
        loadUsers();
    }, []);

    const handlePageChange = (page) => {
        if (page < 0 || page >= pagination.totalPages) return;
        loadUsers(page, pagination.pageSize);
    };

    const handlePageSizeChange = (size) => {
        loadUsers(0, size);
    };

    if (!data) return null;

    const maxRevenue = Math.max(...data.revenueLast7Days.map((i) => i.value), 1);

    return (
        <>
            <style>{STYLES}</style>
            <div className="dash-root">
                <div className="dash-grid-bg" />
                <div className="dash-orb-1" />
                <div className="dash-orb-2" />

                <div className="dash-inner">

                    {/* ── PAGE HEADER ── */}
                    <div className="dash-header">
                        <div className="dash-header-left">
                            <div className="section-label">
                                <BarChart2 size={11} />
                                Quản trị hệ thống
                            </div>
                            <h1 className="dash-header-title">
                                Tổng quan <span>Admin</span>
                            </h1>
                            <p className="dash-header-subtitle">
                                Theo dõi hiệu suất và hoạt động toàn bộ nền tảng FS WMS
                            </p>
                        </div>
                        <div className="dash-live-badge">
                            <span className="dash-live-dot" />
                            Dữ liệu thời gian thực
                        </div>
                    </div>

                    {/* ── STAT CARDS ── */}
                    <div className="stat-grid">
                        <StatCard
                            icon={<Users size={17} />}
                            iconColor="#2563eb"
                            iconBg="rgba(37,99,235,0.1)"
                            iconBorder="rgba(37,99,235,0.2)"
                            label="User mới hôm nay"
                            value={data.newUsersToday}
                            trend="+Hôm nay"
                            trendColor="#16a34a"
                        />
                        <StatCard
                            icon={<Users size={17} />}
                            iconColor="#b8860b"
                            iconBg="rgba(184,134,11,0.1)"
                            iconBorder="rgba(184,134,11,0.2)"
                            label="Tổng người dùng"
                            value={data.totalUsers}
                            trend="Toàn hệ thống"
                            trendColor="#a89f92"
                        />
                        <StatCard
                            icon={<DollarSign size={17} />}
                            iconColor="#16a34a"
                            iconBg="rgba(34,197,94,0.08)"
                            iconBorder="rgba(34,197,94,0.2)"
                            label="Doanh thu hôm nay"
                            value={`${data.revenueToday.toLocaleString()}₫`}
                            trend="Ngày hiện tại"
                            trendColor="#16a34a"
                        />
                        <StatCard
                            icon={<ShoppingCart size={17} />}
                            iconColor="#7c3aed"
                            iconBg="rgba(124,58,237,0.08)"
                            iconBorder="rgba(124,58,237,0.2)"
                            label="Đơn bán hôm nay"
                            value={data.totalOrdersToday}
                            trend="Đã xử lý"
                            trendColor="#7c3aed"
                        />
                    </div>

                    {/* ── CHART + ALERTS ── */}
                    <div className="dash-main-grid">
                        {/* Chart */}
                        <div className="lux-card">
                            <div className="lux-card-header">
                                <div>
                                    <p className="lux-card-title">Doanh thu 7 ngày</p>
                                    <p className="lux-card-sub">don_ban_hang.ngay_dat_hang · 7 ngày gần nhất</p>
                                </div>
                                <span className="section-label" style={{ marginBottom: 0 }}>
                                    <TrendingUp size={10} />
                                    Báo cáo
                                </span>
                            </div>
                            <div className="lux-card-body">
                                <div className="chart-wrap">
                                    {data.revenueLast7Days.map((item) => {
                                        const pct = Math.max((item.value / maxRevenue) * 100, 6);
                                        return (
                                            <div key={item.date} className="chart-col">
                                                <div className="chart-tooltip-wrap">
                                                    <div className="chart-tooltip">
                                                        {(item.value / 1000).toFixed(0)}k ₫
                                                    </div>
                                                    <div className="chart-bar-outer" style={{ height: 108 }}>
                                                        <div
                                                            className="chart-bar"
                                                            style={{ height: `${pct}%` }}
                                                            title={`${item.date}: ${item.value.toLocaleString()}₫`}
                                                        />
                                                    </div>
                                                </div>
                                                <span className="chart-date">{item.date.slice(5)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Alerts */}
                        <div className="lux-card">
                            <div className="lux-card-header">
                                <div>
                                    <p className="lux-card-title">Cảnh báo nhanh</p>
                                    <p className="lux-card-sub">Tổng hợp từ hệ thống</p>
                                </div>
                            </div>
                            <div className="lux-card-body">
                                <div className="alert-list">
                                    <AlertBox
                                        icon={<AlertTriangle size={15} />}
                                        title="Tồn kho thấp"
                                        subtitle={`${data.lowStockCount} cảnh báo`}
                                        variant="red"
                                    />
                                    <AlertBox
                                        icon={<Clock size={15} />}
                                        title="Đơn chờ duyệt"
                                        subtitle={`${data.pendingPurchaseOrders} mua · ${data.pendingSaleOrders} bán`}
                                        variant="gold"
                                    />
                                    <AlertBox
                                        icon={<ShieldAlert size={15} />}
                                        title="Tài khoản bị khóa"
                                        subtitle={`${data.bannedUsers} tài khoản`}
                                        variant="gray"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── USER TABLE ── */}
                    <div className="users-section">
                        <div className="users-header">
                            <div>
                                <h2 className="users-title">User mới tạo gần đây</h2>
                                <p className="users-subtitle">Danh sách người dùng vừa đăng ký tham gia hệ thống</p>
                            </div>
                            <Link to="/users" className="users-link">
                                Xem tất cả <ChevronRight size={14} />
                            </Link>
                        </div>

                        <div className="lux-table-wrap">
                            <div style={{ overflowX: 'auto' }}>
                                <table className="lux-table">
                                    <thead>
                                        <tr>
                                            <th className="lux-th">Username</th>
                                            <th className="lux-th">Họ tên</th>
                                            <th className="lux-th">Vai trò</th>
                                            <th className="lux-th">Liên hệ</th>
                                            <th className="lux-th center">Trạng thái</th>
                                            <th className="lux-th center">Ngày tạo</th>
                                            <th className="lux-th center">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {latestUsers.map((user) => (
                                            <tr key={user.id} className="lux-tr">
                                                <td className="lux-td">
                                                    <span className="td-username">{user.tenDangNhap}</span>
                                                </td>
                                                <td className="lux-td">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <div className="td-avatar">
                                                            {user.hoTen?.charAt(0) || 'U'}
                                                        </div>
                                                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', fontFamily: 'DM Sans, sans-serif' }}>
                                                            {user.hoTen}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="lux-td">
                                                    <span className="td-role">{formatRole(user.vaiTro)}</span>
                                                </td>
                                                <td className="lux-td">
                                                    <div className="td-contact">
                                                        {user.email && (
                                                            <div className="td-contact-row">
                                                                <Mail size={11} style={{ color: 'var(--text-muted)' }} />
                                                                {user.email}
                                                            </div>
                                                        )}
                                                        {user.soDienThoai && (
                                                            <div className="td-contact-row">
                                                                <Phone size={11} style={{ color: 'var(--text-muted)' }} />
                                                                {user.soDienThoai}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="lux-td center">
                                                    <LuxStatusBadge status={user.trangThai} />
                                                </td>
                                                <td className="lux-td center">
                                                    <span className="td-date">
                                                        {new Date(user.ngayTao).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </td>
                                                <td className="lux-td center">
                                                    <Link to={`/users/${user.id}`} className="td-action-btn" title="Xem chi tiết">
                                                        <Eye size={14} />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* PAGINATION */}
                        <div className="pagination-card">
                            <div className="pagination-inner">
                                {/* Page size */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                        Hiển thị
                                    </span>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="lux-dropdown-btn">
                                                {pagination.pageSize} dòng
                                                <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            className="bg-white border border-[rgba(184,134,11,0.15)] shadow-lg rounded-xl z-50 min-w-[110px]"
                                        >
                                            {[5, 10, 20, 50, 100].map((size) => (
                                                <DropdownMenuItem
                                                    key={size}
                                                    onClick={() => handlePageSizeChange(size)}
                                                    className="cursor-pointer font-mono text-xs text-[#7a6e5f] hover:text-[#b8860b] hover:bg-[rgba(184,134,11,0.06)] rounded-lg"
                                                >
                                                    {size} dòng
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Result info */}
                                <p className="pagination-info">
                                    Hiển thị{' '}
                                    <strong>{pagination.pageNumber * pagination.pageSize + 1}</strong>
                                    {' – '}
                                    <strong>
                                        {Math.min(
                                            (pagination.pageNumber + 1) * pagination.pageSize,
                                            pagination.totalElements
                                        )}
                                    </strong>
                                    {' trong tổng số '}
                                    <span className="gold">{pagination.totalElements}</span> kết quả
                                </p>

                                {/* Page buttons */}
                                <div className="pg-btns">
                                    <button
                                        className="pg-btn"
                                        onClick={() => handlePageChange(pagination.pageNumber - 1)}
                                        disabled={pagination.pageNumber === 0}
                                    >
                                        <ChevronLeft size={14} /> Trước
                                    </button>

                                    {[...Array(Math.min(5, pagination.totalPages))].map((_, idx) => {
                                        let pageNum;
                                        if (pagination.totalPages <= 5) {
                                            pageNum = idx;
                                        } else if (pagination.pageNumber < 3) {
                                            pageNum = idx;
                                        } else if (pagination.pageNumber > pagination.totalPages - 4) {
                                            pageNum = pagination.totalPages - 5 + idx;
                                        } else {
                                            pageNum = pagination.pageNumber - 2 + idx;
                                        }
                                        return (
                                            <button
                                                key={idx}
                                                className={`pg-btn${pagination.pageNumber === pageNum ? ' active' : ''}`}
                                                onClick={() => handlePageChange(pageNum)}
                                            >
                                                {pageNum + 1}
                                            </button>
                                        );
                                    })}

                                    <button
                                        className="pg-btn"
                                        onClick={() => handlePageChange(pagination.pageNumber + 1)}
                                        disabled={pagination.pageNumber >= pagination.totalPages - 1}
                                    >
                                        Sau <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}

/* ══════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════ */

function StatCard({ icon, iconColor, iconBg, iconBorder, label, value, trend, trendColor }) {
    return (
        <div className="stat-card">
            <div className="stat-card-top">
                <span className="stat-label">{label}</span>
                <div
                    className="stat-icon-wrap"
                    style={{ background: iconBg, borderColor: iconBorder, color: iconColor }}
                >
                    {icon}
                </div>
            </div>
            <p className="stat-value">{value}</p>
            <p className="stat-trend" style={{ color: trendColor }}>
                <TrendingUp size={11} />
                {trend}
            </p>
        </div>
    );
}

function AlertBox({ icon, title, subtitle, variant }) {
    const variantMap = {
        red: {
            bg: 'rgba(220,38,38,0.05)',
            border: 'rgba(220,38,38,0.2)',
            iconBg: 'rgba(220,38,38,0.08)',
            iconColor: '#dc2626',
            titleColor: '#991b1b',
            subColor: '#b91c1c',
        },
        gold: {
            bg: 'var(--gold-pale)',
            border: 'var(--border)',
            iconBg: 'rgba(184,134,11,0.12)',
            iconColor: 'var(--gold)',
            titleColor: 'var(--text-2)',
            subColor: 'var(--gold-rich)',
        },
        gray: {
            bg: 'rgba(100,80,30,0.04)',
            border: 'rgba(100,80,30,0.12)',
            iconBg: 'rgba(100,80,30,0.06)',
            iconColor: 'var(--text-muted)',
            titleColor: 'var(--text-2)',
            subColor: 'var(--text-muted)',
        },
    };
    const v = variantMap[variant];

    return (
        <div
            className="alert-box"
            style={{ background: v.bg, borderColor: v.border }}
        >
            <div
                className="alert-icon-wrap"
                style={{ background: v.iconBg, color: v.iconColor }}
            >
                {icon}
            </div>
            <div>
                <p className="alert-title" style={{ color: v.titleColor }}>{title}</p>
                <p className="alert-subtitle" style={{ color: v.subColor }}>{subtitle}</p>
            </div>
        </div>
    );
}

function LuxStatusBadge({ status }) {
    return status === 1 ? (
        <span className="td-status-active">
            <span className="td-status-dot" style={{ background: '#22c55e' }} />
            Hoạt động
        </span>
    ) : (
        <span className="td-status-locked">
            <span className="td-status-dot" style={{ background: '#ef4444' }} />
            Bị khóa
        </span>
    );
}