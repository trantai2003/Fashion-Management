import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
    CheckCircle, XCircle, Clock, RefreshCw, Search, Package,
    User, Warehouse, FileText, AlertCircle, Loader2, ChevronDown, Eye,
} from 'lucide-react';
import applicationRequestService from '@/services/applicationRequestService'; // adjust path

/* ─── helpers ─────────────────────────────────────────────────────── */
const STATUS = {
    0: { label: 'Đã từ chối', color: 'bg-red-100 text-red-700 border-red-200', Icon: XCircle },
    1: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', Icon: Clock },
    2: { label: 'Đã duyệt', color: 'bg-green-100 text-green-700 border-green-200', Icon: CheckCircle },
};

const fmtDate = (iso) =>
    iso ? new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '—';

/* ─── Main component ───────────────────────────────────────────────── */
export default function ApplicationRequestManagement() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [searchDebounced, setSearchDebounced] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [notification, setNotification] = useState(null); // { type, msg }

    // Dialog: review confirmation
    const [reviewDialog, setReviewDialog] = useState(null); // { request, action: 'approve'|'reject' }
    const [reviewLoading, setReviewLoading] = useState(false);

    // Dialog: detail view
    const [detailDialog, setDetailDialog] = useState(null); // request object

    /* fetch */
    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await applicationRequestService.getAllRequests();
            setRequests(data);
        } catch (e) {
            notify('error', 'Không thể tải danh sách yêu cầu: ' + (e?.response?.data?.message || e.message));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setSearchDebounced(searchInput);
        }, 250);

        return () => clearTimeout(timeoutId);
    }, [searchInput]);

    /* notify */
    const notify = (type, msg) => {
        setNotification({ type, msg });
        setTimeout(() => setNotification(null), 5000);
    };

    /* review submit */
    const handleReviewConfirm = async () => {
        if (!reviewDialog) return;
        const { request, action } = reviewDialog;
        const status = action === 'approve' ? 2 : 0;
        setReviewLoading(true);
        try {
            await applicationRequestService.reviewRequest(request.nguoiDungId, status);
            notify('success', action === 'approve' ? 'Đã duyệt yêu cầu thành công.' : 'Đã từ chối yêu cầu.');
            setReviewDialog(null);
            load();
        } catch (e) {
            notify('error', e?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setReviewLoading(false);
        }
    };

    /* filtered list */
    const filtered = requests.filter((r) => {
        if (!r) return false;

        const matchStatus = filterStatus === 'all' || String(r.trangThai ?? '') === filterStatus;
        const keyword = searchDebounced.trim().toLowerCase();
        const matchSearch =
            !keyword ||
            String(r.nguoiDungId ?? '').includes(keyword) ||
            String(r.khoId ?? '').includes(keyword) ||
            String(r.ghiChu ?? '').toLowerCase().includes(keyword);

        return matchStatus && matchSearch;
    });

    /* stats */
    const stats = {
        total: requests.length,
        pending: requests.filter((r) => r.trangThai === 1).length,
        approved: requests.filter((r) => r.trangThai === 2).length,
        rejected: requests.filter((r) => r.trangThai === 0).length,
    };

    const statusOptions = [
        { value: 'all', label: 'Tất cả trạng thái' },
        { value: '1', label: 'Chờ duyệt' },
        { value: '2', label: 'Đã duyệt' },
        { value: '0', label: 'Đã từ chối' },
    ];

    const statusLabel = statusOptions.find((x) => x.value === filterStatus)?.label || 'Tất cả trạng thái';

    return (
        <div className="lux-sync px-6 !pt-0 pb-6 bg-gradient-to-br from-[#faf8f3] via-[#f5f0e4] to-[#ede9de] min-h-screen relative overflow-hidden">
            <div
                className="pointer-events-none fixed inset-0 z-0"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(184,134,11,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(184,134,11,0.06) 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                }}
            />
            <div className="pointer-events-none fixed -top-32 -right-24 w-[420px] h-[420px] rounded-full blur-3xl bg-[rgba(184,134,11,0.12)] z-0" />
            <div className="pointer-events-none fixed -bottom-32 -left-24 w-[360px] h-[360px] rounded-full blur-3xl bg-[rgba(200,150,30,0.10)] z-0" />

            <div className="max-w-7xl mx-auto !mt-0 space-y-5 relative z-10">

                {/* ── Notification ── */}
                {notification && (
                    <Alert className={notification.type === 'success'
                        ? 'border-green-200 bg-green-50/90'
                        : 'border-red-200 bg-red-50/90'}>
                        <AlertDescription className={notification.type === 'success'
                            ? 'text-green-800'
                            : 'text-red-800'}>
                            {notification.msg}
                        </AlertDescription>
                    </Alert>
                )}

                {/* ── Stat cards ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Tổng yêu cầu', value: stats.total, color: 'text-gray-900', bg: 'bg-gradient-to-br from-blue-50 to-white', iconWrap: 'bg-blue-100', iconColor: 'text-blue-600', Icon: FileText },
                        { label: 'Chờ duyệt', value: stats.pending, color: 'text-gray-900', bg: 'bg-gradient-to-br from-yellow-50 to-white', iconWrap: 'bg-yellow-100', iconColor: 'text-yellow-600', Icon: Clock },
                        { label: 'Đã duyệt', value: stats.approved, color: 'text-gray-900', bg: 'bg-gradient-to-br from-green-50 to-white', iconWrap: 'bg-green-100', iconColor: 'text-green-600', Icon: CheckCircle },
                        { label: 'Từ chối', value: stats.rejected, color: 'text-gray-900', bg: 'bg-gradient-to-br from-red-50 to-white', iconWrap: 'bg-red-100', iconColor: 'text-red-600', Icon: XCircle },
                    ].map((s) => (
                        <Card key={s.label} className={`border-0 shadow-md hover:shadow-lg transition-shadow duration-200 ${s.bg}`}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{s.label}</p>
                                        <p className={`text-2xl font-bold mt-1 ${s.color}`} style={{ fontFamily: "'Playfair Display', serif" }}>{s.value}</p>
                                    </div>
                                    <div className={`h-12 w-12 rounded-full ${s.iconWrap} flex items-center justify-center`}>
                                        <s.Icon className={`h-6 w-6 ${s.iconColor}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* ── Filters ── */}
                <Card className="border-0 shadow-lg bg-[#fffdf8]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[#3d3529]" style={{ fontFamily: "'Playfair Display', serif" }}>
                            <Search className="h-5 w-5 text-[#b8860b]" />
                            Bộ lọc tìm kiếm
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-gray-700 font-medium">Tìm kiếm</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Tìm theo ID người dùng, kho, ghi chú..."
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        className="pl-9 bg-[#fffdf8] border-[#b8860b]/20 focus:border-[#b8860b] focus:ring-[#b8860b]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Trạng thái</Label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-between bg-[#fffdf8] border-[#b8860b]/20 hover:bg-[#b8860b]/10 font-normal text-[#3d3529]"
                                        >
                                            <span className="truncate">{statusLabel}</span>
                                            <ChevronDown className="h-4 w-4 opacity-70 flex-shrink-0" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[220px] bg-white border border-gray-100 shadow-xl z-50">
                                        {statusOptions.map((opt) => (
                                            <DropdownMenuItem
                                                key={opt.value}
                                                onClick={() => setFilterStatus(opt.value)}
                                                className="flex items-center justify-between cursor-pointer hover:bg-[#b8860b]/10"
                                            >
                                                {opt.label}
                                                {filterStatus === opt.value && <CheckCircle className="h-4 w-4 text-[#b8860b]" />}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4">
                            <Button
                                onClick={() => {
                                    setSearchInput('');
                                    setSearchDebounced('');
                                    setFilterStatus('all');
                                }}
                                variant="outline"
                                className="bg-white text-gray-700 border-[#b8860b]/25 hover:bg-[#b8860b]/10"
                            >
                                Đặt lại
                            </Button>
                            <Button
                                onClick={load}
                                className="bg-[#b8860b] text-white hover:bg-[#9c7108]"
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Làm mới dữ liệu
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* ── Table ── */}
                <div className="mt-4 rounded-2xl bg-[#fffdf8] shadow-sm ring-1 ring-[#e6dcc9] overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-[#f8f3e8] border-b border-[#e6dcc9]">
                                <TableHead className="font-semibold text-[#7a6e5f] uppercase tracking-wide text-xs">Người dùng ID</TableHead>
                                <TableHead className="font-semibold text-[#7a6e5f] uppercase tracking-wide text-xs">Kho ID</TableHead>
                                <TableHead className="font-semibold text-[#7a6e5f] uppercase tracking-wide text-xs">Sản phẩm (biến thể)</TableHead>
                                <TableHead className="font-semibold text-[#7a6e5f] uppercase tracking-wide text-xs">Ghi chú</TableHead>
                                <TableHead className="font-semibold text-[#7a6e5f] uppercase tracking-wide text-xs">Thời gian gửi</TableHead>
                                <TableHead className="font-semibold text-[#7a6e5f] uppercase tracking-wide text-xs">Trạng thái</TableHead>
                                <TableHead className="font-semibold text-[#7a6e5f] uppercase tracking-wide text-xs text-center">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-16">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#b8860b] mb-2" />
                                        <p className="text-[#7a6e5f]">Đang tải dữ liệu...</p>
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-16">
                                        <FileText className="h-10 w-10 mx-auto text-[#c8bda8] mb-2" />
                                        <p className="text-[#7a6e5f] font-semibold">Không có yêu cầu nào</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((req, idx) => {
                                    const st = STATUS[req.trangThai] || STATUS[1];
                                    const StIcon = st.Icon;
                                    const isPending = req.trangThai === 1;
                                    return (
                                        <TableRow key={idx} className="hover:bg-[#fcf8ef] transition-colors border-b border-[#efe6d6]">
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-[#f5ecd7] flex items-center justify-center">
                                                        <User className="h-4 w-4 text-[#b8860b]" />
                                                    </div>
                                                    <span className="font-mono font-bold text-[#3d3529]">#{req.nguoiDungId}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <Warehouse className="h-4 w-4 text-[#b9aa8d]" />
                                                    <span className="font-semibold text-[#5f5344]">Kho #{req.khoId}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <Package className="h-4 w-4 text-[#b9aa8d] shrink-0" />
                                                    <span className="text-[#5f5344] font-semibold">
                                                        {req.bienTheSanPhamIds?.length ?? 0} biến thể
                                                    </span>
                                                    {req.bienTheSanPhamIds?.length > 0 && (
                                                        <button
                                                            onClick={() => setDetailDialog(req)}
                                                            className="ml-1 text-xs text-[#b8860b] hover:underline font-medium"
                                                        >
                                                            Xem
                                                        </button>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm text-[#6f6252] max-w-[180px] truncate" title={req.ghiChu}>
                                                    {req.ghiChu || <span className="italic text-[#b9aa8d]">Không có</span>}
                                                </p>
                                            </TableCell>
                                            <TableCell className="text-sm text-[#6f6252] whitespace-nowrap">
                                                {fmtDate(req.taoLuc)}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${st.color}`}>
                                                    <StIcon className="h-3.5 w-3.5" />
                                                    {st.label}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setDetailDialog(req)}
                                                        className="h-8 px-2 gap-1 text-[#6b5f4c] border-[#d7cab2] bg-[#fffdf8] hover:bg-[#f8f2e4]"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </Button>
                                                    {isPending && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => setReviewDialog({ request: req, action: 'approve' })}
                                                                className="h-8 px-3 gap-1 bg-green-600 hover:bg-green-700 text-white font-semibold shadow-sm"
                                                            >
                                                                <CheckCircle className="h-3.5 w-3.5" />
                                                                Duyệt
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => setReviewDialog({ request: req, action: 'reject' })}
                                                                className="h-8 px-3 gap-1 border-red-200 text-red-600 hover:bg-red-50 font-semibold"
                                                            >
                                                                <XCircle className="h-3.5 w-3.5" />
                                                                Từ chối
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* ── Review Confirmation Dialog ── */}
            <Dialog open={!!reviewDialog} onOpenChange={() => setReviewDialog(null)}>
                <DialogContent className="sm:max-w-md rounded-2xl overflow-hidden p-0 border border-[#e6dcc9] bg-[#fffdf8] shadow-2xl">
                    <div className={`p-6 flex items-center gap-3 ${reviewDialog?.action === 'approve' ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                        {reviewDialog?.action === 'approve'
                            ? <CheckCircle className="h-6 w-6 text-white" />
                            : <XCircle className="h-6 w-6 text-white" />
                        }
                        <DialogTitle className="text-white font-bold text-lg m-0">
                            {reviewDialog?.action === 'approve' ? 'Xác nhận Duyệt Yêu cầu' : 'Xác nhận Từ chối Yêu cầu'}
                        </DialogTitle>
                    </div>
                    <div className="p-6 bg-[#fffdf8]">
                        <DialogDescription className="text-[#6f6252] text-sm mb-4">
                            {reviewDialog?.action === 'approve'
                                ? 'Sau khi duyệt, nhân viên mua hàng có thể tạo đơn mua hàng với các biến thể trong yêu cầu này.'
                                : 'Yêu cầu sẽ bị từ chối. Nhân viên cần gửi lại yêu cầu mới nếu cần.'
                            }
                        </DialogDescription>

                        {reviewDialog && (
                            <div className="bg-[#faf5ea] border border-[#e6dcc9] rounded-xl p-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-[#7a6e5f] font-medium">Người dùng ID:</span>
                                    <span className="font-bold text-[#3d3529]">#{reviewDialog.request.nguoiDungId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#7a6e5f] font-medium">Kho:</span>
                                    <span className="font-bold text-[#3d3529]">#{reviewDialog.request.khoId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#7a6e5f] font-medium">Số biến thể:</span>
                                    <span className="font-bold text-[#3d3529]">{reviewDialog.request.bienTheSanPhamIds?.length ?? 0}</span>
                                </div>
                                {reviewDialog.request.ghiChu && (
                                    <div className="flex justify-between gap-4">
                                        <span className="text-[#7a6e5f] font-medium shrink-0">Ghi chú:</span>
                                        <span className="text-[#5f5344] text-right">{reviewDialog.request.ghiChu}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <DialogFooter className="mt-6 gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setReviewDialog(null)}
                                disabled={reviewLoading}
                                className="flex-1 rounded-xl border-[#d7cab2] text-[#6b5f4c] bg-[#fffdf8] hover:bg-[#f7f1e4]"
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={handleReviewConfirm}
                                disabled={reviewLoading}
                                className={`flex-1 rounded-xl font-semibold text-white shadow-md ${reviewDialog?.action === 'approve'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                    }`}
                            >
                                {reviewLoading ? (
                                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />Đang xử lý...</>
                                ) : reviewDialog?.action === 'approve' ? (
                                    <><CheckCircle className="h-4 w-4 mr-2" />Duyệt yêu cầu</>
                                ) : (
                                    <><XCircle className="h-4 w-4 mr-2" />Từ chối</>
                                )}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Detail Dialog ── */}
            <Dialog open={!!detailDialog} onOpenChange={() => setDetailDialog(null)}>
                <DialogContent className="sm:max-w-lg rounded-2xl border border-[#e6dcc9] bg-[#fffdf8]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-[#3d3529]">
                            <FileText className="h-5 w-5 text-[#b8860b]" />
                            Chi tiết Yêu cầu — Người dùng #{detailDialog?.nguoiDungId}
                        </DialogTitle>
                    </DialogHeader>
                    {detailDialog && (
                        <div className="space-y-4 mt-2">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="bg-[#faf5ea] rounded-xl p-3 border border-[#e6dcc9]">
                                    <p className="text-xs text-[#a6957d] font-semibold uppercase tracking-wide mb-1">Kho</p>
                                    <p className="font-bold text-[#3d3529]">#{detailDialog.khoId}</p>
                                </div>
                                <div className="bg-[#faf5ea] rounded-xl p-3 border border-[#e6dcc9]">
                                    <p className="text-xs text-[#a6957d] font-semibold uppercase tracking-wide mb-1">Trạng thái</p>
                                    {(() => {
                                        const st = STATUS[detailDialog.trangThai] || STATUS[1];
                                        const StIcon = st.Icon;
                                        return (
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${st.color}`}>
                                                <StIcon className="h-3 w-3" />{st.label}
                                            </span>
                                        );
                                    })()}
                                </div>
                                <div className="bg-[#faf5ea] rounded-xl p-3 border border-[#e6dcc9] col-span-2">
                                    <p className="text-xs text-[#a6957d] font-semibold uppercase tracking-wide mb-1">Thời gian gửi</p>
                                    <p className="font-semibold text-[#5f5344]">{fmtDate(detailDialog.taoLuc)}</p>
                                </div>
                                {detailDialog.ghiChu && (
                                    <div className="bg-[#faf5ea] rounded-xl p-3 border border-[#e6dcc9] col-span-2">
                                        <p className="text-xs text-[#a6957d] font-semibold uppercase tracking-wide mb-1">Ghi chú</p>
                                        <p className="text-[#5f5344]">{detailDialog.ghiChu}</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <p className="text-xs font-bold text-[#7a6e5f] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                    <Package className="h-3.5 w-3.5" />
                                    Danh sách Biến thể Sản phẩm ({detailDialog.bienTheSanPhamIds?.length ?? 0})
                                </p>
                                <div className="border border-[#e6dcc9] rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                                    {detailDialog.bienTheSanPhamIds?.length > 0 ? (
                                        detailDialog.bienTheSanPhamIds.map((id, i) => (
                                            <div
                                                key={id}
                                                className={`flex items-center justify-between px-4 py-2.5 text-sm ${i % 2 === 0 ? 'bg-[#fffdf8]' : 'bg-[#faf5ea]'
                                                    } border-b border-[#efe6d6] last:border-0`}
                                            >
                                                <span className="text-[#7a6e5f] font-medium">#{i + 1}</span>
                                                <span className="font-mono font-bold text-[#b8860b]">ID: {id}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-6 text-[#b9aa8d] text-sm">Không có biến thể</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setDetailDialog(null)} className="rounded-xl border-[#d7cab2] text-[#6b5f4c] bg-[#fffdf8] hover:bg-[#f7f1e4]">
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}