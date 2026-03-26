import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    ChevronLeft, ChevronRight, ChevronDown, Search, Calendar,
    Filter, Eye, RefreshCw, Warehouse, Clock, Loader2, CreditCard,
    ShoppingCart, Ship, FileText, DollarSign, PackagePlus, Plus,
} from 'lucide-react';
import apiClient from '@/services/apiClient';
import { getMineKhoList } from '@/services/khoService';

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLE = {
    QUAN_TRI_VIEN: "quan_tri_vien",
    QUAN_LY_KHO: "quan_ly_kho",
    NHAN_VIEN_KHO: "nhan_vien_kho",
    NHAN_VIEN_MUA_HANG: "nhan_vien_mua_hang",
};

const PO_STATUS = {
    3: { label: 'Đang vận chuyển', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
    5: { label: 'Đã thanh toán', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CreditCard },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseJwt(token) {
    try {
        const b64 = token.split('.')[1];
        return JSON.parse(atob(b64.replace(/-/g, '+').replace(/_/g, '/')));
    } catch { return null; }
}

function parseRoles(vaiTro) {
    if (!vaiTro) return [];
    return vaiTro.includes(' ') ? vaiTro.split(' ') : [vaiTro];
}

const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '—';

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function PurchaseOrderList() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    // Auth & Permission Data
    const [userRoles, setUserRoles] = useState([]);
    const [loadingInitial, setLoadingInitial] = useState(true);
    const [warehouses, setWarehouses] = useState([]);
    const [isRestrictedWarehouse, setIsRestrictedWarehouse] = useState(false);

    // Pagination
    const [pagination, setPagination] = useState({ pageNumber: 0, pageSize: 10, totalElements: 0, totalPages: 0 });

    // Filters
    const [filters, setFilters] = useState({ soDonMua: '', trangThai: '', khoId: '' });
    const [dateRange, setDateRange] = useState({ from: '', to: '' });

    // Quyền thao tác
    const canCreateReceipt = userRoles.includes(ROLE.QUAN_TRI_VIEN) || userRoles.includes(ROLE.QUAN_LY_KHO) || userRoles.includes(ROLE.NHAN_VIEN_KHO);

    // ── Load Auth & Warehouses ──
    useEffect(() => {
        const loadInitialData = async () => {
            setLoadingInitial(true);
            try {
                const token = localStorage.getItem('access_token');
                if (!token) return;
                const payload = parseJwt(token);
                if (!payload?.id) return;

                // 1. Lấy vai trò user
                const resUser = await apiClient.get(`/api/v1/nguoi-dung/get-by-id/${payload.id}`);
                const roles = parseRoles(resUser.data?.data?.vaiTro);
                setUserRoles(roles);

                // 2. Xác định giới hạn truy cập kho
                const isAdminOrBuyer = roles.includes('quan_tri_vien') || roles.includes('nhan_vien_mua_hang');
                const isKho = roles.includes('quan_ly_kho') || roles.includes('nhan_vien_kho');
                const restricted = !isAdminOrBuyer && isKho;
                setIsRestrictedWarehouse(restricted);

                // 3. Tải danh sách kho tương ứng
                let fetchedWarehouses = [];
                if (restricted) {
                    fetchedWarehouses = await getMineKhoList();
                } else {
                    const resKho = await apiClient.post('/api/v1/kho/filter', {
                        filters: [], sorts: [{ fieldName: 'tenKho', direction: 'ASC' }], page: 0, size: 100,
                    });
                    fetchedWarehouses = resKho.data?.data?.content || resKho.data?.content || [];
                }
                setWarehouses(fetchedWarehouses);

            } catch (error) {
                console.error('Lỗi khi tải thông tin phân quyền:', error);
            } finally {
                setLoadingInitial(false);
            }
        };

        loadInitialData();
    }, []);

    // ── Fetch list ──
    const fetchOrders = async (page = 0, size = 10) => {
        setLoading(true);
        try {
            const filterArray = [];

            // Chỉ lấy đơn hàng có trạng thái 3 hoặc 5
            if (filters.trangThai && filters.trangThai !== 'all') {
                filterArray.push({ fieldName: 'trangThai', operation: 'EQUALS', value: parseInt(filters.trangThai), logicType: 'AND' });
            } else {
                filterArray.push({ fieldName: 'trangThai', operation: 'IN', value: [3, 5], logicType: 'AND' });
            }

            // Filter tìm kiếm theo số đơn mua
            if (filters.soDonMua) {
                filterArray.push({ fieldName: 'soDonMua', operation: 'LIKE', value: filters.soDonMua, logicType: 'AND' });
            }

            // Filter kho
            if (filters.khoId && filters.khoId !== 'all') {
                filterArray.push({ fieldName: 'khoNhap.id', operation: 'EQUALS', value: parseInt(filters.khoId), logicType: 'AND' });
            } else if (isRestrictedWarehouse) {
                const myIds = warehouses.map(w => w.id);
                if (myIds.length > 0) {
                    filterArray.push({ fieldName: 'khoNhap.id', operation: 'IN', value: myIds, logicType: 'AND' });
                } else {
                    filterArray.push({ fieldName: 'khoNhap.id', operation: 'EQUALS', value: -1, logicType: 'AND' });
                }
            }

            // Filter ngày tạo
            if (dateRange.from) filterArray.push({ fieldName: 'ngayTao', operation: 'GREATER_THAN_OR_EQUAL', value: dateRange.from, logicType: 'AND' });
            if (dateRange.to) filterArray.push({ fieldName: 'ngayTao', operation: 'LESS_THAN_OR_EQUAL', value: dateRange.to + 'T23:59:59', logicType: 'AND' });

            const res = await apiClient.post('/api/v1/don-mua-hang/filter', {
                filters: filterArray,
                sorts: [{ fieldName: 'ngayCapNhat', direction: 'DESC' }],
                page, size,
            });

            const data = res?.data?.data || res?.data || {};
            setOrders(data.content || []);
            setPagination({
                pageNumber: data.pageable?.pageNumber || 0,
                pageSize: data.pageable?.pageSize || 10,
                totalElements: data.totalElements || 0,
                totalPages: data.totalPages || 0,
            });
        } catch {
            toast.error('Không thể tải danh sách đơn mua hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!loadingInitial) fetchOrders(pagination.pageNumber, pagination.pageSize);
    }, [filters, dateRange, pagination.pageNumber, pagination.pageSize, loadingInitial, isRestrictedWarehouse, warehouses.length]);

    // ── Handlers ──
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPagination(prev => ({ ...prev, pageNumber: 0 }));
    };

    const handleDateChange = (field, value) => {
        setDateRange(prev => ({ ...prev, [field]: value }));
        setPagination(prev => ({ ...prev, pageNumber: 0 }));
    };

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, pageNumber: 0 }));
        fetchOrders(0, pagination.pageSize);
    };

    const clearFilters = () => {
        setFilters({ soDonMua: '', trangThai: '', khoId: '' });
        setDateRange({ from: '', to: '' });
        setPagination(prev => ({ ...prev, pageNumber: 0 }));
    };

    const handlePageChange = (p) => {
        if (p >= 0 && p < pagination.totalPages) {
            setPagination(prev => ({ ...prev, pageNumber: p }));
        }
    };

    const handlePageSizeChange = (s) => {
        setPagination(prev => ({ ...prev, pageNumber: 0, pageSize: s }));
    };

    // ── Stats ──
    const totalValue = orders.reduce((sum, order) => sum + (Number(order.tongTien) || 0), 0);
    const countStatus3 = orders.filter(o => o.trangThai === 3).length;
    const countStatus5 = orders.filter(o => o.trangThai === 5).length;

    const stats = [
        { label: 'Tổng Đơn mua hàng', value: pagination.totalElements, icon: ShoppingCart, bg: 'from-blue-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
        { label: 'Tổng giá trị (trang này)', value: formatCurrency(totalValue), icon: DollarSign, bg: 'from-emerald-50', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
        { label: 'Chờ vận chuyển', value: countStatus3, icon: Clock, bg: 'from-amber-50', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
        { label: 'Đã thanh toán', value: countStatus5, icon: CreditCard, bg: 'from-teal-50', iconBg: 'bg-teal-100', iconColor: 'text-teal-600' },
    ];

    const getSelectedWarehouseName = () => {
        if (!filters.khoId || filters.khoId === 'all') return 'Tất cả kho';
        return warehouses.find(w => w.id === parseInt(filters.khoId))?.tenKho || 'Đang tải...';
    };

    return (
        <div className="lux-sync p-6 md:p-8 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 min-h-screen pb-24">

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(({ label, value, icon: Icon, bg, iconBg, iconColor }) => (
                    <Card key={label} className={`border-0 shadow-sm bg-gradient-to-br ${bg} to-white overflow-hidden rounded-2xl`}>
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
                                    <p className="text-xl font-black text-slate-900 mt-1.5">{value}</p>
                                </div>
                                <div className={`h-12 w-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                                    <Icon className={`h-6 w-6 ${iconColor}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-sm bg-white rounded-2xl">
                <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="flex items-center gap-2 text-[15px] font-bold text-slate-800">
                        <Filter className="h-4 w-4 text-blue-600" /> Bộ lọc tìm kiếm
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        
                        {/* Tìm theo Mã đơn */}
                        <div className="space-y-1.5">
                            <Label className="text-[13px] font-bold text-slate-700">Mã đơn mua hàng</Label>
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input placeholder="Nhập mã đơn (VD: PO...)" className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-200 text-[13px]"
                                    value={filters.soDonMua} onChange={e => handleFilterChange('soDonMua', e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleSearch()} />
                            </div>
                        </div>

                        {/* Kho nhập */}
                        <div className="space-y-1.5">
                            <Label className="text-[13px] font-bold text-slate-700">Kho nhập {warehouses.length > 0 && `(${warehouses.length})`}</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full h-10 justify-between font-medium bg-slate-50 border-slate-200 text-[13px] rounded-xl" disabled={loadingInitial || warehouses.length === 0}>
                                        <div className="flex items-center overflow-hidden gap-2">
                                            <Warehouse className="h-4 w-4 text-slate-400 shrink-0" />
                                            <span className="truncate">{getSelectedWarehouseName()}</span>
                                        </div>
                                        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[240px] bg-white shadow-lg border border-slate-100 z-50 rounded-xl max-h-[300px] overflow-y-auto">
                                    <DropdownMenuItem onClick={() => handleFilterChange('khoId', 'all')} className="font-bold text-[13px] py-2.5 hover:bg-slate-50 cursor-pointer">
                                        Tất cả kho
                                    </DropdownMenuItem>
                                    {warehouses.map(w => (
                                        <DropdownMenuItem key={w.id} onClick={() => handleFilterChange('khoId', w.id)} className="cursor-pointer py-2.5 hover:bg-slate-50">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-[13px] text-slate-800">{w.tenKho}</span>
                                                <span className="text-[11px] text-slate-500 font-mono mt-0.5">{w.maKho}</span>
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Trạng thái */}
                        <div className="space-y-1.5">
                            <Label className="text-[13px] font-bold text-slate-700">Trạng thái</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full h-10 justify-between font-medium bg-slate-50 border-slate-200 text-[13px] rounded-xl">
                                        <span className="truncate">
                                            {filters.trangThai && filters.trangThai !== 'all' ? PO_STATUS[filters.trangThai]?.label : 'Tất cả'}
                                        </span>
                                        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[200px] bg-white shadow-lg border border-slate-100 z-50 rounded-xl">
                                    <DropdownMenuItem onClick={() => handleFilterChange('trangThai', 'all')} className="font-bold text-[13px] py-2.5 hover:bg-slate-50 cursor-pointer">
                                        Tất cả (3 & 5)
                                    </DropdownMenuItem>
                                    {Object.entries(PO_STATUS).map(([key, cfg]) => {
                                        const Icon = cfg.icon;
                                        return (
                                            <DropdownMenuItem key={key} onClick={() => handleFilterChange('trangThai', key)} className="cursor-pointer py-2.5 hover:bg-slate-50">
                                                <div className="flex items-center gap-2 font-medium text-[13px]"><Icon className="h-4 w-4 text-slate-400" />{cfg.label}</div>
                                            </DropdownMenuItem>
                                        );
                                    })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Date Range */}
                        <div className="flex gap-3 items-end">
                            <div className="space-y-1.5 flex-1">
                                <Label className="text-[13px] font-bold text-slate-700">Từ ngày</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input type="date" className="pl-9 h-10 rounded-xl bg-slate-50 border-slate-200 text-[13px]" value={dateRange.from} onChange={e => handleDateChange('from', e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-1.5 flex-1">
                                <Label className="text-[13px] font-bold text-slate-700">Đến ngày</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input type="date" className="pl-9 h-10 rounded-xl bg-slate-50 border-slate-200 text-[13px]" value={dateRange.to} onChange={e => handleDateChange('to', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 justify-end mt-5">
                        <Button variant="outline" onClick={clearFilters} className="h-10 px-5 rounded-xl font-bold text-[13px] border-slate-200 text-slate-600 hover:bg-slate-100">
                            Đặt lại
                        </Button>
                        <Button onClick={handleSearch} className="h-10 px-5 rounded-xl font-bold text-[13px] bg-slate-900 hover:bg-white text-slate-900 shadow-md">
                            <Search className="h-4 w-4 mr-2" /> Lọc dữ liệu
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Actions Bar */}
            <div className="flex items-center justify-end gap-2">
                <Button variant="outline" onClick={() => fetchOrders(pagination.pageNumber, pagination.pageSize)} className="h-10 px-4 rounded-xl font-bold text-[13px] border-slate-200 text-slate-700 hover:bg-slate-100 gap-2">
                    <RefreshCw className="h-4 w-4" /> Làm mới
                </Button>
                <Button className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 gap-2 h-10 px-4 rounded-xl font-bold text-[13px] transition-all"
                    onClick={() => navigate('/purchase-orders/create')}>
                    <Plus className="h-4 w-4" /> Tạo đơn mua hàng
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-2xl bg-white shadow-sm border border-slate-200/80 overflow-hidden flex flex-col">
                <div className="overflow-x-auto custom-scrollbar min-h-[400px] max-h-[600px]">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 z-10">
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="h-12 w-14 px-4 text-center font-bold text-slate-500 text-[11px] uppercase tracking-widest">STT</th>
                                <th className="h-12 px-4 text-left font-bold text-slate-500 text-[11px] uppercase tracking-widest">Mã Đơn Mua</th>
                                <th className="h-12 px-4 text-left font-bold text-slate-500 text-[11px] uppercase tracking-widest">Nhà cung cấp</th>
                                <th className="h-12 px-4 text-left font-bold text-slate-500 text-[11px] uppercase tracking-widest">Ngày tạo</th>
                                <th className="h-12 px-4 text-left font-bold text-slate-500 text-[11px] uppercase tracking-widest">Trạng thái</th>
                                <th className="h-12 px-4 text-right font-bold text-slate-500 text-[11px] uppercase tracking-widest">Tổng tiền</th>
                                <th className="h-12 px-4 text-center font-bold text-slate-500 text-[11px] uppercase tracking-widest w-32">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading || loadingInitial ? (
                                <tr><td colSpan={7} className="py-24 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                        <span className="text-slate-500 text-[14px] font-medium">Đang tải dữ liệu...</span>
                                    </div>
                                </td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan={7} className="py-28 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                                            <ShoppingCart className="h-8 w-8 text-slate-300" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[15px] text-slate-700">Không tìm thấy đơn mua hàng nào</p>
                                            <p className="text-[13px] text-slate-500 mt-1">Vui lòng thử thay đổi bộ lọc</p>
                                        </div>
                                    </div>
                                </td></tr>
                            ) : orders.map((order, index) => {
                                const cfg = PO_STATUS[order.trangThai] || { label: 'Không rõ', color: 'bg-slate-50 text-slate-500 border-slate-200', icon: Clock };
                                const StatusIcon = cfg.icon;
                                const isStatus3 = order.trangThai === 3;
                                const isStatus5 = order.trangThai === 5;

                                return (
                                    <tr key={order.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/purchase-orders/${order.id}`)}>
                                        <td className="px-4 py-4 text-center text-slate-500 font-medium text-[13px]">
                                            {pagination.pageNumber * pagination.pageSize + index + 1}
                                        </td>
                                        
                                        <td className="px-4 py-4">
                                            <span className="font-bold text-[14px] text-blue-700 tracking-wide">{order.soDonMua}</span>
                                            {order.yeuCauMuaHang?.soYeuCauMuaHang && (
                                                <p className="text-[11px] text-slate-400 mt-0.5 font-mono">Từ: {order.yeuCauMuaHang.soYeuCauMuaHang}</p>
                                            )}
                                        </td>

                                        <td className="px-4 py-4">
                                            <p className="font-bold text-[13px] text-slate-800">{order.nhaCungCap?.tenNhaCungCap || '—'}</p>
                                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">{order.nhaCungCap?.maNhaCungCap}</p>
                                        </td>

                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-1.5 text-slate-600 text-[13px] font-medium">
                                                <Calendar className="h-3.5 w-3.5 text-slate-400" /> {formatDate(order.ngayTao)}
                                            </div>
                                        </td>

                                        <td className="px-4 py-4">
                                            <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-bold ${cfg.color}`}>
                                                <StatusIcon className="h-3.5 w-3.5" /> {cfg.label}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4 text-right">
                                            <span className={`font-black text-[15px] ${isStatus5 ? 'text-emerald-600' : 'text-slate-800'}`}>
                                                {formatCurrency(order.tongTien)}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4 text-center" onClick={e => e.stopPropagation()}>
                                            <TooltipProvider>
                                                <div className="flex items-center justify-center gap-1">
                                                    {/* Xem chi tiết */}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                                                                onClick={() => navigate(`/purchase-orders/${order.id}`)}>
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent><p>Xem chi tiết đơn</p></TooltipContent>
                                                    </Tooltip>

                                                    {/* Thanh toán (Chỉ trạng thái 3) */}
                                                    {isStatus3 && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-emerald-50 hover:text-emerald-600 text-slate-400"
                                                                    onClick={() => navigate(`/purchase-orders/${order.id}/payment`)}>
                                                                    <CreditCard className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent><p>Thanh toán đơn hàng</p></TooltipContent>
                                                        </Tooltip>
                                                    )}

                                                    {/* Nhập kho (Chỉ trạng thái 3 hoặc 5, và có quyền) */}
                                                    {canCreateReceipt && (isStatus3 || isStatus5) && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-amber-50 hover:text-amber-600 text-slate-400"
                                                                    onClick={() => navigate(`/goods-receipts/create?poId=${order.id}`)}>
                                                                    <PackagePlus className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent><p>Tạo phiếu nhập kho</p></TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            </TooltipProvider>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <Card className="border-0 shadow-sm bg-white rounded-2xl">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Label className="text-[13px] font-medium text-slate-500 whitespace-nowrap">Hiển thị:</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-[100px] justify-between font-bold border-slate-200 text-[13px] h-9 rounded-xl bg-white">
                                        {pagination.pageSize} dòng <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[100px] bg-white shadow-lg border border-slate-100 z-50 rounded-xl">
                                    {[5, 10, 20, 50].map(s => (
                                        <DropdownMenuItem key={s} onClick={() => handlePageSizeChange(s)} className="cursor-pointer text-[13px] font-medium py-2 text-center justify-center bg-white hover:bg-slate-50">{s} dòng</DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="text-[13px] text-slate-500 font-medium">
                            Hiển thị <span className="font-bold text-slate-900">{pagination.totalElements === 0 ? 0 : pagination.pageNumber * pagination.pageSize + 1}</span>
                            {' – '}
                            <span className="font-bold text-slate-900">{Math.min((pagination.pageNumber + 1) * pagination.pageSize, pagination.totalElements)}</span>
                            {' trong '}
                            <span className="font-bold text-blue-600">{pagination.totalElements}</span> kết quả
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.pageNumber - 1)} disabled={pagination.pageNumber === 0} className="gap-1 h-9 px-3 text-[13px] font-bold rounded-xl border-slate-200 bg-white">
                                <ChevronLeft className="h-3.5 w-3.5" /> Trước
                            </Button>
                            <div className="hidden sm:flex gap-1">
                                {[...Array(Math.min(5, pagination.totalPages))].map((_, idx) => {
                                    let p = idx;
                                    if (pagination.totalPages > 5) {
                                        if (pagination.pageNumber < 3) p = idx;
                                        else if (pagination.pageNumber > pagination.totalPages - 4) p = pagination.totalPages - 5 + idx;
                                        else p = pagination.pageNumber - 2 + idx;
                                    }
                                    return (
                                        <Button key={idx} variant={pagination.pageNumber === p ? "default" : "outline"} size="sm" onClick={() => handlePageChange(p)} className={`h-9 w-9 p-0 text-[13px] font-bold rounded-xl ${pagination.pageNumber === p ? "bg-blue-600 text-white shadow-md border-blue-600" : "border-slate-200 text-slate-600 hover:bg-slate-50 bg-white"}`}>
                                            {p + 1}
                                        </Button>
                                    );
                                })}
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.pageNumber + 1)} disabled={pagination.pageNumber >= pagination.totalPages - 1 || pagination.totalPages === 0} className="gap-1 h-9 px-3 text-[13px] font-bold rounded-xl border-slate-200 bg-white">
                                Sau <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}